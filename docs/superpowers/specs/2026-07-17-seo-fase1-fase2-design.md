# SEO Fase 1 + Fase 2: migración a 11ty, base técnica y páginas propias

## Contexto

`growai.com.ar` hoy es un `index.html` estático de una sola página, sin build ni framework (ver `CLAUDE.md`). Google indexa URLs, no anclas — funciones clave como Sensei, REPROCANN, Mis Cultivos y Planes no tienen URL propia y no pueden competir por sus búsquedas específicas.

Este spec cubre el primer entregable del plan general de SEO (documento completo compartido por el usuario, 7 fases): la base técnica (Fase 1) y la arquitectura de páginas propias (Fase 2). Quedan fuera de este spec, para specs futuros: on-page exhaustivo del resto del sitio (Fase 3 completa), blog (Fase 4), datos estructurados (Fase 5), E-E-A-T (Fase 6), medición continua (Fase 7).

## Decisión de stack

El plan original asumía Next.js (`app/sitemap.ts`). El repo es estático sin build y el `CLAUDE.md` prohíbe explícitamente agregar bundler sin necesidad real. Se descartó Next.js/Astro (sobre-ingeniería para este caso) y HTML a mano puro (no escala: duplicaría navbar/footer/scripts en 5 archivos, alto riesgo de inconsistencia). Se eligió **11ty (Eleventy) con Nunjucks**: genera HTML 100% estático, sin runtime de framework, con templates/layouts compartidos y sitemap.xml autogenerado.

## Alcance

### 1. Migración a 11ty

- `package.json` con `@11ty/eleventy` como devDependency, script `build` (`eleventy`) y `serve` (`eleventy --serve`).
- `.eleventy.js`: configura passthrough copy de `js/`, `videos/`, `icono/`, `lottie/`, `planta.png`; define `dir.input = "src"`, `dir.output = "_site"`.
- `_includes/layouts/base.njk`: `<head>` con `<title>`, `<meta description>`, `<link rel="canonical" href="https://growai.com.ar{{ page.url }}">` dinámicos por página vía frontmatter, carga de Tailwind CDN, Google Fonts, bloque `<style>` compartido (paleta de colores y overrides por sección tal como están hoy).
- `_includes/partials/navbar.njk`, `footer.njk`, `scripts.njk` (GSAP, EmailJS, scripts propios al final del body) — extraídos del `index.html` actual sin cambiar su comportamiento.
- `src/index.njk`: contenido actual del home migrado sección por sección, sin alterar el diseño ni el scroll horizontal GSAP ni la animación Verlet del hero. Se agrega un botón "Ver guía completa" en las secciones Sensei, REPROCANN y Planes, linkeando a su página nueva.
- `vercel.json` actualizado con `buildCommand: "npx @11ty/eleventy"` y `outputDirectory: "_site"`, conservando los headers de `videos/*.mp4` ya existentes.
- Verificación: el home debe verse y comportarse idéntico al `index.html` actual (mismo scroll, mismas animaciones, mismo formulario de contacto funcionando con EmailJS).

### 2. Páginas nuevas (Fase 2)

Cuatro páginas (`src/reprocann.njk`, `sensei-ia.njk`, `mis-cultivos.njk`, `planes.njk`), cada una usando `layouts/base.njk`, con:

| Página | H1 | Meta title | Meta description |
|---|---|---|---|
| `/sensei-ia` | Sensei IA — Diagnóstico de Cultivo con Inteligencia Artificial | Sensei IA - Diagnóstico de Plantas de Cannabis con IA \| GrowAI | A definir en implementación (≤160 caracteres, incluye keyword + CTA) |
| `/reprocann` | REPROCANN: Guía Completa del Trámite + Checklist con GrowAI | Cómo Tramitar REPROCANN Paso a Paso — Guía y Checklist \| GrowAI | ídem |
| `/mis-cultivos` | Mis Cultivos: Seguimiento y Registro de tus Plantas | Mis Cultivos - Registro y Seguimiento de Plantas \| GrowAI | ídem |
| `/planes` | Planes GrowAI: Básico y Pro | Planes y Precios GrowAI - Básico y Pro \| GrowAI | ídem |

Contenido de cada página (redactado en la implementación, tomando como base lo ya escrito en el `index.html` actual, sin inventar features):
- Explicación ampliada de la función (qué es, cómo funciona, ejemplos/casos de uso).
- Sección de FAQ (mínimo 3-4 preguntas por página).
- En `/sensei-ia`: disclaimer explícito de que es herramienta de apoyo y no reemplaza asesoramiento profesional.
- En `/reprocann`: disclaimer de que no reemplaza asesoramiento legal, más el checklist ya existente en la landing.
- En `/planes`: tabla comparativa Básico vs Pro ampliada respecto a la de la landing.
- CTA hacia el registro en la app al final de cada página.
- Jerarquía de headers: un solo H1 por página, H2/H3 ordenados debajo.
- Alt text descriptivo en todas las imágenes usadas (nuevas y las reutilizadas del home).

Navegación: el navbar deja de usar anclas para estos 4 ítems y apunta directo a las URLs nuevas (`/reprocann`, `/sensei-ia`, `/mis-cultivos`, `/planes`). El resto de anclas del home (`#inicio`, `#funciones`, `#descargar`, `#contacto`) se mantienen sin cambios.

### 3. SEO técnico adicional (Fase 1)

- `src/sitemap.njk` con frontmatter `permalink: sitemap.xml`, itera `collections.all` para listar las 5 URLs con `<lastmod>`.
- `src/robots.txt` (passthrough): `User-agent: *` / `Allow: /` / `Sitemap: https://growai.com.ar/sitemap.xml`.
- Compresión de video: recodificar `Hero.mp4`, `lupa.mp4`, `cogollo-girando.mp4` con ffmpeg (H.264, bitrate reducido manteniendo calidad visual aceptable, target: reducir tamaño de archivo sin banding/artifacts perceptibles). El hero mantiene `preload="metadata"`; los videos fuera del viewport inicial usan `preload="none"` y `loading="lazy"` si aplica al contenedor.
- Alta manual en Google Search Console y envío del sitemap: se documenta como checklist para el usuario (no es una tarea de código).

### 4. Noindex en otros subdominios

- **`growAi-app`** (Flutter, sirve `app.growai.com.ar` vía Firebase Hosting): agregar `<meta name="robots" content="noindex, nofollow">` en `web/index.html`, y `web/robots.txt` con `User-agent: *` / `Disallow: /`.
- **`growai-juego`** (estático, `growai-juego.vercel.app`): agregar el mismo meta noindex en `index.html` y un `robots.txt` con `Disallow: /`.

Estos dos son cambios acotados (2 archivos por repo), tratados como tareas independientes dentro del mismo plan de implementación pero sin dependencia técnica con la migración de `GrowAi-Web`.

## Fuera de alcance (specs futuros)

- Blog/guías (Fase 4).
- JSON-LD (`SoftwareApplication`, `Offer`, `FAQPage`) (Fase 5).
- Página "Sobre GrowAI"/equipo, testimonios, backlinks (Fase 6).
- Búsqueda y corrección continua de errores de indexación en Search Console (Fase 7, arranca una vez que el sitemap esté enviado).
- Auditoría de alt text/on-page fuera de las 4 páginas nuevas y el home (el resto del sitio no tiene más páginas hoy).

## Testing / verificación

- Build de 11ty corre sin errores (`npx @11ty/eleventy`).
- Comparación visual del home migrado contra el `index.html` actual (mismas secciones, animaciones, formulario funcionando).
- Cada página nueva carga correctamente, tiene un solo H1, title/description únicos, canonical correcto.
- `sitemap.xml` accesible en `/sitemap.xml` y lista las 5 URLs.
- `robots.txt` accesible en `/robots.txt`.
- Videos comprimidos se reproducen sin artifacts visibles perceptibles y con tamaño de archivo reducido.
- Deploy de prueba en Vercel (preview) antes de mergear a producción.
- `growAi-app` y `growai-juego`: verificar que `robots.txt` y meta noindex estén presentes en el HTML/hosting servido tras el deploy.
