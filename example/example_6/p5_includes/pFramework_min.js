/********************* Basisroutinen für Übungen modifiziert ! ********************/
/* Stand: 27.08.2019                                    */
/*                                                      */
/* Funktionen und Klassen für Programmrahmen            */
/*                                                      */
/* prepareScreen: Überschriften und Start/Reset-Button  */
/* startProgram, endProgram                             */
/* displayLine                                          */
/* formatNumber                                         */
/* displayArrow                                         */
/* Diagram (Object), prepareWindow, drawTimeLine        */
/* drawXaxis, drawYaxis (Object)                        */
/* spring (Object)                                      */
/* cramersRule_2D                                       */
/*                                                      */
/* v0.0: Umstellung auf p5.js                           */
/* v1.0: yAxis, xAxis als Object definiert              */
/* v2.0: Fehler in Diagram() behoben 27.06.2020         */
/* v2.1: color in drawXaxis, drawYaxis 24.08.2020       */
/*			 meter (Object) hinzugefügt                     */
/*			 displayArrow: name hinzugefügt                 */
/********************************************************/

/* Überschrift und Subüberschrift */
function prepareScreen(headline, subline, c, middleX, middleY)
  {
    smooth();
    push();          // Stile sichern
		noStroke();
		fill(c);
    textAlign(CENTER, CENTER);
    textFont('verdana', floor(30*normPixel));         // Titelfont
    text(headline, middleX*gridX, middleY*gridY);
    textFont('verdana', floor(20*normPixel));         // default Font
    text(subline, middleX*gridX, (middleY + 4)*gridY);
		//fixScrollbarPosition();                           // verhindert, dass der body scrollt, wenn im canvas Objekte bewegt werden
    //text("Scrollbar: "+scrollbarStatus+" media: "+mediaType+" touchScreen: "+isTouchscreen, middleX*gridX, (middleY + 8)*gridY); // zu Testzwecken
		pop();
  }

/* Azeigen von Textzeilen, Eingabe: String, Pos. in % Bildschirmbreite und - höhe*/
function displayLine(strng, c, align, xPos, yPos)
	{
    push();           // Formatierung merken
		fill(c);
		noStroke();
		switch (align)
			{
				case "LEFT": 	textAlign(LEFT);
											break;
				case "CENTER": 	textAlign(CENTER);
											break;
				case "RIGHT": 	textAlign(RIGHT);
											break;
				default: 			textAlign(LEFT);
											break;
			}
		text(strng, xPos*gridX, yPos*gridY);
		pop();           // Formatierung wieder herstellen
	}

/* Programmstart und -reset */
function startProgram()
  { 
    var status = resetButton.drawButton();
		
		if (status)           // toggle
			{
				START = false;    // globale Variable: Programm startet
				INIT = true;      // globale Variable: Initialisierung
			}
		else 
			{
				START = true;	    // RESET
			}
  }
	
function endProgram(condition)
	{
		mClicked = false;
		if (condition)
			{
				dt = 0;         // Bewegung beenden
				START = true;
				INIT = true;    // Anfangsbedingungen einlesen
				return true;		
			}	
		else 
			return false;
	}	
	
/**************************************************/
/* Formatieren von Zahlen                         */	
/* wandelt Numeral zu String                      */
/* Parameter:                                     */
/*    decimale: Anzahl der Vorkommastellen	      */
/*    accuracy: Anzahl der Nachkommastellen	      */
/**************************************************/

function formatNumber(number, decimale, accuracy)
	{ 
		var numberString;
		var nullString = "";
		var emptyString = "";
		var rest;
		var post, restCorr;
		var i, j;
		var dec = 10; // dezimaler Teiler
		var sign;
		
		/* Vorzeichenbehandlung */
		if (number < 0)
			{
				sign = true;
				number = -number;
			}
		else sign = false;  

		/* Rundung der letzten Stelle */
		post = floor(pow(10, accuracy));
		number = number + 0.5/post;
		if (number <= 1.0/post) sign = false;        // Null ohne neg. Vorzeichen

		/* Bestimmung der Vorkommastellen */
		for (i = 0; i < decimale; i++)
			{
				if(floor(number/dec) == 0)
					{
						//print(i);
						break;
					}
				dec = dec*10;
			}

		for (j = i; j < decimale-1; j++)
			{
				//println("  j: "+decimale-i);
				emptyString = emptyString + " ";
			}  

		/* Bestimmung der Nachkommastellen */
		dec = 10;
		rest = number - floor(number);
		restCorr = floor(post*(number - floor(number)));
		for (i = 0; i < accuracy-1; i++)
			{ /* Zählen der Nachkomma-Nullen */
				if (floor(rest*dec) != 0 )
					{
						break;
					}
				nullString = nullString + "0";
				dec = dec*10;
			}
			
		if (accuracy == 0)
			{
				if (sign)
					 numberString = emptyString+"-"+str(floor(number));
				else   
					 numberString = emptyString+" "+str(floor(number));
			}
		else
			{  
				if (sign)
					 numberString = emptyString+"-"+str(floor(number))+"."+nullString+str(restCorr);
				else   
					 numberString = emptyString+" "+str(floor(number))+"."+nullString+str(restCorr);
			}
		return(numberString);
	}

	
/**************************************************/
/* Anzeige von Vektoren                           */
/*                                                */
/* Variablen: x, y (maßstabsrichtig - scl)        */
/*            vLength, vAngle(normiert - norm)    */
/*            norm ergibt sich aus dem Verhälnis  */
/*            Fensterbreite zu Betrag des Vektors */
/* Koordinatensystem: kartesisch                  */
/* Ursprung: relativ zu xi0, yi0                  */
/**************************************************/

function displayArrow(M, xPos, yPos, vLength, vAngle, norm, vColor, vDirection, name)
	{ // vLength ist NICHT skaliert!
		push();
		stroke(vColor);
		strokeWeight(2);
		fill(vColor);
		vLength = abs(vLength*M/norm);
		if (vDirection < 0) vAngle += PI; // drückender Vektor, sonst ziehender Vektor
		translate(xi0+xPos*M,yi0-yPos*M);
		rotate(-vAngle);
		line(0,0,vLength,0);          // Linie
		triangle(0.8*vLength-vDirection*gridX, 0.5*gridY, 0.8*vLength+vDirection*gridX, 0, 0.8*vLength-vDirection*gridX,-0.5*gridY); // Richtungspfeil
		noStroke();
		if (abs(vAngle) == HALF_PI)
			text(name, 0.8*vLength, -0.025*width);
		else
			text(name, 0.8*vLength, 0.04*height);
		pop();
	}


/**************************************************/
/* Darstellung einer Zeitfunktion als Diagramm    */
/*                                                */
/* Anwendungsbspl: pGrund_0020_WegZeitDiagramm.js */
/*                                                */
/* ersetzt die Funktion background() durch die    */
/* Methode prepareWindow().                       */
/* die Zeitfunktion wird durch die Methode        */
/* drawTimeLine() dargestellt                     */
/* Koordinatensystem: kartesisch                  */
/* Maße: in % bez. width, height (gridX, gridY)   */
/* Ursprung: absolut, zu int. Koordinaten         */
/**************************************************/
	
function Diagram(upperLeft_x, upperLeft_y, lowerRight_x, lowerRight_y, zero_y, timePerPeriode, CYCLIC, name_x, diagramTitle)
  { /* Construktor */
		var stopButton;
	  this.upperLeft_x = upperLeft_x;         // Diagrammfenster: Abmessungen und Positionen werden in % width bzw. % height
		var xBeg = this.upperLeft_x;            // ohne Koordinatentransformation angegeben!
	  this.upperLeft_y = upperLeft_y;
	  var yBeg = this.upperLeft_y;
	  this.lowerRight_x = lowerRight_x;
	  var xEnd = this.lowerRight_x;
	  this.lowerRight_y = lowerRight_y;
	  var yEnd = this.lowerRight_y;
	  this.zero_y = zero_y;       						// Nullpunkt in % (0% unten, 50% mittig, 100% oben)
		var yZero = this.zero_y;
		this.timePerPeriode = timePerPeriode;     // Zeitfortschritt
		var tPP = this.timePerPeriode;
	  this.CYCLIC = CYCLIC;     // zyklische Darstellung der Zeitfunktion
		var cyclic = this.CYCLIC; // cyclic = "continuos": periodisch, = "single": einmalig, "restart": einmalig mit restart per continue-Button
	  this.name_x = name_x;
		var unitX = this.name_x;
	  this.diagramTitle = diagramTitle;
		var title = this.diagramTitle;
		if (yZero > 50)
			stopButton = new PushButton((xEnd-buttonWidth/gridX), (yEnd-buttonHeight/gridY), "continue", '#008800', true);
		else
			stopButton = new PushButton((xEnd-buttonWidth/gridX), (yBeg), "continue", '#008800', true);
			
		var go;                     // Diagramm aufzeichen ja / nein
		xBeg = xBeg*gridX;
		yBeg = yBeg*gridY;
		xEnd = xEnd*gridX;
		yEnd = yEnd*gridY;
		
    var backgroundColor = '#eeffdd';
    var fntSize = 22*normPixel;
		var xMin = xBeg+4*gridX;            // Abmessungen des Koordinatensystems
		var xMax = xEnd-3*gridX;
    var yMax = yBeg + 3.5*gridY;
		var yMin = yEnd - 2.5*gridY;
		var yLine= yMin + (yMax-yMin)*yZero/100;   // Lage der Nulllinie: yZero% des gesamten Darstellungsintervalls
    var tX = 0;                         // Ortsäquivalent der Zeitachse
    var deltaX = (xMax - xMin)/(frmRate*tPP); // Ortszuwachs auf der x-Achse
		var yOld = [];                      // Array für max. 10 Kurven
		var	tXOld = [];
    var unitCounter;                    // aktuelle Diagrammlinie
		var maxUnits = 0;                   // max. Anzahl von Diagrammlinien

    var ENDinit = false;                // Initialisierung des Diagramms abgeschlossen  
    var endTimeLine = false;            // Ende der Zeitachse erreicht
		var INIT = false;
		var CONTINUE = false;               // Diagrammzeichnung fortsetzen
		var WEITER = true;
		 
   /* Methoden */
  this.prepareWindow = function(initD)
      { // initD wird bei Erstaufruf des Diagramms gesetzt, INIT beim Ende der Darstellungsbreite
				//console.log("diagr x: "+(xEnd-buttonWidth/gridX)+" y: "+(yEnd-buttonHeight/gridY));
        push();				
				rectMode(CORNER);
        unitCounter = 0;
				maxUnits = 0;           // max. Anzahl von Diagrammlinien rücksetzen
				if (INIT || initD)
          { // refresh Zeitfunktionsfenster
						fill(backgroundColor);
						noStroke();
						rect(xBeg, yBeg,xEnd-xBeg,yEnd+gridY-yBeg); // refresh des Diagrammfensters, +gridY schafft Platz für x-Einheiten unter der x-Achse
						fill('#0000ff');
						stroke(0);
						line(xMin, yMax, xMin, yMin);   // y-Achse
						line(xMin,yLine,xMax,yLine);    // x-Achse interne K.
						noStroke();
						textAlign(CENTER);
						textFont('arial');
						textSize(fntSize);
						textStyle(NORMAL);
						fill(backgroundColor);
						rectMode(CENTER);     // Titel + Hintergrund
						rect(0.5*(xBeg+xEnd), yBeg+3*gridY, textWidth(title)+2*gridX, 2*fntSize);
						fill('#0000ff');						
						text(title,0.5*(xBeg+xEnd),yBeg+3*gridY);
						textStyle(ITALIC);
						text(unitX,xEnd-gridX,yLine+2.5*gridY);  // Maßeinheit schreiben
						rectMode(CORNER);
            tX = 0;             // Display-Zeit zurücksetzen
						ENDinit = true;
						INIT = false;
						WEITER = true;
          }
        else 
          {
            ENDinit = false;  
					}
			  fill(backgroundColor); // refresh Hintergrund
				noStroke();
				rect(0,0,xBeg,height);                 // refresh I. Fenster (links)
				rect(xEnd,0,width-xEnd,height);        // refresh II. Fenster (rechts)
				rect(0,0,width,yBeg);                  // refresh III. Fenster (oben)
				rect(0,yEnd+gridY,width,height-yEnd-gridY);        // refresh IV. Fenster (unten)
				pop();
				// CYCLIC/continue-Auswertung
				if (cyclic == "continuos")
					{
						WEITER = true;
						CONTINUE = false;
					}
				else
					{
						if (cyclic == "restart") CONTINUE = stopButton.drawButton(true);
						if (CONTINUE)
							{
								WEITER = true;
								INIT = true;
								CONTINUE = false;
							}
					}
				return (ENDinit);
			}
    
	this.drawXScale = function(maxValueX, numberOfGraduations)
		{
			var n;
			var stepSizePix = (xMax - xMin)/numberOfGraduations;
			var stepSizeMet = maxValueX/numberOfGraduations;
			var name;            // String des aktuellen Zahlenwertes
			
			if (ENDinit)
				{
					for (n = 1; n < numberOfGraduations+1; n++)
						{
							name = formatNumber(stepSizeMet*n, 2, 1);
							text(name, xMin + stepSizePix*n - 3*gridX, yLine + 3*gridY);
							stroke(200);
							line(xMin + stepSizePix*n, yMin, xMin + stepSizePix*n, yMax);
							stroke(0);
							line(xMin + stepSizePix*n, yLine+0.6*gridX, xMin + stepSizePix*n, yLine-0.6*gridX);
							noStroke();
						}
				}
		}
	
  this.drawYScale = function(maxValueY, numberOfGraduations)
		{
			var scaleY;
			var stepSizeMet, stepSizePix, n;
			var name;            // String des aktuellen Zahlenwertes
			var nOfPosGrad, nOfNegGrad, sign;   // Anzahl der Skalenschritte, Vorzeichen
			if (yZero < 50)     // positive y-Achse ist größer
				{
					scaleY = (yLine - yMax)/maxValueY;
					stepSizePix = (yLine - yMax)/numberOfGraduations;  // Schrittweite in Pixeln
					numberOfGraduationsRest = floor(yZero*numberOfGraduations/(100 - yZero));  // Schrittanzahl auf der neg. y-Achse
					stepSizeMet = maxValueY/numberOfGraduations;  // Schrittweite in Metern
					nOfPosGrad = numberOfGraduations+1;
					nOfNegGrad = numberOfGraduationsRest+1;
					sign = 1;
				}
			else
				{
					scaleY = (yMin - yLine)/maxValueY;
					stepSizePix = (yMin - yLine)/numberOfGraduations;
					numberOfGraduationsRest = floor((100-yZero)*numberOfGraduations/yZero);  // Schrittanzahl auf der pos. y-Achse
					stepSizeMet = -maxValueY/numberOfGraduations;  // Schrittweite in Metern
					//console.log(scaleY+" "+yZero+" "+stepSizePix+" "+ numberOfGraduationsRest);
					nOfPosGrad = numberOfGraduationsRest+1;
					nOfNegGrad = numberOfGraduations+1;
					sign = -1;
				}
			if (ENDinit)
				{
					for (n = 1; n < nOfPosGrad; n++)
						{ // Skalierung der positiven Halbachse
							name = str(sign*stepSizeMet*n);
							text(name, xMin-1*gridX-textWidth(name), yLine - 0.5*gridY - stepSizePix*n)
							stroke(200);
							line(xMin-0.6*gridX, yLine-stepSizePix*n, xMax, yLine-stepSizePix*n)
							stroke(0);
							line(xMin-0.6*gridX, yLine-stepSizePix*n, xMin+0.6*gridX, yLine-stepSizePix*n)
							noStroke(0);
						}
					for (n = 1; n < nOfNegGrad; n++)
						{ // Skalierung der negativen Halbachse
							name = str(-sign*stepSizeMet*n);
							text(name, xMin-1*gridX-textWidth(name), yLine - 0.5*gridY + stepSizePix*n)
							stroke(200);
							line(xMin-0.6*gridX, yLine+stepSizePix*n, xMax, yLine+stepSizePix*n)
							stroke(0);
							line(xMin-0.6*gridX, yLine+stepSizePix*n, xMin+0.6*gridX, yLine+stepSizePix*n)
							noStroke(0);
						}	
				}				
			return scaleY;
		}
		
	this.drawTimeLine = function(y, startDiagram, lastLine, c, title_y)
    {
			// lastLine: false, wenn weitere Zeitfunktionen dargestellt werden; true, wenn letzte Zeitf.
			push();
      textSize(fntSize);
			textStyle(ITALIC);
      noStroke();
      fill(backgroundColor);
      rectMode(CORNER);
      rect(xBeg+5*gridX-5, yBeg+6*gridY+(unitCounter - 1)*fntSize, textWidth(title_y+"  "), fntSize);  // Hintergrund löschen
      fill(c);
      text(title_y, xBeg+5*gridX, yBeg+5*gridY + unitCounter*fntSize);
      
			if (startDiagram && WEITER) 
        {
					//ellipse(xMin+tX,yLine-y,5,5);   // Darstellung der Zeitfunktion
          stroke(c);
          strokeWeight(2);
          if (tX != 0) line(xMin+tX,yLine-y,xMin+tXOld[unitCounter],yLine-yOld[unitCounter]); 
        }

      yOld[unitCounter] = y;
      tXOld[unitCounter] = tX;
      if (lastLine && startDiagram)
				{
					if (WEITER) tX = tX + deltaX;                      // Zeit-Increment
					//console.log("line: "+unitCounter+" CONTINUE: "+CONTINUE+" start: "+startDiagram+" tX: "+tX);
					if (tX > xMax-xMin)
						{
							tX = 0;
							endTimeLine = true;
							if (cyclic == "continuos")
								{
									INIT = true;        // Löschen des Darstellungsbereiches		
									endTimeLine = false;
								}
							else
								{
									WEITER = false;
									endTimeLine = true;
								}
						}								
				}
			//if (maxUnits < unitCounter) maxUnits = unitCounter; // Bestimmung der max. Linienzahl
			if (unitCounter < 10) unitCounter++;  // max. 10 Zeitfunktionen gleichzeitig darstellbar
      strokeWeight(1);
      pop();
			return endTimeLine;
    }
  }
	
function Xaxis(M, xPos, yPos, xMax, xMin, intervalls, unitName, position, axisColor)
  { // Positionierung im kartesischen Koordinatensystem!
	  /* Constructor */
		this.xPos = xPos;                 // Position der x-Achse, kartesisch, ohne Maßstab
		this.yPos = yPos;
		this.xMax = xMax;                 // maßstäbliche Grenze rechts bzw. links
		this.xMin = xMin;
		this.intervalls = intervalls;     // Anzahl der Zahlenangaben längs der Achse
		this.M = M;               				// Maßstab
		this.unitName = unitName;         // Einheitenname
		this.position = position;         // Einheitenname oben 'o' oder unten 'u' anbringen 
		this.axisColor = axisColor;       // Diagrammfarbe
		var c = this.axisColor;
    var textOffsetY;
		var accuracy = 0;                 // Anzahl Nachkommastellen, mindestens 1
		var decimale = 1;
		var indication = [];              // Skalenangabe als String
		var placeIndication = [];
		
		while (floor(abs((this.xMax-this.xMin)*decimale/this.intervalls)) == 0)
			{ // Bestimmung der Nachkommastellen, für kleine Zahlenangaben wichtig
				accuracy++;
				decimale *= 10;
				//console.log(accuracy);
			}

		var j;                             // Berechnen der Indicatoren
    for (j = 0; j <= this.intervalls; j++)
      { 
        if(this.xMin+(this.xMax-this.xMin)*j/this.intervalls != 0)
				 {
            var x = this.xMin+(this.xMax-this.xMin)*j/this.intervalls;
						placeIndication[j] = this.xPos + x*this.M;
            if(this.xMax > this.xMin)            
              indication[j] = formatNumber(x, 1, accuracy)+unitName; 
            else  
              indication[j] = formatNumber(xMin-x, 1, accuracy)+unitName; 
				 }
				else
					indication[j] = '';   // Null aussparen
      }

		this.drawXaxis = function()
			{
				push();
				stroke(c);
				line(kXi(this.xPos + this.xMin*this.M),kYi(this.yPos),kXi(this.xPos + this.xMax*this.M),kYi(this.yPos));      // horizontale Linie
				textFont('arial', 22*normPixel);
				if (this.position == 'o' || this.position == 'O')
					{
						textAlign(CENTER,BOTTOM);  // Einheiten über der Achse
						textOffsetY = 5*normPixel;
					}
				else  
					{
						textAlign(CENTER,TOP);  // Einheiten unter der Achse
						textOffsetY = -8*normPixel;
					}
				var j;
				for (j = 0; j <= this.intervalls; j++)
					{ 
						stroke(c);
						line(kXi(placeIndication[j]), kYi(this.yPos+5*normPixel), kXi(placeIndication[j]), kYi(this.yPos-5*normPixel)); // vertikale Markierungen
						noStroke();
						fill(c);
						text(indication[j], kXi(placeIndication[j]), kYi(this.yPos+textOffsetY)); 
					}
				pop();  
			}
  }

function Yaxis(xPos, yPos, yMax, yMin, intervalls, scl, unitName, position, axisColor)
  { // Positionierung erfolgt ohne Maßstabsberücksichtigung im kartesischen Koordinatensystem!
	  // Beachte: yMax muss stets größer als yMin sein, dies gilt auch für negative Zahlen!
	  /* Constructor */
		this.xPos = xPos;                 // Position der x-Achse, kartesisch, ohne Maßstab
		this.yPos = yPos;
		this.yMax = yMax;                 // maßstäbliche Grenze rechts bzw. links
		this.yMin = yMin;
		this.intervalls = intervalls;     // Anzahl der Zahlenangaben längs der Achse
		this.M = M;                   // Maßstab
		this.unitName = unitName;         // Einheitenname
		this.position = position;         // Einheitenname oben 'o' oder unten 'u' anbringen 
		this.axisColor = axisColor;       // Diagrammfarbe
		var c = this.axisColor;

    var textOffsetX;
		var accuracy = 0;      // Anzahl Nachkommastellen, mindestens 1
		var decimale = 1;
		var indication = [];              // Skalenangabe als String
		var placeIndication = [];

		while (floor(abs((this.yMax-this.yMin)*decimale/this.intervalls)) == 0)
			{
				accuracy++;
				decimale *= 10;
				//console.log(accuracy);
			}

			var i;
			for (i = 0; i <= this.intervalls; i++) 
				{
					if (this.yMin+(this.yMax-this.yMin)*i/this.intervalls != 0)
						{
							var y = this.yMin+(this.yMax-this.yMin)*i/this.intervalls;     // reale Intervallpos.
							placeIndication[i] = this.yPos + y*this.M;                // transformierte Intervallpos.
							if (this.yMax > this.yMin)
								indication[i] = formatNumber(y, 1, accuracy)+this.unitName; 
							else
								indication[i] = formatNumber(this.yMin-y, 1, accuracy)+this.unitName; 
						}
					else
						{
							indication[i] = "";  // Null auslassen
						}
				}
		
		this.drawYaxis = function()
			{
				push();
				stroke(c);
				line(kXi(this.xPos),kYi(this.yPos + this.yMin*this.M),kXi(this.xPos),kYi(this.yPos + this.yMax*this.M));      // vertikale Linie
				textFont('arial', 22*normPixel);
				if (position == 'r' || position == 'R')
					{ // Einheiten rechts der Achse
						textAlign(LEFT,CENTER);
						textOffsetX = 5*normPixel;
					}
				else
					{ // Einheiten links der Achse
						textAlign(RIGHT,CENTER);
						textOffsetX = -8*normPixel;
					}
					
				var i;
				for (i = 0; i <= this.intervalls; i++) 
					{
						stroke(c);
						line(kXi(this.xPos-5*normPixel), kYi(placeIndication[i]), kXi(this.xPos+5*normPixel), kYi(placeIndication[i]));
						noStroke();
						fill(c);
						text(indication[i], kXi(this.xPos+textOffsetX), kYi(placeIndication[i])); 
					}
				pop();  
			}
  }
	
function Spring(M, springWidth, N, c)
	{
		// Constructor
		this.springWidth = springWidth;
		this.N = N;                 // Anzahl der Windungen
		this.M = M;
		this.c = c;
		
		var n = this.N;
		var sWidth = this.springWidth*this.M;
		
		this.drawSpring = function(xAnf, yAnf, xEnd, yEnd) 
			{
				var phi = atan2((yEnd-yAnf),(xEnd-xAnf));
				var len = sqrt(sq(yEnd-yAnf) + sq(xEnd-xAnf));
				var i;
				
				push();
				translate(kXi(xAnf*this.M),kYi(yAnf*this.M));
				rotate(-phi);
				stroke(this.c);
				strokeWeight(2);
			  //line(0,0,len*this.M,0);
				var dl = len*this.M/n;                        // Länge der Halbspiralen
				var b = sqrt(sq(sWidth) - sq(dl));            // Federbreite
				noFill();
				beginShape();
					vertex(0, 0);                          // Beginn der Feder
					vertex(0.5*dl, 0);
					for (i = 1; i < n; i++)
					 {
						vertex(i*dl, b/2); 
						b = -b;
					 }
					vertex((n-0.5)*dl, 0); 
					vertex(n*dl, 0);     // Ende der Feder
				endShape();														
				pop();			
			}

	}
	
function cramersRule_2D(c1, c2, a11, a12, a21, a22)
	{
		var detA = a11*a22 - a12*a21;
		var x1 = (c1*a22 - c2*a12)/detA;
		var x2 = (a11*c2 - a21*c1)/detA;
		return[detA, x1, x2];
	}
	