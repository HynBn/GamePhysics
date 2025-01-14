/*   Controls   für Beispiellösung Übung modifiziert !!! ********************/
/* Stand: 24.04.2020                                    */
/*                                                      */
/* Objekt: Circle, Ring, Arrow,                         */ 
/* ToggleButton, PushButton                             */
/* Objekt: Scrollbar                                    */
/* Objekt: Path                                         */
/*                                                      */
/********************************************************/


/**************************************************/
/* Click & drag verschiebt Circle                 */
/* Veränderliche: x, y, r (maßstabsrichtig)       */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/* Mode: nur Richtung x: 'x', nur Richtung y: 'y' */
/*       Richtung x und y: bel. Zeichen           */
/*       visible: sichtbar/unsichtbar             */
/**************************************************/

function Circle(M, r, visible, c, mode)
	{
		this.r = r;             // Radius!
		this.M = M;
		this.visible = visible; // boolean
		this.c = c;
		this.mode = mode;        // 'x', 'y' oder 'b'
		this.status = false;     // Bewegung des Kreises, ja: true
	 	var overBubble = false;
		 
		this.inCircle = function (xPos, yPos) // Pos in Metern und im kart. Koord.Syst.
			{
				var R = this.r;
				var Scale = this.M;
				var insideBubble;
				this.hover;         // Hilfsvariable, die die Info "mouseover" nach außen gibt
				var x, y;
				
				push();                 // Formatierung merken
				 /* Maus in der Ellipse? */
					if (sq(iXk(mouseX)-xPos*Scale) + sq(iYk(mouseY)-yPos*Scale) <= sq(R*Scale))
						{ // im Kreis, sensibler Kreis ist 1.5 mal größer als der sichtbare Kreis -> für kleine Mobilgeräte
							this.hover = true;  // Maus ist über dem Kreis
							//if (getMediaType() != 0) myCursor((xPos-1.5*R)*Scale, (yPos+1.5*R)*Scale); // Cursor als Hinweis für mobile, dass sensibles Element getouched ist
							if (mPressed)
								{
									//console.log("press: "+mPressed);
									mPressed = false;	
									mReleased = false;
									insideBubble = true;
									overBubble = true;
								}	
						}                                                   
					else
						{ // außerhalb des Kreises -> Koordinaten bleiben unverändert
							this.hover = false;  // Maus ist nicht über dem Kreis
							insideBubble = false;
						}
					x = xPos;
					y = yPos;								
					if ((insideBubble || this.status))
						{
							this.status = true;   // ermöglicht Kreisbewegung, auch wenn Maus außerhalb
							if (mDragged)
								{
									//console.log("drag");
									switch (this.mode)
										{
											case 'x': x = iXk(mouseX)/Scale; 
																break;
											case 'y': y = iYk(mouseY)/Scale;
																break;
											default:  x = iXk(mouseX)/Scale;
																y = iYk(mouseY)/Scale;
																break;
										}
									mDragged = false;	
								}
						
							if (mReleased)
								{
									//console.log("released: "+mReleased);
									insideBubble = false;
									overBubble = false;
									this.status = false;
								}
						}
					if (overBubble == true) fill('#00ff00'); else fill(this.c)
					if (this.visible)
						{
							stroke(this.c);
							ellipse(kXi(xPos*Scale), kYi(yPos*Scale), 2*R*Scale, 2*R*Scale);
						}
					fill(255);
					//console.log("status: "+this.status+" x: "+x+" y: "+y+"  M: "+Scale+" visib: "+this.visible);
				pop();   // Formatierung rekonstruieren
				return([this.status, x, y]); // this.status true: mouse im Kreis clicked, false: released
			}
	}

/**************************************************/
/* Click & drag verschiebt Ring                   */
/* Click & drag am Rand verändert den Radius      */
/* Veränderliche: x, y, r (maßstabsrichtig)       */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/* Mode: nur Richtung x: 'x', nur Richtung y: 'y' */
/*       Richtung x und y: bel. Zeichen           */
/*       visible: fill/noFill                     */
/**************************************************/

function Ring(M, visible, c, mode)
	{
		this.M = M;
		this.visible = visible; // boolean
		this.c = c;
		this.mode = mode;
		var status = false;     // Bewegung des Kreises, ja: true
	 	var overBubble = false;
		 
		this.inCircle = function (R, xPos, yPos) // Pos in Metern und im kart. Koord.Syst.
			{
				var Scale = this.M;
				var C = this.c;				
				var insideBubble;
				var insideRing = false;
				this.hover;         // Hilfsvariable, die die Info "mouseover" nach außen gibt
				var radius, x, y;
				
				push();                 // Formatierung merken
			 /* Maus in der Ellipse? */
				if (sq(iXk(mouseX)-xPos*Scale) + sq(iYk(mouseY)-yPos*Scale) <= sq(R*Scale + 10)) // Außentoleranz: absolut 5px
					{ // im Kreis, sensibler Kreis ist 1.5 mal größer als der sichtbare Kreis -> für kleine Mobilgeräte
						this.hover = true;  // Maus ist über dem Kreis						

						if (sq(iXk(mouseX)-xPos*Scale) + sq(iYk(mouseY)-yPos*Scale) > sq(R*Scale - 5)) // Innentoleranz: absolut 5px
							{ // Ring
								C = '#00ff00';
								insideRing = true;
							}
						else 
							insideRing = false;

						if (mPressed)
							{
								mPressed = false;	
								insideBubble = true;
								overBubble = true;
							}	
					}                                                   
				else
					{ // außerhalb des Kreises -> Koordinaten bleiben unverändert
						this.hover = false;  // Maus ist nicht über dem Kreis
						insideBubble = false;
					}
				radius = R;
				x = xPos;
				y = yPos;								

				if ((insideBubble || status) && insideRing)
				{					
					status = true;
					if (mDragged)
						{
							radius = sqrt(sq(iXk(mouseX)-xPos*Scale) + sq(iYk(mouseY)-yPos*Scale))/Scale;
							mDragged = false;	
						}						
				}

				if ((insideBubble || status) && !insideRing)
					{
						status = true;
						if (mDragged)
							{
								switch (this.mode)
									{
										case 'x': x = iXk(mouseX)/Scale; 
															break;
										case 'y': y = iYk(mouseY)/Scale;
															break;
										default:  x = iXk(mouseX)/Scale;
															y = iYk(mouseY)/Scale;
															break;
									}
								mDragged = false;	
							}
					
						if (mReleased)
							{
								insideBubble = false;
								overBubble = false;
								status = false;
							}
					}
				if (this.visible)
					{
						if (overBubble == true) fill('#00ff00'); else fill(C)
					}
				else
					{
						noFill();
					}
				stroke(C);
				ellipse(kXi(xPos*Scale), kYi(yPos*Scale), 2*R*Scale, 2*R*Scale);

				//console.log("status: "+status+" x: "+x+" y: "+y);
				pop();   // Formatierung rekonstruieren
				return([status, radius, x, y]); // status true: mouse im Kreis clicked, false: released
			}
	}


/**************************************************/
/* Click & drag dreht/verlängert Arrow            */
/*                                                */
/* Variablen: x, y (maßstabsrichtig - M)      */
/*            vx, vy (normiert - norm)            */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/**************************************************/

function Arrow(M, norm, c)
	{
		this.M = M;  // Skalierung der Ortskoordinaten 
		this.norm = norm;    // Normierung des Vektors
		this.c = c;
		var Scale = this.M;
		var R = 10.0/Scale;   // Radius des sensiblen Bereiches, unabh. von der Skalierung
		var Norm = this.norm;
		var C = this.c;
		var arrowhead = new Circle(Scale, R, false, C, 'b');
		
		this.moveArrow = function (xPos, yPos, vx, vy)
			{ // Eingabe von Vektoren, z.B. Geschwindigkeiten etc. 
				var vLength = sqrt(sq(vx) + sq(vy))/Norm;
				var vArc = atan2(vy, vx);
				var result;
				this.hover;         // Hilfsvariable, die die Info "mouseover" nach außen gibt
				
        push();
        stroke(C);
				strokeWeight(2);
        fill(C);
        translate(xi0+xPos*Scale,yi0-yPos*Scale);
        rotate(-vArc);
				var l = vLength*Scale;
        line(0,0,l,0);          // Linie
				//ellipse(vLength*Norm, 0, 20, 20);
        triangle(l-gridX, gridY, l+gridX, 0, l-gridX,-gridY); // Richtungspfeil
        pop();
				push(); // Sicherung der Formatierung
				result = arrowhead.inCircle(vx/Norm + xPos, vy/Norm + yPos);
				pop();
				vx = result[1] - xPos;
				vy = result[2] - yPos;
				this.hover = arrowhead.hover;   // Maus ist über der Pfeilspitze
				return ([result[0], vx*Norm, vy*Norm, vLength*Norm, vArc]); // satus; kart.Koord. vx, vy; Pol.koord. Betrag, Winkel
			}	
	}

/**************************************************/
/* Click & drag dreht handle                      */
/*                                                */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/**************************************************/

function Handle(M, r, length, visibility, c)
	{
		this.M = M;              // Skalierung der Ortskoordinaten 
		this.length = length;    // Länge des Griffarms
		this.c = c;
		var C = this.c;
		var Scale = this.M;
		this.r = r;
		var R = this.r;   // Radius des sensiblen Bereiches
		this.visility = visibility;
		var HandleHead = new Circle(Scale, R, this.visility, C, 'b');
		
		this.moveHandle = function (xPos, yPos, beta)
			{ // Eingabe von Vektoren, z.B. Geschwindigkeiten etc. 
				var x = this.length*cos(beta) + xPos;          // Position des aktiven Kreises
				var y = this.length*sin(beta) + yPos; 
				var result;
				var arc;
				this.hover;         // Hilfsvariable, die die Info "mouseover" nach außen gibt
				
        if(this.visility)
					{
						push();
							stroke(C);
							strokeWeight(2);
							translate(xi0 + xPos*Scale, yi0 - yPos*Scale);
							rotate(-beta);
							line(0,0,this.length*Scale,0);          // Linie
						pop();
					}
				result = HandleHead.inCircle(x, y);
				x = result[1];
				y = result[2];
				arc = atan2(y - yPos, x - xPos);
				//console.log("Handle arc: "+arc+" beta: "+beta+" arc: "+atan2(y - yPos, x - xPos)+" x: "+x+" y: "+y);
				this.hover = HandleHead.hover;   // Maus ist über Handle
				return ([result[0], arc]);      // satus, Winkel
			}	
	}
	
/**************************************************/
/* Object toggleButton / function pushButton      */
/* Anklicken mit der Maus ermöglicht toggeln des  */
/* Buttons                                        */
/*                                                */
/* Veränderliche: x, y, R (maßstabsrichtig)       */
/* Koordinatensystem: kartesisch, intern          */
/* Positionierung: absolut, gridX, gridY          */
/* Ursprung: absolut zu 0, 0                      */
/**************************************************/

function ToggleButton(xPos, yPos, onName, onColor, offName, offColor)
	{ // Anklicken mit der Maus ermöglicht toggeln des Buttons 
		this.xPos = xPos;
		this.yPos = yPos;
		this.onName = onName;
		this.onColor = onColor;
		this.offName = offName;
		this.offColor = offColor;
		var BlackWhite = 0;   // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		var WhiteBlack = 255;  // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		this.toggle = false;
		var textColor = BlackWhite;
			
		this.drawButton = function()
			{
				var x = this.xPos*gridX;
				var y = this.yPos*gridY;
				var fntSize = 22*normPixel;
				var strng;
				
				push();
				textAlign(CENTER, CENTER);
				textStyle(BOLD);
				textFont('verdana', fntSize);
				noStroke();

				if ((x < mouseX && x + buttonWidth > mouseX) && (y < mouseY && y + buttonHeight > mouseY))
					{
						if (mPressed)
							if (!this.toggle) 
								{
									this.toggle = true;
									textColor = WhiteBlack;
								}
							else 
								{
									this.toggle = false;
									textColor = BlackWhite;
								}
						mPressed = false;
					}

				if (this.toggle) 
					{
						stroke(0);
						fill(this.offColor);
						rect(x, y, buttonWidth, buttonHeight, 5);
						noStroke();
						fill(textColor);
						text(this.offName, x+0.5*buttonWidth, y+0.5*buttonHeight);
					}
				else
					{
						stroke(0);
						fill(this.onColor);
						rect(x, y, buttonWidth, buttonHeight, 5);
						noStroke();
						fill(textColor);
						text(this.onName, x+0.5*buttonWidth, y+0.5*buttonHeight);
					}

				pop();
				return this.toggle;
			}			
	}

function PushButton(xPos, yPos, onName, onColor, modus)
	{ // Anklicken mit der Maus erzeugt einen einmaligen Impuls, Button muss enabled werden!
		this.xPos = xPos;
		this.yPos = yPos;
		this.onName = onName;
		this.onColor = onColor;
		var OnColor = this.onColor;                 // Buttonfarbe
		var OffColor = 128;     // Textfarbe = Komplementärfarbe der Buttonfarbe
		var BlackWhite = 0;   // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		var WhiteBlack = 255;  // Textfarbe, schwarz/weiß = Komplementäre Helligkeit
		var textColor = BlackWhite;                 // Textfarbe
		var fillColor;
		this.modus = modus;                         // bestimmt ob, true = trigger oder false = solange mPressed
			
		this.drawButton = function(enable)          // inactive: gray
			{
				var x = this.xPos*gridX;
				var y = this.yPos*gridY;
				var fntSize = 22*normPixel;
				var pushB = false;
				
				//console.log("pushButton x: "+this.xPos+" "+x+" y: "+this.yPos+" "+y);
				push();
					textAlign(CENTER, CENTER);
					textStyle(BOLD);
					textFont('verdana', fntSize);
					fill(OnColor);

					if ((x < mouseX && x + buttonWidth > mouseX) && (y < mouseY && y + buttonHeight > mouseY))
						{
							//console.log("en: "+enable+" mP: "+mPressed+" mo: "+this.modus);
							if ((mPressed) && enable)
								{
									fill(OffColor);        // Komplementärfarbe
									textColor = WhiteBlack;
									pushB = true;
								}
							else
								{
									pushB = false;
									textColor = BlackWhite;
								}
							if (mReleased || this.modus) mPressed = false; // Maus rücksetzen
						}
					else pushB = false;	
					
					// Buttongestaltung
					if (!enable) fillColor = '#aaaaaa'; else fillColor = OnColor;	
					stroke(textColor);
					fill(fillColor);
					rect(x, y, buttonWidth, buttonHeight, 5);   // Button
					noStroke();
					fill(textColor);
					text(this.onName, x+0.5*buttonWidth, y+0.5*buttonHeight);
				pop();
				return (pushB);
			}			
	}

/**************************************************/
/* Object Scrollbar                               */
/*                                                */
/* Koordinatensystem: kartesisch, intern          */
/**************************************************/

function Scrollbar(xPos, yPos, yMin, y0, yMax, c, name)
	{ // Constructor
		this.xPos = xPos;    // Scrollbarposition in %
		this.yPos = yPos;
		this.yMin = yMin;    // einstellbarer Minimalwert
		this.y0 = y0;        // Normalwert
		this.yMax = yMax;    // einstellbarer Maximalwert
		this.c = c;
		this.name = name;
		
		var Y0;              // Standardwert
		var Xpos = this.xPos*gridX;
		var Ypos = this.yPos*gridY;
		var Ymax = this.yMax;
		var Ymin = this.yMin;
		if (this.y0 < Ymin) Y0 = Ymin;  // Verhinderung Überschreitung des Scrollbereiches
		else if (this.y0 > Ymax) Y0 = Ymax;
				 else Y0 = this.y0;
		var y = Ypos + scrollbarHeight*(1 - (Y0 - Ymin)/(Ymax - Ymin)); // Position des Standardwertes berechnen
		//console.log(Ymin+" "+Y0+" "+Ymax+"   "+y);
		var inKnop, overKnop, newValue;
		var status = false;       // Ziehen auch außerhalb des aktiven Bereichs möglich
		var r = 20*normPixel;     // Knopfradius

		this.yValue = function()
			{
				push();                   // Stile sichern
				rectMode(CENTER);
				fill(200);
				rect(Xpos, Ypos+scrollbarHeight/2, scrollbarWidth, scrollbarHeight);         //scroll bar
				//fill(0);
				textAlign(LEFT, CENTER);
				//text(numberMin,xPos-textWidth(numberMin),yPos);
				//text(numberMax,xPos-textWidth(numberMax),yPos+scrollbarHeight);
				if (sq(mouseX-Xpos) + sq(mouseY-y) <= sq(2*r))
					{ // sens. Kreis ist 2 mal größer als sichtbar --> mobile
						if (mPressed)
						  {
							  inKnop = true;
								overKnop = true;
							  mPressed = false;
						  }
					}					 
				else
						inKnop = false;
						
				if (inKnop || status) 
					{
						status = true;
						if (mDragged)
						  {              // Mausk. im Knop
							  y = mouseY;
							  mDragged = false;
								newValue = false;
						  }
							
						if (mReleased)
						 {
							 inKnop = false;
							 overKnop = false;
							 mReleased = false;
							 newValue = true;
							 status = false;
						 }
					}
				 
				if (y < Ypos)          // Begrenzungen oben und unten
					{
						y = Ypos;
					}
				else
					{
						if (y > Ypos+scrollbarHeight)
							{
								y = Ypos+scrollbarHeight;
							}
					} 

				if (overKnop)
					fill(this.c);
				else
					fill(this.c);
				ellipse(Xpos, y, 2*r, 2*r);                                        // Knopf zeichnen  	
				var value = (1 - (y - Ypos)/scrollbarHeight)*(Ymax - Ymin) + Ymin; // Normierung
		 
				noStroke();
				fill(0);
				textFont('arial', 20*normPixel);				
				textAlign(CENTER, BOTTOM);
				text(name, Xpos, Ypos - 0.125*scrollbarHeight);    // Bezeichner
				text(formatNumber(value, 2, 2), Xpos, Ypos + 1.4*scrollbarHeight);
				textAlign(RIGHT, TOP);
				text(formatNumber(Ymax, 2, 2), Xpos-20*normPixel, Ypos);
				textAlign(RIGHT, CENTER);
				text(formatNumber(Ymin, 2, 2), Xpos-20*normPixel, Ypos + scrollbarHeight);

				pop();
				return [newValue, value];  			 // status: neuer Wert liegt vor; Wert			
			}
	}

/**************************************************/
/* Object Path                                    */
/* dynamische Änderung von Maßstäben              */
/* Bezier-Pfad gibt die Änderung vor              */
/*                                                */
/* Veränderliche: Anker- und kontrollpunkte       */
/* Koordinatensystem: kartesisch, intern          */
/* Position x: relativ in m, skaliert 'M'     */
/* Anfangs- und Endwerte des Maßstabs y:          */
/* relativ, skaliert 'norm'                       */
/**************************************************/
	
function Path(aPX1,  aPY1,  cPX1,  cPY1,  cPX2,  cPY2,  aPX2,  aPY2, numberOfSamples, visible,  zeroY,  norm, c)
  { /* Constructor */
		this.aPX1 = aPX1;               // Position der Ankerpunkte
		var apx1 = this.aPX1;
		this.aPY1 = aPY1;
		this.aPX2 = aPX2;
		var apx2 = this.aPX2;
		this.aPY2 = aPY2;
		this.cPX1 = cPX1;               // Delta der Controlpunkte zu den Ankerpunkten
		var cpx1 = this.cPX1;
		this.cPY1 = cPY1;
		this.cPX2 = cPX2;
		var cpx2 = this.cPX2;
		this.cPY2 = cPY2;
		this.visible = visible;
		this.zeroY = zeroY;         // Verschiebung der Bezierkurve zwecks besserer Darstellung
		this.norm = norm;               // Normierung der y-Koord. entsprechend des Pfad-Wertes
		var apy1 = this.norm*this.aPY1; // norm einarbeiten
		var cpy1 = this.norm*this.cPY1;
		var apy2 = this.norm*this.aPY2;
		var cpy2 = this.norm*this.cPY2;
		this.c = c;
		this.numberOfSamples = numberOfSamples;

    var blackWhite = manageColor(backgroundColor)[1];
		var vLength, vAngle;            // Hilfsvariablen für die Berechnung der Controlpunkte
		var anchor1 = new Circle(1, 10, false, blackWhite, 'x');   // Bezierpunkte
		var anchor2 = new Circle(1, 10, false, blackWhite, 'x');
		var control1 = new Circle(1, 10, false, blackWhite, 'b');  // Controlpunkte
		var control2 = new Circle(1, 10, false, blackWhite, 'b');
		   
    var n;                          // Anzahl der approximierenden Segmente
    var x = [];                     // Stützwerte x
    var y = [];                     // Stützwerte y
    var deltaX1 = this.cPX1 - this.aPX1;    // Differenz der x-Werte von Anker- und Controllpunkt
    var deltaX2 = this.cPX2 - this.aPX2;
    
    var tBezier;                    // Bezier-Parameter
		var result;                     // Ergebnisübergabe der Anker- und Kontrollpunkte
		
    /* Methoden - adaptive Maßstabsanpassung */  
    this.createPath = function(initPath)
      {
 				//console.log("M: "+Scale+" apx1: "+apx1+" apy1: "+apy1+" cpx1: "+cpx1+" cpy1: "+cpy1);
				if(this.visible || initPath)                                 // wenn keine Pfadkonstruktion per Maus erfolgt, genügt die einmalige Generierung des Pfades
				 {
						result = anchor1.inCircle(apx1, apy1+this.zeroY);        // sens. Kreis für Ankerp. 1 (links)
						apx1 = result[1];
						result = control1.inCircle(apx1+cpx1, apy1+cpy1+this.zeroY);  // sens. Handle für Kontrolp. 1 (links)
						cpx1 = result[1] - apx1;                                   // Kontrollpunkt wird mit Ankerpunkt verschoben
						cpy1 = result[2] - apy1 - this.zeroY;
					 
						result = anchor2.inCircle(apx2, apy2+this.zeroY);        // sens. Kreis für Ankerp. 2 (rechts)
						apx2 = result[1];
						result = control2.inCircle(apx2+cpx2, apy2+cpy2+this.zeroY);  // sens. Handle für Kontrolp. 1 (links)
						cpx2 = result[1] - apx2;                                   // Kontrollpunkt wird mit Ankerpunkt verschoben
						cpy2 = result[2] - apy2 - this.zeroY;

						for (n = 0; n < this.numberOfSamples+1; n++)
							{ // Bezier-Funktionen
								tBezier = n/this.numberOfSamples;
								x[n] = apx1*pow((1-tBezier),3) + (apx1+cpx1)*3*tBezier*sq(1-tBezier) + (apx2+cpx2)*3*sq(tBezier)*(1-tBezier) +  apx2*pow(tBezier,3);
								y[n] = apy1*pow((1-tBezier),3) + (apy1+cpy1)*3*tBezier*sq(1-tBezier) + (apy2+cpy2)*3*sq(tBezier)*(1-tBezier) +  apy2*pow(tBezier,3);
								//console.log("n: "+n+" y(x): "+y[n]+" x["+n+"]: "+x[n]+" numberOfSamples: "+this.numberOfSamples);
								if (y[n] <= 0)
									{ 
										push();
										fill('#ff0000');
										textSize(2.5*fontSize);
										textAlign(CENTER);
										var H;
										if (apy1 > apy2) H = kYi((1.5*apy1+this.zeroY)); else H = kYi((1.5*apy2+this.zeroY));
										text("Achtung! M wird nagativ!", width/2, H);
										pop();
									}	
							}
				 }
				 
        if (this.visible)
          {
						// Anker- und Kontrollpunkte
						stroke(0);
						line(kXi(apx1), kYi((apy1+this.zeroY)), kXi((apx1+cpx1)), kYi((apy1+cpy1+this.zeroY)));
						fill('#8888ff');
						ellipse(kXi(apx1), kYi((apy1+this.zeroY)), 10, 10); // Ankerpunkt 1
						ellipse(kXi((apx1+cpx1)), kYi((apy1+cpy1+this.zeroY)), 10, 10); // Kontrollpunkt 1
						line(kXi(apx2), kYi((apy2+this.zeroY)), kXi((apx2+cpx2)), kYi((apy2+cpy2+this.zeroY)));
						fill('#ff8888');
						ellipse(kXi(apx2), kYi((apy2+this.zeroY)), 10, 10); // Ankerpunkt 2
						ellipse(kXi((apx2+cpx2)), kYi((apy2+cpy2+this.zeroY)), 10, 10); // Ankerpunkt 2
						noStroke();
						fill(blackWhite);
            // Pfadparameter 
						textAlign(LEFT);
						textSize(1.2*fontSize);
            text("ap1: " + formatNumber(apx1,3,2)+", M1: "+formatNumber(apy1/norm,3,6), kXi(apx1), kYi((apy1+this.zeroY))-6*normPixel);
            text("cp1: " + formatNumber(cpx1,3,2)+", " +formatNumber(cpy1/norm,3,6), kXi((apx1+cpx1)), kYi((apy1+cpy1+this.zeroY))-6*normPixel);
						textAlign(RIGHT);
            text("ap2: " + formatNumber(apx2,3,2) + ", M2: "+formatNumber(apy2/norm,3,6), kXi(apx2), kYi((apy2+this.zeroY))-6*normPixel);
            text("cp2: " + formatNumber(cpx2,3,2)+", " +formatNumber(cpy2/norm,3,6), kXi((apx2+cpx2)), kYi((apy2+cpy2+this.zeroY))-6*normPixel);
						stroke(100);
            line(kXi(apx1), kYi(this.zeroY), kXi(apx2), kYi(this.zeroY));
            // Darstellung Pfad 
            fill(this.c);
            stroke(this.c);
            for (n = 0; n < this.numberOfSamples+1; n++)
              {
                ellipse(kXi(x[n]), kYi((y[n] + zeroY)), 5, 5);
                if (n < this.numberOfSamples) line(kXi(x[n]), kYi((y[n] + this.zeroY)),kXi(x[n+1]), kYi((y[n+1] + this.zeroY)));
              }
          }
      }
      
   this.usePath = function(xObject)
      {
        var result;

        if (xObject >= x[0] && xObject < x[this.numberOfSamples]) 
          { // das Objekt liegt im approximierenden Bereich
            result = y[this.numberOfSamples]/this.norm;
            fill(this.c);
            stroke(c);
            for (n = 0; n < this.numberOfSamples; n++)
              {
                if (this.visible) line(kXi(x[n]), kYi(y[n] + this.zeroY),kXi(x[n+1]), kYi(y[n+1] + this.zeroY));
                if (xObject >= x[n] && xObject < x[n + 1])
                  { // das Objekt liegt im n-ten Segment
                    result = y[n] + (xObject -x[n])*(y[n+1] - y[n])/(x[n+1] - x[n]);
                    //console.log("n: "+n+" y(x); "+result+"  xObject: "+xObject+" x["+n+"]: "+x[n]+" x[0]: "+x[0]+" x[numberOfSamples]: "+x[this.numberOfSamples]);
                  }
              }
            return result/this.norm;  
          }
        else
          { // das Objekt liegt außerhalb des Bereiches
            if (xObject < x[0])
              {
                //console.log("<"+" y(x); "+y[0]);
                return y[0]/this.norm;          // Anfangswert im Intervall
              }
            else
            {
              //console.log(">"+" y(x); "+y[this.numberOfSamples]);
              return y[this.numberOfSamples]/this.norm;           // Endwert im Intervall
            }
          }
      }
  }  
	