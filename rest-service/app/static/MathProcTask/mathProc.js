//for mozilla 3.*:


/*var console={
	log: function(){}
};*/


/*
	training settings:
		blocks: numbers for blocks
		deadlines: deadlines for each task in blocks (ms)
		msForBlock: time for each block in ms,
		interval: interval for startBlock function
*/
var settings = {
	blocks: [2,3,4],
	deadlines: [1500,3000,4000],
	msForBlock: 180000,
	interval: 10
};

/*
	curTaskIndex - block counter
	taskArray - array of numbers for current task
	curCorrectResult - correct result for current task
*/ 
var taskInfo = {
	curTaskIndex: 0,
	taskArray: [],
	curCorrectResult:0,
	curTask:""
};

// timing blocks and tasks
var timeInfo = {
	timeForBlock: 0,
	timeForDeadline: 0,
	startTime: 0,
	startCheck: 1
};

/*
	object set the permission to press keys on the keyboard
		s - less-key (83)
		j - greater-key (74)
		space - space-key (32)
*/
var keyObj={
	sCheck: 0,
	jCheck: 0,
	spaceCheck: 0
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

	// !!! add personTrainingScore

	$.ajax({
		type: "",
		url: "",
		data: {personTrainingScore: personTrainingScore, personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, personTrainingState: personTrainingState, openCounter: openCounter, paramNumber: paramNumber}
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
		},350);
	}
	
}


/*
	starting block of stimuli
*/
function startBlock(){

	timeInfo.startCheck=1;

	$("#infoContainer").css("display","block");

	timeInfo.timeForBlock = 0; // max = settings.msForBlock
	timeInfo.timeForDeadline=0;

	var move = setInterval(function(){

		if (timeInfo.timeForBlock<settings.msForBlock){

			if (timeInfo.timeForDeadline<settings.deadlines[taskInfo.curTaskIndex]){

				if (timeInfo.startCheck===1){
					timeInfo.startTime = new Date().getTime();
					timeInfo.startCheck=0;
				}

				keyObj.sCheck=1;
				keyObj.jCheck=1;


				displayTask(taskInfo.taskArray);

			}
			else{

				updateResult('-','-','-');
				displayCorrect(2);
				taskMaker();
				timeInfo.timeForDeadline=0;
				timeInfo.startCheck=1;

			}

			timeInfo.timeForBlock+=settings.interval;
			timeInfo.timeForDeadline+=settings.interval;

		}
		else{

			if (keyObj.sCheck===1 && keyObj.jCheck===1){
				updateResult('-','-','-');
			}

			taskInfo.curTaskIndex++;
			keyObj.spaceCheck=1;

			// hiding all elements
			$("#infoContainer").css("display","none");
			$("#correct").css("display","none");
			$("#taskDisplay").css("display","none");

			if (taskInfo.curTaskIndex===3){
				scoreProcessor.scoreMaker();
				showExitPage();
			}
			else{
				// making and showing description
				$("#numbers").html(settings.blocks[taskInfo.curTaskIndex]);
				$("#deadline").html(settings.deadlines[taskInfo.curTaskIndex]/1000);
				displayDescription(0);
			}				

			move = clearInterval(move);

		}

	}, settings.interval);
}


/*
_______________________________________MAIN_FUNCTIONS__________________________________________                                                                                     

*/

/*
	main Handler for keyUp-event
	keyCode:
		Space=32
		S=83 // (<5) key
		J=74 // (>5) key
*/
function keyboardHandler(evt){
	
	switch (evt.keyCode){
		case 32:
			if (keyObj.spaceCheck===1){
				spaceKeyHandler();
			}
			break;
		case 83:
			if (keyObj.sCheck===1){
				sKeyHandler();
			}
			break;
		case 74:
			if (keyObj.jCheck===1){
				jKeyHandler();
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

	taskMaker();

	startBlock();

}

/*
	s-press event handler
	(<5)
*/
function sKeyHandler(){

	var endTime = new Date().getTime();
	var time = endTime - timeInfo.startTime;

	if (taskInfo.curCorrectResult<5){
		updateResult("S",1,time);
		displayCorrect(1);
	}
	else{
		updateResult("S",0,time);
		displayCorrect(0);
	}

	taskMaker();
	
	timeInfo.startCheck=1;
	timeInfo.timeForDeadline=0;
	keyObj.sCheck=0;
	keyObj.jCheck=0;

}

/*
	j-press event handler
	(>5)
*/
function jKeyHandler(){

	var endTime = new Date().getTime();
	var time = endTime - timeInfo.startTime;

	if (taskInfo.curCorrectResult>5){
		updateResult("J",1,time);
		displayCorrect(1);
	}
	else{
		updateResult("J",0,time);
		displayCorrect(0);
	}

	taskMaker();
	
	timeInfo.startCheck=1;
	timeInfo.timeForDeadline=0;
	keyObj.sCheck=0;
	keyObj.jCheck=0;

}

/*
	main function
*/
function mainFunction(){

	settings.blocks = shuffle(settings.blocks);
	setDeadlines();

	// making description
	$("#numbers").html(settings.blocks[taskInfo.curTaskIndex]);
	$("#deadline").html(settings.deadlines[taskInfo.curTaskIndex]/1000);
	displayDescription(0);

	keyObj.spaceCheck=1;

	/*var n = settings.blocks[taskInfo.curTaskIndex];
	var array = new Array(n);*/

	/*settings.blocks[0] = 3;

	var j=0;

	while (j<10000){
		taskMaker();
		console.log(j);
		j++;
	}*/

	


	/*var st = new Date().getTime();
	var obj = taskMaker(array);

	//console.log(new Date().getTime() - st);
	console.log(obj.numbers);
	console.log(obj.correct);

	displayTask(obj.numbers);*/
}

/*
	making array of one task
*/
function taskMaker(){

	taskInfo.taskArray = new Array(settings.blocks[taskInfo.curTaskIndex]);
	var array = new Array(settings.blocks[taskInfo.curTaskIndex]);

	sum = randomize(0.9,9);
	while (sum===5){
		sum = randomize(0.9,9);
	}

	array[0] = randomize(3,9);
	while(array[0]===sum){
		array[0] = randomize(3,9);
	}

	if (array.length===2){
		array[1]=sum-array[0];
	}
	else{
		setOtherArray(array);		
		while (arraySum(array)!=sum){
			setOtherArray(array);
		}
	}

	taskInfo.taskArray = new Array();
	taskInfo.taskArray = array;
	taskInfo.curCorrectResult = sum;

}

/*
	counting sum of an array
*/
function arraySum(array){

	var s=0;

	for (var i=0; i<array.length;i++){
		s+=array[i];
	}

	return s;

}

/*
	setting array except for already set [0]
*/
function setOtherArray(array,sum){

	var val;
	for (var i=1;i<array.length;i++){
		val = randomize(-9,9);
		// check that: value!=0, (-value) is not in the array, |array[1]|<array[0]
		while (val===0 || checkArray(array,(-1)*val) || (i==1 && Math.abs(val)>=array[0])){
			val = randomize(-9,9);	
		}
		array[i] = val;
	}
}

/*
	true if value was found in the array
*/
function checkArray(array,val){

	var check=false;
	for (var i=0;i<array.length;i++){
		if (array[i]===val){
			check=true;
			break;
		}
	}
	return check;

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
	ans - person's answer (0,1,'-')
	new format - 
		numbersForBlock:sumForExpr:personAnswerCorrect:button:time;
*/
function updateResult(button,ans,time){

	personTrainingResult+=settings.blocks[taskInfo.curTaskIndex]+":"+taskInfo.curCorrectResult+":"+ans+":"+button+":"+time+";";
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

/*
	showing current task
*/
function displayTask(array){

	taskInfo.curTask = ""+array[0];

	for (var i=1;i<array.length;i++){
		if (array[i]<0){
			taskInfo.curTask+=""+array[i];//$("#taskDisplay").html($("#taskDisplay").html()+array[i]);
		}
		else{
			taskInfo.curTask+="+"+array[i];//$("#taskDisplay").html($("#taskDisplay").html()+"+"+array[i]);
		}
	}

	$("#taskDisplay").html(taskInfo.curTask);
	$("#taskDisplay").css("display","block");

}

/*
	showing correctness of the result
		num=0 - incorrect
		num=1 - correct
		num=2 - end of time
*/
function displayCorrect(num){
	var str="";
	var color="";
	switch(num){
		case 0: str="Неверно"; color="#b42a29"; break;
		case 1: str="Верно"; color="#096114"; break;
		case 2: str="Время истекло"; color="#000000"; break;
	}

	textColor("correct",color);
	$("#correct").html(str);
	$("#correct").css("display","block");
	setTimeout(function(){
		$("#correct").css("display","none");
	},300);
	
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
	shuffling array
*/
function shuffle(array){

	var temp=[];
	var result=[];

	for (var i=0;i<array.length;i++){
		temp[i]=array[i];
	}

	for (var i=0;i<3;i++){
		n=randomize(-0.9,temp.length-1.5);
		result[i]=temp[n];
		temp.splice(n,1);
	}

	return result;

}

/*
	setting deadlines according to blocks
*/
function setDeadlines(){

	for (var i=0;i<settings.blocks.length;i++){
		switch(settings.blocks[i]){
			case 2: settings.deadlines[i] = 1500; break;
			case 3: settings.deadlines[i] = 3000; break;
			case 4: settings.deadlines[i] = 4000; break;
		}
	}

}

function showExitPage(){
	// EXIT PAGE

	keyObj.sCheck=0;
	keyObj.jCheck=0;
	keyObj.spaceCheck=0;

	$("#mainPage").css("display","none");
	$("#exitPage").css("display","block");
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
		numberAmount: [],
		mathExpression: [],
		correctExpressionResult: [],
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
		str = str.replace(new RegExp(" ","g"),"+");
		var temp = str.replace(new RegExp(";","g"),"");
		var counter = str.length - temp.length;
        for (var i=0;i<counter;i++){
            var pos = str.indexOf(';');
            var current = str.substring(0, pos);
            str = str.substring(pos+1, str.length);
            var forList = current.split(":");
			if (forList.length<6){
				scoreProcessor.parsedResult.numberAmount.push(scoreProcessor.nullCheck(forList[0])==null ? null : parseInt(forList[0]));
				//scoreProcessor.parsedResult.mathExpression.push(scoreProcessor.nullCheck(forList[1]));
				scoreProcessor.parsedResult.correctExpressionResult.push(scoreProcessor.nullCheck(forList[1])==null ? null : parseInt(forList[1]));
				scoreProcessor.parsedResult.personAnswerCorrect.push(scoreProcessor.nullCheck(forList[2])==null ? null : parseInt(forList[2]));
				scoreProcessor.parsedResult.personAnswerButton.push(scoreProcessor.nullCheck(forList[3]));
				scoreProcessor.parsedResult.responseTime.push(scoreProcessor.nullCheck(forList[4])==null ? null : parseInt(forList[4]));
			}
			else{
				scoreProcessor.parsedResult.numberAmount.push(scoreProcessor.nullCheck(forList[0])==null ? null : parseInt(forList[0]));
				scoreProcessor.parsedResult.mathExpression.push(scoreProcessor.nullCheck(forList[1]));
				scoreProcessor.parsedResult.correctExpressionResult.push(scoreProcessor.nullCheck(forList[2])==null ? null : parseInt(forList[2]));
				scoreProcessor.parsedResult.personAnswerCorrect.push(scoreProcessor.nullCheck(forList[3])==null ? null : parseInt(forList[3]));
				scoreProcessor.parsedResult.personAnswerButton.push(scoreProcessor.nullCheck(forList[4]));
				scoreProcessor.parsedResult.responseTime.push(scoreProcessor.nullCheck(forList[5])==null ? null : parseInt(forList[5]));
			}
            
        }
	},

	scoreMaker: function(){

		scoreProcessor.resultsParser();

		//_____
		var twoNumPercentage;
		var threeNumPercentage;
		var fourNumPercentage;

			var twoNumCorrectCount = 0;
	        var twoNumAllCount = 0;
	        var threeNumCorrectCount = 0;
	        var threeNumAllCount = 0;
	        var fourNumCorrectCount = 0;
	        var fourNumAllCount = 0;

	    var allCorrectPercentage;
	    var allMissedPercentage;
	    var averageTime;
	    //_____

		//_____blockCorrectPercentage_____
		for (var i=0;i<scoreProcessor.parsedResult.personAnswerCorrect.length;i++){
            switch(scoreProcessor.parsedResult.numberAmount[i]){
                case 2:
                    if (scoreProcessor.parsedResult.personAnswerCorrect[i]!=null && scoreProcessor.parsedResult.personAnswerCorrect[i]==1){
                        twoNumCorrectCount++;
                    }
                    twoNumAllCount++;
                    break;
                case 3:
                    if (scoreProcessor.parsedResult.personAnswerCorrect[i]!=null && scoreProcessor.parsedResult.personAnswerCorrect[i]==1){
                        threeNumCorrectCount++;
                    }
                    threeNumAllCount++;
                    break;
                case 4:
                    if (scoreProcessor.parsedResult.personAnswerCorrect[i]!=null && scoreProcessor.parsedResult.personAnswerCorrect[i]==1){
                        fourNumCorrectCount++;
                    }
                    fourNumAllCount++;
                    break;
            }
        }

        twoNumPercentage = 100*twoNumCorrectCount/twoNumAllCount;
        threeNumPercentage = 100*threeNumCorrectCount/threeNumAllCount;
        fourNumPercentage = 100*fourNumCorrectCount/fourNumAllCount;

        //_____allCorrectPercentage_____
        var correctCount = 0;
        var allCount = 0;

        for (var i=0;i<scoreProcessor.parsedResult.personAnswerCorrect.length;i++){
            if (scoreProcessor.parsedResult.personAnswerCorrect[i]!=null && scoreProcessor.parsedResult.personAnswerCorrect[i]==1){
                correctCount++;
            }
            allCount++;
        }

        allCorrectPercentage = 100*correctCount/allCount;

        //_____allMissedPercentage_____
        var missedCount = 0;

        for (var i=0;i<scoreProcessor.parsedResult.personAnswerCorrect.length;i++){
            if (scoreProcessor.parsedResult.personAnswerCorrect[i]==null){
                missedCount++;
            }
        }

        allMissedPercentage = 100*missedCount/allCount;

        //_____averageTime_____
        var time = 0;
        var count = 0;

        for (var i=0;i<scoreProcessor.parsedResult.responseTime.length;i++){
            if (scoreProcessor.parsedResult.responseTime[i]!=null){
                time+=scoreProcessor.parsedResult.responseTime[i];
                count++;
            }
        }

        averageTime = time/count;


		personTrainingScore = "twoNumPercentage:"+twoNumPercentage+";threeNumPercentage:"+threeNumPercentage+";fourNumPercentage:"+
			fourNumPercentage+";allCorrectPercentage:"+allCorrectPercentage+";allMissedPercentage:"+allMissedPercentage
			+";averageTime:"+averageTime+";";

		commit();

	}

};


