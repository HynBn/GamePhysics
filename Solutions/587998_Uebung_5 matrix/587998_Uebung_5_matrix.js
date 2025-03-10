/* template GTAT2 Game Technology & Interactive Systems */
/* Autor:  Hyun Bin Jeoung 587998*/
/* Übung Nr. 5*/
/* Datum: 12.11.2024*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var xi, yi;
var xk, yk;
var M;

var points = 0;
var wind = 0;

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

g = 9.81;


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
    lim[n] = 0.5*slingBall.diameter*tan(0.5*(beta[n+1] - beta[n]));
  }
}


/* run program */
function draw() {									
background(255);

/* administration */
  uiText();
	
/* calculation */
  switch(state){
    case "start":
    break;
    case "onFlight":
      if(!initiated){
        calculate();
        initiated = true;
      }
      shoot();
    break;
    case "onGround":
      onGround();
    break;
    case "onSlope":
      onSlope();
    break;
    case "end":
      resetGame();
    break;
  }

  //für Windstärke 1 - 10
  flag.flagWind = wind/10 + 8;

/* display */
  push();
    translate(xi0, yi0);
    scale(1, -1);
    ellipse(0, 0, 10);

    //Draw the Playground
    drawBase();
    drawSling();
    drawSlingTip();

    drawRedBall();
    drawHindarance();
    drawFlag();
    drawFlagpole();

    fill(slingBall.color);
    switch(state){
      case "start":
        drawSlingshot();
      case "onGround":
      case "onFlight":
        drawSlingBall();
      break;
      case "end":
      case "onSlope":
        push();
          translate(slopeStart.x*M, slopeStart.y*M);
          rotate(beta[1]);
          ellipse((slingBall.s + lim[0])*M, (slingBall.diameter/2)*M, slingBall.diameter*M);
        pop();
    }
  pop();
}


/****************************************************** Calculations ******************************************************/

function resetGame(){
  slingBall.x0 = -0.4;
  slingBall.y0 = 0.3;
  slingBall.vx = 0;
  slingBall.vy = 0;
  slingBall.vx0 = 1;
  slingBall.vy0 = 1;
  slingBall.alpha = 0;
  slingBall.s = 0;
  slingBall.vs = 0;

  initiated = false;
  state = "start";
}

function calculate(){
  slingBall.alpha = Math.atan2(slingTip.y - slingBall.y0, slingTip.x - slingBall.x0);
  slingBall.vx0 = slingBall.v0 * Math.cos(slingBall.alpha);
  slingBall.vy0 = slingBall.v0 * Math.sin(slingBall.alpha);
  slingBall.vx = slingBall.vx0;
  slingBall.vy = slingBall.vy0;
}

function shoot(){
  slingBall.vy = slingBall.vy - g * dt;
  slingBall.y0 = slingBall.y0 + slingBall.vy * dt;
  slingBall.x0 = slingBall.x0 + slingBall.vx0 * dt;

  if (slingBall.y0 <= slingBall.diameter / 2){
    slingBall.y0 = slingBall.diameter / 2;
    slingBall.vy = 0;
    state = "onGround";
  }

}

function onGround(){
  // slingBall.x0 += slingBall.vx * dt;
  slingBall.y0 = slingBall.diameter/2;

    if (slingBall.x0 <= -hindarance.left - slingBall.diameter/2) {
      slingBall.x0 = slingBall.x0 + slingBall.vx * dt;
    } 

  if (slingBall.x0 <= -hindarance.left - slingBall.diameter/2 && slingBall.x0 >= -hindarance.left - slingBall.diameter/2){
    if (slingBall.vx <= 0)
      slingBall.x0 = -hindarance.left - slingBall.diameter/2;
    else
      slingBall.x0 = -hindarance.left + slingBall.diameter/2;
    slingBall.vx = -slingBall.vx;
    state = "onGround";
  }

  if (slingBall.x0 <= profile[2].x + lim[1]){
    slingBall.s = slopeLength[1] - lim[1];
    slingBall.vs = cos(beta[1]) * slingBall.vx;
    state = "onSlope";
  }
}

function onSlope(){
  // slingBall.x0 = -slope.left + slingBall.diameter/2;
  // slingBall.y0 = slope.top + slingBall.diameter/2;

  // var gk = slope.top - slope.bottom;
  // var ak = slope.left - slope.right;
  // slingBall.alpha = Math.atan2(gk, ak);

  // var lim = slingBall.diameter/2 * Math.tan(slingBall.alpha/2);
  // var slopeLength = Math.sqrt(Math.pow(base.width - slope.right, 2) + Math.pow(base.height - base.nullpunkt, 2));

  // vs = vs + g * Math.sin(slingBall.alpha) * dt;
  // s = s + vs * dt;

  // slingBall.x0 = s * Math.cos(slingBall.alpha) - slope.left + slingBall.diameter/2;
  // slingBall.y0 = -s * Math.sin(slingBall.alpha) + slope.top + slingBall.diameter/4;

  // if (s >= slopeLength - lim){
  //   slingBall.vx = vs;
  //   state = "onGround"; 
  // }

  slingBall.vs -= g_[1] * dt;
  slingBall.s += slingBall.vs * dt;
  dt_ = (slopeLength[1] - lim[1] - slingBall.s) / slingBall.vs;

  if (slingBall.s >= slopeLength[1] - lim[1]){
    slingBall.x0 = profile[2].x + lim[1];
    slingBall.y0 = slingBall.diameter/2;
    slingBall.vx = cos(beta[1]) * slingBall.vs;
    state = "onGround";
  }
}

function mouseReleased(){
  if(dragging){
    dragging = false;
  }
}

/****************************************************** UI Elements ******************************************************/

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
  
  // state = "onFlight";

  vs = 0;
  s = 0;

  state = "onSlope";

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
  
  resetGame();
}


/****************************************************** Controls ******************************************************/

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
	profile[4] = createVector(-base.holeLeft, -slingBall.diameter);
	profile[5] = createVector(-base.holeRight, -slingBall.diameter);
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

function drawSlingBall(){
  //ellipse((-0.3*M), (0.4*M), 0.2*M);
  fill(slingBall.color);

  ellipse((slingBall.x0*M), (slingBall.y0*M),slingBall.diameter*M);
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
  vertex((slingBall.x0*M), (slingBall.y0*M));

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
    vertex((-base.holeLeft*M), (-slingBall.diameter*M));
    vertex((-base.holeRight*M), (-slingBall.diameter*M));
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

   vertex((-flagpole.left*M), (flag.top*M));
   vertex((-flagpole.left*M), (flag.bottom*M));
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
