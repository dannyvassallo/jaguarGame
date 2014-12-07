/*********************************************************************************************/
// $Jaguar v1.4 || Crusader 12 || Exclusive to CodeCanyon
/*********************************************************************************************/	
(function($){
var Jaguar={
	/*********************************************************************************************/
	/*  DATABASE-STYLE REFERENCES
	*	COMMON REFERENCES:
	*	gD = GAME DATA
	*	sD = SCENE DATA
	*	cD = CHARACTER DATA
	*	D  = MASTER DATA OBJECT 
	/*********************************************************************************************/
	// REFERENCE TO HTML ELEMENTS
	OBJ:{
		$Game:false,			// MAIN GAME CONTAINER
		$Char:false,			// MAIN CHARACTER ELEMENT
		$currentScene:false,	// CURRENT SCENE LIST ITEM
		$currentChapter:false,	// CURRENT CHAPTER UL ITEM
		$currentItem:false,		// REFERENCE TO LAST CLICKED ITEM
		$selectedItem:false,	// REFERENCE TO ITEM IN ACTION (GIVE/USE)
		$canvas:false,			// CURRENT CANVAS / PATH ELEMENT
		$foreground:false,		// CURRENT SCENE FOREGROUND
		$dBar:false,			// DESCRIPTION BAR
		$Debug:false,			// DEBUG POPUP WINDOW
		$EXP:false,				// DEBUG EXP POINTS
		saveORload:false		// CURRENTLY SAVING OR LOADING A GAME
	},
	// GAME-ACHIEVABLE OBJECTS (TRUE=IN POSSESSION, FALSE=NOT IN POSSESSION)
	// STORYLINE EVENT SWITCHES	AND CONDITIONS
	Story:{
		Day:true,				// INDICATES IF DAY
		StartCycle:0,			// SYSTEM TIME THAT DAY/NIGHT CYCLE STARTED
		ActionWord:false,		// CURRENT ACTION WORD IN DESCRIPTION BAR
		joinWord:false,			// INDICATES THE JOINER WORD 'TO' OR 'WITH' IS ON
		currentSong:false,		// INDICATES NAME OF CURRENT MUSIC TRACK
		Inventory:[]			// ARRAY OF ALL INVENTORY
	},	
	/*********************************************************************************************/
	// PLUGIN SETTINGS -- USER CONFIGURABLE
	/*********************************************************************************************/	
	// GENERIC DIAGLOGUE LINES (MERGES WITH ITEMS)
	Speech:{
		give_text:	   "I don't think that will work.",
		open_text: 	   "I can't open that.",
		close_text:    "I can't close that.",
		pick_up_text:  "I can't pick that up.",
		look_at_text:  "I don't see anything special.",
		talk_to_text:  "Hmm, no response.",
		use_text: 	   "That won't work.",
		push_text: 	   "It won't budge.",
		pull_text: 	   "It isn't moving.",
		// COUNTERPART SPEECH SETTINGS WHEN INTERACTING WITH INVENTORY
		// NOTE: THERE IS NOT INV_GIVE_TEXT
		inv_open_text:    "It isn't opening.",
		inv_close_text:   "It isn't closing.",
		inv_pick_up_text: "I already have that.",
		inv_look_at_text: "I don't see anything special.",
		inv_talk_to_text: "It doesn't want to talk to me.",
		inv_use_text: 	  "That doesn't seem to work.",
		inv_push_text: 	  "It doesn't seem like that would work.",
		inv_pull_text: 	  "I don't see anything to pull.",
		// MISC
		too_far: "You're not close enough.",
		talk_no_more: "They don't seem to want to talk anymore.",
		not_ready_text: "It isn't quite ready."
	},
	// GENERIC ACTIONS OBJECT (MERGES WITH CHARACTERS AND ITEMS)
	Actions:{
		// NOTE: THERE IS NO INV_GIVE:
		give:	 	 false,		
		open:    	 false,
		inv_open:	 false,		
		close:   	 false,
		inv_close:	 false,
		pick_up: 	 false,
		inv_pick_up: false,
		look_at: 	 true,
		inv_look_at: true,
		talk_to: 	 false,
		inv_talk_to: false,
		use:     	 false,
		inv_use:	 false,
		push:    	 false,
		inv_push:	 false,
		pull:    	 false,
		inv_pull:	 false	
	},
	Character:{
		scale:'0.25,0.75',		// MINIMUM/MAXIMUM SCALABLE CHARACTER SIZE
		pos:'0,0',				// INITIAL STARTING POSITION FOR CHARACTER
		entrance:false,			// PERFORM SECONDARY ACTIONS WHEN CHARACTER ENTERS SCENE
		repeat_entrance:false,	// REPEAT SECONDARY ACTIONS ON ENTRANCE
		speed:5800,				// CHARACTER TRAVEL SPEED
		callback:false,			// FUNCTION TO CALL WHEN DONE WALKING
		action:false,			// ACTION THE CHARACTER IS PERFORMING
		text_color:'#FFF',		// DIALOGUE COLOR
		proximity:100,			// CLOSEST PIXEL DISTANCE FROM CHARACTER TO AUX CHARACTER BEFORE ACTION HAPPENS
		value:0,				// EXPERIENCE POINTS AWARED WHEN EXHAUSTED ALL QUESTIONS WITH CHARACTER
		lastValidX:0,			// LAST VALID IN-BOUNDARY X COORDINATES (BOUNDARY DETECTION)
		lastValidY:0,			// LAST VALID IN-BOUNDARY Y COORDINATES (BOUNDARY DETECTION)
		hidden:false,			// DETERMINES VISIBILITY OF CHARACTER
		done_talking:false,		// ARRAY OF SECONDARY ACTIONS TO PERFORM WHEN DONE TALKING TO CHARACTER (ALL QUESTIONS)
		direction:'right',		// CHARACTER DIRECTION
		// CHARACTER SPRITES
		image:false, up:false,	down:false,	right:false, left:false, 										// MAIN SPRITES
		give_image:false, give_up:false, give_down:false, give_right:false, give_left:false,				// GIVE SPRITES
		open_image:false, open_up:false, open_down:false, open_right:false, open_left:false,				// OPEN SPRITES
		close_image:false, close_up:false, close_down:false, close_right:false, close_left:false,			// CLOSE SPRITES
		pick_up_image:false, pick_up_up:false, pick_up_left:false, pick_up_right:false, pick_up_down:false,	// PICK UP SPRITES
		look_image:false, look_right:false, look_up:false, look_left:false, look_down:false,				// LOOK SPRITES
		talk_image:false, talk_up:false, talk_left:false, talk_right:false, talk_down:false,				// TALKING SPRITES
		use_image:false, use_up:false, use_down:false, use_left:false, use_right:false,						// USE SPRITES
		push_image:false, push_up:false, push_down:false, push_left:false, push_right:false,				// PUSH SPRITES
		pull_image:false, pull_up:false, pull_down:false, pull_right:false,	pull_left:false					// PULL SPRITES		
	},
	Scene:{
		indoor:false,			// INDICATES THAT THE SCENE IS INDOORS AND DAY/NIGHT CYCLES SHOULDN'T BE IN EFFECT
		background:false, 		// THE BACKGROUND ARTWORK FOR A SCENE
		foreground:false,		// FILE PATH TO SCENE FOREGROUND IMAGE
		speed:'500,250',		// TRANSITION SPEED FOR SCENES
		pan:false,				// PANNING SCENES (SUPPLY A % TO PAN TO)
		horizon:'50,90',		// DEFINES THE HORIZON LINE AND FOREGROUND LINE (WHICH DEFINES THE SCALING AREA OF THE CHARACTER)
		beenHere:false,			// INDICATES THE CHARACTER HAS BEEN IN THIS SCENE
		talking:false,			// INDICATES THAT A CHARACTER IS TALKING		
		subtitle:false,			// SPECIAL SUBTITLE SCENE DESCRIPTION
		subtitle_speed:'1500,0',// FADEOUT SPEED AND DELAY - HOW LONG TO SHOW THE SCENE SUBTITLE (0=INFINITY)
		subtitleTimer:false,	// TIMER TO PREVENT SCENE SUBTITLE FADING OVERLAPS
		subtitle_repeat:false,	// REPEAT SUBTITLES WHEN CHARACTER RETURNS TO SCENE?
		subtitle_color:'#FFF',	// SUBTITLE COLOR
		subtitle_pos:'bottom',	// SUBTITLE POSITION (TOP OR BOTTOM)
		subtitle_size:22,		// PIXEL SIZE ON SUBTITLE FONT
		text_time:60,			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
		value:0,				// EXPERIENCE POINTS FOR MAKING IT TO THIS SCENE
		music:false,			// LOAD SCENE-SPECIFIC MUSIC
		loop_music:true,		// LOOP SCENE MUSIC		
		// CUTSCENE SETTINGS
		type:false,				// TYPE OF SCENE (REGULAR=FALSE, OR 'CUTSCENE')
		show_inv:false,			// DETERMINES IF CUTSCENE IS FULLSCREEN
		allow_click:false,		// CLICK TO MOVE PAST CUTSCENE
		display_time:0			// TIME TO DISPLAY CUTSCENE, OR 0 FOR DISABLED
	},
	Item:{
		scale:1,
		type:false,				 // REFERS TO TYPE OF SCENE ITEM - CHARACTER, OBJECT, EXIT
		exit_style:'true,true',  // DETERMINES WHETHER AN EXIT ITEM (EXITS ON COLLISION, EXITS ON DOUBLE-CLICK)
		goto:false,				 // EXIT ITEMS - SIGNALS WHAT SCENE TO EXIT TO
		pos:'0,0',				 // INITIAL STARTING POSITION FOR ITEM 
		next_pos:false,			 // ASSIGNED TO EXIT ITEMS FOR SPECIAL NEXT-SCENE ENTRANCE POSITIONS
		next_image:false,		 // IMAGE TO ASSIGN CHARACTER WHEN USING THIS EXIT ITEM TO ENTER NEXT SCENE
		next_pan:false,			 // ASSIGN A SPECIAL PAN_TO % VALUE FOR NEXT SCENE
		hidden:false,			 // VISIBILITY OF ITEM
		text:false,				 // TEXT TO DISPLAY WHEN ITEM IS HOVERED (ITEM NAME)
		value:0,				 // EXPERIENCE POINTS GIVEN FOR OBTAINING THIS ITEM
		proximity:100,			 // CLOSEST PIXEL DISTANCE FROM CHARACTER TO ITEM BEFORE ACTION HAPPENS		
		from_scene:false		 // THE NAME OF THE SCENE THAT THIS ITEM STARTED IN
	},


	
/***********************************************************************************************/
// INITIALIZE
/***********************************************************************************************/
init:function(options){
	var	$GAME=$(this), 
		JAG=Jaguar,
		o=options,
		$head=$('head');
		
	// ADD JAGUAR CLASSES
	$GAME.addClass('JAG_Adventure').find('ul').addClass('JAG_Chapter').end().find('li').addClass('JAG_Scene');
		
	// SAVE GLOBALS AND SETUP REFERENCES		
	var gD=$GAME.data(),
		Chapters=$GAME.find('ul.JAG_Chapter'), 
		Scenes=Chapters.find('li.JAG_Scene');
	
	// MASTER SETTINGS PASSED IN THROUGH THE PLUGIN CALL
	gD.title=o.title ? o.title : false;
	gD.debugkey=o.debug_key ? o.debug_key.pF() : 27;
	gD.menuKey=o.menu_key ? o.menu_key.pF() : 117;
	gD.dayLength=o.day_night_cycle ? o.day_night_cycle.split(',')[0].pF() : false;
	gD.nightLength=o.day_night_cycle ? o.day_night_cycle.split(',')[1].pF() : false;
	gD.dayTransitionTime=o.day_night_cycle ? o.day_night_cycle.split(',')[2].pF() : false;
	gD.startScene=(o.start_scene && $('#'+o.start_scene.replace(/ /g,'')).length) ? $('#'+o.start_scene.replace(/ /g,'')) : false;
	gD.load_text=o.preloader_text ? o.preloader_text : 'loading...';
	gD.preload_time=o.preloader_time ? o.preloader_time.pF() : 500;
	gD.text_follow=o.text_follow ? o.text_follow : true;
	gD.experience=0;
	
	// SETUP OBJECT REFERENCES
	JAG.OBJ.$currentChapter=$(Chapters[0]);
	JAG.OBJ.$Game=$GAME;
	JAG.OBJ.$currentScene=gD.startScene ? gD.startScene[0] : Scenes[0];

	// BUILD INVENTORY PANELS
	$GAME.buildInv(JAG);

	// ADD SOUND_EFFECT TAG AND MUSIC_TAG (IPAD SUCKS)
	$GAME.append('<audio id="JAG_Music" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio><audio id="JAG_Effect" src="Jaguar/audio/blank.mp3" preload="auto" type="audio/mpeg"></audio>')
	
	// SETUP DAY/NIGHT CYCLES
	.find('ul:first').find('li').prepend('<div class="JAG_DayNightCycle"/>');
	gD.StartCycle=new Date().getTime();
	
	dayNight=function(){
		var DayNightTimer=setInterval(function(){
			// GET CURRENT TIME AND COMPARE TO START TIME
			var currentTime=new Date().getTime(),
				elapsed=currentTime-gD.StartCycle;
			if(elapsed > (JAG.Story.Day ? gD.dayLength : gD.nightLength)){ 
				$('div.JAG_DayNightCycle').stop(true,false).animate({opacity:JAG.Story.Day ? 0.85 : 0},
				{duration:gD.dayTransitionTime.pF(),queue:false,complete:function(){
					JAG.Story.Day=JAG.Story.Day ? false : true;
					dayNight();				
				}});
				clearInterval(DayNightTimer);
			};
		},100);
	};
	if(o.day_night_cycle){ dayNight(); };
	
	// PRELOAD GAME COMPONENTS
	$GAME.on('click.JAG_initStart',function(){
		// DISABLE INITIAL CLICK (TO AUTPLAY MUSIC)
		$GAME.off('click.JAG_initStart')
		
		// HACK IT UP FOR THE IPAD AUTOPLAY
		$('#JAG_Music')[0].play(); $('#JAG_Effect')[0].play();

		// HIDE TEASER
		$('#teaser_container').animate({'opacity':0},{duration:200,queue:false,complete:function(){ 
			$(this).remove(); 

			// PRELOAD GAME
			JAG.preloadGame(JAG);
		}});
	});
		
	// DISABLE DRAGGING AND CONTEXT MENU
	$GAME.on('dragstart',function(e){ return false; })
	
	// KEY EVENTS
	$(window).on('keyup',function(e){
		var code=e.keyCode||e.which,
			sceneType=D.sD.type ? D.sD.type.toLowerCase().replace(/ /g,'') : false;
			
		// DON'T ALLOW ON CUTSCENES OR PRELOADER SCREENS
		if($('div.JAG_Preloader').length || sceneType==='cutscene') return;
			
		// DEBUG WINDOW - OPEN WITH ESC
		if(code==gD.debugkey) JAG.OBJ.$currentScene.debug(JAG);
		
		// SETUP SAVE/LOAD CAPABILITIES - F6 BY DEFAULT 
		//if(code==D.gD.menuKey) D.$Game.openMenu(JAG); 
	});
},




/***********************************************************************************************/
// SCENE RESETS (BETWEEN TRANSITIONS)
/***********************************************************************************************/
resetScene:function(JAG, scene){
	// MUST USE A DUAL RESET REFERENCE OBJECTS
	JAG.OBJ.$foreground=false;
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$currentScene=$(scene);
	JAG.OBJ.$currentChapter=$(scene).parents('ul.JAG_Chapter:first');
	JAG.OBJ.$Char=$(scene).find('div.JAG_Char').length ? $(scene).find('div.JAG_Char') : false;
	JAG.OBJ.$currentItem=false;
	JAG.OBJ.$selectedItem=false;	
	JAG.Story.joinWord=false;
	
	// REFERENCE OBJECTS
	var cD=JAG.OBJ.$Char ? JAG.OBJ.$Char.data('character') : false,
		sD=JAG.OBJ.$currentScene.data('scene'),
		gD=JAG.OBJ.$Game.data();

	// STOP CURRENT SOUND EFFECTS
	$('#JAG_Effect')[0].src="";		
	
	// SAVED GAME INFORMATION
	gD.viewportW=0;				// REFERENCE TO VIEWPORT HEIGHT
	gD.viewportH=0;				// REFERENCE TO VIEWPORT HEIGHT
	gD.switchingScenes=false; 	// TRANSITIONING SCENES
	gD.showingDebug=false;		// DEBUG PANEL OPEN/CLOSED STATUS
	
	// SAVED SCENE INFORMATION
	sD.pathData=false;			// THE ARRAY OF BLACK/WHITE PIXELS TO CHECK PATH AGAINST
	sD.sceneW=0;				// REFERENCE TO SCENE WIDTH
	sD.sceneH=0;				// REFERENCE TO SCENE HEIGHT
	sD.panPos=0;				// CURRENT MARGIN-LEFT (SCENE PANNING POSITION)
	sD.talking=false;			// REFERENCE TO CHARACTERS TALKING
	sD.text_time=60;			// CONTROLS THE SPEED THAT TEXT IS AVAILABLE TO READ (PER CHARACTER)
	
	// SAVED CHARACTER INFORMATION
	if(cD){
		cD.walking=false;			// REFERENCE TO WALKING STATE OF CHARACTER
		cD.CharW=0;					// CHARACTER WIDTH
		cD.CharH=0;					// CHARACTER HEIGHT
		cD.CharX=0;					// CHARACTER LEFT
		cD.CharY=0;					// CHARACTER TOP
		cD.CharORG_W=0;				// ORIGINAL CHARACTER SPRITE WIDTH
		cD.CharORG_H=0;				// ORIGINAL CHARACTER SPRITE HEIGHT
		cD.action=false;			// ACTION IS BEING PERFORMED
		cD.callback=false;			// CANCEL ANY CALLBACK ACTIONS
	};
		
	// MARK INITIAL SYSTEM TIME
	sD.startTime=new Date().getTime();
	
	// ORGANIZE INVENTORY, REMOVE HANDLERS AND LOAD SCENE
	$(scene).off('mousemove click dblclick').loadScene(JAG);
},




/***********************************************************************************************/
// PULL AND MERGE DATA FOR ALL OBJECTS
/***********************************************************************************************/
getDATA:function(JAG){
	// TO ALLOW FOR EASIER GAME BUILDING, SOME SETTINGS CAN BE APPLIED AT HIGHER LEVELS
	// TO AFFECT ALL LEVELS BELOW IT. EXAMPLE: IMAGE CAN BE APPLIED TO A CHAPTER TO
	// APPLY THE CHARACTER IMAGE TO ALL SCENES IN THE CHAPTER. MERGE OBJECTS TO ACCOMPLISH THIS
	var	$Char=JAG.OBJ.$Char,
		chptD=JAG.OBJ.$currentChapter.data('chapter'),
		gD=JAG.OBJ.$Game.data(),
		temp_cD=$Char ? $Char.data('character') : false,
		cD=$.extend({}, JAG.Character, !chptD?{}:chptD||{}, !temp_cD?{}:temp_cD||{} ),
		$Scene=JAG.OBJ.$currentScene,
		temp_sD=$Scene.data('scene'),
		sD=$.extend({}, JAG.Scene, !temp_sD?{}:temp_sD||{} );

	// UPDATE MERGED DATA
	if($Char) $Char.data('character',cD);
	JAG.OBJ.$currentScene.data('scene',sD);
	
	return D={
		$Game:JAG.OBJ.$Game, 
		$Chapter:JAG.OBJ.$currentChapter,
		$Scene:$Scene, 
		$Char:$Char,
		gD:gD, chptD:chptD, sD:sD, cD:cD};
},





/***********************************************************************************************/
// PRELOAD GAME
/***********************************************************************************************/
preloadGame:function(JAG){
	// FIND ALL SCENE IMAGES AND LOAD THEM INITIALLY
	var $Game=JAG.OBJ.$Game,
		$Scenes=$Game.find('li.JAG_Scene'),
		numScenes=$Scenes.length,
		imgsArray=[],
		preL=new Image(),
		src='Jaguar/images/preloader.gif';
		
	// ADD PRELOADER IMAGE TO VIEWPORT
	$(preL).one('load',function(){
		$Game.prepend('<div class="JAG_Preloader"><img src="'+src+'"><p>'+$Game.data().load_text+'</p></div>');
		
		// PUSH IMAGES TO ARRAY
		for(var i=0; i<numScenes; i++) imgsArray.push('Jaguar/scenes/'+$($Scenes[i]).data('scene').background+'.png');
    	var count=imgsArray.length, 
			loaded=0,
			// SAVE STARTING TIME FOR DELTA
			startGameTime=new Date().getTime();			

		// LOOP THROUGH IMAGES ARRAY
    	$(imgsArray).each(function(){
        	$('<img>').attr('src', this).one('load',function(){
	            loaded++;
				
				// LAUNCH
        	    if(loaded===count){
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
						if(elapsed >= $Game.data().preload_time.pF()/1000){
							$('div.JAG_Preloader').animate({opacity:0},{duration:500,queue:false,complete:function(){
								$('div.JAG_Preloader').remove();
								$([$('div.JAG_Actions')[0],$('ul.JAG_Chapter')[0],$('div.JAG_Inventory')[0]]).css('display','block');
								JAG.resetScene(JAG, JAG.OBJ.$currentScene);
							}});
							clearTimeout(preloaderTimer);
						// OTHERWISE LOOP AGAIN
						}else{
							var diff=(new Date().getTime()-startTime)-currentTime;
						    window.setTimeout(instance,(100-diff));
						};
						
					};
					var preloaderTimer=setTimeout(instance,100);
				};
			});
	    });
	})[0].src=src;
}};




/***********************************************************************************************/
// PLUGIN DEFINITION
/***********************************************************************************************/
$.fn.Jaguar=function(method,options){
	if(Jaguar[method]){ return Jaguar[method].apply(this,Array.prototype.slice.call(arguments,1));
	}else if(typeof method==='object'||!method){ return Jaguar.init.apply(this,arguments);
	}else{ $.error('Method '+method+' does not exist'); }
}})(jQuery);

/* EXTEND NATIVE CLASSES */
String.prototype.removeWS=function(){return this.toString().replace(/\s/g, '');};
String.prototype.pF=function(){return parseFloat(this);};
Number.prototype.pF=function(){return parseFloat(this);};
String.prototype.sP=function(splitter,key){return this.toString().split(splitter)[key];};
String.prototype.isB=function(){return this.toString()=="true"?true:false;};
Boolean.prototype.isB=function(){return (this==true)?true:false;};