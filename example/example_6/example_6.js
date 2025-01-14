/***************************************************/
/* Autor:  Dr. Volkmar Naumburger                  */
/*                                                 */
/* Übung 1 Lösungsbeispiel                         */
/* Stand: 10.10.2024                               */
/*                                                 */
/***************************************************/

/* Variablendeklaration */
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

// Instanzen von Objekten
var Start, start;												// Start/Reset-Button - toggel
var Repeat, repeat;											// New
var Debug, debug;												// Debug-Button
var ShowProfile, showProfile;						// im Debug-Modus: Anzeige Kontur
var ShowLimiter, showLimiter;						//      -"-"-      Anzeige Limiter
var StepByStep, stepByStep;							// Schrittbetrieb
var Step, step;													// Einzelschritt
var result;															// Ergebnis-Vektor (Hilfsvariable)

// Zeitrahmen
var frmRate = 60;												// Framerate: 60 Bildwechsel pro Sekunde
var timeScale = 1;
var dt = 0;															// Zeitquant [s]
var dt_ = 0;														// verkürzter Zeitquant [s]
var t = 0;															// elapsed time [s]

// geometrische Basiseinstellungen
var M;																	// Maßstab [pixel/m]
var xi0 = 0;														// Koordinaten des Nullpunktes im internen Koordinatensystems	[pixel]
var yi0 = 0;

// Status Variablen
var status = "repeat";
var run = true;													// Schrittbetrieb

/* Bälle */
var GreenBallOnCatapult;								// Instanz Mausaktiv
var greenBallOnCatapult = { 						// Objekt grüner Ball
	itemColor: '#aaaaaa',
	diameter: 0.2,
  x: -0.8, y: 0.1,											// Startsort [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 0, angle0: 0,											// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0													// aktuelle Geschwindigkeit [m/s]
};

var greenBall = { 											// physischer grüner Ball
	itemColor: '#00aa00',
	diameter: 0.2,
	x: 0, y: 0,														// Startsort [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 8, angle0: 0,											// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0,													// aktuelle Geschwindigkeit [m/s]
	s: 0,																	// Ort auf den Schrägen
	vs: 0																	// Geschwindigkeit auf den Schrägen
};

var redBall = { 												// Objekt roter Ball
	itemColor: '#ff0000',
	diameter: 0.2,
  x0: -6.0, y0: 0.1,										// Startsort [m]
  x: 0, y: 0.1,													// Ortsvariable [m]
	vx: 0, vy: 0													// Startgeschwindigkeit [m/s]
};

var profile = [];												// Kontur der playground-Oberfläche
var n, N = 13; 													// Anzahl Konturpunkte
var segmNumber = 1;											// Segmentnummer
var slopeOrigin;												// Startpunkt der Schräge -> Vektor
var beta = [];													// array Neigungswinkel der Segmente
var limiter = [];												// Begrenzer für die Bewegung auf der Segmenten
var slopeLength = [];										// Länge der Segmente
var g_ = [];														// effektive Erdbeschleunigungskonstante auf den Segmenten
var arf = [];														// Verzögerungseffekt infolge Rollreibung

// physikalische Größen
g = 9.81;																// Erdbeschleunigungskonstante m/s²
cr = 0.05;															// Rollreibungskoeffizient

function setup()
  { 
		createCanvas(canvasWidth, canvasHeight);
		setConstants();											// Systemkonstanten auf Grundlage der Fenstermaße setzen

		frameRate(frmRate);									// Fensterwechselrate
		
		M = canvasWidth/(playground.width + 2*playground.padding);					// responsiver Maßstab
		xi0 = (playground.width + playground.padding)*M;
		yi0 = 0.7*canvasHeight;
		//console.log("M: "+M+"  xi0: "+xi0+"  yi0: "+yi0);
		
		// Instanzierung
		Start = new PushButton(20, 85, 'Start', '#00ff00', true);						// xPos, yPos, onName, onColor, offName, offColor
		Repeat = new PushButton(70, 85, 'New', '#00ffff', true); 						// xPos, yPos, onName, onColor, modus
		Debug = new ToggleButton(85, 5, 'debug', '#ff0000', 'run', '#00ff00'); // xPos, yPos, onName, onColor, offName, offColor
		ShowProfile = new ToggleButton(10, 15, 'Profile', '#ffff00', 'no', '#aaaaaa');
		ShowLimiter = new ToggleButton(20, 15, 'Limiter', '#ffff00', 'no', '#aaaaaa');
		StepByStep = new ToggleButton(80, 15, 'step', '#ffff00', 'cont', '#aaaaaa');
		Step = new PushButton(90, 15, 'next', '#ffff00', true);
		GreenBallOnCatapult = new Circle(M, 0.5*greenBallOnCatapult.diameter, true, greenBallOnCatapult.itemColor, 'b');	// M, r, visible, c, mode

		// Profil berechnen
		calculateProfile();
		for (n = 0; n < N-1; n++)
			{
				beta[n] = atan2(profile[n+1].y - profile[n].y, profile[n+1].x - profile[n].x);
				//console.log("beta"+[n]+": "+degrees(beta[n])+"°");
				slopeLength[n] = sqrt(sq(profile[n+1].y - profile[n].y) + sq(profile[n+1].x - profile[n].x));
				//console.log("Segmentlänge"+[n]+": "+slopeLength[n]+"m");
				if(beta[n] < 0.45*PI && beta[n] > -0.45*PI)
					{ // Beschränken auf Winkel im Bereich +/- 0.2*PI
						g_[n] = g*sin(beta[n]);					// effektive Erdbeschleunigungskonst.
						//console.log("g'"+[n]+": "+nf(g_[n],1,3));
						arf[n] = g*cr*cos(beta[n]);				// effektive Bremsverzögerung
						//console.log("Rollreibung"+[n]+": "+formatNumber(arf[n],0,3));
					}
				else
				{	// senkrechte Segmente
					g_[n] = 9.81;
					arf[n] = 0;
				}
			}

		slopeOrigin = createVector(profile[1].x, profile[1].y);
		
		// Berechnung der Limiter
		for (n = 0; n < N-2; n++)
			{
				limiter[n] = 0.5*greenBall.diameter*tan(0.5*(beta[n+1] - beta[n]));
				//console.log("limiter"+[n]+": "+limiter[n]);
			}
  } 

function draw()
	{ 
		background('#eeeeff');											// refresh canvas
	
		/* administration */
		fill(0);
		textSize(2*fontSize);
		prepareScreen("Minigolf", "5. Übung",'#0000ff', 50, 10);		// headline, subline, c, middleX, middleY
		textSize(1.2*fontSize);
		displayLine("Status: "+status+"  Segment: "+segmNumber, 0, "CENTER", 50, 25);
		displayLine("angle: "+nf(degrees(beta[segmNumber]),1,2)+"  g': "+formatNumber(g_[segmNumber],1,2)+"m/s²  vs: " + formatNumber(greenBall.vs,2,3) + "m/s", 0, "CENTER", 50, 30);
		//displayLine("dt': "+nf(dt_,1,5)+" (dt: "+nf(dt,1,5)+")", 0, "CENTER", 50, 35);
		// Start/Reset
		if (Start.drawButton(true)) status ="start";
		if (Repeat.drawButton(true)) status = "repeat";
		// Debugging
		debug = Debug.drawButton();
		if (debug)
			{
				showProfile = ShowProfile.drawButton();
				showLimiter = ShowLimiter.drawButton();
				stepByStep = StepByStep.drawButton();
				step = Step.drawButton(true);
			}
		
		/* calculation */
		
		if (stepByStep && debug) // Debugging: Schrittbetrieb
			{
				if (step) run = true;
			}
		else
			run = true;
			
		if (run)
			{
				run = false;
				
				switch (status)
					{
						case "start":
											dt = timeScale/frmRate;							// Zeitquant wiederherstellen
											greenBall.s = limiter[0];
											greenBall.vs = 0;
											greenBall.x = limiter[0]*cos(beta[1]);
											segmNumber = 1;
											status = "onSlope";
											break;
						case "onFlight":
											greenBall.x = greenBall.x + greenBall.vx*dt;									// schräger Wurf
											greenBall.vy = greenBall.vy - g*dt;
											greenBall.y = greenBall.y + greenBall.vy*dt;									
											if (greenBall.y <= 0.5*greenBall.diameter)
												{	// Playground erreicht
													greenBall.vy = 0;
													status = "onGround";	// Statuswechsel
												}
											if (greenBall.x <= barrier.positionX + 0.5*(barrier.width + greenBall.diameter) && greenBall.x >= barrier.positionX - 0.5*(barrier.width + greenBall.diameter) && greenBall.y <= barrier.height + 0.5*greenBall.diameter)
												{	// Reflexion am Hindernis
													status = "onFlight";
													greenBall.x = barrier.positionX + 0.5*(barrier.width + greenBall.diameter); // Ortskorrektur
													greenBall.vx = -greenBall.vx;
												}
											break;
						case "onGround":									
											greenBall.vx = greenBall.vx - g*cr*Math.sign(greenBall.vx)*dt;		// Rollreibungseinfluss
											if (abs(greenBall.vx) < arf[2]*dt) greenBall.vx = 0;										// Stillstand
											greenBall.x = greenBall.x + greenBall.vx*dt;
											greenBall.y = 0.5*greenBall.diameter;															// Korrektur
									/*		if (greenBall.x <= hole.positionX + 0.5*greenBall.diameter && greenBall.x >= hole.positionX - 0.5*greenBall.diameter)
												{	// Ball fällt ins Loch
													greenBall.vx = 0;		// Bewegung anhalten
													status = "end";
												}
											if (greenBall.x <= barrier.positionX + 0.5*(barrier.width + greenBall.diameter) && greenBall.x >= barrier.positionX - 0.5*(barrier.width + greenBall.diameter))
												{	// Reflexion am Hindernis
													if (greenBall.vx <= 0)
														greenBall.x = barrier.positionX + 0.5*(barrier.width + greenBall.diameter); // Ortskorrektur
													else
														greenBall.x = barrier.positionX - 0.5*(barrier.width + greenBall.diameter); // Ortskorrektur
													greenBall.vx = -greenBall.vx;
													status = "onGround";
												} */
											if (greenBall.x <= profile[2].x + limiter[1])
												{	// Rückkehr auf die linke Schräge
													greenBall.s = slopeLength[1] - limiter[1];
													greenBall.vs = greenBall.vx;
													segmNumber = 1;
													status = "onSlope";
												}
											//console.log(greenBall.x+"  "+(profile[11].x - limiter[10]));
											if (greenBall.x >= profile[11].x - limiter[10])
												{	// rechte Schräge
													greenBall.s = limiter[10];
													greenBall.vs = greenBall.vx;
													segmNumber = 11;
													status = "onSlope";
												}
											break;
						case "onSlope":
											greenBall.vs = greenBall.vs - (g_[segmNumber] + Math.sign(greenBall.vs)*arf[segmNumber])*dt; // mit Rollreibung
											//console.log(nf(g_[segmNumber],1,3)+"  "+nf(degrees(beta[segmNumber]),2,3)+"  "+Math.sign(greenBall.vs)*arf[segmNumber]);
											greenBall.s = greenBall.s + greenBall.vs*dt;
											greenBall.x = profile[segmNumber].x + greenBall.s*cos(beta[segmNumber]);
											//dt_ = (slopeLength[segmNumber] - limiter[segmNumber - 1] - greenBall.s)/greenBall.vs;
											
											if(greenBall.s >= slopeLength[1] - limiter[1] && segmNumber == 1)
												{ // Linke Schräge: Übergang zu ground, Parameterübergabe und Statuswechsel
													greenBall.x = profile[2].x + limiter[1];
													greenBall.y = 0.5*greenBall.diameter;
													greenBall.vx = greenBall.vs;
													segmNumber = 2;
													status = "onGround";
												}
											if(greenBall.s <= limiter[10] && segmNumber == 11)
												{ // Rechte Schräge: Übergang zu ground, Parameterübergabe und Statuswechsel
													greenBall.x = profile[11].x - limiter[10];
													greenBall.y = 0.5*greenBall.diameter;
													greenBall.vx = greenBall.vs;
													segmNumber = 10;
													status = "onGround";
												}
											break;
						case "end": 
											dt = 0;															// Bewegung anhalten
											break;
						case "repeat":
						default:	// Startsituation wieder herstellen
											greenBall.s = limiter[0];
											greenBall.vs = 0;
											greenBall.x = limiter[0]*cos(beta[1]);
											segmNumber = 1;
											/*greenBall.x = catapult.positionX;	// Einstellung für die 4. Übung
											greenBall.y = catapult.height + 0.5*greenBall.diameter;
											greenBall.vx = greenBall.vx0;
											greenBall.vy = greenBall.vy0;*/
											break;
					}
			}
		// Startparameter grüner Ball auf dem Katapult ermitteln
		result = GreenBallOnCatapult.inCircle(greenBallOnCatapult.x, greenBallOnCatapult.y);		// x, y [m]
		greenBallOnCatapult.x = result[1];
		greenBallOnCatapult.y = result[2];
		//console.log("x: "+greenBallOnCatapult.x+" y: "+greenBallOnCatapult.y)
		greenBall.angle0 = atan2(greenBallOnCatapult.y - catapult.height, greenBallOnCatapult.x - catapult.positionX) + PI;
		greenBall.vx0 = greenBall.v0*cos(greenBall.angle0);
		greenBall.vy0 = greenBall.v0*sin(greenBall.angle0);

		/* display */
		push();
			translate(xi0, yi0);
			scale(1,-1);
				markOrigin(10);
				drawPlayground();
				fill(redBall.itemColor);
				ellipse(redBall.x*M, redBall.y*M, redBall.diameter*M);
				fill(greenBall.itemColor);
				switch (status)
					{
						case "end":
						case "onGround":
						case "onFlight":
							ellipse(greenBall.x*M, greenBall.y*M, greenBall.diameter*M);
							break;
						case "start":
						case "repeat":
						case "onSlope":
							push();
								translate(profile[segmNumber].x*M, profile[segmNumber].y*M);
								rotate(beta[segmNumber]);
								ellipse(greenBall.s*M, 0.5*greenBall.diameter*M, greenBall.diameter*M);
							pop();
					}
				stroke('#000000');
				strokeWeight(3);
				line(catapult.positionX*M, catapult.height*M, greenBallOnCatapult.x*M, greenBallOnCatapult.y*M);

				// Debugging
				fill(0);
				strokeWeight(1);
				displayProfile(showProfile);
				displayLimiter(showLimiter);
				displayMoveX(debug);
		pop();
	}

/* Subroutines */

/* isr */
function windowResized() {						/* responsive design */
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  resizeCanvas(canvasWidth, canvasHeight);
}
