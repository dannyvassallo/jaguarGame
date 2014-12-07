/***********************************************************************************************/
// Jaguar - CHARACTERS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// MAIN CHARACTER LOADING - $scene.loadChar(JAG);
/***********************************************************************************************/
loadChar:function(JAG){
	// SETUP SPRITES FOR THIS SCENE
	var scale=D.cD.scale.split(','),
		CharImg=new Image(), 
		src=D.sD.ENT_IMG ? 'Jaguar/chars/'+D.sD.ENT_IMG+'.gif' : $(CharImg).loadSprite(JAG, D.cD, 'stopping');

	// LOAD SPRITE
	$(CharImg).one('load',function(){
		// POSITION (EXIT ITEMS USING NEXT_POS) - ACCOUNT FOR REPEAT WALK_INS
		var X=D.sD.ENT ? D.sD.ENT.split(',')[0].pF() : D.cD.pos.split(',')[0].pF(),
			Y=D.sD.ENT ? D.sD.ENT.split(',')[1].pF() : D.cD.pos.split(',')[1].pF(),
			W=this.width+'px', H=this.height+'px';

		// INSERT CHARACTER AND SAVE DATA
		D.$Char.css({width:W, height:H, left:X+'%', top:Y+'%'}).html('<img src='+src+' class="JAG_Char_Img">');
		D.cD.CharORG_W=W; 
		D.cD.CharORG_H=H;
		D.cD.CharX=D.sD.pan ? D.sD.sceneW * (X/100) : D.gD.viewportW * (X/100);
		D.cD.CharY=D.gD.viewportH*(Y/100);
		D.cD.CharW=D.$Char.outerWidth(); 
		D.cD.CharH=D.$Char.outerHeight();
		D.sD.ENT=false;	
		D.sD.ENT_IMG=false;

		// SCALE CHARACTER
		D.$Char.scale(JAG);
			
		// PERFORM ENTRANCE SECONDARY ACTIONS
		if(D.cD.entrance!=='completed') D.$Char.actionLoop(JAG, D.cD.entrance, 'entrance');	
		
		// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
		if(!D.$Char.next('p').hasClass('JAG_Char_Dialogue')) $('<p class="JAG_Char_Dialogue"></p>').insertAfter(D.$Char);
	})[0].src=src;
	
	return $(this);
},




/***********************************************************************************************/
// AUXILLIARY CHARACTER LOADING - $scene.loadAuxChars(JAG);
/***********************************************************************************************/
loadAuxChars:function(JAG){
	var AuxChars=D.$Scene.find('div.JAG_Aux_Char');

	// THIS SCENE CONTAINS AUX CHARACTERS
	if(AuxChars.length){
		// USE .EACH TO KEEP EACH ITERATION WITHIN SCOPE
		AuxChars.each(function(i){
			// SETUP CHARACTER SPRITES FOR THIS SCENE
			var $AuxChar=$(AuxChars[i]),
				AuxCharImg=new Image(),
				temp_AcD=$AuxChar.data('character'),
				AcD=$.extend({}, JAG.Character, !temp_AcD?{}:temp_AcD||{} ),
				src='Jaguar/chars/'+AcD.image+'.gif';
			// UPDATE NEW AUX CHARACTER DATA
			$AuxChar.data('character',AcD);

			// LOAD SPRITE
			$(AuxCharImg).on('load',function($AuxChar){
				// SPRITE POSITION (EXIT ITEMS USING NEXT_POS - ACCOUNT FOR CHARACTER WALK-IN REPEATS
				var $AuxChar=$(AuxChars[i]),
					X=AcD.pos.split(',')[0].pF(), 
					Y=AcD.pos.split(',')[1].pF(),
					W=this.width+'px', H=this.height+'px';

				// INSERT CHARACTER
				$AuxChar.css({width:W, height:H, left:X+'%', top:Y+'%', visibility:AcD.hidden.isB() ? 'hidden' : 'visible'}).html('<img src='+src+' class="JAG_Aux_Char_Img">');

				// ASSIGN .TEXT NAME AS THE ID OF CHARARACTER
				if(AcD.text) $AuxChar.attr('id','JAG_ID_'+AcD.text.toLowerCase().replace(/ /g,''));

				// SAVE CURRENT CHARACTER DATA
				AcD.CharORG_W=W; 
				AcD.CharORG_H=H;
				AcD.CharX=D.sD.pan ? D.sD.sceneW * (X/100) : D.gD.viewportW * (X/100);
				AcD.CharY=D.gD.viewportH*(Y/100);
				AcD.CharW=$AuxChar.outerWidth(); 
				AcD.CharH=$AuxChar.outerHeight();

				// SCALE CHARACTER
				$AuxChar.scale(JAG);
		
				// CHECK TO MAKE SURE CHARACTER IS LAYERED CORRECTLY		
				var $sceneItems=D.$Scene.find('.JAG_Item');
				$AuxChar.layerItem($sceneItems, $sceneItems.length, AcD.CharY, $AuxChar.outerHeight(true));

				// CHARACTER ENTRANCE SECONDARY ACTIONS
				if(AcD.entrance!=='completed') $AuxChar.actionLoop(JAG, AcD.entrance, 'entrance');	

				// INSERT DIALOGUE ELEMENT DIRECTLY AFTER CHARACTER
				if(!$AuxChar.next('p').hasClass('JAG_Char_Dialogue')) $('<p class="JAG_Char_Dialogue"></p>').insertAfter($AuxChar);
			})[0].src=src;			
		});		
	};

	return $(this);
},




/***********************************************************************************************/
// CHARACTER WALKING - $Char.walk(JAG, toX, toY);
/***********************************************************************************************/
walk:function(JAG, toX, toY){
	var $Char=$(this),
		cD=$Char.data('character'),
		mL=D.sD.pan ? Math.abs(D.sD.panPos.pF()) : 0,
		// CALCULATING NEW CHARACTER POSITION 
		oldX=cD.CharX, oldY=cD.CharY,			
		X=Math.round(toX+mL), Y=toY, 
		distX=Math.max(X,oldX) - Math.min(X,oldX), 
		distY=Math.max(Y,oldY) - Math.min(Y,oldY),
		AuxChar=$Char.hasClass('JAG_Aux_Char'),
		avgSpeed=(((Math.max(distX,distY)/(1000/(cD.speed.pF()/1000)))).toFixed(2).pF())*1000,

		// SELECT MIDDLEGROUND ITEMS, AUX CHARACTERS
		$sceneItems=D.$Scene.find('div.JAG_Item');

		// CREATE ARRAY OF EXIT ITEMS FOR PRIMARY CHARACTER COLLISION
		if(!AuxChar){
			var	exitItems=[];
			// LOOP THROUGH $SCENEITEMS AND FIND EXIT ITEMS
			for(var i=0, l=$sceneItems.length; i<l; i++){
				// EXIT ITEM NOT IN ARRAY
				if($($sceneItems[i]).data('item').type==='exit' && $($sceneItems[i]).css('visibility')==='visible'){
					if($.inArray($($sceneItems[i]), exitItems) === -1) exitItems.push($($sceneItems[i]));
				};
			};
		};

		// ADD CHARACTERS TO SCENEITEMS
		if(D.$Scene.find('div.JAG_Aux_Char').length) var $sceneItems=$sceneItems.add(D.$Scene.find('div.JAG_Aux_Char'));

		// UPDATE DIRECTION OF MOVEMENT WHEN WALKING
		if(distY>distX && Y!==oldY){ cD.direction=(Y>oldY) ? 'down' : 'up';
		}else if(distY<distX && X!==oldX){ cD.direction=(X>oldX) ? 'right' : 'left'; };
		
		// SET SPRITE
		var walkingImg=new Image(), 
			src=$Char.loadSprite(JAG, cD, 'walk_to');
		
		
	/*** LOAD SPRITE ***/
	$(walkingImg).on('load',function(){
		cD.walking=true;		

		$Char.find('img').attr('src',src).end().stop(true,false).animate({left:X+'px', top:Y+'px'},
			{duration:avgSpeed, queue:false, specialEasing:{top:'linear',left:'linear'},

			// CHARACTER WALKING EVENTS
			progress:function(a,p,c){
				var $Item=JAG.OBJ.$currentItem,
					CW=$Char.outerWidth(),  // DO NOT INCLUDE MARGIN/PADDING
					CH=$Char.outerHeight(), // DO NOT INCLUDE MARGIN/PADDING
					pos=$Char.position();	

				// CHECK BOUNDARIES  // SCALE CHARACTER  // HANDLE MIDDLEGROUND OBJECT LAYERING
				$Char.inBounds(JAG); $Char.scale(JAG); $Char.layerItem($sceneItems, $sceneItems.length, pos.top, $Char.outerHeight(true));

				// MATCH CHARARACTER TEXT TO WHEN THEY WALK
				if(D.gD.text_follow && $Char.next('p.JAG_Char_Dialogue').is(':visible')) $Char.next('p.JAG_Char_Dialogue').textDims(JAG, $Char, cD);

				// ONLY MAIN CHARACTER EVENTS
				if(!AuxChar){
					// LEAVE SCENE - IF CHARACTER COLLIDES WITH EXIT ITEM
					// DO NOT CALL IN 100PX [WHEN CHARACTER MAY BE STANDING ON EXIT] 
					if(exitItems.length && (p*Math.max(distX, distY)>100)) $Char.collision(JAG, exitItems);
					
					// PANNING (ONLY FOR MAIN CHARACTER)
					if(D.sD.pan){
						var panPos=D.sD.panPos,
							refPoint=$Char.offset().left+(cD.CharW.pF()/2)-D.gD.offsetX,
							leftSide=refPoint<D.gD.viewportW/2,
							totalPan=D.sD.sceneW-D.gD.viewportW,
							buffer=20, // USING CSS EASING CAUSING ADDITIONAL SHIFT, USE BUFFER
							amountToMove=Math.ceil(cD.speed.pF()/(D.gD.viewportW/(distX/100)).pF());
						if(cD.direction==='left' && leftSide && panPos<-buffer){ panPos+=amountToMove;
						}else if(cD.direction==='right' && !leftSide && panPos>-(totalPan-buffer)){ panPos-=amountToMove; };
						// CHECK FULL LEFT PAN (0) AND FULL RIGHT PAN (TOTALPAN)
						if(panPos>0) panPos=0;
						if(panPos>D.sD.sceneW) panPos=D.sD.sceneW;

						// APPLY NEW PAN POSITION
						D.sD.panPos=panPos; 
						D.$Scene.css('margin-left', panPos);
					};
				};
				
			/*** STOP WALKING ***/
			},complete:function(){
				cD.walking=false;
				$Char.stopWalking(JAG);
		}});
	})[0].src=src;
	
	return $(this);	
},




/***********************************************************************************************/
// CHARACTER STOPPING - $Char.stopWalking(JAG);
/***********************************************************************************************/
stopWalking:function(JAG){
	D.cD.walking=false;
	
	var	$Char=$(this),
		cD=$Char.data('character');

		// LOAD STOPPED SPRITE
		stopImg=new Image(),
		src=$Char.loadSprite(JAG, cD, 'stopping');
	
	// LOAD STOPPED MOVEMENT SPRITE
	$(stopImg).on('load',function(){
		$Char.find('img')[0].src=src;

		// GET PROXIMITY (OF AUX CHARACTER ITEM)
		var $Item=JAG.OBJ.$currentItem;

		// RUN ACTION CALLBACK (ACTIONS), RESET WHEN DONE
		if(cD.action && typeof cD.callback==='function'){
			// IF AN ITEM IS SUPPLIED, FIND THE PROXIMITY
			if($Item){
				var itemType=$Item.hasClass('JAG_Aux_Char') ? 'character' : 'item',
					iD=$Item.data(itemType),
					proximity=iD.proximity.pF();
					// GET CURRENT DISTANCE
					$Char.returnDist($Item);
			
				// FACE THE OBJECT
				if(Diff.X > Diff.Y){ 
					cD.direction=Diff.Left ? 'right' : 'left';
				}else{
					cD.direction=Diff.Higher ? 'down' : 'up'; 
				};
	
				// LOAD THE CORRECT SPRITE
				$Char.find('img')[0].src=$Char.loadSprite(JAG, cD, 'stopping');
					
				// PERFORM ACTION IF CLOSE ENOUGH
				if(proximity > Diff.X && proximity > Diff.Y){
					cD.callback.apply();
				// SAY YOU AREN'T CLOSE ENOUGH
				}else{
					$Char.saySomething(JAG, $Char, JAG.Speech.too_far)
				};

			// ENTRANCES DON'T USE ITEMS
			}else{
				cD.callback.apply();
			};
		};
		
		cD.callback=false;	
		cD.action=false;
	})[0].src=src;
	
	return $(this);	
},




/***********************************************************************************************/
// SPRITE SWAPPING - $Char.loadSprite(JAG, cD, type);
/***********************************************************************************************/
loadSprite:function(JAG, cD, type){
	var $Char=$(this);

	switch(type){
		case 'walk_to': var initSprite=cD.image, 
							right=cD.right ? cD.right.split(',')[0] : false, left=cD.left ? cD.left.split(',')[0] : false, 
							up=cD.up ? cD.up.split(',')[0] : false, down=cD.down ? cD.down.split(',')[0] : false; 
		break;	
		case 'stopping': var initSprite=cD.image,
							right=cD.right ? cD.right.split(',')[1] : false, left=cD.left ? cD.left.split(',')[1] : false,
							up=cD.up ? cD.up.split(',')[1] : false, down=cD.down ? cD.down.split(',')[1] : false;
		break;			
		case 'give': 	var initSprite=cD.give_image, 
							right=cD.give_right, left=cD.give_left, 
							up=cD.give_up, down=cD.give_down;	
		break;
		case 'open':	var initSprite=cD.open_image, 
							right=cD.open_right, left=cD.open_left, 
							up=cD.open_up, down=cD.open_down;	
		break;
		case 'close':	var initSprite=cD.close_image, 
							right=cD.close_right, left=cD.close_left, 
							up=cD.close_up, down=cD.close_down; 
		break;
		case 'pick_up': var initSprite=cD.pick_up_image,
							right=cD.pick_up_right, left=cD.pick_up_left, 
							up=cD.pick_up_up, down=cD.pick_up_down;		
		break;	
		case 'look_at': var initSprite=cD.look_image,
							right=cD.look_right, left=cD.look_left,
							up=cD.look_up, down=cD.look_down;		
		break;
		case 'talk_to': var initSprite=cD.talk_image, 
							right=cD.talk_right, left=cD.talk_left, 
							up=cD.talk_up, down=cD.talk_down;	
		break;
		case 'use':		var initSprite=cD.use_image, 
							right=cD.use_right, left=cD.use_left, 
							up=cD.use_up, down=cD.use_down;	
		break;
		case 'push':	var initSprite=cD.push_image, 
							right=cD.push_right, left=cD.push_left, 
							up=cD.push_up, down=cD.push_down;	
		break;
		case 'pull':	var initSprite=cD.pull_image, 
							right=cD.pull_right, left=cD.pull_left, 
							up=cD.pull_up, down=cD.pull_down;	
		break;
	};

	// DIRECTIONAL SPRITE	
	switch(cD.direction){
		case 'right': var stillSprite=right ? right : initSprite; break;
		case 'left' : var stillSprite=left  ? left  : initSprite;  break;
		case 'up'   : var stillSprite=up    ? up    : initSprite;  break;
		case 'down' : var stillSprite=down  ? down  : initSprite; break; 
	};

	// SOME [DEFAULT] SETTINGS MAY NOT BE SET - FALL BACK TO CURRENT
	if(!stillSprite) var stillSprite=$Char.find('img').attr('src').replace('Jaguar/chars/','').replace('.gif','');
		
	// RETURN THE SRC
	return 'Jaguar/chars/'+stillSprite+'.gif';	

}});