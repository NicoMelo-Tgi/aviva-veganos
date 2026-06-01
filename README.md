# Aviva Veganos — deploy

Checker de productos veganos. Front estático + una función serverless que llama a la API de Anthropic.
La API key vive SOLO en el servidor (variable de entorno), nunca en el front.

## Estructura
```
aviva-veganos/
  index.html        ← front (UI)
  api/analyze.js     ← backend (proxy a Anthropic, guarda la key)
  package.json
```

## Deploy en Vercel (10 min)

1. Subí esta carpeta a un repo de GitHub (o usá `vercel` CLI desde la carpeta).
2. En Vercel: **New Project → Import** el repo. No hace falta configurar build (es zero-config).
3. **Settings → Environment Variables** → agregá:
   - `ANTHROPIC_API_KEY` = tu clave de Anthropic
4. **Deploy.** Te queda una URL tipo `https://aviva-veganos.vercel.app` para compartir y probar.

El front llama a `/api/analyze` en el mismo dominio, así que no hay que tocar nada más.

## Cómo se usa
- **Por foto:** subís/sacás foto de la etiqueta (dorso con ingredientes). Es el modo más confiable.
- **Por web:** pegás la URL de un producto o de una marca; detecta cuál es y analiza hasta 10 productos.

Cada producto devuelve: veredicto (vegano / no vegano / no determinable), confianza, ingredientes flageados, cruelty-free (separado de vegano), certificaciones declaradas y fuente.

## Seguridad — leer antes de difundir
- La key NUNCA está en el front. Mantenela también fuera del repo (solo como env var en Vercel).
- `/api/analyze` usa tu key: **cualquiera con la URL puede consumir tu cuota.** Para pruebas internas está OK.
  Antes de compartirlo abierto, agregá uno de estos: un header secreto compartido, login básico, o rate-limiting.
- Las fotos se reescalan a 1600px en el navegador antes de subir (más rápido y por debajo del límite de body de la función).

## Límites conocidos
- **Modo web:** depende de lo que la marca publique. Sin lista de ingredientes accesible → "No determinable" (no asume veganismo).
- **Catálogo:** best-effort, capeado en 10 productos por corrida.
- **Modelo:** `claude-sonnet-4-20250514`. Para cambiarlo, editá `MODEL` en `api/analyze.js`.

## Rollback
Es estático + 1 función. Para desactivar: pausá/eliminá el deploy en Vercel, o quitá la env var (el endpoint devuelve error controlado y el front lo muestra). No hay base de datos ni estado que migrar.
