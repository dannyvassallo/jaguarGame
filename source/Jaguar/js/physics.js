/***********************************************************************************************/
// Jaguar - PHYSICS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// BOUNDARY DETECTION - $obj.inBounds(JAG);
/***********************************************************************************************/
inBounds:function(JAG){
	var	$Char=$(this),
		cD=$Char.data('character'),
		pos=$Char.position(),
		CH=$Char.outerHeight(true),
		CW=$Char.outerWidth(true),
		X=Math.round(pos.left+(CW/2)),
		Y=Math.round(pos.top+CH),
		isWhite=(D.sD.pathData[(Y * D.sD.sceneW.pF() + X) * 4] > 200);

	// IF IN BOUNDS (WHITE) - SAVE VALID POSITION
    if(isWhite){ 
		cD.lastValidX=X; 
		cD.lastValidY=Y;

	// IF OUT OF BOUNDS (BLACK) - RETURN TO LAST VALID POSITION	
    }else{
		D.cD.walking=false; 
		// CHECK UNDEFINED (CIRCUMVENT ERROR ON FIRST RUN)
		if(typeof cD.lastValidX != undefined || typeof cD.lastValidY != undefined){ X=cD.lastValidX; Y=cD.lastValidY; };
		$Char.stop(true,false).stopWalking(JAG).css({top:Y-CH, left:X-(CW/2)}); 
	};

	// USED TO ADD SPOT AT FEET FOR DEBUGGING BOUNDARIES
	if(D.$Char.hasClass('JAG_charLines')) D.$Scene.find('div.JAG_charSpot').css({top:Y+'px',left:pos.left+'px'});
	
	return $(this);
},




/***********************************************************************************************/
// EXIT COLLISIONS - $obj1.collision(JAG, $sceneObjects);
/***********************************************************************************************/
collision:function(JAG, $objs){
	if(D.gD.switchingScenes || D.cD.action) return;
	
    var $obj1=$(this),
		x1=$obj1.offset().left+$(window).scrollLeft(),
    	y1=$obj1.offset().top+$(window).scrollTop(),
    	h1=$obj1.outerHeight(),
    	w1=$obj1.outerWidth(),
    	b1=y1+h1, r1=x1+w1,
		l=$objs.length;

	// LOOP THROUGH SCENE ELEMENTS TO DETECT EXIT COLLISIONS		
	for(var i=0; i<l; i++){
    	var $obj2=$($objs[i]),
			x2=$($objs[i]).offset().left+$(window).scrollLeft(),
			y2=$obj2.offset().top+$(window).scrollTop(),
    		h2=$obj2.outerHeight(),
			w2=$obj2.outerWidth(),
			b2=y2+h2, r2=x2+w2,
			result=(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) ? false : true;
		// EXIT LOOP AS SOON AS COLLISION OCCURS
		if(result) break;
	};
	
	// IF COLLIDING WITH OBJ2 EXIT, LEAVE THE SCENE
	if(result && $obj2.hasClass('JAG_Item')){
		if($obj2.data('item').type==='exit' && $obj2.data('item').exit_style.split(',')[0].replace(/ /g,'').isB()){
			// MUST STOP CHARACTER FROM WAlKING TO PREVENT MULTIPLE TRANS OUT FIRING
			D.$Char.stop(true,false);
			$(D.$Scene).transSceneOut(JAG, $('#'+$obj2.data('item').goto)[0], $obj2);
		};
	};	
},




/***********************************************************************************************/
// MIDDLEGROUND ITEM COLLISIONS (TYPE=LAYER) - $Char.layerItems($sceneItems, l, now, CH); 
/***********************************************************************************************/
layerItem:function($sceneItems, l, now, CH){
	for(var i=0; i<l; i++){
		// LAYERING FOR MIDDLEGROUND ITEMS AND AUX CHARACTERS
		var elType=$($sceneItems[i]).hasClass('JAG_Item') ? 'item' : 'character';
		
		if((elType==='item' && $($sceneItems[i]).data('item').type==='layer') || $($sceneItems[i]).hasClass('JAG_Aux_Char')){
			// ITEM IN FRONT (zIndex 6) BACK (zIndex 3)
			var $Item=$($sceneItems[i]),
				index=(now+CH) > ($Item.position().top + $Item.outerHeight(true)) ? 3 : 6;
			$Item[0].style.zIndex=index;
		};
	};
	
	return $(this);
},




/***********************************************************************************************/
// CHARACTER PERSPECTIVE SCALING  - $Char.scale(JAG);
/***********************************************************************************************/
scale:function(JAG){
	// CANCEL TO PREVENT RACE CONDITION
	if(D.sD.horizonLine == undefined || D.sD.groundLine == undefined) return;
	
	var $Char=$(this),
		cD=$Char.data('character'),
		VH=D.gD.viewportH.pF(),
		OffY=D.gD.offsetY.pF(),
		CH=cD.CharH.pF(),
		pos=$Char.position(),		
		From=Math.round(((D.sD.horizonLine.pF()/100)*VH)+OffY),
		To=Math.round(((D.sD.groundLine.pF()/100)*VH)+OffY),
		scaleTo=Math.abs(((pos.top+OffY-From)/(To-From))),
		scale=cD.scale.split(',');

	// CHECK MIN/MAX SCALING
	if(scaleTo < scale[0].pF() || scaleTo < 0) var scaleTo=scale[0].pF();
	if(scaleTo > scale[1].pF()) var scaleTo=scale[1].pF();

	var SW=Math.round(cD.CharW * scaleTo)+'px', 
		SH=Math.round(cD.CharH * scaleTo)+'px';	
		
	// !IMPORTANT - MUST OFFSET CHARACTER DUE TO SCALING. CHARACTERS REFERENCE POINT IS TOP/LEFT CORNER
	// WHICH WILL NOT THROW OFF POSITION WHEN WALKING AND SCALING. PAY ATTENTION TO OUTERWIDTH/OUTERHEIGHTS OF CHARACTER 
	$Char.css({width:SW, height:SH, 'margin-top':-SH.pF()+'px', 'margin-left':-(SW.pF()/2)+'px'}).find('img').attr({width:SW, height:SH});

	cD.CharX=pos.left; 
	cD.CharY=pos.top;

	return $Char;
},




/***********************************************************************************************/
// RETURN DISTANCE BETWEEN 2 OBJECTS - $obj1.returnDist($obj2);
/***********************************************************************************************/
returnDist:function($obj2){
	// DIMENSIONS MUST INCLUDE MARGINS IN ORDER TO FACE OBJECTS CORRECTLY
	var $obj1=$(this).find('img'),
		$obj2=$obj2.hasClass('JAG_Aux_Char_Img') ? $obj2.parent('div:first') : $obj2,
		AcD=$obj2.hasClass('JAG_Aux_Char') ? $obj2.data('character') : false,		

		x1=Math.round($obj1.parent('div').position().left),
    	y1=Math.round($obj1.parent('div').position().top),
    	w1=Math.round($obj1.outerWidth(true)), 
    	h1=Math.round($obj1.outerHeight(true)),
    	x2=Math.round($obj2.position().left),
		y2=Math.round($obj2.position().top),
    	w2=Math.round($obj2.outerWidth(true)),
    	h2=Math.round($obj2.outerHeight(true));
		
	return Diff={
		AcD:AcD,
		Left:(x1 < x2) ? true : false,
		Higher:(y1 < y2) ? true : false,
		X:(x1 < x2) ? Math.abs(x2-(x1+w1)) : Math.abs(x1-(x2+w2)),
		Y:(y1 < y2) ? Math.abs(y2-(y1+h1)) : Math.abs(y1-(y2+h2))
	};
}});