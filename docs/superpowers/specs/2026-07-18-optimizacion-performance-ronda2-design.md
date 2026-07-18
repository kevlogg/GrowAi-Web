# Optimización de Performance — Ronda 2 (design)

## Contexto

La ronda 1 (`2026-07-18-optimizacion-performance-design.md`) implementó 5 cambios (Tailwind compilado, defer de scripts, lazy-load de lupa.mp4, favicons comprimidos, dotlottie ya con `type="module"`) sobre `perf/optimizacion-lighthouse`. Todos se verificaron correctos, pero el Lighthouse Performance score no mejoró (34 vs. baseline 35) y el TBT empeoró (3.380ms vs. 2.210ms). El reporte completo post-ronda-1 identificó cuatro causas que no estaban cubiertas por el scope original.

## Objetivo

Atacar las cuatro causas identificadas, sobre la misma rama `perf/optimizacion-lighthouse` (mismo worktree `.worktrees/perf-optimizacion`).

## Componentes

### 1. Logo navbar/footer

`navbar.njk` y el partial del mobile-drawer usan `<img src="/icono/favicon.png">` (1024x1024, 1.5MB) para un logo mostrado a 24-32px. Cambiar el `src` a `/icono/favicon-192.png` (ya generado en la ronda 1, 35KB). Sin cambios de JS.

### 2. Compresión de hero.mp4 y cogollo-girando.mp4

Ambos videos pesan varios MB sin comprimir y son candidatos al elemento LCP dominante.

- `hero-video` (`index.njk`): usa captura de frames vía `createImageBitmap()` a 15fps sobre el `<video>` en reproducción (líneas ~755-850) para simular ping-pong reverse. La captura lee el frame actual renderizado, no depende del fps del archivo — tolera cambio de codec/bitrate sin romper el efecto.
- `cogollo-video` (`index.njk`): reproduce/pausa por IntersectionObserver (líneas ~852-876), sin scroll-scrub real. Tolera cambio de codec/bitrate.

Re-encode conservador con ffmpeg manteniendo resolución y fps originales, ajustando CRF/preset (ej. `-crf 23 -preset slow` con H.264, o probar H.265/VP9 si el ahorro es significativamente mejor) para reducir peso sin pérdida visible de calidad. No se toca resolución ni fps.

### 3. Gating de three.min.js

`loadThreeAndInit()` (IIFE en `index.njk`, ~línea 1122) se llama incondicionalmente al cargar la página, compitiendo con el `<script defer>` de three.min.js y dañando su propio fallback (carga dinámica de un segundo `<script src="three.min.js">` si `THREE` no está definido aún) — esto produce una doble carga visible en el reporte de Lighthouse ("Reduce unused JavaScript" lista three.min.js dos veces).

Envolver la llamada en un IntersectionObserver sobre `#mol-canvas-container`, mismo patrón que `lupaObserver` en `scripts.njk`: solo se ejecuta `loadThreeAndInit()` cuando la sección de moléculas 3D entra en viewport.

### 4. Lazy-load de dotlottie-player

El script `dotlottie-player.mjs` se carga globalmente en `<head>` de `base.njk`, sin importar si algún `<dotlottie-player>` está en viewport. El reporte de la ronda 1 mostró un chunk interno (`lottie_svg-*.mjs`, fallback de renderizado SVG) consumiendo 5.635ms de CPU total / 4.016ms de Script Evaluation.

Hay 3 instancias: `index.njk` líneas 443 y 603, `reprocann.njk` línea 10 — todas animaciones pequeñas (w-24 a w-40), debajo del fold.

Sacar el `<script src=".../dotlottie-player.mjs" type="module">` del `<head>` de `base.njk`. Agregar en `scripts.njk` un IntersectionObserver compartido sobre todos los elementos `dotlottie-player` de la página: al primer elemento que entra en viewport, inyectar dinámicamente el `<script type="module">` una sola vez (con `document.createElement('script')`), y desconectar el observer. Esto no cambia la causa del fallback SVG, pero retrasa/evita su costo si el usuario no llega a esa sección.

## Fuera de scope

- Investigar por qué dotlottie cae en el fallback SVG en vez de Canvas/WebGL (posible tema de la animación `.lottie` en sí, no de cómo se carga el script).
- `hero-video`/`cogollo-video`: cualquier cambio de resolución, fps, o estrategia de poster/thumbnail — solo re-encode de codec/bitrate.
- Nuevas features o refactors no relacionados a performance.

## Verificación

Mismo enfoque que ronda 1: build local + grep estructural sobre `_site/index.html` (no hay browser tool en este entorno). Verificación visual real y Lighthouse los hace el usuario sobre el deploy preview.

## Riesgos conocidos

- Compresión de video: riesgo de pérdida de calidad perceptible si el CRF elegido es muy agresivo — mitigado por mantenerlo conservador y pedir confirmación visual al usuario antes de commitear si el ahorro es marginal.
- Gating de three.js y lazy-load de dotlottie: sin browser tool, no se puede verificar visualmente que las animaciones sigan inicializando correctamente — la verificación real queda a cargo del usuario sobre el preview deploy.
