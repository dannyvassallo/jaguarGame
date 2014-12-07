/***********************************************************************************************/
// Jaguar - PRIMARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// ITEM ACTION (CHARACTERS AND ITEMS) - $obj.Action(JAG, itemType, callback, inInv);
// D.cD.action is checked and set to false inside the stopWalking callback
/***********************************************************************************************/
Action:function(JAG, itemType, callback, inInv){
	// DROP OUT OF METHOD
	if(D.cD.action || D.gD.switchingScenes || D.sD.talking) return;

	// MERGE DATA	
	var $Char=D.$Char,
		$Item=$(this),
		iD_Tmp=$Item.data(itemType);
	$Item.data(itemType, $.extend({}, JAG.Speech, JAG.Actions, !iD_Tmp?{}:iD_Tmp||{} ));
	var iD=$Item.data(itemType);

	// SET ACTION STATE IF USING CALLBACK
	if(callback) D.cD.action=true;		

	// CALL CORRECT ACTION
	switch(JAG.Story.ActionWord.toLowerCase().replace(/ /g,'')){
		case 'give':
			// TEST FOR JOINER WORD (3-CLICK VERB)
			if(JAG.Story.joinWord){
				if(callback){ 
					D.cD.callback=function(){ $Char.give(JAG, $Item); };
				}else{ 
					$Char.give(JAG, $Item); 
				};
			// UPDATE DESCRIPTION BAR TO GIVE ITEM TO
			}else{
				$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
				JAG.Story.joinWord=true;
			};
		break;
		
		case 'open': 
			if(callback){ D.cD.callback=function(){ $Char.open(JAG, $Item, iD, inInv); };
			}else{ $Char.open(JAG, $Item, iD, inInv); };
		break;
		
		case 'close': 
			if(callback){ D.cD.callback=function(){ $Char.close(JAG, $Item, iD, inInv); };
			}else{ $Char.close(JAG, $Item, iD, inInv); };
		break;
		case 'pickup': 
			if(callback){ D.cD.callback=function(){ $Char.pick_up(JAG, $Item, iD, inInv); };
			}else{ $Char.pick_up(JAG, $Item, iD, inInv); };
		break;
		
		case 'lookat':
			if(callback){ D.cD.callback=function(){ $Char.look_at(JAG, $Item, iD, inInv); };
			}else{ $Char.look_at(JAG, $Item, iD, inInv); };
		break;

		case 'talkto':
			if(callback){ D.cD.callback=function(){ $Char.talk_to(JAG, $Item, iD, inInv); };
			}else{ $Char.talk_to(JAG, $Item, iD, inInv); };
		break;

		case 'use':
			var $AuxItem=JAG.OBJ.$currentItem,
				itemName=$Item[0].id.toLowerCase().replace(/ /g,'').replace('jag_id_',''),
				inInv=JAG.Story.Inventory.indexOf(itemName) >= 0;

			console.log("use")
			console.log(!JAG.OBJ.$selectedItem)
			console.log(!inInv)
			
			// USE A SCENE ITEM DIRECTLY
			if(!inInv && !JAG.OBJ.$selectedItem){
				D.cD.callback=function(){ $Char.useScene(JAG, $Item, iD); };

			// USE INVENTORY ITEM WITH...
			}else{
				// TEST FOR JOINER WORD (3-CLICK VERB)
				console.log(JAG.Story.joinWord)
				
				if(JAG.Story.joinWord){
					$Char.useInv(JAG, $Item, iD, inInv); 
				// UPDATE DESCRIPTION BAR TO USE ITEM WITH
				}else{
					JAG.Story.joinWord=true;
					$Item.updateBar(JAG, 'click', 'item', ' '+iD.text);
				};
			};
		break;	
			
		case 'push':
			if(callback){ D.cD.callback=function(){ $Char.push(JAG, $Item, iD, inInv); };
			}else{ $Char.push(JAG, $Item, iD, inInv); };
		break;
		
		case 'pull':
			if(callback){ D.cD.callback=function(){ $Char.pull(JAG, $Item, iD, inInv); };
			}else{ $Char.pull(JAG, $Item, iD, inInv); };
		break;
	};
	
	return $(this);	
},



/***********************************************************************************************/
// GIVE - $Char.give(JAG, $Item, iD, inInv);
/***********************************************************************************************/
give:function(JAG, $Item){
	var $target=JAG.OBJ.$currentItem,
		invItemName=JAG.OBJ.$selectedItem[0].id.toLowerCase().replace(/ /g,'').replace('jag_id_',''),
		iD=JAG.OBJ.$selectedItem.data('item'),
		inInv=JAG.Story.Inventory.indexOf(invItemName) >= 0;
		
	// CAN'T GIVE ITEMS TO OTHER ITEMS
	if($target.hasClass('JAG_Item')) var inInv=false;

	// GIVE ITEM IN INVENTORY
	if(inInv){
		// LOOP THROUGH GIVE COMMANDS AND FIND WHO TO GIVE THE ITEM TO
		var l=iD.give.length, canGive=false;
		for(var i=0; i<l; i++){
			// IF THE CURRENT CHARACTER IS THE SAME AS THE CHARACTER TO GIVE ITEM TO:		
			if($('#JAG_ID_'+iD.give[i][0].split(':')[1].replace(/ /g,'').toLowerCase())[0]===$target[0]){ var canGive=true; };
		};		

		// IF CAN GIVE INVENTORY ITEM
		if(iD.give!=false && iD.give!=='_' && canGive){
			// SWITCH TO GIVE SPRITE THEN STOPPED SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'give');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
				
				// REMOVE FROM INVENTORY (IF LEFT IN, CAUSES ADDITIONAL FIRING ISSUES)
				JAG.OBJ.$selectedItem.remFromInv(JAG, iD.text);
		
				// MERGE INVENTORY_GIVE TEXT WITH AUX CHARACTER SPEECH ARRAY
				if($target.hasClass('JAG_Aux_Char')){
					$target.data('character').talk_to_text=$.merge( $.merge([], iD.give_text), $target.data('character').talk_to_text);
					// BEGIN DIALOGUE
					$target.saySomething(JAG, D.$Char, $target.data('character').talk_to_text);
				};
				
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY OPEN ACTIONS
				if($Item.Achievements(JAG, iD.give, false)) $Item.actionLoop(JAG, iD.give, 'give');	
			}, 250);

		// CAN'T GIVE INVENTORY ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.give_text);
		};

	// CAN'T GIVE ITEM THAT DOENS'T BELONG TO YOU
	}else{
		$Item.saySomething(JAG, D.$Char, iD.give_text);
	};

	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;
},




/***********************************************************************************************/
// OPEN - $Char.open(JAG, $Item, iD, inInv);
/***********************************************************************************************/
open:function(JAG, $Item, iD, inInv){
	// OPEN INVENTORY ITEM
	if(inInv){
		// IF CAN OPEN INVENTORY ITEM
		if(iD.inv_open!=false && iD.inv_open!=='_'){
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY OPEN ACTIONS
			if($Item.Achievements(JAG, iD.inv_open, false)) $Item.actionLoop(JAG, iD.inv_open, 'inv_open');		
			
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.inv_open.length; i<l; i++){ if(iD.inv_open[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.inv_open_text);
		// CAN'T OPEN INVENTORY ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_open_text);
		};

	// OPEN SCENE ITEM
	}else{
		// IF CAN OPEN SCENE ITEM
		if(iD.open!=false && iD.open!=='_'){
			// CHANGE TO OPEN SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'open');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
	
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY OPEN ACTIONS
				if($Item.Achievements(JAG, iD.open, false)) $Item.actionLoop(JAG, iD.open, 'open');		
			}, 250);			
			
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.open.length; i<l; i++){ if(iD.open[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.open_text);
		// CAN'T OPEN SCENE ITEM			
		}else{
			$Item.saySomething(JAG, D.$Char, iD.open_text);
		};
	};

	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},




/***********************************************************************************************/
// CLOSE - $Char.close(JAG, $Item, iD, inInv);
/***********************************************************************************************/
close:function(JAG, $Item, iD, inInv){
	// CLOSE INVENTORY ITEM
	if(inInv){
		// CAN CLOSE INVENTORY ITEM
		if(iD.inv_close!=false && iD.inv_close!=='_'){

			// CHECK ACHIEVEMENTS => PERFORM SECONDARY CLOSE ACTIONS
			if($Item.Achievements(JAG, iD.inv_close, false)) $Item.actionLoop(JAG, iD.inv_close, 'inv_close');		

			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.inv_close.length; i<l; i++){ if(iD.inv_close[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.inv_close_text);			

		// CAN'T CLOSE INVENTORY ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_close_text);
		};
		
	// CLOSE SCENE ITEM
	}else{
		// IF CAN OPEN SCENE ITEM
		if(iD.close!=false && iD.close!=='_'){
			// CHANGE TO CLOSE SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'close');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
	
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY USE ACTIONS
				if($Item.Achievements(JAG, iD.close, false)) $Item.actionLoop(JAG, iD.close, 'close');
			}, 250);			
			
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.close.length; i<l; i++){ if(iD.close[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.close_text);

		// CAN'T OPEN SCENE ITEM			
		}else{
			$Item.saySomething(JAG, D.$Char, iD.close_text);
		};

	};

	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},




/***********************************************************************************************/
// PICK UP - $Char.pick_up(JAG, $Item, iD, inInv);
/***********************************************************************************************/
pick_up:function(JAG, $Item, iD, inInv){
	// CANNOT PICK UP INVENTORY
	if(inInv){
		$Item.saySomething(JAG, D.$Char, iD.inv_pick_up_text);

	// ONLY PERFORM PICKUP ON SCENE OBJECTS
	}else{
		// IF PICK UP CAN BE PERFORMED
		if(iD.pick_up!=false && iD.pick_up!=='_'){

			// CHANGE TO PICKUP SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'pick_up');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
				
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY PICK_UP ACTIONS
				if($Item.Achievements(JAG, iD.pick_up, false)) $Item.actionLoop(JAG, iD.pick_up, 'pick_up').remove().addToInv(JAG, iD);	

				// ++EXPERIENCE POINTS (FOR OBTAINING)
				if(iD.value > 0){ 
					D.gD.experience+=iD.value; 
					if(JAG.OBJ.$EXP) JAG.OBJ.$EXP.html(D.gD.experience);
					iD.value=0;
				};
			}, 250);

		// CANNOT PICK UP ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.pick_up_text);
		};		
	};
	
	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},





/***********************************************************************************************/
// LOOK AT - $Char.look_at(JAG, $Item, iD, inInv);
/***********************************************************************************************/
look_at:function(JAG, $Item, iD, inInv){
	// LOOK AT INVENTORY OBJECTS
	if(inInv){
		// CAN PERFORM LOOK AT INVENTORY ACTION
		if(iD.inv_look_at!=false && iD.inv_look_at!=='_'){
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.inv_look_at.length; i<l; i++){ if(iD.inv_look_at[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.inv_look_at_text);
	
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY LOOK ACTIONS
			if($Item.Achievements(JAG, iD.inv_look_at, false)) $Item.actionLoop(JAG, iD.inv_look_at, 'look_at');
		
		// CANNOT PERFORM LOOK AT INVENTORY ACTION
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_look_at_text);
		};


	// LOOK AT SCENE OBJECTS
	}else{
		// CAN PERFORM LOOK AT SCENE ACTION
		if(iD.look_at!=false && iD.look_at!=='_'){
		
			// CHANGE TO LOOK SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'look_at');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
	
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY LOOK ACTIONS
				if($Item.Achievements(JAG, iD.look_at, false)) $Item.actionLoop(JAG, iD.look_at, 'look_at');
			}, 250);

			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.look_at.length; i<l; i++){ if(iD.look_at[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.look_at_text);

		// CANNOT PERFORM LOOK AT SCENE ACTION
		}else{
			$Item.saySomething(JAG, D.$Char, iD.look_at_text);
		};
	};
	
	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},





/***********************************************************************************************/
// TALK TO - $Char.talk_to(JAG, $Item, iD, inInv);
/***********************************************************************************************/
talk_to:function(JAG, $Item, iD, inInv){
	// TALK TO INVENTORY ITEM
	if(inInv){
		// CAN PERFORM TALK TO ACTION
		if(iD.inv_talk_to!=false && iD.inv_talk_to!=='_'){
			$Item.saySomething(JAG, D.$Char, iD.inv_talk_to_text);

		// CANNOT PERFORM TALK TO ACTION
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_talk_to_text);
		};

	// TALK TO SCENE ITEM		
	}else{	
		// CAN PERFORM TALK TO ACTION
		if(iD.talk_to!=false && iD.talk_to!=='_'){
			$Item.saySomething(JAG, D.$Char, iD.talk_to_text);
	
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY TALK ACTIONS
			if($Item.Achievements(JAG, iD.talk_to, false)) $Item.actionLoop(JAG, iD.talk_to, 'talk_to');
		// CANNOT PERFORM TALK TO ACTION
		}else{
			$Item.saySomething(JAG, D.$Char, iD.talk_to_text);
		};	
	};

	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},





/***********************************************************************************************/
// USE SCENE ITEM - $Char.useScene(JAG, $Item, iD, inInv);
/***********************************************************************************************/
useScene:function(JAG, $Item, iD){
	// CAN USE ITEM IN SCENE
	if(iD.use!=false && iD.use!=='_'){
		// CHANGE TO USE SPRITE
		D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'use');
		setTimeout(function(){ 
			// RETURN TO STOPPED SPRITE						
			if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
			
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY USE ACTIONS
			if($Item.Achievements(JAG, iD.use, $Item)) $Item.actionLoop(JAG, iD.use, 'use');
		}, 250);

	// CAN'T USE ITEM IN SCENE
	}else{
		$Item.saySomething(JAG, D.$Char, iD.use_text);
	};
		
	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;	
},


/***********************************************************************************************/
// USE ITEM WITH - $Char.useInv(JAG, $Item, iD, inInv); - JAG.OBJ.$selectedItem=Item1, $Item=Item 2
/***********************************************************************************************/
useInv:function(JAG, $Item, iD, inInv){
	// DON'T ALLOW USE WITH AUX CHARACTERS
	if(!$Item.hasClass('JAG_Aux_Char')){
		var $invItem=JAG.OBJ.$selectedItem,
			iD=$invItem.data('item');
			
		// LOOP THROUGH USE COMMANDS AND FIND WHAT TO USE ITEM WITH
		var l=iD.inv_use.length, canUse=false;
		for(var i=0; i<l; i++){
			if(iD.inv_use[i][0].split(':')[0].replace(/ /g,'').toLowerCase()==='with'){
				// IF THE TARGET OBJECT IS THE SAME AS REQUIRED 
				if($('#JAG_ID_'+iD.inv_use[i][0].split(':')[1].replace(/ /g,'').toLowerCase())[0]===$Item[0]){ var canUse=true; };
			};
		};		

		// USE INVENTORY ITEM ON SCENE
		if(!inInv){
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY USE ACTIONS
				D.cD.action=true;
				D.cD.callback=function(){ if($Item.Achievements(JAG, iD.inv_use, $invItem)) $invItem.actionLoop(JAG, iD.inv_use, 'inv_use'); };
			
			// CAN'T USE INVENTORY ITEM WITH SCENE ITEM
			}else{
				D.cD.action=false;
				$invItem.saySomething(JAG, D.$Char, iD.inv_use_text);
			};

		// USE INVENTORY ITEM ON OTHER INVENTORY ITEM
		}else{
			// CAN USE ITEM IN INVENTORY
			if(iD.inv_use!=false && iD.inv_use!=='_' && canUse){
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY USE ACTIONS
				if($invItem.Achievements(JAG, iD.inv_use, $invItem)) $Item.actionLoop(JAG, iD.inv_use, 'inv_use');
			// CAN'T USE ITEM IN INVENTORY
			}else{
				$invItem.saySomething(JAG, D.$Char, iD.inv_use_text);
			};
			
			D.cD.action=false;			
		};
	};
	
	// ACTION IS COMPLETE
	JAG.OBJ.$selectedItem=false;
	JAG.Story.ActionWord=false;
	JAG.Story.joinWord=false;	
},




/***********************************************************************************************/
// PUSH - $Char.push(JAG, $Item, iD, inInv);
/***********************************************************************************************/
push:function(JAG, $Item, iD, inInv){
	// PUSH INVENTORY ITEM
	if(inInv){ 
		// CAN PUSH INVENTORY ITEM
		if(iD.inv_push!=false && iD.inv_push!=='_'){
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.inv_push.length; i<l; i++){ if(iD.inv_push[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.inv_push_text);
			// CHECK ACHIEVEMENTS => PERFORM SECONDARY PUSH ACTIONS
			if($Item.Achievements(JAG, iD.inv_push, false)) $Item.actionLoop(JAG, iD.inv_push, 'inv_push');

		// CAN'T PUSH INVENTORY ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_push_text);
		};

	// PUSH SCENE ITEM
	}else{
		// CAN PUSH SCENE ITEM
		if(iD.push!=false && iD.push!=='_'){
			// CHANGE TO PUSH SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'push');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 

				// CHECK ACHIEVEMENTS => PERFORM SECONDARY PUSH ACTIONS
				if($Item.Achievements(JAG, iD.push, false)) $Item.actionLoop(JAG, iD.push, 'push');
			}, 250);

			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.push.length; i<l; i++){ if(iD.push[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.push_text);		
		
		// CAN'T PUSH SCENE ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.push_text);
		};
	};
	
	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');	
},


/***********************************************************************************************/
// PULL - $Char.pull(JAG, $Item, iD, inInv);
/***********************************************************************************************/
pull:function(JAG, $Item, iD, inInv){
	// PULL INVENTORY ITEM
	if(inInv){
		// CAN PULL INVENTORY ITEM
		if(iD.inv_pull!=false && iD.inv_pull!=='_'){
			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.inv_pull.length; i<l; i++){ if(iD.inv_pull[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.inv_pull_text);

			// CHECK ACHIEVEMENTS => PERFORM SECONDARY PULL ACTIONS
			if($Item.Achievements(JAG, iD.inv_pull, false)) $Item.actionLoop(JAG, iD.inv_pull, 'inv_pull');
		
		// CAN'T PULL INVENTORY ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.inv_pull_text);
		};
	
	
	// PULL SCENE ITEM
	}else{
		// CAN PULL SCENE ITEM
		if(iD.pull!=false && iD.pull!=='_'){
			// CHANGE TO PULL SPRITE
			D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'pull');
			setTimeout(function(){ 
				// RETURN TO STOPPED SPRITE						
				if(!D.cD.walking) D.$Char.find('img')[0].src=D.$Char.loadSprite(JAG, D.cD, 'stopping'); 
	
				// CHECK ACHIEVEMENTS => PERFORM SECONDARY PULL ACTIONS
				if($Item.Achievements(JAG, iD.pull, false)) $Item.actionLoop(JAG, iD.pull, 'pull');
			}, 250);

			// IF THERE IS A [SAY:SOMETHING] SECONDARY ACTION, DON'T SPEAK
			var toSpeak=true;
			for(var i=0, l=iD.pull.length; i<l; i++){ if(iD.pull[i][0].toLowerCase().replace(/ /g,'').indexOf('say') < 0) var toSpeak=false; };
			if(toSpeak) $Item.saySomething(JAG, D.$Char, iD.pull_text);			
		// CAN'T PULL SCENE ITEM
		}else{
			$Item.saySomething(JAG, D.$Char, iD.pull_text);
		};
	};
	
	// ACTION IS COMPLETE
	D.cD.action=false;
	JAG.Story.ActionWord=false;
	$Item.updateBar(JAG, 'exit', false, ' ');		
}});