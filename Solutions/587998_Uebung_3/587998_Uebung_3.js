/* template GTAT2 Game Technology & Interactive Systems */
/* Autor:  Hyun Bin Jeoung 587998*/
/* Übung Nr. 3*/
/* Datum: 22.10.2024*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var xi, yi;
var xk, yk;
var M;

var redBall = {
  x0: -6,
  y0: 0.1,
  diameter: 0.2
};
var slingBall = {
  x0: -0.7,
  y0: 0.5,
  diameter: 0.2
};

var points = 0;
var wind = 0;
var flagWind;

var dragging = false;

/* prepare program */
function setup() {								
  createCanvas(canvasWidth, canvasHeight);
}

/* run program */
function draw() {									
background(255);

/* administration */
  uiText();

  newButton();
  resetButton();
	
/* calculation */
  playground = {
    width: 10,
    padding: 1,
  };

  M = canvasWidth/(playground.width + 2*playground.padding);
  xi0 = (playground.width + playground.padding) * M;
  yi0 = 0.8 * canvasHeight;

  //für Windstärke 1 - 10
  flagWind = wind/10 + 8;

/* display */
  fill(115, 159, 208); 
  drawBase();

  fill(32, 75, 33); 
  drawSling();

  fill(0);
  drawSlingTip();

  fill(18, 117, 46);
  drawSlingBall();

  fill(255, 0, 0);
  drawRedBall();

  drawHindarance();

  fill(253, 216, 98);
  stroke(108, 132, 136); 
  strokeWeight(2);
  drawFlag();

  fill(0); 
  noStroke();
  drawFlagpole();

  fill(141, 161, 189); 
  stroke(130, 149, 169);
  strokeWeight(1);
  drawSlingshot();

  noStroke();
  fill(0);
  ellipse(kXi(0), kYi(0), 10); //Nullpunkt
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

    let slingTipX = -1;
    let slingTipY = 0.5;

    //distanz zwischen Maus und Spitze 
    let dx = mouseXCanvas - slingTipX;
    let dy = mouseYCanvas - slingTipY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {         //1 Meter Begrenzung
      dx = dx / distance;
      dy = dy / distance;
      
      slingBall.x0 = slingTipX + dx;
      slingBall.y0 = slingTipY + dy;
    } else if (distance < 0.3){ //0.3 Meter Begrenzung
      dx = dx / distance;
      dy = dy / distance;
      
      slingBall.x0 = slingTipX + dx * 0.3;
      slingBall.y0 = slingTipY + dy * 0.3;
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

function newButton(){
  let newCol = color(0, 255, 0);

  let buttonNew = createButton('NEW');
  buttonNew.style('font-size', '30px');
  buttonNew.style('background-color', newCol);
  buttonNew.style('border-radius', '10px');
  buttonNew.position(canvasWidth/1.4, canvasHeight/1.1);
  buttonNew.mousePressed(newPressed); //New Function
}

function newPressed(){
  //neuer Versuch mit fortlaufenden Punkten
  wind = Math.floor(random(1, 11));
  points = Math.floor(random(1, 101)); //nur zum testen von reset
  slingBall.x0 = -0.7;
  slingBall.y0 = 0.5;
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
  slingBall.x0 = -0.7;
  slingBall.y0 = 0.5;
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
  ellipse(kXi(slingBall.x0*M), kYi(slingBall.y0*M),slingBall.diameter*M);
}

function drawRedBall(){
  //ellipse(kXi(-6*M), kYi(0.1*M), 0.2*M);
  ellipse(kXi(redBall.x0*M), kYi(redBall.y0*M),redBall.diameter*M);
}

function drawSlingshot() {
  beginShape();

  vertex(kXi(-1*M), kYi(0.5*M));
  vertex(kXi(slingBall.x0*M), kYi(slingBall.y0*M));

  endShape();
}

function drawBase(){
  beginShape();

    vertex(kXi(0), kYi(0));
    vertex(kXi(0), kYi(-0.5*M));
    vertex(kXi(-10.2*M), kYi(-0.5*M));
    vertex(kXi(-10.2*M), kYi(4*M));
    vertex(kXi(-10*M), kYi(4*M));
    vertex(kXi(-10*M), kYi(0.5*M));
    vertex(kXi(-9*M), kYi(0));
    vertex(kXi(-7.6*M), kYi(0));
    vertex(kXi(-7.6*M), kYi(-slingBall.diameter*M));
    vertex(kXi(-7.4*M), kYi(-slingBall.diameter*M));
    vertex(kXi(-7.4*M), kYi(0));

    noStroke();
  endShape(CLOSE);
}

function drawSling(){
  beginShape();

    vertex(kXi(-1*M), kYi(0.5*M));
    vertex(kXi(-0.9*M), kYi(0));
    vertex(kXi(-1.1*M), kYi(0));

    noStroke();
  endShape(CLOSE);
}

function drawSlingTip(){
  circle(kXi(-1*M), kYi(0.5*M), 5);
}

function drawHindarance(){
  beginShape();

    vertex(kXi(-2.9*M), kYi(0));
    vertex(kXi(-3.1*M), kYi(0));
    vertex(kXi(-3.1*M), kYi(0.5*M));
    vertex(kXi(-2.9*M), kYi(0.5*M));

  endShape(CLOSE);
}

function drawFlag(){
  beginShape();

   vertex(kXi(-8.03*M), kYi(1.9*M));
   vertex(kXi(-8.03*M), kYi(1.5*M));
   vertex(kXi(-flagWind*M), kYi(1.7*M));

  endShape(CLOSE);
}

function drawFlagpole(){
  beginShape();

    vertex(kXi(-8*M), kYi(0));
    vertex(kXi(-8.03*M), kYi(0));
    vertex(kXi(-8.03*M), kYi(2*M));
    vertex(kXi(-8*M), kYi(2*M));

  endShape(CLOSE);
}

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
