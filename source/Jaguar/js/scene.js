/***********************************************************************************************/
// Jaguar - SCENE MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SCENE LOADING - $(scene).loadScene(JAG);
/***********************************************************************************************/
loadScene:function(JAG){
	// RETURNS D OBJ
	JAG.getDATA(JAG);

	// LOAD SCENE MUSIC
	D.$Scene.loadMusic(JAG);	
	
	// THIS SCENE IS A CUTSCENE
	if(D.$Scene.data('scene').type && D.$Scene.data('scene').type.replace(/ /g,'').toLowerCase()==='cutscene'){ 
		D.$Scene.find('div.JAG_DayNightCycle').css('visibility','hidden').loadCutScene(JAG); return; 		
	};

	var	src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'url(Jaguar/scenes/'+D.sD.foreground+'.png)' : false,
		img=new Image();

	// SET SCENE VISIBILITY BASED ON WHETHER SCENE IS INDOORS
	D.$Scene.find('div.JAG_DayNightCycle').css('visibility',D.sD.indoor ? 'hidden' : 'visible'); 

	// SET VIEWPORT DIMENSIONS
	D.gD.viewportW=D.$Chapter.outerWidth(); 
	D.gD.viewportH=D.$Chapter.outerHeight();
	D.sD.horizonLine=D.sD.horizon.split(',')[0].pF();
	D.sD.groundLine=D.sD.horizon.split(',')[1].pF();

	// LOAD SCENE
	$(img).one('load',function(){
		// SAVE SCENE DIMENSIONS, PAN AND NOTE THAT THE CHARACTER HAS BEEN HERE
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		D.sD.pan=D.sD.sceneW > D.gD.viewportW;
		var setW=D.sD.pan ? D.sD.sceneW : D.gD.viewportW;

		// UPDATE DIMENSIONS (FROM FULLSCREEN CUTSCENES)
		D.$Scene.add(JAG.OBJ.$currentChapter).css('height',D.sD.sceneH+'px');
		$('div.JAG_Panel').add($('div.JAG_Desc')).css('display','block');
		
		// FOREGROUND
		if(foreG){
			if(!D.$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground" style="background:'+foreG+'"></div>').appendTo(D.$Scene);
			JAG.OBJ.$foreground=D.$Scene.find('div.JAG_Foreground');
		};

		// BACKGROUND
		if(!D.$Scene.find('img.JAG_Background').length) $('<img src="'+src+'.png" class="JAG_Background"/>').appendTo(D.$Scene);
		
		// ADD CANVAS
		if(!D.$Scene.find('canvas.JAG_Canvas').length) $('<canvas id="JAG_Canvas" class="JAG_Canvas" width="'+setW+'" height="'+D.sD.sceneH+'"></canvas>').appendTo(D.$Scene);

		// SUBTITLES
		if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))){
			var subDelay=D.sD.subtitle_speed.split(',')[1].pF(),
				subPos=D.sD.subtitle_pos==='top' ? '5%' : D.sD.subtitle_pos==='middle' ? '48%' : '85%';
			D.$Scene.prepend('<p id="JAG_Scene_Dialogue" style="font-size:'+D.sD.subtitle_size.pF()+'px;color:'+D.sD.subtitle_color+';top:'+subPos+'">'+D.sD.subtitle+'</p>');
			if(subDelay>0) D.sD.subtitleTimer=setTimeout(function(){ $('#JAG_Scene_Dialogue').fadeOut(D.sD.subtitle_speed.split(',')[0].pF()) }, subDelay ); };

		// DRAW SCENE IMAGE (_PATH.PNG) - CANVAS USED FOR BOUNDARY DETECTION
		var canvas=JAG.OBJ.$canvas=D.$Scene.find('canvas.JAG_Canvas')[0],
			ctx=canvas.getContext('2d'),
			canvasOffset=D.$Chapter.offset(),
			offsetX=D.gD.offsetX=canvasOffset.left,
			offsetY=D.gD.offsetY=canvasOffset.top;

			// DRAW IMAGE AND SAVE PATH PIXELS TO D.sD.pathData
			ctx.drawImage(img, 0, 0);
	    	D.sD.pathData=ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		
		// TRANSITION IN
		D.$Scene.transSceneIn(JAG);
		
		// PANNING - SET PAN % OF BACKGROUND POSITION
		if(D.sD.pan){
			var panPos=D.sD.panPos=-(((D.sD.ENT_PAN!==false && D.sD.ENT_PAN!=='false' ? D.sD.ENT_PAN.pF() : D.sD.pos.pF())/100)*(D.sD.sceneW-D.gD.viewportW));
			// SET MARGIN - MATCH WIDTH OF SCENE AND FOREGROUND TO IMAGE
			D.$Scene.css('margin-left', panPos).add( $([JAG.OBJ.$canvas[0], JAG.OBJ.$foreground[0]] )).css('width',setW);
		};



		// SCENE EVENTS
		D.$Scene.on('click dblclick',function(e){
			e.preventDefault(); 
			e.stopPropagation();
			
			// RESOLVE TARGET (CAN CLICK INNER ELEMENT IMAGES)
			var $tar=$(e.target),
				$target=($tar.hasClass('JAG_Item_Img') || $tar.hasClass('JAG_Aux_Char_Img') || $tar.hasClass('JAG_Char_Img')) ? $tar.parent('div:first') : $tar,
				mouseX=(e.clientX-offsetX+$(window).scrollLeft()).pF(),
				mouseY=(e.clientY-offsetY+$(window).scrollTop()).pF(),
				$Dialogue=$('#JAG_dialogue');
				
			// SOME USER ACTIONS PREVENT EVENTS FROM FIRING, JUST RETURN THOSE HERE
			if(D.gD.switchingScenes || D.cD.action || $target.hasClass('JAG_Char')) return;

			// HANDLE EVENT TYPES		
			switch(e.type){

				// SINGLE CLICK
				case 'click':
					// IF TALKING AND A CONVERSATION
					if(D.sD.talking && $('#JAG_dialogue').length) return;
					// SET TARGET AS CURRENT ITEM
					JAG.OBJ.$currentItem=$target;
					// IF DIALOGUE PANEL IS OPEN CLOSE IT
					if($Dialogue.length) $('#JAG_dialogue').closeDiag(JAG);					

					// HANDLE ACTIONS
					if($target.hasClass('JAG_Aux_Char') || ($target.hasClass('JAG_Item') && $target.data('item').type!=='exit' && $target.data('item').text!==false)){

						// PERFORM ACTION 
						if(JAG.Story.ActionWord) $target.Action(JAG, $target.hasClass('JAG_Aux_Char') ? 'character' : 'item', true, false);

						var Tpos=$target.offset(),
							TW=$target.width(),
							TH=$target.height(),
							mL=Math.abs($target.css('margin-left').pF()),
							mouseY=Tpos.top-D.gD.offsetY+TH,
							mouseX=Tpos.left-D.gD.offsetX+TW;
							
						// IF AUX CHARACTER - GET CHARACTER'S DIRECTION FOR FACE-TO-FACE
						D.$Char.returnDist($target);
						if(Diff.AcD){
							// SIDE OF CHARACTER TO WALK TO
							switch(Diff.AcD.direction){
								case 'left':
									var mouseX=(Tpos.left+mL)-D.gD.offsetX-D.$Char.width(),
										mouseY=$target.position().top; break;
								case 'right':
									var mouseX=(Tpos.left+mL)-D.gD.offsetX+D.$Char.width()+$target.outerWidth(true),
										mouseY=$target.position().top; break;
								case 'down':
									var mouseX=(Tpos.left+mL)-D.gD.offsetX+(D.$Char.width()/2),
										mouseY=$target.position().top+(D.$Char.height()/2); break;
								case 'up':
									var mouseX=(Tpos.left+mL)-D.gD.offsetX+(D.$Char.width()/2),
										mouseY=$target.position().top-(D.$Char.height()/2); break;						
							};
						};

					}else{
						JAG.OBJ.$selectedItem=false;					
					};

					// DISABLE DESC BAR ACTION WORD
					JAG.Story.ActionWord=false;
					JAG.Story.joinWord=false;
					$target.updateBar(JAG, 'exit', false, ' ');
					
					// WALK TO CLICKED POINT
					D.$Char.walk(JAG, mouseX, mouseY); 
				break;
				
				// DOUBLE CLICK - FAST-ADVANCE TO NEXT SCENE
				case 'dblclick':
					if($target.hasClass('JAG_Item') && $target.data('item').type==='exit'){
						if($target.data('item').exit_style.split(',')[1].replace(/ /g,'').isB()) $(D.$Scene).transSceneOut(JAG, $('#'+$target.data('item').goto)[0], $target);
					};
				break;
			};
		});

		// LOAD MAIN CHARACTER, ITEM ASSETS, AUX CHARACTERS AND DESCRIPTION BAR
		D.$Scene.loadChar(JAG).loadItems(JAG).dBar(JAG);
		
		// WAIT BEFORE LOADING THE AUX CHARACTERS (FIXES WALK IN RACE CONDITIONS)
		setTimeout(function(){ D.$Scene.loadAuxChars(JAG); }, 100);

	})[0].src=src+'_path.png';	
	
	return $(this);	
},




/***********************************************************************************************/
// SCENE IN TRANSITIONS 
/***********************************************************************************************/
transSceneIn:function(JAG){ 
	var	newScene=$(this);
	
	// ++EXPERIENCE FOR BEING HERE
	if(!D.sD.beenHere && D.sD.value.pF() > 0){
		D.gD.experience+=D.sD.value.pF(); 
		D.sD.value=0; 
	};

	$(newScene).fadeIn(D.sD.speed.split(',')[0].pF(), function(){ D.gD.switchingScenes=false; }); 

	// LOOP THROUGH DEBUG OPTIONS TO KEEP OPTIONS APPLIED THROUGH ALL SCENES
	if(JAG.OBJ.$Debug){
		var $D=JAG.OBJ.$Debug;
		$D.find('input[name="horizon_Line"]').debugHorizon(JAG, D);
		if(D.$Scene.find('div.JAG_Char').length) $D.find('input[name="Char_Lines"]').debugCharLines(JAG,D);
		$D.find('input[name="Show_Path"]').debugPath(JAG,D);
		$D.find('input[name="Item_Lines"]').debugItemLines(JAG,D);
		$D.find('input[name="hide_FG"]').debugForeground(JAG,D);
		$D.find('input[name="show_Clip"]').debugSceneClipping(JAG,D);
		JAG.OBJ.$EXP.html(D.gD.experience);
		$('#JAG_Debug_currentScene').html($(JAG.OBJ.$currentScene).attr('id'));
	};

	return $(this);	
},





/***********************************************************************************************/
// SCENE OUT TRANSITIONS - $oldScene.transSceneOut(JAG, newScene, $ExitItem);
/***********************************************************************************************/
transSceneOut:function(JAG, newScene, $Item){
	var oldScene=$(this);

	D.gD.switchingScenes=true;
	D.sD.beenHere=true;

	// MAKE SURE INVENTORY IS IN ORDER
	$(oldScene).shuffleInv(JAG);
	
	if($Item){
		var iD=$Item.data('item');
		// NEXT ATTRIBUTES (NEXT_POS, NEXT_IMAGE, NEXT_PAN)
		if(iD.next_pos) $(newScene).data('scene').ENT=''+iD.next_pos.split(',')[0].pF()+','+iD.next_pos.split(',')[1].pF()+'';
		$(newScene).data('scene').ENT_IMG=iD.next_image ? iD.next_image : false;
		$(newScene).data('scene').ENT_PAN=iD.next_pan!==false && iD.next_pan!=='false' ? iD.next_pan : false;		
	};
	
	$(oldScene).stop(true,false).fadeOut(D.sD.speed.split(',')[1].pF(), function(){
		//GIVE PAGE A CHANCE TO LOAD RESOURCES
		JAG.resetScene(JAG, newScene);

		// REMOVE DIALOGUE ELEMENTS AND CLEAR TIMERS
		$([$('#JAG_Scene_Dialogue')[0], $('#JAG_Char_Dialogue')[0], $('#JAG_Aux_Char_Dialogue')[0]]).remove();
		clearTimeout(D.sD.subtitleTimer);
	}); 
	
	return $(this);	
},




/***********************************************************************************************/
// DAY/NIGHT CYCLE
/***********************************************************************************************/
day_night:function(JAG){
	
	
	
}});