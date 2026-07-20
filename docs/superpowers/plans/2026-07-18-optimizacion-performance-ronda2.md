# Optimización de Performance — Ronda 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atacar las 4 causas identificadas en el reporte Lighthouse post-ronda-1 que impidieron que el Performance score mejorara: logo sin comprimir, videos hero/cogollo sin comprimir, doble carga de three.min.js, y carga eager del player dotlottie.

**Architecture:** Todos los cambios son sobre la rama existente `perf/optimizacion-lighthouse`, worktree `.worktrees/perf-optimizacion`. No se crean archivos nuevos salvo los videos re-encodeados (que reemplazan a los originales).

**Tech Stack:** Eleventy/Nunjucks, ffmpeg, IntersectionObserver (vanilla JS).

---

## Contexto para quien ejecute este plan

Ya existe un worktree en `.worktrees/perf-optimizacion` sobre la rama `perf/optimizacion-lighthouse` con 5 commits de la ronda 1 (Tailwind compilado, defer de scripts, lazy-load de lupa.mp4, favicons comprimidos). Ejecutar todos los comandos de este plan **dentro de ese worktree**, no en el repo raíz.

Spec de referencia: `docs/superpowers/specs/2026-07-18-optimizacion-performance-ronda2-design.md`.

No hay herramienta de browser en este entorno — la verificación de cada task es estructural (grep sobre HTML generado, tamaños de archivo, ausencia de referencias viejas). La verificación visual y el Lighthouse final los hace el usuario sobre el preview deploy.

---

### Task 1: Logo navbar/footer — usar favicon-192.png en vez de favicon.png

**Files:**
- Modify: `src/_includes/partials/navbar.njk:5`
- Modify: `src/_includes/partials/footer.njk:5`

- [ ] **Step 1: Cambiar el src en navbar.njk**

En `src/_includes/partials/navbar.njk:5`, cambiar:
```html
<img src="/icono/favicon.png" alt="Logo de GrowAI" class="w-8 h-8 rounded-lg object-cover" />
```
a:
```html
<img src="/icono/favicon-192.png" alt="Logo de GrowAI" class="w-8 h-8 rounded-lg object-cover" />
```

- [ ] **Step 2: Cambiar el src en footer.njk**

En `src/_includes/partials/footer.njk:5`, cambiar:
```html
<img src="/icono/favicon.png" alt="Logo de GrowAI" class="w-6 h-6 rounded-md object-cover" />
```
a:
```html
<img src="/icono/favicon-192.png" alt="Logo de GrowAI" class="w-6 h-6 rounded-md object-cover" />
```

- [ ] **Step 3: Rebuild y verificar**

Run: `npm run build`
Expected: build sin errores.

Run: `grep -c "favicon-192.png" _site/index.html`
Expected: al menos 2 (navbar + footer). Confirmar también que no quede ningún `<img` apuntando a `favicon.png` (a diferencia de los `<link rel="icon">`, que siguen usando `favicon-32.png`/`favicon-192.png` de la ronda 1 — no tocar esos).

Run: `grep -o 'src="/icono/favicon.png"' _site/index.html`
Expected: sin output (ninguna coincidencia).

- [ ] **Step 4: Commit**

```bash
git add src/_includes/partials/navbar.njk src/_includes/partials/footer.njk
git commit -m "perf: usar favicon-192.png comprimido en el logo del navbar y footer"
```

---

### Task 2: Comprimir hero.mp4 y cogollo-girando.mp4

**Files:**
- Modify (reemplazo binario): `videos/Hero.mp4`
- Modify (reemplazo binario): `videos/cogollo-girando.mp4`

Ambos videos son fondos silenciosos (`muted`, sin controles de audio en el HTML) pero tienen pista de audio AAC incluida (confirmado con `ffprobe`) — se descarta con `-an` ya que nunca se reproduce. Se mantiene resolución y fps originales (Hero.mp4: 2560x1440 @30fps; cogollo-girando.mp4: 1920x1080 @30fps), solo se ajusta el codec/CRF.

- [ ] **Step 1: Backup de los originales**

```bash
cp videos/Hero.mp4 /tmp/Hero-original.mp4
cp videos/cogollo-girando.mp4 /tmp/cogollo-girando-original.mp4
```

- [ ] **Step 2: Re-encodear Hero.mp4**

```bash
ffmpeg -i videos/Hero.mp4 -c:v libx264 -crf 23 -preset slow -an -movflags +faststart videos/Hero-new.mp4
```

Run: `ls -la videos/Hero.mp4 videos/Hero-new.mp4`
Expected: `Hero-new.mp4` significativamente más chico que el original (~3.9MB).

- [ ] **Step 3: Re-encodear cogollo-girando.mp4**

```bash
ffmpeg -i videos/cogollo-girando.mp4 -c:v libx264 -crf 23 -preset slow -an -movflags +faststart videos/cogollo-girando-new.mp4
```

Run: `ls -la videos/cogollo-girando.mp4 videos/cogollo-girando-new.mp4`
Expected: `cogollo-girando-new.mp4` significativamente más chico que el original (~5.2MB).

- [ ] **Step 4: Verificar que los nuevos archivos mantienen resolución y fps**

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of default=noprint_wrappers=1 -i videos/Hero-new.mp4
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of default=noprint_wrappers=1 -i videos/cogollo-girando-new.mp4
```
Expected: `width=2560 height=1440 r_frame_rate=30/1` para Hero-new.mp4, `width=1920 height=1080 r_frame_rate=30/1` para cogollo-girando-new.mp4.

- [ ] **Step 5: Reemplazar los originales**

```bash
mv videos/Hero-new.mp4 videos/Hero.mp4
mv videos/cogollo-girando-new.mp4 videos/cogollo-girando.mp4
```

- [ ] **Step 6: Rebuild y verificar tamaño final en _site**

Run: `npm run build`
Run: `ls -la _site/videos/Hero.mp4 _site/videos/cogollo-girando.mp4`
Expected: tamaños reducidos respecto a los originales (Hero.mp4 desde ~3.9MB, cogollo-girando.mp4 desde ~5.2MB).

- [ ] **Step 7: Nota para el usuario**

No hay forma de verificar calidad visual en este entorno. Dejar explícito en el reporte de la task que la verificación visual real (¿se nota pérdida de calidad en el hero y en el cogollo a pantalla completa?) la tiene que hacer el usuario sobre el preview deploy. Si no convence, los originales están en `/tmp/Hero-original.mp4` y `/tmp/cogollo-girando-original.mp4` para revertir.

- [ ] **Step 8: Commit**

```bash
git add videos/Hero.mp4 videos/cogollo-girando.mp4
git commit -m "perf: recomprimir hero.mp4 y cogollo-girando.mp4 (mismo fps/resolucion, sin audio)"
```

---

### Task 3: Gatear loadThreeAndInit() con IntersectionObserver

**Files:**
- Modify: `src/index.njk:1121-1123`

- [ ] **Step 1: Reemplazar la llamada incondicional**

En `src/index.njk`, dentro del IIFE de Three.js (líneas ~890-1123), reemplazar las líneas 1121-1123:
```js
      // Three.js ya está cargado sincrónicamente — init directo
      loadThreeAndInit();
    })();
```
por:
```js
      const molObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadThreeAndInit();
            molObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      molObserver.observe(container);
    })();
```

Esto usa la variable `container` (`document.getElementById('mol-canvas-container')`) ya definida al inicio del mismo IIFE (línea ~892) con el guard `if (!container || !canvas) return;`.

- [ ] **Step 2: Rebuild y verificar**

Run: `npm run build`
Run: `grep -o "molObserver" _site/index.html`
Expected: al menos 2 coincidencias (definición + `.observe`/`.unobserve`).

Run: `grep -o "loadThreeAndInit();" _site/index.html`
Expected: exactamente 1 coincidencia (la llamada dentro del callback del observer — ya no hay una llamada incondicional a nivel de módulo).

- [ ] **Step 3: Commit**

```bash
git add src/index.njk
git commit -m "perf: gatear inicializacion de Three.js con IntersectionObserver para evitar carga duplicada"
```

---

### Task 4: Lazy-load del script de dotlottie-player

**Files:**
- Modify: `src/_includes/layouts/base.njk:23`
- Modify: `src/_includes/partials/scripts.njk`

- [ ] **Step 1: Sacar el script eager del head**

En `src/_includes/layouts/base.njk`, eliminar la línea 23:
```html
  <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>
```

- [ ] **Step 2: Agregar el lazy-loader en scripts.njk**

En `src/_includes/partials/scripts.njk`, agregar al final del `<script>` existente (después del bloque de mobile drawer, antes del `</script>` de cierre):

```js

    // ── Lazy-load de dotlottie-player al entrar en viewport ──
    const lottiePlayers = document.querySelectorAll('dotlottie-player');
    if (lottiePlayers.length) {
      let dotlottieLoaded = false;
      function loadDotlottie() {
        if (dotlottieLoaded) return;
        dotlottieLoaded = true;
        const s = document.createElement('script');
        s.type = 'module';
        s.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
        document.head.appendChild(s);
      }
      const dotlottieObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadDotlottie();
            dotlottieObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      lottiePlayers.forEach(el => dotlottieObserver.observe(el));
    }
```

- [ ] **Step 3: Rebuild y verificar**

Run: `npm run build`

Run: `grep -c "dotlottie-player.mjs" _site/index.html`
Expected: 1 (solo dentro del JS inyectado dinámicamente, ya no como `<script>` estático en el head).

Run: `grep -o "<script src=\"https://unpkg.com/@dotlottie" _site/index.html`
Expected: sin output (no debe quedar como `<script>` estático).

Run: `grep -c "dotlottieObserver" _site/index.html`
Expected: al menos 1.

Repetir el chequeo del head en `_site/reprocann/index.html` (o la ruta de salida correspondiente a `reprocann.njk`) ya que también usa `<dotlottie-player>`.

- [ ] **Step 4: Commit**

```bash
git add src/_includes/layouts/base.njk src/_includes/partials/scripts.njk
git commit -m "perf: lazy-load del script de dotlottie-player via IntersectionObserver"
```

---

### Task 5: Deploy de preview y re-medición con Lighthouse

**Files:** ninguno (solo deploy y verificación externa)

- [ ] **Step 1: Deploy a Vercel**

Desde `.worktrees/perf-optimizacion`, con el proyecto Vercel temporal ya linkeado (`prj_TGXZcFtoN5TOZmS0BNLBe18bEIeo`, `perf-optimizacion`):

```bash
vercel --yes
```

Expected: URL de preview (la misma `https://perf-optimizacion.vercel.app` o una variante `-git-` si Vercel genera una nueva).

- [ ] **Step 2: Pedir al usuario que corra Lighthouse**

Pedir al usuario que corra Lighthouse sobre la URL de preview (no sobre producción) y comparta el reporte completo, igual que en la ronda 1.

- [ ] **Step 3: Comparar contra baseline y contra ronda 1**

Comparar Performance, LCP, TBT, Speed Index contra:
- Baseline original: Performance 35, LCP 11.7s, TBT 2.210ms, Speed Index 6.0s.
- Post-ronda-1: Performance 34, LCP 10.4s, TBT 3.380ms, Speed Index 7.6s.

No hay paso de "commit" en esta task — es solo medición y reporte al usuario.

---

## Fuera de scope (recordatorio)

- No se investiga por qué dotlottie cae en el fallback SVG — solo se retrasa su costo.
- No se cambia resolución ni fps de los videos, solo codec/bitrate/audio.
- No se toca `lupa.mp4`, `hero-video`/`cogollo-video` JS de reproducción, ni ningún otro componente fuera de los 4 puntos de la spec de ronda 2.
