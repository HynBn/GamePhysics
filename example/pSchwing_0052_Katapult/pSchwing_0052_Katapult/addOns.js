/*********************************** Objecte und Funktionen ******************************/

/* Abmessungen Playground und Wand */
var playground = {											// Objekt Playground
	width: 2,														// Playgroundbreite [m]
	padding: 0.1														// Ränder [m]
};

var catapult = {
	positionX: -0.5,
	width: greenBall.diameter,
	height: 0.6
}

function drawPlayground()
	{
		fill('#0000ff');
		beginShape();
			vertex(0, 0);
			vertex(0, -0.1*M);
			vertex(-playground.width*M, -0.1*M);
			vertex(-playground.width*M, 0);
			vertex(0, 0);
		endShape();
		fill('#000000');
		strokeWeight(6);
		line((catapult.positionX - greenBall.diameter)*M, 0, catapult.positionX*M, catapult.height*M);
		strokeWeight(1);
		ellipseMode(CENTER);
		ellipse(catapult.positionX*M, catapult.height*M, 0.02*M);
	}

function displayCatapult(debugging)
	{
		if(debugging)
			{
				push();
					translate(catapult.positionX*M, catapult.height*M) 		// Katapultschlinge
					noFill();
					setLineDash([10, 4, 2, 4]); //longer stitches
					ellipse(0,0,2*spring.l0*M);
				pop();
			}
	}
	
function setLineDash(list) {
  drawingContext.setLineDash(list);
}
