# Optimización de Performance — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir el Lighthouse Performance score de GrowAi-Web (baseline: 35/100, LCP 11.7s, TBT 2,210ms, payload 18,140 KiB) atacando las 4 causas identificadas en el spec, sin cambiar el diseño visual ni la funcionalidad.

**Architecture:** Cuatro cambios independientes sobre el repo `GrowAi-Web` (11ty + Nunjucks): build de Tailwind compilado reemplazando el CDN runtime, `defer` en scripts de terceros bloqueantes, lazy-load por IntersectionObserver del video `lupa.mp4`, y compresión del favicon sobredimensionado.

**Tech Stack:** 11ty (Eleventy) v2.0.1, Nunjucks, Tailwind CSS (nuevo, como devDependency compilada en build), Node/npm, ffmpeg (para redimensionar el favicon).

**Spec de referencia:** `docs/superpowers/specs/2026-07-18-optimizacion-performance-design.md`

---

## Task 1: Instalar y configurar Tailwind CSS como build compilado

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.js`
- Create: `src/_includes/styles/tailwind-source.css`

- [ ] **Step 1: Instalar Tailwind CSS como devDependency**

Run: `npm install -D tailwindcss@^3`
Expected: agrega `tailwindcss` a `devDependencies` en `package.json` y genera/actualiza `package-lock.json`.

- [ ] **Step 2: Crear `tailwind.config.js`**

Migrar la configuración de tema que hoy vive inline en `src/_includes/layouts/base.njk` (líneas 24-36, el bloque `<script>tailwind.config = {...}</script>`):

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.njk"],
  theme: {
    extend: {
      fontFamily: { inter: ['Inter', 'sans-serif'] },
      colors: {
        'bg-deep':    '#060e07',
        'bg-forest':  '#0d1f0f',
        'bg-purple':  '#1B0F2A',
        'green':      '#4CAF50',
        'green-soft': '#81c784',
        'purple':     '#8B6ED0',
        'text-main':  '#f0fdf4',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Crear el CSS fuente que Tailwind va a procesar**

Crear `src/_includes/styles/tailwind-source.css` con las directivas de Tailwind seguidas del CSS custom que hoy está en `src/_includes/partials/head-styles.njk` (308 líneas: reveal-on-scroll, desafio-card, eyebrow, partículas, navbar, mobile-drawer, chat typing indicator, stepper, timeline de funciones, etc. — copiar el archivo completo tal cual, sin modificar ninguna regla):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Contenido copiado literal de src/_includes/partials/head-styles.njk */
```

(El paso concreto: copiar el contenido íntegro de `src/_includes/partials/head-styles.njk` debajo de las 3 directivas `@tailwind`, sin alterar ninguna regla CSS.)

- [ ] **Step 4: Agregar script de build de Tailwind a `package.json`**

Modificar la sección `scripts` de `package.json`:

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/_includes/styles/tailwind-source.css -o ./src/css/site.css --minify",
    "build": "npm run build:css && eleventy",
    "serve": "npm run build:css && eleventy --serve"
  }
}
```

- [ ] **Step 5: Agregar passthrough/output del CSS generado**

`tailwindcss` va a escribir `src/css/site.css` — como esa carpeta está dentro de `src/` (el `input` de 11ty), Eleventy la copia automáticamente a `_site/css/site.css` siempre que no sea un template Nunjucks (un `.css` plano se copia tal cual sin passthrough explícito). Confirmar esto en el Step 6.

Agregar `src/css/` a `.gitignore` (el CSS compilado es un artefacto de build, igual que `_site/`):

```
_site/
src/css/
```

- [ ] **Step 6: Correr el build y verificar el output**

Run: `npm run build`
Expected: sin errores; `_site/css/site.css` existe y contiene clases de Tailwind purgadas (ej. `grep -c "\.flex{" _site/css/site.css` devuelve al menos 1) más las reglas custom (`grep -c "reveal-delay-1" _site/css/site.css` devuelve al menos 1). El tamaño del archivo debe ser bastante menor a cargar el compilador completo de Tailwind (verificar con `ls -la _site/css/site.css`, referencia: unos pocos cientos de KB sin minificar en runtime).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tailwind.config.js src/_includes/styles/tailwind-source.css .gitignore
git commit -m "build: agregar Tailwind CSS compilado como parte del build de 11ty"
```

(No se commitea `src/css/site.css` — es artefacto de build, generado en cada `npm run build`, igual que `_site/`.)

---

## Task 2: Reemplazar el Tailwind CDN en base.njk por el CSS compilado

**Files:**
- Modify: `src/_includes/layouts/base.njk`

**Contexto:** Task 1 generó `_site/css/site.css` a partir de `src/_includes/styles/tailwind-source.css`. Ahora hay que apuntar el HTML a ese archivo en vez de al CDN, y borrar la config inline que ya no hace falta (Tailwind ya la lee de `tailwind.config.js` en build time).

- [ ] **Step 1: Quitar el script del CDN y la config inline**

En `src/_includes/layouts/base.njk`, eliminar estas líneas (ubicadas después de `<script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>`):

```html
    <script src="https://cdn.tailwindcss.com"></script>
```

y todo el bloque:

```html
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: { inter: ['Inter', 'sans-serif'] },
            colors: {
              'bg-deep':    '#060e07',
              'bg-forest':  '#0d1f0f',
              'bg-purple':  '#1B0F2A',
              'green':      '#4CAF50',
              'green-soft': '#81c784',
              'purple':     '#8B6ED0',
              'text-main':  '#f0fdf4',
            },
          },
        },
      };
    </script>
```

- [ ] **Step 2: Agregar el link al CSS compilado**

En el mismo `<head>`, agregar (junto a los otros `<link rel="...">`, antes del `<style>{% include "partials/head-styles.njk" %}</style>` que se elimina en el siguiente step):

```html
    <link rel="stylesheet" href="/css/site.css" />
```

- [ ] **Step 3: Quitar el `<style>` inline que incluía head-styles.njk**

Eliminar el bloque:

```html
  <style>
    {% include "partials/head-styles.njk" %}
  </style>
```

(Ese CSS ya está compilado dentro de `site.css` desde Task 1 — dejarlo también inline duplicaría las reglas.)

**No borrar** el archivo `src/_includes/partials/head-styles.njk` en sí — queda como la fuente de verdad que se copió a `tailwind-source.css`; si en el futuro se necesita editar ese CSS custom, hay que decidir aparte si se edita ahí y se re-copia, o se migra la fuente directamente a `tailwind-source.css`. Fuera de alcance de esta task.

- [ ] **Step 4: Build y verificación visual**

Run: `npm run build`
Expected: build sin errores.

Levantar el sitio localmente (`npm run serve` o abrir `_site/index.html` en el navegador) y comparar visualmente contra la versión en producción (`https://www.growai.com.ar/`) — mismos colores, mismas animaciones de scroll-reveal, mismo navbar, mismo drawer mobile, mismo timeline de "funciones". Revisar especialmente las 4 páginas nuevas (`/reprocann/`, `/sensei-ia/`, `/mis-cultivos/`, `/planes/`) además del home.

- [ ] **Step 5: Commit**

```bash
git add src/_includes/layouts/base.njk
git commit -m "perf: reemplazar Tailwind CDN runtime por CSS compilado"
```

---

## Task 3: Diferir scripts bloqueantes de terceros

**Files:**
- Modify: `src/_includes/layouts/base.njk`
- Modify: `src/index.njk`

- [ ] **Step 1: Agregar `defer` a los scripts síncronos en base.njk**

En `src/_includes/layouts/base.njk`, cambiar:

```html
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
```

por:

```html
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" defer></script>
```

(El script de `@dotlottie/player-component` ya usa `type="module"`, que es deferred por especificación del navegador — no requiere cambio.)

- [ ] **Step 2: Agregar `defer` al script de Three.js en index.njk**

En `src/index.njk`, cambiar:

```html
  <script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
```

por:

```html
  <script src="https://unpkg.com/three@0.158.0/build/three.min.js" defer></script>
```

- [ ] **Step 3: Envolver el script inline que depende de `THREE`/EmailJS en `DOMContentLoaded`**

`defer` en un script externo no bloquea el parseo, pero se ejecuta antes de `DOMContentLoaded` en el orden en que aparece — como el script inline que usa `THREE` ya está físicamente después del `<script src="...three.min.js" defer>` en el HTML, y los scripts `defer` se ejecutan en orden relativo entre sí antes de `DOMContentLoaded`, **no hace falta** envolver nada adicional siempre que el script inline en sí también tenga `defer`, o esté ubicado después y sea sincrónico (ejecuta inmediatamente después de que el defer anterior corrió). Verificar en `src/index.njk` que el `<script>` inline que arranca con `const heroVideo = document.getElementById('hero-video');` (línea ~755) es un script clásico sin `defer` colocado *después* del script de Three.js en el HTML — en ese caso el orden de ejecución ya es correcto sin cambios adicionales. Si en la verificación del Step 4 aparece un error de `THREE is not defined` en consola, agregar `defer` también a ese script inline.

- [ ] **Step 4: Build y verificación funcional**

Run: `npm run build`, levantar el sitio localmente.

Verificar en el navegador (consola de DevTools abierta, sin errores):
- El efecto 3D del hero carga y anima correctamente.
- El chat animado de Sensei se reproduce.
- El scrub del video "cogollo" al hacer scroll funciona.
- El formulario de contacto (EmailJS) sigue pudiendo enviarse (probar un envío de prueba si es posible, o al menos confirmar que no tira error de `emailjs is not defined` en consola).
- El player de Lottie (si se usa en alguna sección) renderiza.

- [ ] **Step 5: Commit**

```bash
git add src/_includes/layouts/base.njk src/index.njk
git commit -m "perf: diferir carga de scripts de terceros (three.js, emailjs)"
```

---

## Task 4: Lazy-load de lupa.mp4 con IntersectionObserver

**Files:**
- Modify: `src/index.njk`
- Modify: `src/_includes/partials/scripts.njk`

- [ ] **Step 1: Quitar `autoplay` del video en `src/index.njk`**

Cambiar (línea ~70-73):

```html
      id="lupa-video"
      src="/lupa.mp4"
      muted playsinline preload="none" autoplay loop
      class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"></video>
```

por:

```html
      id="lupa-video"
      src="/lupa.mp4"
      muted playsinline preload="none" loop
      class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"></video>
```

(Se quita únicamente la palabra `autoplay`; el resto de atributos queda igual.)

- [ ] **Step 2: Agregar el IntersectionObserver en scripts.njk**

En `src/_includes/partials/scripts.njk`, agregar este bloque después del `revealObserver` existente (después de la línea `document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));`):

```html
    // ── Lazy-play de lupa-video al entrar en viewport ──
    const lupaVideo = document.getElementById('lupa-video');
    if (lupaVideo) {
      const lupaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lupaVideo.play();
            lupaObserver.unobserve(lupaVideo);
          }
        });
      }, { threshold: 0.1 });
      lupaObserver.observe(lupaVideo);
    }
```

(El `if (lupaVideo)` es necesario porque `scripts.njk` se incluye en todas las páginas vía `base.njk`, pero `#lupa-video` solo existe en el home.)

- [ ] **Step 3: Build y verificación funcional**

Run: `npm run build`, levantar el sitio localmente.

En el navegador con DevTools → Network abierto:
- Cargar el home y confirmar que `lupa.mp4` **no** aparece en la lista de requests de red hasta hacer scroll hasta esa sección.
- Al llegar a la sección de "lupa" (buscar visualmente la sección que contiene ese video de fondo), confirmar que el video empieza a reproducirse y hace loop normalmente.
- Confirmar que las otras 4 páginas (`/reprocann/`, `/sensei-ia/`, `/mis-cultivos/`, `/planes/`) no tiran error de JS en consola (por el `if (lupaVideo)` guard).

- [ ] **Step 4: Commit**

```bash
git add src/index.njk src/_includes/partials/scripts.njk
git commit -m "perf: lazy-load de lupa.mp4 con IntersectionObserver"
```

---

## Task 5: Comprimir favicon.png sobredimensionado

**Files:**
- Create: `icono/favicon-192.png`
- Create: `icono/favicon-32.png`
- Modify: `src/_includes/layouts/base.njk`

**Contexto:** `icono/favicon.png` es 1024x1024 y pesa 1.5MB. Se usa hoy en 4 lugares de `base.njk`: `rel="icon"`, `rel="apple-touch-icon"`, `og:image`, y (indirectamente) como logo en `footer.njk`/`navbar.njk` (esos NO se tocan en esta task — siguen usando `icono/favicon.png` en tamaño chico via CSS, lo cual está bien porque ahí ya se renderiza pequeño con `class="w-6 h-6"` y el navegador no descarga una versión distinta solo por el `<img>`, pero el archivo fuente sigue pesando 1.5MB en cada uno de esos usos también — ver Step 3).

- [ ] **Step 1: Generar versión de 192x192 (apple-touch-icon, og:image)**

Run: `ffmpeg -i icono/favicon.png -vf "scale=192:192" -compression_level 100 icono/favicon-192.png`
Expected: se crea `icono/favicon-192.png`, verificar con `ls -la icono/favicon-192.png` que pesa muy por debajo de 1.5MB (referencia: menos de 50KB para un PNG de 192x192).

- [ ] **Step 2: Generar versión de 32x32 (favicon del navegador)**

Run: `ffmpeg -i icono/favicon.png -vf "scale=32:32" -compression_level 100 icono/favicon-32.png`
Expected: se crea `icono/favicon-32.png`, pesa unos pocos KB.

- [ ] **Step 3: Actualizar referencias en `base.njk`**

Cambiar:

```html
  <link rel="icon" type="image/png" href="/icono/favicon.png" />
  <link rel="apple-touch-icon" href="/icono/favicon.png" />
```

por:

```html
  <link rel="icon" type="image/png" href="/icono/favicon-32.png" />
  <link rel="apple-touch-icon" href="/icono/favicon-192.png" />
```

Y cambiar:

```html
  <meta property="og:image" content="https://www.growai.com.ar/icono/favicon.png" />
```

por:

```html
  <meta property="og:image" content="https://www.growai.com.ar/icono/favicon-192.png" />
```

**No modificar** las referencias a `icono/favicon.png` en `src/_includes/partials/navbar.njk`, `footer.njk` ni `mobile-drawer.njk` — ahí se usa como logo visual dentro del layout (no como favicon/og:image), y queda fuera de alcance de esta task cambiar esos usos; se puede evaluar aparte si conviene apuntarlos también a `favicon-192.png` una vez confirmado que no se pierde nitidez visual.

- [ ] **Step 4: Build y verificación**

Run: `npm run build`

Verificar:
- `_site/icono/favicon-32.png` y `_site/icono/favicon-192.png` existen (el passthrough copy de `icono` ya cubre toda la carpeta, no hace falta tocar `.eleventy.js`).
- Abrir el sitio en el navegador y confirmar que el favicon en la pestaña se ve nítido.
- Inspeccionar el `<head>` del HTML generado y confirmar que las 3 referencias (`icon`, `apple-touch-icon`, `og:image`) apuntan a los archivos nuevos.
- Opcional: pegar la URL del home en un validador de Open Graph (ej. compartir el link en una app de mensajería) para confirmar que la preview sigue mostrando el logo correctamente.

- [ ] **Step 5: Commit**

```bash
git add icono/favicon-192.png icono/favicon-32.png src/_includes/layouts/base.njk
git commit -m "perf: comprimir favicon.png (1.5MB → versiones optimizadas de 32px/192px)"
```

---

## Task 6: Medir el resultado final

**Files:** ninguno (task de verificación, no de código)

- [ ] **Step 1: Deploy a preview de Vercel**

Con las 5 tasks anteriores commiteadas en un branch dedicado (ver nota de worktree más abajo), hacer `vercel --yes` desde la raíz del proyecto para generar un deploy de preview (no producción), igual que se hizo en el plan de SEO para Task 9.

- [ ] **Step 2: Correr Lighthouse sobre el preview**

Desde Chrome DevTools → Lighthouse, correr un análisis sobre la URL de preview generada.

- [ ] **Step 3: Comparar contra el baseline**

Confirmar mejora contra los números del spec (baseline: Performance 35, LCP 11.7s, TBT 2,210ms, Speed Index 6.0s, payload 18,140 KiB). No hay un número mínimo objetivo fijado — el criterio de éxito es una mejora clara y consistente en Performance score, LCP y TBT, sin regresión visual ni funcional. Documentar los números nuevos en el reporte final de esta task.

- [ ] **Step 4: Reportar resultado**

Sin commit — esta task es de medición. El resultado se reporta al usuario (no hay código que cambiar salvo que el Lighthouse post-cambios revele una regresión, en cuyo caso se vuelve a la task correspondiente a corregirla antes de dar por cerrado el plan).

---

## Nota sobre worktree

Seguir el mismo patrón que el plan de SEO: crear un worktree dedicado en `GrowAi-Web/.worktrees/perf-optimizacion` con branch `perf/optimizacion-lighthouse`, ya que `.worktrees/` ya está en `.gitignore` de este repo desde el plan anterior.

---

## Self-Review

**Cobertura del spec:**
- Componente 1 (Tailwind CDN → build compilado) → Tasks 1-2.
- Componente 2 (diferir scripts de terceros) → Task 3.
- Componente 3 (lazy-load de lupa.mp4) → Task 4.
- Componente 4 (optimizar favicon.png) → Task 5.
- Medición final contra baseline → Task 6.

**Fuera de alcance confirmado (no se agregaron tasks):** recompresión de `lupa.mp4`, reemplazo de Three.js, limpieza de `planta.png`, actualización de los logos en navbar/footer/drawer al favicon comprimido — todos ya señalados como fuera de alcance en el spec o explícitamente en las tasks correspondientes.
