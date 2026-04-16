# GrowAI Rediseño Completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescribir `index.html` completamente con el nuevo diseño Botánico Premium — 9 secciones dark, scroll storytelling, sin overrides acumulados.

**Architecture:** Un único `index.html` con CSS embebido en `<style>` y JS embebido en `<script>` al final del body. Tailwind CSS vía CDN para utilidades. Animaciones con `IntersectionObserver` nativo, sin GSAP. EmailJS para el formulario de contacto.

**Tech Stack:** HTML5 · Tailwind CSS CDN · JS vanilla ES6 · EmailJS browser@4 · Inter (Google Fonts)

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `index.html` | **Reescribir completo** | Todo el sitio: HTML + CSS + JS |
| `js/plant-life-hero.js` | Sin tocar (deprecado) | No se referencia en el nuevo HTML |
| `vercel.json` | Sin tocar | Configuración de Vercel |
| `videos/cogo.mp4` | Sin tocar | Disponible si se usa |
| `icono/favicon.png` | Sin tocar | Favicon existente |

---

## Task 1: HTML Shell + CSS Variables + Tailwind Config

**Files:**
- Rewrite: `index.html` (shell completo, sin contenido de secciones aún)

- [ ] **Paso 1: Crear el nuevo `index.html` con head, meta tags, fuentes y Tailwind config**

Reemplazar el contenido completo de `index.html` con:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GrowAI | Tu Asistente de Cultivo Inteligente</title>
  <meta name="description" content="GrowAI es la plataforma inteligente para el cultivo de cannabis. Sensei, tu asistente IA, te guía en cada etapa. Mis Cultivos, REPROCANN y más." />
  <link rel="icon" type="image/png" href="icono/favicon.png" />
  <link rel="apple-touch-icon" href="icono/favicon.png" />
  <meta name="theme-color" content="#060e07" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="GrowAI | Tu Asistente de Cultivo Inteligente" />
  <meta property="og:description" content="Registrá tus plantas, diagnosticá con Sensei IA y gestioná tu REPROCANN. App web para cualquier dispositivo." />
  <meta property="og:url" content="https://growai.com.ar" />
  <meta property="og:image" content="https://growai.com.ar/icono/favicon.png" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { inter: ['Inter', 'sans-serif'] },
          colors: {
            'bg-deep':   '#060e07',
            'bg-forest': '#0d1f0f',
            'bg-purple': '#1B0F2A',
            'green':     '#4CAF50',
            'green-soft':'#81c784',
            'purple':    '#8B6ED0',
            'text-main': '#f0fdf4',
          },
        },
      },
    };
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background-color: #060e07;
      color: #f0fdf4;
      overflow-x: hidden;
    }
    ::selection { background: #4CAF50; color: #060e07; }

    /* ── Reveal on scroll ── */
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                  transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.12s; }
    .reveal-delay-2 { transition-delay: 0.24s; }
    .reveal-delay-3 { transition-delay: 0.36s; }

    /* ── Eyebrow label ── */
    .eyebrow {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #4CAF50;
    }

    /* ── Partículas hero ── */
    @keyframes float-a { 0%,100%{transform:translateY(0) translateX(0);opacity:.5} 50%{transform:translateY(-18px) translateX(8px);opacity:.8} }
    @keyframes float-b { 0%,100%{transform:translateY(0) translateX(0);opacity:.3} 50%{transform:translateY(14px) translateX(-10px);opacity:.6} }
    @keyframes float-c { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-10px);opacity:.7} }
    .particle { position:absolute; border-radius:50%; pointer-events:none; }
    .particle-a { animation: float-a 7s ease-in-out infinite; }
    .particle-b { animation: float-b 9s ease-in-out infinite; }
    .particle-c { animation: float-c 5s ease-in-out infinite; }

    /* ── Scroll indicator ── */
    @keyframes scroll-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
    .scroll-indicator { animation: scroll-bounce 2s ease-in-out infinite; }

    /* ── Navbar backdrop ── */
    #navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
      border-bottom: 1px solid transparent;
    }
    #navbar.scrolled {
      background: rgba(6,14,7,0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-color: rgba(76,175,80,0.12);
    }

    /* ── Mobile menu drawer ── */
    #mobile-drawer {
      position: fixed; inset: 0; z-index: 100;
      display: flex; pointer-events: none;
    }
    #mobile-drawer.open { pointer-events: auto; }
    #drawer-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.6);
      opacity: 0; transition: opacity 0.3s;
    }
    #mobile-drawer.open #drawer-overlay { opacity: 1; }
    #drawer-panel {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: 260px; background: #0d1f0f;
      border-left: 1px solid rgba(76,175,80,0.15);
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
      display: flex; flex-direction: column; padding: 1.5rem;
    }
    #mobile-drawer.open #drawer-panel { transform: translateX(0); }

    /* ── Chat typing indicator ── */
    @keyframes typing-dot { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
    .typing-dot:nth-child(1){animation:typing-dot 1.2s 0s infinite}
    .typing-dot:nth-child(2){animation:typing-dot 1.2s .2s infinite}
    .typing-dot:nth-child(3){animation:typing-dot 1.2s .4s infinite}

    /* ── Stepper line ── */
    .step-line {
      width: 2px; flex-shrink: 0;
      background: linear-gradient(to bottom, #4CAF50, rgba(76,175,80,0.2));
    }

    /* ── Section alternating backgrounds ── */
    .bg-section-a { background: linear-gradient(160deg, #060e07 0%, #0d1f0f 100%); }
    .bg-section-b { background: linear-gradient(160deg, #0d1f0f 0%, #1B0F2A 100%); }
    .bg-section-c { background: linear-gradient(160deg, #060e07 0%, #0d2010 100%); }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <!-- HERO -->
  <!-- EL PROBLEMA -->
  <!-- FUNCIONES OVERVIEW -->
  <!-- MIS CULTIVOS -->
  <!-- SENSEI -->
  <!-- REPROCANN -->
  <!-- PLANES -->
  <!-- CTA FINAL + CONTACTO -->
  <!-- FOOTER -->

  <!-- MOBILE DRAWER -->

  <script>
    // JS global — se completa en Task 11
  </script>
</body>
</html>
```

- [ ] **Paso 2: Verificar que el archivo abre sin errores**

Abrir `index.html` en el navegador (doble click o Live Server). Debe mostrar página negra vacía sin errores en consola.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: html shell con css variables, tailwind config y animaciones base"
```

---

## Task 2: Navbar

**Files:**
- Modify: `index.html` — reemplazar el comentario `<!-- NAVBAR -->`

- [ ] **Paso 1: Insertar el HTML de la navbar**

Reemplazar `<!-- NAVBAR -->` con:

```html
<nav id="navbar">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <!-- Logo -->
    <a href="#hero" class="flex items-center gap-2.5 shrink-0">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
           style="background:linear-gradient(135deg,#4CAF50,#2d4a1e);">🌿</div>
      <span class="font-black text-lg tracking-tight text-text-main">GrowAI</span>
    </a>
    <!-- Links desktop -->
    <div class="hidden md:flex items-center gap-7">
      <a href="#funciones" class="text-sm text-text-main/50 hover:text-text-main transition">Funciones</a>
      <a href="#sensei"    class="text-sm text-text-main/50 hover:text-text-main transition">Sensei</a>
      <a href="#reprocann" class="text-sm text-text-main/50 hover:text-text-main transition">REPROCANN</a>
      <a href="#planes"    class="text-sm text-text-main/50 hover:text-text-main transition">Planes</a>
    </div>
    <!-- CTA desktop + hamburger mobile -->
    <div class="flex items-center gap-3">
      <a href="https://app.growai.com.ar"
         target="_blank" rel="noopener noreferrer"
         class="hidden md:inline-flex items-center gap-1.5 bg-green text-bg-deep text-sm font-bold px-5 py-2 rounded-full hover:bg-green-soft transition">
        Abrir app
      </a>
      <button id="menu-btn"
              class="md:hidden flex flex-col gap-1.5 p-2 rounded-lg"
              aria-label="Abrir menú">
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
        <span class="block w-5 h-0.5 bg-text-main/70 rounded"></span>
      </button>
    </div>
  </div>
</nav>
```

- [ ] **Paso 2: Insertar el mobile drawer**

Reemplazar `<!-- MOBILE DRAWER -->` con:

```html
<div id="mobile-drawer">
  <div id="drawer-overlay"></div>
  <div id="drawer-panel">
    <div class="flex justify-between items-center mb-8">
      <span class="font-black text-text-main">GrowAI</span>
      <button id="drawer-close" class="text-text-main/50 hover:text-text-main transition text-xl">✕</button>
    </div>
    <nav class="flex flex-col gap-1">
      <a href="#funciones"  class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Funciones</a>
      <a href="#sensei"     class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Sensei</a>
      <a href="#reprocann"  class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">REPROCANN</a>
      <a href="#planes"     class="drawer-link px-3 py-2.5 rounded-lg text-sm text-text-main/70 hover:text-text-main hover:bg-green/10 transition">Planes</a>
    </nav>
    <a href="https://app.growai.com.ar"
       target="_blank" rel="noopener noreferrer"
       class="mt-auto inline-flex justify-center bg-green text-bg-deep font-bold py-3 rounded-full text-sm">
      Abrir GrowAI →
    </a>
  </div>
</div>
```

- [ ] **Paso 3: Añadir el JS del navbar y drawer dentro del `<script>` global**

En el `<script>` al final del body, reemplazar el comentario placeholder con:

```javascript
// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile drawer ──
const drawer  = document.getElementById('mobile-drawer');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('drawer-close');
const overlay = document.getElementById('drawer-overlay');

function openDrawer()  { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeDrawer() { drawer.classList.remove('open'); document.body.style.overflow = ''; }

menuBtn.addEventListener('click', openDrawer);
closeBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));
```

- [ ] **Paso 4: Verificar navbar**

Abrir en navegador: ver logo + links + botón "Abrir app". Hacer scroll: fondo debe aparecer con blur. En mobile (< 768px): hamburger visible, clicks abren el drawer, links cierran el drawer.

- [ ] **Paso 5: Commit**

```bash
git add index.html
git commit -m "feat: navbar fija con scroll blur y drawer mobile"
```

---

## Task 3: Hero — Fullscreen Narrativo

**Files:**
- Modify: `index.html` — reemplazar `<!-- HERO -->`

- [ ] **Paso 1: Insertar el HTML del hero**

Reemplazar `<!-- HERO -->` con:

```html
<section id="hero"
  class="relative min-h-svh flex flex-col items-center justify-center overflow-hidden pt-16"
  style="background:linear-gradient(160deg,#060e07 0%,#0d1f0f 45%,#1B0F2A 100%);">

  <!-- Orbes de fondo -->
  <div class="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full"
       style="background:radial-gradient(circle,rgba(76,175,80,0.07) 0%,transparent 70%);"></div>
  <div class="pointer-events-none absolute bottom-0 -left-16 w-64 h-64 rounded-full"
       style="background:radial-gradient(circle,rgba(139,110,208,0.06) 0%,transparent 70%);"></div>

  <!-- Partículas CSS -->
  <div class="particle particle-a w-2 h-2 bg-green/50" style="top:18%;left:12%;"></div>
  <div class="particle particle-b w-1.5 h-1.5 bg-green/30" style="top:65%;left:8%;animation-delay:1s;"></div>
  <div class="particle particle-c w-1 h-1 bg-green-soft/40" style="top:35%;left:80%;animation-delay:2s;"></div>
  <div class="particle particle-a w-2.5 h-2.5 bg-purple/30" style="top:75%;right:15%;animation-delay:3s;"></div>
  <div class="particle particle-b w-1 h-1 bg-green/40" style="top:20%;right:25%;animation-delay:1.5s;"></div>
  <div class="particle particle-c w-1.5 h-1.5 bg-green-soft/30" style="top:50%;left:45%;animation-delay:4s;"></div>

  <!-- Contenido centrado -->
  <div class="relative text-center px-6 max-w-2xl mx-auto flex flex-col items-center gap-6">
    <p class="eyebrow reveal">Tu asistente de cultivo inteligente</p>
    <h1 class="reveal reveal-delay-1 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-text-main">
      Tu cultivo,<br>guiado por IA
    </h1>
    <p class="reveal reveal-delay-2 text-base sm:text-lg text-text-main/60 max-w-lg leading-relaxed">
      Registrá tus plantas, diagnosticá problemas con Sensei y gestioná tu REPROCANN — todo desde una app web para cualquier dispositivo.
    </p>
    <div class="reveal reveal-delay-3 flex flex-col sm:flex-row gap-3 justify-center">
      <a href="https://app.growai.com.ar"
         target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center justify-center gap-2 bg-green text-bg-deep font-bold px-8 py-3.5 rounded-full text-base shadow-[0_4px_24px_rgba(76,175,80,0.35)] hover:shadow-[0_6px_32px_rgba(76,175,80,0.5)] hover:-translate-y-0.5 transition">
        Abrir GrowAI →
      </a>
      <a href="#funciones"
         class="inline-flex items-center justify-center gap-2 border border-green/30 text-green-soft font-medium px-7 py-3.5 rounded-full text-base hover:border-green/60 hover:bg-green/5 transition">
        Ver funciones
      </a>
    </div>
    <p class="text-xs text-text-main/30 mt-1">App web · cualquier dispositivo</p>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator">
    <span class="text-[10px] tracking-widest text-text-main/30 uppercase">scrolleá</span>
    <div class="w-px h-6" style="background:linear-gradient(to bottom,rgba(76,175,80,0.4),transparent);"></div>
    <div class="w-1.5 h-1.5 border-r border-b border-green/40 rotate-45"></div>
  </div>
</section>
```

- [ ] **Paso 2: Verificar hero**

Ver en navegador: pantalla completa oscura, texto centrado, 2 botones, partículas animadas, scroll indicator. En mobile: texto legible, botones apilados.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: hero fullscreen narrativo con particulas CSS y CTAs"
```

---

## Task 4: El Problema

**Files:**
- Modify: `index.html` — reemplazar `<!-- EL PROBLEMA -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- EL PROBLEMA -->` con:

```html
<section class="py-24 bg-section-b">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <p class="eyebrow reveal mb-4">El desafío</p>
    <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight leading-tight text-text-main mb-4">
      Cultivar sin guía es<br>frustrante y solitario
    </h2>
    <p class="reveal reveal-delay-2 text-text-main/50 text-base max-w-lg mx-auto mb-14 leading-relaxed">
      La mayoría de los cultivadores navegan a ciegas entre errores, papeleo y diagnósticos imposibles.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div class="reveal reveal-delay-1 rounded-2xl p-6 text-left"
           style="background:rgba(0,0,0,0.35);border:1px solid rgba(76,175,80,0.1);">
        <div class="text-3xl mb-4">😓</div>
        <h3 class="font-bold text-green-soft mb-2 text-sm">Sin diagnóstico</h3>
        <p class="text-text-main/45 text-sm leading-relaxed">No sabés qué le pasa a tu planta y el tiempo corre sin respuestas.</p>
      </div>
      <div class="reveal reveal-delay-2 rounded-2xl p-6 text-left"
           style="background:rgba(0,0,0,0.35);border:1px solid rgba(76,175,80,0.1);">
        <div class="text-3xl mb-4">📋</div>
        <h3 class="font-bold text-green-soft mb-2 text-sm">Sin registro</h3>
        <p class="text-text-main/45 text-sm leading-relaxed">Perdés el historial de cada ciclo y no podés mejorar tu técnica.</p>
      </div>
      <div class="reveal reveal-delay-3 rounded-2xl p-6 text-left"
           style="background:rgba(0,0,0,0.35);border:1px solid rgba(76,175,80,0.1);">
        <div class="text-3xl mb-4">📄</div>
        <h3 class="font-bold text-green-soft mb-2 text-sm">Sin tramitar</h3>
        <p class="text-text-main/45 text-sm leading-relaxed">El REPROCANN es confuso y no sabés por dónde empezar el registro.</p>
      </div>
    </div>
    <p class="reveal mt-10 text-text-main/35 text-sm tracking-wide">GrowAI resuelve los tres.</p>
  </div>
</section>
```

- [ ] **Paso 2: Verificar**

Las 3 cards deben aparecer con stagger al hacer scroll. Texto legible sobre fondo oscuro.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: seccion el-problema con 3 cards en grid"
```

---

## Task 5: Las 3 Funciones — Overview

**Files:**
- Modify: `index.html` — reemplazar `<!-- FUNCIONES OVERVIEW -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- FUNCIONES OVERVIEW -->` con:

```html
<section id="funciones" class="py-24 bg-section-a">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-14">
      <p class="eyebrow reveal mb-4">Funciones</p>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main">
        Tres pilares. Una sola app.
      </h2>
    </div>
    <div class="flex flex-col gap-4">

      <!-- Card Mis Cultivos -->
      <a href="#mis-cultivos"
         class="reveal reveal-delay-1 group flex items-start gap-5 rounded-2xl p-6 transition hover:scale-[1.01]"
         style="background:rgba(76,175,80,0.05);border:1px solid rgba(76,175,80,0.18);">
        <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
             style="background:rgba(76,175,80,0.12);border:1px solid rgba(76,175,80,0.25);">🌱</div>
        <div class="flex-1">
          <h3 class="font-bold text-text-main mb-1">Mis Cultivos</h3>
          <p class="text-sm text-text-main/50 leading-relaxed">Registrá cada planta, etapa y parámetro. Historial completo exportable en PDF. Hasta 5 en Básico, ilimitados en Pro.</p>
        </div>
        <span class="self-center text-green/40 group-hover:text-green transition text-lg">→</span>
      </a>

      <!-- Card Sensei -->
      <a href="#sensei"
         class="reveal reveal-delay-2 group flex items-start gap-5 rounded-2xl p-6 transition hover:scale-[1.01]"
         style="background:rgba(139,110,208,0.05);border:1px solid rgba(139,110,208,0.18);">
        <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
             style="background:rgba(139,110,208,0.12);border:1px solid rgba(139,110,208,0.25);">🤖</div>
        <div class="flex-1">
          <h3 class="font-bold text-text-main mb-1">Sensei IA</h3>
          <p class="text-sm text-text-main/50 leading-relaxed">Describí síntomas o subí fotos. Sensei te orienta con precisión y contexto de tu cultivo. Conversaciones guardadas en la app.</p>
        </div>
        <span class="self-center text-purple/40 group-hover:text-purple transition text-lg">→</span>
      </a>

      <!-- Card REPROCANN -->
      <a href="#reprocann"
         class="reveal reveal-delay-3 group flex items-start gap-5 rounded-2xl p-6 transition hover:scale-[1.01]"
         style="background:rgba(76,175,80,0.05);border:1px solid rgba(76,175,80,0.18);">
        <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
             style="background:rgba(76,175,80,0.12);border:1px solid rgba(76,175,80,0.25);">📋</div>
        <div class="flex-1">
          <h3 class="font-bold text-text-main mb-1">REPROCANN</h3>
          <p class="text-sm text-text-main/50 leading-relaxed">Gestioná tu trámite paso a paso desde la app. Sin burocracia confusa. GrowAI te guía en cada etapa del registro.</p>
        </div>
        <span class="self-center text-green/40 group-hover:text-green transition text-lg">→</span>
      </a>

    </div>
  </div>
</section>
```

- [ ] **Paso 2: Verificar**

Las 3 cards aparecen en stagger. Los links `href="#mis-cultivos"`, `href="#sensei"`, `href="#reprocann"` scrollean a las secciones correspondientes (las añadiremos en tasks siguientes).

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: seccion funciones overview con 3 cards anchor"
```

---

## Task 6: Mis Cultivos

**Files:**
- Modify: `index.html` — reemplazar `<!-- MIS CULTIVOS -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- MIS CULTIVOS -->` con:

```html
<section id="mis-cultivos" class="py-24 bg-section-b">
  <div class="max-w-5xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-12 items-center">

      <!-- Texto -->
      <div class="flex flex-col gap-6">
        <p class="eyebrow reveal">Mis Cultivos</p>
        <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main leading-tight">
          Cada planta,<br>cada etapa, registrada
        </h2>
        <p class="reveal reveal-delay-2 text-text-main/55 text-base leading-relaxed">
          Llevá un historial completo de tus cultivos: desde la germinación hasta la cosecha. Nunca más perdás el seguimiento de lo que funciona.
        </p>
        <ul class="reveal reveal-delay-3 flex flex-col gap-3">
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
        <div class="reveal">
          <a href="https://app.growai.com.ar"
             target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 bg-green text-bg-deep font-bold px-7 py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.3)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.45)] hover:-translate-y-0.5 transition">
            Empezar a registrar →
          </a>
        </div>
      </div>

      <!-- Visual mock -->
      <div class="reveal reveal-delay-2">
        <div class="rounded-3xl p-5 shadow-2xl"
             style="background:rgba(6,14,7,0.8);border:1px solid rgba(76,175,80,0.18);">
          <!-- Header mock app -->
          <div class="flex items-center justify-between mb-4 pb-3"
               style="border-bottom:1px solid rgba(76,175,80,0.1);">
            <span class="text-xs font-bold text-green-soft">Mis Cultivos</span>
            <span class="text-xs text-text-main/30">3 activos</span>
          </div>
          <!-- Plant card mock -->
          <div class="flex flex-col gap-3">
            <div class="rounded-xl p-3 flex items-center gap-3"
                 style="background:rgba(76,175,80,0.07);border:1px solid rgba(76,175,80,0.15);">
              <div class="w-9 h-9 rounded-lg bg-green/15 flex items-center justify-center text-lg shrink-0">🌿</div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-text-main">Planta #1 — OG Kush</div>
                <div class="text-[10px] text-text-main/40 mt-0.5">Floración · Día 42</div>
              </div>
              <div class="text-[10px] text-green font-semibold">En curso</div>
            </div>
            <div class="rounded-xl p-3 flex items-center gap-3"
                 style="background:rgba(76,175,80,0.04);border:1px solid rgba(76,175,80,0.08);">
              <div class="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center text-lg shrink-0">🌱</div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-text-main">Planta #2 — White Widow</div>
                <div class="text-[10px] text-text-main/40 mt-0.5">Vegetación · Día 18</div>
              </div>
              <div class="text-[10px] text-text-main/40 font-semibold">En curso</div>
            </div>
            <div class="rounded-xl p-3 flex items-center gap-3"
                 style="background:rgba(76,175,80,0.04);border:1px solid rgba(76,175,80,0.08);">
              <div class="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center text-lg shrink-0">🪴</div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-text-main">Planta #3 — Blue Dream</div>
                <div class="text-[10px] text-text-main/40 mt-0.5">Germinación · Día 3</div>
              </div>
              <div class="text-[10px] text-text-main/40 font-semibold">En curso</div>
            </div>
            <!-- Export button mock -->
            <div class="mt-2 flex justify-end">
              <div class="text-[10px] text-green-soft/60 border border-green/15 px-3 py-1.5 rounded-full">
                Exportar PDF ↓
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Paso 2: Verificar**

Sección visible con layout 2 col en desktop, 1 col en mobile. Mock de app visible a la derecha. Bullets con animación reveal.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: seccion mis-cultivos con texto y mock de app"
```

---

## Task 7: Sensei

**Files:**
- Modify: `index.html` — reemplazar `<!-- SENSEI -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- SENSEI -->` con:

```html
<section id="sensei" class="py-24 bg-section-c">
  <div class="max-w-5xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-12 items-center">

      <!-- Mock chat (izquierda en desktop) -->
      <div class="reveal order-2 md:order-1">
        <div class="rounded-3xl p-5 shadow-2xl"
             style="background:rgba(6,14,7,0.85);border:1px solid rgba(139,110,208,0.2);">
          <div class="flex items-center gap-2 mb-4 pb-3"
               style="border-bottom:1px solid rgba(139,110,208,0.1);">
            <div class="w-7 h-7 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center text-sm">🤖</div>
            <span class="text-xs font-bold" style="color:#8B6ED0;">Sensei</span>
            <div class="ml-auto flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></div>
              <span class="text-[10px] text-text-main/30">en línea</span>
            </div>
          </div>
          <div id="chat-messages" class="flex flex-col gap-3 min-h-[160px]">
            <!-- Los mensajes se inyectan por JS al entrar en viewport -->
          </div>
          <!-- Typing indicator (oculto por defecto) -->
          <div id="typing-indicator" class="hidden flex gap-2 items-center mt-3 pl-1">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                 style="background:linear-gradient(135deg,#4CAF50,#2d4a1e);">S</div>
            <div class="flex gap-1 px-3 py-2 rounded-2xl" style="background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.15);">
              <div class="typing-dot w-1.5 h-1.5 rounded-full bg-green"></div>
              <div class="typing-dot w-1.5 h-1.5 rounded-full bg-green"></div>
              <div class="typing-dot w-1.5 h-1.5 rounded-full bg-green"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Texto -->
      <div class="flex flex-col gap-6 order-1 md:order-2">
        <p class="eyebrow reveal" style="color:#8B6ED0;">Sensei</p>
        <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main leading-tight">
          Tu experto IA,<br>siempre disponible
        </h2>
        <p class="reveal reveal-delay-2 text-text-main/55 text-base leading-relaxed">
          Describí síntomas, subí fotos, preguntá lo que quieras. Sensei tiene contexto de tu cultivo y responde con precisión y calma.
        </p>
        <ul class="reveal reveal-delay-3 flex flex-col gap-3">
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
        <div class="reveal">
          <a href="https://app.growai.com.ar"
             target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full text-sm transition hover:-translate-y-0.5"
             style="background:#8B6ED0;color:#fff;box-shadow:0 4px 20px rgba(139,110,208,0.35);">
            Probar Sensei →
          </a>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Paso 2: Añadir la animación del chat al bloque `<script>` global**

Agregar al final del script (antes del cierre `</script>`):

```javascript
// ── Sensei chat animation ──
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');

const CHAT_CONVERSATION = [
  { type: 'user', text: 'Las hojas se están amarillando en los bordes 🍂' },
  { type: 'sensei', text: 'Puede ser deficiencia de potasio o magnesio. ¿Podés subir una foto para un diagnóstico más preciso?' },
  { type: 'user', text: '📷 [foto adjunta]' },
  { type: 'sensei', text: 'Confirmo: deficiencia de magnesio. Te recomiendo aplicar sulfato de magnesio foliar esta semana.' },
];

function buildMessage(msg) {
  const el = document.createElement('div');
  if (msg.type === 'user') {
    el.className = 'flex justify-end';
    el.innerHTML = `<div class="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-sm text-xs text-text-main" style="background:rgba(139,110,208,0.18);border:1px solid rgba(139,110,208,0.25);">${msg.text}</div>`;
  } else {
    el.className = 'flex gap-2 items-start';
    el.innerHTML = `
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0" style="background:linear-gradient(135deg,#4CAF50,#2d4a1e);">S</div>
      <div class="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-text-main/80 leading-relaxed" style="background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.15);">${msg.text}</div>`;
  }
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  return el;
}

async function playChatAnimation() {
  if (!chatMessages) return;
  chatMessages.innerHTML = '';
  for (let i = 0; i < CHAT_CONVERSATION.length; i++) {
    const msg = CHAT_CONVERSATION[i];
    await new Promise(r => setTimeout(r, i === 0 ? 300 : 900));
    if (msg.type === 'sensei') {
      typingIndicator.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 800));
      typingIndicator.classList.add('hidden');
    }
    const el = buildMessage(msg);
    chatMessages.appendChild(el);
    await new Promise(r => requestAnimationFrame(r));
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }
}

let chatPlayed = false;
const chatSection = document.getElementById('sensei');
if (chatSection) {
  const chatObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !chatPlayed) {
      chatPlayed = true;
      playChatAnimation();
    }
  }, { threshold: 0.3 });
  chatObs.observe(chatSection);
}
```

- [ ] **Paso 3: Verificar**

Al hacer scroll a la sección Sensei, los mensajes del chat deben aparecer secuencialmente con typing indicator.

- [ ] **Paso 4: Commit**

```bash
git add index.html
git commit -m "feat: seccion sensei con mock chat animado"
```

---

## Task 8: REPROCANN

**Files:**
- Modify: `index.html` — reemplazar `<!-- REPROCANN -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- REPROCANN -->` con:

```html
<section id="reprocann" class="py-24 bg-section-b">
  <div class="max-w-3xl mx-auto px-6">
    <div class="text-center mb-12">
      <p class="eyebrow reveal mb-4">REPROCANN</p>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main">
        Tu trámite, sin vueltas
      </h2>
      <p class="reveal reveal-delay-2 text-text-main/50 text-base mt-4 max-w-md mx-auto leading-relaxed">
        GrowAI te guía paso a paso en el Registro del Programa de Cannabis de Argentina.
      </p>
    </div>

    <!-- Stepper -->
    <div class="flex flex-col gap-0 max-w-xl mx-auto">

      <div class="reveal reveal-delay-1 flex gap-5 items-start">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-bg-deep bg-green shadow-[0_0_16px_rgba(76,175,80,0.35)]">1</div>
          <div class="step-line h-14 mt-1"></div>
        </div>
        <div class="pt-1.5 pb-10">
          <h3 class="font-bold text-text-main mb-1">Creá tu cuenta en GrowAI</h3>
          <p class="text-sm text-text-main/45 leading-relaxed">Desde la app web, en menos de un minuto. Solo necesitás email.</p>
        </div>
      </div>

      <div class="reveal reveal-delay-2 flex gap-5 items-start">
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

      <div class="reveal reveal-delay-3 flex gap-5 items-start">
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

    <div class="reveal text-center mt-10">
      <a href="https://app.growai.com.ar"
         target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 bg-green text-bg-deep font-bold px-7 py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.3)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.45)] hover:-translate-y-0.5 transition">
        Gestionar mi REPROCANN →
      </a>
    </div>
  </div>
</section>
```

- [ ] **Paso 2: Verificar**

Stepper vertical con 3 pasos, línea conectora degradada entre pasos, animación reveal stagger.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: seccion REPROCANN con stepper vertical"
```

---

## Task 9: Planes

**Files:**
- Modify: `index.html` — reemplazar `<!-- PLANES -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- PLANES -->` con:

```html
<section id="planes" class="py-24 bg-section-a">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-12">
      <p class="eyebrow reveal mb-4">Planes</p>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main">
        Elegí el que crece con vos
      </h2>
    </div>

    <!-- Cards de planes -->
    <div class="grid sm:grid-cols-2 gap-5 mb-10">

      <!-- Básico -->
      <div class="reveal reveal-delay-1 rounded-3xl p-7 flex flex-col gap-5"
           style="background:rgba(255,255,255,0.03);border:1px solid rgba(76,175,80,0.18);">
        <div>
          <h3 class="font-bold text-green-soft text-sm mb-3">Plan Básico</h3>
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
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>10 chats con Sensei por mes
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Hasta 5 cultivos activos
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Historial completo visible
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Exportar reportes PDF
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Acceso a comunidad
          </li>
        </ul>
        <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
           class="mt-auto block text-center border border-green/40 text-green-soft font-semibold py-3 rounded-full text-sm hover:border-green hover:bg-green/5 transition">
          Suscribirse
        </a>
      </div>

      <!-- Pro -->
      <div class="reveal reveal-delay-2 rounded-3xl p-7 flex flex-col gap-5 relative"
           style="background:rgba(76,175,80,0.06);border:2px solid rgba(76,175,80,0.4);">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-green text-bg-deep text-[10px] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-[0_2px_12px_rgba(76,175,80,0.4)]">
          ⭐ MÁS POPULAR
        </div>
        <div class="mt-2">
          <h3 class="font-bold text-green text-sm mb-3">Plan Pro</h3>
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
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Chats con Sensei ilimitados
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Cultivos ilimitados
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Historial completo visible
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Exportar reportes PDF
          </li>
          <li class="flex gap-2.5 items-start text-sm text-text-main/60">
            <span class="text-green mt-0.5 shrink-0">✓</span>Comunidad + soporte prioritario
          </li>
        </ul>
        <a href="https://app.growai.com.ar" target="_blank" rel="noopener noreferrer"
           class="mt-auto block text-center bg-green text-bg-deep font-bold py-3 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.35)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.5)] transition">
          Suscribirse
        </a>
      </div>
    </div>

    <!-- Todos los planes incluyen -->
    <div class="reveal rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6"
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

- [ ] **Paso 2: Verificar**

2 cards de planes en dark, badge "MÁS POPULAR" sobre Pro, fila de 4 beneficios abajo. Sin fondo blanco.

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: seccion planes en dark con cards basico y pro"
```

---

## Task 10: CTA Final + Contacto + Footer

**Files:**
- Modify: `index.html` — reemplazar `<!-- CTA FINAL + CONTACTO -->`

- [ ] **Paso 1: Insertar HTML**

Reemplazar `<!-- CTA FINAL + CONTACTO -->` con:

```html
<!-- CTA Final -->
<section class="py-28 relative overflow-hidden bg-section-b">
  <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div class="w-96 h-96 rounded-full" style="background:radial-gradient(circle,rgba(76,175,80,0.06),transparent 70%);"></div>
  </div>
  <div class="relative max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-6">
    <p class="eyebrow reveal">Empezá hoy</p>
    <h2 class="reveal reveal-delay-1 text-3xl sm:text-5xl font-black tracking-tight text-text-main leading-tight">
      Todo lo que necesitás<br>para cultivar mejor
    </h2>
    <p class="reveal reveal-delay-2 text-text-main/45 text-base leading-relaxed">
      App web para cualquier dispositivo · Sin instalación · Siempre actualizada
    </p>
    <div class="reveal reveal-delay-3">
      <a href="https://app.growai.com.ar"
         target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 bg-green text-bg-deep font-black px-10 py-4 rounded-full text-lg shadow-[0_8px_32px_rgba(76,175,80,0.4)] hover:shadow-[0_12px_40px_rgba(76,175,80,0.55)] hover:-translate-y-1 transition">
        Abrir GrowAI →
      </a>
    </div>
    <p class="text-xs text-text-main/25">app.growai.com.ar</p>
  </div>
</section>

<!-- Contacto -->
<section id="contacto" class="py-20 bg-section-a">
  <div class="max-w-4xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-12 items-start">
      <!-- Copy -->
      <div class="flex flex-col gap-4">
        <p class="eyebrow reveal">Contacto</p>
        <h2 class="reveal reveal-delay-1 text-2xl sm:text-3xl font-black text-text-main">¿Tenés alguna consulta?</h2>
        <p class="reveal reveal-delay-2 text-text-main/50 text-sm leading-relaxed">
          Completá el formulario y te respondemos. También podés escribirnos si querés saber más sobre inversiones, alianzas o prensa.
        </p>
      </div>
      <!-- Formulario -->
      <form id="contact-form" class="reveal reveal-delay-1 flex flex-col gap-4" novalidate>
        <div>
          <label for="name" class="block text-xs font-semibold text-text-main/60 mb-1.5">Nombre completo</label>
          <input type="text" id="name" name="name" required placeholder="Tu nombre"
                 class="w-full rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-main/25 focus:outline-none transition"
                 style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);"
                 onfocus="this.style.borderColor='rgba(76,175,80,0.4)';this.style.boxShadow='0 0 0 3px rgba(76,175,80,0.1)'"
                 onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'" />
        </div>
        <div>
          <label for="email" class="block text-xs font-semibold text-text-main/60 mb-1.5">Correo electrónico</label>
          <input type="email" id="email" name="email" required placeholder="vos@ejemplo.com"
                 class="w-full rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-main/25 focus:outline-none transition"
                 style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);"
                 onfocus="this.style.borderColor='rgba(76,175,80,0.4)';this.style.boxShadow='0 0 0 3px rgba(76,175,80,0.1)'"
                 onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'" />
        </div>
        <div>
          <label for="interest" class="block text-xs font-semibold text-text-main/60 mb-1.5">Interés principal</label>
          <select id="interest" name="interest" required
                  class="w-full rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none transition appearance-none"
                  style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);"
                  onfocus="this.style.borderColor='rgba(76,175,80,0.4)';this.style.boxShadow='0 0 0 3px rgba(76,175,80,0.1)'"
                  onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"
                  onchange="toggleOtherDescription(this.value)">
            <option value="">Seleccioná una opción</option>
            <option value="cultivador">Soy cultivador</option>
            <option value="negocio">Represento un club/cannabis room</option>
            <option value="inversion">Me interesa invertir</option>
            <option value="alianza">Busco alianzas comerciales</option>
            <option value="prensa">Prensa / medios</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div id="other-description-container" class="hidden">
          <label for="other-description" class="block text-xs font-semibold text-text-main/60 mb-1.5">Describí tu interés</label>
          <textarea id="other-description" name="other_description" rows="2" placeholder="Contanos..."
                    class="w-full rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-main/25 focus:outline-none resize-none transition"
                    style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);"
                    onfocus="this.style.borderColor='rgba(76,175,80,0.4)';this.style.boxShadow='0 0 0 3px rgba(76,175,80,0.1)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
        </div>
        <div>
          <label for="message" class="block text-xs font-semibold text-text-main/60 mb-1.5">Mensaje</label>
          <textarea id="message" name="message" rows="3" placeholder="Tu consulta..."
                    class="w-full rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-main/25 focus:outline-none resize-none transition"
                    style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);"
                    onfocus="this.style.borderColor='rgba(76,175,80,0.4)';this.style.boxShadow='0 0 0 3px rgba(76,175,80,0.1)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
        </div>
        <div id="form-message" class="hidden text-sm rounded-xl px-4 py-3"></div>
        <button type="submit" id="contact-submit"
                class="w-full bg-green text-bg-deep font-bold py-3.5 rounded-full text-sm shadow-[0_4px_20px_rgba(76,175,80,0.3)] hover:shadow-[0_6px_28px_rgba(76,175,80,0.45)] hover:-translate-y-0.5 transition">
          Enviar mensaje
        </button>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="py-10 border-t" style="border-color:rgba(76,175,80,0.08);">
  <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-md flex items-center justify-center text-sm"
           style="background:linear-gradient(135deg,#4CAF50,#2d4a1e);">🌿</div>
      <span class="font-black text-text-main/70 text-sm">GrowAI</span>
    </div>
    <div class="flex gap-6">
      <a href="#funciones"  class="text-xs text-text-main/30 hover:text-text-main/60 transition">Funciones</a>
      <a href="#planes"     class="text-xs text-text-main/30 hover:text-text-main/60 transition">Planes</a>
      <a href="#contacto"   class="text-xs text-text-main/30 hover:text-text-main/60 transition">Contacto</a>
    </div>
    <p class="text-xs text-text-main/20">© 2026 GrowAI · Argentina</p>
  </div>
</footer>
```

- [ ] **Paso 2: Añadir JS del formulario al bloque `<script>` global**

Agregar al script:

```javascript
// ── EmailJS Contact Form ──
const EMAILJS_PUBLIC_KEY   = 'tTEucjRzFoBdNc2U3';
const EMAILJS_SERVICE_ID   = 'service_1gaeqai';
const EMAILJS_TEMPLATE_ID  = 'template_l8awfeq';

function toggleOtherDescription(value) {
  const container = document.getElementById('other-description-container');
  if (container) container.classList.toggle('hidden', value !== 'otro');
}

const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const submitBtn   = document.getElementById('contact-submit');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const data = {
      name:              document.getElementById('name').value.trim(),
      email:             document.getElementById('email').value.trim(),
      interest:          document.getElementById('interest').value,
      other_description: document.getElementById('other-description')?.value.trim() || '',
      message:           document.getElementById('message').value.trim(),
    };

    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
      formMessage.textContent = '¡Mensaje enviado! Te respondemos pronto.';
      formMessage.className = 'text-sm rounded-xl px-4 py-3 text-green-soft';
      formMessage.style.cssText = 'background:rgba(76,175,80,0.08);border:1px solid rgba(76,175,80,0.2);';
      formMessage.classList.remove('hidden');
      contactForm.reset();
    } catch (err) {
      formMessage.textContent = 'Hubo un error al enviar. Intentá de nuevo.';
      formMessage.className = 'text-sm rounded-xl px-4 py-3';
      formMessage.style.cssText = 'background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);color:#ff6b6b;';
      formMessage.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  });
}
```

- [ ] **Paso 3: Verificar**

CTA final visible con botón grande verde. Formulario de contacto completo con campos. Footer con links. Probar envío de formulario en navegador.

- [ ] **Paso 4: Commit**

```bash
git add index.html
git commit -m "feat: CTA final, contacto con EmailJS y footer"
```

---

## Task 11: IntersectionObserver Global — Reveal Animaciones

**Files:**
- Modify: `index.html` — añadir al bloque `<script>` global

- [ ] **Paso 1: Añadir el observer al inicio del script (antes de los demás JS)**

Insertar como primer bloque dentro del `<script>`:

```javascript
// ── Reveal on scroll (IntersectionObserver) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Parallax suave en orbes ──
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
}
```

- [ ] **Paso 2: Verificar todas las secciones**

Hacer scroll completo por la página. Cada sección debe aparecer con fade + slide suave. Las cards de Funciones deben aparecer en cascada (stagger via `reveal-delay-*`).

- [ ] **Paso 3: Commit**

```bash
git add index.html
git commit -m "feat: IntersectionObserver global para reveal animaciones"
```

---

## Task 12: Revisión Final + Padding navbar

**Files:**
- Modify: `index.html` — ajustes finales

- [ ] **Paso 1: Verificar padding-top en hero**

El navbar fijo es `h-16` (64px). El hero ya tiene `pt-16`. Confirmar que el scroll indicator no queda tapado por el navbar en ninguna resolución.

- [ ] **Paso 2: Verificar mobile completo**

Redimensionar navegador a 375px. Verificar:
- Texto del hero legible y no desbordado
- Botones apilados verticalmente
- Grids de 2 cols colapsan a 1 col
- Drawer funciona y cierra con links
- Mock de chat visible sin overflow

- [ ] **Paso 3: Verificar links del navbar**

Hacer click en cada link del navbar: Funciones → `#funciones`, Sensei → `#sensei`, REPROCANN → `#reprocann`, Planes → `#planes`. Todos deben hacer scroll correcto.

- [ ] **Paso 4: Commit final**

```bash
git add index.html
git commit -m "feat: rediseno completo GrowAI - 9 secciones botanico premium"
```

---

## Self-Review

**Spec coverage:**
| Requisito del spec | Task que lo implementa |
|--------------------|------------------------|
| Navbar con "Abrir app" → PWA | Task 2 |
| Hero fullscreen narrativo | Task 3 |
| El Problema (sección nueva) | Task 4 |
| Las 3 Funciones overview con stagger | Task 5 |
| Mis Cultivos sección propia | Task 6 |
| Sensei con mock chat animado | Task 7 |
| REPROCANN con stepper | Task 8 |
| Planes en dark | Task 9 |
| CTA final + contacto EmailJS + footer | Task 10 |
| IntersectionObserver reveal | Task 11 |
| Partículas CSS en hero | Task 3 |
| Parallax suave | Task 11 |
| Mobile drawer | Task 2 |
| "App web para cualquier dispositivo" | Tasks 3, 10 |
| PWA URL en todos los CTAs | Tasks 2–10 |
| EmailJS IDs reales | Task 10 |
| `plant-life-hero.js` no referenciado | Task 1 |

**Gaps:** Ninguno encontrado.

**Tipos/nombres consistentes:**
- `#contact-form`, `#form-message`, `#contact-submit` — consistentes entre HTML (Task 10) y JS (Task 10)
- `#chat-messages`, `#typing-indicator` — consistentes entre HTML (Task 7) y JS (Task 7)
- `#mobile-drawer`, `#drawer-overlay`, `#drawer-panel` — consistentes entre HTML (Task 2) y JS (Task 2)
- Clases `.reveal`, `.reveal-delay-1/2/3`, `.visible` — definidas en Task 1, usadas en Tasks 3–10, activadas en Task 11
