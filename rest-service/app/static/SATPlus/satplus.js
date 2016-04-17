//for mozilla 3.*:
/*var console={
	log: function(){}
};*/

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
};

var SatPlus = {

	results: [], // saving results

	//___fishes arrays___
	// Fields each: objId,coordX,coordY,angle,direction
	preds: {
		preds: [],
		currentLength: 0
	},
	// Fields each: objId,coordX,coordY,angle,direction
	preys: {
		preys: [],
		currentLength: 0
	},
	//___________________

	//object for person answers on the first task
	firstAnswers: {
		answers: []
	},
	//answers on 2 and 3 task, setCheck-setting(1) currentCorrect array or not(0)
	correctAnswers: {
		correctCounter: 0,
		currentCorrect: [],
		currentShark: [],//for 3 task
		currentShow: 0,
		setCheck: 1
	},

	correctFirstCheck: 3.5, // mm for each object for the first task
	movingTime: 3000, // time for moving objects (in ms)

	// interval (speed) between moving objects
	objSpeed:  {
		startSpeed: 70,
		currentSpeed: 70
	},

	/*
		information about tasks
			blockType: 1-trainingBlock, 2-mixedBlock
			curTask: current task
			taskCount: task counter
			startTime: beginning the task-answer
			mixedBlock[]: array of tasks for one mixed part (length: mixedOne)
			mixedCount: mixed task counter for one mixed part
	*/
	taskInfo: {
		blockType: 1,
		curTask: 1,
		taskCount: 0,
		startTime: 0,
		mixedBlock: [],
		mixedCount: 0,
		mixedOne: 15,
		percentMax: 75,
		percentMin: 40
	},

	/*
		information about clicks
		allowClick: 0-no click provided now, 1-click allowed
		clickCount: number of clicks, done within one task
	*/
	clickInfo: {
		allowClick: 1,
		clickCount: 0
	},

	wayLong: 3, // distance (way length) for counting new coord

	// panel position coords
	panelX: undefined,
	panelY: undefined,

	// number of instructions
	descCount: 10,

	// number of repeats for one task in training block
	trainingBlockCount: 2,

	/*
		number of fishLevel:
			3-(2+2,2+3,2+4) = 6 fishes (fishCount)
			4-(2+2,2+3,2+4,2+5) = 7 fishes (fishCount)
	*/
	fishInfo: {
		fishLevel: 4,
		fishCount: 7
	},

	// exit counter
	exitCounter: 0,

	// start counter for preventing n-records
	startCounter: 0,

	// stones
	stoneInfo: {
		stoneUrl: "images/seastones_small.png",
		stoneContainer: "stoneContainer",
		xSquares: 0,
		ySquares: 0
	},

	// end of fields

	/*
	_____________________________________SAVE_START_FUNCTIONS____________________________________

	*/

	/*
		start training by clicking on the play-button
	*/
	startTraining: function (){
	    var self = this;

		if (self.startCounter===0){
			self.startCounter=1;

			$("#audioStart").trigger("pause");
			$("#firstPage").fadeOut();

			setTimeout(function(){
				$("#firstPage").css("display","none");
				$("#mainPage").fadeIn();
				openCounter++;
				commit();
				self.mainFunction();
			},350);
		}
	},

	/*
		muting/unmuting audio on page (pageName)
	*/
	audioMute: function(pageName){

		switch(pageName){
			case "startPage":
				$("#audioStart").prop("muted",!$("#audioStart").prop("muted"));
				if($("#audioStart").prop("muted")===false){
					$("#soundStartPage").attr("src","images/soundOn.png");
				}
				else{
					$("#soundStartPage").attr("src","images/soundOff.png");
				}
				break;
			case "mainPage":
				$("#audioMain").prop("muted",!$("#audioMain").prop("muted"));
				if($("#audioMain").prop("muted")===false){
					$("#soundMainPage").attr("src","images/soundOn.png");
				}
				else{
					$("#soundMainPage").attr("src","images/soundOff.png");
				}
				break;
		}
	},

	/*
		setting object arrays,
		check - var for not reseting coords
	*/
	setObjects: function(check, predNum, preyNum){

		var self = this;

		if (check===0){
			var a;
			for (var i=1;i<=predNum;i++){

				a=self.changeAngle(self.randomize(180,360),"pred");
				var objsId = "pred"+i;
				self.preds.preds.push({
					objId: objsId,
					coordX: self.randomize(53,parseInt($("#mainPanel").css("width"))-73)+$("#"+objsId).width()/2,
					coordY: self.randomize(53,parseInt($("#mainPanel").css("height"))-73)+$("#"+objsId).height()/2,
					angle: a,
					direction: "left",
					targetPrey: 0
				});
			}
			for (var i=1;i<=preyNum;i++){

				a=self.changeAngle(self.randomize(180,360),"prey");
				var objsId = "prey"+i;
				self.preys.preys.push({
					objId: objsId,
					coordX: self.randomize(53,parseInt($("#mainPanel").css("width"))-73)+$("#"+objsId).width()/2,
					coordY: self.randomize(53,parseInt($("#mainPanel").css("height"))-73)+$("#"+objsId).height()/2,
					angle: a,
					direction: "left"
				});
			}
			self.preds.currentLength=predNum;
			self.preys.currentLength=preyNum;
		}
		else{
			self.preds.currentLength=predNum;
			self.preys.currentLength=preyNum;
		}

		// set proper targets
		self.setTargetPrey();
	},


	/*
	_______________________________________MOVE_FUNCTIONS__________________________________________

	*/


	/*
		setting coordinates
	*/
	setCoords: function(obj) {
		$("#"+obj.objId).css({
			"left": obj.coordX+"px",
			"top": obj.coordY+"px"
		});
	},

	/*
		changing object's position
	*/
	changePosition: function(obj){
		var self = this;
		var alpha;
		var checkAngle=obj.angle;

		if (checkAngle%90==0){
			switch(checkAngle){
				case 0: obj.coordY-=self.wayLong; break;
				case 90: obj.coordX+=self.wayLong; break;
				case 180: obj.coordY+=self.wayLong; break;
				case 270: obj.coordX-=self.wayLong; break;
			}
		}
		else{
			if (checkAngle>0 && checkAngle<90){
				obj.coordX+=Math.sin(obj.angle*Math.PI/180)*self.wayLong;
				obj.coordY-=Math.cos(obj.angle*Math.PI/180)*self.wayLong;
			}
			else if (checkAngle>90 && checkAngle<180){
				alpha=obj.angle-90;
				obj.coordX+=Math.cos(alpha*Math.PI/180)*self.wayLong;
				obj.coordY+=Math.sin(alpha*Math.PI/180)*self.wayLong;
			}
			else if (checkAngle>180 && checkAngle<270){
				alpha=obj.angle-180;
				obj.coordX-=Math.sin(alpha*Math.PI/180)*self.wayLong;
				obj.coordY+=Math.cos(alpha*Math.PI/180)*self.wayLong;
			}
			else if (checkAngle>270 && checkAngle<360){
				alpha=obj.angle-270;
				obj.coordX-=Math.cos(alpha*Math.PI/180)*self.wayLong;
				obj.coordY-=Math.sin(alpha*Math.PI/180)*self.wayLong;
			}
		}


		if (obj.objId!=""){
			self.rotationBrowser(obj);
	    	self.setCoords(obj);
		}


	},

	/*
		checking panel side
		px,py - end of the panel
		obj - object
	*/
	checkSide: function(px,py,obj){

		var self = this;
		var xn=/*self.panelX+*/50;
		var yn=/*self.panelY+*/50;

		var r;

		var x=obj.coordX;
		var y=obj.coordY;

		if (x<=xn){
			r = self.randomize(0,180);
		}
		else if (x>=px){
			r = self.randomize(180,270);
		}
		else if (y<=yn){
			r = self.randomize(90,270);
			obj.coordY = /*self.panelY+*/52;
			self.setCoords(obj);
		}
		else{
			r = self.randomize(270,450);
			if (r>=360){ r-=360; }
		}

		r = self.changeAngle(r,obj.objId);

		return r;

	},

	/*
		changing angle for 0-20, 160-180, 180-200, 340-360
	*/
	changeAngle: function(ang, id){
		var self = this;
		var zone;

		if (id.substring(3,4)==="y"){
			zone=50;
		}
		else{
			zone=0;
		}

		while(ang>=360){ ang-=360; }

		if (ang>=0 && ang<=0+zone){
			ang = self.randomize(0+zone,90);
		}
		else if (ang>=180-zone && ang<=180){
			ang = self.randomize(90,180-zone);
		}
		else if (ang>=180 && ang<=180+zone){
			ang = self.randomize(180+zone,270);
		}
		else if (ang>=360-zone && ang<=360){
			ang = self.randomize(270,360-zone);
		}

		return ang;

	},

	/*
		checking reaching panel borders
	*/
	panelCheck: function(obj){
		var self = this;
		var px = /*self.panelX+*/parseInt($("#mainPanel").css("width"))-70;
		var py = /*self.panelY+*/parseInt($("#mainPanel").css("height"))-70;

		var x=obj.coordX;
		var y=obj.coordY;
		if((x<=(/*self.panelX+*/50))||(x>=px)||(y<=(/*self.panelY+*/50))||(y>=py)){
			rand=self.checkSide(px,py,obj);
			obj.angle=rand;
		}

	},

	/*
		setting angle(direction) for predators to chase their targets
	*/
	angleToChase: function(obj){
		var self = this;
		var sCP = {}; // second coord prey
			sCP.objId="";
			sCP.coordX=self.preys.preys[obj.targetPrey].coordX;
			sCP.coordY=self.preys.preys[obj.targetPrey].coordY;

		// count coords for 3-next position of the target prey
		for (var i=0;i<10;i++){
			self.changePosition(sCP);
		}

		var alpha;
		var s=self.calculateDistance(obj.coordX,obj.coordY,sCP.coordX,sCP.coordY);

		// calculating angle
		if (obj.coordX===sCP.coordX){
			if (obj.coordY>=sCP.coordY){ alpha=0; }
			else{ alpha=180; }
		}
		else if (obj.coordY===sCP.coordY){
			if (obj.coordX>=sCP.coordX){ alpha=270; }
			else{ alpha=90; }
		}
		else{
			if(obj.coordX<sCP.coordX){
				if (obj.coordY<sCP.coordY){
					sinA=Math.abs(obj.coordY-sCP.coordY)/s;
					alpha=90+Math.asin(sinA)*180/Math.PI;
				}
				else{
					cosA=Math.abs(obj.coordY-sCP.coordY)/s;
					alpha=Math.acos(cosA)*180/Math.PI;
				}
			}
			else if(obj.coordX>sCP.coordX){
				if (obj.coordY>sCP.coordY){
					sinA=Math.abs(obj.coordY-sCP.coordY)/s;
					alpha=270+Math.asin(sinA)*180/Math.PI;
				}
				else{
					cosA=Math.abs(obj.coordY-sCP.coordY)/s;
					alpha=180+Math.acos(cosA)*180/Math.PI;
				}
			}

		/*console.log(sCP, s, Math.abs(obj.coordY-sCP.coordY)/s,alpha);*/
		}

		//console.log(Math.abs(obj.coordY-sCP.coordY),s,alpha);

		obj.angle=self.changeAngle(alpha,obj.objId);

	},

	/*
		checking eating preys by preds
	*/
	killPrey: function(){
		var self = this;

		for (var i=0;i<self.preds.currentLength;i++){

			for (var j=0;j<self.preys.currentLength;j++){

				var r=self.calculateDistance(self.preds.preds[i].coordX/*+$("#"+self.preds.preds[i].objId).width()/2*/,self.preds.preds[i].coordY/*+$("#"+self.preds.preds[i].objId).height()/2*/,
					self.preys.preys[j].coordX/*+$("#"+self.preys.preys[j].objId).width()/2*/,self.preys.preys[j].coordY/*+$("#"+self.preys.preys[j].objId).height()/2*/);

				if (r<=30){

					// effects: audio+bubbles
					$("#audioMain").trigger("play");
					$("#bubbles"+j).css({
						"left":self.preys.preys[j].coordX,
						"top":self.preys.preys[j].coordY-2,
						"display":"block"
					});
					$("#bubbles"+j).fadeOut();

					//_____

					self.preys.preys[j].coordX=self.randomize(53,parseInt($("#mainPanel").css("width"))-73);
					self.preys.preys[j].coordY=self.randomize(53,parseInt($("#mainPanel").css("height"))-73);
					self.setCoords(self.preys.preys[j]);

					if (self.preds.preds[i].targetPrey===j){
						self.setTargetPrey();
					}

				}
			}
		}

	},

	/*
		setting target prey for predators
	*/
	setTargetPrey: function(){
		var self = this;

		for (var i=0;i<self.preds.currentLength;i++){

			self.preds.preds[i].targetPrey=Math.abs(self.randomize(-0.5,self.preys.currentLength-1.5));

			while (i!=0 && self.preds.preds[i].targetPrey===self.preds.preds[i-1].targetPrey){
				self.preds.preds[i].targetPrey=Math.abs(self.randomize(-0.5,self.preys.currentLength-1.5));
			}
		}

	},

	/*
		changing rotation for preys during their moving
	*/
	changePreyRotation: function(rTime){
		var self = this;
		if (rTime>1000){
			for (var i=0;i<self.preys.currentLength;i++){
				var ang = self.randomize(0,359);
				self.preys.preys[i].angle = self.changeAngle(ang,self.preys.preys[i].objId);
			}
			return 0;
		}
		else{ return rTime; }

	},

	repulseObjGroup: function(type){
		var self = this;

		var pixel=3;

		if (type==="pred"){
			for (var i=1;i<self.preds.currentLength;i++){
				var prevX = self.preds.preds[i-1].coordX;//+$("#"+self.preds.preds[i-1].objId).width()/2;
				var prevY = self.preds.preds[i-1].coordY;//+$("#"+self.preds.preds[i-1].objId).height()/2;
				var curX = self.preds.preds[i].coordX;//+$("#"+self.preds.preds[i].objId).width()/2;
				var curY = self.preds.preds[i].coordY;//+$("#"+self.preds.preds[i].objId).height()/2;

				if (self.calculateDistance(prevX,prevY,curX,curY)<20){
					if (curY<=prevY){
						if (curX<=prevX){
							self.preds.preds[i].coordX-=pixel;
							self.preds.preds[i].coordY-=pixel;
						}
						else{
							self.preds.preds[i].coordX+=pixel;
							self.preds.preds[i].coordY-=pixel;
						}
					}
					else{
						if (curX<=prevX){
							self.preds.preds[i].coordX-=pixel;
							self.preds.preds[i].coordY+=pixel;
						}
						else{
							self.preds.preds[i].coordX+=pixel;
							self.preds.preds[i].coordY+=pixel;
						}
					}
				}

			}
		}
		else if(type==="prey"){

			for (var i=1;i<self.preds.currentLength;i++){
				var prevX = self.preys.preys[i-1].coordX;//+$("#"+self.preys.preys[i-1].objId).width()/2;
				var prevY = self.preys.preys[i-1].coordY;//+$("#"+self.preys.preys[i-1].objId).height()/2;
				var curX = self.preys.preys[i].coordX;//+$("#"+self.preys.preys[i].objId).width()/2;
				var curY = self.preys.preys[i].coordY;//+$("#"+self.preys.preys[i].objId).height()/2;

				if (self.calculateDistance(prevX,prevY,curX,curY)<20){
					if (curY<=prevY){
						if (curX<=prevX){
							self.preys.preys[i].coordX-=pixel;
							self.preys.preys[i].coordY-=pixel;
						}
						else{
							self.preys.preys[i].coordX+=pixel;
							self.preys.preys[i].coordY-=pixel;
						}
					}
					else{
						if (curX<=prevX){
							self.preys.preys[i].coordX-=pixel;
							self.preys.preys[i].coordY+=pixel;
						}
						else{
							self.preys.preys[i].coordX+=pixel;
							self.preys.preys[i].coordY+=pixel;
						}
					}
				}

			}

		}

	},

	/*
		moving objects
	*/
	moveObj: function (){
		var self = this;

		//___
			// set level
			if (self.taskInfo.blockType===2){
				$("#level").html(personTrainingLevel);
				$("#levelDisp").css("display","block");
			}
			else{
				$("#levelDisp").css("display","none");
			}
			//hide
			$("#endBlock").css("display","none");
			self.showObjects("marks","hide");
			self.showObjects("correct","hide");
		//___

		var rTime = 0; // check for self.changePreyRotation (every 1000ms)

		var mTime = 0;
		var move = setInterval(function(){

			if (mTime<self.movingTime){
				self.clickInfo.allowClick = 0;

				self.repulseObjGroup("pred");
				self.repulseObjGroup("prey");

				for (var i=0;i<self.preys.currentLength;i++){
					rTime=self.changePreyRotation(rTime);
					self.changePosition(self.preys.preys[i]);
					self.panelCheck(self.preys.preys[i]);

					if(i<self.preds.currentLength){
						self.angleToChase(self.preds.preds[i]);
						self.changePosition(self.preds.preds[i]);
						self.panelCheck(self.preds.preds[i]);
					}

				}
				self.killPrey();

				mTime+=self.objSpeed.currentSpeed;
				rTime+=self.objSpeed.currentSpeed;
			}
			else{

				self.clickInfo.allowClick = 1;
				self.showObjects("allFishes","hide");

				self.taskInfo.startTime = new Date().getTime();

				// showing task
				switch(self.taskInfo.curTask){
					case 1:
						self.displayDescription(2);
						break;
					case 2:
						self.clickInfo.allowClick=0;
						self.clickInfo.clickCount++;
						self.secondTaskHandler();
						break;
					case 3:
						self.clickInfo.allowClick=0;
						self.clickInfo.clickCount++;
						self.thirdTaskHandler();
						break;
				}

				move = clearInterval(move);
			}

		}, self.objSpeed.currentSpeed);
	},


	/*
	_______________________________________MAIN_FUNCTIONS__________________________________________

	*/


	/*
		________LEVEL_________

		self.fishInfo={
			fishLevel: 4, //3,
			fishCount: 7 //6
		};

		checking person level and changing parameters of speed,
		background saturation for mainPanel and number of fishes

	*/
	levelHandler: function(){
		var self = this;

		var tempLevel = personTrainingLevel;

		var checkForStones=0;

		var bgCurrent = 0;
		var speed = self.objSpeed.startSpeed+5;

		// go to current level (increase speed and background values)
		for (var i=1;i<=personTrainingLevel;i++){

			// increase speed and background with checking odd/even of i%2 for differents part of levels
			/*if (i<17){*/
				if (i<6 || (i>=11 && i<=16)){
					if (i%2===0){
						speed-=15;
						if (speed<15){
							speed = 15;
						}
					}
					else{
						bgCurrent+=0.3;
						if (bgCurrent>=1){
							bgCurrent = 1;
							if (personTrainingLevel>25){
								checkForStones++;
							}
						}
					}
				}
				else{
					if (i%2!=0){
						speed-=15;
						if (speed<15){
							speed = 15;
						}
					}
					else{
						bgCurrent+=0.3;
						if (bgCurrent>=1){
							bgCurrent = 1;
							if (personTrainingLevel>25){
								checkForStones++;
							}
						}
					}
				}

			// chop speed and background
			if (i===1 || i===6 || i===11 || i===16){
				bgCurrent=0;
				speed = self.objSpeed.startSpeed+5;
			}

		}

		self.setStones(checkForStones);

		$("#bgPicture").css("opacity",bgCurrent); // set background
		self.objSpeed.currentSpeed=speed; // set speed

		// set fishes
		if (personTrainingLevel<6){
			self.setObjects(1,2,2);
		}
		else if (personTrainingLevel>=6 && personTrainingLevel<11){
			self.setObjects(1,2,3);
		}
		else if (personTrainingLevel>=11 && personTrainingLevel<16){
			self.setObjects(1,2,4);
		}
		else{
			self.setObjects(1,2,5);
		}

		console.log("sp = ",self.objSpeed.currentSpeed, "bg = ",bgCurrent);


	},

	/*
		setting sea stones on the panel
	*/
	setStones: function(checkForStones){
		var self = this;

		if (checkForStones!=0){

			checkForStones*=2; // 2 stones for each level-block

			var forX = ($("#mainPanel").width()-50)/checkForStones;
			var forY = ($("#mainPanel").height()-50)/checkForStones;

			var sqX = new Array(checkForStones);
			var sqY = new Array(checkForStones);

			for (var i=0;i<sqX.length;i++){
				var xRand = self.randomize(0.9,sqX.length);
				var yRand = self.randomize(0.9,sqY.length);

				while (self.checkArray(sqX,xRand) || self.checkArray(sqY,yRand)){
					if (self.checkArray(sqX,xRand)){
						xRand = self.randomize(0.9,sqX.length);
					}
					if (self.checkArray(sqY,yRand)){
						yRand = self.randomize(0.9,sqY.length);
					}
				}

				sqX[i]=xRand;
				sqY[i]=yRand;

				// set stone-image

				var img = document.createElement("img");
					img.className = "stone";
					img.src = self.stoneInfo.stoneUrl;
					// set coords for stone
					img.style.left = self.randomize(forX*(sqX[i]-1)-5,forX*sqX[i]-5)+"px";
					img.style.top = self.randomize(forY*(sqY[i]-1),forY*sqY[i])+"px";

				document.getElementById(self.stoneInfo.stoneContainer).appendChild(img);

			}

			console.log(sqX,sqY);

		}

	},

	/*
		checking obj in the array
	*/
	checkArray: function (arr, val){
		var self = this;

		var found = false;

		for (var i=0;i<arr.length;i++){
			if (arr[i]===val){
				found=true;
				break;
			}
		}

		return found;

	},

	/*
		setting level to minimum value of speed and background on the next day
	*/
	levelStartDecrease: function (){
		var self = this;

		if (personTrainingLevel<6){
			personTrainingLevel=1;
		}
		else if (personTrainingLevel>=6 && personTrainingLevel<11){
			personTrainingLevel=6;
		}
		else if (personTrainingLevel>=11 && personTrainingLevel<16){
			personTrainingLevel=11;
		}
		else{
			personTrainingLevel=16;
		}

		commit();

		//console.log(forLevel," | level = ",personTrainingLevel);

	},

	mainFunction: function (){
		var self = this;

		self.displayDescription(1);

		console.log(personTrainingLevel);

		self.showObjects("correct","hide");

		if  (personTrainingLevel===0){
			personTrainingLevel=1;
		}

		if (paramNumber===1){
			self.levelStartDecrease();
			paramNumber=0;
			commit();
		}


		self.setObjects(0,2,self.fishInfo.fishCount-2);

		self.levelHandler();

		// set level
		if (self.taskInfo.blockType===2){
			$("#level").html(personTrainingLevel);
			$("#levelDisp").css("display","block");
		}
		else{
			$("#levelDisp").css("display","none");
		}

		console.log(self.preds.currentLength,self.preys.currentLength);

		for (var i=0;i<self.preys.currentLength;i++){
			self.setCoords(self.preys.preys[i]);
			if (i<self.preds.currentLength){
				self.setCoords(self.preds.preds[i]);
			}
		}

	},

	/*
		main Handler for panel clicks
	*/
	clickHandler: function (evt){
		var self = this;
		//console.log("self.clickHandler");

		self.panelX=$("#mainPanel").offset().left;
		self.panelY=$("#mainPanel").offset().top;

		if (self.clickInfo.allowClick===1){
			self.clickInfo.clickCount++;
			switch (self.taskInfo.curTask){
				case 1: self.firstTaskHandler(evt); break;
				case 2: self.secondTaskHandler(); break;
				case 3: self.thirdTaskHandler(); break;
			}
		}

	},

	/*
		Handler for the first task
	*/
	firstTaskHandler: function (evt){
		var self = this;

		if (self.clickInfo.clickCount===1){
			self.showObjects("marks","hide");
			self.showObjects("allFishes","show");
			self.displayDescription(-1);
			self.moveObj();
			self.firstAnswers.answers=[];
		}
		else if (self.clickInfo.clickCount-1<=(self.preds.currentLength+self.preys.currentLength)){
			self.setMark(self.clickInfo.clickCount-1,evt);

			if (self.clickInfo.clickCount>(self.preds.currentLength+self.preys.currentLength)){
				self.firstTaskCalculator();
				self.taskInfo.taskCount++;
			}
		}

		if (self.clickInfo.clickCount>(self.preds.currentLength+self.preys.currentLength)){
			if (self.taskInfo.blockType===1){
				if (self.taskInfo.taskCount<self.trainingBlockCount){
					self.clickInfo.clickCount=0;
				}
				else if(self.clickInfo.clickCount>=(self.preds.currentLength+self.preys.currentLength+2)){
					self.taskInfo.curTask=2;
					self.showObjects("marks","hide");
					self.displayDescription(3);
					self.clickInfo.clickCount=0;
				}
			}
			else{
				//______________CHECK_________________
				self.clickInfo.clickCount=0;
				self.mixedBlockHandler();
			}
		}
	},

	/*
		Handler for the second task
	*/
	secondTaskHandler:function (){
		var self = this;
		if (self.clickInfo.clickCount===1){
			self.showObjects("allFishes","show");
			self.displayDescription(-1);
			self.moveObj();
		}
		else if(self.clickInfo.clickCount===2){
			self.setTextResult(2,-1);
			self.displayDescription(4);
			self.displayDescription(0);
			self.showObjects("tdAll","show");
			self.setCircle(self.correctAnswers.currentShow);
		}
		else if(self.clickInfo.clickCount===3){
			self.displayDescription(0);
			self.showObjects("tdAll","show");
			self.setCircle(self.correctAnswers.currentShow);
			self.taskInfo.taskCount++;
		}
		else{
			if (self.taskInfo.blockType===1){
				if (self.taskInfo.taskCount<2*self.trainingBlockCount){
					//___hide buttons, circle, show fishes and description
					self.showObjects("tdAll","hide");
					self.showObjects("secondCircle","hide");
					self.showObjects("allFishes","show");
					self.displayDescription(-1);
					$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
					self.displayDescription(0);
					//___
					self.clickInfo.allowClick=1;
					self.clickInfo.clickCount=0;
				}
				else{
					self.displayDescription(5);
					//___hide buttons, circle, show fishes and description
					self.showObjects("tdAll","hide");
					self.showObjects("secondCircle","hide");
					self.showObjects("allFishes","show");
					self.displayDescription(0);
					//___
					self.clickInfo.allowClick=1;
					self.taskInfo.curTask=3;

					self.clickInfo.clickCount=0;
				}
			}
			else{
				//______________CHECK_________________
				//___
					self.showObjects("tdAll","hide");
					self.showObjects("secondCircle","hide");
					self.showObjects("allFishes","show");
					self.displayDescription(-1);
					$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
					self.displayDescription(0);
				//___
				self.clickInfo.allowClick=1;
				self.clickInfo.clickCount=0;
				self.mixedBlockHandler();
			}
		}
	},

	/*
		Handler for the third task
	*/
	thirdTaskHandler: function (){
		var self = this;
		if (self.clickInfo.clickCount===1){
			self.showObjects("allFishes","show");
			self.displayDescription(-1);
			self.moveObj();
		}
		else if(self.clickInfo.clickCount===2){
			self.setTextResult(2,-1);
			self.displayDescription(6);
			self.displayDescription(0);
			self.showObjects("tdPreys","show");
			self.setShark(self.correctAnswers.currentShow);
		}
		else if(self.clickInfo.clickCount===3){
			self.displayDescription(0);
			self.showObjects("tdPreys","show");
			self.setShark(self.correctAnswers.currentShow);
			self.taskInfo.taskCount++;
		}
		else{
			if (self.taskInfo.blockType===1){
				if (self.taskInfo.taskCount<3*self.trainingBlockCount){
					//___hide buttons, shark, show all fishes and description
					self.showObjects("tdPreys","hide");
					self.showObjects("allFishes","show");
					self.displayDescription(-1);
					$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
					self.displayDescription(0);
					//___
					self.clickInfo.allowClick=1;
					self.clickInfo.clickCount=0;

				}
				else{
					//___hide buttons, shark, show all fishes
					self.showObjects("tdPreys","hide");
					self.showObjects("allFishes","show");
					//___
					self.clickInfo.allowClick=1;
					self.clickInfo.clickCount=0;

					//set mixed array
					if(self.taskInfo.taskCount===3*self.trainingBlockCount){
						self.displayDescription(7);
						$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
						self.displayDescription(0);
						self.movingTime = 5000;
						self.mixedArrayMaker(0,0,0);
						self.mixedBlockHandler();
					}
					else{
						self.displayDescription(-1);
						$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
						self.displayDescription(0);
					}

				}
			}
			else{
				//______________CHECK_________________
				self.clickInfo.allowClick=1;
				self.clickInfo.clickCount=0;
				//___
					self.showObjects("tdPreys","hide");
					self.showObjects("allFishes","show");
					self.displayDescription(-1);
					$("#desc0").html($("#desc0").html()+" Щелкните для продолжения.");
					self.displayDescription(0);
				//___
				self.mixedBlockHandler();
			}
		}
	},

	/*
		Handler for the mixed block
	*/
	mixedBlockHandler: function (){
		var self = this;
		//console.log(self.taskInfo.mixedBlock);
		self.taskInfo.blockType=2;

		if(self.taskInfo.mixedCount===self.taskInfo.mixedOne){

			self.displayDescription(9);
			self.accuracyCheck();
			self.clickInfo.allowClick=1;
			self.clickInfo.clickCount=0;
			self.taskInfo.mixedCount=0;
			self.mixedArrayMaker(0,0,0);

		}

		self.taskInfo.curTask=self.taskInfo.mixedBlock[self.taskInfo.mixedCount];
		self.taskInfo.mixedCount++;

	},

	/*
	___________________________________CALCULATE_&_RESULTS_&_DISPLAY_________________________________

	*/

	/*
		making mixed block array based on t1,t2,t3-how many repeats there were before function-call
	*/
	mixedArrayMaker: function (t1, t2, t3){
		var self = this;

		var taskCount=['',t1,t2,t3];
		var temptask=1;

		var mixedBlockCount=t1+t2+t3;

		for (var i=mixedBlockCount;i<self.taskInfo.mixedOne;i++){

			temptask=self.randomize(0.1,3);
			taskCount[temptask]++;

			while (taskCount[temptask]>=(parseInt(self.taskInfo.mixedOne/3)+1)){

				taskCount[temptask]--;
				temptask=self.randomize(0.1,3);
				taskCount[temptask]++;

			}

			self.taskInfo.mixedBlock[i]=temptask;
		}
	},

	// /*
	// 	combine preys and preds
	// */
	// combineObjects: function (){
	// 	var self = this;
	// 	var objArray = [];
	// 	for (var i=0;i<self.preys.currentLength;i++){
	// 		var obj={
	// 			coordX:0,
	// 			coordY:0
	// 		}
	// 		if (i<self.preds.currentLength){
	// 			obj.coordX=self.preds.preds[i].coordX;/*+$("#"+self.preds.preds[i].objId).width()/2;*/
	// 			obj.coordY=self.preds.preds[i].coordY;/*+$("#"+self.preds.preds[i].objId).height()/2;*/
	// 			objArray.push(obj);
	// 		}
	// 		var obj={
	// 			coordX:0,
	// 			coordY:0
	// 		}
	// 		obj.coordX=self.preys.preys[i].coordX;/*+$("#"+self.preys.preys[i].objId).width()/2;*/
	// 		obj.coordY=self.preys.preys[i].coordY;/*+$("#"+self.preys.preys[i].objId).height()/2;*/
	// 		objArray.push(obj);
	// 	}
	// 	return objArray;
	// },
	//
	// /*
	// 	remove element by column-index (ind) in every row of the array
	// */
	// removeElemFromArray: function (array,ind){
	// 	for (var i=0;i<array.length;i++){
	// 		array[i].splice(ind,1);
	// 	}
	// },
	//
	// /*
	// 	fing minimum value in the array
	// */
	// arrayMin: function (array){
	// 	var obj={
	// 		min:0,
	// 		ind:0
	// 	}
	// 	obj.min=array[0];
	// 	obj.ind=0;
	// 	for (var i=0;i<array.length;i++){
	// 		if(array[i]<obj.min){
	// 			obj.min=array[i];
	// 			obj.ind=i;
	// 		}
	// 	}
	// 	return obj;
	// },
	//
	// arrayCopy: function (array){
	// 	var arr = [];
	// 	for (var i=0;i<array.length;i++){
	// 		var a=[];
	// 		for (var j=0;j<array[i].length;j++){
	// 			a.push(array[i][j]);
	// 		}
	// 		arr.push(a);
	// 	}
	// 	return arr;
	// },

	/*
		calculating result for the first task
	*/
	firstTaskCalculator: function (){
		var self = this;

		var endTime = new Date().getTime();
		var sumTime = endTime-self.taskInfo.startTime;

		var forResult=[];
		var num;

		for (var i=0;i<(self.preds.currentLength+self.preys.currentLength);i++){

			var obj={};

			if (i<self.preds.currentLength){
				obj.coordX=self.preds.preds[i].coordX+$("#"+self.preds.preds[i].objId).width()/2;
				obj.coordY=self.preds.preds[i].coordY+$("#"+self.preds.preds[i].objId).height()/2;
			}
			else{
				obj.coordX=self.preys.preys[i-self.preds.currentLength].coordX+$("#"+self.preys.preys[i-self.preds.currentLength].objId).width()/2;
				obj.coordY=self.preys.preys[i-self.preds.currentLength].coordY+$("#"+self.preys.preys[i-self.preds.currentLength].objId).height()/2;
			}

			var razn = self.calculateDistance(obj.coordX,obj.coordY,
				self.firstAnswers.answers[i].coordX,self.firstAnswers.answers[i].coordY);
			num=i;
			for (var j=0;j<self.firstAnswers.answers.length;j++){
				var r=self.calculateDistance(obj.coordX,obj.coordY,
					self.firstAnswers.answers[j].coordX,self.firstAnswers.answers[j].coordY);
				if (r<razn) {
					razn=r;
					num=j;
				}
			}

			forResult.push(razn);
			self.firstAnswers.answers[num].coordX = -1000;
			self.firstAnswers.answers[num].coordY = -1000;

		}

		var sum=0;

		for (i=0;i<forResult.length;i++){
			sum=sum+forResult[i];
		}

		var res=0;
			res=sum/(forResult.length);
			res=(res*0.26).toFixed(3);
			res=Math.round(res);


		self.updateResult(1,res,sumTime);
		self.setTextResult(1,res);
		self.displayDescription(-1);
		self.displayDescription(0);
		self.showObjects("allFishes","show");

	},

	/*
		calculating result for the second task
	*/
	secondTaskCalculator: function (){
		var self = this;
		var endTime = new Date().getTime();
		var sumTime = endTime - self.taskInfo.startTime;

		self.updateResult(2,self.correctAnswers.correctCounter,sumTime);
			self.correctAnswers.correctCounter=0;
			self.correctAnswers.currentShow=0;
			self.correctAnswers.currentCorrect=[];
			self.correctAnswers.setCheck=1;

		self.clickInfo.clickCount++;
	},

	/*
		calculating result for the third task
	*/
	thirdTaskCalculator: function (){
	    var self = this;
		var endTime = new Date().getTime();
		var sumTime = endTime - self.taskInfo.startTime;

		self.updateResult(3,self.correctAnswers.correctCounter,sumTime);
			self.correctAnswers.correctCounter=0;
			self.correctAnswers.currentShow=0;
			self.correctAnswers.currentShark=[];
			self.correctAnswers.setCheck=1;

		self.clickInfo.clickCount++;
	},

	/*
		checking second task
	*/
	secondCheck: function (ans){
		var self = this;
		if (ans===self.correctAnswers.currentCorrect[self.correctAnswers.currentShow]){
			self.correctAnswers.correctCounter++;
			self.correctAnswers.currentShow++;
			self.clickInfo.clickCount++;
			self.setTextResult(self.taskInfo.curTask,1);
		}
		else{
			self.setTextResult(self.taskInfo.curTask,0);
			self.clickInfo.clickCount++;
			self.correctAnswers.currentShow++;
		}
	},

	/*
		checking third task
	*/
	thirdCheck: function (ans){
		var self = this;

		if (ans===self.preys.preys[self.preds.preds[self.correctAnswers.currentShark[self.correctAnswers.currentShow]].targetPrey].objId){
			self.correctAnswers.correctCounter++;
			self.correctAnswers.currentShow++;
			self.clickInfo.clickCount++;
			self.setTextResult(self.taskInfo.curTask,1);
		}
		else{
			self.setTextResult(self.taskInfo.curTask,0);
			self.clickInfo.clickCount++;
			self.correctAnswers.currentShow++;
		}
	},

	/*
		answering question
	*/
	setAnswer: function (ans){
		var self = this;

		switch (self.taskInfo.curTask){
			case 2:
				self.secondCheck(ans);
				break;
			case 3:
				self.thirdCheck(ans);
				break;
		}

		self.displayDescription(0);

		if ((self.taskInfo.curTask===2 && self.correctAnswers.currentShow>=self.correctAnswers.currentCorrect.length) ||
			(self.taskInfo.curTask===3 && self.correctAnswers.currentShow>=self.correctAnswers.currentShark.length)){
			switch (self.taskInfo.curTask){
				case 2:
					self.secondTaskCalculator();
					break;
				case 3:
					self.thirdTaskCalculator();
					break;
			}
		}

		switch (self.taskInfo.curTask){
			case 2:
				self.secondTaskHandler();
				break;
			case 3:
				self.thirdTaskHandler();
				break;
		}

	},

	/*
		randomizing number in the interval [min,max]
	*/
	randomize: function (min,max){
		var num = Math.ceil((Math.random()*(max-min))+min);
		return num;
	},

	/*
		setting result to the pTR-variable and results[]
		level:task:result:time;
	*/
	updateResult: function (task,res,time){
		var self = this;

		if (time<=600000){
			personTrainingResult+=personTrainingLevel+":"+task+":"+res+":"+time+";";
			var obj={
				task: task,
				result: res,
				time: time
			}
			self.results.push(obj);
		}
		else{
			personTrainingResult+=personTrainingLevel+":"+task+":"+res+":inf;";
			var obj={
				task: task,
				result: res,
				time: "inf"
			}
			self.results.push(obj);
		}

		//console.log(self.results,personTrainingResult);

		commit();
	},

	/*
		checking accuracy for mixed block
	*/
	accuracyCheck: function (){
		var self = this;

		var j=self.taskInfo.taskCount-self.taskInfo.mixedOne;
		var countCorrect=0;
		var levelChk=0; // check for text display: 0-same, 1-increased, 2-decreased

		for (var i=j;i<j+self.taskInfo.mixedOne;i++){
			if (self.results[i].task===1){
				if(self.results[i].result<=self.correctFirstCheck*self.fishInfo.fishCount){
					countCorrect++;
				}
			}
			else{
				countCorrect+=self.results[i].result;
			}
		}

		//console.log(countCorrect,5*self.taskInfo.mixedOne/3);

		var percent=100*countCorrect/(5*self.taskInfo.mixedOne/3)

		if (percent>=self.taskInfo.percentMax){
			personTrainingLevel++;
			levelChk=1;
			paramNumber=0;
		}
		else if(percent<self.taskInfo.percentMin){
			if (personTrainingLevel!=1){
				personTrainingLevel--;
				levelChk=2;
			}
			else{
				levelChk=0;
			}
		}

		$("#percCorrect").html(percent.toFixed(2)+"%");
		self.showObjects("correct","show");

		var str="";
		switch (levelChk){
			case 0: str="Уровень не изменился"; break;
			case 1: str="Уровень увеличен"; break;
			case 2: str="Уровень уменьшен"; break;
		}
		$("#endBlock").html(str);
		$("#endBlock").css("display","block");

		self.levelHandler();

		commit();

		//console.log(percent,personTrainingLevel);

	},

	/*
		calculating distance
		a,b - x,y
		c,d - x1,y1
	*/
	calculateDistance: function (a,b,c,d){
		var h1=Math.pow((a-c),2);
		var h2=Math.pow((b-d),2);
		return Math.sqrt(h1+h2);
	},

	/*
		setting text for results
	*/
	setTextResult: function (task,res){
		if (task===1){
			$("#desc0").html("Среднее отклонение: "+res+" мм. Щелкните мышью, чтобы продолжить.");
		}
		else{
			if (res===0){ $("#desc0").html("Ответ неверный."); }
			else if(res===1){ $("#desc0").html("Ответ верный."); }
			else{ $("#desc0").html(""); }
		}
	},

	/*
		displaying circle on the screen for the second task (num-question number(0,1))
	*/
	setCircle: function (num){
		var self = this;

		if (self.correctAnswers.setCheck===1){
			self.setCurrentCorrect();
			self.correctAnswers.setCheck=0;
		}

		var circle={};

		for (var i=0;i<self.preys.currentLength;i++){
			if(i<self.preds.currentLength){
				if (self.correctAnswers.currentCorrect[num]===self.preds.preds[i].objId){
					circle.coordX=self.preds.preds[i].coordX;//+$("#"+self.preds.preds[i].objId).width()/2;
					circle.coordY=self.preds.preds[i].coordY;//+$("#"+self.preds.preds[i].objId).height()/2;
					break;
				}
			}
			if (self.correctAnswers.currentCorrect[num]===self.preys.preys[i].objId){
				circle.coordX=self.preys.preys[i].coordX;//+$("#"+self.preys.preys[i].objId).width()/2;
				circle.coordY=self.preys.preys[i].coordY;//+$("#"+self.preys.preys[i].objId).height()/2;
				break;
			}
		}

		$("#secondCircle").css({
			"left": circle.coordX,//-20,
			"top": circle.coordY//-20
		});

		self.showObjects("secondCircle","show");

	},

	/*
		displaying one shark for the third task
	*/
	setShark: function (num){
		var self = this;

		if (self.correctAnswers.setCheck===1){
			self.setCurrentCorrect();
			self.correctAnswers.setCheck=0;
		}

		self.showObjects("allFishes","hide");
		$("#"+self.preds.preds[self.correctAnswers.currentShark[num]].objId).css("display","block");
	},

	/*
		setting correct answers (and sharks for the third task)
	*/
	setCurrentCorrect: function (){
		var self = this;

		if (self.taskInfo.curTask===2){
			var r=self.randomize(-0.9,(self.preds.currentLength+self.preys.currentLength)-1);
			self.correctAnswers.currentCorrect[0]=r;
			r=self.randomize(-0.9,(self.preds.currentLength+self.preys.currentLength)-1);
			while (r===self.correctAnswers.currentCorrect[0]){
				r=self.randomize(-0.9,(self.preds.currentLength+self.preys.currentLength)-1);
			}
			self.correctAnswers.currentCorrect[1]=r;

			for (var i=0;i<2;i++){
				if (self.correctAnswers.currentCorrect[i]<self.preds.currentLength){
					self.correctAnswers.currentCorrect[i]=self.preds.preds[self.correctAnswers.currentCorrect[i]].objId;
				}
				else{
					self.correctAnswers.currentCorrect[i]=self.preys.preys[self.correctAnswers.currentCorrect[i]-2].objId;
				}
			}
		}

		if (self.taskInfo.curTask===3){
			r=self.randomize(-0.9,self.preds.currentLength-1);
			self.correctAnswers.currentShark[0]=r;
			if (r===0){r=1;}
			else{r=0;}
			self.correctAnswers.currentShark[1]=r;
		}

	},

	/*
		setting mark for the first task
	*/
	setMark: function (num,evt){
		var self = this;
		var evtX = evt.pageX - self.panelX;
		var evtY = evt.pageY - self.panelY;

		$("#mark"+num).css({
			"left": evtX-10,
			"top": evtY-10,
			"display": "block"
		});


		var obj={
			coordX: evtX,
			coordY: evtY
		};

		self.firstAnswers.answers.push(obj);

	},

	/*
		setting object-style
	*/
	rotationBrowser: function (obj){
		var self = this;

		var ang; // rotation angle
		var sc; // scaling

		// checking
		while(obj.angle>=360){ obj.angle-=360; }
		if (obj.angle<0){ obj.angle=360+obj.angle; }

		// for scaling horizontally objects
		if (obj.direction==="left"){
			if (obj.angle>0 && obj.angle<180){
				obj.direction = "right";
				sc=self.flipObj(obj,"horizontal",-1);
			}
			else{
				sc=self.flipObj(obj,"horizontal",1);
			}
		}
		else if (obj.direction==="right"){
			if (obj.angle>180 && obj.angle<360){
				obj.direction = "left";
				sc=self.flipObj(obj,"horizontal",1);
			}
			else{
				sc=self.flipObj(obj,"horizontal",-1);
			}
		}

		ang = self.rotationAngle(obj.angle);

		//console.log(obj.objId,obj.angle,ang);

		var a = "rotate("+ang+"deg)";

		$("#"+obj.objId).css({
			"-webkit-transform": sc+" "+a,
			"-ms-transform": sc+" "+a,
			"-o-transform": sc+" "+a,
			"-moz-transform": sc+" "+a
		});

	},

	rotationAngle: function (deg){

		var ang;

		if (deg>180 && deg<360){
			ang=-(360-deg)+90;
		}
		else{
			ang=deg-90;
			ang=-ang;
		}


		return ang;

	},

	/*
		flipping image of an object
	*/
	flipObj: function (obj,type,value){
		var self = this;

		if (type==="horizontal"){
			$("#"+obj.objId).css({
				"filter": "FlipH",
				"-ms-filter": "\"FlipH\""
			});
			return "scaleX("+value+")";
		}
		else if (type==="vertical"){
			$("#"+obj.objId).css({
				"filter": "FlipV",
				"-ms-filter": "\"FlipV\""
			});
			return "scaleY("+value+")";
		}

	},

	/*
		showing question / task description
	*/
	displayDescription: function (idNum){
		var self = this;
		for (var i=0;i<self.descCount;i++){
			if (i===idNum){
				$("#desc"+i).css("display","inline-block");
			}
			else if(idNum!=0 && idNum!=9){
				$("#desc"+i).css("display","none");
			}
		}
	},

	/*
		showing/hiding objects (objs)
		action: show-show objects, hide-hide objects
	*/
	showObjects: function (objs, action){
		var self = this;
		var disp;
		switch(action){
			case "show": disp="inline-block"; break;
			case "hide": disp="none"; break;
		}

		if (objs==="allFishes"){
			for (var i=0;i<self.preys.currentLength;i++){
				$("#"+self.preys.preys[i].objId).css("display",disp);
				if (i<self.preds.currentLength){
					$("#"+self.preds.preds[i].objId).css("display",disp);
				}
			}
		}
		else if(objs==="marks"){
			for (var i=1;i<=(self.preys.currentLength+self.preds.currentLength);i++){
				$("#mark"+i).css("display",disp);
			}
		}
		else if(objs==="secondCircle"){
			$("#"+objs).css("display",disp);
		}
		else if(objs==="tdAll"){
			for (var i=0;i<self.preys.currentLength;i++){
				if (i<self.preds.currentLength){
					$("#button"+self.preds.preds[i].objId).css("display",disp);
				}
				$("#button"+self.preys.preys[i].objId).css("display",disp);
			}
		}
		else if(objs==="tdPreys"){
			for (var i=0;i<self.preys.currentLength;i++){
				$("#button"+self.preys.preys[i].objId).css("display",disp);
			}
		}
		else if ("correct"){
			$("#correctShow").css("display",disp);
		}

	},


	/*
		exit function
	*/
	exitHandler: function (){
		var self = this;

		if (self.exitCounter===0){
			self.exitCounter++;
			self.displayDescription(8);
			var timeToWait=5000;
			var t=0;
			var wait = setInterval(function(){
				if (t<timeToWait){
					t+=50;
				}
				else{
					self.exitCounter=0;
					wait = clearInterval(wait);
				}
			},50);
		}
		else{
			personTrainingState=1;
			commit();
			window.open('','_parent','');
			window.close();
		}

	}
	// end of functions

};
