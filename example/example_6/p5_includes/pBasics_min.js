/* Basisroutinen    für Beispiellösung Übung modifiziert !!! **********************/
/* Stand: 10.05.2020                                      */
/*	       canvasStyle.style.height = height;             */
/*                                                        */
/* - kXi, kYi, iXk, iYk Koordinaten-Transformationen      */
/* - Mouse- und Touchhandling                             */
/* - responsive design: Änderung der Fenstergröße dyn.    */
/*   berücksichtigen                                      */
/* Funktionen zur Gestaltung der html-Seite               */
/* und Auswertung der @mediaQuerries                      */
/*                                                        */
/**********************************************************/

/* Transformation kartesischer in interne Koordinaten bezügl. xi0 und yi0 (in Constants.js deklariert) */
function kXi(a)
{ /* a ist beliebige kart. Größe */
  return(a + xi0);
}

function kYi(b)
{ /* b ist bel. kart. Größe */
  return(yi0 - b);
}

/* Transformation interner in kartesische Koordinaten */
function iXk(a)
{ /* a ist beliebige interne Größe */
  return(a - xi0);
}
  
function iYk(b)
{ /* b ist bel. interne Größe */
  return(yi0 - b);
}

/* Mouse- und Touch-Eventbehandlung */
var isTouchscreen = false;

/* Mouse-Routinen */
var mClicked = false;              // Merker für Mausstati
var mPressed = false;
var mReleased = false;
var mDragged = false;

function mouseClicked()
{  /* der Merker mClick muss nach Gebrauch extern rückgesetzt werden! */
   mClicked = true;
	 //alert("mouse");
   //isTouchscreen = false;
}

function mousePressed()
{  
  mPressed = true;              
  mReleased = false;
}
 
function mouseReleased()
	{  /* der Merker mReleased muss nach Gebrauch extern rückgesetzt werden! */
	  mReleased = true;
	  mPressed = false;  
	  mClicked = false;
		//console.log("mReleased: "+mReleased+" mPressed: "+mPressed+" mClicked: "+mClicked);
	}

function mouseDragged()
{  /* der Merker mDragged muss nach Gebrauch extern rückgesetzt werden! */
  mDragged = true;
}


/* Tastatur-Routinen */
var key;

function keyPressed()
	{
		key = keyCode;
	}

/* file I/O */
var fileData = [];
var dataLength;
var errorMessage;

function saveStringToFile(fileData, selector, fileName)
	{ // fileData: list of outputString, selector: Trennzeichen, fileName: 'name.txt'
		var outputList = split(fileData, selector);
		saveStrings(outputList, fileName);
	}

function loadStringFromFile(fileContent)
	{ // erster Datensatz im File gibt Anzahl der Daten zurück
		dataLength = fileContent[0];
		for (var i = 0; i < dataLength; i++)
			fileData[i] = fileContent[i];
	}

function loadError(errorMsg)
	{
		errorMessage = errorMsg;
		console.log("file Error: "+errorMessage);
	}		
