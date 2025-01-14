/*********************************** Objecte und Funktionen ******************************/

/* Abmessungen Playground und Wand */
var playground = {											// Objekt Playground
	width: 10,														// Playgroundbreite [m]
	padding: 1														// Ränder [m]
};

var slope = {														// Schiefe Ebene
	width: 1.0,
	height: 0.5
};

var hole = {
	positionX: -7.5,
	width: 1.05*redBall.diameter,
	depth: 2*redBall.diameter
};

var barrier = {
	positionX: -3,
	width: 1.05*redBall.diameter,
	height: 0.5
};

var catapult = {
	positionX: -1,
	width: redBall.diameter,
	height: 0.5
}

function markOrigin(diam)									// markiere Nullpunkt
	{
		stroke(0);
		noFill();
		ellipse(0,0,diam);
	}

function drawPlayground()
	{
		fill('#0000ff');
		beginShape();
			vertex(0, 0);
			vertex(0, -0.5*M);
			vertex(-(playground.width + 0.1)*M, -0.5*M);
			vertex(-(playground.width + 0.1)*M, 0.6*canvasHeight);
			vertex(-playground.width*M, 0.6*canvasHeight);
			vertex(-playground.width*M, slope.height*M);
			vertex(-(playground.width - slope.width)*M, 0);
			vertex((hole.positionX - 0.5*hole.width)*M, 0);
			vertex((hole.positionX - 0.5*hole.width)*M, -hole.depth*M);
			vertex((hole.positionX + 0.5*hole.width)*M, -hole.depth*M);
			vertex((hole.positionX + 0.5*hole.width)*M, 0);
			vertex(0, 0);
		endShape();
		fill('#ff0000');
		rectMode(CENTER);
		rect(barrier.positionX*M, 0.5*barrier.height*M, barrier.width*M, barrier.height*M);
		fill('#000000');
		push();
		translate(catapult.positionX*M, 0);
			triangle(-0.5*catapult.width*M, 0, 0, catapult.height*M, 0.5*catapult.width*M, 0);
		pop();
	}

function calculateProfile()
	{
		profile[0] = createVector(-playground.width, 0.6*canvasHeight/M);
		profile[1] = createVector(-playground.width, slope.height);
		profile[2] = createVector(-playground.width + slope.width, 0);
		profile[3] = createVector(hole.positionX - 0.5*hole.width, 0);
		profile[4] = createVector(hole.positionX - 0.5*hole.width, -hole.depth);
		profile[5] = createVector(hole.positionX + 0.5*hole.width, -hole.depth);
		profile[6] = createVector(hole.positionX + 0.5*hole.width, 0);
		profile[7] = createVector(barrier.positionX - 0.5*barrier.width, 0);
		profile[8] = createVector(barrier.positionX - 0.5*barrier.width, barrier.height);
		profile[9] = createVector(barrier.positionX + 0.5*barrier.width, barrier.height);
		profile[10] = createVector(barrier.positionX + 0.5*barrier.width, 0);
		profile[11] = createVector(catapult.positionX - 0.5*catapult.width, 0);
		profile[12] = createVector(catapult.positionX, catapult.height);
		profile[13] = createVector(catapult.positionX + 0.5*catapult.width, 0);
		profile[14] = createVector(0, 0);
	}

function displayProfile(debugging)
	{
		if(debugging)
			{
				strokeWeight(5);
				stroke('#ff00ff');
				for (n = 0; n < N-1; n++)
					{
						line(profile[n].x*M, profile[n].y*M,profile[n+1].x*M, profile[n+1].y*M);
					}
			}
	}
	
function displayLimiter(debugging)
	{
		if(debugging)
			{
				strokeWeight(1);
				stroke(0);
				push();								// 0. limiter
					translate(profile[0].x*M, profile[0].y*M);
					rotate(beta[0]);
						line((slopeLength[0] - limiter[0])*M, 10, (slopeLength[0] - limiter[0])*M, -10);	
				pop();
				for (n = 0; n < N-1; n++)
					{
						push();						// alle weiteren limiter
							translate(profile[n+1].x*M, profile[n+1].y*M);
							rotate(beta[n+1]);
								line(limiter[n]*M, 10, limiter[n]*M, -10);
								line((slopeLength[n+1] - limiter[n+1])*M, 10, (slopeLength[n+1] - limiter[n+1])*M, -10);	
								noStroke();
								textSize(0.6*fontSize);
								//text(n, limiter[n]*M, 25);					
						pop();
					}
			}
	}			
