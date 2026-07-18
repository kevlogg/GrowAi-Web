# Optimización de Performance — Diseño

**Contexto:** tras cerrar el plan de SEO Fase 1/2 (migración a 11ty, páginas nuevas, sitemap/robots, noindex en apps hermanas), un análisis de Lighthouse sobre `https://www.growai.com.ar/` mostró:

- Performance: 35/100 (Accessibility 95, Best Practices 100, SEO 100)
- First Contentful Paint: 3.4s
- Largest Contentful Paint: 11.7s
- Total Blocking Time: 2,210ms
- Speed Index: 6.0s
- Cumulative Layout Shift: 0 (ok)
- Payload total: ~18,140 KiB
- Hallazgos: "Improve image delivery" (~1,488 KiB), "Render-blocking requests" (~1,340ms), "Reduce JavaScript execution time" (9.6s), "Minimize main-thread work" (16.9s)

Estos problemas son deuda técnica preexistente al plan de SEO — no fueron introducidos por él, pero afectan tanto la experiencia de usuario como el ranking (Core Web Vitals es señal de SEO).

**Goal:** reducir el tiempo de carga y bloqueo de main thread del home de GrowAi-Web, sin alterar el diseño visual ni la funcionalidad existente.

**Architecture:** cuatro cambios independientes, cada uno atacando una causa raíz identificada en el audit, aplicados sobre el mismo repo/branch (`GrowAi-Web`, 11ty + Nunjucks).

**Tech Stack:** 11ty (Eleventy), Nunjucks, Tailwind CSS (build compilado en vez de CDN runtime), Node/npm.

---

## Componente 1: Tailwind CDN → build compilado y purgado

**Problema:** `<script src="https://cdn.tailwindcss.com"></script>` en `src/_includes/layouts/base.njk` compila todas las clases de Tailwind en el navegador vía JS en cada carga de página. Esto es explícitamente desaconsejado por Tailwind para producción — es el principal responsable del Total Blocking Time (2.2s) y de gran parte del "Reduce JavaScript execution time".

**Solución:**
- Agregar `tailwindcss` (versión estable compatible con Node del proyecto) como devDependency.
- Crear `tailwind.config.js` en la raíz, migrando la config de tema (colores `bg-deep`, `bg-forest`, `bg-purple`, `green`, `green-soft`, `purple`, `text-main`, `fontFamily.inter`) que hoy vive inline en el `<script>tailwind.config = {...}</script>` de `base.njk:24-36`, apuntando el `content` a `src/**/*.njk`.
- Crear un archivo fuente `src/_includes/styles/tailwind.css` (o similar) con las directivas `@tailwind base; @tailwind components; @tailwind utilities;`, más los estilos actuales de `src/_includes/partials/head-styles.njk` (que hoy se inyectan como `<style>` inline vía `{% include %}`) integrados como CSS normal.
- Agregar un script de build (`npx tailwindcss -i ... -o dist/css/site.css --minify`) que corra antes o junto al build de 11ty (via `package.json` script `"build": "tailwindcss ... && eleventy"`), y pasar el CSS resultante por `addPassthroughCopy` o dejar que 11ty lo sirva desde `_site`.
- Reemplazar en `base.njk` el `<script src="cdn.tailwindcss.com">` y el `<script>tailwind.config = {...}</script>` por `<link rel="stylesheet" href="/css/site.css" />`.

**Resultado esperado:** elimina la compilación runtime, el CSS llega ya listo y purgado (mucho más liviano que cargar el compilador completo de Tailwind), sin cambios visuales.

## Componente 2: Diferir scripts de terceros bloqueantes

**Problema:** `three.js` (unpkg), `@dotlottie/player-component` y `@emailjs/browser` se cargan de forma síncrona, bloqueando el parseo/render inicial (contribuyen a "Render-blocking requests" ~1,340ms).

**Ubicaciones:**
- `src/_includes/layouts/base.njk`: `<script src=".../email.min.js">`, `<script src=".../dotlottie-player.mjs" type="module">`.
- `src/index.njk`: `<script src=".../three.min.js">` (justo antes del script inline del hero 3D).

**Solución:** agregar el atributo `defer` a los scripts clásicos (`email.min.js`, `three.min.js`), y confirmar que el script inline que usa `THREE` y las funciones de EmailJS espere a `DOMContentLoaded` si no lo hace ya (los `<script type="module">` como el de dotlottie ya son deferred por especificación, no requieren cambio). No se cambia de CDN ni de versión de librería.

**Resultado esperado:** el HTML y CSS iniciales se pintan sin esperar estos tres scripts, mejorando FCP/LCP. La funcionalidad (chat animado, video hero, dotlottie, formulario de contacto) se activa apenas los scripts terminan de cargar, igual que antes pero sin bloquear.

## Componente 3: Lazy-load de `lupa.mp4` por Intersection Observer

**Problema:** `lupa.mp4` (~12.3MB, no se pudo comprimir más sin perder calidad — excepción ya documentada de un plan anterior) tiene `autoplay` en `src/index.njk`, lo que fuerza su descarga completa apenas carga la página, sin importar el atributo `preload`.

**Solución:**
- En `src/index.njk`, en el `<video id="lupa-video">`: quitar `autoplay`, dejar `preload="none"`, mantener `muted playsinline loop`.
- En `src/_includes/partials/scripts.njk`, agregar un `IntersectionObserver` (mismo patrón que el `revealObserver` ya existente para las animaciones de scroll) que, cuando `#lupa-video` entra en el viewport, le setee `video.preload = "auto"` y llame a `video.play()`. Una vez disparado, `unobserve` (no hace falta repetir).

**Resultado esperado:** el archivo de 12MB no se descarga si el usuario nunca llega a esa sección de la página — reduce el payload real transferido en la mayoría de las visitas sin tocar el archivo de video en sí.

## Componente 4: Optimizar `icono/favicon.png`

**Problema:** `icono/favicon.png` pesa 1.5MB y se usa tal cual como favicon, apple-touch-icon (`base.njk:9-10`) y `og:image` (`base.njk:16`) — tamaños para los que debería pesar unos KB, no MB. Coincide con el hallazgo "Improve image delivery" (~1,488 KiB de ahorro estimado).

**Solución:** generar una versión redimensionada y comprimida del ícono (ej. 512x512 para apple-touch-icon/og:image, opcionalmente un 32x32 o 64x64 dedicado para `rel="icon"`), reemplazando las referencias en `base.njk`. El archivo original de alta resolución puede quedar en el repo fuera del passthrough copy si se necesita para otros usos (branding, redes), pero no se sirve al navegador en cada carga de página.

**Fuera de alcance:** `planta.png` (1.8MB) — está en el passthrough copy de `.eleventy.js` pero no se referencia en ninguna página (`grep` en `src/` no encuentra usos), por lo que no se descarga en ninguna visita real y no afecta la performance medida. Se deja fuera de este spec; limpieza de archivos no usados es una tarea separada si se decide hacerla.

## Testing

No hay suite de tests automatizada en este repo (sitio estático). Verificación manual por tarea:
- Build local (`npm run build`) sin errores tras cada cambio.
- Comparación visual del sitio en navegador antes/después de cada componente (mismo look & feel).
- Re-correr Lighthouse en local o sobre el preview deploy de Vercel al final, comparando contra el baseline de este documento (Performance 35, LCP 11.7s, TBT 2,210ms, payload 18,140 KiB).

## Fuera de alcance confirmado

- Reemplazo de Three.js por una alternativa más liviana (se evaluó, se descartó por ahora — se prioriza diferir en vez de reemplazar).
- Recompresión de `lupa.mp4` con mayor tolerancia de calidad (se prioriza lazy-load).
- Limpieza de `planta.png` no utilizado.
- Migración de arquitectura de front-end (bundler, frameworks) — no se pidió, y el approach elegido fue "máximo impacto sin reescritura completa".
