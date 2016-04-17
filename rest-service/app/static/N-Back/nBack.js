//for mozilla 3.*:

/*var console={
	log: function(){}
};*/

/*
	results for current block
*/
var clientResults={
	posMatch:[],
	posMatchTime:[],
	colMatch:[],
	colMatchTime:[]
}

/*
	training settings:
		trialAll: number of trials,
		msPerTrial: time for each trial in ms,
		msPerStimuli: time for each stimuli in ms
		pCLength: number of positions and colors 
		interval: interval for startBlock function
*/
var settings={
	trialAll: 20,
	msPerTrial: 3000,
	msPerStimuli: 500,
	pCLength: 9,
	interval: 10
}

var colorObj={
	colorCode: ["#00539e","#3d7b3d","#fd482f","#fee01e","#6b2121","#81d8d0","#909090","#d7bcfb","#f79727"]
	//colorName: [	"blue","green",  "red",	   "yellow","darkred","cyan",   "gray",   "lilac",   "orange"],
};

/*
	block to display
	position: array of positions
	colors: array of (index+1) of colorCode(colorObj)
	posMatch,colMatch : 1 if match
	dispCounter: counter for squares
*/
var displayBlock={
	position: [],
	posMatch: [],
	colors:[],
	colMatch:[],
	dispCounter: 0
}

/*
	object set the permission to press keys on the keyboard
		p - position-key (80)
		c - color-key (67)
		space - space-key (32)
*/
var keyObj={
	pCheck: 0,
	cCheck: 0,
	spaceCheck: 0
}

// number of description divs
var descCount=3;

// start stimuli time
var timeObj={
	startTime: 0,
	tCheck: 1
}

// exit training count
var exitCounter=0;

// start counter for preventing n-records
var startCounter=0;



/*
_____________________________________SAVE_START_FUNCTIONS____________________________________

*/

/*
	committing results
*/
function commit(){

	$.ajax({
		type: "",
		url: "",
		data: {personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, personTrainingState: personTrainingState, openCounter: openCounter, paramNumber: paramNumber}
	})
	.success(function(a) {})
	.fail(function() {});

	console.log("pTL = ",personTrainingLevel);
	console.log("pTR = ",personTrainingResult); 
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
			mainFunction();
		},350);
	}
	
}


/*
	starting block of stimuli
*/
function startBlock(){


	var mTime = 0;
	var move = setInterval(function(){

		if (displayBlock.dispCounter!=settings.trialAll){
			if (mTime<settings.msPerTrial){
				
				if (mTime<=settings.msPerStimuli){

					if (timeObj.tCheck===1){
						timeObj.tCheck = 0;
						timeObj.startTime = new Date().getTime();

						textColor("positionC","#000");
						textColor("colorC","#000");

						keyObj.pCheck=1;
						keyObj.cCheck=1;
					}

					$("#square"+displayBlock.position[displayBlock.dispCounter]).css({
						"background": colorObj.colorCode[displayBlock.colors[displayBlock.dispCounter]-1],
						"display": "block"
					});
				}
				else{
					$("#remainS").html(settings.trialAll-displayBlock.dispCounter-1+" "+
						stimuliLeft(settings.trialAll-displayBlock.dispCounter-1));

					$("#square"+displayBlock.position[displayBlock.dispCounter]).css({
						"display": "none"
					});
				}

				mTime+=settings.interval;
			}
			else{

				timeObj.tCheck=1;

				// update result
				updateResult();
				
				mTime=0;
				displayBlock.dispCounter++;
				
			}
		}
		else{

			// calculating result
			accuracyCheck();

			//display level
			$("#level").html(personTrainingLevel);


			displayDescription(1);
			textColor("positionC","#000");
			textColor("colorC","#000");

			// clear display block and client results arrays
			clearClientResults();
			clearDisplayBlock();

			keyObj.spaceCheck=1;
			displayBlock.dispCounter=0;

			// display remaining stimuli
			$("#remainS").html(settings.trialAll-displayBlock.dispCounter+" "+stimuliLeft(settings.trialAll-displayBlock.dispCounter));

			move = clearInterval(move);
		}

	}, settings.interval);
}


/*
_______________________________________MAIN_FUNCTIONS__________________________________________                                                                                     

*/


/*
	main function
*/
function mainFunction(){

	displayDescription(0);
	keyObj.spaceCheck=1;

	if (personTrainingLevel===0){
		personTrainingLevel=2;
	}

	settings.trialAll=settings.trialAll+personTrainingLevel;

	lifeDisplay();

	$("#level").html(personTrainingLevel);

	$("#remainS").html(settings.trialAll+" "+stimuliLeft(settings.trialAll));

}


/*
	main Handler for keyUp-event
	keyCode:
		Space=32
		N=78 // position key
		Z=90 // color key
*/
function keyboardHandler(evt){
	
	switch (evt.keyCode){
		case 32:
			if (keyObj.spaceCheck===1){
				spaceKeyHandler();
			}
			break;
		case 78:
			if (keyObj.pCheck===1){
				pKeyHandler();
			}
			break;
		case 90:
			if (keyObj.cCheck===1){
				cKeyHandler();
			}
			break;
	}

}

/*
	space-press event handler
*/
function spaceKeyHandler(){

	keyObj.spaceCheck=0;
	displayDescription(-1);

	$("#levelInfo").html("");
	$("#percentCont").css("display","none");

	blockMaker();
	startBlock();

}

/*
	p-press event handler
*/
function pKeyHandler(){

	var endTime = new Date().getTime();

	clientResults.posMatch[displayBlock.dispCounter] = 1;
	clientResults.posMatchTime[displayBlock.dispCounter] = endTime-timeObj.startTime;

	if (clientResults.posMatch[displayBlock.dispCounter]===displayBlock.posMatch[displayBlock.dispCounter]){
		textColor("positionC","#68b768");
	}
	else{
		textColor("positionC","#ed3232");
	}

	keyObj.pCheck=0;

}

/*
	c-press event handler
*/
function cKeyHandler(){

	var endTime = new Date().getTime();

	clientResults.colMatch[displayBlock.dispCounter] = 1;
	clientResults.colMatchTime[displayBlock.dispCounter] = endTime-timeObj.startTime;

	if (clientResults.colMatch[displayBlock.dispCounter]===displayBlock.colMatch[displayBlock.dispCounter]){
		textColor("colorC","#68b768");
	}
	else{
		textColor("colorC","#ed3232");
	}

	keyObj.cCheck=0;

}


/*
___________________________________CALCULATE_&_RESULTS_&_DISPLAY_________________________________

*/

/*
	checking if position-index in the parameter-array had already been set
	number - position in the array, parameter - "position" || "color"

	return: number of clear index in the array, -1 if no position clear around input-number
*/
function clearCheck(number,parameter){

	if (parameter==="position"){
		if (number<personTrainingLevel){
			// checking clear
			if (displayBlock.position[number]==undefined){
				return number;
			}
			else if((number+personTrainingLevel)<settings.trialAll && displayBlock.position[number+personTrainingLevel]==undefined){
				return number+personTrainingLevel;
			}
			else{
				return -1;
			}
		}
		else{
			// checking clear
			if (displayBlock.position[number]==undefined){
				return number;
			}
			else if((number+personTrainingLevel)<settings.trialAll && displayBlock.position[number+personTrainingLevel]==undefined){
				return number+personTrainingLevel;
			}
			else if((number-personTrainingLevel)>=0 && displayBlock.position[number-personTrainingLevel]==undefined){
				return number-personTrainingLevel;
			}
			else{
				return -1;
			}
		}
	}
	else if (parameter==="color"){
		if (number<personTrainingLevel){
			// checking clear
			if (displayBlock.colors[number]==undefined){
				return number;
			}
			else if((number+personTrainingLevel)<settings.trialAll && displayBlock.colors[number+personTrainingLevel]==undefined){
				return number+personTrainingLevel;
			}
			else{
				return -1;
			}
		}
		else{
			// checking clear
			if (displayBlock.colors[number]==undefined){
				return number;
			}
			else if((number+personTrainingLevel)<settings.trialAll && displayBlock.colors[number+personTrainingLevel]==undefined){
				return number+personTrainingLevel;
			}
			else if((number-personTrainingLevel)>=0 && displayBlock.colors[number-personTrainingLevel]==undefined){
				return number-personTrainingLevel;
			}
			else{
				return -1;
			}
		}
	}
	
}

/*
	check if new position in displayBlock-obj is n-next or n-prev to already reserved position
	value - possible new value, pos - new index, parameter - "position" || "color"

	return {val,type} -  
		val: inputInFunc-value || value of reserved position 
		typePos: "prev" || "next" || "current", set on 2 indexes or one(current)
*/
function checkIndex(value,pos,parameter){

	var obj={
		val: value,
		typePos: "current"
	};

	if (parameter==="position"){
		if ((pos-personTrainingLevel<0) && (pos+personTrainingLevel<settings.trialAll)){
			//check +n
			if (displayBlock.position[pos+personTrainingLevel]===undefined){
				obj.val = value;
				obj.typePos = "next";
			}
			else{
				obj.val = displayBlock.position[pos+personTrainingLevel];
				obj.typePos = "current";
			}
		}
		else if ((pos+personTrainingLevel>=settings.trialAll) && (pos-personTrainingLevel>=0)){
			// check -n
			if (displayBlock.position[pos-personTrainingLevel]===undefined){
				obj.val = value;
				obj.typePos = "prev";
			}
			else{
				obj.val = displayBlock.position[pos-personTrainingLevel];
				obj.typePos = "current";
			}
		}
		else{
			//check +/-
			if (displayBlock.position[pos+personTrainingLevel]===undefined && (pos+personTrainingLevel<settings.trialAll)){
				obj.val = value;
				obj.typePos = "next";
			}
			else if (displayBlock.position[pos-personTrainingLevel]===undefined && (pos-personTrainingLevel>=0)){
				obj.val = value;
				obj.typePos = "prev";
			}
			else{
				obj.val = displayBlock.position[pos-personTrainingLevel];
				obj.typePos = "current";
			}
		}
	}
	else if (parameter==="color"){
		if ((pos-personTrainingLevel<0) && (pos+personTrainingLevel<settings.trialAll)){
			//check +n
			if (displayBlock.colors[pos+personTrainingLevel]===undefined){
				obj.val = value;
				obj.typePos = "next";
			}
			else{
				obj.val = displayBlock.colors[pos+personTrainingLevel];
				obj.typePos = "current";
			}
		}
		else if ((pos+personTrainingLevel>=settings.trialAll) && (pos-personTrainingLevel>=0)){
			// check -n
			if (displayBlock.colors[pos-personTrainingLevel]===undefined){
				obj.val = value;
				obj.typePos = "prev";
			}
			else{
				obj.val = displayBlock.colors[pos-personTrainingLevel];
				obj.typePos = "current";
			}
		}
		else{
			//check +/-
			if (displayBlock.colors[pos+personTrainingLevel]===undefined && (pos+personTrainingLevel<settings.trialAll)){
				obj.val = value;
				obj.typePos = "next";
			}
			else if (displayBlock.colors[pos-personTrainingLevel]===undefined && (pos-personTrainingLevel>=0)){
				obj.val = value;
				obj.typePos = "prev";
			}
			else{
				obj.val = displayBlock.colors[pos-personTrainingLevel];
				obj.typePos = "current";
			}
		}
	}


	return obj;

}

/*
	setting value of the parameter on the position in the displayBlock-obj
*/
function setValue(value, parameter, pos){

	if (parameter==="position"){
		obj = checkIndex(value,pos,parameter);
		value = obj.val;
		switch (obj.typePos){
			case "prev": 
				displayBlock.position[pos-personTrainingLevel] = value;
				displayBlock.position[pos] = value;
				break;
			case "next": 
				displayBlock.position[pos+personTrainingLevel] = value;
				displayBlock.position[pos] = value;
				break;
			case "current": 
				displayBlock.position[pos] = value;
				break;
		}
	}
	else if (parameter==="color"){
		obj = checkIndex(value,pos,parameter);
		value = obj.val;
		switch (obj.typePos){
			case "prev": 
				displayBlock.colors[pos-personTrainingLevel] = value;
				displayBlock.colors[pos] = value;
				break;
			case "next": 
				displayBlock.colors[pos+personTrainingLevel] = value;
				displayBlock.colors[pos] = value;
				break;
			case "current": 
				displayBlock.colors[pos] = value;
				break;
		}
	}
}

/*
	clearing displayBlock-obj
*/
function clearDisplayBlock(){
	var n = settings.trialAll;
	displayBlock.position = new Array(n);
	displayBlock.colors = new Array(n);
	displayBlock.posMatch = new Array(n);
	displayBlock.colMatch = new Array(n);
}

function clearClientResults(){
	var n = settings.trialAll;
	clientResults.posMatch = new Array(n);
	clientResults.posMatchTime = new Array(n);
	clientResults.colMatch = new Array(n);
	clientResults.colMatchTime = new Array(n);
}

/*
	setting new displayBlock-obj
*/
function blockMaker(){

	clearDisplayBlock();

	//_____POSITION_____

	var k = randomize(1,settings.trialAll-personTrainingLevel-1);
	var kCount = 0;
	while (kCount!=k){		
		var pos = randomize(0,settings.trialAll-personTrainingLevel-1);
		pos = clearCheck(pos,"position");
		while (pos===-1){
			pos = randomize(0,settings.trialAll-personTrainingLevel-1);
			pos = clearCheck(pos,"position");
		}
		console.log(pos);
		// pos found
		var value = randomize(0.1,settings.pCLength);
		setValue(value,"position",pos);
		kCount++;
		if (checkArrayFull(displayBlock.position)){break;}
	}
	fillArrayOther(displayBlock.position);
	setMatch("position");

	//_____COLORS_____

	var k = randomize(1,settings.trialAll-personTrainingLevel-1);
	var kCount = 0;
	while (kCount!=k){		
		var pos = randomize(0,settings.trialAll-personTrainingLevel-1);
		pos = clearCheck(pos,"color");
		while (pos===-1){
			pos = randomize(0,settings.trialAll-personTrainingLevel-1);
			pos = clearCheck(pos,"color");
		}
		// pos found
		var value = randomize(0.1,settings.pCLength);
		setValue(value,"color",pos);
		kCount++;
		if (checkArrayFull(displayBlock.colors)){break;}
	}
	fillArrayOther(displayBlock.colors);
	setMatch("color");
	
	//console.log(displayBlock);

}

/*
	setting match arrays to position or color (type)
*/
function setMatch(type){

	if (type==="position"){
		for (var i=personTrainingLevel;i<settings.trialAll;i++){
			if (displayBlock.position[i]===displayBlock.position[i-personTrainingLevel]){
				displayBlock.posMatch[i] = 1;
			}
		}
	}
	else if (type==="color"){
		for (var i=personTrainingLevel;i<settings.trialAll;i++){
			if (displayBlock.colors[i]===displayBlock.colors[i-personTrainingLevel]){
				displayBlock.colMatch[i] = 1;
			}
		}
	}

}


/*
	setting non-n-back values to array
*/
function fillArrayOther(array){

	var value;

	for (var i=0;i<settings.trialAll;i++){
		if (array[i]===undefined){
			value = randomize(0.1,settings.pCLength);
			while(value===array[i-personTrainingLevel] || value===array[i+personTrainingLevel]){
				value = randomize(0.1,settings.pCLength);
			}
			array[i]=value;
		}
	}

}

/*
	check if array is already filled
*/
function checkArrayFull(array){

	var count=0;

	for (var i=0;i<settings.trialAll;i++){
		if (array[i]!=undefined){count++;}
	}

	if (count==settings.trialAll){return true;}
	else{return false;}

}


/*
	randomizing number in the interval [min,max]
*/
function randomize(min,max){
	num = Math.ceil((Math.random()*(max-min))+min);
	return num;
}

/*
	setting result to the pTR-variable and results[]
*/
function updateResult(){

	var tempMP=0; // match position
	var tempMC=0; // match color
	var tempMPT=0; // match position time
	var tempMCT=0; // match color time

	if (clientResults.posMatch[displayBlock.dispCounter]!=undefined){
		tempMP = clientResults.posMatch[displayBlock.dispCounter];
	}
	else{
		tempMP = 0;
	}

	if (clientResults.posMatchTime[displayBlock.dispCounter]!=undefined){
		tempMPT = clientResults.posMatchTime[displayBlock.dispCounter];
	}
	else{
		tempMPT = '-';
	}

	if (clientResults.colMatch[displayBlock.dispCounter]!=undefined){
		tempMC = clientResults.colMatch[displayBlock.dispCounter];
	}
	else{
		tempMC = 0;
	}

	if (clientResults.colMatchTime[displayBlock.dispCounter]!=undefined){
		tempMCT = clientResults.colMatchTime[displayBlock.dispCounter];
	}
	else{
		tempMCT = '-';
	}

	personTrainingResult+=personTrainingLevel+":"+displayBlock.position[displayBlock.dispCounter]+":"+displayBlock.colors[displayBlock.dispCounter]+":"+tempMP+":"+tempMC+":"+tempMPT+":"+tempMCT+";";

	//console.log(results,personTrainingResult);

	commit();
}

/*
	counting matches in the array (1)
*/
function matchCount(array){
	var c=0;
	for (var i=0;i<settings.trialAll;i++){
		if (array[i]===1){
			c++;
		}
	}
	return c;
}

/*
	counting correct results for client
	type: "position" || "color"
*/
function correctCount(type){

	var c=0;

	if (type==="position"){
		for (var i=0;i<settings.trialAll;i++){
			if (clientResults.posMatch[i]===displayBlock.posMatch[i]){
				c++;
			}
		}
	}
	else if (type==="color"){
		for (var i=0;i<settings.trialAll;i++){
			if (clientResults.colMatch[i]===displayBlock.colMatch[i]){
				c++;
			}
		}
	}

	return c;

}


/*
	checking accuracy for block 
*/
function accuracyCheck(){

	var levelInfo="Уровень:<br> не изменился";
	
	var clientPosMatchCorrect = correctCount("position");
	var clientColMatchCorrect = correctCount("color");

	var realPosMatch = matchCount(displayBlock.posMatch);
	var realColMatch = matchCount(displayBlock.colMatch);

	console.log("clientCorrect = ",clientPosMatchCorrect,clientColMatchCorrect);

	var percent=100*((clientPosMatchCorrect+clientColMatchCorrect)/(2*settings.trialAll));
	console.log("percent = ",percent);

	if (percent>=80){
		if (personTrainingLevel!=settings.trialAll-1){			
			personTrainingLevel++;
			settings.trialAll++;
			levelInfo="Уровень:<br> увеличился";
		}
		paramNumber=0;
	}
	else if(percent<50){
		paramNumber++;
		if (paramNumber!=3){
			$("#life"+paramNumber).fadeOut();			
		}
		else{
			$("#life"+paramNumber).css("display","none");
		}
	}

	if (paramNumber===3){
		paramNumber=0;
		if (personTrainingLevel!=1){
			personTrainingLevel--;
			settings.trialAll--;
			levelInfo="Уровень:<br> уменьшился";
		}
	}

	lifeDisplay();

	$("#percentInfo").html(percent.toFixed(1)+"%");	
	$("#percentCont").css("display","block");

	$("#levelInfo").html(levelInfo);

	$("#remainS").html(settings.trialAll+" "+stimuliLeft(settings.trialAll));

	commit();

}

/*
	displaying lives
*/
function lifeDisplay(){
	for (var i=3;i>paramNumber;i--){
		$("#life"+i).css("display","inline-block");
	}
}

/*
	language correcttion for remaining stimuli text
*/
function stimuliLeft(num){
	var str=""+num;
	if (str.length===1){
		if (num===1){ return "стимул"; }
		else if (num>=2 && num<=4){ return "стимула"; }
		else{ return "стимулов"; }
	}
	else{
		var prev=str.substring(str.length-2,1);
		if (parseInt(prev)===1){ return "стимулов"; }
		else{
			num=num-10*parseInt(prev);
			if (num===1){ return "стимул"; }
			else if (num>=2 && num<=4){ return "стимула"; }
			else{ return "стимулов"; }
		}
	}
}


/*
	showing question / task description
*/
function displayDescription(idNum){
	for (var i=0;i<descCount;i++){
		if (i===idNum){
			$("#desc"+i).css("display","inline-block");
		}
		else if(idNum!=0){
			$("#desc"+i).css("display","none");
		}
	}
}

/*
	change text color in elemId
*/
function textColor(elem,col){

	$("#"+elem).css({
		"color": col
	});

}

/*
	exit function
*/
function exitHandler(){

	if (exitCounter===0){
		exitCounter++;
		displayDescription(2);
	}
	else{
		personTrainingState=1;
		commit();
		window.close();
	}

}
