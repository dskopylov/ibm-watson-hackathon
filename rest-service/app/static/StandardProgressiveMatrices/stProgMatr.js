//for mozilla 3.*:

/*
var console={
	log: function(){}
};
*/
/*
	array for stimulis loaded from archive
		i-element of the array is configured as following:
			object = {
				stName: name without extension,
				stData: data to make an insert to img-element ("data:image/png;base64,...")
			}
*/
var stimuliAllInfo=[];

/* 
	correct results for stimulis (from keys on 'psylab.info')
	first 12 for series "A", second for "B" etc.
*/
var correctResults=[4,5,1,2,6,3,6,2,1,3,4,5,2,6,1,2,1,3,5,6,4,3,4,5,8,2,3,8,7,4,5,1,7,6,1,2,3,4,3,7,8,6,5,4,1,2,5,6,7,6,8,2,1,5,1,6,3,2,4,5];

/*
	current stimuli info
		seriesLetter - current series ('A'..'E')
		seriesNumber - number of the task in series (1..12)
		taskNumber - number of the task between series
*/
var stimuliCurrentInfo={
	seriesLetter: "A",
	seriesNumber: 1,
	taskNumber: 0,
	startTime:0
}


/*
	object set the permission to press keys on the keyboard
		other keys - (1 - 49, 2 - 50, 3 - 51 .. 8 - 56)
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
		data: {personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, personTrainingState: personTrainingState, openCounter: openCounter, paramNumber: paramNumber}
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
	reading zip file from codeVar variable with base64 code of archive,
	setting stimuliAllInfo array
*/
function readZipFile(codeVar){

	var zip = new JSUnzip(window.atob(codeVar));
	//read archive
	zip.readEntries();

	// read files
	for (var i = 0; i < zip.entries.length; i++) {
		var entry = zip.entries[i];
		stimuliAllInfo[i] = imageProcess(entry);
	}

}

/*
	process each image from archive
	return object = {
				stName: name without extension,
				stData: data to make an insert to img-element ("data:image/png;base64,...")
			}
*/
function imageProcess(entry){

	var obj={};

	var dotPos = entry.fileName.indexOf('.');
	obj.stName = entry.fileName.substring(0,dotPos);

	if (entry.compressionMethod === 0) {
		// if uncompressed
		obj.stData = "data:image\/png;base64,"+window.btoa(entry.data);
    } else if (entry.compressionMethod === 8) {
		// inflate compressed image-file
		obj.stData = "data:image\/png;base64,"+window.btoa(JSInflate.inflate(entry.data));
    }

	return obj;
}

/*
	start training by clicking on the play-button
*/
function startTraining(){

	if (startCounter===0){

		startCounter=1;

		readZipFile(archiveBase64);

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
	timer
*/

function taskTimer(){

	var sTime = 0;
	var interval = 10;

	var move = setInterval(function(){

		if (sTime<600000){
			sTime+=interval;
		}
		else{

			$("#exitDescr").html("Время вышло. Тест завершен.<br> Спасибо за прохождение данного теста!");
			$("#exitDescr").css("margin-top","30%");
			sTime = 0;
			showExitPage();
			move = clearInterval(move);

		}

	}, interval);

}


/*
_______________________________________MAIN_FUNCTIONS__________________________________________                                                                                     

*/


/*
	main function
*/
function mainFunction(){

	displayDescription(0);

	keyObj.keyCheck=1;

	if (openCounter===1){
		paramNumber = Math.abs(randomize(-0.5,0.5));
	}
	else{
		if (paramNumber===1){
			paramNumber=0;
		}
		else{
			paramNumber=1;
		}
	}

	if (paramNumber===1){
		stimuliCurrentInfo.taskNumber++;
		stimuliCurrentInfo.seriesNumber++;
	}

	displayTask();

	taskTimer();

}

/*
	main Handler for keyUp-event
	keyCode:
		(1 - 49, 2 - 50, 3 - 51 .. 8 - 56)
*/
function keyboardHandler(evt){

	console.log(evt.keyCode);
	
	if (keyObj.keyCheck===1){

		var check=0;
		var endTime = new Date().getTime();

		switch (evt.keyCode){
			case 49: //1
				check=1;
				updateResult(1,checkAnswerCorrect(1),endTime-stimuliCurrentInfo.startTime);
				break;
			case 50: //2
				check=1;
				updateResult(2,checkAnswerCorrect(2),endTime-stimuliCurrentInfo.startTime);
				break;
			case 51: //3
				check=1;
				updateResult(3,checkAnswerCorrect(3),endTime-stimuliCurrentInfo.startTime);
				break;
			case 52: //4
				check=1;
				updateResult(4,checkAnswerCorrect(4),endTime-stimuliCurrentInfo.startTime);
				break;
			case 53: //5
				check=1;
				updateResult(5,checkAnswerCorrect(5),endTime-stimuliCurrentInfo.startTime);
				break;
			case 54: //6
				check=1;
				updateResult(6,checkAnswerCorrect(6),endTime-stimuliCurrentInfo.startTime);
				break;
			case 55: //7
				if (stimuliCurrentInfo.seriesLetter=="A" || stimuliCurrentInfo.seriesLetter=="B"){
					displayKeyError();
				}
				else{
					check=1;
					updateResult(7,checkAnswerCorrect(7),endTime-stimuliCurrentInfo.startTime);
				}
				break;
			case 56: //8
				if (stimuliCurrentInfo.seriesLetter=="A" || stimuliCurrentInfo.seriesLetter=="B"){
					displayKeyError();
				}
				else{
					check=1;
					updateResult(8,checkAnswerCorrect(8),endTime-stimuliCurrentInfo.startTime);
				}
				break;
			default: //other key
				displayKeyError();
				break;
		}

		if (check===1){
			check=0;
			stimuliCurrentInfo.taskNumber+=2;
			stimuliCurrentInfo.seriesNumber+=2;
			checkSeries();

			if (stimuliCurrentInfo.taskNumber>=60){
				keyObj.keyCheck=0;
				showExitPage();
			}
			else{
				displayTask();
			}

		}

	}	

}

function checkAnswerCorrect(ans){

	if (correctResults[stimuliCurrentInfo.taskNumber]===ans){
		return 1;
	}
	else{
		return 0;
	}

}

/*
	change series, when seriesNumber >12
*/
function checkSeries(){

	if (stimuliCurrentInfo.seriesNumber>12){
		if (paramNumber===1){stimuliCurrentInfo.seriesNumber=2;}
		else{stimuliCurrentInfo.seriesNumber=1;}
		
		stimuliCurrentInfo.seriesLetter = String.fromCharCode(stimuliCurrentInfo.seriesLetter.charCodeAt(0)+1);
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
	showing task

*/
function displayTask(){

	var ind = findCurrentTaskByImageName(stimuliCurrentInfo.seriesLetter+stimuliCurrentInfo.seriesNumber);

	$("#stimuliImage").attr("src",stimuliAllInfo[ind].stData);

	stimuliCurrentInfo.startTime = new Date().getTime();

}

/*
	finding current task in array by task name (because files are not consecutive (A1,A10,A11,A12,A2...))
*/
function findCurrentTaskByImageName(curTask){

	for (var i=0;i<stimuliAllInfo.length;i++){
		if (stimuliAllInfo[i].stName===curTask){
			return i;
		}
	}

}

function displayKeyError(){

	if($("#infoContainer").css("display")==="none"){
		$("#infoContainer").fadeIn();
		setTimeout(function(){
			$("#infoContainer").css("display","block");
			$("#infoContainer").fadeOut();
			setTimeout(function(){
				$("#infoContainer").css("display","none");
			},500)
		},3000);
	}

}

/*
	setting result to the pTR-variable
	format - 
		seriesLetter:seriesNumber:personAnswer:personAnswerCorrect:time;
*/
function updateResult(pAns,pAnsCorrect,time){

	personTrainingResult+=stimuliCurrentInfo.seriesLetter+":"+stimuliCurrentInfo.seriesNumber+":"+pAns+":"+pAnsCorrect+":"+time+";";
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

	scoreProcessor.scoreMaker();

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
		seriesLetter: [],
		seriesNumber: [],
		personAnswer: [],
		personAnswerCorrect: [],
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
            scoreProcessor.parsedResult.seriesLetter.push(scoreProcessor.nullCheck(forList[0]));
            scoreProcessor.parsedResult.seriesNumber.push(scoreProcessor.nullCheck(forList[1])==null ? null : parseInt(forList[1]));
            scoreProcessor.parsedResult.personAnswer.push(scoreProcessor.nullCheck(forList[2])==null ? null : parseInt(forList[2]));
            scoreProcessor.parsedResult.personAnswerCorrect.push(scoreProcessor.nullCheck(forList[3])==null ? null : parseInt(forList[3]));
            scoreProcessor.parsedResult.responseTime.push(scoreProcessor.nullCheck(forList[4])==null ? null : parseInt(forList[4]));
        }
	},

	scoreMaker: function(){

		scoreProcessor.resultsParser();

		var correctAnswersAmount;
		var allTimeSpent;

        
        var count = 0;
        for (var i=0;i<scoreProcessor.parsedResult.personAnswerCorrect.length;i++){
            if (scoreProcessor.parsedResult.personAnswerCorrect[i]==1){
                count++;
            }
        }
        correctAnswersAmount = count;

        var time = 0;
        for (var i=0;i<scoreProcessor.parsedResult.responseTime.length;i++){
            if (scoreProcessor.parsedResult.responseTime[i]!=null){
                time+=scoreProcessor.parsedResult.responseTime[i];
            }
        }
        allTimeSpent = time;


        console.log(correctAnswersAmount,allTimeSpent);

		personTrainingScore = "correctAnswersAmount:"+correctAnswersAmount+";allTimeSpent:"+allTimeSpent+";";

		commit();

	}

};



