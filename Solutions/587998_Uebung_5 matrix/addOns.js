/* template GTAT2 Game Technology & Interactive Systems - addOns */
/* Autor: Hyun Bin Jeoung 587998 */
/* Übung Nr. 5*/
/* Datum: 12.11.2024*/



let playground = {
	width: 10,
	padding: 1
  };
  
  let base = {
	nullpunkt: 0,
	height: 0.5,
	maxWidth: 10.2,
	width: 10,
	maxHeight: 4,
	startRamp: 9,
	holeLeft: 7.6,
	holeRight: 7.4,
	color: [115, 159, 208]
  };
  
  let slope = {
	left: 10,
	right: 9,
	top: 0.5,
	bottom: 0
  }
  
  let slingTip = {
	x: -1,
	y: 0.5,
	color: 0
  };
  
  let sling = {
	nullpunkt: 0,
	right: 0.9,
	left: 1.1,
	color: [32, 75, 33]
  }
  
  let slingShot = {
	color: [141, 161, 189],
	stroke: [130, 149, 169],
	strokeWeight: 1
  }
  
  let hindarance = {
	nullpunkt: 0,
	right: 2.9,
	left: 3.1,
	height: 0.5,
	color: [255, 0, 0]
  }
  
  let flagpole = {
	nullpunkt: 0,
	right: 8,
	left: 8.03,
	height: 2,
	color: [0]
  }
  
  var flag = {
	top: 1.9,
	bottom: 1.5,
	middle: 1.7,
	flagWind: 0,
	color: [253, 216, 98],
	stroke: [108, 132, 136],
	strokeWeight: 2
  }
  
  var redBall = {
	x0: -6,
	y0: 0.1,
	diameter: 0.2,
	color: [255, 0, 0]
  };
  
  var slingBall = {
	x0: -0.4, y0: 0.3,
	diameter: 0.2,
	v0: 8,
	vx0: 1, vy0: 1,
	vx: 0, vy: 0,
	alpha: 0,
	color: [18, 117, 46],
	s: 0,
	vs: 0
  };

