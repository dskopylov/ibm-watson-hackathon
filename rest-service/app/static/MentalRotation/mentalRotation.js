//for mozilla 3.*:


/*var console={
	log: function(){}
};*/

/*
	settings for the test
	sameDiff -  same or different figures to display 0-same, 1-diff (reflect)
	polyNum - 0,1 - index of the polygons to display
*/
var settings = {
	sameDiff: [],
	polyNum: []
}

/*
	information about current task
	curTask - number of passed tasks
	startTime - startTime for time in result
*/
var taskInfo={
	curTask: 0,
	startTime:0
}

var polygons=[];

/*
	object set the permission to press keys on the keyboard
		S - 83
		D - 68
*/
var keyObj={
	keyCheck:0
}

// description number
var descCount = 1;

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
		data: {personTrainingScore:personTrainingScore,personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, personTrainingState: personTrainingState, openCounter: openCounter, paramNumber: paramNumber}
	})
	.success(function(a) {})
	.fail(function() {});

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

	settings.sameDiff = new Array(64);
	fillArray(settings.sameDiff);
	settings.polyNum = new Array(64);
	fillArray(settings.polyNum);

	polygons[0] = {
		polX: [140,300,300,170,170,140],
		polY: [210,210,230,230,290,290]
	};

	polygons[1] = {
		polX: [160, 180, 180,200,200,180,180,160],
		polY: [180,180,270,270,340,340,290,290]
	};

	displayDescription(0);

	displayTask();

	keyObj.keyCheck=1;
	
}

/*
	main Handler for keyUp-event
	keyCode:
		S - 83
		D - 68
*/
function keyboardHandler(evt){

	if (keyObj.keyCheck===1){

		switch (evt.keyCode){
			case 83: sKeyHandler(); break;
			case 68: dKeyHandler(); break;
		}

	}

}

/*
	s-press event handler (same objects)
*/
function sKeyHandler(){

	var endTime = new Date().getTime();
	var time = endTime - taskInfo.startTime;

	if (settings.sameDiff[taskInfo.curTask]===0){
		updateResult("S",1,time);
	}
	else{
		updateResult("S",0,time);
	}

	taskInfo.curTask++;
	displayTask();
	
}

/*
	d-press event handler (different objects)
*/
function dKeyHandler(){

	var endTime = new Date().getTime();
	var time = endTime - taskInfo.startTime;

	if (settings.sameDiff[taskInfo.curTask]===1){
		updateResult("D",1,time);
	}
	else{
		updateResult("D",0,time);
	}

	taskInfo.curTask++;
	displayTask();

}

/*
	drawing a polygon
		obj - obj with arrays of points
*/
function drawPolygon(obj, angle){

	var canvas = document.getElementById("drawPanel");
	var cContext = canvas.getContext("2d");

	cContext.fillStyle = '#294a84';

	cContext.save();

    cContext.translate(midArray(obj.polX),midArray(obj.polY));
    cContext.rotate( angle*Math.PI/180 ); 
    cContext.translate(0-midArray(obj.polX),0-midArray(obj.polY));

    cContext.beginPath();
	cContext.moveTo(obj.polX[0], obj.polY[0]);

	for (var i=1;i<obj.polX.length;i++){
		cContext.lineTo(obj.polX[i], obj.polY[i]);
	}

	cContext.closePath();
	cContext.fill();

    cContext.restore();

}

/*
	making mirror-obj
*/
function reflectPolygon(obj){

	var mirrorObj={
		polX:[],
		polY:[]
	};

	var cWidth = document.getElementById("drawPanel").width;

	var midW = midArray(obj.polX);

	for (var i=0;i<obj.polX.length;i++){
		if (obj.polX[i]>midW){
			mirrorObj.polX[i] =  obj.polX[i] - 2*(obj.polX[i]-midW);
		}
		else{
			mirrorObj.polX[i] =  obj.polX[i] + 2*(midW-obj.polX[i]);
		}
		
	}

	mirrorObj.polY = obj.polY;

	return mirrorObj;
}

/*
	shifting polygon copy to the right
*/
function shiftPolygon(obj){

	var shiftedObj={};

	shiftedObj.polX = [];
	shiftedObj.polY = obj.polY;

	var canvas = document.getElementById('drawPanel');

	for (var i=0;i<obj.polX.length;i++){
		shiftedObj.polX[i] = obj.polX[i]+(canvas.width/2-60);
	}

	return shiftedObj;

}

/*
	for finding the medium object axis 
*/
function midArray(array){

	var max=array[0];
	var min=array[0];

	for (var i=0;i<array.length;i++){
		if (array[i]<min){min=array[i];}
		if (array[i]>max){max=array[i];}
	}

	return min + (max-min)/2;

}

/*
	fill array with 0 and 1 amount of length/2 each
*/
function fillArray(array){

	var taskCount=[0,0];

	for (var i=0;i<array.length;i++){

		temptask=randomize(-0.5,0.5);
		taskCount[temptask]++;

		while (taskCount[temptask]>=array.length/2+1){ 

			taskCount[temptask]--;
			temptask=randomize(-0.5,0.5);
			taskCount[temptask]++;

		}

		array[i] = Math.abs(temptask);

	}

}

/*
	showing task
*/
function displayTask(){

	// clearing panel
	var canvas = document.getElementById("drawPanel");
	var cContext = canvas.getContext("2d");
		cContext.clearRect(0, 0, canvas.width, canvas.height);

	if (taskInfo.curTask===settings.sameDiff.length){
		keyObj.keyCheck=0;
		scoreProcessor.scoreMaker();
		showExitPage();
	}
	else{
		
		for (var i=0;i<2;i++){

			var angle = randomize(0,360);
			var obj = polygons[settings.polyNum[taskInfo.curTask]];

			if (i===1){
				obj = shiftPolygon(obj);
				if (settings.sameDiff[taskInfo.curTask]===1){
					obj = reflectPolygon(obj);
				}
			} 

			drawPolygon(obj,angle);

		}

		taskInfo.startTime = new Date().getTime();

	}		

}



/*
	randomizing number in the interval [min,max]
*/
function randomize(min,max){
	num = Math.ceil((Math.random()*(max-min))+min);
	return num;
}

/*
	setting result to the pTR-variable
	format - 
		taskNumber:polygonCode:personKeyPressed:personAnswerCorrect:time;
		taskNumber - 1..64
		polygonCode - 1,2
*/
function updateResult(pKey,pAnsCorrect,time){

	personTrainingResult+=(taskInfo.curTask+1)+":"+(settings.polyNum[taskInfo.curTask]+1)+":"+pKey+":"+pAnsCorrect+":"+time+";";
	commit();

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


function showExitPage(){
	// EXIT PAGE

	keyObj.keyCheck=0;

	$("#mainPage").fadeOut();
	setTimeout(function(){
		$("#mainPage").css("display","none");
		$("#exitPage").fadeIn();
	},350);

}


//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//________________________________________________Score__________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________
//_______________________________________________________________________________________________________

var scoreProcessor = {

	parsedResult: {
		taskNumber: [],
		polygonNumber: [],
		personAnswerCorrect: [],
		personAnswerButton: [],
		responseTime: []
	},

	nullCheck: function(str){
		if (str==="-"){
            return null;
        }
        else{
            return str;
        }
	},

	resultsParser: function(){
		var str = personTrainingResult;
		var temp = str.replace(new RegExp(";","g"),"");
		var counter = str.length - temp.length;
        for (var i=0;i<counter;i++){
            var pos = str.indexOf(';');
            var current = str.substring(0, pos);
            str = str.substring(pos+1, str.length);
            var forList = current.split(":");
            scoreProcessor.parsedResult.taskNumber.push(scoreProcessor.nullCheck(forList[0])==null ? null : parseInt(forList[0]));
            scoreProcessor.parsedResult.polygonNumber.push(scoreProcessor.nullCheck(forList[1])==null ? null : parseInt(forList[1]));
            scoreProcessor.parsedResult.personAnswerButton.push(scoreProcessor.nullCheck(forList[2]));
            scoreProcessor.parsedResult.personAnswerCorrect.push(scoreProcessor.nullCheck(forList[3])==null ? null : parseInt(forList[3]));
            scoreProcessor.parsedResult.responseTime.push(scoreProcessor.nullCheck(forList[4])==null ? null : parseInt(forList[4]));
        }
	},

	scoreMaker: function(){

		scoreProcessor.resultsParser();
		
		var correctAnswersPercentage;
		var averageTime;

        var allCount = scoreProcessor.parsedResult.personAnswerCorrect.length;
        var correctCount = 0;
        for (var i=0;i<allCount;i++){
            if (scoreProcessor.parsedResult.personAnswerCorrect[i]==1){correctCount++;}
        }
        correctAnswersPercentage = 100*(correctCount/allCount);



        var amount = scoreProcessor.parsedResult.responseTime.length;
        var timeCount = 0;
        for (var i=0;i<scoreProcessor.parsedResult.responseTime.length;i++){
            timeCount = scoreProcessor.parsedResult.responseTime[i]==null ? timeCount : (timeCount + scoreProcessor.parsedResult.responseTime[i]);
        }
        averageTime = timeCount/amount;

        console.log(correctAnswersPercentage,averageTime);

		personTrainingScore = "correctAnswersPercentage:"+correctAnswersPercentage+";averageTime:"+averageTime+";";

		commit();

	}

};


