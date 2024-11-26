/*******************************************************/
/*                 Games Physics                       */
/* Autor:  Dr. Volkmar Naumburger                      */
/*                                                     */
/* ! Nur in der setup-Routine zu benutzen !            */
/*                                                     */
/* Konstantendeklarationen                             */
/* basierend auf der aktuellen Fensterhöhe und         */
/* -breite                                             */
/* v0.1: normierte Fontgröße fontSize hinzugefügt      */
/*                                                     */
/* Stand: 04.11.2023                                   */
/*******************************************************/

// globale Systemkonstanten
var gridX, gridY;
var normPixel, normPixelX, normPixelY;
var fontSize;
var buttonWidth, buttonHeight;


function setConstants()
  {
		// Systemkonstanten
		gridX = canvasWidth/100;												// % der Fensterbreite und -höhe
		gridY = canvasHeight/100;
		normPixelX = canvasWidth/1000.0;                // 1000 normierte Pixel = Fensterbreite
    normPixelY = canvasHeight/1000.0;               // 1000 normierte Pixel = Fensterhöhe
    normPixel = sqrt(normPixelX*normPixelY);  			// geom. Mittel
		fontSize = 12*normPixel;												// Standardfontsize
		buttonWidth = 8*gridX;
		buttonHeight = 7*gridY;
		scrollbarHeight = 150*normPixelY;          // Standardmaße Scrollbar, Verhältnis h:b ist const.
		scrollbarWidth = 30*normPixelY;
  }

