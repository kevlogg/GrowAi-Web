///////// VERLET.JS (GrowAi hero — canvas embebido) /////////

////---INITIATION---////

var canvasContainerDiv = document.getElementById("hero-canvas-container");
var canvas = document.getElementById("hero-plant-canvas");
var ctx = canvas && canvas.getContext("2d");
var canvRatio = 1;

var points = [],
  pointCount = 0;
var spans = [],
  spanCount = 0;
var skins = [],
  skinCount = 0;
var worldTime = 0;

var gravity = 0.01;
var rigidity = 10;
var friction = 0.999;
var bounceLoss = 0.9;
var skidLoss = 0.8;
var viewPoints = false;
var viewSpans = false;
var viewScaffolding = false;
var viewSkins = true;
var breeze = 0.4;

function Point(current_x, current_y, materiality = "material") {
  this.cx = current_x;
  this.cy = current_y;
  this.px = this.cx;
  this.py = this.cy;
  this.mass = 1;
  this.materiality = materiality;
  this.fixed = false;
  this.id = pointCount;
  pointCount += 1;
}

function Span(point_1, point_2, visibility = "visible") {
  this.p1 = point_1;
  this.p2 = point_2;
  this.l = distance(this.p1, this.p2);
  this.strength = 1;
  this.visibility = visibility;
  this.id = spanCount;
  spanCount += 1;
}

function Skin(points_array, color) {
  this.points = points_array;
  this.color = color;
  this.id = skinCount;
  skinCount += 1;
}

function scaleToWindow() {
  if (!canvasContainerDiv || !canvas) return;
  var w = Math.floor(canvasContainerDiv.getBoundingClientRect().width);
  if (w < 1) return;
  canvasContainerDiv.style.width = w + "px";
  canvasContainerDiv.style.height = w + "px";
}

function xValFromPct(percent) {
  return (percent * canvas.width) / 100;
}

function yValFromPct(percent) {
  return (percent * canvas.height) / 100;
}

function pctFromXVal(xValue) {
  return (xValue * 100) / canvas.width;
}

function pctFromYVal(yValue) {
  return (yValue * 100) / canvas.height;
}

function getPt(id) {
  for (var i = 0; i < points.length; i++) {
    if (points[i].id == id) {
      return points[i];
    }
  }
}

function distance(point_1, point_2) {
  var x_difference = point_2.cx - point_1.cx;
  var y_difference = point_2.cy - point_1.cy;
  return Math.sqrt(x_difference * x_difference + y_difference * y_difference);
}

function smp(span) {
  var mx = (span.p1.cx + span.p2.cx) / 2;
  var my = (span.p1.cy + span.p2.cy) / 2;
  return { x: mx, y: my };
}

function removeSpan(id) {
  for (var i = 0; i < spans.length; i++) {
    if (spans[i].id === id) {
      spans.splice(i, 1);
      break;
    }
  }
}

function addPt(xPercent, yPercent, materiality = "material") {
  points.push(new Point(xValFromPct(xPercent), yValFromPct(yPercent), materiality));
  return points[points.length - 1];
}

function addSp(p1, p2, visibility = "visible") {
  spans.push(new Span(getPt(p1), getPt(p2), visibility));
  return spans[spans.length - 1];
}

function addSk(id_path_array, color) {
  var points_array = [];
  for (var i = 0; i < id_path_array.length; i++) {
    points_array.push(points[id_path_array[i]]);
  }
  skins.push(new Skin(points_array, color));
  return skins[skins.length - 1];
}

function updatePoints() {
  if (!canvas) return;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    if (!p.fixed) {
      var xv = (p.cx - p.px) * friction;
      var yv = (p.cy - p.py) * friction;
      if (p.py >= canvas.height - 1 && p.py <= canvas.height) {
        xv *= skidLoss;
      }
      p.px = p.cx;
      p.py = p.cy;
      p.cx += xv;
      p.cy += yv;
      p.cy += gravity * p.mass;
      if (worldTime % Tl.rib(100, 200) === 0) {
        p.cx += Tl.rfb(-breeze, breeze);
      }
    }
  }
}

function applyConstraints(currentIteration) {
  if (!canvas) return;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    if (p.materiality === "material") {
      if (p.cx > canvas.width) {
        p.cx = canvas.width;
        p.px = p.cx + (p.cx - p.px) * bounceLoss;
      }
      if (p.cx < 0) {
        p.cx = 0;
        p.px = p.cx + (p.cx - p.px) * bounceLoss;
      }
      if (p.cy > canvas.height) {
        p.cy = canvas.height;
        p.py = p.cy + (p.cy - p.py) * bounceLoss;
      }
      if (p.cy < 0) {
        p.cy = 0;
        p.py = p.cy + (p.cy - p.py) * bounceLoss;
      }
    }
  }
}

function updateSpans(currentIteration) {
  for (var i = 0; i < spans.length; i++) {
    var strength = spans[i].rigidity != null ? spans[i].rigidity : spans[i].strength;
    var thisSpanIterations = Math.round(rigidity * strength);
    if (currentIteration + 1 <= thisSpanIterations) {
      var s = spans[i];
      var dx = s.p2.cx - s.p1.cx;
      var dy = s.p2.cy - s.p1.cy;
      var d = Math.sqrt(dx * dx + dy * dy);
      var r = s.l / d;
      var mx = s.p1.cx + dx / 2;
      var my = s.p1.cy + dy / 2;
      var ox = (dx / 2) * r;
      var oy = (dy / 2) * r;
      if (!s.p1.fixed) {
        s.p1.cx = mx - ox;
        s.p1.cy = my - oy;
      }
      if (!s.p2.fixed) {
        s.p2.cx = mx + ox;
        s.p2.cy = my + oy;
      }
    }
  }
}

function refinePositions() {
  var requiredIterations = rigidity;
  for (var i = 0; i < spans.length; i++) {
    var strength = spans[i].rigidity != null ? spans[i].rigidity : spans[i].strength;
    var thisSpanIterations = Math.round(rigidity * strength);
    if (thisSpanIterations > requiredIterations) {
      requiredIterations = thisSpanIterations;
    }
  }
  for (var j = 0; j < requiredIterations; j++) {
    updateSpans(j);
    applyConstraints(j);
  }
}

function renderPoints() {
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.arc(p.cx, p.cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSpans() {
  for (var i = 0; i < spans.length; i++) {
    var s = spans[i];
    if (s.visibility == "visible") {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "blue";
      ctx.moveTo(s.p1.cx, s.p1.cy);
      ctx.lineTo(s.p2.cx, s.p2.cy);
      ctx.stroke();
    }
  }
}

function renderScaffolding() {
  ctx.beginPath();
  for (var i = 0; i < spans.length; i++) {
    var s = spans[i];
    if (s.visibility === "hidden") {
      ctx.strokeStyle = "pink";
      ctx.moveTo(s.p1.cx, s.p1.cy);
      ctx.lineTo(s.p2.cx, s.p2.cy);
    }
  }
  ctx.stroke();
}

function renderSkins() {
  for (var i = 0; i < skins.length; i++) {
    var s = skins[i];
    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 0;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = s.color;
    ctx.moveTo(s.points[0].cx, s.points[0].cy);
    for (var j = 1; j < s.points.length; j++) {
      ctx.lineTo(s.points[j].cx, s.points[j].cy);
    }
    ctx.lineTo(s.points[0].cx, s.points[0].cy);
    ctx.stroke();
    ctx.fill();
  }
}

function clearCanvas() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function renderImages() {
  if (viewSpans) {
    renderSpans();
  }
  if (viewPoints) {
    renderPoints();
  }
  if (viewScaffolding) {
    renderScaffolding();
  }
}

window.addEventListener("resize", scaleToWindow);

function runVerlet() {
  if (!canvas || !ctx) return;
  scaleToWindow();
  updatePoints();
  refinePositions();
  clearCanvas();
  renderImages();
  worldTime++;
}
