# GrowAI — Rediseño Completo de Landing Page

**Fecha:** 2026-04-16  
**Enfoque:** Reescritura completa de `index.html` (Enfoque A)  
**Stack:** HTML + Tailwind CSS (CDN) + JS vanilla + EmailJS (sin cambios de stack)

---

## Contexto del producto

GrowAI es una app web progresiva (PWA) argentina para el cultivo de cannabis. Accesible desde cualquier dispositivo vía `https://app.growai.com.ar`. Sus tres pilares funcionales son:

- **Mis Cultivos** — Registro, seguimiento y exportación en PDF de ciclos de cultivo
- **Sensei** — Asistente IA por chat/foto para diagnóstico de problemas de cultivo
- **REPROCANN** — Guía paso a paso para el trámite del Registro del Programa de Cannabis de Argentina

Planes: **Básico** ($7.990/mes · 10 chats Sensei · 5 cultivos) y **Pro** ($19.990/mes · todo ilimitado).

---

## Decisiones de diseño

### Estilo visual
- **Dirección:** Botánico Premium — verdes profundos + púrpura oscuro, naturaleza + tecnología
- **Fondo base:** Degradé entre `#060e07` (deep forest), `#0d1f0f` (forest dark) y `#1B0F2A` (purple base actual)
- **Acento primario:** `#4CAF50` (verde IA) — botones CTA, highlights, iconos principales
- **Acento secundario:** `#8B6ED0` (púrpura actual) — Sensei exclusivamente
- **Texto principal:** `#f0fdf4` (blanco verdoso suave)
- **Texto secundario:** `rgba(240,253,244,0.55–0.70)`
- **Eyebrow labels:** `#4CAF50`, uppercase, letter-spacing 3px
- **Tipografía:** Inter (actual), pesos 400/600/700/900

### Paleta completa
| Token | Color | Uso |
|-------|-------|-----|
| `--c-bg-deep` | `#060e07` | Fondo más oscuro, hero |
| `--c-bg-forest` | `#0d1f0f` | Fondo medio |
| `--c-bg-purple` | `#1B0F2A` | Fondo púrpura (actual) |
| `--c-green` | `#4CAF50` | CTA, acento principal |
| `--c-green-soft` | `#81c784` | Texto verde suave |
| `--c-purple` | `#8B6ED0` | Sensei, acento secundario |
| `--c-text` | `#f0fdf4` | Texto principal |

### Animaciones — Scroll Storytelling + Suave & Elegante
- **Reveal on scroll:** fade-in + `translateY(24px)` → `translateY(0)` al cruzar el 80% del viewport. Duración 0.7s, `cubic-bezier(0.16, 1, 0.3, 1)`. Implementado con `IntersectionObserver` (sin GSAP obligatorio).
- **Stagger en cards:** Las 3 cards de Funciones aparecen en cascada con 120ms de delay entre cada una.
- **Partículas en Hero:** Puntos flotantes verde/lavanda de movimiento lento. CSS keyframes puro, sin canvas pesado.
- **Navbar:** Fondo transparente → `backdrop-blur` + borde sutil al hacer scroll (threshold 60px).
- **Mock chat de Sensei:** Mensajes aparecen secuencialmente con `setTimeout` al entrar en viewport (typewriter suave).
- **Parallax suave:** Orbes de fondo se mueven al 20–30% de la velocidad de scroll via `requestAnimationFrame`.

---

## Estructura de secciones

### 1. Navbar (fija)
- Logo (icono 🌿 + "GrowAI"), links de navegación, botón **"Abrir app"** → `https://app.growai.com.ar`
- Fondo: transparente sobre hero, `#060e07/90` + `backdrop-blur` al hacer scroll
- Mobile: hamburger → drawer lateral

### 2. Hero — Fullscreen Narrativo
- Pantalla completa (`100svh`), fondo `linear-gradient(160deg, #060e07, #0d1f0f, #1B0F2A)`
- Contenido centrado verticalmente: eyebrow label → H1 → subtítulo → 2 CTAs
- **CTA primario:** "Abrir GrowAI →" → `https://app.growai.com.ar` (PWA)
- **CTA secundario:** "Ver funciones" → `#funciones`
- Partículas flotantes CSS en el fondo
- Orbe de luz verde (`radial-gradient`) en esquina superior derecha
- Scroll indicator animado (flecha + línea) en la parte inferior centrado
- Texto: "App web para cualquier dispositivo" (no mencionar Android exclusivamente)

### 3. El Problema *(sección nueva)*
- Eyebrow: "El desafío"
- H2: "Cultivar sin guía es frustrante y solitario"
- 3 cards oscuras en grid: Sin diagnóstico · Sin registro · Sin tramitar
- Línea final: "GrowAI resuelve los tres." — fade in con delay
- Transición fluida al verde/bosque de la siguiente sección

### 4. Las 3 Funciones — Overview
- Eyebrow: "Funciones"
- H2: "Tres pilares. Una sola app."
- 3 cards verticales con stagger (no scroll horizontal):
  - 🌱 **Mis Cultivos** — verde acento
  - 🤖 **Sensei IA** — púrpura acento
  - 📋 **REPROCANN** — verde acento
- Cada card es clickeable/scroll-anchor a su sección dedicada

### 5. Mis Cultivos *(sección propia)*
- Layout 2 columnas (mobile: 1 col): texto izquierda · visual derecha
- Texto: qué es, qué resuelve, qué incluye (lista de bullets)
- Visual: mock de pantalla de la app mostrando una planta registrada (puede ser un div estilizado que simule la UI de la app)
- Highlights: registro por etapa, historial completo, exportar PDF, hasta 5 cultivos en Basic / ilimitados en Pro

### 6. Sensei en detalle
- Layout 2 columnas: texto izquierda · mock chat derecha
- Mock chat: 2 turnos de conversación visibles + typing indicator animado al entrar en viewport
- Acento en púrpura (`#8B6ED0`) para diferenciar del verde general
- CTA: "Probar Sensei →" → `https://app.growai.com.ar`

### 7. REPROCANN *(sección propia)*
- Fondo ligeramente diferenciado (más oscuro, borde sutil verde)
- Eyebrow: "REPROCANN"
- H2: "Tu trámite, sin vueltas"
- Stepper vertical: 3 pasos numerados con línea conectora animada al hacer scroll
- Paso 1: Creá tu cuenta · Paso 2: Completá tu perfil · Paso 3: Enviá y hacé seguimiento

### 8. Planes
- Fondo dark, sin el blanco actual que rompe la paleta
- 2 columnas: Básico | Pro (destacado con borde verde + badge "MÁS POPULAR")
- Precios en `#f0fdf4`, sin la fuente verde del plan básico anterior
- Sección "Todos los planes incluyen" como fila de 4 iconos debajo de los cards
- CTAs de planes → `https://app.growai.com.ar`

### 9. CTA Final + Contacto
- **CTA Final:** bloque hero-like centrado, H2 grande, botón "Abrir GrowAI →" prominente, texto "App web para cualquier dispositivo · `app.growai.com.ar`"
- **Contacto:** grid 2 columnas: copy izquierda · formulario derecha (minimalista, dark). EmailJS igual que el actual.
- Footer mínimo debajo: logo + links + copyright

---

## Consideraciones técnicas

### Qué se mantiene sin cambios
- `vercel.json` — sin tocar
- `videos/cogo.mp4` y `videos/cogollo-girando.mp4` — disponibles, pueden usarse en alguna sección si el diseño lo amerita
- `icono/favicon.png` — sin tocar
- `js/plant-life-hero.js` — **deprecado**. El nuevo hero usa partículas CSS puras, sin canvas. El archivo queda en el repo pero no se referencia en el nuevo HTML.
- EmailJS (`@emailjs/browser@4`) — se mantiene el formulario de contacto
- Fuente Inter desde Google Fonts — se mantiene
- Tailwind CSS CDN — se mantiene

### Qué se reescribe
- `index.html` completo — nuevo desde cero con la nueva estructura
- Todo el CSS inline/embebido — reescrito limpio, sin overrides acumulados
- JS inline del scroll, navbar, menú mobile — reescrito modular dentro del mismo HTML

### PWA button
El botón "Abrir GrowAI" / "Abrir app" en navbar, hero, cada sección CTA y el bloque final apunta siempre a `https://app.growai.com.ar`. Es el único enlace externo de conversión.

### Mobile-first
Todas las secciones diseñadas mobile-first. Grids de 2 columnas en desktop → 1 columna en mobile. Navbar con drawer. Hero con scroll indicator visible en touch.

---

## Lo que NO entra en este rediseño
- Cambio de stack (no React, no framework)
- Sistema de autenticación
- Backend nuevo
- Cambio de dominio o hosting
- Internacionalización

---

## Criterios de éxito
- El sitio comunica los 3 pilares (Mis Cultivos, Sensei, REPROCANN) de forma clara y ordenada
- El botón de la PWA (`https://app.growai.com.ar`) es el CTA dominante en todo el sitio
- No se menciona "Android" exclusivamente — siempre "app web" o "cualquier dispositivo"
- Las animaciones no bloquean el primer render (no hay JS pesado en el critical path)
- El diseño es coherente de inicio a fin (sin secciones blancas que rompan la paleta dark)
