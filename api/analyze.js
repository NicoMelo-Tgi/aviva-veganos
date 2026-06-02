// Aviva Veganos — backend proxy. The Anthropic API key lives ONLY here (env var),
// never in the front-end. The client sends an action; the server builds the prompt,
// calls Anthropic, parses the JSON and returns a clean result.

const MODEL = "claude-sonnet-4-20250514";

const RULES = `Reglas estrictas:
- VEGANO = sin ingredientes de origen animal. Flagueá si aparece: carmín / CI 75470 / ácido carmínico, lanolina, cera de abeja (cera alba / beeswax), miel (mel), propóleo, colágeno animal, keratina/keratin (salvo que aclare "vegetal"), elastina, escualeno/escualano de origen animal, goma laca / shellac, seda / sericina, glicerina de origen animal, ácido esteárico de origen animal, gelatina, manteca/grasa animal, leche/lactosa, ámbar gris.
- Si la marca DECLARA "apta vegana" o "libre de ingredientes de origen animal" pero la lista incluye un ingrediente típicamente animal sin aclarar el origen, marcá la CONTRADICCIÓN: verdict "undetermined", confidence "medium", y explicá el conflicto en reason.
- CRUELTY-FREE (no testeo en animales) es un claim DISTINTO de vegano. No los mezcles.
- CERTIFICACIONES: SOLO las que la marca/etiqueta declara explícitamente (The Vegan Society, Leaping Bunny, PETA, etc.). NO inventes.`;

const SCHEMA = `Respondé SOLO con un objeto JSON, sin markdown ni texto fuera del JSON:
{"name":"...","verdict":"vegan"|"not_vegan"|"undetermined","confidence":"high"|"medium"|"low","reason":"frase breve en español","flagged_ingredients":["..."],"cruelty_free":"claimed"|"not_claimed"|"unknown","certifications":["..."],"source_url":"..."}`;

function extractJson(text) {
  let t = (text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No se pudo leer la respuesta del análisis.");
  return JSON.parse(t.slice(s, e + 1));
}

async function callAnthropic(key, payload) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || ("API error " + r.status));
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

const WEB_TOOLS = [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en el servidor." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const action = body.action;

    // ---- DETECT: ¿producto único o catálogo? ----
    if (action === "detect") {
      const url = body.url;
      const prompt =
`Sos un analista de productos cosméticos. Usá web_search para visitar esta URL y entender qué es.
URL: ${url}
Determiná si es la página de UN solo producto o un catálogo/tienda con varios.
Respondé SOLO JSON sin markdown:
{"type":"single_product"|"catalog","brand":"nombre de la marca","products":[{"name":"...","url":"..."}]}
single_product: products = 1 item con la URL dada.
catalog: hasta 10 productos reales, con url si la encontrás (si no, "").`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 1500,
        messages: [{ role: "user", content: prompt }], tools: WEB_TOOLS,
      });
      return res.status(200).json(extractJson(txt));
    }

    // ---- ANALYZE WEB ----
    if (action === "analyze_web") {
      const p = body.product || {};
      const prompt =
`Analizá si este producto cosmético es VEGANO. Usá web_search para encontrar la lista de ingredientes (INCI) y los claims oficiales.
Producto: ${p.name || "(sin nombre)"} | URL: ${p.url || "(no disponible)"} | Marca: ${body.brand || "(desconocida)"} | Sitio: ${body.origin || ""}
${RULES}
- Si NO encontrás ingredientes publicados, verdict="undetermined", confidence="low", reason aclarando que la marca no publica composición.
${SCHEMA}
En source_url poné la URL donde encontraste el dato.`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 2000,
        messages: [{ role: "user", content: prompt }], tools: WEB_TOOLS,
      });
      return res.status(200).json(extractJson(txt));
    }

    // ---- ANALYZE PHOTO ----
    if (action === "analyze_photo") {
      const prompt =
`Te paso la foto de un producto cosmético (probablemente la etiqueta/dorso). Leé la lista de ingredientes (INCI) visible en la imagen y determiná si es VEGANO.
${RULES}
- Si la imagen no muestra ingredientes legibles, verdict="undetermined", confidence="low", y en reason aclará que no se ven ingredientes legibles.
- Reportá cruelty_free y certificaciones SOLO si hay logos o claims visibles en la imagen.
- En "name" poné el nombre del producto si se ve; si no, "Producto en la foto". source_url dejalo "".
${SCHEMA}`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 2000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: body.mime || "image/jpeg", data: body.b64 } },
          { type: "text", text: prompt },
        ]}],
      });
      return res.status(200).json(extractJson(txt));
    }

    return res.status(400).json({ error: "Acción desconocida." });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error interno." });
  }
}
