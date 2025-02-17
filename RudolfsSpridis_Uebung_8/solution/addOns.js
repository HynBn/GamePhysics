// Template GTAT2 Game Technology & Interactive Systems
// Author: Rudolfs Spridis
// Exercise Nr. 6
// Date: 29.10.2024

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

// Farben
var blueColor = '#6CA8E5';  // Blau
var greenColor = '#0D6A2C';  // Grün
var yellowColor = '#FDD862'; // Gelb für Flagge
var flagpoleColor = '#6C8488';  // Stab
var redColor = '#FF0000'; // Rot

// Koordinatensystem-Variablen
var xi0, yi0;  // Nullpunkt im internen System
var M = 100;   // Maßstab

var showAxes = true;  // Standardmäßig Achsen anzeigen

// Event Listener für die Checkbox
document.getElementById("toggleAxes").addEventListener("change", function() {
  showAxes = this.checked;
  redraw();
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  recalculateOrigin();
  resetBall();       // From the physics file
  initializeHoleEdge();
}

function recalculateOrigin() {
  M = min(windowWidth / 14, windowHeight / 4);
  xi0 = windowWidth / 2 + 5 * M;
  yi0 = windowHeight / 2;

  frameRate = 60;  // let's fix at 60 FPS
  dt = 1 / frameRate;
}

// Draw the course, ramp, etc.
function drawCourse() {
  drawRectangleBlue(kXi(-10), kYi(-0.25), 10, 0.25);  
  drawRectangleBlue(kXi(-10), kYi(0), 2.35, 0.5);     
  drawRectangleBlue(kXi(-7.35), kYi(0), 7.35, 0.5);   

  let gx = kXi(-1);
  let gy = kYi(0);
  drawGreenIsoscelesTriangle(gx, gy, 0.2, 0.5);  

  drawBlueTriangle(kXi(-10), kYi(0), 1, 0.5);
  drawRectangleBlue(kXi(-10.1), kYi(3), 0.1, 3.5);
  drawRectangleRed(kXi(-3), kYi(0.5), 0.2, 0.5);
}

function drawCoordinateSystem() {
  if (!showAxes) return;
  stroke(0);
  strokeWeight(1);
  line(0, yi0, width, yi0); // X-axis
  line(xi0, 0, xi0, height); // Y-axis
  fill(0);
  text("0", xi0 - 15, yi0 + 15);

  for (let i = 1; i <= 12; i++) text(i, xi0 - i * M, yi0 + 70);
  for (let i = 0; i <= 12; i++) text(i, xi0 + 10, yi0 - i * M);
}

function drawRectangleBlue(xi, yi, w, h) {
  fill(blueColor);
  stroke(0);
  strokeWeight(1);
  rect(xi, yi, w * M, h * M);
}

function drawRectangleRed(xi, yi, w, h) {
  fill(redColor);
  stroke(0);
  strokeWeight(1);
  rect(xi, yi, w * M, h * M);
}

function drawGreenIsoscelesTriangle(xi, yi, base, ht) {
  fill(greenColor);
  stroke(0);
  strokeWeight(1);
  triangle(xi - (base * M)/2, yi,
           xi + (base * M)/2, yi,
           xi, yi - ht * M);
}

function drawBlueTriangle(xi, yi, base, ht) {
  fill(blueColor);
  stroke(0);
  strokeWeight(1);
  triangle(xi, yi,
           xi + base * M, yi,
           xi, yi - ht * M);
}

function drawRedBall(x, y, d) {
  let ballDiameter = d * M;
  fill(redColor);
  stroke(0);
  strokeWeight(1);
  ellipse(x, y, ballDiameter, ballDiameter);
}

function kXi(a) { return a * M + xi0; }
function kYi(b) { return yi0 - b * M; }
function iXk(a) { return (a - xi0) / M; }
function iYk(b) { return (yi0 - b) / M; }

// Keep resizing logic
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateOrigin();
  resetBall();
  initializeHoleEdge();
  generateWind();
  drawFlag(windVelocity);
  redraw();
}
