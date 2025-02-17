/* template GTAT2 Game Technology & Interactive Systems */
/* Autor:  Hyun Bin Jeoung 587998*/
/* Übung Nr. 10*/
/* Datum: 27.01.2025*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var xi, yi;
var xk, yk;
var M;

var points = 0;
var wind = 0;
var tries = 0;
var windStr;

var dragging = false;

var frameRate = 60;
var timeScale = 1;
var dt = timeScale/frameRate;
var dt_ = 0;
var t = 0;

var state = "start";
var initiated = false;

var s = 0;
var vs = 0;

var profile = [];			
var n, N = 13; 				
var slopeStart;										
var beta = [];								
var lim = [];										
var slopeLength = [];										
var g_ = [];

var cR = 0.05;
var cW = 0.45;

var pLuft = 1.3;

var g = 9.81;

// var l0 = 0.25; //Ruhefederlänge 25cm
// var n = 50;
var Fn;
var Fn0;
var friction = 0.8;

var playBall = {
	x0: -0.7, y0: 0.4,
	diameter: 0.2,
	v0: 8,
	vx0: 1, vy0: 1,
	vx: 0, vy: 0,
	alpha: 0,
	color: [18, 117, 46],
	s: 0,
	vs: 0,
  m: 0.05
  };
  
var sling = {
  nullpunkt: 0,
  right: 0.9,
  left: 1.1,
  color: [32, 75, 33],
  phi: 0,
  s: 0,
  n: 50,
  l0: 0.25
};

/* prepare program */
function setup() {								
  createCanvas(canvasWidth, canvasHeight);

  M = canvasWidth/(playground.width + 2*playground.padding);
  xi0 = (playground.width + playground.padding) * M;
  yi0 = 0.7 * canvasHeight;

  startButton();
  resetButton();
  
  calculateProfile();
  for (n = 0; n < N-1; n++) {
    beta[n] = atan2(profile[n+1].y - profile[n].y, profile[n+1].x - profile[n].x);
    slopeLength[n] = sqrt(sq(profile[n+1].y - profile[n].y) + sq(profile[n+1].x - profile[n].x));
    g_[n] = g*sin(beta[n]);
  }

  slopeStart = createVector(profile[1].x, profile[1].y);
  
  // Berechnung der Limiter
  for (n = 0; n < N-2; n++) {
    lim[n] = 0.5*playBall.diameter*tan(0.5*(beta[n+1] - beta[n]));
  }

  //Give a windspeed randomly between -5 to 5
  setWindSpeed();

  

  sling.phi = -HALF_PI;
  sling.s = sling.l0 + playBall.m * g / sling.n;
}


/* run program */
function draw() {									
background(245);

/* administration */
  uiText();
	
/* calculation */
  switch(state){
    case "start":
      onStart();
    break;
    case "onCatapult":
      onCatapult();
    break;
    case "onFlight":
      // if(!initiated){
      //   calculate();
      //   initiated = true;
      // }
      onFlight();
    break;
    case "onGround":
      onGround();
    break;
    case "onSlope":
      onSlope();
    break;
    case "inHole":
      inHole();
    break;
    case "end":
      resetGame();
    break;
  }

  //ändert die mittlere Flagvertex je nach den verschiedenen Windstärken von -25 bis 25 
  flag.flagWind = wind/5 + 8.015;  //+8.015, weil der Pole Mittelpunkt bei x=8.015 liegt

/* display */
  push();
    translate(xi0, yi0);
    scale(1, -1);

    //Draw the Playground
    drawBase();
    drawSling();
    drawSlingTip();
    drawRedBall();
    drawHindarance();
    drawFlag();
    drawFlagpole();
    ellipse(0, 0, 7); //Nullpunkt

    fill(playBall.color);
    switch(state){
      case "start":
        drawSlingshot();        
      case "onCatapult":
        drawSlingshot();
      case "onGround":
      case "onFlight":
        drawplayBall();
      break;
      case "inHole":
        drawplayBall();
      break;
      case "end":
      break;
      case "onSlope":
        push();
          translate(slopeStart.x*M, slopeStart.y*M);
          rotate(beta[1]);
          ellipse((playBall.s + lim[0])*M, (playBall.diameter/2)*M, playBall.diameter*M);
        pop();
    }
  pop();
}


/****************************************************** Calculations ******************************************************/

function resetGame(){
  playBall.x0 = -0.7;
  playBall.y0 = 0.4;
  playBall.vx = 0;
  playBall.vy = 0;
  playBall.vx0 = 1;
  playBall.vy0 = 1;
  playBall.alpha = 0;
  playBall.s = 0;
  playBall.vs = 0;


  setWindSpeed();

  // initiated = false;
  state = "start";
}

// function calculate(){
  // playBall.alpha = Math.atan2(slingTip.y - playBall.y0, slingTip.x - playBall.x0);
  // playBall.vx0 = playBall.v0 * Math.cos(playBall.alpha); 
  // playBall.vy0 = playBall.v0 * Math.sin(playBall.alpha); 
  // playBall.vx = playBall.vx0;
  // playBall.vy = playBall.vy0;
// }

function setWindSpeed(){
  wind = Math.floor(random(-5, 5));
  windStr = wind;
}

function onStart(){
  sling.phi = atan2((playBall.y0 - slingTip.y), (playBall.x0 - slingTip.x));
  sling.s = sqrt(sq(playBall.y0 - slingTip.y) + sq(playBall.x0 - slingTip.x));

  Fn0 = sling.n * (sling.s - sling.l0);
  if (Fn0 < 0){
    Fn0 = 0;
  }
}

function onCatapult(){
  sling.phi = atan2((playBall.y0 - slingTip.y), (playBall.x0 - slingTip.x));
  sling.s = sqrt(sq(playBall.y0 - slingTip.y) + sq(playBall.x0 - slingTip.x));

  if (sling.s > sling.l0) {
    Fn = sling.n * (sling.s - sling.l0);
  } else {
    Fn = 0;
  }

  // playBall.vx = playBall.vx - (playBall.vx * friction + Fn * cos(sling.phi)/playBall.m) * dt;
  // playBall.vy = playBall.vy - (playBall.vy * friction + Fn * sin(sling.phi)/playBall.m * g) * dt;

  playBall.vx = playBall.vx - (Fn/playBall.m * cos(sling.phi) + friction * playBall.vx) * dt;
  playBall.vy = playBall.vy - (g + Fn/playBall.m * sin(sling.phi) + friction * playBall.vy) * dt;

  // playBall.vx = playBall.vx - ((sling.n/playBall.m) * (sling.s - sling.l0) * Fn * cos(sling.phi) + friction) * dt;
  // playBall.vy = playBall.vy - (g + (sling.n/playBall.m) * (sling.s - sling.l0) * Fn * sin(sling.phi) + friction) * dt;

  playBall.x0 += playBall.vx * dt;
  playBall.y0 += playBall.vy * dt;

  if((sling.s < sling.l0 || sling.phi > HALF_PI) && Fn0 > 0) 
    state = "onFlight";
}

function onFlight(){
  // playBall.vy = playBall.vy - g * dt;
  // playBall.y0 = playBall.y0 + playBall.vy * dt;
  // playBall.x0 = playBall.x0 + playBall.vx0 * dt;

  var r = cW * pLuft * (Math.PI * Math.pow(playBall.diameter/2,2)/2);

  var vyAlt = playBall.vy;
  playBall.vy -= (g + r/playBall.m * Math.sqrt(Math.pow(playBall.vx + wind,2) + Math.pow(playBall.vy,2)) * playBall.vy) * dt;
  playBall.vx -= r/playBall.m * Math.sqrt(Math.pow(playBall.vx + wind,2) + Math.pow(vyAlt,2)) * (playBall.vx + wind) * dt;

  playBall.y0 += playBall.vy * dt;
  playBall.x0 += playBall.vx * dt;

  if (playBall.y0 <= playBall.diameter / 2){
    playBall.y0 = playBall.diameter / 2;
    playBall.vy = 0;
    state = "onGround";
  }

  if(playBall.x0 >= profile[1].x && playBall.x0 <= profile[2].x) {
    var ySlope = profile[1].y + (playBall.x0 - profile[1].x) * tan(beta[1]);
    if(playBall.y0 <= ySlope + playBall.diameter/2) {
      playBall.y0 = ySlope + playBall.diameter/2;
      playBall.vy = 0;

      playBall.s = (playBall.x0 - profile[1].x) / cos(beta[1]);
      playBall.vs = cos(beta[1]) * playBall.vx + sin(beta[1]) * playBall.vy;

      state = "onSlope";
    }
  }

  if (playBall.x0 + playBall.diameter/2 >= -hindarance.left &&
      playBall.x0 - playBall.diameter/2 <= -hindarance.right &&
      playBall.y0 - playBall.diameter/2 <= hindarance.height &&
      playBall.y0 + playBall.diameter/2 >= 0) {
    playBall.vx = -playBall.vx; // Reflexion
    state = "onFlight";
  }

  if(playBall.x0 - playBall.diameter/2 <= profile[0].x) {
    playBall.vx = -playBall.vx * 0.8;
  }
}

function onGround(){
  playBall.x0 += playBall.vx * dt;
  playBall.y0 = playBall.diameter/2;

  if (playBall.x0 + playBall.diameter/2 >= -hindarance.left &&
      playBall.x0 - playBall.diameter/2 <= -hindarance.right &&
      playBall.y0 <= hindarance.height &&
      playBall.y0 >= 0) {
    playBall.vx = -playBall.vx * 0.8; // Reflexion
    state = "onGround";
  }

  if (playBall.x0 <= profile[2].x + lim[0]){
    playBall.s = slopeLength[1] - lim[0];
    playBall.vs = cos(beta[1]) * playBall.vx;
    state = "onSlope";
  }

  playBall.vx -= cR * g * Math.sign(playBall.vx) * dt;

  if (Math.abs(playBall.vx) < 0.01) {
    playBall.vx = 0;
    state = "end";
  }

  if (playBall.x0 - playBall.diameter/2 > profile[3].x && 
      playBall.x0 + playBall.diameter/2 < profile[6].x && 
      Math.abs(playBall.vx) < 3) { //Ball fällt nur wenn eine Geschwindigkeit von 3 unterschritten ist, alles darüber ist zu schnell
    state = "inHole";
    return;
  }
}

function inHole() {
  playBall.x0 += playBall.vx * dt;
  playBall.vy -= g * dt; 
  playBall.y0 += playBall.vy * dt;
  
  if (playBall.x0 - playBall.diameter/2 < profile[3].x) {
    playBall.x0 = profile[3].x + playBall.diameter/2;
    playBall.vx = -playBall.vx * 0.8; 
  }
  if (playBall.x0 + playBall.diameter/2 > profile[6].x) {
    playBall.x0 = profile[6].x - playBall.diameter/2;
    playBall.vx = -playBall.vx * 0.8  ; 
  }
  
  if (playBall.y0 - playBall.diameter/2 < profile[4].y) {
    playBall.vy = -playBall.vy * 0.8; 
    playBall.y0 = profile[4].y + playBall.diameter/2;
    
    if (Math.abs(playBall.vy) < 0.1 && Math.abs(playBall.vx) < 0.1) {
      points += 1; 
      state = "end";
    }
  }

}

function onSlope(){
  playBall.vs -= g_[1] * dt;
  playBall.s += playBall.vs * dt;

  dt_ = (slopeLength[1] - lim[0] - playBall.s) / playBall.vs;

  playBall.x0 = profile[1].x + playBall.s * cos(beta[1]);
  playBall.y0 = profile[1].y + playBall.s * sin(beta[1]);
  
  if(playBall.x0 - playBall.diameter/2 <= profile[0].x) {
    playBall.vx = -playBall.vx;
  }

  if(playBall.s + playBall.diameter/2 <= lim[0]){
    playBall.s = lim[0];
    playBall.vs = -playBall.vs * 0.8;
  }
  
  if (playBall.s >= slopeLength[1] - lim[0]){
    playBall.x0 = profile[2].x + lim[0];
    playBall.y0 = playBall.diameter/2;
    playBall.vx = cos(beta[1]) * playBall.vs;
    state = "onGround";
  }
}


/****************************************************** UI Elements ******************************************************/

function uiText(){
  fill(0);
  textSize(12);
  textAlign(CENTER);
  textStyle(NORMAL);
  text("Hyun Bin Jeoung, 587998", canvasWidth/2, canvasHeight/11)
  // text("Ball speed: " + Math.abs(playBall.vx.toFixed(3)), canvasWidth/2, canvasHeight/6.7);
  // text("State: " + state, canvasWidth/2, canvasHeight/5.9);
  // text("Fn0: " + Fn0, canvasWidth/2, canvasHeight/5.3);

  textSize(20);
  textAlign(CENTER);
  textStyle(BOLD);
	text("Versuche: " + tries + " | Punkte: " + points, canvasWidth/2, canvasHeight/8);
  text("Windstärke: " + wind, canvasWidth/2, canvasHeight/6.5)
}

function startButton(){
  let newCol = color(0, 255, 255);

  let buttonNew = createButton('START');
  buttonNew.style('font-size', '30px');
  buttonNew.style('background-color', newCol);
  buttonNew.style('border-radius', '10px');
  buttonNew.position(canvasWidth/1.4, canvasHeight/1.1);
  buttonNew.mousePressed(startPressed); //New Function
}

function startPressed(){
  //neuer Versuch mit fortlaufenden Punkten
  wind = Math.floor(random(-5, 5));
  windStr = wind;
  // points = Math.floor(random(1, 101)); //nur zum testen von reset
  //state = "onCatapult";
  //state = "onFlight";

  resetGame();
}

function resetButton(){
  let resetCol = color(255, 20, 90);

  let buttonReset = createButton('RESET');
  buttonReset.style('font-size', '30px');
  buttonReset.style('background-color', resetCol);
  buttonReset.style('border-radius', '10px');
  buttonReset.position(canvasWidth/4, canvasHeight/1.1);
  buttonReset.mousePressed(resetPressed); //Reset Function
}

function resetPressed(){
  points = 0;
  tries = 0;
  resetGame();
}


/****************************************************** Controls ******************************************************/

function mouseReleased(){
  if(dragging){
    dragging = false;

    tries += 1;
    state = "onCatapult";
  }
}

function mousePressed(){
  // Koordinaten von inneres zu kartetisches Koordinatensystem
  let playBallCanvasX = kXi(playBall.x0 * M);
  let playBallCanvasY = kYi(playBall.y0 * M);
  
  let distance = dist(mouseX, mouseY, playBallCanvasX, playBallCanvasY);
  if (distance < playBall.diameter * M) {
    dragging = true;
  }
}

function mouseDragged() {
  if (dragging) {
    let mouseXCanvas = iXk(mouseX) / M;
    let mouseYCanvas = iYk(mouseY) / M;

    //distanz zwischen Maus und Spitze 
    let dx = mouseXCanvas - slingTip.x;
    let dy = mouseYCanvas - slingTip.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {         //1 Meter Begrenzung
      dx = dx / distance;
      dy = dy / distance;
      
      playBall.x0 = slingTip.x + dx;
      playBall.y0 = slingTip.y + dy;
    } else if (distance < 0.3){ //0.3 Meter Begrenzung
      dx = dx / distance;
      dy = dy / distance;
      
      playBall.x0 = slingTip.x + dx * 0.3;
      playBall.y0 = slingTip.y + dy * 0.3;
    } else {
      playBall.x0 = mouseXCanvas;
      playBall.y0 = mouseYCanvas;
    }
    redraw();
  }
}

//Transformation
function kXi(xk){ 
  return(xk + xi0);
}

function kYi(yk){
  return(yi0 - yk);
}

//Rücktransformation
function iXk(xi){
  return(xi - xi0);
}
  
function iYk(yi){ 
  return(yi0 - yi);
}


/****************************************************** Draw Elements ******************************************************/

function calculateProfile(){
  profile[0] = createVector(-base.width, base.maxHeight)
  profile[1] = createVector(-base.width, slope.top);
  profile[2] = createVector(-slope.right, 0);
  profile[3] = createVector(-base.holeLeft, 0);
	profile[4] = createVector(-base.holeLeft, -base.holeDepth);
	profile[5] = createVector(-base.holeRight, -base.holeDepth);
	profile[6] = createVector(-base.holeRight, 0);
	profile[7] = createVector(-hindarance.left, 0);
	profile[8] = createVector(-hindarance.left, hindarance.height);
	profile[9] = createVector(-hindarance.right, hindarance.height);
	profile[10] = createVector(-hindarance.right, 0);
	profile[11] = createVector(-sling.left, 0);
	profile[12] = createVector(slingTip.x, slingTip.y);
	profile[13] = createVector(-sling.right, 0);
	profile[14] = createVector(0, 0);
}

function drawplayBall(){
  //ellipse((-0.3*M), (0.4*M), 0.2*M);
  fill(playBall.color);

  ellipse((playBall.x0*M), (playBall.y0*M),playBall.diameter*M);
}

function drawRedBall(){
  //ellipse((-6*M), (0.1*M), 0.2*M);
  fill(redBall.color);

  ellipse((redBall.x0*M), (redBall.y0*M),redBall.diameter*M);
}

function drawSlingshot() {
  fill(slingShot.color); 
  stroke(slingShot.stroke);
  strokeWeight(slingShot.strokeWeight);

  beginShape();

  vertex((slingTip.x*M), (slingTip.y*M));
  vertex((playBall.x0*M), (playBall.y0*M));

  endShape(CLOSE);

  noStroke();
}

function drawBase(){
  fill(base.color);
  noStroke();

  beginShape();

    vertex(base.nullpunkt, base.nullpunkt);
    vertex(base.nullpunkt, -base.height*M);
    vertex(-base.maxWidth*M, -base.height*M);
    vertex(-base.maxWidth*M, base.maxHeight*M);
    vertex(-base.width*M, base.maxHeight*M);
    vertex((-base.width*M), base.height*M);
    vertex((-base.startRamp*M), (base.nullpunkt));
    vertex((-base.holeLeft*M), (base.nullpunkt));
    vertex((-base.holeLeft*M), (-base.holeDepth*M));
    vertex((-base.holeRight*M), (-base.holeDepth*M));
    vertex((-base.holeRight*M), (base.nullpunkt));

  endShape(CLOSE);
}

function drawSling(){
  fill(sling.color);
  noStroke();

  beginShape();

    vertex((slingTip.x*M), (slingTip.y*M));
    vertex((-sling.right*M), (sling.nullpunkt));
    vertex((-sling.left*M), (sling.nullpunkt));

  endShape(CLOSE);
}

function drawSlingTip(){
  fill(slingTip.color);
  circle((slingTip.x*M), (slingTip.y*M), 5);
}

function drawHindarance(){
  fill(hindarance.color);

  beginShape();

    vertex((-hindarance.right*M), (hindarance.nullpunkt));
    vertex((-hindarance.left*M), (hindarance.nullpunkt));
    vertex((-hindarance.left*M), (hindarance.height*M));
    vertex((-hindarance.right*M), (hindarance.height*M));

  endShape(CLOSE);
}

function drawFlag(){
  fill(flag.color);
  stroke(flag.stroke); 
  strokeWeight(flag.strokeWeight);

  beginShape();

   vertex(((-flagpole.left+0.015)*M), (flag.top*M));  //+0.015 for it to be in the middle of the pole
   vertex(((-flagpole.left+0.015)*M), (flag.bottom*M));
   vertex((-flag.flagWind*M), (flag.middle*M));

  endShape(CLOSE);

  noStroke();
}

function drawFlagpole(){
  fill(flagpole.color);

  beginShape();

    vertex((-flagpole.right*M), (flagpole.nullpunkt));
    vertex((-flagpole.left*M), (flagpole.nullpunkt));
    vertex((-flagpole.left*M), (flagpole.height*M));
    vertex((-flagpole.right*M), (flagpole.height*M));

  endShape(CLOSE);
}

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}