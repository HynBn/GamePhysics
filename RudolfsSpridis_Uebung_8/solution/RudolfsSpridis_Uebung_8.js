// template gtat2 game technology & interactive systems
// author: rudolfs spridis
// exercise nr. 8
// date: 10.01.2025

/* 
    NEU: Wind korrigiert & Feder hinzugefügt
*/

// -------------------------------------------------------------------------
// GLOBALS
// -------------------------------------------------------------------------
let greenBall = { x: 0, y: 0, radius: 2 };
let greenTriangleTop = {};
let angle = 45;
let gravity = 9.81;
let greenBallSpeedX = 0;
let greenBallSpeedY = 0;
let isDragging = false;
let points = 0;
let holeEdgeX;

// 60 FPS => dt = 1/60
let frameRateVal = 60;
let dt = 1 / frameRateVal;

const MAX_CATAPULT_VELOCITY = 30;    // not used for the spring, but kept
const rollingResistance = 0.5;
const restitution = 0.5;

// Wind
let windVelocity = 0;   
const windScale  = 1;  
const cw         = 0.45; 
const rhoLuft    = 1.3; 
const ballArea   = 0.2; 
const ballMass   = 5;

// Feder
const springK    = 50;    // N/m
const restLength = 0.25;  // 25 cm
const rOverM     = 0.8;   // damping ratio => r= 0.8* ballMass
let springD      = rOverM * ballMass; 

// FAKTOR UM DIE GESCHWINDIGKEIT ZU ÄNDERN (1 ist Physikalisch Korrekt, nur ist der ball dann zu langsam um zu fliegen)
let springFactor = 7.0;  // kann man ändern

const pxToMeter  = 100;

// states
const states = {
  RESET:          'RESET',
  DRAGGING:       'DRAGGING',
  LOCKED:         'LOCKED',
  SLOPED_THROW:   'SLOPED_THROW',
  SLOPE_ROLL:     'SLOPE_ROLL',
  LEVEL_MOVEMENT: 'LEVEL_MOVEMENT',
  SPRING_LAUNCH:  'SPRING_LAUNCH'  // new
};
let currentState = states.RESET;

// -------------------------------------------------------------------------
// getRedRect()
// -------------------------------------------------------------------------
function getRedRect() {
  const rx = kXi(-3);
  const ry = kYi(0.5);
  const rw = 0.2 * M;
  const rh = 0.5 * M;
  return { x: rx, y: ry, w: rw, h: rh };
}

// -------------------------------------------------------------------------
// resetBall()
// -------------------------------------------------------------------------
function resetBall() {
  greenTriangleTop.x = kXi(-1);
  greenTriangleTop.y = kYi(0) - 0.5 * M;

  greenBall.x = greenTriangleTop.x;
  greenBall.y = greenTriangleTop.y;
  greenBall.radius = 0.1 * M; // smaller ball

  greenBallSpeedX = 0;
  greenBallSpeedY = 0;

  generateWind();
  currentState = states.RESET;
  updateInfoField();
  redraw();
}

// -------------------------------------------------------------------------
// generateWind()
// random [-25..25], kann mit windVelocity gescaled werden
// -------------------------------------------------------------------------
function generateWind() {
  const raw = Math.random() * 50 - 25;
  windVelocity = raw * windScale;
  updateFlag(windVelocity);
  updateInfoField();
}

// -------------------------------------------------------------------------
// applyWindDrag()
// - windVelocity>0 => nach links
// - windVelocity<0 => nach rechts
// - windVelocity=0 => kein effect
// -------------------------------------------------------------------------
function applyWindDrag() {
  let windSpeedAbs = Math.abs(windVelocity);
  let fDrag = 0.5 * cw * rhoLuft * ballArea * (windSpeedAbs ** 2);
  let aDrag = fDrag / ballMass;
  let speedChange = aDrag * dt;

  switch (true) {
    case (windVelocity > 0):
      greenBallSpeedX -= speedChange;
      break;
    case (windVelocity < 0):
      greenBallSpeedX += speedChange;
      break;
    default:
      break;
  }
}

// -------------------------------------------------------------------------
// updateGreenBallPosition()
// -------------------------------------------------------------------------
function updateGreenBallPosition() {
  switch (currentState) {
    case states.SPRING_LAUNCH:
      springCatapultMotion();
      break;
    case states.SLOPED_THROW:
      projectileMotion();
      break;
    case states.SLOPE_ROLL:
      slopeRoll();
      break;
    case states.LEVEL_MOVEMENT:
      levelRoll();
      break;
  }
}

// -------------------------------------------------------------------------
// springCatapultMotion()
// FEDER
// -------------------------------------------------------------------------
function springCatapultMotion() {
  // 

  let dx = greenBall.x - greenTriangleTop.x;
  let dy = greenBall.y - greenTriangleTop.y;
  let dist = Math.sqrt(dx*dx + dy*dy);

  // ball wird dann abgefeuert wenn er über katapult rüberfliegt
  if (dist <= restLength * pxToMeter) {
    currentState = states.SLOPED_THROW;
    updateInfoField();
    return;
  }

  let dirX = dx / dist;
  let dirY = dy / dist;

  let extension = (dist / pxToMeter) - restLength;
  // springfactor um die geschwindigkeit zu ändern
  let fs = springFactor * springK * extension;

  let vx = greenBallSpeedX, vy = greenBallSpeedY;
  let speed = Math.sqrt(vx*vx + vy*vy);
  let fd = 0, dirDampX=0, dirDampY=0;
  if (speed>0) {
    fd = springD * speed; 
    dirDampX = vx / speed;
    dirDampY = vy / speed;
  }

  let Fx = -fs * dirX - fd * dirDampX;
  let Fy = -fs * dirY - fd * dirDampY + (ballMass * gravity);

  let ax = Fx / ballMass;
  let ay = Fy / ballMass;

  greenBallSpeedX += ax * dt;
  greenBallSpeedY += ay * dt;

  // wind
  applyWindDrag();

  greenBall.x += greenBallSpeedX * pxToMeter * dt;
  greenBall.y += greenBallSpeedY * pxToMeter * dt;

}

// -------------------------------------------------------------------------
// projectileMotion()
// ball fliegt
// -------------------------------------------------------------------------
function projectileMotion() {
  greenBall.x += greenBallSpeedX * pxToMeter * dt;
  greenBall.y += greenBallSpeedY * pxToMeter * dt;

  greenBallSpeedY += gravity * dt;
  applyWindDrag();

  handleWallCollision();    
  handleRedRectCollision();

  let rx2 = kXi(-10), ry2 = kYi(0.5);
  let rx3 = kXi(-9),  ry3 = kYi(0);
  if (greenBall.x >= rx2 && greenBall.x <= rx3) {
    let slope = (ry3 - ry2) / (rx3 - rx2);
    let rampY = ry2 + slope * (greenBall.x - rx2);
    if (greenBall.y >= rampY) {
      greenBall.y = rampY + greenBall.radius;
      currentState = states.SLOPE_ROLL;
      updateInfoField();
      return;
    }
  }

  let floorY= kYi(0);
  if (greenBall.y >= floorY) {
    greenBall.y = floorY;
    greenBallSpeedY = 0;
    currentState = states.LEVEL_MOVEMENT;
    updateInfoField();
  }
}

// -------------------------------------------------------------------------
// slopeRoll()
// ball rollt
// -------------------------------------------------------------------------
function slopeRoll() {
  let sx = kXi(-10), sy = kYi(0.5);
  let ex = kXi(-9),  ey = kYi(0);
  let slopeVal = (ey - sy) / (ex - sx);
  let slopeAngle = Math.atan(slopeVal);

  greenBallSpeedX += gravity * Math.sin(slopeAngle)* dt;
  applyWindDrag();
  greenBallSpeedX -= 0.02 * greenBallSpeedX* dt;

  greenBall.x += greenBallSpeedX* pxToMeter* dt;
  greenBallSpeedX -= Math.sign(greenBallSpeedX) * rollingResistance* dt;

  let yOnSlope= sy + slopeVal*(greenBall.x - sx);
  greenBall.y= yOnSlope;

  let wallX= kXi(-10.1);
  if (greenBall.x - greenBall.radius <= wallX) {
    greenBall.x= wallX + greenBall.radius;
    greenBallSpeedX= -greenBallSpeedX * restitution;
  }
  if (greenBall.x>= ex) {
    greenBall.x= ex;
    greenBall.y= ey;
    greenBallSpeedX= Math.abs(greenBallSpeedX);
    greenBallSpeedY= 0;
    currentState= states.LEVEL_MOVEMENT;
    updateInfoField();
  }
}

// -------------------------------------------------------------------------
// levelRoll()
// ball rollt
// -------------------------------------------------------------------------
function levelRoll() {
  let speed = Math.sqrt(greenBallSpeedX**2 + greenBallSpeedY**2);
  if (speed > 0) {
    let fric = rollingResistance * dt;
    greenBallSpeedX -= fric * (greenBallSpeedX / speed);
    greenBallSpeedY -= fric * (greenBallSpeedY / speed);
  }
  applyWindDrag();

  greenBall.x += greenBallSpeedX * pxToMeter* dt;
  greenBall.y += greenBallSpeedY * pxToMeter* dt;

  handleRedRectCollision();

  let rx2= kXi(-10), ry2= kYi(0.5);
  let rx3= kXi(-9),  ry3= kYi(0);
  if (greenBall.x>= rx2 && greenBall.x<= rx3) {
    let slope= (ry3 - ry2)/(rx3 - rx2);
    let rampY= ry2 + slope*(greenBall.x- rx2);
    if (greenBall.y>= rampY- greenBall.radius) {
      greenBall.y= rampY+ greenBall.radius;
      currentState= states.SLOPE_ROLL;
      updateInfoField();
      return;
    }
  }

  let floorY= kYi(0);
  if (greenBall.y> floorY) {
    greenBall.y= floorY;
  }
}

// -------------------------------------------------------------------------
// handleWallCollision()
// -------------------------------------------------------------------------
function handleWallCollision() {
  if (currentState=== states.SPRING_LAUNCH) {
    // no collisions
    return;
  }
  let wx = kXi(-10.1);
  if (greenBall.x - greenBall.radius <= wx) {
    greenBall.x= wx+ greenBall.radius;
    greenBallSpeedX= -greenBallSpeedX* restitution;
  }
}

// -------------------------------------------------------------------------
// handleRedRectCollision()
// -------------------------------------------------------------------------
function handleRedRectCollision() {
  if (currentState=== states.SPRING_LAUNCH) {
    // keine collisions
    return;
  }
  let { x, y, w, h } = getRedRect();
  let r = greenBall.radius;
  if (
    greenBall.x + r > x && greenBall.x - r < x + w &&
    greenBall.y + r > y && greenBall.y - r < y + h
  ) {
    greenBall.x-= greenBallSpeedX* pxToMeter* dt;
    greenBall.y-= greenBallSpeedY* pxToMeter* dt;
    greenBallSpeedX= -greenBallSpeedX* restitution;
    greenBallSpeedY= -greenBallSpeedY* restitution;
    greenBallSpeedX*= 0.9;
    greenBallSpeedY*= 0.9;
  }
}

// -------------------------------------------------------------------------
// buttons
// -------------------------------------------------------------------------
document.getElementById("newButton").addEventListener("click", () => {
  if (currentState=== states.LOCKED) {

    currentState= states.SPRING_LAUNCH;
    updateInfoField();
    redraw();
  }
});
document.getElementById("resetButton").addEventListener("click", () => {
  resetBall();
  points= 0;
  generateWind();
  updateInfoField();
  redraw();
});

// -------------------------------------------------------------------------
// drawGreenBall()
// -------------------------------------------------------------------------
function drawGreenBall() {
  fill('#0D6A2C');
  stroke(0);
  strokeWeight(1);

  let r= greenBall.radius;
  ellipse(greenBall.x, greenBall.y- r, 2*r, 2*r);

  if (currentState=== states.DRAGGING || currentState=== states.LOCKED || currentState=== states.SPRING_LAUNCH) {
    stroke(0); 
    strokeWeight(2);
    line(greenTriangleTop.x, greenTriangleTop.y, greenBall.x, greenBall.y - r);
    fill('rgba(173,216,230,0.3)');
    noStroke();
    ellipse(greenTriangleTop.x, greenTriangleTop.y, 2*M, 2*M);
  }
}

// -------------------------------------------------------------------------
// Maus Logik für das abfeuern
// -------------------------------------------------------------------------
function mousePressed() {
  if (currentState=== states.RESET) {
    let distBall= dist(mouseX, mouseY, greenBall.x, greenBall.y);
    if (distBall< greenBall.radius* 1.2) {
      isDragging= true;
      currentState= states.DRAGGING;
      updateInfoField();
    }
  }
}

function mouseDragged() {
  if (currentState=== states.DRAGGING && isDragging) {
    let dd= dist(mouseX, mouseY, greenTriangleTop.x, greenTriangleTop.y);
    dd= constrain(dd, 0.3*M, 1*M);

    angle= atan2(greenTriangleTop.y- mouseY, mouseX- greenTriangleTop.x);

    greenBall.x= mouseX;
    greenBall.y= mouseY;
  }
}

function mouseReleased() {
  if (currentState=== states.DRAGGING && isDragging) {
    isDragging= false;
    // we do not set velocity here => we wait for "NEW" => spring
    currentState= states.LOCKED;
    updateInfoField();
  }
}

// -------------------------------------------------------------------------
// flagge malen und wind zeigen
// -------------------------------------------------------------------------
function drawFlag(windSpeed) {
  let flagpoleHeight= M;
  let flagWidth= (Math.abs(windSpeed)/25)* M* 0.3;
  let flagHeight= M* 0.2;
  let x= kXi(-8), y= kYi(1);

  fill(flagpoleColor);
  stroke(0);
  strokeWeight(1);
  rect(x, y, 5, flagpoleHeight);

  fill(windSpeed>=0? "green": "red");
  triangle(
    x, y,
    x, y+ flagHeight,
    x- Math.sign(windSpeed)* flagWidth,
    y+ flagHeight/2
  );
}

function updateFlag(windSpeed) {
  let flagpoleHeight= M;
  let flagWidth= (Math.abs(windSpeed)/25)* M* 0.3;
  let flagHeight= M* 0.2;
  let x= kXi(-8), y= kYi(1);

  fill(flagpoleColor);
  stroke(0);
  strokeWeight(1);
  rect(x, y, 5, flagpoleHeight);

  fill(windSpeed>=0? "green": "red");
  triangle(
    x, y,
    x, y+ flagHeight,
    x- Math.sign(windSpeed)* flagWidth,
    y+ flagHeight/2
  );
}

// -------------------------------------------------------------------------
// initializeHoleEdge + updateInfoField
// -------------------------------------------------------------------------
function initializeHoleEdge() {
  holeEdgeX= kXi(-7.5);
}

function updateInfoField() {
  let spd= Math.sqrt(greenBallSpeedX**2 + greenBallSpeedY**2).toFixed(2);
  document.getElementById('infoField').innerHTML=
    `points: ${points}<br>
     state: ${currentState}<br>
     wind: ${windVelocity.toFixed(2)} m/s<br>
     speed: ${spd} m/s`;
}

// -------------------------------------------------------------------------
// main draw
// -------------------------------------------------------------------------
initializeHoleEdge();
resetBall();

function draw() {
  background(255);
  drawCoordinateSystem();
  drawCourse();
  drawFlag(windVelocity*3);

  drawRedBall(kXi(-6), kYi(0.1), 0.2);

  updateGreenBallPosition();
  drawGreenBall();
}
