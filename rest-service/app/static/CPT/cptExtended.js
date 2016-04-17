//for mozilla 3.*:


/*var console={
	log: function(){}
};*/


/*
	training settings:
		letters: all letters except for 'X'
		allAmount: number of letters to display at all
		blockAmount: number of letters to display in one block (letters.length+2)
		trainingLetters: array for the training block
		blockTimeArray: possible intervals between letters within one blockAmount-symbol block
		interval: interval for startBlock-function
*/
var settings = {
	letters: ["A","B","C","D","E","F","G","H","I","J","L","M","O","P","Q","R","S","U"],
	allAmount: 360,
	blockAmount: 20,
	trainingLetters: ["A","D","F","X","Z","X"],
	blockTimeArray: [1000,2000,4000],
	timeForLetter: 250,
	interval: 10
};

/*
	allCounter: counter for the displayed letters (0 .. settings.allAmount)
	blockCounter: counter for block,
	taskType: training or main (0,1)
	correctForTraining: for checking amount of correct answers // 0-key not pressed, 1-key pressed
	blockTimeIndex: index for the time array
	answerCheck: if the answer had been set or not (0,1)
	startTime: begin to count react time
*/ 
var taskInfo = {
	allCounter: 0,
	blockCounter: 0,
	taskType: 0,
	correctForTraining: [],
	blockTimeIndex:0,
	blockLetters:[],
	blockTime:[],
	answerCheck: 0,
	startTime: 0
};


/*
	object set the permission to press keys on the keyboard
		space-key (32)
		0 - prohibited
		1 - start training or main block
		2 - register data
*/
var keyObj={
	keyCheck: 0
}

// description number
var descCount = 4;

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
		data: {personTrainingLevel: personTrainingLevel, personTrainingResult: personTrainingResult, personTrainingState: personTrainingState, personTrainingScore: personTrainingScore, openCounter: openCounter, paramNumber: paramNumber}
	})
	.success(function(a) {})
	.fail(function() {});

	console.log("pTL = ",personTrainingLevel);
	console.log("pTR = ",personTrainingResult); 
	console.log("pTR = ",personTrainingScore); 
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
		
		makeSliders();
		
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
	making letters array for block
*/
function setLettersArray(){

	var temp=[];

	var pos1;
	var pos2; // X-positions

	for (var i=0;i<settings.letters.length;i++){
		temp[i]=settings.letters[i];
	}

	pos1=Math.abs(randomize(-0.5,19));
	pos2=Math.abs(randomize(-0.5,19));

	if (pos1==pos2){
		while(pos1==pos2){
			pos2=Math.abs(randomize(-0.5,19));
		}
	}

	var let = shuffle(settings.letters);
console.log(let);
	var j=0;

	for (var i=0;i<settings.blockAmount;i++){

		if (i==pos1 || i==pos2){
			taskInfo.blockLetters[i]="X";
		}
		else{
			taskInfo.blockLetters[i] = let[j];
			j++;
		}
	}

}


/*
	starting block of stimuli
*/
function startBlock(){

	$("#taskCont").css("display","block");

	changeBgColor("#000");

	timeForBlock = 0; // time for current block

	keyObj.keyCheck=2;

	if (taskInfo.taskType===0){

		var move = setInterval(function(){

			if (taskInfo.blockCounter<settings.trainingLetters.length){

				if (taskInfo.startTime===0){
					taskInfo.answerCheck=0;
					taskInfo.startTime = new Date().getTime();
				}

				if (timeForBlock<settings.timeForLetter){
					$("#taskDisplay").html(settings.trainingLetters[taskInfo.blockCounter]);
				}
				else if (timeForBlock>=250 && timeForBlock<1250){
					$("#taskDisplay").html("");
				}
				else{

					if (taskInfo.answerCheck===0){
						taskInfo.correctForTraining.push(0);
					}

					taskInfo.startTime=0;

					timeForBlock=0;

					taskInfo.blockCounter++;
				}

			}
			else{
				taskInfo.blockCounter=0;
				trainingCorrect();
				move = clearInterval(move);
			}

			timeForBlock+=settings.interval;

		}, settings.interval);

	}
	else{

		var move = setInterval(function(){

			// change letters
			if (taskInfo.allCounter<settings.allAmount){

				// check blockCounter
				if (taskInfo.blockCounter>=settings.blockAmount){
					taskInfo.blockCounter=0;
					taskInfo.blockLetters=[];
					setLettersArray();
					taskInfo.blockTimeIndex++;

					//check blockTimeIndex
					if (taskInfo.blockTimeIndex>=taskInfo.blockTime.length){
						taskInfo.blockTimeIndex=0;
						taskInfo.blockTime=[];
						taskInfo.blockTime = shuffle(settings.blockTimeArray);
					}

					personTrainingResult+="["+(taskInfo.blockTime[taskInfo.blockTimeIndex]/1000)+"]";
				}

				if (taskInfo.startTime===0){
					taskInfo.answerCheck=0;
					taskInfo.startTime = new Date().getTime();
				}

				if (timeForBlock<settings.timeForLetter){
					$("#taskDisplay").html(taskInfo.blockLetters[taskInfo.blockCounter]);
				}
				else if (timeForBlock>=250 && timeForBlock<(taskInfo.blockTime[taskInfo.blockTimeIndex]+250)){
					$("#taskDisplay").html("");
				}
				else{

					if (taskInfo.answerCheck===0){
						updateResult(taskInfo.blockLetters[taskInfo.blockCounter],"-",(taskInfo.blockTime[taskInfo.blockTimeIndex]));
					}

					taskInfo.startTime=0;
					timeForBlock=0;
					taskInfo.blockCounter++;
					taskInfo.allCounter++;
				}

			}
			else{

				taskInfo.blockCounter=0;
				keyObj.keyCheck=0;
				changeBgColor("#fff");
				showExitPage();
				scoreMaker();

				move = clearInterval(move);

			}

			timeForBlock+=settings.interval;

		}, settings.interval);

	}

}


/*
_______________________________________MAIN_FUNCTIONS__________________________________________                                                                                     

*/

/*
	main Handler for keyUp-event
	keyCode:
		Space=32
*/
function keyboardHandler(evt){
	
	switch (evt.keyCode){
		case 32:
			if (keyObj.keyCheck===1 || keyObj.keyCheck===2){
				spaceKeyHandler();
			}
			break;		
	}

}

/*
	space-press event handler
*/
function spaceKeyHandler(){

	if (keyObj.keyCheck===1){
		displayDescription(-1);
		keyObj.keyCheck=2;
		startBlock();
	}
	else if (keyObj.keyCheck===2){
		var endTime = new Date().getTime();
		var time = endTime-taskInfo.startTime;
		//(taskInfo.blockTime[taskInfo.blockTimeIndex]/1000)
		if (taskInfo.taskType===1 && taskInfo.answerCheck===0){
			updateResult(taskInfo.blockLetters[taskInfo.blockCounter],time,taskInfo.blockTime[taskInfo.blockTimeIndex]);
		}
		else{
			taskInfo.correctForTraining.push(1);
		}

		taskInfo.answerCheck=1;

	}

}

/*
	main function
*/
function mainFunction(){

	setLettersArray();

	// making description
	displayDescription(0);

	keyObj.keyCheck=1;
	
}

function trainingCorrect(){

	var check = 0;

	for (var i=0;i<settings.trainingLetters.length;i++){
		if ((taskInfo.correctForTraining[i]===1 && settings.trainingLetters[i]==="X") || 
			(taskInfo.correctForTraining[i]===0 && settings.trainingLetters[i]!="X")){
			check=1;
			break;
		}
	}
	
	taskInfo.correctForTraining=[];

	if (check==1){
		//display descr for another training block
		taskInfo.taskType=0;
		changeBgColor("#fff");
		displayDescription(1);
		keyObj.keyCheck=1;
	}
	else{
		//display descr for main block
		taskInfo.taskType=1;
		changeBgColor("#fff");
		displayDescription(2);
		taskInfo.blockLetters=[];
		setLettersArray();
		taskInfo.blockTime=shuffle(settings.blockTimeArray);
		taskInfo.blockTimeIndex=0;
		taskInfo.startTime=0;

		personTrainingResult+="["+(taskInfo.blockTime[0]/1000)+"]";

		keyObj.keyCheck=1;
	}

}

//________________________________________________________________________________________________

/*
	function for scoring parameters from persons result and formatting score-variable
*/
function scoreMaker(){

	var result=personTrainingResult;
		
	var cpt,cpt1,cpt2,cpt3;
	
	cpt = makeObj(result, cpt);
		
	hitCalc(cpt);
	omissionsCalc(cpt);
	commissionsCalc(cpt);
	hitRTCalc(cpt);
	hitRTSECalc(cpt);
	perseverationCalc(cpt);
	detectabilityCalc(cpt);
	responseStyleCalc(cpt);
	
	var arrLength=Math.floor(settings.allAmount/3);
	
	var let1 = new Array(arrLength);
	var r1 = new Array(arrLength);
	var blockt1 = new Array(arrLength);
	var let2 = new Array(arrLength);
	var r2 = new Array(arrLength);
	var blockt2 = new Array(arrLength);
	var let3 = new Array(arrLength);
	var r3 = new Array(arrLength);
	var blockt3 = new Array(arrLength);
	var cnt=0;

	for (var a=0;a<cpt.maslength;a++){
		if (a>=0 && a<arrLength){
      if(cpt.letters[a]==("4")||cpt.letters[a]==("5")){
        cpt1=cptBlockMaker(cpt1,let1,r1,blockt1,cnt);
        cnt=0;
        break;
      }
			let1[cnt] = cpt.letters[a];
			r1[cnt] = cpt.react[a];
			blockt1[cnt] = cpt.blocktime[a];
			cnt++;
			if (cnt==arrLength){
				cpt1=cptBlockMaker(cpt1,let1,r1,blockt1,cnt);
				cnt=0;
			}
		}
		else if (a>=arrLength && a<(2*arrLength)){
			if (cpt.letters[a]==("4")||cpt.letters[a]==("5")){
				cpt2=cptBlockMaker(cpt2,let2,r2,blockt2,cnt);
        cnt=0;
				break;
			}
			let2[cnt] = cpt.letters[a];
			r2[cnt] = cpt.react[a];
			blockt2[cnt] = cpt.blocktime[a];
			cnt++;
			if (cnt==arrLength){
				cpt2=cptBlockMaker(cpt2,let2,r2,blockt2,cnt);
				cnt=0;
			}
		}
		else if (a>=(2*arrLength)){
      if (cpt.letters[a]==("4")||cpt.letters[a]==("5")){
        cpt3=cptBlockMaker(cpt3,let3,r3,blockt3,cnt);
        cnt=0;
        break;
      }
			let3[cnt] = cpt.letters[a];
			r3[cnt] = cpt.react[a];
			blockt3[cnt] = cpt.blocktime[a];
			cnt++;
			if (a==(cpt.maslength-3)){
				cpt3=cptBlockMaker(cpt3,let3,r3,blockt3,cnt);
				break;
			}
		}
	}
	
	if (cpt1!=null && cpt1!=undefined){
		hitCalc(cpt1);
		omissionsCalc(cpt1);
		commissionsCalc(cpt1);
		hitRTCalc(cpt1);
		hitRTSECalc(cpt1);
		perseverationCalc(cpt1);
		detectabilityCalc(cpt1);
		responseStyleCalc(cpt1);
	}

	if (cpt2!=null && cpt2!=undefined){	
		hitCalc(cpt2);
		omissionsCalc(cpt2);
		commissionsCalc(cpt2);
		hitRTCalc(cpt2);
		hitRTSECalc(cpt2);
		perseverationCalc(cpt2);
		detectabilityCalc(cpt2);
		responseStyleCalc(cpt2);
	}

	if (cpt3!=null && cpt3!=undefined){
		hitCalc(cpt3);
		omissionsCalc(cpt3);
		commissionsCalc(cpt3);
		hitRTCalc(cpt3);
		hitRTSECalc(cpt3);
		perseverationCalc(cpt3);
		detectabilityCalc(cpt3);
		responseStyleCalc(cpt3);
	}
	
	
	personTrainingScore="[all]hit:"+cpt.hit+";omissions:"+cpt.omissions+";commissions:"+
		cpt.commissions+";hitRT:"+cpt.hitRT+";hitRTSE:"+cpt.hitRTSE+";perseveration:"+
		cpt.perseveration+";detectability:"+cpt.detectability+";responseStyle:"+cpt.responseStyle+";";
	
	if (cpt1!=null && cpt1!=undefined){
		personTrainingScore+="[block1]hit:"+cpt1.hit+";omissions:"+cpt1.omissions+";commissions:"+
			cpt1.commissions+";hitRT:"+cpt1.hitRT+";hitRTSE:"+cpt1.hitRTSE+";perseveration:"+
			cpt1.perseveration+";detectability:"+cpt1.detectability+";responseStyle:"+cpt1.responseStyle+";";
	}
	else{
		personTrainingScore+="[block1]hit:"+undefined+";omissions:"+undefined+";commissions:"+
			undefined+";hitRT:"+undefined+";hitRTSE:"+undefined+";perseveration:"+
			undefined+";detectability:"+undefined+";responseStyle:"+undefined+";";
	}
	
	if (cpt2!=null && cpt2!=undefined){
		personTrainingScore+="[block2]hit:"+cpt2.hit+";omissions:"+cpt2.omissions+";commissions:"+
			cpt2.commissions+";hitRT:"+cpt2.hitRT+";hitRTSE:"+cpt2.hitRTSE+";perseveration:"+
			cpt2.perseveration+";detectability:"+cpt2.detectability+";responseStyle:"+cpt2.responseStyle+";";
	}
	else{
		personTrainingScore+="[block2]hit:"+undefined+";omissions:"+undefined+";commissions:"+
			undefined+";hitRT:"+undefined+";hitRTSE:"+undefined+";perseveration:"+
			undefined+";detectability:"+undefined+";responseStyle:"+undefined+";";
	}

	if (cpt3!=null && cpt3!=undefined){
		personTrainingScore+="[block3]hit:"+cpt3.hit+";omissions:"+cpt3.omissions+";commissions:"+
			cpt3.commissions+";hitRT:"+cpt3.hitRT+";hitRTSE:"+cpt3.hitRTSE+";perseveration:"+
			cpt3.perseveration+";detectability:"+cpt3.detectability+";responseStyle:"+cpt3.responseStyle+";";
	}
	else{
		personTrainingScore+="[block3]hit:"+undefined+";omissions:"+undefined+";commissions:"+
			undefined+";hitRT:"+undefined+";hitRTSE:"+undefined+";perseveration:"+
			undefined+";detectability:"+undefined+";responseStyle:"+undefined+";";
	}	
	
	
	commit();	
}

/*
	function for making object with necessary arrays for block
*/
function cptBlockMaker(obj,let,react,blockt,arrlength){

	obj = {
		letters: let,
		react: react,
		blocktime: blockt,
		maslength: arrlength
	};
	
	return obj;

}

//________________________________________________________________________________________________



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
		letter:time:blockTime;
*/
function updateResult(letter,time,blockt){

	personTrainingResult+=letter+":"+time+
		":"+(blockt+250)+";";

	
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
	changing background color
*/
function changeBgColor(color){
	$(".border").css({
		"background": color
	});
}

/*
	showing current task

function displayTask(){

	

}*/


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

	for (var i=0;i<array.length;i++){
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

/*
	making sliders
*/
function makeSliders(){
	$( "#sl1" ).slider({
		animate: true,
		value: 0,
		min: -100,
		max: 100,
		step: 1,
	});

	$( "#sl2" ).slider({
		animate: true,
		value: 0,
		min: -100,
		max: 100,
		step: 1,
	});
}

function showExitPage(){
	// EXIT PAGE
	keyObj.keyCheck=0;

	$("#mainPage").css("display","none");
	$("#exitPage").css("display","block");
}

