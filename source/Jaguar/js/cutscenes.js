/***********************************************************************************************/
// Jaguar - CUTSCENES MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// Jaguar - LOAD CUTSCENE
/***********************************************************************************************/
loadCutScene:function(JAG){

	var	src='Jaguar/scenes/'+D.sD.background,
		foreG=D.sD.foreground ? 'url(Jaguar/scenes/'+D.sD.foreground+'.png)' : false,
		img=new Image();

	// SET VIEWPORT DIMENSIONS
	D.gD.viewportW=D.$Chapter.outerWidth(); 
	D.gD.viewportH=D.$Chapter.outerHeight();

	// LOAD CUTSCENE
	$(img).one('load',function(){
		// SAVE CUTSCENE DIMENSIONS
		D.sD.sceneW=this.width; 
		D.sD.sceneH=this.height;
		
		// BACKGROUND
		if(!D.$Scene.find('img.JAG_Background').length) $('<img src="'+src+'.png" class="JAG_Background"/>').appendTo(D.$Scene);
				
		// FOREGROUND
		if(foreG){
			if(!D.$Scene.find('div.JAG_Foreground').length) $('<div class="JAG_Foreground" style="background:'+foreG+'"></div>').appendTo(D.$Scene);
			JAG.OBJ.$foreground=D.$Scene.find('div.JAG_Foreground');
		};
		
		// SUBTITLES
		if(D.sD.subtitle && (!D.sD.beenHere || (D.sD.beenHere && D.sD.subtitle_repeat.isB()))){
			var subDelay=D.sD.subtitle_speed.split(',')[1].pF(),
				subPos=D.sD.subtitle_pos==='top' ? '5%' : D.sD.subtitle_pos==='middle' ? '48%' : '85%';
			D.$Scene.prepend('<p id="JAG_Scene_Dialogue" style="font-size:'+D.sD.subtitle_size.pF()+'px;color:'+D.sD.subtitle_color+';top:'+subPos+'">'+D.sD.subtitle+'</p>');
			if(subDelay>0) D.sD.subtitleTimer=setTimeout(function(){
				 $('#JAG_Scene_Dialogue').fadeOut(D.sD.subtitle_speed.split(',')[0].pF()) }, subDelay );
		};
		
		// SETUP DISPLAY TIMER BEFORE PROGRESSING
		if(D.sD.display_time.pF() > 0){
			// SECRECT MAGIC SAUCE FOR SYSTEM BASED ACCURATE JAVASCRIPT TIMING
			// COMPARE THE CURRENT TIME AGAINST THE INITIAL TIME TO FIND THE DELTA
			var startTime=new Date().getTime(),
			    currentTime=0,
				elapsed='0.0';

			function instance(){
				currentTime+=100;
				elapsed=Math.floor(currentTime/100)/10;
			    if(Math.round(elapsed)==elapsed){ elapsed += '.0'; };

				// TEST TO ADVANCE TO NEXT SCENE
				if(elapsed >= D.sD.display_time.pF()/1000){
					D.$Scene.transSceneOut(JAG, D.$Scene.next('li'), false);
					clearTimeout(cutSceneTimer);
				}else{
					var diff=(new Date().getTime()-startTime)-currentTime;
				    window.setTimeout(instance,(100-diff));					
				};
			};
			var cutSceneTimer=setTimeout(instance,100);
		};
		
		// FULLSCREEN CUTSCENE
		D.$Scene.add(JAG.OBJ.$currentChapter).css('height',D.sD.sceneH+'px');
		$('div.JAG_Panel').add($('div.JAG_Desc')).css('display',!D.sD.show_inv ? 'none' : 'block');
		
		// TRANSITION CUTSCENE
		D.$Scene.transSceneIn(JAG);
		
		// SCENE EVENTS
		D.$Scene.on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();
			
			// RESOLVE TARGET (CAN CLICK INNER ELEMENT IMAGES)
			var $tar=$(e.target);

			// HANDLE EVENT TYPES		
			switch(e.type){

				// SINGLE CLICK
				case 'click':
					// ADVANCED TO NEXT SCENE IF PERMITTED
					if(D.sD.allow_click.isB()){
						JAG.OBJ.$currentScene=D.$Scene.next('li')[0];

						// LAUNCH
						D.$Scene.transSceneOut(JAG, D.$Scene.next('li'), false);
					};
				break;
			};
		});

		// LOAD CUTSCENE ELEMENTS
		D.$Scene.loadItems(JAG);
	})[0].src=src+'.png';	
	
	return $(this);	
}



});