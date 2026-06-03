// Aviva Veganos — backend proxy. The Anthropic API key lives ONLY here (env var),
// never in the front-end. The client sends an action; the server builds the prompt,
// calls Anthropic, parses the JSON and returns a clean result.

const MODEL = "claude-sonnet-4-20250514";

const RULES = `Reglas estrictas:
- VEGANO = sin ingredientes de origen animal. Flagueá si aparece: carmín / CI 75470 / ácido carmínico, lanolina, cera de abeja (cera alba / beeswax), miel (mel), propóleo, colágeno animal, keratina/keratin (salvo que aclare "vegetal"), elastina, escualeno/escualano de origen animal, goma laca / shellac, seda / sericina, glicerina de origen animal, ácido esteárico de origen animal, gelatina, manteca/grasa animal, leche/lactosa, ámbar gris.
- Si la marca DECLARA "apta vegana" o "libre de ingredientes de origen animal" pero la lista incluye un ingrediente típicamente animal sin aclarar el origen, marcá la CONTRADICCIÓN: verdict "undetermined", confidence "medium", y explicá el conflicto en reason.
- CRUELTY-FREE (no testeo en animales) es DISTINTO de vegano y es PRIORITARIO. No los mezcles: una marca puede ser cruelty-free sin ser vegana, y viceversa.
- Para cruelty-free, determiná si la MARCA está CERTIFICADA. Fuentes (consultá con web_search): Te Protejo (https://ongteprotejo.org/ar/marcas-cruelty-free), base de PETA (https://crueltyfree.peta.org y https://www.petalatino.com) y los sellos Te Protejo, Leaping Bunny, PETA, BDIH, NATRUE.
  · Si la marca figura en esas fuentes o tiene uno de esos sellos → cruelty_free="certified", agregá el sello a certifications y poné el link como source_url si lo tenés.
  · Si solo lo declara sin sello de tercero → "claimed". · Si hay indicios de que SÍ testea o pertenece a grupo que testea donde lo exige la ley → "not_claimed". · Sin info → "unknown".
- IMPORTANTE: el estado cruelty-free CAMBIA (compra de la marca por grupos grandes, ingreso a mercados que exigen testeo como China). NO afirmes "certified" de memoria: verificá el estado ACTUAL en una fuente. Ante duda reciente, usá "claimed" y aclaralo en reason.
- Marcas frecuentemente listadas como cruelty-free (úsalas como INDICIO, igual verificá estado actual): Kat Von D/KVD, Too Faced, Tarte, Anastasia Beverly Hills, Urban Decay, Marc Jacobs Beauty, Becca, IT Cosmetics, NYX, ColourPop, Makeup Geek, Jordana, e.l.f., Wet n Wild, Milani, Hard Candy, Cover FX, Sugar Pill, MUA, Ardell, Pixi, The Balm, BH Cosmetics, Lime Crime, OCC, Smashbox, Kylie Cosmetics, KKW Beauty, Stila, Fenty Beauty, Jeffree Star, Milk Makeup, The Body Shop, Lush, Makeup Revolution, ArtDeco, Flower Beauty, Annabelle, Femme Fatale, Le Métier de Beauté, Huda Beauty.
- CERTIFICACIÓN VEGANA: si el producto/marca tiene sello V-Label (verificá en https://www.v-label.com/arg) o figura en Unión Vegana (unionvegana.org), Veg Argentina (vegargentina.com) o Guía Vegana (guiavegana.ar), es una certificación vegana fuerte → agregala a certifications y úsala para subir la confianza del verdict vegano.
- Otras CERTIFICACIONES VEGANAS declaradas (The Vegan Society, etc.): inclúilas si están. NO inventes.
- En "brand" devolvé el nombre de la marca (no del producto).`;

const SCHEMA = `Respondé SOLO con un objeto JSON, sin markdown ni texto fuera del JSON:
{"name":"...","brand":"...","verdict":"vegan"|"not_vegan"|"undetermined","confidence":"high"|"medium"|"low","reason":"frase breve en español","ingredients":["lista INCI completa, un ítem por ingrediente"],"flagged_ingredients":["..."],"cruelty_free":"certified"|"claimed"|"not_claimed"|"unknown","certifications":["..."],"source_url":"..."}
En "ingredients" devolvé la lista INCI COMPLETA que hayas podido leer (array vacío si no la ves). Los valores de texto van en TEXTO PLANO: sin <cite>, sin HTML, sin markdown.`;

// Seed de marcas certificadas cruelty-free tomado de la lista de Te Protejo (ongteprotejo.org).
// PARCIAL — refrescar contra la lista oficial. Da un match instantáneo y confiable sin gastar búsquedas.
const TE_PROTEJO = {
  "avon": { cert: "Leaping Bunny", slug: "avon" },
  "axe": { cert: "PETA", slug: "axe" },
  "babyliss": { cert: "PETA", slug: "babyliss" },
  "burts bees": { cert: "Leaping Bunny / PETA", slug: "burts-bees" },
  "coco cavallaro": { cert: "Te Protejo", slug: "coco-cavallaro" },
  "dove": { cert: "PETA", slug: "dove" },
  "fragrance by sabrina": { cert: "PETA", slug: "fragrance-by-sabrina" },
  "garnier": { cert: "Leaping Bunny", slug: "garnier" },
  "hawaiian tropic": { cert: "PETA", slug: "hawaiian-tropic" },
  "herbal essences": { cert: "PETA", slug: "herbal-essence" },
  "issue": { cert: "Te Protejo", slug: "issue" },
  "issue professional": { cert: "Te Protejo", slug: "issue-professional" },
  "millefiori": { cert: "Te Protejo", slug: "millefiori" },
  "natura": { cert: "Leaping Bunny / PETA", slug: "natura" },
  "natura siberica": { cert: "BDIH", slug: "natura-siberica" },
  "naturaloe": { cert: "Te Protejo", slug: "naturaloe" },
};
function norm(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim(); }
// Cruza la marca detectada contra el seed de Te Protejo. Devuelve {cert, url} o null.
function teProtejoMatch(brand){
  const b = norm(brand);
  if(!b) return null;
  for(const key in TE_PROTEJO){
    if(b === key || b.startsWith(key+" ") || key.startsWith(b+" ") || (key.length>=4 && b.includes(key))){
      const v = TE_PROTEJO[key];
      return { cert: v.cert, url: `https://ongteprotejo.org/ar/marcas/${v.slug}/` };
    }
  }
  return null;
}
// Aplica el seed sobre el resultado del modelo (el seed manda: es dato de tercero).
function applyCrueltyFree(result){
  const m = teProtejoMatch(result && result.brand);
  if(m){
    result.cruelty_free = "certified";
    result.certifications = Array.isArray(result.certifications) ? result.certifications : [];
    const label = `${m.cert} (vía Te Protejo)`;
    if(!result.certifications.some(c => norm(c).includes(norm(m.cert)))) result.certifications.push(label);
    if(!result.source_url) result.source_url = m.url;
  }
  return result;
}

// ---- Lista de vigilancia de disruptores endócrinos ----
// Base: lista prioritaria de la UE (Reg. 1223/2009, 28 sustancias) + ftalatos ya prohibidos en cosmética UE.
// Es INFORMATIVA ("potencial" / "en evaluación"), NO un veredicto de toxicidad.
const SRC_UE = "Lista prioritaria UE de disruptores endócrinos (Reg. 1223/2009)";
const WATCH_DEFS = [
  [["butylparaben"], "estrogénico", "alta", "clasificado SVHC en REACH (UE)"],
  [["isobutylparaben","isopropylparaben"], "estrogénico", "alta", "prohibido en cosmética UE"],
  [["propylparaben"], "estrogénico", "media", "lista prioritaria UE"],
  [["methylparaben"], "estrogénico débil", "baja", "SCCS: seguro hasta 0,4%"],
  [["ethylparaben"], "estrogénico débil", "baja", ""],
  [["dibutyl phthalate","dbp"], "antiandrogénico / reprotóxico", "alta", "prohibido en cosmética UE (CMR)"],
  [["diethylhexyl phthalate","dehp"], "antiandrogénico / reprotóxico", "alta", "prohibido en cosmética UE (CMR)"],
  [["butyl benzyl phthalate","bbp"], "antiandrogénico", "alta", "prohibido en cosmética UE"],
  [["diethyl phthalate","dep"], "antiandrogénico (señalado)", "media", "permitido; suele ir dentro de Parfum"],
  [["benzophenone 3","oxybenzone"], "estrogénico", "media", "lista prioritaria UE; con límites de concentración"],
  [["benzophenone 1"], "estrogénico", "media", "lista prioritaria UE"],
  [["benzophenone 2"], "estrogénico / tiroideo", "media", "SCCS 2025: no pudo establecer seguridad"],
  [["benzophenone 4"], "estrogénico", "media", "lista prioritaria UE"],
  [["benzophenone 5"], "estrogénico", "baja", "SCCS 2025: seguro a cierta concentración"],
  [["benzophenone"], "estrogénico", "media", "lista prioritaria UE"],
  [["ethylhexyl methoxycinnamate","octinoxate","octyl methoxycinnamate"], "estrogénico / tiroideo", "media", "SCCS: seguro a cierta concentración"],
  [["homosalate"], "hormonal", "media", "SCCS limitó la concentración"],
  [["octocrylene"], "hormonal (señalado)", "media", "lista prioritaria UE"],
  [["4 methylbenzylidene camphor","enzacamene"], "estrogénico / tiroideo", "media", "lista prioritaria UE"],
  [["triclosan"], "tiroideo / estrogénico", "media", "restringido en UE"],
  [["triclocarban"], "hormonal", "media", "lista prioritaria UE"],
  [["butylated hydroxyanisole","bha"], "estrogénico (señalado)", "media", "lista prioritaria UE"],
  [["butylated hydroxytoluene","bht"], "hormonal (señalado)", "baja", "lista prioritaria UE"],
  [["resorcinol"], "tiroideo", "media", "lista prioritaria UE (tinturas)"],
  [["kojic acid"], "hormonal (señalado)", "baja", "lista prioritaria UE"],
  [["cyclotetrasiloxane","d4"], "reproductivo", "media", "restringido en UE (CMR/ED)"],
  [["cyclopentasiloxane","d5"], "en evaluación", "baja", "lista prioritaria UE"],
  [["cyclomethicone"], "en evaluación", "baja", "lista prioritaria UE"],
  [["genistein"], "estrogénico (fitoestrógeno)", "media", "lista prioritaria UE"],
  [["daidzein"], "estrogénico (fitoestrógeno)", "media", "lista prioritaria UE"],
  [["triphenyl phosphate","tphp"], "hormonal (señalado)", "media", "frecuente en esmaltes"],
  [["butylphenyl methylpropional","lilial","bmhca"], "reprotóxico", "alta", "prohibido en cosmética UE (2022)"],
  [["benzyl salicylate"], "señalado", "baja", "lista prioritaria UE"],
  [["salicylic acid"], "señalado por UE (muy común, baja preocupación a conc. cosméticas)", "baja", "lista prioritaria UE"],
];
const WATCH = {};
for (const [names, concern, evidence, note] of WATCH_DEFS) {
  for (const n of names) WATCH[norm(n)] = { concern, evidence, note, source: SRC_UE };
}
const EV_ORDER = { alta: 0, media: 1, baja: 2 };
function applyWatchList(result) {
  const ing = Array.isArray(result && result.ingredients) ? result.ingredients : [];
  const hits = [], seen = new Set();
  let fragrance = false;
  for (const raw of ing) {
    const n = norm(raw);
    if (!n) continue;
    if (/\b(parfum|fragrance|aroma)\b/.test(n)) fragrance = true;
    let def = WATCH[n];
    if (!def) { for (const key in WATCH) { if (key.length >= 4 && n.includes(key)) { def = WATCH[key]; break; } } }
    if (def && !seen.has(def.concern + n)) {
      seen.add(def.concern + n);
      hits.push({ name: stripCites(raw), concern: def.concern, evidence: def.evidence, note: def.note, source: def.source });
    }
  }
  hits.sort((a, b) => (EV_ORDER[a.evidence] ?? 9) - (EV_ORDER[b.evidence] ?? 9));
  result.watch_ingredients = hits;
  result.fragrance_flag = fragrance;
  return result;
}

function stripCites(s){
  return typeof s === "string"
    ? s.replace(/<\/?cite[^>]*>/gi, "").replace(/<[^>]+>/g, "").replace(/\s{2,}/g, " ").trim()
    : s;
}
function cleanResult(r){
  if(!r || typeof r !== "object") return r;
  ["name","brand","reason","source_url"].forEach(k => { if(r[k]) r[k] = stripCites(r[k]); });
  if(Array.isArray(r.flagged_ingredients)) r.flagged_ingredients = r.flagged_ingredients.map(stripCites);
  if(Array.isArray(r.certifications)) r.certifications = r.certifications.map(stripCites);
  if(Array.isArray(r.products)) r.products = r.products.map(p => p && typeof p === "object" ? { ...p, name: stripCites(p.name), url: stripCites(p.url) } : p);
  return r;
}

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

const WEB_TOOLS = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];

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
- Si la URL apunta a un PRODUCTO ESPECÍFICO (el path incluye el nombre de un producto, /product(s)/, /p/, o es una ficha individual como las de incidecoder/skinsort), es "single_product" — AUNQUE la página muestre otros productos de la marca alrededor.
- Solo es "catalog" si la URL es una página de listado / tienda / categoría sin un producto principal.
Respondé SOLO JSON sin markdown:
{"type":"single_product"|"catalog","brand":"nombre de la marca","products":[{"name":"...","url":"..."}]}
single_product: products = 1 item con la URL dada.
catalog: hasta 10 productos reales, con url si la encontrás (si no, "").`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 1500,
        messages: [{ role: "user", content: prompt }], tools: WEB_TOOLS,
      });
      return res.status(200).json(cleanResult(extractJson(txt)));
    }

    // ---- ANALYZE WEB ----
    if (action === "analyze_web") {
      const p = body.product || {};
      const prompt =
`Analizá si este producto cosmético es VEGANO. Usá web_search para encontrar la lista de ingredientes (INCI) y los claims oficiales.
Producto: ${p.name || "(sin nombre)"} | URL: ${p.url || "(no disponible)"} | Marca: ${body.brand || "(desconocida)"} | Sitio: ${body.origin || ""}
PRIORIDAD: leé el INCI publicado en la URL dada. Si la URL es de una base de ingredientes (incidecoder, skinsort, etc.), extraé el INCI de ahí directamente. Solo si esa página no lo trae, buscá en otra fuente.
${RULES}
- Si NO encontrás ingredientes publicados, verdict="undetermined", confidence="low", reason aclarando que la marca no publica composición.
${SCHEMA}
En source_url poné la URL donde encontraste el dato.`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 2600,
        messages: [{ role: "user", content: prompt }], tools: WEB_TOOLS,
      });
      return res.status(200).json(cleanResult(applyWatchList(applyCrueltyFree(extractJson(txt)))));
    }

    // ---- ANALYZE PHOTO ----
    if (action === "analyze_photo") {
      const prompt =
`Te paso la foto de un producto cosmético (probablemente la etiqueta/dorso). Leé la lista de ingredientes (INCI) visible en la imagen y determiná si es VEGANO.
${RULES}
- Si la imagen no muestra ingredientes legibles, verdict="undetermined", confidence="low", y en reason aclará que no se ven ingredientes legibles.
- Las certificaciones VEGANAS reportalas solo si hay logos/claims visibles en la imagen.
- Para CRUELTY-FREE sí podés usar web_search: identificá la marca en la etiqueta y verificá su certificación según las reglas de arriba (Te Protejo y los sellos que reconoce).
- En "name" poné el nombre del producto si se ve; si no, "Producto en la foto".
${SCHEMA}`;
      const txt = await callAnthropic(key, {
        model: MODEL, max_tokens: 2600,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: body.mime || "image/jpeg", data: body.b64 } },
          { type: "text", text: prompt },
        ]}],
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      });
      return res.status(200).json(cleanResult(applyWatchList(applyCrueltyFree(extractJson(txt)))));
    }

    return res.status(400).json({ error: "Acción desconocida." });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error interno." });
  }
}
