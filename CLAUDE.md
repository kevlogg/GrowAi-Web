# CLAUDE.md — GrowAi Web (Landing Page)

Guía de colaboración para Claude Code en este proyecto.

---

## Proyecto

**Landing page estática** para GrowAi, una app de cultivo de cannabis asistida por IA.
Sin framework ni build step — HTML + CSS inline (Tailwind CDN) + JS vanilla.

**URL producción:** `https://growai.com.ar`
**App (producto):** `https://app.growai.com.ar`

---

## Estructura de archivos

```
index.html              → todo el sitio: HTML + <style> + <script>
js/
  plant-life-hero.js    → animación Verlet de plantas en el hero
icono/
  favicon.png           → favicon y og:image
videos/
  cogollo-girando.mp4   → video decorativo en sección Funciones
  LEEME.txt             → nota sobre mix-blend-mode: screen del video
```

No hay carpeta `src/`, módulos npm, ni proceso de build.

---

## Secciones del sitio

| Ancla | Descripción |
|-------|-------------|
| `#inicio` | Hero con animación de planta + formulario de waitlist |
| `#funciones` | Scroll horizontal (GSAP pin) con cards de funcionalidades |
| `#sensei` | Sección del asistente IA Sensei |
| `#planes` | Cards de planes de suscripción |
| `#descargar` | CTA de descarga de la app |
| `#contacto` | Formulario de contacto |

---

## Dependencias externas (CDN)

Todas las librerías se cargan desde CDN — no hay `package.json`.

| Librería | Versión | Uso |
|----------|---------|-----|
| Tailwind CSS | CDN | estilos de utilidad |
| GSAP + ScrollTrigger | 3.12.5 | pin horizontal de la sección Funciones |
| EmailJS Browser | 4.x | envío de formulario de contacto |
| Google Fonts | — | fuente Inter (400, 500, 600, 700) |

---

## Animación del hero (`plant-life-hero.js`)

Simulación física Verlet de plantas creciendo. Puntos clave:

- Se activa/desactiva con el toggle `#hero-bulb-switch` (switch ON/OFF en el hero)
- Al apagar: las plantas hacen reverse lerp hacia su estado semilla y desaparecen
- El canvas es transparente — las plantas aparecen sobre el SVG del foco
- `growAiPlantLifeBoot()` es el entry point; se llama en `DOMContentLoaded`
- Ajustar física: `gravity`, `breeze`, `rigidity`, `friction` en la sección VERLET del JS
- Ajustar plantas: `maxTotalSegments`, `maxSegmentWidth`, `forwardGrowthRate` en el constructor `Plant`

---

## EmailJS (formulario de contacto)

Las credenciales están hardcodeadas en `index.html` al final del archivo:

```js
const EMAILJS_PUBLIC_KEY = '...';   // Public Key de EmailJS
const EMAILJS_SERVICE_ID = '...';   // Service ID de Gmail
const EMAILJS_TEMPLATE_ID = '...';  // Template ID del formulario
```

Para cambiar la cuenta: reemplazar las tres constantes.

---

## Video de la sección Funciones

- Archivo: `videos/cogollo-girando.mp4`
- Tiene fondo negro; la página aplica `mix-blend-mode: screen` para que el negro se funda con `#1B0F2A`
- También se sirve desde jsDelivr (CDN de GitHub) como fallback:
  `https://cdn.jsdelivr.net/gh/kevlogg/GrowAi-Web@main/videos/cogollo-girando.mp4`

---

## Paleta de colores

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#1B0F2A` | fondo oscuro principal |
| `secondary` | `#2A1F3A` | fondo oscuro secundario |
| `accent` | `#8B6ED0` | violeta, CTAs, énfasis |
| `textPrimary` | `#C9C3FF` | texto claro sobre fondos oscuros |

Las secciones alternan claro/oscuro. El patrón de override de Tailwind usa selectores CSS específicos por `section[id="..."]` dentro del `<style>` del `<head>`.

---

## Convenciones de código

- **No hay build:** editar `index.html` directamente; los cambios se ven abriendo el archivo en el browser.
- **Tailwind CDN:** no se puede usar `@apply` ni purge — todas las clases deben existir en el HTML.
- **Overrides de color:** van en el bloque `<style>` del head, organizados por sección. No agregar estilos inline en el HTML.
- **JS al final:** los scripts de GSAP, EmailJS y los scripts propios están al final del `<body>`.
- **Custom elements:** `<light-bulb>` y `<toggle-switch>` son HTML custom elements sin definición formal — funcionan como contenedores semánticos para CSS.

---

## No hacer

- No agregar `package.json`, bundler, ni proceso de build sin necesidad real
- No mover el CSS del `<style>` a un archivo externo (aumenta round-trips sin ganancia)
- No cambiar el `mix-blend-mode` del video sin verificar que el fondo siga siendo `#1B0F2A`
- No usar `scroll-behavior: smooth` en `html`/`body` — rompe los cálculos de GSAP ScrollTrigger
