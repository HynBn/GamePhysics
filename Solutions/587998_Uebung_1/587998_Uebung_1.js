/* template GTAT2 Game Technology & Interactive Systems */
/* Autor: Hyun Bin Jeoung 587998*/
/* Übung Nr. 1*/
/* Datum: 08.10.2024*/

/* declarations */ 
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

/* prepare program */
function setup() {								
  createCanvas(canvasWidth, canvasHeight);
}

/* run program */
function draw() {									
  background(255);

/* administration */
  fill(0);
	text("Hyun Bin Jeoung, Maßstab: 1px = 1cm", 200, 50);

/* calculation */
	//Screen Size: 1500x830
  //1px = 1cm

/* display */

  fill(115, 159, 208); 
  drawBase();

  fill(32, 75, 33); 
  drawSling();

  fill(0);
  drawSlingTip();

  fill(18, 117, 46);
  drawBall();

  fill(141, 161, 189, 100); 
  stroke(130, 149, 169);
  strokeWeight(1);
  drawSlingshot();

  fill(255, 0, 0);
  noStroke(); //disable outline: https://p5js.org/reference/p5/noStroke/
  drawRedBall();

  drawHindarance();

  fill(253, 216, 98);
  stroke(108, 132, 136); 
  strokeWeight(2);
  drawFlag();

  fill(0); 
  noStroke();
  drawFlagpole();

  /* Comment */
  // Leider noch nicht Responisve und nur Statisch, spezifisch gesetz auf meine Screen Size
}

function drawBase() {
  // Vertex from: https://p5js.org/reference/p5/vertex/ 
  // Start drawing the shape.
  beginShape();

  // Add vertices.
  vertex(1200, 650); // top right 
  vertex(1200, 700); // to bottom right = 50cm
  vertex(200, 700); // to bottom left = 10m
  vertex(200, 150); // 5m height
  vertex(225, 150); // top left width = 25cm
  vertex(225, 600); // bevel
  vertex(325, 650);
  vertex(450, 650); // hole Top left
  vertex(450, 670); 
  vertex(470, 670);
  vertex(470, 650); // hole Top Right

  // Stop drawing the shape.
  endShape(CLOSE);
}

function drawSling() {
  beginShape();

  vertex(1090, 650);
  vertex(1110, 650);
  vertex(1100, 600);

  endShape(CLOSE);
}

function drawSlingTip() {
  //Ellipse from: https://p5js.org/reference/p5/ellipse/
  ellipse(1100, 600, 5, 5);
}

function drawBall() {
  ellipse(1150, 620, 20, 20);
}

function drawSlingshot() {
  beginShape();

  vertex(1100, 600);
  vertex(1150, 630);
  vertex(1150, 610);
  
  endShape(CLOSE);
}

function drawHindarance() {
  beginShape();
  
  vertex(910, 650);
  vertex(890, 650);
  vertex(890, 600);
  vertex(910, 600);
  
  endShape(CLOSE);
}

function drawRedBall() {
  ellipse(600, 640, 20, 20);
}

function drawFlagpole() {
  beginShape();
  
  vertex(400, 650);
  vertex(405, 650);
  vertex(405, 450);
  vertex(400, 450);
  
  endShape(CLOSE);
}

function drawFlag() {
  beginShape();
  
  vertex(400, 460);
  vertex(400, 500);
  vertex(300, 480);
  
  endShape(CLOSE);
}

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(windowWidth, windowHeight);
}
