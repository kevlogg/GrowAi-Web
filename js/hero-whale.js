/**
 * Estela de capas SVG (hoja) siguiendo el puntero sobre el cuadro del hero.
 * pointerdown + pointermove en fase capture (mouse y táctil).
 */
(function () {
  var container = document.getElementById("hero-canvas-container");
  var element = document.getElementById("whale");
  if (!container || !element) return;

  var width = 1;
  var height = 1;
  var fps = 30;
  var easy = 6;
  var maxspeed = 150;
  var delay = 15;
  var mouse = { x: 0, y: 0 };
  var defs = "";
  var loopTimer = null;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var LEAF_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M512,355.975c0,0-63.51-36.67-141.855-36.67c-4.201,0-8.357,0.111-12.465,0.311c6.563-5.331,13.04-11.11,19.306-17.376 c55.397-55.397,73.175-127.438,73.175-127.438s-72.039,17.778-127.438,73.175c-9.876,9.876-18.55,20.281-26.146,30.712 c4.113-23.396,6.817-48.943,6.817-75.706C303.393,90.879,256,0,256,0s-47.393,90.879-47.393,202.984c0,26.763,2.705,52.311,6.817,75.706c-7.598-10.431 16.272-20.836-26.146 30.712C133.879,192.58,61.84,174.802,61.84,174.802 s17.778,72.041,73.175,127.438c6.265,6.265,12.743,12.044,19.306,17.376c-4.108-0.199-8.264-0.311-12.465-0.311 C63.51,319.304,0,355.975,0,355.975s63.51,36.67,141.855,36.67c17.394,0,34.049-1.813,49.447-4.626 c-0.612,0.589-1.221,1.183-1.825,1.788c-36.786,36.786-44.286,88.929-44.286,88.929s52.143-7.5,88.929-44.286 c1.804-1.804,3.519-3.653,5.185-5.523V512h33.391v-83.072c1.665,1.87,3.38,3.719,5.185,5.523 c36.786,36.786,88.929,44.286,88.929,44.286s-7.5-52.143-44.286-88.929c-0.604-0.604-1.213-1.2-1.825-1.788 c15.398,2.813,32.053,4.626,49.447,4.626C448.49,392.645,512,355.975,512,355.975z"/></g></svg>';

  var parts = [];
  var z;
  for (z = 19; z >= 0; z--) {
    parts.push({ x: 0, y: 0, z: z, data: LEAF_SVG });
  }

  function whaleShouldRun() {
    if (reduced.matches) return false;
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (vw < 768) return false;
    var aside = container.closest(".hero-inicio-bulb");
    if (aside) {
      var ast = window.getComputedStyle(aside);
      if (ast.display === "none") return false;
    }
    return true;
  }

  function syncDimensions() {
    width = container.clientWidth || 1;
    height = container.clientHeight || 1;
  }

  function centerTrail() {
    mouse.x = width / 2;
    mouse.y = height / 2;
    var i;
    for (i = 0; i < parts.length; i++) {
      parts[i].x = mouse.x;
      parts[i].y = mouse.y;
    }
  }

  function updatePointerFromEvent(e) {
    var r = container.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    ) {
      return;
    }
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }

  function loop() {
    var i;
    for (i = 0; i < parts.length; i++) {
      var params = { mouse: mouse, part: parts[i] };
      setTimeout(transform, parts[i].z * delay, params);
    }
    element.innerHTML = svg();
  }

  function svg() {
    var out =
      '<svg color-interpolation-filters="sRGB" style="fill-rule:evenodd;pointer-events:none;-moz-user-select:none;width:100%;height:100%;">';
    var i;
    for (i = 0; i < parts.length; i++) {
      out +=
        '<g transform="matrix(0.05 0 0 0.05 ' + parts[i].x + " " + parts[i].y + ')">';
      out += parts[i].data;
      out += "</g>";
    }
    out += defs;
    out += "</svg>";
    return out;
  }

  function transform(params) {
    params.part.x = definemaxspeed(params.mouse.x - params.part.x) / easy + params.part.x;
    params.part.y = definemaxspeed(params.mouse.y - params.part.y) / easy + params.part.y;
  }

  function definemaxspeed(speed) {
    if (speed > 0 && speed > maxspeed) return maxspeed;
    if (speed < 0 && speed < -maxspeed) return -maxspeed;
    return speed;
  }

  function startLoop() {
    if (loopTimer || !whaleShouldRun()) return;
    loopTimer = window.setInterval(loop, 1000 / fps);
  }

  function stopLoop() {
    if (loopTimer) {
      window.clearInterval(loopTimer);
      loopTimer = null;
    }
  }

  function syncAndMaybeRestart() {
    stopLoop();
    if (!whaleShouldRun()) return;
    syncDimensions();
    centerTrail();
    startLoop();
    element.innerHTML = svg();
  }

  function boot() {
    if (reduced.matches) return;
    syncDimensions();
    centerTrail();
    document.addEventListener("pointermove", updatePointerFromEvent, true);
    document.addEventListener("pointerdown", updatePointerFromEvent, true);
    var ro = new ResizeObserver(syncAndMaybeRestart);
    ro.observe(container);
    if (typeof IntersectionObserver !== "undefined") {
      var io = new IntersectionObserver(
        function (entries) {
          var k;
          for (k = 0; k < entries.length; k++) {
            if (entries[k].isIntersecting) {
              syncAndMaybeRestart();
              return;
            }
          }
          stopLoop();
        },
        { root: null, rootMargin: "80px", threshold: 0 }
      );
      io.observe(container);
    }
    reduced.addEventListener("change", syncAndMaybeRestart);
    requestAnimationFrame(function () {
      requestAnimationFrame(syncAndMaybeRestart);
    });
    element.innerHTML = svg();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
