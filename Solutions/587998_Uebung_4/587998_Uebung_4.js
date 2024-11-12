/* template GTAT2 Game Technology & Interactive Systems */
/* Autor:  Hyun Bin Jeoung 587998*/
/* Übung Nr. 4*/
/* Datum: 29.10.2024*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var xi, yi;
var xk, yk;
var M;

var points = 0;
var wind = 0;

var dragging = false;

var g = 9.81;
var dt = 1/60;

var state = "start";
var initiated = false;

let playground = {
  width: 10,
  padding: 1
};

let base = {
  nullpunkt: 0,
  height: 0.5,
  maxWidth: 10.2,
  width: 10,
  maxHeight: 4,
  startRamp: 9,
  holeLeft: 7.6,
  holeRight: 7.4,
  color: [115, 159, 208]
};

let slingTip = {
  x: -1,
  y: 0.5,
  color: 0
};

let sling = {
  nullpunkt: 0,
  right: 0.9,
  left: 1.1,
  color: [32, 75, 33]
}

let slingShot = {
  color: [141, 161, 189],
  stroke: [130, 149, 169],
  strokeWeight: 1
}

let hindarance = {
  nullpunkt: 0,
  right: 2.9,
  left: 3.1,
  height: 0.5,
  color: [255, 0, 0]
}

let flagpole = {
  nullpunkt: 0,
  right: 8,
  left: 8.03,
  height: 2,
  color: [0]
}

var flag = {
  top: 1.9,
  bottom: 1.5,
  middle: 1.7,
  flagWind: 0,
  color: [253, 216, 98],
  stroke: [108, 132, 136],
  strokeWeight: 2
}

var redBall = {
  x0: -6,
  y0: 0.1,
  diameter: 0.2,
  color: [255, 0, 0]
};

var slingBall = {
  x0: -0.4,
  y0: 0.3,
  diameter: 0.2,
  v0: 8,
  vx0: 1,
  vy0: 1,
  vx: 0,
  vy: 0,
  alpha: 0,
  color: [18, 117, 46]
};

/* prepare program */
function setup() {								
  createCanvas(canvasWidth, canvasHeight);

  startButton();
  resetButton();
}

/* run program */
function draw() {									
background(255);

/* administration */
  uiText();
	
/* calculation */
  M = canvasWidth/(playground.width + 2*playground.padding);
  xi0 = (playground.width + playground.padding) * M;
  yi0 = 0.8 * canvasHeight;

  //für Windstärke 1 - 10
  flag.flagWind = wind/10 + 8;

/* display */
  drawBase();
  drawSling();
  drawSlingTip();
  drawSlingBall();
  drawSlingshot();
  drawRedBall();
  drawHindarance();
  drawFlag();
  drawFlagpole();

  gameState();
}

function gameState(){
  //States: start, run
    //substates for run: throw, movement on ground, end of movement
  switch(state){
    case "start":
      //New or Reset Button pressed

    break;
    case "run":
      //more substates needed
      if(!initiated){
        calculate();
        initiated = true;
      }
      shoot();
    break;
  }
}

function calculate(){
  slingBall.alpha = Math.atan2(slingTip.y - slingBall.y0, slingTip.x - slingBall.x0);
  slingBall.vx0 = slingBall.v0 * Math.cos(slingBall.alpha);
  slingBall.vy0 = slingBall.v0 * Math.sin(slingBall.alpha);
  slingBall.vx = slingBall.vx0;
  slingBall.vy = slingBall.vy0;
}

function shoot(){
  slingBall.vy = slingBall.vy -g * dt;
  slingBall.y0 = slingBall.y0 + slingBall.vy * dt;
  slingBall.x0 = slingBall.x0 + slingBall.vx0 * dt;

  //Ground state
  if (slingBall.y0 <= slingBall.diameter / 2){
    slingBall.y0 = slingBall.diameter / 2;
    slingBall.vy = 0;
  }

  //End State
  if (slingBall.x0 < -base.holeRight){
    state = "start";
    initiated = false;
  }
}

function mousePressed(){
  // Koordinaten von inneres zu kartetisches Koordinatensystem
  let slingBallCanvasX = kXi(slingBall.x0 * M);
  let slingBallCanvasY = kYi(slingBall.y0 * M);
  
  let distance = dist(mouseX, mouseY, slingBallCanvasX, slingBallCanvasY);
  if (distance < slingBall.diameter * M) {
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
      
      slingBall.x0 = slingTip.x + dx;
      slingBall.y0 = slingTip.y + dy;
    } else if (distance < 0.3){ //0.3 Meter Begrenzung
      dx = dx / distance;
      dy = dy / distance;
      
      slingBall.x0 = slingTip.x + dx * 0.3;
      slingBall.y0 = slingTip.y + dy * 0.3;
    } else {
      slingBall.x0 = mouseXCanvas;
      slingBall.y0 = mouseYCanvas;
    }
    redraw();
  }
}

function mouseReleased(){
  if(dragging){
    dragging = false;
  }
}

function uiText(){
  fill(0);
  textSize(12);
  textAlign(CENTER);
  textStyle(NORMAL);
  text("Hyun Bin Jeoung 587998", canvasWidth/2, canvasHeight/11)

  textSize(20);
  textAlign(CENTER);
  textStyle(BOLD);
	text("Punkte: " + points + " | Windstärke: " + wind, canvasWidth/2, canvasHeight/8);
}

function startButton(){
  let newCol = color(0, 255, 0);

  let buttonNew = createButton('START');
  buttonNew.style('font-size', '30px');
  buttonNew.style('background-color', newCol);
  buttonNew.style('border-radius', '10px');
  buttonNew.position(canvasWidth/1.4, canvasHeight/1.1);
  buttonNew.mousePressed(startPressed); //New Function
}

function startPressed(){
  //neuer Versuch mit fortlaufenden Punkten
  wind = Math.floor(random(1, 11));
  points = Math.floor(random(1, 101)); //nur zum testen von reset
  
  state = "run";
}

function resetButton(){
  let resetCol = color(255, 0, 0);

  let buttonReset = createButton('RESET');
  buttonReset.style('font-size', '30px');
  buttonReset.style('background-color', resetCol);
  buttonReset.style('border-radius', '10px');
  buttonReset.position(canvasWidth/4, canvasHeight/1.1);
  buttonReset.mousePressed(resetPressed); //Reset Function
}

function resetPressed(){
  //kompletter Reset von Punkten für ein neues Game
  wind = Math.floor(random(1, 11));
  points = 0;

  state = "start";
  initiated = false;
  slingBall.x0 = -0.4;
  slingBall.y0 = 0.3;
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

function drawSlingBall(){
  //ellipse(kXi(-0.3*M), kYi(0.4*M), 0.2*M);
  fill(slingBall.color);

  ellipse(kXi(slingBall.x0*M), kYi(slingBall.y0*M),slingBall.diameter*M);
}

function drawRedBall(){
  //ellipse(kXi(-6*M), kYi(0.1*M), 0.2*M);
  fill(redBall.color);

  ellipse(kXi(redBall.x0*M), kYi(redBall.y0*M),redBall.diameter*M);
}

function drawSlingshot() {
  fill(slingShot.color); 
  stroke(slingShot.stroke);
  strokeWeight(slingShot.strokeWeight);

  beginShape();

  vertex(kXi(slingTip.x*M), kYi(slingTip.y*M));
  vertex(kXi(slingBall.x0*M), kYi(slingBall.y0*M));

  endShape(CLOSE);

  noStroke();
}

function drawBase(){
  fill(base.color);
  noStroke();

  beginShape();

    vertex(kXi(base.nullpunkt), kYi(base.nullpunkt));
    vertex(kXi(base.nullpunkt), kYi(-base.height*M));
    vertex(kXi(-base.maxWidth*M), kYi(-base.height*M));
    vertex(kXi(-base.maxWidth*M), kYi(base.maxHeight*M));
    vertex(kXi(-base.width*M), kYi(base.maxHeight*M));
    vertex(kXi(-base.width*M), kYi(base.height*M));
    vertex(kXi(-base.startRamp*M), kYi(base.nullpunkt));
    vertex(kXi(-base.holeLeft*M), kYi(base.nullpunkt));
    vertex(kXi(-base.holeLeft*M), kYi(-slingBall.diameter*M));
    vertex(kXi(-base.holeRight*M), kYi(-slingBall.diameter*M));
    vertex(kXi(-base.holeRight*M), kYi(base.nullpunkt));

  endShape(CLOSE);

  fill(0);
  ellipse(kXi(0), kYi(0), 10); //Nullpunkt
  noStroke();
}

function drawSling(){
  fill(sling.color);
  noStroke();

  beginShape();

    vertex(kXi(slingTip.x*M), kYi(slingTip.y*M));
    vertex(kXi(-sling.right*M), kYi(sling.nullpunkt));
    vertex(kXi(-sling.left*M), kYi(sling.nullpunkt));

  endShape(CLOSE);
}

function drawSlingTip(){
  fill(slingTip.color);
  circle(kXi(slingTip.x*M), kYi(slingTip.y*M), 5);
}

function drawHindarance(){
  fill(hindarance.color);

  beginShape();

    vertex(kXi(-hindarance.right*M), kYi(hindarance.nullpunkt));
    vertex(kXi(-hindarance.left*M), kYi(hindarance.nullpunkt));
    vertex(kXi(-hindarance.left*M), kYi(hindarance.height*M));
    vertex(kXi(-hindarance.right*M), kYi(hindarance.height*M));

  endShape(CLOSE);
}

function drawFlag(){
  fill(flag.color);
  stroke(flag.stroke); 
  strokeWeight(flag.strokeWeight);

  beginShape();

   vertex(kXi(-flagpole.left*M), kYi(flag.top*M));
   vertex(kXi(-flagpole.left*M), kYi(flag.bottom*M));
   vertex(kXi(-flag.flagWind*M), kYi(flag.middle*M));

  endShape(CLOSE);

  noStroke();
}

function drawFlagpole(){
  fill(flagpole.color);

  beginShape();

    vertex(kXi(-flagpole.right*M), kYi(flagpole.nullpunkt));
    vertex(kXi(-flagpole.left*M), kYi(flagpole.nullpunkt));
    vertex(kXi(-flagpole.left*M), kYi(flagpole.height*M));
    vertex(kXi(-flagpole.right*M), kYi(flagpole.height*M));

  endShape(CLOSE);
}

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
