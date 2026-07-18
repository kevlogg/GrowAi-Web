# SEO Fase 1 + Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar `GrowAi-Web` de un `index.html` estático monolítico a un sitio 11ty con templates compartidos, agregar la base técnica de SEO (canonical, sitemap, robots, compresión de video), y publicar 4 páginas propias indexables (`/reprocann`, `/sensei-ia`, `/mis-cultivos`, `/planes`), más `noindex` en `app.growai.com.ar` y `growai-juego`.

**Architecture:** 11ty (Eleventy) con Nunjucks genera HTML 100% estático a partir de `src/`. Un layout base (`_includes/layouts/base.njk`) y tres partials (navbar, footer, scripts) evitan duplicar código entre el home y las 4 páginas nuevas. Los assets pesados (`js/`, `videos/`, `icono/`, `lottie/`, `planta.png`) quedan en su ubicación actual en el repo y se copian tal cual al output vía passthrough copy — no hay reprocesamiento de esos archivos por el build salvo la compresión manual de video (Task 10).

**Tech Stack:** `@11ty/eleventy` (Nunjucks), Node.js, Vercel (deploy estático), ffmpeg (compresión de video, herramienta externa).

Este plan no usa TDD tradicional (no hay lógica de aplicación con tests unitarios) — "verificación" en cada tarea significa correr el build y comparar el resultado visual/funcional contra el `index.html` actual, según especifica el spec.

---

## Task 1: Inicializar proyecto 11ty

**Files:**
- Create: `package.json`
- Create: `.eleventy.js`
- Create: `.gitignore` (modificar el existente si ya excluye `node_modules`)

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "growai-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^2.0.1"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

Run: `npm install`
Expected: crea `node_modules/` y `package-lock.json` sin errores.

- [ ] **Step 3: Verificar que `.gitignore` excluye `node_modules` y `_site`**

Leer `.gitignore` actual. Si no contiene esas líneas, agregar:

```
node_modules/
_site/
```

- [ ] **Step 4: Crear `.eleventy.js`**

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("videos");
  eleventyConfig.addPassthroughCopy("icono");
  eleventyConfig.addPassthroughCopy("lottie");
  eleventyConfig.addPassthroughCopy("planta.png");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
```

- [ ] **Step 5: Crear carpeta `src/` con un archivo mínimo para probar el build**

Create: `src/index.njk`

```njk
<!DOCTYPE html>
<html><body><h1>placeholder</h1></body></html>
```

- [ ] **Step 6: Correr el build y verificar que funciona**

Run: `npx @11ty/eleventy`
Expected: log "Wrote 1 file" y existe `_site/index.html` con el contenido placeholder.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .eleventy.js .gitignore src/index.njk
git commit -m "build: inicializar proyecto 11ty"
```

---

## Task 2: Layout base y partials compartidos

**Files:**
- Create: `src/_includes/layouts/base.njk`
- Create: `src/_includes/partials/navbar.njk`
- Create: `src/_includes/partials/footer.njk`
- Create: `src/_includes/partials/mobile-drawer.njk`
- Create: `src/_includes/partials/head-styles.njk`
- Create: `src/_includes/partials/scripts.njk`
- Reference (solo lectura, no se modifica en esta tarea): `index.html`

- [ ] **Step 1: Crear `head-styles.njk` con el bloque `<style>` actual**

Copiar textualmente las líneas 41 a 349 de `index.html` (todo el contenido entre `<style>` y `</style>`, sin las etiquetas) a `src/_includes/partials/head-styles.njk`. Es el sistema de colores/overrides por sección — no cambia contenido, solo se traslada.

- [ ] **Step 2: Crear `navbar.njk`**

```njk
<!-- ═══════════════════════════════ NAVBAR ═══════════════════════════════ -->
<nav id="navbar">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2.5 shrink-0">
      <img src="/icono/favicon.png" alt="Logo de GrowAI" class="w-8 h-8 rounded-lg object-cover" />
      <span class="font-black text-lg tracking-tight text-text-main">GrowAI</span>
    </a>
    <div class="hidden md:flex items-center gap-7">
      <a href="/#funciones"    class="text-sm text-text-main/50 hover:text-text-main transition">Funciones</a>
      <a href="/mis-cultivos/" class="text-sm text-text-main/50 hover:text-text-main transition">Mis Cultivos</a>
      <a href="/sensei-ia/"    class="text-sm text-text-main/50 hover:text-text-main transition">Sensei</a>
      <a href="/reprocann/"    class="text-sm text-text-main/50 hover:text-text-main transition">REPROCANN</a>
      <a href="/planes/"       class="text-sm text-text-main/50 hover:text-text-main transition">Planes</a>
      <a href="https://growai-juego.vercel.app" target="_blank" rel="noopener noreferrer" class="text-sm text-text-main/50 hover:text-text-main transition">Barrio 3D</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
         class="hidden md:inline-flex items-center gap-1.5 bg-green text-bg-deep text-sm font-bold px-5 py-2 rounded-full hover:bg-green-soft transition">
        Abrir app
      </a>
      <button id="menu-btn" class="md:hidden flex flex-col gap-1.5 p-2 rounded-lg" aria-label="Abrir menú">
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
      </button>
    </div>
  </div>
</nav>
```

Nota: `href="#hero"` del logo pasa a `href="/"` y los links de Sensei/REPROCANN/Planes pasan de anclas a URLs propias, según lo definido en el spec. Se agrega el ítem "Mis Cultivos" que antes no estaba en el navbar (solo accesible vía `#funciones`). Los `src`/`href` de assets pasan a rutas absolutas (`/icono/...`) porque estas páginas viven en subcarpetas (`/reprocann/index.html`), no en la raíz.

- [ ] **Step 3: Crear `footer.njk`**

```njk
<!-- ════════════════════════ FOOTER ═════════════════════════════════════ -->
<footer class="py-10 border-t" style="border-color:rgba(76,175,80,0.08);">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <img src="/icono/favicon.png" alt="Logo de GrowAI" class="w-6 h-6 rounded-md object-cover" />
      <span class="font-black text-text-main/70 text-sm">GrowAI</span>
    </div>
    <div class="flex gap-6">
      <a href="/#funciones" class="text-xs text-text-main/30 hover:text-text-main/60 transition">Funciones</a>
      <a href="/planes/"    class="text-xs text-text-main/30 hover:text-text-main/60 transition">Planes</a>
      <a href="/#contacto"  class="text-xs text-text-main/30 hover:text-text-main/60 transition">Contacto</a>
    </div>
    <p class="text-xs text-text-main/20">© 2026 GrowAI · Argentina</p>
  </div>
</footer>
```

- [ ] **Step 4: Crear `mobile-drawer.njk`**

```njk
<!-- ══════════════════════ MOBILE DRAWER ═════════════════════════════════ -->
<div id="mobile-drawer">
  <div id="drawer-overlay"></div>
  <div id="drawer-panel">
    <div class="flex justify-between items-center mb-8">
      <span class="font-black text-text-main">GrowAI</span>
      <button id="drawer-close" class="text-text-main/50 hover:text-text-main transition text-xl">✕</button>
    </div>
    <nav class="flex flex-col gap-1">
      <a href="/#funciones"    class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Funciones</a>
      <a href="/mis-cultivos/" class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Mis Cultivos</a>
      <a href="/sensei-ia/"    class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Sensei</a>
      <a href="/reprocann/"    class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">REPROCANN</a>
      <a href="/planes/"       class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Planes</a>
      <a href="https://growai-juego.vercel.app" target="_blank" rel="noopener noreferrer" class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Barrio 3D</a>
    </nav>
    <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
       class="mt-auto inline-flex justify-center bg-green text-bg-deep font-bold py-3 rounded-full text-sm">
      Abrir GrowAI →
    </a>
  </div>
</div>
```

- [ ] **Step 5: Crear `scripts.njk` con el JS compartido (reveal, navbar scroll, drawer)**

Copiar textualmente las líneas 1096 a 1114 de `index.html` (bloque `Reveal on scroll`, `Navbar scroll`, `Mobile drawer` — desde `const revealObserver` hasta el cierre de los listeners de `menuBtn`/`closeBtn`/`overlay`, antes de la lógica específica del home como el hero video o el chat de Sensei) a `src/_includes/partials/scripts.njk`, envuelto en:

```njk
<script>
  // ── Reveal on scroll (IntersectionObserver) ──
  {# ... contenido copiado de index.html líneas 1096-1114 ... #}
</script>
```

Este partial se incluye en TODAS las páginas (home y las 4 nuevas) porque el navbar, el drawer y las animaciones `.reveal` se usan en todas. La lógica específica del home (hero video ping-pong, chat de Sensei simulado, Three.js de moléculas, GSAP ScrollTrigger de Funciones, EmailJS) NO va acá — se trata en la Task 3, dentro de `index.njk`, ya que solo aplica al home.

- [ ] **Step 6: Crear `layouts/base.njk`**

```njk
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ title }}</title>
  <meta name="description" content="{{ description }}" />
  <link rel="canonical" href="https://growai.com.ar{{ page.url }}" />
  <link rel="icon" type="image/png" href="/icono/favicon.png" />
  <link rel="apple-touch-icon" href="/icono/favicon.png" />
  <meta name="theme-color" content="#060e07" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{{ title }}" />
  <meta property="og:description" content="{{ description }}" />
  <meta property="og:url" content="https://growai.com.ar{{ page.url }}" />
  <meta property="og:image" content="https://growai.com.ar/icono/favicon.png" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script>
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
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    {% include "partials/head-styles.njk" %}
  </style>
</head>
<body>
  {% include "partials/navbar.njk" %}
  {{ content | safe }}
  {% include "partials/footer.njk" %}
  {% include "partials/mobile-drawer.njk" %}
  {% include "partials/scripts.njk" %}
  {% block extra_scripts %}{% endblock %}
</body>
</html>
```

Nota: `head-styles.njk` ya contiene el contenido interno del `<style>` (sin las etiquetas `<style>`/`</style>`, esas quedan en el layout), por eso el `{% include %}` va dentro del bloque `<style>` del layout.

- [ ] **Step 7: Commit**

```bash
git add src/_includes
git commit -m "feat: layout base y partials compartidos (navbar, footer, drawer, scripts)"
```

---

## Task 3: Migrar el home a `index.njk`

**Files:**
- Create: `src/index.njk`
- Reference (solo lectura): `index.html`

- [ ] **Step 1: Crear el frontmatter de `src/index.njk`**

```njk
---
layout: layouts/base.njk
title: "GrowAI | Tu Asistente de Cultivo Inteligente"
description: "GrowAI es la plataforma inteligente para el cultivo de cannabis. Sensei, tu asistente IA, te guía en cada etapa. Mis Cultivos, REPROCANN y más."
permalink: /
---
```

- [ ] **Step 2: Copiar el contenido del `<body>` del home**

Copiar textualmente las secciones de `index.html` entre las líneas 382 (`<section id="hero"`) y 1052 (cierre de `<section id="contacto">`) a continuación del frontmatter en `src/index.njk`. Esto incluye, en orden: Hero (382-439), El Problema (442-480), Cogollo autoplay (481-506), Moléculas (508-557), Funciones timeline (559-641), Mis Cultivos (643-733), Sensei (735-805), REPROCANN (807-861), Planes (863-954), CTA final (956-981), Contacto (983-1052).

No copiar `<nav id="navbar">`, `<footer>` ni `<div id="mobile-drawer">` — esos ya están en el layout (Task 2) y se duplicarían.

Todos los `src="videos/..."`, `src="icono/..."`, `src="lottie/..."` dentro de estas secciones pasan a rutas absolutas (`/videos/...`, `/icono/...`, `/lottie/...`).

- [ ] **Step 3: Agregar botones "Ver guía completa" en 3 secciones**

En la sección Mis Cultivos (dentro del `<div class="reveal">` que contiene el botón "Empezar a registrar →", línea ~680-685 del original), agregar un segundo link justo debajo:

```njk
<a href="/mis-cultivos/" class="inline-flex items-center gap-2 text-sm text-text-main/50 hover:text-text-main transition mt-3">
  Ver guía completa →
</a>
```

En la sección Sensei (junto al botón "Probar Sensei →", línea ~795-801 del original):

```njk
<a href="/sensei-ia/" class="inline-flex items-center gap-2 text-sm text-text-main/50 hover:text-text-main transition mt-3">
  Ver guía completa →
</a>
```

En la sección REPROCANN (junto al botón "Gestionar mi REPROCANN →", línea ~854-859 del original):

```njk
<a href="/reprocann/" class="inline-flex items-center gap-2 text-sm text-text-main/50 hover:text-text-main transition mt-3">
  Ver guía completa →
</a>
```

En la sección Planes, debajo del grid de planes (después de línea ~928, antes de "Todos los planes incluyen"):

```njk
<div class="text-center mb-8">
  <a href="/planes/" class="text-sm text-text-main/50 hover:text-text-main transition">
    Ver comparativa completa de planes →
  </a>
</div>
```

- [ ] **Step 4: Copiar el JS específico del home a un bloque `extra_scripts`**

Copiar textualmente las líneas 1092-1095 (carga de Three.js) y 1115 hasta el final del script (antes de `</script></body></html>`, excluyendo las líneas 1096-1114 ya movidas a `scripts.njk` en la Task 2) a `src/index.njk`, envuelto en:

```njk
{% block extra_scripts %}
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script>
  {# ... resto del JS específico del home: hero video ping-pong, moléculas Three.js,
       GSAP ScrollTrigger de Funciones, chat simulado de Sensei, EmailJS del formulario
       de contacto ... #}
</script>
{% endblock %}
```

Esto agrega GSAP como dependencia nueva: agregar antes de este bloque, o en el layout si se prefiere cargarlo solo en el home:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

Verificar en `index.html` si estos `<script>` de GSAP ya estaban cargados en el `<head>` o junto al script final — si están en el `<head>` actual (revisar líneas 17-22, no aparecieron en el grep de Task 0, así que probablemente se cargan más abajo junto al script final) y moverlos junto al bloque `extra_scripts` si es así.

- [ ] **Step 5: Build y comparación visual**

Run: `npx @11ty/eleventy`
Expected: `_site/index.html` generado sin errores.

Run: `npx @11ty/eleventy --serve` y abrir `http://localhost:8080` en el navegador junto con el `index.html` original abierto localmente.

Verificar manualmente: mismo hero con video y animación Verlet, scroll horizontal de Funciones funcionando (GSAP pin), chat de Sensei simulado corriendo, formulario de contacto enviando (usar un envío de prueba real con EmailJS), toggle del mobile drawer, los 3 nuevos links "Ver guía completa" visibles (aunque las páginas destino todavía no existen — se crean en Tasks 4-7).

- [ ] **Step 6: Commit**

```bash
git add src/index.njk
git commit -m "feat: migrar home a 11ty (index.njk)"
```

---

## Task 4: Página `/reprocann`

**Files:**
- Create: `src/reprocann.njk`

- [ ] **Step 1: Crear la página completa**

```njk
---
layout: layouts/base.njk
title: "Cómo Tramitar REPROCANN Paso a Paso — Guía y Checklist | GrowAI"
description: "Guía completa para tramitar tu REPROCANN en Argentina: requisitos, pasos y checklist. GrowAI te acompaña en todo el proceso desde la app."
permalink: /reprocann/
---
<section class="py-24 bg-section-b">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center mb-12">
      <dotlottie-player src="/lottie/bud-leaf-1.lottie" background="transparent" speed="1" loop autoplay
        class="mx-auto w-24 h-24 sm:w-28 sm:h-28"></dotlottie-player>
      <span class="eyebrow mb-4">REPROCANN</span>
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-text-main mt-4">
        Cómo tramitar tu REPROCANN paso a paso
      </h1>
      <p class="text-text-main/50 text-base mt-4 max-w-md mx-auto leading-relaxed">
        El Registro del Programa de Cannabis (REPROCANN) habilita el autocultivo, la producción solidaria y el uso medicinal, terapéutico y/o paliativo del cuidado del cannabis en Argentina. GrowAI te guía paso a paso en todo el proceso.
      </p>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Qué es REPROCANN</h2>
    <p class="text-text-main/60 text-base leading-relaxed mb-10">
      REPROCANN es el registro nacional que permite inscribirse como autocultivador, integrante de una organización de cultivo solidario o paciente/usuario de cannabis con fines medicinales, terapéuticos o paliativos del cuidado. La inscripción es gratuita y se realiza de forma online ante el Ministerio de Salud de la Nación.
    </p>

    <h2 class="text-2xl font-bold text-text-main mb-6">Los 3 pasos con GrowAI</h2>
    <div class="flex flex-col gap-0 max-w-xl mx-auto mb-12">
      <div class="flex gap-5 items-start">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-bg-deep bg-green shadow-[0_0_16px_rgba(76,175,80,0.35)]">1</div>
          <div class="step-line h-14 mt-1"></div>
        </div>
        <div class="pt-1.5 pb-10">
          <h3 class="font-bold text-text-main mb-1">Creá tu cuenta en GrowAI</h3>
          <p class="text-sm text-text-main/45 leading-relaxed">Desde la app web, en menos de un minuto. Solo necesitás email.</p>
        </div>
      </div>
      <div class="flex gap-5 items-start">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-text-main"
               style="background:rgba(76,175,80,0.15);border:1px solid rgba(76,175,80,0.35);">2</div>
          <div class="step-line h-14 mt-1" style="background:linear-gradient(to bottom,rgba(76,175,80,0.35),rgba(76,175,80,0.1));"></div>
        </div>
        <div class="pt-1.5 pb-10">
          <h3 class="font-bold text-text-main mb-1">Completá tu perfil REPROCANN</h3>
          <p class="text-sm text-text-main/45 leading-relaxed">Datos personales y tipo de uso. La app te va guiando campo por campo, sin sorpresas.</p>
        </div>
      </div>
      <div class="flex gap-5 items-start">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-text-main"
               style="background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.2);">3</div>
        </div>
        <div class="pt-1.5">
          <h3 class="font-bold text-text-main mb-1">Enviá y hacé seguimiento</h3>
          <p class="text-sm text-text-main/45 leading-relaxed">GrowAI te notifica de cada cambio de estado de tu trámite. Sin tener que llamar a ningún lado.</p>
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Checklist de requisitos habituales</h2>
    <ul class="flex flex-col gap-3 mb-12">
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">DNI y datos personales actualizados</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Definir el tipo de inscripción: autocultivo, organización de cultivo solidario, o cultivador de organización</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Domicilio del cultivo</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Indicación médica (en caso de inscripción por uso medicinal/terapéutico)</span>
      </li>
    </ul>

    <h2 class="text-2xl font-bold text-text-main mb-4">Preguntas frecuentes</h2>
    <div class="flex flex-col gap-6 mb-12">
      <div>
        <h3 class="font-bold text-text-main mb-1">¿El trámite de REPROCANN tiene costo?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">No, la inscripción en REPROCANN es gratuita y se realiza directamente ante el Ministerio de Salud de la Nación.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Cuánto tarda en aprobarse?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">El tiempo de aprobación depende del organismo y puede variar. GrowAI te notifica automáticamente ante cada cambio de estado, para que no tengas que estar consultando manualmente.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿GrowAI reemplaza el trámite oficial?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">No. GrowAI es una herramienta de acompañamiento y seguimiento; el registro y la aprobación son siempre responsabilidad del organismo oficial correspondiente.</p>
      </div>
    </div>

    <p class="text-xs text-text-main/35 leading-relaxed mb-10 border-l-2 border-green/20 pl-4">
      GrowAI es una herramienta de acompañamiento y no constituye asesoramiento legal. Ante dudas específicas sobre tu situación, consultá siempre la normativa oficial vigente o a un profesional matriculado.
    </p>

    <div class="text-center">
      <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 bg-green text-bg-deep font-bold px-7 py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.3)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.45)] hover:-translate-y-0.5 transition">
        Gestionar mi REPROCANN →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build y verificación**

Run: `npx @11ty/eleventy`
Expected: `_site/reprocann/index.html` generado. Un solo `<h1>` en la página (verificar con `grep -o "<h1" _site/reprocann/index.html | wc -l` → debe dar `1`). Navbar, footer y drawer heredados del layout se ven correctamente.

- [ ] **Step 3: Commit**

```bash
git add src/reprocann.njk
git commit -m "feat: página propia /reprocann con guía y FAQ"
```

---

## Task 5: Página `/sensei-ia`

**Files:**
- Create: `src/sensei-ia.njk`

- [ ] **Step 1: Crear la página completa**

```njk
---
layout: layouts/base.njk
title: "Sensei IA - Diagnóstico de Plantas de Cannabis con IA | GrowAI"
description: "Sensei es el asistente de inteligencia artificial de GrowAI: diagnostica problemas en tus plantas de cannabis por foto o síntoma, con contexto de tu cultivo."
permalink: /sensei-ia/
---
<section class="py-24 bg-section-c">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="eyebrow mb-4" style="color:#8B6ED0;">Sensei</span>
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-text-main mt-4">
        Sensei IA: diagnóstico de cultivo con inteligencia artificial
      </h1>
      <p class="text-text-main/50 text-base mt-4 max-w-lg mx-auto leading-relaxed">
        Describí síntomas, subí fotos, preguntá lo que quieras. Sensei tiene contexto de tu cultivo y responde con precisión y calma.
      </p>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Qué hace Sensei</h2>
    <p class="text-text-main/60 text-base leading-relaxed mb-6">
      Sensei es el asistente de inteligencia artificial integrado en GrowAI. Analiza fotos de tus plantas y las respuestas que le das sobre síntomas (hojas amarillas, manchas, enroscamiento, crecimiento lento, entre otros) para ayudarte a identificar posibles causas: deficiencias nutricionales, plagas, exceso o falta de riego, problemas de pH, entre otras.
    </p>
    <ul class="flex flex-col gap-3 mb-10">
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style="background:rgba(139,110,208,0.15);border:1px solid rgba(139,110,208,0.3);">
          <span class="w-1.5 h-1.5 rounded-full block" style="background:#8B6ED0;"></span>
        </span>
        <span class="text-sm text-text-main/65">Conversaciones con contexto completo de tu cultivo</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style="background:rgba(139,110,208,0.15);border:1px solid rgba(139,110,208,0.3);">
          <span class="w-1.5 h-1.5 rounded-full block" style="background:#8B6ED0;"></span>
        </span>
        <span class="text-sm text-text-main/65">Historial de chats guardado y accesible desde la app</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style="background:rgba(139,110,208,0.15);border:1px solid rgba(139,110,208,0.3);">
          <span class="w-1.5 h-1.5 rounded-full block" style="background:#8B6ED0;"></span>
        </span>
        <span class="text-sm text-text-main/65">Diagnóstico por foto · 10 chats/mes en Básico, ilimitado en Pro</span>
      </li>
    </ul>

    <h2 class="text-2xl font-bold text-text-main mb-4">Ejemplos de uso</h2>
    <div class="flex flex-col gap-6 mb-10">
      <div>
        <h3 class="font-bold text-text-main mb-1">Hojas amarillas en floración</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Le contás en qué etapa está la planta y subís una foto de las hojas afectadas; Sensei te ayuda a acotar si puede tratarse de una deficiencia de nitrógeno, exceso de riego u otra causa, y qué observar para confirmarlo.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">Manchas o puntos en las hojas</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Describís cuándo aparecieron y en qué parte de la planta; Sensei orienta sobre posibles plagas o problemas fúngicos a revisar.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">Dudas generales de cultivo</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Preguntas sobre riego, poda, o cualquier etapa del ciclo, con respuestas que tienen en cuenta el historial de tu planta registrado en Mis Cultivos.</p>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Preguntas frecuentes</h2>
    <div class="flex flex-col gap-6 mb-12">
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Sensei reemplaza a un ingeniero agrónomo o profesional de la salud?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">No. Sensei es una herramienta de apoyo basada en IA, pensada para orientar y acompañar tu cultivo. No reemplaza el asesoramiento de un profesional matriculado, especialmente ante problemas de salud de las plantas o del cultivador que requieran atención especializada.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Cuántos chats con Sensei incluye cada plan?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">El plan Básico incluye 10 chats por mes; el plan Pro incluye chats ilimitados.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Necesito subir foto siempre?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">No es obligatorio, pero una foto ayuda a Sensei a dar un diagnóstico más preciso. También podés describir los síntomas por texto.</p>
      </div>
    </div>

    <p class="text-xs text-text-main/35 leading-relaxed mb-10 border-l-2 border-purple/20 pl-4">
      Sensei es una herramienta de apoyo basada en inteligencia artificial y no reemplaza el asesoramiento de un profesional. Ante problemas serios en tu cultivo o dudas de salud, consultá siempre a un profesional matriculado.
    </p>

    <div class="text-center">
      <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full text-sm transition hover:-translate-y-0.5"
         style="background:#8B6ED0;color:#fff;box-shadow:0 4px 20px rgba(139,110,208,0.35);">
        Probar Sensei →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build y verificación**

Run: `npx @11ty/eleventy`
Expected: `_site/sensei-ia/index.html` generado, un solo `<h1>`, disclaimer visible.

- [ ] **Step 3: Commit**

```bash
git add src/sensei-ia.njk
git commit -m "feat: página propia /sensei-ia con FAQ y disclaimer"
```

---

## Task 6: Página `/mis-cultivos`

**Files:**
- Create: `src/mis-cultivos.njk`

- [ ] **Step 1: Crear la página completa**

```njk
---
layout: layouts/base.njk
title: "Mis Cultivos - Registro y Seguimiento de Plantas | GrowAI"
description: "Registrá y hacé seguimiento de tus plantas de cannabis desde la germinación hasta la cosecha. Historial completo y reportes en PDF con GrowAI."
permalink: /mis-cultivos/
---
<section class="py-24 bg-section-b">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="eyebrow mb-4">Mis Cultivos</span>
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-text-main mt-4">
        Mis Cultivos: cada planta, cada etapa, registrada
      </h1>
      <p class="text-text-main/50 text-base mt-4 max-w-lg mx-auto leading-relaxed">
        Llevá un historial completo de tus cultivos: desde la germinación hasta la cosecha. Nunca más perdás el seguimiento de lo que funciona.
      </p>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Qué es el registro de cultivos</h2>
    <p class="text-text-main/60 text-base leading-relaxed mb-6">
      Mis Cultivos es la funcionalidad de GrowAI para llevar un historial ordenado de cada planta: en qué etapa está, qué se hizo en cada momento y cómo evolucionó. Sirve tanto para no perder de vista el estado actual de tu cultivo como para revisar, ciclo tras ciclo, qué prácticas funcionaron mejor.
    </p>
    <ul class="flex flex-col gap-3 mb-10">
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Registro por etapa: germinación, vegetación, floración, cosecha</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Historial completo de cada ciclo, siempre disponible</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Exportar reportes en PDF con un solo toque</span>
      </li>
      <li class="flex gap-3 items-start">
        <span class="mt-1 w-5 h-5 rounded-full bg-green/15 border border-green/30 flex items-center justify-center shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-green block"></span>
        </span>
        <span class="text-sm text-text-main/65">Hasta 5 cultivos activos en Básico · ilimitados en Pro</span>
      </li>
    </ul>

    <h2 class="text-2xl font-bold text-text-main mb-4">Para qué sirve llevar el registro</h2>
    <div class="flex flex-col gap-6 mb-12">
      <div>
        <h3 class="font-bold text-text-main mb-1">Detectar patrones entre cultivos</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Comparar el historial de una planta contra cultivos anteriores ayuda a identificar qué cambios de riego, luz o nutrientes dieron mejor resultado.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">Tener contexto para Sensei</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">El historial registrado en Mis Cultivos es el contexto que usa <a href="/sensei-ia/" class="underline hover:text-text-main transition">Sensei</a> para dar diagnósticos más precisos sobre cada planta.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">Documentación para tu REPROCANN</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Los reportes en PDF exportables sirven como registro ordenado de tu actividad de cultivo, relevante en el marco de tu inscripción en <a href="/reprocann/" class="underline hover:text-text-main transition">REPROCANN</a>.</p>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Preguntas frecuentes</h2>
    <div class="flex flex-col gap-6 mb-12">
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Cuántos cultivos puedo registrar?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">El plan Básico permite hasta 5 cultivos activos simultáneos. El plan Pro permite cultivos ilimitados.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Puedo exportar el historial?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Sí, podés exportar un reporte en PDF de cada cultivo con un solo toque desde la app.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Se pierde el historial de cultivos anteriores?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">No, el historial completo de cada ciclo queda siempre disponible en tu cuenta, aunque la planta ya haya sido cosechada.</p>
      </div>
    </div>

    <div class="text-center">
      <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 bg-green text-bg-deep font-bold px-7 py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.3)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.45)] hover:-translate-y-0.5 transition">
        Empezar a registrar →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build y verificación**

Run: `npx @11ty/eleventy`
Expected: `_site/mis-cultivos/index.html` generado, un solo `<h1>`, links internos a `/sensei-ia/` y `/reprocann/` funcionando.

- [ ] **Step 3: Commit**

```bash
git add src/mis-cultivos.njk
git commit -m "feat: página propia /mis-cultivos con FAQ y enlaces internos"
```

---

## Task 7: Página `/planes`

**Files:**
- Create: `src/planes.njk`

- [ ] **Step 1: Crear la página completa**

```njk
---
layout: layouts/base.njk
title: "Planes y Precios GrowAI - Básico y Pro | GrowAI"
description: "Conocé los planes Básico y Pro de GrowAI: chats con Sensei, cultivos activos, reportes PDF y más. Elegí el que crece con vos."
permalink: /planes/
---
<section class="py-24 bg-section-a">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="eyebrow mb-4">Planes</span>
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-text-main mt-4">
        Planes GrowAI: Básico y Pro
      </h1>
      <p class="text-text-main/50 text-base mt-4 max-w-lg mx-auto leading-relaxed">
        Elegí el plan que crece con vos. Ambos incluyen registro de cultivos, diagnóstico con Sensei y seguimiento de tu REPROCANN — la diferencia está en los límites de uso.
      </p>
    </div>

    <div class="grid sm:grid-cols-2 gap-5 mb-10">
      <div class="rounded-3xl p-7 flex flex-col gap-5"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(76,175,80,0.18);">
        <div>
          <h2 class="font-bold text-green-soft text-sm mb-3">Plan Básico</h2>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs line-through text-text-main/25">$12.990</span>
            <span class="text-[10px] bg-green text-bg-deep px-2 py-0.5 rounded-full font-bold">OFERTA</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-4xl font-black text-text-main">$7.990</span>
            <span class="text-sm text-text-main/35">/mes</span>
          </div>
        </div>
        <ul class="flex flex-col gap-2.5 flex-1">
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>10 chats con Sensei por mes</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Hasta 5 cultivos activos</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Historial completo visible</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Exportar reportes PDF</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Acceso a comunidad</li>
        </ul>
        <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
           class="mt-auto block text-center border border-green/40 text-green-soft font-semibold py-3 rounded-full text-sm hover:border-green hover:bg-green/5 transition">
          Suscribirse
        </a>
      </div>
      <div class="rounded-3xl p-7 flex flex-col gap-5 relative"
           style="background:rgba(76,175,80,0.06);border:2px solid rgba(76,175,80,0.4);">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-green text-bg-deep text-[10px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-[0_2px_12px_rgba(76,175,80,0.4)]">
          ⭐ MÁS POPULAR
        </div>
        <div class="mt-2">
          <h2 class="font-bold text-green text-sm mb-3">Plan Pro</h2>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs line-through text-text-main/25">$24.990</span>
            <span class="text-[10px] bg-green text-bg-deep px-2 py-0.5 rounded-full font-bold">OFERTA</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-4xl font-black text-text-main">$19.990</span>
            <span class="text-sm text-text-main/35">/mes</span>
          </div>
        </div>
        <ul class="flex flex-col gap-2.5 flex-1">
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Chats con Sensei ilimitados</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Cultivos ilimitados</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Historial completo visible</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Exportar reportes PDF</li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60"><span class="text-green mt-0.5 shrink-0">✓</span>Comunidad + soporte prioritario</li>
        </ul>
        <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
           class="mt-auto block text-center bg-green text-bg-deep font-bold py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.35)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.5)] transition">
          Suscribirse
        </a>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-6 text-center">Comparativa detallada</h2>
    <div class="overflow-x-auto mb-12">
      <table class="w-full text-sm text-left border-collapse">
        <thead>
          <tr style="border-bottom:1px solid rgba(76,175,80,0.15);">
            <th class="py-3 pr-4 text-text-main/50 font-semibold">Función</th>
            <th class="py-3 px-4 text-green-soft font-semibold">Básico</th>
            <th class="py-3 pl-4 text-green font-semibold">Pro</th>
          </tr>
        </thead>
        <tbody class="text-text-main/70">
          <tr style="border-bottom:1px solid rgba(76,175,80,0.08);">
            <td class="py-3 pr-4">Chats con Sensei</td>
            <td class="py-3 px-4">10 por mes</td>
            <td class="py-3 pl-4">Ilimitados</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(76,175,80,0.08);">
            <td class="py-3 pr-4">Cultivos activos</td>
            <td class="py-3 px-4">Hasta 5</td>
            <td class="py-3 pl-4">Ilimitados</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(76,175,80,0.08);">
            <td class="py-3 pr-4">Historial y reportes PDF</td>
            <td class="py-3 px-4">Incluido</td>
            <td class="py-3 pl-4">Incluido</td>
          </tr>
          <tr>
            <td class="py-3 pr-4">Soporte</td>
            <td class="py-3 px-4">Comunidad</td>
            <td class="py-3 pl-4">Comunidad + prioritario</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="text-2xl font-bold text-text-main mb-4">Preguntas frecuentes</h2>
    <div class="flex flex-col gap-6 mb-12">
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Puedo cancelar cuando quiera?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Sí, ambos planes se pueden cancelar en cualquier momento sin penalidad.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Puedo cambiar de plan más adelante?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Sí, podés pasar de Básico a Pro (o viceversa) desde la app cuando lo necesites.</p>
      </div>
      <div>
        <h3 class="font-bold text-text-main mb-1">¿Los precios incluyen impuestos?</h3>
        <p class="text-sm text-text-main/60 leading-relaxed">Los precios están expresados en pesos argentinos (ARS) y se facturan mensualmente.</p>
      </div>
    </div>

    <div class="rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6"
         style="background:rgba(255,255,255,0.02);border:1px solid rgba(76,175,80,0.1);">
      <div class="text-center">
        <div class="text-2xl mb-2">🛡️</div>
        <div class="text-xs font-semibold text-text-main mb-1">Garantía</div>
        <div class="text-[11px] text-text-main/40">Cancelá cuando quieras</div>
      </div>
      <div class="text-center">
        <div class="text-2xl mb-2">🔄</div>
        <div class="text-xs font-semibold text-text-main mb-1">Actualizaciones</div>
        <div class="text-[11px] text-text-main/40">Nuevas funciones sin costo</div>
      </div>
      <div class="text-center">
        <div class="text-2xl mb-2">🔒</div>
        <div class="text-xs font-semibold text-text-main mb-1">Seguridad</div>
        <div class="text-[11px] text-text-main/40">Tus datos protegidos</div>
      </div>
      <div class="text-center">
        <div class="text-2xl mb-2">💬</div>
        <div class="text-xs font-semibold text-text-main mb-1">Soporte</div>
        <div class="text-[11px] text-text-main/40">Ayuda cuando la necesités</div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build y verificación**

Run: `npx @11ty/eleventy`
Expected: `_site/planes/index.html` generado, un solo `<h1>`, tabla comparativa visible.

- [ ] **Step 3: Commit**

```bash
git add src/planes.njk
git commit -m "feat: página propia /planes con comparativa y FAQ"
```

---

## Task 8: `sitemap.xml` y `robots.txt`

**Files:**
- Create: `src/sitemap.njk`
- Create: `src/robots.txt`

- [ ] **Step 1: Crear `src/sitemap.njk`**

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{%- for page in collections.all %}
  <url>
    <loc>https://growai.com.ar{{ page.url }}</loc>
    <lastmod>{{ page.date.toISOString() }}</lastmod>
  </url>
{%- endfor %}
</urlset>
```

- [ ] **Step 2: Crear `src/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://growai.com.ar/sitemap.xml
```

- [ ] **Step 3: Agregar passthrough copy de `robots.txt` en `.eleventy.js`**

11ty ya procesa `src/robots.txt` como archivo estático si no tiene extensión de template reconocida — verificar que se copie a `_site/robots.txt` tal cual (sin frontmatter, sin procesamiento Nunjucks) en el Step 4.

- [ ] **Step 4: Build y verificación**

Run: `npx @11ty/eleventy`
Expected: existen `_site/sitemap.xml` (con 5 `<url>`: `/`, `/reprocann/`, `/sensei-ia/`, `/mis-cultivos/`, `/planes/`) y `_site/robots.txt` con el contenido del Step 2.

- [ ] **Step 5: Commit**

```bash
git add src/sitemap.njk src/robots.txt
git commit -m "feat: sitemap.xml y robots.txt"
```

---

## Task 9: Deploy config y limpieza del `index.html` viejo

**Files:**
- Modify: `vercel.json`
- Delete: `index.html` (raíz, el monolito viejo)

- [ ] **Step 1: Actualizar `vercel.json`**

```json
{
  "buildCommand": "npx @11ty/eleventy",
  "outputDirectory": "_site",
  "headers": [
    {
      "source": "/videos/(.*)\\.mp4",
      "headers": [
        { "key": "Content-Type", "value": "video/mp4" },
        { "key": "Accept-Ranges", "value": "bytes" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Deploy de prueba (preview) en Vercel**

Run: `vercel` (o el comando de deploy habitual del proyecto) para generar un preview deployment, NO producción.

Expected: el preview build corre `npx @11ty/eleventy`, sirve desde `_site`, y las 5 páginas (`/`, `/reprocann`, `/sensei-ia`, `/mis-cultivos`, `/planes`) responden 200. Verificar también `/sitemap.xml` y `/robots.txt` en el preview.

- [ ] **Step 3: Confirmar con el usuario antes de borrar `index.html`**

El `index.html` viejo en la raíz queda obsoleto una vez que el preview de 11ty está verificado. Antes de borrarlo, pedir confirmación explícita (es una eliminación irreversible del archivo de referencia, aunque queda en el historial de git).

- [ ] **Step 4: Eliminar `index.html`**

Run: `git rm index.html`

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "build: apuntar deploy de Vercel a la salida de 11ty y eliminar index.html legacy"
```

---

## Task 10: Comprimir videos del hero

**Files:**
- Modify: `videos/Hero.mp4`
- Modify: `videos/cogollo-girando.mp4`
- Modify: `lupa.mp4` (raíz del repo, no en `videos/` — confirmar ubicación exacta antes de sobrescribir)

- [ ] **Step 1: Medir tamaño y bitrate actual**

Run: `ffprobe -v error -show_entries format=size,bit_rate -of default=noprint_wrappers=1 videos/Hero.mp4 videos/cogollo-girando.mp4 lupa.mp4`
Expected: output con tamaño en bytes y bitrate de cada archivo, para tener el "antes" documentado.

- [ ] **Step 2: Recomprimir cada video con ffmpeg (H.264, CRF 28, mismo audio si tiene)**

Run para cada archivo (ejemplo con `Hero.mp4`):

```bash
ffmpeg -i videos/Hero.mp4 -c:v libx264 -crf 28 -preset slow -c:a copy videos/Hero.compressed.mp4
```

Repetir reemplazando `videos/Hero.mp4` por `videos/cogollo-girando.mp4` y `lupa.mp4` respectivamente, generando `.compressed.mp4` junto a cada original.

- [ ] **Step 3: Verificación visual manual**

Reproducir cada `.compressed.mp4` junto al original y confirmar que no hay banding ni artifacts perceptibles a simple vista en pantalla completa. Si se nota degradación, bajar el CRF (ej. de 28 a 24) y repetir el Step 2 para ese archivo.

- [ ] **Step 4: Reemplazar los originales**

Run:
```bash
mv videos/Hero.compressed.mp4 videos/Hero.mp4
mv videos/cogollo-girando.compressed.mp4 videos/cogollo-girando.mp4
mv lupa.compressed.mp4 lupa.mp4
```

- [ ] **Step 5: Confirmar reducción de tamaño**

Run: `ffprobe -v error -show_entries format=size -of default=noprint_wrappers=1 videos/Hero.mp4 videos/cogollo-girando.mp4 lupa.mp4`
Expected: tamaños menores a los medidos en el Step 1.

- [ ] **Step 6: Ajustar atributos `preload`/`loading` en los templates**

En `src/index.njk`, en el `<video id="hero-video">` del Hero (above-the-fold), mantener `preload="auto"` tal como está — es el primer contenido visible, no conviene demorar su carga.

En el video de la sección "El Problema" (`lupa.mp4`, fuera del viewport inicial) y en el de "Cogollo autoplay" (`cogollo-girando.mp4`), cambiar su atributo `preload` de lo que tengan actualmente a `preload="none"`, y si el `<video>` está envuelto en un contenedor con clase `reveal` (ya usa IntersectionObserver para animar), agregar el atributo `loading="lazy"` no aplica a `<video>` nativamente — en su lugar, verificar en el JS específico del home (Task 3, Step 4) si ya existe lógica de autoplay condicionada por scroll para estos videos; si no existe, dejar el `preload="none"` como única optimización de esta tarea (agregar lazy-loading real de video vía JS queda fuera de alcance de este plan).

- [ ] **Step 7: Build y verificación final**

Run: `npx @11ty/eleventy --serve` y confirmar que los 3 videos reproducen correctamente en el home.

- [ ] **Step 8: Commit**

```bash
git add videos/Hero.mp4 videos/cogollo-girando.mp4 lupa.mp4 src/index.njk
git commit -m "perf: comprimir videos del hero y ajustar preload"
```

---

## Task 11: `noindex` en `growAi-app` (app.growai.com.ar)

**Files (repo `growAi-app`):**
- Modify: `web/index.html`
- Create: `web/robots.txt`

- [ ] **Step 1: Ubicar el `<head>` de `web/index.html`**

Run (desde `growAi-app`): `grep -n "<head>" web/index.html`
Expected: número de línea del `<head>` de la app Flutter.

- [ ] **Step 2: Agregar meta noindex**

Insertar dentro del `<head>`, después de la etiqueta `<meta charset>`:

```html
<meta name="robots" content="noindex, nofollow" />
```

- [ ] **Step 3: Crear `web/robots.txt`**

```
User-agent: *
Disallow: /
```

- [ ] **Step 4: Verificar que Firebase Hosting sirve archivos estáticos desde `web/`**

Run: `cat firebase.json | grep -A5 '"hosting"'`
Expected: `"public"` apunta a la carpeta que contiene `web/index.html` compilado (revisar si es `build/web` en vez de `web/` directamente — Flutter compila a `build/web`). Si el hosting sirve desde `build/web`, el `robots.txt` debe copiarse ahí también, o agregarse a los assets fuente que Flutter copia al compilar (`web/robots.txt` normalmente se copia automáticamente a `build/web/robots.txt` en el build de Flutter — confirmar corriendo el build).

- [ ] **Step 5: Build y verificación**

Run: `flutter build web` (o el comando de build habitual del proyecto)
Expected: `build/web/robots.txt` existe con el contenido del Step 3, y `build/web/index.html` contiene el meta tag del Step 2.

- [ ] **Step 6: Commit**

```bash
git add web/index.html web/robots.txt
git commit -m "seo: noindex en app.growai.com.ar (dashboard privado)"
```

---

## Task 12: `noindex` en `growai-juego` (growai-juego.vercel.app)

**Files (repo `growai-juego`):**
- Modify: `index.html`
- Create: `robots.txt`

- [ ] **Step 1: Ubicar el `<head>` de `index.html`**

Run (desde `growai-juego`): `grep -n "<head>" index.html`

- [ ] **Step 2: Agregar meta noindex**

Insertar dentro del `<head>`, después de la etiqueta `<meta charset>`:

```html
<meta name="robots" content="noindex, nofollow" />
```

- [ ] **Step 3: Crear `robots.txt`**

```
User-agent: *
Disallow: /
```

- [ ] **Step 4: Verificación**

Abrir `index.html` localmente y confirmar visualmente que el meta tag está en el `<head>`. Confirmar que `robots.txt` está en la raíz del repo (mismo nivel que `index.html`), ya que no hay build step en este proyecto.

- [ ] **Step 5: Commit**

```bash
git add index.html robots.txt
git commit -m "seo: noindex en growai-juego (contenido lúdico sin valor de búsqueda)"
```

---

## Task 13: Google Search Console (acción manual, no código)

Esta tarea no tiene pasos de código — es un checklist para el usuario, a completar después de que Task 9 esté en producción:

- [ ] Dar de alta `growai.com.ar` como propiedad en Google Search Console.
- [ ] Verificar la propiedad (por DNS TXT record o meta tag, según lo que ofrezca Search Console).
- [ ] Enviar `https://growai.com.ar/sitemap.xml` desde la sección "Sitemaps" de Search Console.
- [ ] Confirmar en la sección "Cobertura"/"Páginas" que las 5 URLs (`/`, `/reprocann`, `/sensei-ia`, `/mis-cultivos`, `/planes`) quedan indexadas en los días siguientes (la indexación no es inmediata).

---

## Self-Review

**Cobertura del spec:**
- Migración a 11ty con Nunjucks → Tasks 1-3.
- 4 páginas nuevas con H1 único, meta title/description únicos, FAQ, disclaimers → Tasks 4-7.
- Navbar apuntando a URLs propias, botones "Ver guía completa" en el home → Tasks 2-3.
- sitemap.xml y robots.txt → Task 8.
- Canonical dinámico → Task 2 (layout base).
- vercel.json actualizado, deploy de prueba → Task 9.
- Compresión de video y preload → Task 10.
- Alt text descriptivo → cubierto inline en Tasks 2-7 (todas las imágenes de los partials y páginas nuevas ya incluyen `alt` descriptivo, no genérico).
- Noindex en `growAi-app` y `growai-juego` → Tasks 11-12.
- Google Search Console → Task 13 (checklist manual, según el spec).

**Fuera de alcance confirmado (no se agregaron tasks):** blog, JSON-LD, página "Sobre GrowAI", medición continua — quedan para specs futuros según el spec original.
