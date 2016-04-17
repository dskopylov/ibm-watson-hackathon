//for mozilla 3.*:

/*var console={
	log: function(){}
};*/

/*
	settings for the test
		cubesForLevelChange - number of cubes for changing level
		dropSpeed - ms for moving figure to the next stage
*/
var settings = {
	tetroCountAll: 8, //indexes 0-7
	cubesForLevelChange: 150,
	dropSpeed: 3000,//level-0 
	xDepth: 5,
	yDepth: 5,
	zDepth: 12
}

/*
	information about current game session
		cubesPlayed - number of played cubes
		startTime - time for the start of the game
		timePlayed - time, person had played the game, through current session
*/
var gameSessionInfo={
	timerFunc: 0,
	timerTime:0,
	timerInterval: 10,
	//_____
	currentLevel: 0,
	currentScore: 0,
	cubesPlayed: 0,
	highScore:0,
	startTime: 0,
	timePlayed:0,
	//_____
	currentTetroIndex: 0,
	currentTetroObj: {},
	gameField: [],
	currentTetroBool: [],
	dropZ: -1,
	maxLine: 0
}

var levelUpdateCoefficients = {
	timeBase: 5.51,
	forLevel: 0.64
};

/*
	rotation matrix for rotating tetro around axes
*/
var rotationMatrixObj={
	xPlus: [[1,0,0,0],[0,0,-1,0],[0,1,0,0],[0,0,0,1]],
	xMinus: [[1,0,0,0],[0,0,1,0],[0,-1,0,0],[0,0,0,1]],
	yPlus: [[0,0,1,0],[0,1,0,0],[-1,0,0,0],[0,0,0,1]],
	yMinus: [[0,0,-1,0],[0,1,0,0],[1,0,0,0],[0,0,0,1]],
	zPlus: [[0,-1,0,0],[1,0,0,0],[0,0,1,0],[0,0,0,1]],
	zMinus: [[0,1,0,0],[-1,0,0,0],[0,0,1,0],[0,0,0,1]]
};


/*
	object sets the permission to press keys on the keyboard
*/
var keyObj={
	keyCheck:0
}

// description number
var descCount = 1;

// start counter for preventing n-records
var startCounter=0;

// exit counter
var exitCounter=0;



/*
_____________________________________SAVE_START_FUNCTIONS____________________________________

*/

/*
	committing results
*/
function commit(){

	/*$.ajax({
		type: "",
		url: "",
		data: {personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, 
			personTrainingState: personTrainingState, personTrainingScore:personTrainingScore, 
			openCounter: openCounter, paramNumber: paramNumber}
	})
	.success(function(a) {})
	.fail(function() {});*/

	console.log("pTL = ",personTrainingLevel);
	console.log("pTR = ",personTrainingResult);
	console.log("pTS = ",personTrainingScore); 
	console.log("pN = ",paramNumber); 
	console.log("oC = ", openCounter);
}

/*
	start training by clicking on the play-button
*/
function startTraining(){

	if (startCounter===0){

		startCounter=1;

		$("#firstPage").fadeOut();	
		
		setTimeout(function(){
			$("#firstPage").css("display","none");	
			$("#mainPage").fadeIn();
			openCounter++;
			commit();

			// set level-variable
			gameSessionInfo.currentLevel = personTrainingLevel;

			mainFunction();
		},200);
	}

}


/*
_______________________________________MAIN_FUNCTIONS__________________________________________                                                                                     

*/


/*
	main function
*/
function mainFunction(){

	// hide restart page
	$("#restartGame").css({
		display: "none"
	});

	// start graphics
	gameGraphics.runGraphics();

	// set start game field (empty pit)
	setStartGameField();
	gameGraphics.setStartGameField();
	gameGraphics.setStageColors();

	settings.cubesForLevelChange = settings.xDepth*15+settings.yDepth*15;

	// set drop speed according to level
	settings.dropSpeed = Math.floor(levelUpdateCoefficients.timeBase*
		Math.pow(levelUpdateCoefficients.forLevel,gameSessionInfo.currentLevel)*1000);


	// start game
	setTimeout(function(){

		// set random tetro
		gameSessionInfo.currentTetroObj = cloneObject(tetrominoes[randomize(-0.5,settings.tetroCountAll-1)]);

		// set tetro graphics
		var temp = setTemporaryTetroArray(gameSessionInfo.currentTetroObj);
		gameGraphics.addTetroCubes(temp);

		// start timer
		tetroTimer();

		// allow pressing keys
		keyObj.keyCheck=1;

		gameSessionInfo.timePlayed=0;
		gameSessionInfo.cubesPlayed=0;
		gameSessionInfo.currentScore=0;

		// for time counting
		gameSessionInfo.startTime = new Date().getTime();
		
		updateStatistics();

	},500);

	

}

/*
	timer for z-light moving
*/
function tetroTimer(){

	gameSessionInfo.timerFunc = setInterval(function(){

		if (gameSessionInfo.timerTime>=settings.dropSpeed){

			gameSessionInfo.currentTetroObj = cloneObject(zMoveDown(gameSessionInfo.currentTetroObj).tempTetro);
			gameSessionInfo.currentTetroBool = setTemporaryTetroArray(gameSessionInfo.currentTetroObj);

			gameSessionInfo.timerTime=0;

//console.log(gameSessionInfo.currentTetroBool);

		}
		else{
			gameSessionInfo.timerTime+=gameSessionInfo.timerInterval;
		}

		

	},gameSessionInfo.timerInterval);
}

/*
	обработчик нажатий клавиш на клавиатуре

	main Handler for keyDown-event
	keyCode:
		Q - 81
		A - 65
		W - 87
		S - 83
		E - 69
		D - 68
		Space - 32
		Up - 38
		Down - 40
		Left - 37
		Right - 39
*/
function keyboardHandler(evt){

	if (keyObj.keyCheck===1){
		switch (evt.keyCode){
			case 81: 
				gameSessionInfo.currentTetroObj = cloneObject(qKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 65: 
				gameSessionInfo.currentTetroObj = cloneObject(aKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 87: 
				gameSessionInfo.currentTetroObj = cloneObject(wKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 83: 
				gameSessionInfo.currentTetroObj = cloneObject(sKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 69: 
				gameSessionInfo.currentTetroObj = cloneObject(eKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 68: 
				gameSessionInfo.currentTetroObj = cloneObject(dKeyHandler(gameSessionInfo.currentTetroObj));
				break;
			case 32: 
				spaceKeyHandler(gameSessionInfo.currentTetroObj);
				break;
			case 38: 
				gameSessionInfo.currentTetroObj = cloneObject(upKeyHandler(gameSessionInfo.currentTetroObj).tempTetro);
				break;
			case 40: 
				gameSessionInfo.currentTetroObj = cloneObject(downKeyHandler(gameSessionInfo.currentTetroObj).tempTetro);
				break;
			case 37: 
				gameSessionInfo.currentTetroObj = cloneObject(leftKeyHandler(gameSessionInfo.currentTetroObj).tempTetro);
				break;
			case 39: 
				gameSessionInfo.currentTetroObj = cloneObject(rightKeyHandler(gameSessionInfo.currentTetroObj).tempTetro);
				break;
		}

		gameSessionInfo.currentTetroBool = setTemporaryTetroArray(gameSessionInfo.currentTetroObj);

	}

	//console.log(gameSessionInfo.currentTetroBool);

}

/*
	rotate tetrominoes
*/


//___temporary for debug
function displayTwoDimArray(array){
	for (var i=0;i<array.length;i++){
		console.log(array[i]);
	}
	console.log("_____");
}
//___

function rotateTetro(rotMatrix, tetro){

	var tempTetro = cloneObject(tetro);

	tempTetro.tCenter.push(1);

	// display
	//displayTwoDimArray(tempTetro.cubesCentralPoints);

	var center = transposeMatrix(tempTetro.tCenter);
	for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
		tempTetro.cubesCentralPoints[i].push(1);
		var transp = transposeMatrix(tempTetro.cubesCentralPoints[i]);
		transp = subtractMatrix(transp,center);
		transp = multiplyMatrix(rotMatrix,transp);
		transp = addMatrix(transp,center);
		transp = transposeMatrix(transp);
		transp.splice(transp.length-1,1);
		tempTetro.cubesCentralPoints[i] = transp;
	}

	tempTetro.tCenter.splice(tempTetro.tCenter.length-1,1);

	var obj = checkCoordAfterRotation(tempTetro);
	tempTetro = cloneObject(obj.moveResult.tempTetro);

	// display
	// displayTwoDimArray(tempTetro.cubesCentralPoints);

	if (obj.moveResult.checkCollision || obj.checkZ){
		tempTetro = cloneObject(tetro);
	}

	return tempTetro;

}


/*
	rotate x +90
*/
function qKeyHandler(tetro){

	var tempTetro = rotateTetro(rotationMatrixObj.xPlus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;

}


/*
	rotate x -90
*/
function aKeyHandler(tetro){
	
	var tempTetro = rotateTetro(rotationMatrixObj.xMinus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;

}

/*
	rotate y +90
*/
function wKeyHandler(tetro){

	var tempTetro = rotateTetro(rotationMatrixObj.yPlus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;
}

/*
	rotate y -90
*/
function sKeyHandler(tetro){
	
	var tempTetro = rotateTetro(rotationMatrixObj.yMinus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;

} 

/*
	rotate z +90
*/
function eKeyHandler(tetro){
	
	var tempTetro = rotateTetro(rotationMatrixObj.zPlus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;

}

/*
	rotate z -90
*/
function dKeyHandler(tetro){
	
	var tempTetro = rotateTetro(rotationMatrixObj.zMinus, tetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return tempTetro;

}

//________________________________

/*
	drop figure
*/
function spaceKeyHandler(tetro){

	gameSessionInfo.dropZ = (minPointCoord("z",tetro)-1)/2;

	var tempTetro = cloneObject(tetro);

	var spaceDown = setInterval(function(){

		var obj = zMoveDown(tempTetro);

		if (obj.checkCollision){
			spaceDown = clearInterval(spaceDown);
			/*for (var i=0;i<settings.xDepth;i++){
				displayTwoDimArray(gameSessionInfo.gameField[i])
			}*/
		}
		tempTetro = obj.tempTetro;

		// GRAPHICS
		var temp = setTemporaryTetroArray(tempTetro);
		gameGraphics.addTetroCubes(temp);

	},50);


}

//________________________________

/*
	move up (Oy+)
*/
function upKeyHandler(tetro){
	//console.log("y+");

	var obj={};
	obj.tempTetro = cloneObject(tetro);
	obj.checkCollision = false;
	
	var tempTetro = cloneObject(tetro);
	
	if (maxPointCoord("y",tempTetro)+2<2*settings.yDepth){
		tempTetro.tCenter[1]+=2;
		for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
			tempTetro.cubesCentralPoints[i][1]+=2;
		}
	}
	
	if (checkCollision(setTemporaryTetroArray(tempTetro))){
		obj.checkCollision = true;
		obj.tempTetro = cloneObject(tetro);
	}
	else{
		obj.tempTetro = cloneObject(tempTetro);
	}

	// GRAPHICS
	var temp = setTemporaryTetroArray(obj.tempTetro);
	gameGraphics.addTetroCubes(temp);

	return obj;

}

/*
	move down (Oy-)
*/
function downKeyHandler(tetro){
	//console.log("y-");

	var obj={};
	obj.tempTetro = cloneObject(tetro);
	obj.checkCollision = false;
	
	var tempTetro = cloneObject(tetro);
	
	if (minPointCoord("y",tempTetro)-2>0){
		tempTetro.tCenter[1]-=2;
		for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
			tempTetro.cubesCentralPoints[i][1]-=2;
		}
	}
	
	if (checkCollision(setTemporaryTetroArray(tempTetro))){
		obj.checkCollision = true;
		obj.tempTetro = cloneObject(tetro);
	}
	else{
		obj.tempTetro = cloneObject(tempTetro);
	}

	// GRAPHICS
	var temp = setTemporaryTetroArray(obj.tempTetro);
	gameGraphics.addTetroCubes(temp);

	return obj;

}

/*
	move left (Ox-)
*/
function leftKeyHandler(tetro){
	//console.log("x-");

	var obj={};
	obj.tempTetro = cloneObject(tetro);
	obj.checkCollision = false;
	
	var tempTetro = cloneObject(tetro);
	
	if (minPointCoord("x",tempTetro)-2>0){
		tempTetro.tCenter[0]-=2;
		for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
			tempTetro.cubesCentralPoints[i][0]-=2;
		}
	}

	// for triple q
		if (maxPointCoord("x",tempTetro)>settings.xDepth*2){ 
			tempTetro.tCenter[0]-=2;
			for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
				tempTetro.cubesCentralPoints[i][0]-=2;
			};  
		}
	//___
	
	if (checkCollision(setTemporaryTetroArray(tempTetro))){
		obj.checkCollision = true;
		obj.tempTetro = cloneObject(tetro);
	}
	else{
		obj.tempTetro = cloneObject(tempTetro);
	}

	// GRAPHICS
	var temp = setTemporaryTetroArray(obj.tempTetro);
	gameGraphics.addTetroCubes(temp);

	return obj;

}

/*
	move right (Ox+)
*/
function rightKeyHandler(tetro){
	//console.log("x+");

	var obj={};
	obj.tempTetro = cloneObject(tetro);
	obj.checkCollision = false;
	
	var tempTetro = cloneObject(tetro);
	if (maxPointCoord("x",tempTetro)+2<2*settings.xDepth){
		tempTetro.tCenter[0]+=2;
		for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
			tempTetro.cubesCentralPoints[i][0]+=2;
		}
	}

	if (checkCollision(setTemporaryTetroArray(tempTetro))){
		obj.checkCollision = true;
		obj.tempTetro = cloneObject(tetro);
	}
	else{
		obj.tempTetro = cloneObject(tempTetro);
	}

	// GRAPHICS
	var temp = setTemporaryTetroArray(obj.tempTetro);
	gameGraphics.addTetroCubes(temp);

	return obj;

}


/*
	move down on Oz
*/
function zMoveDown(tetro){
	//console.log("z-");

	var obj = {};
	obj.checkCollision=false;
	
	var tempTetro = cloneObject(tetro);
	var razn = minPointCoord("z",tempTetro)-(gameSessionInfo.maxLine+2);
	var drop = false;

	//console.log(minPointCoord("z",tempTetro),"razn = ",razn);

	tempTetro.tCenter[2]-=2;
	for (var i=0;i<tempTetro.cubesCentralPoints.length;i++){
		tempTetro.cubesCentralPoints[i][2]-=2;
	}
	
	if (checkCollision(setTemporaryTetroArray(tempTetro)) || minPointCoord("z",tempTetro)<0){
		tempTetro = cloneObject(tetro);
		drop=true;
		obj.checkCollision=true;
	}

	if (drop){
		tetroBool = setTemporaryTetroArray(tempTetro);
		addTetroToGameField(tetroBool);		
		gameSessionInfo.cubesPlayed+=tempTetro.cubesCentralPoints.length;
		checkLevelUpdate();
		gameSessionInfo.maxLine = countMaxLine();
		if (gameSessionInfo.dropZ===-1){
			gameSessionInfo.dropZ = (minPointCoord("z",tempTetro)-1)/2;
		}
		checkFullLines();
		gameGraphics.updateGameField();
		updateStatistics();
		if (!checkGameOver()){
			// get new tetro
			gameSessionInfo.currentTetroIndex = randomize(-0.5,settings.tetroCountAll-1);
			gameSessionInfo.currentTetroObj = cloneObject(tetrominoes[gameSessionInfo.currentTetroIndex]);
			gameSessionInfo.currentTetroBool = setTemporaryTetroArray(gameSessionInfo.currentTetroObj);
			tempTetro = cloneObject(gameSessionInfo.currentTetroObj);
			gameSessionInfo.dropZ=-1;
			gameSessionInfo.timerTime=0;
		}

		// save score if higher
		personTrainingScore = gameSessionInfo.highScore;
		commit();
		
	}


	

	obj.tempTetro = cloneObject(tempTetro);

	// GRAPHICS
	var temp = setTemporaryTetroArray(tempTetro);
	gameGraphics.addTetroCubes(temp);

	return obj;

}


function addTetroToGameField(tetroBoolArray){

	//console.log(tetroBoolArray);

	for (var i=0;i<settings.xDepth;i++){
		for (var j=0;j<settings.yDepth;j++){
			for (var z=0;z<settings.zDepth;z++){
				gameSessionInfo.gameField[i][j][z] += tetroBoolArray[i][j][z];
			}
		}
	}

}



function setTemporaryTetroArray(tetro){

	var array=[];

	for (var i=0;i<settings.xDepth;i++){
		array[i]=[];
		for (var j=0;j<settings.yDepth;j++){
			array[i][j]=[];
			for (var z=0;z<settings.zDepth;z++){
				array[i][j][z]=0;
			}
		}
	}	


	for (var k=0;k<tetro.cubesCentralPoints.length;k++){

		var x = (tetro.cubesCentralPoints[k][0]-1)/2;
		var y = (tetro.cubesCentralPoints[k][1]-1)/2;
		var z = (tetro.cubesCentralPoints[k][2]-1)/2;

		array[x][y][z]=1;
	}
	

	return array;

}

/*
	checking and remaking coords after rotating tetro
	return obj:
		check - true(success), false(fail on Oz, coord out of range(-1..))
		tempTetro - object with new coords
*/
function checkCoordAfterRotation(tetro){

	var obj={};
	obj.checkZ = false;
	obj.moveResult = {};
	obj.moveResult.tempTetro = cloneObject(tetro);


	if (minPointCoord("z",obj.moveResult.tempTetro)<=1){
		obj.checkZ=true;
	}
	else{
		if (minPointCoord("x",obj.moveResult.tempTetro)<0){ 
			var mRes = rightKeyHandler(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes); 
		}
		if (maxPointCoord("x",obj.moveResult.tempTetro)>settings.xDepth*2){ 
			var mRes = leftKeyHandler(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes);  
		}
		if (minPointCoord("y",obj.moveResult.tempTetro)<0){
			var mRes = upKeyHandler(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes);  
		}
		if (maxPointCoord("y",obj.moveResult.tempTetro)>settings.yDepth*2){
			var mRes = downKeyHandler(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes); 
		}		
		//
		if (maxPointCoord("z",obj.moveResult.tempTetro)>settings.zDepth*2){ 
			var mRes = zMoveDown(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes); 
		}

		// check for triple q
		if (maxPointCoord("x",obj.moveResult.tempTetro)>settings.xDepth*2){
			var mRes = leftKeyHandler(obj.moveResult.tempTetro);
			obj.moveResult = cloneObject(mRes);  
		}
	}


	obj.moveResult.checkCollision = checkCollision(setTemporaryTetroArray(obj.moveResult.tempTetro));

	return obj;

}

/*
	checking collisions (figure on figure)
*/
function checkCollision(tetroBoolArray){

	var tempGameField = cloneObject(gameSessionInfo.gameField);
	
	var checkC=false;
	
	for (var i=0;i<settings.xDepth;i++){
		for (var j=0;j<settings.yDepth;j++){
			for (var z=0;z<settings.zDepth;z++){
				if ( (tempGameField[i][j][z]*tetroBoolArray[i][j][z])!=0 ){
					checkC=true;
					break;
				}
			}
			if (checkC){break;}
		}
		if (checkC){break;}
	}
	
	return checkC;

}

/*
	counting maxLine for game field
*/
function countMaxLine(){

	//gameSessionInfo.maxLine;
	var maxZ = 0;

	for (var z=0;z<settings.zDepth;z++){
		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){			
				if ( gameSessionInfo.gameField[i][j][z]===1 && z>maxZ ){
					maxZ=z;
				}
			}
		}
	}

	return maxZ;

}

/*
	checking if current level is higher, than pTR
*/
function checkMaxLevel(){
	if (gameSessionInfo.currentLevel>paramNumber){
		paramNumber=gameSessionInfo.currentLevel;
		commit();
	}
}


/*
	checking played cubes of getting 150,300 etc. values and changing level
*/
function checkLevelUpdate(){

	var cLU = Math.floor(gameSessionInfo.cubesPlayed/settings.cubesForLevelChange);

	if (cLU>gameSessionInfo.currentLevel && cLU<=10){
		gameSessionInfo.currentLevel++;
		//checking max level
		checkMaxLevel();
		//set new speed
		settings.dropSpeed = Math.floor(levelUpdateCoefficients.timeBase*
		Math.pow(levelUpdateCoefficients.forLevel,gameSessionInfo.currentLevel)*1000);
	}

	// set pTL-var
	personTrainingLevel = gameSessionInfo.currentLevel;
	commit();

}

/*
	checking end of the game
		maxLine=settings.zDepth-1
*/
function checkGameOver(){
	if (gameSessionInfo.maxLine===settings.zDepth-1){
		keyObj.keyCheck=0;
		gameSessionInfo.timerFunc=clearInterval(gameSessionInfo.timerFunc);
		//___ set result
		var endTime = new Date().getTime();
		gameSessionInfo.timePlayed = endTime - gameSessionInfo.startTime;
		updateResult(1);
		// drop session settings to zero
		gameSessionInfo.currentLevel=0;
		gameSessionInfo.startTime=0;
		gameSessionInfo.timePlayed=0;
		
		//___
		$("#restartGame").fadeIn();
		return true;
	}
	else{
		return false;
	}
}

/*
	check if person has achieved score better than his highest
*/
function checkHighScore(){

	if (gameSessionInfo.currentScore>gameSessionInfo.highScore){
		gameSessionInfo.highScore = gameSessionInfo.currentScore;
	}

}


/*
	setting game field to 0
*/
function setStartGameField(){

	for (var i=0;i<settings.xDepth;i++){
		gameSessionInfo.gameField[i]=[];
		for (var j=0;j<settings.yDepth;j++){
			gameSessionInfo.gameField[i][j]=[];
			for (var z=0;z<settings.zDepth;z++){
				gameSessionInfo.gameField[i][j][z]=0;			
			}
		}
	}

}


function checkFullLines(){

	var counter=0;
	var fullLines = [];

	for (var z=0;z<settings.zDepth;z++){
		counter=0;
		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){
				if (gameSessionInfo.gameField[i][j][z]===1){
					counter++;
				}
			}
		}
		if (counter===settings.xDepth*settings.yDepth){
			fullLines.push(z);
		}
	}
	
	// moving lines (deleting full ones)
	for (var f=fullLines.length-1;f>=0;f--){
		for (var z=0;z<settings.zDepth;z++){
			// find full line
			if (z===fullLines[f]){
				// if  full line is not last in a pit
				if (z!=settings.zDepth-1){
					for (var zf=z;zf<settings.zDepth;zf++){
						for (var i=0;i<settings.xDepth;i++){
							for (var j=0;j<settings.yDepth;j++){
								if (zf===settings.zDepth-1){
									gameSessionInfo.gameField[i][j][zf] = 0;
								}
								else{
									gameSessionInfo.gameField[i][j][zf] = gameSessionInfo.gameField[i][j][zf+1];
								}
							}
						}
					}
				}				
			}			
		}
	}

/*console.log(fullLines,fullLines.length);
console.log("dropPosition",gameSessionInfo.dropZ);*/

	// score
	//var stDate = new Date().getTime();
	var s = defaultScoreCounter(fullLines.length,gameSessionInfo.dropZ,gameSessionInfo.currentTetroObj);
	//var eDate = new Date().getTime();

}


function defaultScoreCounter(lNum, dropZ, tetro){

	var tetroScore = tetroScoreCounter(dropZ, tetro);
	var emptyPit = checkEmptyPit();
	var lineScore = lineScoreCounter(lNum);

/*console.log(tetroScore,emptyPit,lineScore);*/

	var score = Math.round((lineScore + tetroScore + emptyPit)*scoreParameters.depth[settings.zDepth]);

	gameSessionInfo.currentScore += score;

	checkHighScore();

	return score;

}


function checkEmptyPit(){
	var counter=0;

	for (var z=0;z<settings.zDepth;z++){
		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){
				if (gameSessionInfo.gameField[i][j][z]===1){
					counter++;
				}
			}
		}
	}

	if (counter===0){
		return scoreParameters.lineScoreSet*scoreParameters.lineForLevel[gameSessionInfo.currentLevel]*scoreParameters.fullLineNumber[2];
	}
	else{
		return 0;
	}

}

/*
	scoring line	
	lines - how many lines have been deleted
*/
function lineScoreCounter(lNum){

	return scoreParameters.lineScoreSet*scoreParameters.lineForLevel[gameSessionInfo.currentLevel]*scoreParameters.fullLineNumber[lNum];

}


function tetroScoreCounter(dropZ, tetro){

	if (tetro!=null){
		var forDrop = dropZ/(settings.zDepth-1);
		return (tetro.lowScore+(tetro.highScore-tetro.lowScore)*forDrop)*scoreParameters.forLevel[gameSessionInfo.currentLevel];
	}
	else{
		return 0;
	}

	
}



/*
	setting result to the pTR-variable
	format - 
		level:gOverCheck:cubesPlayed:score:timePlayed; ???
	gOvercheck: 0-'exitPage' clicked, 1-game over 
*/
function updateResult(gOverCheck){

	personTrainingResult+=gameSessionInfo.currentLevel+":"+gOverCheck+":"+gameSessionInfo.cubesPlayed+":"+
							gameSessionInfo.currentScore+":"+gameSessionInfo.timePlayed+";";
	commit();

}




//______________________________________________________________________________________________
//______________________________________________________________________________________________
//______________________________________________________________________________________________

/*
	select max {x||y||z} coord of a point
*/
function maxPointCoord(typeOfCoord, tetro){

	var ind=0;

	switch (typeOfCoord){
		case "x": ind=0; break;
		case "y": ind=1; break;
		case "z": ind=2; break;
	}

	var max=tetro.cubesCentralPoints[0][ind];

	for (var i=0;i<tetro.cubesCentralPoints.length;i++){
		if (tetro.cubesCentralPoints[i][ind]>max){
			max = tetro.cubesCentralPoints[i][ind];
		}
	}

	return max;

}

/*
	selecting min {x||y||z} coord of a point
*/
function minPointCoord(typeOfCoord, tetro){

	var ind=0;

	switch (typeOfCoord){
		case "x": ind=0; break;
		case "y": ind=1; break;
		case "z": ind=2; break;
	}

	var min=tetro.cubesCentralPoints[0][ind];

	for (var i=0;i<tetro.cubesCentralPoints.length;i++){
		if (tetro.cubesCentralPoints[i][ind]<min){
			min = tetro.cubesCentralPoints[i][ind];
		}
	}

	return min;

}


/*
	clone all object
*/
function cloneObject(obj) {
	return eval("("+JSON.stringify(obj)+")");
}

/*
	randomizing number in the interval [min,max]
*/
function randomize(min,max){
	num = Math.ceil((Math.random()*(max-min))+min);
	return Math.abs(num);
}

/*
	update statistics fields
*/
function updateStatistics(){
	$("#levelInfo").html(gameSessionInfo.currentLevel);
	$("#scoreInfo").html(gameSessionInfo.currentScore);
	$("#cubesInfo").html(gameSessionInfo.cubesPlayed);
	$("#highScoreInfo").html(gameSessionInfo.highScore);
}

/*
	showing question / task description
*/
function displayDescription(idNum){
	for (var i=0;i<descCount;i++){
		if (i===idNum){
			$("#desc"+i).css("display","inline-block");
		}
		else{
			$("#desc"+i).css("display","none");
		}
	}
}

/*
	showing info-block
*/
function infoHandler(){

	// clear timer
	gameSessionInfo.timerFunc = clearInterval(gameSessionInfo.timerFunc);
	
	// display pause
	$("#pauseGame").css({
		display: "block"
	});

	//display info
	$("#infoPage").css({
		display: "block"
	});

	// starting info canvas
	infoGraphics.runGraphics();
}

/*
	closing info page
*/
function closeInfoPage(){

	// stopping info canvas
	infoGraphics.showInfo = clearInterval(infoGraphics.showInfo);

	//return timer if game is not over
	if (gameSessionInfo.startTime!=0){
		tetroTimer();
	}
	

	// hide pause
	$("#pauseGame").css({
		display: "none"
	});

	//hide info
	$("#infoPage").css({
		display: "none"
	});

}


/*
	exit function
*/
function exitHandler(){

	if (exitCounter===0){
		exitCounter++;
		displayDescription(0);
		var timeToWait=5000;
		var t=0;
		var wait = setInterval(function(){
			if (t<timeToWait){
				t+=50;
			}
			else{
				exitCounter=0;
				$("#desc0").css("display","none");
				wait = clearInterval(wait);
			}
		},50);
	}
	else{
		personTrainingState=1;
		updateResult(0);
		commit();
		showExitPage();
	}

}

function showExitPage(){
	// EXIT PAGE

	keyObj.keyCheck=0;
	gameSessionInfo.timerFunc=clearInterval(gameSessionInfo.timerFunc);

	$("#mainPage").fadeOut();
	setTimeout(function(){
		$("#mainPage").css("display","none");
		$("#exitPage").fadeIn();
	},350);

}


