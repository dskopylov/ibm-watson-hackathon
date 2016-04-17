/*
 cut "[-]" from string
*/
function stringCut(res){

	var ind;
	
	for (var i=0;i<res.length;i++){
	
		if (res.charAt(i)=='['){
			res=res.substring(0,i)+res.substring(i+3);
		}
		
	}
	
	//console.log(res);
	return res;
}

/**
 *
 * making CPT-obj
 *
 * @param result result-string
 * @return CPT-obj
 */

function makeObj(res, cpt){


	var let=new Array(settings.allAmount+2);
	var react=new Array(settings.allAmount+2);
	var blockt=new Array(settings.allAmount+2);
	var arrlength;
	var result=res;
	var like=0;
	var hard=0;

	var count=0;
	var i;
	
	var result=stringCut(result);

	for (i=0;i<result.length;i++){
		if (result.charAt(i)==';'){
			count++;
		}
	}

	i=0;
	var last,ind,ind1;
	var temp;
	
	if (count<settings.allAmount+2){last=count;}
	else{last=settings.allAmount+2;}

	while (i<last){
		ind=result.indexOf(':');
		let[i]=result.substring(0, ind);
		result=result.substring(ind+1);

		ind=result.indexOf(':');
		temp=result.substring(0, ind);
		if (temp==("-")){
			react[i]=0;
		}
		else{react[i]=parseFloat(temp);}
		result=result.substring(ind+1);

		ind=result.indexOf(';');
		temp=result.substring(0, ind);
		if (temp==("-")){
			blockt[i]=0;
		}
		else{blockt[i]=parseFloat(temp);}
		result=result.substring(ind+1);
		i++;
	}

	arrlength=i;
	
	if (let[settings.allAmount]=="4" && let[settings.allAmount+1]=="5"){
		hard=react[settings.allAmount];
		like=react[settings.allAmount+1];
	}
	else{
		for (var j=0;j<settings.allAmount+2;j++){
			if(let[j]=="4"){ hard=react[j]; }
			if(let[j]=="5"){ like=react[j]; }
		}
	}

	cpt = {
		letters: let,
		react: react,
		blocktime: blockt,
		maslength: arrlength,
		likeVar: like,
		hardVar: hard
	};
	
	
	return cpt;
}


//_______________________________________________________________________________________________________________________________

/**
 * STANDARD DEVIATION (_STDEV_,_СТАНДОТКЛОН_ functions in Excel)
 * @param mas - array
 * @return standard deviation of array
 */
function stdev(mas){

    var ans=0;
    var avg;
    var sum=0;
    var sum1=0;

    for (var i=0;i<mas.length;i++){
        sum=sum+mas[i];
    }

    avg=sum/mas.length;

    for (var i=0;i<mas.length;i++){
        sum1=sum1+Math.pow((mas[i]-avg),2);
    }

    ans=Math.sqrt((sum1)/(mas.length-1));

    return ans;
}
	
//_______________________________________________________________________________________________________________________________
	
/**
 * hit-var calculator
 *
 * (СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")/(СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")+СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")))*100
 *
 */
function hitCalc(cpt){

    var res;
    var count1=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")
    var count2=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")
    var count3=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]!=0){count1++;}
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]==0){count2++;}
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]!=0){count3++;}
    }

   res= 100*count1/(count2+count3);

    cpt.hit=res;
	
}

/**
 *
 * omissions-var calculator
 *
 * (СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")/(СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")+СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")))*100
 *
 */
function omissionsCalc(cpt){

    var res;
    var count1=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")
    var count2=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=0")
    var count3=0;//___СЧЁТЕСЛИМН(A:A;"<>X";B:B;"=1")

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]==0){count1++;}
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]==0){count2++;}
        if (cpt.letters[i]!=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]!=0){count3++;}
    }

    res= 100*count1/(count2+count3);

    cpt.omissions=res;
	
}

/**
 *
 * commissions-var calculator
 *
 * (СЧЁТЕСЛИМН(A:A;"X";B:B;"1")/(СЧЁТЕСЛИМН(A:A;"X";B:B;"1")+СЧЁТЕСЛИМН(A:A;"X";B:B;"0")))*100
 *
 */
function commissionsCalc(cpt){

    var res;
    var count1=0;//___СЧЁТЕСЛИМН(A:A;"X";B:B;"1")
    var count2=0;//___СЧЁТЕСЛИМН(A:A;"X";B:B;"1")
    var count3=0;//___СЧЁТЕСЛИМН(A:A;"X";B:B;"0")

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]!=0){count1++;}
        if (cpt.letters[i]=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]!=0){count2++;}
        if (cpt.letters[i]=="X" && cpt.letters[i]!=="4" && cpt.letters[i]!=="5" && cpt.react[i]==0){count3++;}
    }
	
    res=100*count1/(count2+count3);

    cpt.commissions=res;
	
}

/**
 *
 * hitRT-var calculator
 *
 * СРЗНАЧЕСЛИМН(C:C;A:A;"<>X";B:B;"1")
 *
 */
function hitRTCalc(cpt){

    var res;
    var count1=0;//counter
    var sum=0;

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!==("X") && cpt.letters[i]!==("4") && cpt.letters[i]!==("5") && cpt.react[i]!=0){
            count1++;
            sum=sum+cpt.react[i];
        }
    }

    res=sum/count1;

    cpt.hitRT=res;
	
	if(isNaN(cpt.hitRT)){
		cpt.hitRT="-";
	}
	
}

/**
 *
 * hitRTSE-var calculator
 *
 * СТАНДОТКЛОН(C:C)/КОРЕНЬ(СЧЁТЕСЛИ(C:C;">1"))
 *
 */
function hitRTSECalc(cpt){

    var res;
    var count1=0;//___СЧЁТЕСЛИ(C:C;">1")
    var sq=0;
	var std;

    var arr=[];

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!==("4") && cpt.letters[i]!==("5") && cpt.react[i]!=0) {
            arr.push(cpt.react[i]);
        }
        if (cpt.letters[i]!==("4") && cpt.letters[i]!==("5") && cpt.react[i]>1){
            count1++;
        }
    }

    sq=Math.sqrt(count1);
	std=stdev(arr);
    res=std/sq;

    cpt.hitRTSE=res;
	
	if(isNaN(cpt.hitRTSE)){
		cpt.hitRTSE="-";
	}
	
}

/**
 *
 * perseveration-var calculator
 *
 * (СЧЁТЕСЛИ(C:C;"<100")/СЧЁТЕСЛИ(C:C;">1"))*100
 *
 */
function perseverationCalc(cpt){

    var res;
    var count1=0;//___СЧЁТЕСЛИ(C:C;"<100")
    var count2=0;//___СЧЁТЕСЛИ(C:C;">1")

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!==("4") && cpt.letters[i]!==("5") && cpt.react[i]>0 && cpt.react[i]<100) {
            count1++;
        }
        if (cpt.letters[i]!==("4") && cpt.letters[i]!==("5") && cpt.react[i]>1){
            count2++;
        }
    }

    res=100*count1/count2;

    cpt.perseveration=res;
	
	if(isNaN(cpt.perseveration)){
		cpt.perseveration="-";
	}
	
}
	
/**
 *
 * detectability-var calculator
 *
 * НОРМСТОБР(M2/100)-НОРМСТОБР(M4/100)
 *
 * M2 - hit
 * M4 - commissions
 *
 */
function detectabilityCalc(cpt){

    var res;
    var norm1=0;//___НОРМСТОБР(M2/100)
    var norm2=0;//___НОРМСТОБР(M4/100)
	var temp;
    var counthit=0;
    var countcom=0;

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!==("X") && cpt.letters[i]!==("4") && cpt.letters[i]!==("5")){
            counthit++;
        }
        if (cpt.letters[i]==("X") && cpt.letters[i]!==("4") && cpt.letters[i]!==("5")){
            countcom++;
        }
    }

    
    if (cpt.hit==100){
        temp=(counthit-1)/counthit;
		norm1=jStat.normal.inv(temp,0,1);
    }
    else if (cpt.hit==0) {
        temp=1/counthit;
		norm1=jStat.normal.inv(temp,0,1);
    }
    else{
        temp=cpt.hit/100;
		norm1=jStat.normal.inv(temp,0,1);
    }

    if (cpt.commissions==0){
        temp=1/countcom;
		norm2=jStat.normal.inv(temp,0,1);
    }
    else if (cpt.commissions==100) {
        temp=(countcom-1)/countcom;
		norm2=jStat.normal.inv(temp,0,1);
    }
    else{
        temp=cpt.commissions/100;
		norm2=jStat.normal.inv(temp,0,1);
    }

    res=norm1-norm2;

    cpt.detectability=res;
	
}	
	
/**
 *
 * responseStyle-var calculator
 *
 * EXP(0,5*(НОРМСТОБР(M4/100)*НОРМСТОБР(M4/100)-НОРМСТОБР(M2/100)*НОРМСТОБР(M2/100)))
 *
 * M2 - hit
 * M4 - commissions
 *
 */
function responseStyleCalc(cpt){

    var res;
    var norm1=0;//___НОРМСТОБР(M2/100)
    var norm2=0;//___НОРМСТОБР(M4/100)
    var counthit=0;
    var countcom=0;

    for (var i=0;i<cpt.maslength;i++){
        if (cpt.letters[i]!==("X") && cpt.letters[i]!==("4") && cpt.letters[i]!==("5")){
            counthit++;
        }
        if (cpt.letters[i]==("X") && cpt.letters[i]!==("4") && cpt.letters[i]!==("5")){
            countcom++;
        }
    }

    
    if (cpt.hit==100){
        temp=(counthit-1)/counthit;
		norm1=jStat.normal.inv(temp,0,1);
    }
    else if (cpt.hit==0) {
        temp=1/counthit;
		norm1=jStat.normal.inv(temp,0,1);
    }
    else{
        temp=cpt.hit/100;
		norm1=jStat.normal.inv(temp,0,1);
    }

    if (cpt.commissions==0){
        temp=1/countcom;
		norm2=jStat.normal.inv(temp,0,1);
    }
    else if (cpt.commissions==100) {
        temp=(countcom-1)/countcom;
		norm2=jStat.normal.inv(temp,0,1);
    }
    else{
        temp=cpt.commissions/100;
		norm2=jStat.normal.inv(temp,0,1);
    }

    res=Math.exp(0.5*(Math.pow(norm2,2)-Math.pow(norm1,2)));

    cpt.responseStyle=res;

}	

