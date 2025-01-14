/***************************************************/
/* Autor:  Dr. Volkmar Naumburger                  */
/*                                                 */
/* Übung 8 Lösungsbeispiel                         */
/* Stand: 24.12.2024                               */
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
var preparedForStart = false;						// Startvorbereitungen ready

/* Bälle */
var AktivCatapultEnd;								// Instanz Mausaktiv
var aktivCatapultEnd = { 						// Objekt grüner Ball
	itemColor: '#aaaaaa',
	diameter: 0.2,
  x: 0, y: 0,														// Ort des Katapultendes [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 0, angle0: 0,											// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0													// aktuelle Geschwindigkeit [m/s]
};

var greenBall = { 											// physischer grüner Ball
	itemColor: '#00aa00',
	diameter: 0.2,
	mass: 0.05,				   									// Ballmasse in kg
	x: 0, y: 0,														// Startsort [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 10, angle0: 0,										// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0,													// aktuelle Geschwindigkeit [m/s]
	s: 0,																	// Ort auf den Schrägen
	vs: 0																	// Geschwindigkeit auf den Schrägen
};

var redBall = { 												// Objekt roter Ball
	itemColor: '#ff0000',
	diameter: 0.2,
	mass: 0.005,				   								// Ballmasse in kg
  x0: -6.0, y0: 0.1,										// Startsort [m]
  x: 0, y: 0.1,													// Ortsvariable [m]
	vx: 0, vy: 0													// Startgeschwindigkeit [m/s]
};

var spring = {													// Katapult Feder
	l0: 0.25,															// Ruhefederlänge [m]
	n: 50,																// Federkonstante [m/N]
	s: 0,																	// Federweg [m]
	phi: 0,																// Federwinkel
	friction: 0.8													// Reibungseinfluss
};

var profile = [];												// Kontur der playground-Oberfläche
var n, N = 13; 													// Anzahl Konturpunkte
var segmNumber = 1;											// Segmentnummer
var slopeOrigin;												// Startpunkt der Schräge -> Vektor
var beta = [];													// array Neigungswinkel der Segmente
var limiter = [];												// Begrenzer für die Bewegung auf der Segmenten
var slopeLength = [];										// Länge der Segmente
var g_ = [];														// effektive Erdbeschleunigungskonstante auf den Segmenten
var a_rf = [];													// negative Beschleunigung infolge Rollreibung

// physikalische Größen
var g = 9.81;														// Erdbeschleunigungskonstante m/s²
var cr = 0.05;													// Rollreibungskoeffizient
var rho = 1.3;         									// Luftdichte in kg/m³
var cw = 0.45;         									// cw-Wert Vollkugel bei v > 5 m/s
var tau;								     						// Zeitkonstante nach Newton
var Fn, Fn0;														// akt. Federkraft, Federkraft bei t = 0
var sqOmega0;														// Quadrat der Eigenfrequenz
  
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
		AktivCatapultEnd = new Circle(M, 0.5*aktivCatapultEnd.diameter, true, aktivCatapultEnd.itemColor, 'b');	// M, r, visible, c, mode

		// Profil berechnen
		calculateProfile();
		for (n = 0; n < N-1; n++)
			{
				beta[n] = atan2(profile[n+1].y - profile[n].y, profile[n+1].x - profile[n].x);
				slopeLength[n] = sqrt(sq(profile[n+1].y - profile[n].y) + sq(profile[n+1].x - profile[n].x));
				//console.log(n+": beta = "+nf(degrees(beta[n]),2,0)+"° Segmentlänge = " + nf(slopeLength[n],1,2)+"m");
				if(beta[n] < 0.45*PI && beta[n] > -0.45*PI)
					{ // Beschränken auf Winkel im Bereich +/- 0.2*PI
						g_[n] = g*sin(beta[n]);
						//console.log("g'"+[n]+": "+nf(g_[n],1,3));
						a_rf[n] = g*cr*cos(beta[n]);
						//console.log("Rollreibung"+[n]+": "+formatNumber(a_rf[n],0,3));
					}
			}

		slopeOrigin = createVector(profile[1].x, profile[1].y);
		
		// Berechnung der Limiter
		for (n = 0; n < N-2; n++)
			{
				limiter[n] = 0.5*greenBall.diameter*tan(0.5*(beta[n+1] - beta[n]));
				//console.log(n+": limiter: "+limiter[n]);
			}

		tau = greenBall.mass/(rho*cw*PI*sq(greenBall.diameter/2));      // Zeitkonstante nach Newton
		
		spring.s = spring.l0 + greenBall.mass*g/spring.n;				// init der Katapult-Feder
		spring.phi = -HALF_PI;
		sqOmega0 = spring.n/greenBall.mass;
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
		//displayLine("angle: "+nf(degrees(beta[segmNumber]),1,2)+"  g': "+formatNumber(g_[segmNumber],1,2)+"m/s²  vs: " + formatNumber(greenBall.vs,2,3) + "m/s", 0, "CENTER", 50, 28);
		displayLine("Katapult: ", 0, "CENTER", 50, 31);
		displayLine("s: "+formatNumber(spring.s,2,2)+"m  phi: "+nf(degrees(spring.phi),1,2)+"°  Fn0: "+formatNumber(Fn0,1,2)+"N  vs: " + formatNumber(greenBall.vs,2,3) + "m/s", 0, "CENTER", 50, 34);
		//displayLine("dt': "+nf(dt_,1,5)+" (dt: "+nf(dt,1,5)+")", 0, "CENTER", 50, 35);
		
		// Start/Reset
		if (Start.drawButton(true))
			{
				// Startsituation herstellen
				spring.phi = -HALF_PI;
				spring.s = spring.l0 + greenBall.mass*g/spring.n;
				greenBall.x = catapult.positionX + spring.s*cos(spring.phi);
				greenBall.y = catapult.height + spring.s*sin(spring.phi);
				greenBall.vx = 0;
				greenBall.vy = 0;
				preparedForStart = false;
				segmNumber = 12;
				status ="start";
			}
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
											// Startparameter grüner Ball auf dem Katapult ermitteln
											result = AktivCatapultEnd.inCircle(greenBall.x, greenBall.y);		// x, y [m]
											if (result[0]) preparedForStart = true;
											greenBall.x = result[1];
											greenBall.y = result[2];
											if(greenBall.y <= 0.5*greenBall.diameter + 0.01) greenBall.y = 0.5*greenBall.diameter + 0.01; //Begrenzung nach unten
											// in Polark. wandeln	
											spring.phi = atan2(greenBall.y - catapult.height, greenBall.x - catapult.positionX); 	// Katapult Anschlagwinkel
											spring.s = sqrt(sq(greenBall.y - catapult.height) + sq(greenBall.x - catapult.positionX)); 	// aktuelle Federlänge
											Fn0 = (spring.s - spring.l0)*spring.n;		// Betrag der Federkraft beim Ziehen des Katapults
											if (Fn0 < 0) Fn0 = 0;											// Katapults hängt schlaff
											if (!result[0] && preparedForStart) 			// Statuswechsel?
												{
													status = "onCatapult";
												}
											segmNumber = 12;
											break;
						case "onCatapult":
											spring.s = sqrt(sq(greenBall.y - catapult.height) + sq(greenBall.x - catapult.positionX)); 	// aktuelle Federlänge
											spring.phi = atan2(greenBall.y - catapult.height, greenBall.x - catapult.positionX); 	// aktueller Anschlagwinkel
											if (spring.s > spring.l0)
												Fn = (spring.s - spring.l0)*spring.n;		// Betrag der Federkraft
											else
												Fn = 0;																	// Katapult nicht gespannt
											greenBall.vx = greenBall.vx - (greenBall.vx*spring.friction + Fn*cos(spring.phi)/greenBall.mass)*dt;
											greenBall.vy = greenBall.vy - (greenBall.vy*spring.friction + Fn*sin(spring.phi)/greenBall.mass + g)*dt;
											greenBall.x = greenBall.x + greenBall.vx*dt;																											// II. Integration
											greenBall.y = greenBall.y + greenBall.vy*dt;
											if(greenBall.y <= 0.5*greenBall.diameter)
												{ 
													greenBall.y = 0.5*greenBall.diameter;
													status = "end";
												}
											if((spring.s < spring.l0 || spring.phi > HALF_PI) && Fn0 > 0) status = "onFlight";
											segmNumber = 12;
											break;
						case "onFlight":
											var vx_ = greenBall.vx;                 // Geschwindigkeitswert merken wegen Verkopplung
											greenBall.vx = greenBall.vx - (greenBall.vx*sqrt(sq(greenBall.vx)+sq(greenBall.vy))/(2*tau))*dt;  // I. Integration
											greenBall.vy = greenBall.vy - (greenBall.vy*sqrt(sq(vx_)+sq(greenBall.vy))/(2*tau) + g)*dt;
											greenBall.x = greenBall.x + greenBall.vx*dt;																											// II. Integration
											greenBall.y = greenBall.y + greenBall.vy*dt;

											if (greenBall.y <= 0.5*greenBall.diameter && greenBall.x <= profile[11].x)
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
											if (greenBall.x > profile[13].x && greenBall.y <= 0.5*greenBall.diameter)
												{ // Landung hinter dem Katapult
													dt = 0;
													status = "end";
												}
											break;
						case "onGround":									// gleichförmige Bewegung
											greenBall.vx = greenBall.vx - g*cr*Math.sign(greenBall.vx)*dt;		// Rollreibungseinfluss
											if (abs(greenBall.vx) < a_rf[2]*dt) greenBall.vx = 0;										// Stillstand
											greenBall.x = greenBall.x + greenBall.vx*dt;
											greenBall.y = 0.5*greenBall.diameter;															// Korrektur
											/*if (greenBall.x <= hole.positionX + 0.5*greenBall.diameter && greenBall.x >= hole.positionX - 0.5*greenBall.diameter)
												{	// Ball fällt ins Loch
													greenBall.vx = 0;		// Bewegung anhalten
													status = "end";
												}*/
											if (greenBall.x <= barrier.positionX + 0.5*(barrier.width + greenBall.diameter) && greenBall.x >= barrier.positionX - 0.5*(barrier.width + greenBall.diameter))
												{	// Reflexion am Hindernis
													if (greenBall.vx <= 0)
														greenBall.x = barrier.positionX + 0.5*(barrier.width + greenBall.diameter); // Ortskorrektur
													else
														greenBall.x = barrier.positionX - 0.5*(barrier.width + greenBall.diameter); // Ortskorrektur
													greenBall.vx = -greenBall.vx;
													status = "onGround";
												} 
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
											greenBall.vs = greenBall.vs - (g_[segmNumber] + Math.sign(greenBall.vs)*a_rf[segmNumber])*dt; // mit Rollreibung
											//console.log(nf(g_[segmNumber],1,3)+"  "+nf(degrees(beta[segmNumber]),2,3)+"  "+Math.sign(greenBall.vs)*a_rf[segmNumber]);
											greenBall.s = greenBall.s + greenBall.vs*dt;
											greenBall.x = profile[segmNumber].x + greenBall.s*cos(beta[segmNumber]);
											dt_ = (slopeLength[segmNumber] - limiter[segmNumber - 1] - greenBall.s)/greenBall.vs;
											
											if(greenBall.s >= slopeLength[1] - limiter[1] && segmNumber == 1)
												{ // Linke Schräge: Übergang zu ground, Parameterübergabe und Statuswechsel
													greenBall.x = profile[2].x + limiter[1];
													greenBall.y = 0.5*greenBall.diameter;
													greenBall.vx = greenBall.vs;
													segmNumber = 2;
													status = "onGround";
												}
											if(greenBall.s <= limiter[0] && segmNumber == 1)
												{ // Linke Schräge: Reflexion an der Wand, Parameterübergabe und Statuswechsel
													greenBall.x = profile[1].x + limiter[0]*cos(beta[1]) + 0.5*greenBall.diameter*cos(beta[1] + HALF_PI);
													greenBall.y = profile[1].y + limiter[0]*sin(beta[1]) + 0.5*greenBall.diameter*sin(beta[1] + HALF_PI);	
													greenBall.vx = -greenBall.vs*cos(beta[1]); 		// Reflexion
													greenBall.vy = greenBall.vs*sin(beta[1]);
													status = "onFlight";
												}
											
											if(greenBall.s <= limiter[10] && segmNumber == 11)
												{ // Rechte Schräge: Übergang zu ground, Parameterübergabe und Statuswechsel
													greenBall.x = profile[11].x - limiter[10];
													greenBall.y = 0.5*greenBall.diameter;
													greenBall.vx = greenBall.vs;
													segmNumber = 10;
													status = "onGround";
												}
											if(greenBall.s >= slopeLength[11] && segmNumber == 11)
												{ // Ende rechte Schräge: Übergang zu flight, Parameterübergabe und Statuswechsel
													greenBall.x = profile[12].x + 0.5*greenBall.diameter*cos(beta[11] + HALF_PI);
													greenBall.y = profile[12].y + 0.5*greenBall.diameter*sin(beta[11] + HALF_PI);	
													greenBall.vx = greenBall.vs*cos(beta[11]);
													greenBall.vy = greenBall.vs*sin(beta[11]);
													status = "onFlight";
												}
											break;
						case "end": 
											dt = 0;															// Bewegung anhalten
											break;
						case "repeat":
						default:	// Startsituation wieder herstellen
											/* Erfolgszähler rücksetzen
											...code...
											*/
											spring.phi = -HALF_PI;
											spring.s = spring.l0 + greenBall.mass*g/spring.n;
											greenBall.x = catapult.positionX + spring.s*cos(spring.phi);
											greenBall.y = catapult.height + spring.s*sin(spring.phi);
											greenBall.vx = 0;
											greenBall.vy = 0;
											preparedForStart = false;
											segmNumber = 12;
											status = "start";
											break;
					}
			}

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
						case "start":						// Einstelung 4. u. 7. Übung
						case "repeat":
						case "onCatapult":
							ellipse(greenBall.x*M, greenBall.y*M, greenBall.diameter*M);
							push();
								translate(profile[segmNumber].x*M, profile[segmNumber].y*M) 		// Katapultschlinge
								rotate(spring.phi);
								fill("#ff0000");
								beginShape();
									vertex(0,0);
									vertex((spring.s + 0.4*greenBall.diameter)*M, 0.3*greenBall.diameter*M);
									vertex((spring.s + 0.45*greenBall.diameter)*M, 0.2*greenBall.diameter*M);
									vertex((spring.s + 0.5*greenBall.diameter)*M, 0);
									vertex((spring.s + 0.45*greenBall.diameter)*M, -0.2*greenBall.diameter*M);
									vertex((spring.s + 0.4*greenBall.diameter)*M, -0.3*greenBall.diameter*M);
								endShape();
							pop();
							break;
						case "end":
						case "onGround":
						case "onFlight":
							ellipse(greenBall.x*M, greenBall.y*M, greenBall.diameter*M);
							break;
						case "onSlope":
							push();
								translate(profile[segmNumber].x*M, profile[segmNumber].y*M);
								rotate(beta[segmNumber]);
								ellipse(greenBall.s*M, 0.5*greenBall.diameter*M, greenBall.diameter*M);
							pop();
							break;
					}

				// Debugging
				fill(0);
				strokeWeight(1);
				displayProfile(showProfile&&debug);
				displayLimiter(showLimiter&&debug);
				displayCatapult(debug);
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
