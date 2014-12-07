/***********************************************************************************************/
// Jaguar - SECONDARY ACTIONS MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOOP THROUGH ALL SECONDARY ACTIONS
/***********************************************************************************************/
actionLoop:function(JAG, Actions, primAction){
	var $Char=D.$Char,
		$Item=$(this),
		itemType=$Item.hasClass('JAG_Aux_Char') || $Item.hasClass('JAG_Char') ? 'character' : 'item',
		iD=$Item.data(itemType),
		numofActions=Actions.length,
		inInv=false,
		beenThere=false,
		hasPoints=false;
		
	// ONLY PERFORM SECONDARY ACTIONS ONCE!
	if(iD[primAction]==='completed'){ $Item.saySomething(JAG, $Char, iD[primAction+'_text']); return; };
		
	// PERFORM SECONDARY ACTIONS AFTER PRIMARY ACTION
	for(var i=0; i<numofActions; i++){

		// MODIFY SETTING IF SENT IN AS AN ARRAY-LIKE OBJECT
		if(typeof Actions[i][0]==='object'){
			var mod=Actions[i][0].indexOf('modify');			
			$Char.modData(JAG, Actions[i]);
			
		// ALL OTHER SETTINGS ARE STRINGS
		}else{
			var string=Actions[i][0].toLowerCase().replace(/ /g,''),
				show=string.indexOf('show'),			
				hide=string.indexOf('hide'),
				walk_to=string.indexOf('walk_to'),
				rem_Inv=string.indexOf('inv_remove'),
				add_Inv=string.indexOf('inv_add'),
				say=string.indexOf('say'),
				say_after=string.indexOf('say_after'),
				sound=string.indexOf('play_sound');

			if(show >=0) 	 $Char.s_Show(JAG, Actions[i][0].split(':')[1]);
			if(hide >=0) 	 $Char.s_Hide(JAG, Actions[i][0].split(':')[1]);
			if(walk_to >=0)  $Char.s_Walk_to(JAG, Actions[i][0].split(':')[1].split(','));
			if(rem_Inv >=0)  $Char.s_rem_Inv(JAG, Actions[i][0].split(':')[1]);
			if(add_Inv >=0)  $Char.s_add_Inv(JAG, Actions[i][0].split(':')[1].toLowerCase().replace(/ /g,''));
			if(say >=0 && say_after ===-1)  $Item.s_Say(JAG, Actions[i][0].split(':')[1], false);
			if(say_after >=0) $Item.s_Say(JAG, Actions[i][0].split(':')[1], true);
			if(sound >=0)	 $Item.playSound(JAG, Actions[i][0].split(':')[1]);
			
			// CHANGE SPRITE STATE
			if(string.indexOf('change_sprite') >=0){
				var newImg=Actions[i][0].split(':')[1];
				if($Item.parent().is('li')){
					$Item.attr('src','Jaguar/items/'+newImg+'.png').data('item').image=newImg;
				}else{
					$Item.find('img').attr('src','Jaguar/items/'+newImg+'.png').end().data('item').image=newImg;
				};
			};		

			// ++EXPERIENCE POINTS
			if(Actions[i][0].indexOf('value') >= 0){
				var points=Actions[i][0].split(':')[1].pF();
				if(points > 0){ 
					D.gD.experience+=points;
					if(JAG.OBJ.$EXP) JAG.OBJ.$EXP.html(D.gD.experience);
				};	
			};

			// MARK SECONDARY ACTIONS AS FIRED (UNLESS SET TO REPEAT)
			if(!D.cD.repeat_entrance.isB() && itemType==='character'){ iD[primAction]='completed'; };
		};
	};

	return $Item;
},




/***********************************************************************************************/
// CHECK ACHIEVEMENTS - $Item.Achievements(JAG, Actions, JAG.OBJ.$selectedItem);
/***********************************************************************************************/
Achievements:function(JAG, Actions, $invItem){
	var inInv=false, 
		hasPoints=false, 
		beenThere=false,
		hasReqSprite=false,
		set_Inv=false,
		set_hasPoints=false,
		set_beenThere=false,
		set_req_sprite=false;
	
	// LOOP THROUGH SECONDARY ACTIONS
	for(var i=0, l=Actions.length; i<l; i++){
		var action=Actions[i][0].split(':')[0].toLowerCase().replace(/ /g,'');
		
		// CHECK ACHIEVEMENT - ITEM IN INVENTORY
		if(action==='must_have'){
			var set_Inv=true, inInv=JAG.Story.Inventory.indexOf(Actions[i][0].split(':')[1]) >=0;
		};

		// CHECK ACHIEVEMENT - HAVE REQUIRED EXPERIENCE POINTS
		if(action==='req_points'){
			var set_hasPoints=true,
				hasPoints=D.gD.experience.pF() >= Actions[i][0].split(':')[1].pF();
		};
		
		// CHECK ACHIEVEMENT - REQUIRED SPRITE (COMBINING INVENTORY ITEMS TO CHANGE SPRITE)
		if(action==='req_sprite' && $invItem){
			var set_req_sprite=true,
				hasReqSprite=$invItem.data('item').image.toLowerCase().replace(/ /g,'') === Actions[i][0].split(':')[1];							
		};

		// CHECK ACHIEVEMENT - IF CHARACTER HAS BEEN TO REQUIRED SCENE
		if(action==='been_to'){
			var set_beenThere=true,
				sceneName=Actions[i][0].split(':')[1],
				$Scenes=D.$Game.find('ul.JAG_Chapter').find('li'),
				numScenes=$Scenes.length;
			// LOOP THROUGH SCENES AND FIND THE CORRECT ONE
			for(var iS=0; iS<numScenes; iS++){
				// MATCH THE SCENE NAME TO THE SCENE ID
				if($Scenes[iS].id.toLowerCase().replace(/ /g,'')===sceneName){
					// CHECK IF CHARACTER HAS BEEN TO THAT SCENE
					if($($Scenes[iS]).data('scene').beenHere) var beenThere=true;
				};
			};
		};
	};
	
	// ALL ACHIEVEMENTS MET
	if((!set_Inv || (set_Inv && inInv)) &&
	   (!set_hasPoints || (set_hasPoints && hasPoints)) &&
	   (!set_beenThere || (set_beenThere && beenThere)) &&
	   (!set_req_sprite || (set_req_sprite && hasReqSprite))){
		return true;
	}else{
		$(this).saySomething(JAG, D.$Char, $(this).data('item').not_ready_text);
		return false;		
	};
},




/***********************************************************************************************/
// MODIFY OTHER DATA - SYNTAX:
//	"action_setting":[
//		[	
//			["modify:name of item/character"],
//			["data_key : value"],
//			["data_key : value"]
//		]
/***********************************************************************************************/
modData:function(JAG, modData){
	// MODDATA=ARRAY-LIKE OBJECT
	var $Item=$('#JAG_ID_'+modData[0][0].toLowerCase().replace(/ /g,'').split(':')[1]),
		itemType=$Item.hasClass('JAG_Item') ? 'item' : 'character',
		numMods=modData.length; 

	// LOOP THROUGH ALL MODS - DON'T COUNT FIRST (ID POINTER)		
	for(var i=1; i<numMods; i++){
		var mod=modData[i][0].toLowerCase().replace(/ /g,'').split(':');
		$Item.data(itemType)[mod[0]]=mod[1];
	};
},



/***********************************************************************************************/
// WALK CHARACTER TO COORDINATES
/***********************************************************************************************/
s_Walk_to:function(JAG, walk_to){
	var toX=(walk_to[0].pF()/100)*D.gD.viewportW.pF(),
		toY=(walk_to[1].pF()/100)*D.gD.viewportH.pF();
	$(this).walk(JAG, toX, toY);
},



/***********************************************************************************************/
// SHOW/HIDE OTHER OBJECTS
/***********************************************************************************************/
s_Show:function(JAG, show){ $('#JAG_ID_'+show.toLowerCase().replace(/ /g,'')).css('visibility','visible').data('item').hidden=false; },
s_Hide:function(JAG, hide){ $('#JAG_ID_'+hide.toLowerCase().replace(/ /g,'')).css('visibility','hidden').data('item').hidden=true; },



/***********************************************************************************************/
// SECONDARY SAY
/***********************************************************************************************/
s_Say:function(JAG, say, callback){ 
	var $Char=D.$Char;

	// HIDE ANY EXISTING TEXT FIRST TO INSURE SAYSOMETHING FIRES
	D.sD.talking=false;
	$('p.JAG_Char_Dialogue').css('display','none');
	
	// SAY SOMETHING WHILE WALKING OR AFTER
	if(callback){
		D.cD.action=true;
		D.cD.callback=function(){ $Char.saySomething(JAG, $Char, say); };
	}else{
		$Char.saySomething(JAG, $Char, say);
	};
},


/***********************************************************************************************/
// ADD/REMOVE ITEM TO INVENTORY
/***********************************************************************************************/
s_add_Inv:function(JAG, addInv){ 
	var $Item=$('#JAG_ID_'+addInv); 
	$Item.addToInv(JAG, $Item.data('item')); 
},
s_rem_Inv:function(JAG, rem_Inv){ 
	var $Item=$('#JAG_ID_'+rem_Inv);
	if($('div.JAG_Inventory').find($Item).length) $Item.remFromInv(JAG, $Item);
}





});