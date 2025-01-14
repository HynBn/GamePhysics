/**************************************************/
/* Autor:  Dr. Volkmar Naumburger                 */
/* Lizenz: CommonCreative BY-NC-SA                */
/*                                                */
/* Feder-Masse-Reibungs-System Bewegungs-DGL      */
/* Schwingungen mit nichtverbundener Masse        */
/* Stand: 03.01.2025                              */
/*                                                */
/**************************************************/

/* Zweck: Bewegungsgleichung von schwingenden Systemen */
// Instanzen von Objekten
var ODE_RK;														  // ODE-Solver 2. Ordnung für einfache DGl
var Start, start;												// Start/Reset-Button - toggel
var Debug, debug;												// Debug-Button
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
	diameter: 0.1,
  x: 0, y: 0,														// Ort des Katapultendes [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 0, angle0: 0,											// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0													// aktuelle Geschwindigkeit [m/s]
};

var greenBall = { 											// physischer grüner Ball
	itemColor: '#00aa00',
	diameter: 0.1,
	mass: 0.05,				   									// Ballmasse in kg
	x: 0, y: 0,														// Startsort [m]
	vx0: 0, vy0: 0,												// Komponenten der Startgeschwindigkeit [m/s]
	v0: 10, angle0: 0,										// Startgeschwindigkeit [m/s], Startwinkel [rad]
	vx: 0, vy: 0,													// aktuelle Geschwindigkeit [m/s]
};

var spring = {													// Katapult Feder
	l0: 0.25,															// Ruhefederlänge [m]
	n: 30,																// Federkonstante [m/N]
	mass: 0.03,														// Federmasse
	x: 0, y: 0,														// Startsort [m]
	vx: 0, vy: 0,													// aktuelle Geschwindigkeit [m/s]
	s: 0,																	// Federweg [m]
	phi: 0,																// Federwinkel
	friction: 10.0,												// innere Reibung 
	empty: false													// Ball ist auf der Schlinge
};

// physikalische Größen
var g = 9.81;														// Erdbeschleunigungskonstante m/s²
var cr = 0.05;													// Rollreibungskoeffizient
var a_rf;																// negative Beschleunigung infolge Rollreibung
var rho = 1.3;         									// Luftdichte in kg/m³
var cw = 0.45;         									// cw-Wert Vollkugel bei v > 5 m/s
var tau;								     						// Zeitkonstante nach Newton
var Fn, Fn0;														// akt. Federkraft, Federkraft bei t = 0
var effMass;														// effektive Masse
	 

//*********** die folgenden Variablen sind Pflicht! *********************/
var result;
var canvas;
var canvasID = "pSchwing_0052"; // ist eine Variable!!!

function setup()
	{
		mediaType = getMediaType();
		canvas = createCanvas(width, height);
		canvas.parent(canvasID);
		touchEvents = document.getElementById(canvasID);
		
		evaluateConstants(85, 85);                   // Deklarierung wichtiger Parameter und Konstanten
		backgroundColor = '#a8a8ff';                 // Hintergrundfarbe
		textColor = manageColor(backgroundColor)[1]; // Textfarbe für numerische Angaben
		
		frameRate(frmRate);									// Fensterwechselrate
		
		M = width/(playground.width + 2*playground.padding);					// responsiver Maßstab
		xi0 = (playground.width + playground.padding)*M;
		yi0 = 0.7*height;
		//console.log("M: "+M+"  xi0: "+xi0+"  yi0: "+yi0);
		
		// Instanzierung
		Start = new PushButton(20, 85, 'Start', '#00ff00', true);						// xPos, yPos, onName, onColor, offName, offColor
		Debug = new ToggleButton(85, 5, 'debug', '#ff0000', 'run', '#00ff00'); // xPos, yPos, onName, onColor, offName, offColor
		AktivCatapultEnd = new Circle(M, 0.5*aktivCatapultEnd.diameter, true, aktivCatapultEnd.itemColor, 'b');	// M, r, visible, c, mode
		ODE_RK = new RK_secondOrder2x();

		a_rf = g*cr;																												// negative Beschleunigung infolge Rollreibung
		tau = greenBall.mass/(rho*cw*PI*sq(greenBall.diameter/2));      		// Zeitkonstante nach Newton		
		spring.s = spring.l0 + (greenBall.mass + spring.mass)*g/spring.n;			// init der Katapult-Feder
		spring.phi = -HALF_PI;
	}
	
function draw()
	{
		background('#eeeeff');											// refresh canvas
	
		/* administration */
		fill(0);
		textSize(2*fontSize);
		prepareScreen("Katapult", "",'#0000ff', 50, 10);		// headline, subline, c, middleX, middleY
		textSize(1.2*fontSize);
		displayLine("s: "+formatNumber(spring.s,2,2)+"m  phi: "+nf(degrees(spring.phi),1,2)+"°  Fn0: "+formatNumber(Fn0,1,2)+"N", 0, "CENTER", 50, 20);
		displayLine("Status: "+status, 0, "CENTER", 50, 24);
		
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
				status ="start";
			}

		// Debugging
		debug = Debug.drawButton();
		
		/* calculation */		
		switch (status)
			{
				case "start":
									dt = timeScale/frmRate;								// Zeitquant wiederherstellen
									spring.empty = false;									// Schlinge ist belegt
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
									break;
				case "onCatapult":
									spring.s = sqrt(sq(greenBall.y - catapult.height) + sq(greenBall.x - catapult.positionX)); 	// aktuelle Federlänge
									spring.phi = atan2(greenBall.y - catapult.height, greenBall.x - catapult.positionX); 				// aktueller Anschlagwinkel
									if (spring.s > spring.l0)
										Fn = (spring.s - spring.l0)*spring.n;		// Betrag der Federkraft
									else
										Fn = 0;																	// Katapult nicht gespannt
									
									greenBall.vx = greenBall.vx - (spring.friction*greenBall.vx + Fn*cos(spring.phi)/(greenBall.mass + spring.mass))*dt;
									greenBall.vy = greenBall.vy - (g + spring.friction*greenBall.vy + Fn*sin(spring.phi)/(greenBall.mass + spring.mass))*dt;
									greenBall.x = greenBall.x + greenBall.vx*dt;
									greenBall.y = greenBall.y + greenBall.vy*dt;
									
									if(greenBall.y <= 0.5*greenBall.diameter)
										{ 
											greenBall.y = 0.5*greenBall.diameter;
											status = "end";
										}
									if((spring.s < spring.l0 || spring.phi > HALF_PI) && Fn0 > 0)
										{
											spring.x = greenBall.x;							// Parameterübergabe an leere Schlinge
											spring.vx = greenBall.vx;
											spring.y = greenBall.y;
											spring.vy = greenBall.vy;
											spring.empty = true;							// Schlinge ist leer
											status = "onFlight";
										}
									break;
				case "onFlight":
									var vx_ = greenBall.vx;                 // Geschwindigkeitswert merken wegen Verkopplung
									greenBall.vx = greenBall.vx - (greenBall.vx*sqrt(sq(greenBall.vx)+sq(greenBall.vy))/(2*tau))*dt;  // I. Integration
									greenBall.vy = greenBall.vy - (greenBall.vy*sqrt(sq(vx_)+sq(greenBall.vy))/(2*tau) + g)*dt;
									greenBall.x = greenBall.x + greenBall.vx*dt;																											// II. Integration
									greenBall.y = greenBall.y + greenBall.vy*dt;

									if (greenBall.y <= 0.5*greenBall.diameter)
										{	// Playground erreicht
											greenBall.vy = 0;
											status = "onGround";	// Statuswechsel
										}
									break;
				case "onGround":									// gleichförmige Bewegung
									greenBall.vx = greenBall.vx - g*cr*Math.sign(greenBall.vx)*dt;		// Rollreibungseinfluss
									if (abs(greenBall.vx) < a_rf*dt) greenBall.vx = 0;										// Stillstand
									greenBall.x = greenBall.x + greenBall.vx*dt;
									greenBall.y = 0.5*greenBall.diameter;															// Korrektur
									if (greenBall.x < -playground.width + 0.5*greenBall.diameter)
										{	// linker Rand -> Ende
											status = "end";
										}
									break;
				case "end": 
									dt = 0;															// Bewegung anhalten
									break;
				default:	// Startsituation wieder herstellen
									spring.phi = -HALF_PI;
									spring.s = spring.l0 + greenBall.mass*g/spring.n;
									greenBall.x = catapult.positionX + spring.s*cos(spring.phi);
									greenBall.y = catapult.height + spring.s*sin(spring.phi);
									greenBall.vx = 0;
									greenBall.vy = 0;
									preparedForStart = false;
									spring.empty = false;
									status = "start";
									break;
			}
	
		if (spring.empty)								// Bewegung der Schlinge nach Abflug des Balls
			{
				spring.s = sqrt(sq(spring.y - catapult.height) + sq(spring.x - catapult.positionX)); 	// aktuelle Federlänge
				spring.phi = atan2(spring.y - catapult.height, spring.x - catapult.positionX); 				// aktueller Anschlagwinkel
				Fn = (spring.s - spring.l0)*spring.n;		// Betrag der Federkraft
				spring.vx = spring.vx - (spring.friction*spring.vx + Fn*cos(spring.phi)/spring.mass)*dt;
				spring.vy = spring.vy - (g + spring.friction*spring.vy + Fn*sin(spring.phi)/spring.mass)*dt;
				spring.x = spring.x + spring.vx*dt;
				spring.y = spring.y + spring.vy*dt;
				//console.log("Fn: "+Fn);
			}

		/* display */
		push();
			translate(xi0, yi0);
			scale(1,-1);
				drawPlayground();
				fill(greenBall.itemColor);
				ellipse(greenBall.x*M, greenBall.y*M, greenBall.diameter*M);
				push();
					translate(catapult.positionX*M, catapult.height*M) 		// Katapultschlaufe
					rotate(spring.phi);
					fill("#ff5500");
					beginShape();
						vertex(0,0);
						vertex((spring.s + 0.4*greenBall.diameter)*M, 0.3*greenBall.diameter*M);
						vertex((spring.s + 0.45*greenBall.diameter)*M, 0.2*greenBall.diameter*M);
						vertex((spring.s + 0.5*greenBall.diameter)*M, 0);
						vertex((spring.s + 0.45*greenBall.diameter)*M, -0.2*greenBall.diameter*M);
						vertex((spring.s + 0.4*greenBall.diameter)*M, -0.3*greenBall.diameter*M);
					endShape();
				pop();

				// Debugging
				fill(0);
				strokeWeight(1);
				displayCatapult(debug);
		pop();
			}
