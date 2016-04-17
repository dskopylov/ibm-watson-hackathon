//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//____________________________________________GRAPHICS___________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________

var gameGraphics = {

	currentTetro: [],

	runGraphics: function(){

		//___Cheating on z-axis depth___
		var zCheat = settings.zDepth+6;

		//____________________SETTING_CAMERA_AND_SCENE____________________

		var WIDTH = $("#drawPanel").width();
		HEIGHT = $("#drawPanel").height();

		var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

		gameGraphics.canvasElem = $('#drawPanel');		

		gameGraphics.renderer = new THREE.WebGLRenderer({canvas: gameGraphics.canvasElem.get(0)});
		gameGraphics.camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
		gameGraphics.scene = new THREE.Scene();

		gameGraphics.camera.position.z = 50*zCheat; //without +5
		gameGraphics.scene.add(gameGraphics.camera);

		gameGraphics.renderer.setSize(WIDTH, HEIGHT);

		//____________________SETTING_PIT____________________

		

		var pitConfig = {
			width: 50*settings.xDepth,
			height: 50*settings.yDepth,
			depth: 50*zCheat,
			blockX: settings.xDepth,
			blockY: settings.yDepth,
			blockZ: zCheat
		};

		gameGraphics.blockSizeX = pitConfig.width/pitConfig.blockX;
		gameGraphics.blockSizeY = pitConfig.height/pitConfig.blockY;
		gameGraphics.blockSizeZ = pitConfig.depth/pitConfig.blockZ;

		var pitBox = new THREE.CubeGeometry(pitConfig.width, pitConfig.height, 
			pitConfig.depth, pitConfig.blockX, pitConfig.blockY, pitConfig.blockZ);
		var pitMaterial = new THREE.MeshBasicMaterial( { color: 0x1c3c6f, wireframe: true } ); //ff3300

		var pit = new THREE.Mesh(pitBox, pitMaterial);
		pit.position.z=pitConfig.depth/2;
		
		gameGraphics.scene.add(pit);

		gameGraphics.renderScene();

	},

	renderScene: function(){
		gameGraphics.renderer.render(gameGraphics.scene, gameGraphics.camera);
	},

	removePreviousTetro: function(){

		if (gameGraphics.currentTetro.length!=0){
			for (var i=0;i<gameGraphics.currentTetro.length;i++){
				gameGraphics.scene.remove(gameGraphics.currentTetro[i]);
			}
			gameGraphics.currentTetro = [];

			gameGraphics.renderScene();
		}	

	},

	configureMeshForCube: function(x,y,z,wireframeColorHex,faceColorHex){

		//_____
		var xAmendment = (-2)*gameGraphics.blockSizeX+0.75;
		var yAmendment = (-2)*gameGraphics.blockSizeY+0.75;
		var zAmendment = gameGraphics.blockSizeZ/2;
		//_____

		/**/

		var faceMaterial=0;

		if (faceColorHex==='transparent'){
			var cube = new THREE.Mesh(new THREE.CubeGeometry(gameGraphics.blockSizeX, 
				gameGraphics.blockSizeY, gameGraphics.blockSizeZ), 
				new THREE.MeshBasicMaterial({color: wireframeColorHex, wireframe: true})
				);
		}
		else{
			faceMaterial = new THREE.MeshBasicMaterial({color: faceColorHex, wireframe: false});
			var cubeG = new THREE.CubeGeometry(gameGraphics.blockSizeX, 
				gameGraphics.blockSizeY, gameGraphics.blockSizeZ);
			var cube = THREE.SceneUtils.createMultiMaterialObject(cubeG,[
				new THREE.MeshBasicMaterial({color: wireframeColorHex, wireframe: true}), faceMaterial
				]);
		}

		
		cube.position.x = x*gameGraphics.blockSizeX+xAmendment;
		cube.position.y = y*gameGraphics.blockSizeY+yAmendment;
		cube.position.z = z*gameGraphics.blockSizeZ+zAmendment;

		return cube;

	},

	addTetroCubes: function(boolArray){

		gameGraphics.removePreviousTetro();

		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){
				for (var z=0;z<settings.zDepth;z++){
					if (boolArray[i][j][z]===1){
						//_____set cube_____
						var cube = gameGraphics.configureMeshForCube(i,j,z,0xffffff,'transparent');
						//_____add cube to pit_____
						gameGraphics.currentTetro.push(cube);
						gameGraphics.scene.add(cube);
						//_____				
					}			
				}
			}
		}
		
		gameGraphics.renderScene();

	},

	//____COLORS_FOR_PIT_STAGES_____

	basicStageColors: [0x3063ed, 0xa52020, 0x8ae4e7, 0x0f9d58, 0xf6bc5f, 0xa5a5a5],
	stageColors: [],

	setStageColors: function(){
		
		var c=0;
		
		for (var z=0;z<settings.zDepth;z++){
			c = (z%gameGraphics.basicStageColors.length===0) ? c=0 : c+1;
			gameGraphics.stageColors[z] = gameGraphics.basicStageColors[c];
		}

	},

	//_____GAME_FIELD_____

	gameFieldGraphics: [],

	clearGameField: function(){
		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){
				for (var z=0;z<settings.zDepth;z++){
					//_____remove cube from pit_____
					if (gameGraphics.gameFieldGraphics[i][j][z]!=0){
						gameGraphics.scene.remove(gameGraphics.gameFieldGraphics[i][j][z]);
					}						
					//_____			
				}
			}
		}

		gameGraphics.setStartGameField();

	},

	setStartGameField: function(){
		for (var i=0;i<settings.xDepth;i++){
			gameGraphics.gameFieldGraphics[i]=[];
			for (var j=0;j<settings.yDepth;j++){
				gameGraphics.gameFieldGraphics[i][j]=[];
				for (var z=0;z<settings.zDepth;z++){
					gameGraphics.gameFieldGraphics[i][j][z] = 0;
				}					
			}
		}
	},

	updateGameField: function(){

		gameGraphics.clearGameField();

		for (var i=0;i<settings.xDepth;i++){
			for (var j=0;j<settings.yDepth;j++){
				for (var z=0;z<settings.zDepth;z++){
					if (gameSessionInfo.gameField[i][j][z]===1){
						//_____set cube_____
						var faceColor = gameGraphics.stageColors[z];
						var cube = gameGraphics.configureMeshForCube(i,j,z,0x000000,
							faceColor);
						gameGraphics.gameFieldGraphics[i][j][z] = cube;
						//_____add cube to pit_____
						gameGraphics.scene.add(cube);
						//_____				
					}			
				}
			}
		}

		gameGraphics.renderScene();

	},






};

var infoGraphics = {

	runGraphics: function(){

		//___Cheating on z-axis depth___
		//var zCheat = settings.zDepth+6;

		//____________________SETTING_CAMERA_AND_SCENE____________________

		var WIDTH = $("#infoPanel").width();
		HEIGHT = $("#infoPanel").height();

		var VIEW_ANGLE = 45,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 10000;

		infoGraphics.canvasElem = $('#infoPanel');		

		infoGraphics.renderer = new THREE.WebGLRenderer({canvas: infoGraphics.canvasElem.get(0)});
		infoGraphics.camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR);
		infoGraphics.scene = new THREE.Scene();

		infoGraphics.camera.position.z = 170;
		infoGraphics.scene.add(infoGraphics.camera);

		infoGraphics.renderer.setSize(WIDTH, HEIGHT);

		
		var cubeG = new THREE.CubeGeometry(40,40,40);

		var faceMaterial = new THREE.MeshBasicMaterial({color: 0xa9a9a9, wireframe: false});
		var wfMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
			

		var cube1 = THREE.SceneUtils.createMultiMaterialObject(cubeG,[wfMaterial,faceMaterial]);//new THREE.Mesh(cubeG, cubeMaterial);
			cube1.position.x=-210;
		var cube2 = THREE.SceneUtils.createMultiMaterialObject(cubeG,[wfMaterial,faceMaterial]);//new THREE.Mesh(cubeG, cubeMaterial);
			cube2.position.x=0;
		var cube3 = THREE.SceneUtils.createMultiMaterialObject(cubeG,[wfMaterial,faceMaterial]);//new THREE.Mesh(cubeG, cubeMaterial);
			cube3.position.x=210;
		
		infoGraphics.scene.add(cube1);
		infoGraphics.scene.add(cube2);
		infoGraphics.scene.add(cube3);

		infoGraphics.showInfo = setInterval(function(){

			cube1.rotation.x+=0.03;
			cube2.rotation.y+=0.03;
			cube3.rotation.z+=0.03;

			infoGraphics.renderer.render(infoGraphics.scene, infoGraphics.camera);

		},70);

		

	},

};



//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//________________________________________TETROMINO______________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________



/*

	array of tetromino-objects

*/
var tetrominoes = [
	{ // single cube
		tType: "singleQ",		
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23]
		],
		tCenter: [2,2,22],
		highScore: 156,
		lowScore: 14

	},
	{ // double cube
		tType: "doubleQ",		
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[1,3,23]
		],
		tCenter: [2,2,22],
		highScore: 156,
		lowScore: 14
	},
	{ // triple cube
		tType: "tripleQ",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[1,3,23],
			[1,5,23]
		],
		tCenter: [2,2,22],
		highScore: 307,
		lowScore: 27
	},
	{ // corner tetromino
		tType: "corner",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[1,3,23],
			[3,1,23]
		],
		tCenter: [2,2,22],
		highScore: 307,
		lowScore: 27
	},
	{ // quad tetromino
		tType: "fourQ",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[1,3,23],
			[3,1,23],
			[3,3,23]
		],
		tCenter: [2,2,22],
		highScore: 156,
		lowScore: 14
	},
	{ // t-tetromino
		tType: "t-fig",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[3,1,23],
			[5,1,23],
			[3,3,23]
		],
		tCenter: [2,2,22],
		highScore: 461,
		lowScore: 40
	},
	{ // z-tetromino (s)
		tType: "z-fig",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[3,1,23],
			[3,3,23],
			[5,3,23]
		],
		tCenter: [2,2,22],
		highScore: 461,
		lowScore: 40
	},
	{ // l-tetromino
		tType: "l-fig",
		cubesCentralPoints: [ //array of each cubes central point
			[1,1,23],
			[3,1,23],
			[5,1,23],
			[1,3,23]
		],
		tCenter: [2,2,22],
		highScore: 307,
		lowScore: 27
	}
];

var scoreParameters = {
	// for level 0-10
	forLevel: [ 0.066990, 0.139195, 0.219800, 0.308444, 0.403897, 0.507822, 0.619062, 0.738630, 0.865802, 1.000000, 1.133333],
	// for zDepth (use without -1)
	depth: [ 0, 0, 0, 0, 0, 0, 1.557692, 1.367521, 1.217949, 1.100427, 1.000000, 0.918803, 0.852564, 0.788996, 0.737714, 0.691774, 0.651709, 0.614850, 0.583868 ],
	// for level 0-10
	lineForLevel: [ 0.096478, 0.163873, 0.242913, 0.328261, 0.422329, 0.518394, 0.630405, 0.747501, 0.867087, 1.000000, 1.131653 ],
	// for number of lines deleted
	fullLineNumber: [ 0.0, 1.000000, 3.703372, 8.104827 ],
	lineScoreSet: 762.5
};



//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//________________________________________MATH_FUNCTIONS_________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________


function transposeMatrix(matrix){
	var buf=0;
	var mT=[];

	if(matrix[0].length!==undefined){
		var m = matrix.length; 
		var n = matrix[0].length;
   		if(n>1){
   			for (var i = 0; i < n; i++)
 				mT[i] = [];		
    		for (var i = 0; i < m; i++){
    			for (var j = 0; j < n; j++) 
   					mT[j][i]=matrix[i][j];
   			};
   		};
   		if(n==1){
   			for (var i = 0; i < n; i++){
    			for (var j = 0; j < m; j++) 
   					mT[j] = matrix[j][i];
   			};
   		};
   	};

   	if(matrix[0].length===undefined){
   		var m = matrix.length
   		for(var i=0;i<m;i++){
   			mT[i]=[];
			mT[i][0]=matrix[i];
   		};
   	};
	return mT ;
};

function multiplyMatrix(m1, m2){
	var mMu = [];

	if(m1[0].length!==undefined && m2[0].length!==undefined){
   		if(m1[0].length==m2.length){
   			for (var i = 0; i < m1.length; i++) {
      			mMu[i] = [];
        		for (var j = 0; j < m2[0].length; j++) {
        		   	var sum = 0;
        	    	for (var k = 0; k < m1[0].length; k++) {
            	    	sum += m1[i][k] * m2[k][j];
            		}
            		mMu[i][j] = sum;
        		}
    		}
    	}
    	else{
 			console.log("error");
    	}
	}

	if(m1[0].length===undefined){
		for(var i=0;i<m2[0].length;i++){
			var sum=0;
			for(var j=0;j<m1.length;j++){
				sum+=m1[j]*m2[j][i];
			}
			mMu[i]=sum;
		}
	}

	if(m2[0].length===undefined){
		if(m1[0].length==1){
			for(var i=0;i<m1.length;i++){	
				mMu[i]=[];	
				for (var j=0;j<m1.length;j++) {
					var sum=0;
					mMu[i][j]=m1[i][0]*m2[j];
				};
			}
		}
		else{
 			console.log("error");
    	}
	}
    return mMu;
}

function translationMatrix(vector){
	var mp=[];
	for (var i = 0; i < vector.length+1; i++) {
		mp[i]=[];
	};
	for (var i = 0; i < vector.length+1; i++) {
		for (var j = 0; j < vector.length+1; j++) {
			mp[i][j]=0
			if(j==vector.length){
				mp[i][j]=vector[i];
			};		
		};
	mp[i][i]=1
	};
	return mp;
};

function subtractMatrix(m1,m2){
	var mSu=[];
	if(m1[0].length!==undefined && m2[0].length!==undefined){
		if(m1.length==m2.length && m1[0].length==m2[0].length){
			for (var i = 0; i < m1.length; i++) {
				mSu[i]=[];
			};
			for (var i = 0; i < m1.length; i++) {	
				for (var j = 0; j < m1[0].length; j++) {
					mSu[i][j]=m1[i][j]-m2[i][j]
				};
			};
		};
	};
	if(m1[0].length===undefined && m2[0].length===undefined){
		if(m1.length==m2.length){
			for (var i = 0; i < m1.length; i++) 
				mSu[i]=m1[i]-m2[i]
		};
	};
	return mSu;
};

function addMatrix(m1,m2){
	var mSu=[];
	if(m1[0].length!==undefined && m2[0].length!==undefined){
		if(m1.length==m2.length && m1[0].length==m2[0].length){
			for (var i = 0; i < m1.length; i++) {
				mSu[i]=[];
			};
			for (var i = 0; i < m1.length; i++) {	
				for (var j = 0; j < m1[0].length; j++) {
					mSu[i][j]=m1[i][j]+m2[i][j]
				};
			};
		};
	};
	if(m1[0].length===undefined && m2[0].length===undefined){
		if(m1.length==m2.length){
			for (var i = 0; i < m1.length; i++) 
				mSu[i]=m1[i]+m2[i]
		};
	};
	return mSu;
}


//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
//_______________________________________________________________________________________________
