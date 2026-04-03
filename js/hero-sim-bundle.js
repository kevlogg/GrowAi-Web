

///////// TOOLS.JS /////////



var Tl = {


	//random integer between two numbers (min/max inclusive)
	rib: function( min, max ) {
 		return Math.floor( Math.random() * ( Math.floor(max) - Math.ceil(min) + 1 ) ) + Math.ceil(min);
	},

	//random float between two numbers
	rfb: function( min, max ) {
 		return Math.random() * ( max - min ) + min;
	},

	//converts radians to degrees
	radToDeg: function( radian ) {
	  return radian * 180 / Math.PI;
	},

	//converts degrees to radians
	degToRad: function( degree ) {
	  return degree / 180 * Math.PI;
	},

	//pauses program
	pause: function( milliseconds ) {
  	var then = Date.now(); 
  	var now;
  	do { now = Date.now() } while ( now - then < milliseconds );
	}


};

///////// VERLET.JS (GrowAi hero, canvas embebido) /////////

////---INITIATION---////

var canvasContainerDiv = null;
var canvas = null;
var ctx = null;

function ensureHeroCanvas2D() {
  if (!canvasContainerDiv) {
    canvasContainerDiv = document.getElementById("hero-canvas-container");
  }
  if (!canvas) {
    canvas = document.getElementById("hero-plant-canvas");
  }
  if (canvas && !ctx) {
    ctx = canvas.getContext("2d");
  }
  return ctx;
}
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
  // El tamaño lo fija el CSS (#hero-canvas-container aspect-ratio + width).
  // Forzar píxeles en cada frame rompía el layout en algunos navegadores/zoom.
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
      if (d < 1e-8) {
        continue;
      }
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
  ctx.fillStyle = "rgba(245, 240, 255, 0.97)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  if (!ensureHeroCanvas2D()) return;
  scaleToWindow();
  updatePoints();
  refinePositions();
  clearCanvas();
  renderImages();
  worldTime++;
}






///////////////////////////////////////////////////////////////// 
////////////     Plant Evolution App: Prototype 1     /////////// 
//////////////////////////////////////////////////?//////////////

//https://github.com/matthewmain/plant_evolution_app/tree/master/prototypes/prototype_1



////---INITIATION---////


///trackers
var plants = [], plantCount = 0;
var sunRays = [], sunRayCount = 0;
var shadows = [], shadowCount = 0;

///settings
var worldSpeed = 2;
var restrictGrowthByEnergy = false;
var viewShadows = false;  // (shadow visibility)
var phr = 2;  // photosynthesis rate ( rate plants store energy from sunlight )
var geer = 0.5;  // growth energy expenditure rate (rate energy is expended for growth)
var leer = 0.03;  // living energy expenditure rate (rate energy is expended for living, per segment)






////---OBJECTS---////


///plant constructor
function Plant( xLocation ) {
  this.id = plantCount;
  this.segments = []; this.segmentCount = 0;
  this.xLocation = xLocation;
  this.energy = 5000;  // seed energy (starting energy level at germination)
  this.isAlive = true;
  //settings
  this.forwardGrowthRate = gravity * Tl.rfb(18,22);  // (rate of cross spans increase per frame)
  this.outwardGrowthRate = this.forwardGrowthRate * Tl.rfb(0.18,0.22);  // (rate forward span widens per frame)
  this.maxSegmentWidth = Tl.rfb(11,13);  // maximum segment width (in pixels)
  this.maxTotalSegments = Tl.rib(10,20);  // maximum total number of segments
  this.firstLeafSegment = Tl.rib(2,4);  // (segment on which first leaf set grows)
  this.leafFrequency = Tl.rib(2,3);  // (number of segments until next leaf set)
  this.maxLeaflength = this.maxSegmentWidth * Tl.rfb(4,7);  // maximum leaf length at maturity
  this.leafGrowthRate = this.forwardGrowthRate * Tl.rfb(1.4,1.6);  // leaf growth rate
  //base segment
  this.ptB1 = addPt( this.xLocation - 0.1, 100 );  // base point 1
  this.ptB2 = addPt( this.xLocation + 0.1, 100 );  // base point 2
  this.ptB1.fixed = this.ptB2.fixed = true;  // fixes base points to ground
  this.spB = addSp( this.ptB1.id, this.ptB2.id );  // adds base span
  createSegment( this, null, this.ptB1, this.ptB2 );  // creates the base segment (with "null" parent)
}


///segment constructor
function Segment( plant, parentSegment, basePoint1, basePoint2 ) {
  this.plantId = plant.id;
  this.id = plant.segmentCount;
  this.childSegment = null;
  this.hasChildSegment = false;
  this.parentSegment = parentSegment;
  this.isBaseSegment = false; if (this.parentSegment === null) { this.isBaseSegment = true; }
  this.hasLeaves = false;
  this.hasLeafScaffolding = false;
  //settings
  this.forwardGrowthRateVariation = Tl.rfb(0.95,1.05);//(0.95,1.05);  // forward growth rate variation
  this.mass = 1;  // mass of the segment stalk portion ( divided between the two extension points)
  this.strength = 1.5;  // as multiple of global rigidity (higher values effect performance)
  //base points
  this.ptB1 = basePoint1;  // base point 1
  this.ptB2 = basePoint2;  // base point 2
  //extension points
  var originX = ( this.ptB1.cx + this.ptB2.cx ) / 2;  // center of base points x values
  var originY = ( this.ptB1.cy + this.ptB2.cy ) / 2;  // center of base points y values
  this.ptE1 = addPt( pctFromXVal( originX ) - 0.1, pctFromYVal( originY ) - 0.1 );  // extension point 1
  this.ptE2 = addPt( pctFromXVal( originX ) + 0.1, pctFromYVal( originY ) - 0.1 );  // extension point 2
  this.ptE1.mass = this.mass / 2;
  this.ptE2.mass = this.mass / 2;
  //spans
  this.spL = addSp( this.ptB1.id, this.ptE1.id );  // left span
  this.spR = addSp( this.ptB2.id, this.ptE2.id );  // right span
  this.spF = addSp( this.ptE1.id, this.ptE2.id );  // forward span
  this.spCd = addSp( this.ptE1.id, this.ptB2.id );  // downward (l to r) cross span
  this.spCu = addSp( this.ptB1.id, this.ptE2.id );  // new upward (l to r) cross span
  this.spL.rigidity = this.strength;
  this.spR.rigidity = this.strength;
  this.spF.rigidity = this.strength;
  this.spCd.rigidity = this.strength;
  this.spCu.rigidity = this.strength;
  //base segment
  if (!this.isBaseSegment) {
    this.spCdP = addSp( this.ptE1.id, this.parentSegment.ptB2.id ); // downward (l to r) cross span to parent
    this.spCuP = addSp( this.parentSegment.ptB1.id, this.ptE2.id ); // upward (l to r) cross span to parent
    this.spCdP.rigidity = this.strength;
    this.spCuP.rigidity = this.strength;
  }
  //leaves
  this.ptLf1 = null;  // leaf point 1 (leaf tip)
  this.ptLf2 = null;  // leaf point 2 (leaf tip)  
  this.spLf1 = null;  // leaf 1 Span
  this.spLf2 = null;  // leaf 2 Span
  //skins
  this.skins = [];
  this.skins.push( addSk( [ this.ptE1.id, this.ptE2.id, this.ptB2.id, this.ptB1.id ], "darkgreen" ) );
}

///sun ray constructor
function SunRay() {
  this.id = sunRayCount;
  this.x = xValFromPct( this.id );
  this.intensity = 1;
  this.leafContacts = [];  // (as array of objects: { y: <leaf contact y value>, plant: <plant> })
}

//shadow constructor
function Shadow( leafSpan ) {
  this.p1 = leafSpan.p1;
  this.p2 = leafSpan.p2;
  this.p3 = { cx: this.p2.cx, cy: yValFromPct( 100 ) };
  this.p4 = { cx: this.p1.cx, cy: yValFromPct( 100 ) };
}




////---FUNCTIONS---////


//creates a new plant
function createPlant() {
  plantCount++;
  plants.push( new Plant(Tl.rib(1,99)) );
}

///creates a new segment
function createSegment( plant, parentSegment, basePoint1, basePoint2 ) {
  plant.segmentCount++;
  plant.segments.unshift( new Segment( plant, parentSegment, basePoint1, basePoint2 ) );
  if (parentSegment !== null) {
    parentSegment.childSegment = plant.segments[plant.segments.length-1];
    parentSegment.hasChildSegment = true;
  }
}

///creates a new sun ray (one for each x value as an integer percentage of the canvas's width)
function createSunRays() {
  for ( var i=0; i<101; i++ ) {
    sunRays.push( new SunRay() );
    sunRayCount++;
  }
}

///gets each leaf span's y values at integer x values as points where sun rays contact leaf
function markRayLeafIntersections() {
  for ( var i=0; i<plants.length; i++ ) {
    var p = plants[i];
    for ( var j=0; j<p.segments.length; j++ ) {
      var s = p.segments[j];
      if ( s.hasLeaves ) {
        var p1, p2;
        //leaf 1
        //assigns p1 as leftmost leaf span point and p2 as rightmost leaf span point
        if ( s.ptLf1.cx < s.ptB1.cx ) { p1 = s.ptLf1; p2 = s.ptB1; } else { p1 = s.ptB1; p2 = s.ptLf1; }  
        //loops through leaf span's integer x values
        var xPctMin = Math.ceil( pctFromXVal( p1.cx ) );
        var xPctMax = Math.floor( pctFromXVal( p2.cx ) );
        for ( var lcx=xPctMin; lcx<=xPctMax; lcx++ ) {  // leaf contact x value
          var lcy = p1.cy + (xValFromPct(lcx)-p1.cx) * (p2.cy-p1.cy) / (p2.cx-p1.cx);  // leaf contact y value
          //pushes corresponding y value and plant instance to associated sun ray instance
          sunRays[lcx].leafContacts.push( { y: lcy, plant: p } );
        }
        //leaf 2
        if ( s.ptLf2.cx < s.ptB2.cx ) { p1 = s.ptLf2; p2 = s.ptB2; } else { p1 = s.ptB2; p2 = s.ptLf2; }
        xPctMin = Math.ceil( pctFromXVal( p1.cx ) );
        xPctMax = Math.floor( pctFromXVal( p2.cx ) );  
        for ( lcx=xPctMin; lcx<=xPctMax; lcx++ ) {  // leaf contact x value
          lcy = p1.cy + (xValFromPct(lcx)-p1.cx) * ( p2.cy - p1.cy) / ( p2.cx - p1.cx ); // leaf contact y value
          sunRays[lcx].leafContacts.push( { y: lcy, plant: p } );
        }
      }
    } 
  }
}

///transfers energy from sun rays to leaves
function photosynthesize() {
  for ( var i=0; i<sunRays.length; i++ ) {
    var sr = sunRays[i];  // sun ray  
    //sorts leaf contact points from highest to lowest elevation (increasing y value)
    sr.leafContacts.sort( function( a, b ) { return a.y - b.y } );
    //when a sun ray hits a leaf, transfers half of the ray's intensity to the plant as energy
    for ( var j=0; j<sr.leafContacts.length; j++) {
      var lc = sr.leafContacts[j];  // leaf contact ({ y: <leaf contact y value>, plant: <plant> })
      sr.intensity /= 2;  
      lc.plant.energy += sr.intensity * phr;
    }
    sr.leafContacts = []; sr.intensity = 1;  // resets sun ray's leaf contact points & intensity for next iteration
  }
}

///sheds sunlight
function shedSunlight() {
  markRayLeafIntersections();
  photosynthesize(); 
}

///marks shadow positions (based on leaf spans)
function markShadowPositions( segment ) {
  shadows.push( new Shadow( segment.spLf1 ) );
  shadows.push( new Shadow( segment.spLf2 ) );
}

///grows all plants
function growPlants() {
  for (var i=0; i<plants.length; i++) {
    var plant = plants[i];
    //caps plant energy based on segment count
    if ( plant.energy > plant.segmentCount * 1000 && plant.energy > 5000 ) {
      plant.energy = plant.segmentCount * 1000;
    }
    //checks for sufficient energy for growth (must be greater than zero to grow)
    if ( plant.energy > 0 || !restrictGrowthByEnergy ) {
      for (var j=0; j<plants[i].segments.length; j++) {
        var segment = plants[i].segments[j];
        //lengthens segment spans
        if ( segment.spF.l < plant.maxSegmentWidth && plant.segments.length < plant.maxTotalSegments) { 
          lengthenSegmentSpans( plant, segment );
          plant.energy -= segment.spCd.l * geer;  // reduces energy by a ratio of segment size
        }
        //generates new segment
        if ( readyForChildSegment( plant, segment ) ) { 
          createSegment( plant, segment, segment.ptE1, segment.ptE2 ); 
        }
        //handles leaves
        if ( !segment.hasLeaves ) { 
          generateLeavesWhenReady( plant, segment ); 
        } else if ( plant.segments.length < plant.maxTotalSegments ) {
          growLeaves( plant, segment );
          plant.energy -= ( segment.spLf1.l + segment.spLf2.l ) * geer;  // reduces energy by a ratio of leaf length
        }
      }
    }
    //cost of living
    plant.energy -= plant.segmentCount * leer;  // reduces energy by a ratio of segment count
  }
}

///lengthens segment spans for growth
function lengthenSegmentSpans( plant, segment ) {
  if (segment.isBaseSegment) {
    segment.ptB1.cx -= plant.outwardGrowthRate / 2;
    segment.ptB2.cx += plant.outwardGrowthRate / 2;
    plant.spB.l = distance( segment.ptB1, segment.ptB2 );
    segment.spCd.l = distance( segment.ptE1, segment.ptB2 ) + plant.forwardGrowthRate / 3;
    segment.spCu.l = segment.spCd.l;
  } else {
    segment.spCdP.l = distance( segment.ptE1, segment.parentSegment.ptB2 ) + plant.forwardGrowthRate;
    segment.spCuP.l = segment.spCdP.l * segment.forwardGrowthRateVariation;
    segment.spCd.l = distance( segment.ptE1, segment.ptB2 );
    segment.spCu.l = distance( segment.ptB1, segment.ptE2 );
  } 
  segment.spF.l += plant.outwardGrowthRate;
  segment.spL.l = distance( segment.ptB1, segment.ptE1 );
  segment.spR.l = distance( segment.ptB2, segment.ptE2 );
}

///checks whether a segment is ready to generate a child segment
function readyForChildSegment( plant, segment ) {
  return segment.spF.l > plant.maxSegmentWidth * 0.333 && 
         !segment.hasChildSegment && 
         plant.segmentCount < plant.maxTotalSegments;
}

///generates leaves when segment is ready
function generateLeavesWhenReady ( plant, segment ) {
  var p = plant;
  var s = segment;
  if (  s.id >= p.firstLeafSegment && 
        s.id % p.leafFrequency === 0 && 
        s.spF.l > p.maxSegmentWidth * 0.1 ||
        s.id === p.maxTotalSegments-1 ) {
    var fsmp = smp( s.spF );  // forward span mid point ( { x: <value>, y: <value> } )
    s.ptLf1 = addPt( pctFromXVal( fsmp.x ), pctFromYVal( fsmp.y - 1 ) );  // leaf 1 tip point (left)
    s.ptLf2 = addPt( pctFromXVal( fsmp.x ), pctFromYVal( fsmp.y - 1 ) );  // leaf 2 tip point (right)
    s.spLf1 = addSp( s.ptB1.id, s.ptLf1.id );  // leaf 1 span (left)
    s.spLf2 = addSp( s.ptB2.id, s.ptLf2.id );  // leaf 2 span (right)
    s.leafTipsTetherSpan = addSp( s.ptLf1.id, s.ptLf2.id );  // leaf tip tether span
    s.hasLeaves = true;
  }
}

///add leaf scaffolding
function addLeafScaffolding( plant, segment ) {
  var p = plant;
  var s = segment;
  //remove leaf tips tether
  removeSpan(s.leafTipsTetherSpan.id);
  //apply leaf-unfold boosters
  s.ptLf1.cx -= gravity * 100;
  s.ptLf2.cx += gravity * 100;
  //add scaffolding points
  //(leaf 1)
  var x = s.ptE1.cx + ( s.ptE1.cx - s.ptE2.cx ) * 0.5;
  var y = s.ptE1.cy + ( s.ptE1.cy - s.ptE2.cy ) * 0.5;
  s.ptLf1ScA = addPt( pctFromXVal( x ), pctFromYVal( y ), "immaterial" ); s.ptLf1ScA.mass = 0;
  x = ( s.ptLf1.cx + s.ptLf1ScA.cx ) / 2 ;
  y = ( s.ptLf1.cy + s.ptLf1ScA.cy ) / 2 ;
  s.ptLf1ScB = addPt( pctFromXVal( x ), pctFromYVal( y ), "immaterial" ); s.ptLf1ScB.mass = 0;
  //(leaf 2)
  x = s.ptE2.cx + ( s.ptE2.cx - s.ptE1.cx ) * 0.5;
  y = s.ptE2.cy + ( s.ptE2.cy - s.ptE1.cy ) * 0.5;
  s.ptLf2ScA = addPt( pctFromXVal( x ), pctFromYVal( y ), "immaterial" ); s.ptLf2ScA.mass = 0;
  x = ( s.ptLf2.cx + s.ptLf2ScA.cx ) / 2 ;
  y = ( s.ptLf2.cy + s.ptLf2ScA.cy ) / 2 ;
  s.ptLf2ScB = addPt( pctFromXVal( x ), pctFromYVal( y ), "immaterial" ); s.ptLf2ScB.mass = 0;
  //add scaffolding spans
  //(leaf 1)
  s.spLf1ScA = addSp( s.ptE1.id, s.ptLf1ScA.id, "hidden" );
  s.spLf1ScB = addSp( s.ptB1.id, s.ptLf1ScA.id, "hidden" ); 
  s.spLf1ScC = addSp( s.ptLf1ScA.id, s.ptLf1ScB.id, "hidden" ); 
  s.spLf1ScD = addSp( s.ptLf1ScB.id, s.ptLf1.id, "hidden" ); 
  //(leaf 2)
  s.spLf2ScA = addSp( s.ptE2.id, s.ptLf2ScA.id, "hidden" ); 
  s.spLf2ScB = addSp( s.ptB2.id, s.ptLf2ScA.id, "hidden" ); 
  s.spLf2ScC = addSp( s.ptLf2ScA.id, s.ptLf2ScB.id, "hidden" ); 
  s.spLf2ScD = addSp( s.ptLf2ScB.id, s.ptLf2.id, "hidden" );
  s.hasLeafScaffolding = true;
}

///grows leaves
function growLeaves( plant, segment ) {
  var p = plant;
  var s = segment;
  if ( s.spLf1.l < p.maxLeaflength ) {
    //extend leaves
    s.spLf1.l = s.spLf2.l += p.leafGrowthRate;
    if ( s.spF.l > p.maxSegmentWidth*0.6 && !s.hasLeafScaffolding ) {
      // add scaffolding when leaves unfold
      addLeafScaffolding( plant, segment );
    } else if ( s.hasLeafScaffolding ) {
      //extend scaffolding if present
      //(leaf 1)
      s.spLf1ScA.l += p.leafGrowthRate * 1.25;
      s.spLf1ScB.l += p.leafGrowthRate * 1.5;
      s.spLf1ScC.l += p.leafGrowthRate * 0.06;
      s.spLf1ScD.l += p.leafGrowthRate * 0.06;
      //(leaf 2)
      s.spLf2ScA.l += p.leafGrowthRate * 1.25;
      s.spLf2ScB.l += p.leafGrowthRate * 1.5;
      s.spLf2ScC.l += p.leafGrowthRate * 0.06;
      s.spLf2ScD.l += p.leafGrowthRate * 0.06;
    }
  }
}

///renders leaf
function renderLeaf( plant, leafSpan ) {
  var p1x = leafSpan.p1.cx;
  var p1y = leafSpan.p1.cy;
  var p2x = leafSpan.p2.cx;
  var p2y = leafSpan.p2.cy;
  var mpx = ( p1x + p2x ) / 2;  // mid point x
  var mpy = ( p1y + p2y ) / 2;  // mid point y
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#003000";
  ctx.fillStyle = "green";
  var ah = 0.35;  // arc height
  //leaf top
  var ccpx = mpx + ( p2y - p1y ) * ah;  // curve control point x
  var ccpy = mpy + ( p1x - p2x ) * ah;  // curve control point y
  ctx.beginPath();
  ctx.moveTo(p1x,p1y);
  ctx.quadraticCurveTo(ccpx,ccpy,p2x,p2y);
  ctx.stroke();
  ctx.fill();
  //leaf bottom
  ccpx = mpx + ( p1y - p2y ) * ah;  // curve control point x
  ccpy = mpy + ( p2x - p1x ) * ah;  // curve control point y
  ctx.beginPath();
  ctx.moveTo(p1x,p1y);
  ctx.quadraticCurveTo(ccpx,ccpy,p2x,p2y);
  ctx.stroke();
  ctx.fill();
  //leaf center
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#007000";
  ctx.moveTo(p1x,p1y);
  ctx.lineTo(p2x,p2y);
  ctx.stroke();
}

///renders leaves
function renderLeaves( plant, segment ) {
  if ( segment.hasLeaves ) {
    renderLeaf( plant, segment.spLf1 );
    renderLeaf( plant, segment.spLf2 );
    if ( viewShadows ) { markShadowPositions( segment ); }
  }
}

///renders stalks
function renderStalks( plant, segment ) {
  for (var i=0; i<segment.skins.length; i++) {
    var s = segment.skins[i];
    //fills
    ctx.beginPath();
    ctx.fillStyle = s.color;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "darkgreen";
    ctx.moveTo(s.points[0].cx, s.points[0].cy);
    for(var j=1; j<s.points.length; j++) { ctx.lineTo(s.points[j].cx, s.points[j].cy); }
    ctx.lineTo(s.points[0].cx, s.points[0].cy);
    ctx.stroke();
    ctx.fill(); 
    //outlines
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#2A2000";
    ctx.moveTo(s.points[3].cx, s.points[3].cy);
    ctx.lineTo(s.points[0].cx, s.points[0].cy);
    ctx.moveTo(s.points[2].cx, s.points[2].cy);
    ctx.lineTo(s.points[1].cx, s.points[1].cy);
    ctx.stroke();
    if ( !segment.hasChildSegment ) {
      ctx.beginPath();
      ctx.moveTo(s.points[3].cx, s.points[3].cy);
      ctx.lineTo(s.points[2].cx, s.points[2].cy);
      ctx.stroke();
    }
  }
}

///renders plants (sequentially)
function renderPlants() {
  for (var i=0; i<plants.length; i++) {
    for (var j=0; j<plants[i].segments.length; j++) {
      var plant = plants[i];
      var segment = plants[i].segments[j];
      renderStalks( plant, segment );
      renderLeaves( plant, segment );
    }
  }
}

///renders shadows (from highest to lowest elevation)
function renderShadows() {
  shadows.sort( function( a, b ) { return a.p2.cy - b.p2.cy } );
  for ( var i=0; i<shadows.length; i++ ) {
    var sh = shadows[i];
    ctx.beginPath();
    ctx.moveTo( sh.p1.cx, sh.p1.cy );
    ctx.lineTo( sh.p2.cx, sh.p2.cy ); 
    ctx.lineTo( sh.p3.cx, sh.p3.cy );
    ctx.lineTo( sh.p4.cx, sh.p4.cy );
    ctx.lineTo( sh.p1.cx, sh.p1.cy );
    ctx.fillStyle = "rgba( 0, 0, 0, 0.1 )";
    ctx.fill();  
  }
  //resets shadows
  shadows = []; shadowCount = 0;
}




////---DISPLAY---////


function display() {
  try {
    runVerlet();
    if (worldTime % worldSpeed === 0) {
      growPlants();
    }
    renderPlants();
    shedSunlight();
    renderShadows();
  } catch (err) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[GrowAi hero plant]", err);
    }
  }
}

(function growAiHeroPlantBoot() {
  var HERO_PLANT_COUNT = 6;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var rafPending = false;
  var simulationReady = false;

  function heroPlantVisible() {
    if (reduced.matches) return false;
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (vw < 768) return false;
    var el = document.getElementById("hero-canvas-container");
    if (!el) return false;
    var aside = el.closest(".hero-inicio-bulb");
    if (aside) {
      var ast = window.getComputedStyle(aside);
      if (ast.display === "none") return false;
    }
    return true;
  }

  function ensureInit() {
    if (simulationReady) return;
    if (typeof ensureHeroCanvas2D === "function" && !ensureHeroCanvas2D()) {
      return;
    }
    simulationReady = true;
    try {
      var i;
      for (i = 0; i < HERO_PLANT_COUNT; i++) {
        createPlant();
      }
      createSunRays();
    } catch (err) {
      simulationReady = false;
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[GrowAi hero] ensureInit falló:", err);
      }
    }
  }

  function heroPlantFrame() {
    rafPending = false;
    if (!heroPlantVisible()) return;
    ensureInit();
    display();
    schedule();
  }

  function schedule() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(heroPlantFrame);
  }

  function kick() {
    if (!heroPlantVisible()) return;
    schedule();
  }

  reduced.addEventListener("change", function () {
    rafPending = false;
    kick();
  });
  window.addEventListener("resize", kick);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) kick();
  });
  function kickWhenPainted() {
    requestAnimationFrame(function () {
      requestAnimationFrame(kick);
    });
  }
  document.addEventListener("DOMContentLoaded", kickWhenPainted);
  if (document.readyState !== "loading") {
    kickWhenPainted();
  }
  var heroCanvasHost = document.getElementById("hero-canvas-container");
  if (heroCanvasHost && typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      kick();
    });
    ro.observe(heroCanvasHost);
  }
  if (heroCanvasHost && typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        var e;
        for (e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            kick();
            break;
          }
        }
      },
      { root: null, rootMargin: "80px", threshold: 0 }
    );
    io.observe(heroCanvasHost);
  }
  setTimeout(kick, 0);
  setTimeout(kick, 120);
  setTimeout(kick, 400);
})();










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
