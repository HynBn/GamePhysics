/* template GTAT2 Game Technology & Interactive Systems */
/* Autor:  Hyun Bin Jeoung 587998*/
/* Übung Nr. 2*/
/* Datum: 15.10.2024*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var xi, yi;
var xk, yk;
var M;

/* prepare program */
function setup() {								
  createCanvas(canvasWidth, canvasHeight);
}

/* run program */
function draw() {									
background(255);

/* administration */
	fill(0);
	text("Hyun Bin Jeoung 587998", 200, 50);
	
/* calculation */
  playground = {
    width: 10,
    padding: 1,
  };

  M = canvasWidth/(playground.width + 2*playground.padding);
  xi0 = (playground.width + playground.padding) * M;
  yi0 = 0.8 * canvasHeight;

/* display */
  fill(115, 159, 208); 
  drawBase();

  fill(32, 75, 33); 
  drawSling();

  fill(0);
  drawSlingTip();

  fill(18, 117, 46);
  drawBall();

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

  fill(141, 161, 189, 100); 
  stroke(130, 149, 169);
  strokeWeight(1);
  drawSlingshot();

  noStroke();
  fill(0);
  ellipse(kXi(0), kYi(0), 10); //Nullpunkt
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
    vertex(kXi(-7.6*M), kYi(-0.2*M));
    vertex(kXi(-7.4*M), kYi(-0.2*M));
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

function drawBall(){
  ellipse(kXi(-0.3*M), kYi(0.4*M), 0.2*M);
}

function drawRedBall(){
  ellipse(kXi(-6*M), kYi(0.1*M), 0.2*M);
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
   vertex(kXi(-9*M), kYi(1.7*M));

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

function drawSlingshot(){
  beginShape();

    vertex(kXi(-1*M), kYi(0.5*M));
    vertex(kXi(-0.3*M), kYi(0.5*M));
    vertex(kXi(-0.3*M), kYi(0.3*M));

  endShape(CLOSE);
}

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
