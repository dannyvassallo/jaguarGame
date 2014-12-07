/***********************************************************************************************/
// Jaguar - SAVE/LOAD GAMES
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// OPENS LOAD/SAVE MENU
/***********************************************************************************************/
openMenu:function(JAG){
	var title=D.gD.title ? D.gD.title : 'Save or Load a Game';

	// IF MENU DOESN'T EXIST CREATE IT
	if(!D.$Game.find('div.JAG_SaveMenu_Overlay').length){
		D.$Game.prepend('<div class="JAG_SaveMenu_Overlay"></div><div class="JAG_SaveMenu"><p>'+title+'</p><div class="JAG_Save">Save Game</div><div class="JAG_Load">Load Game</div></div>');

		// POSITION SAVE MENU
		var $saveMenu=D.$Game.find('div.JAG_SaveMenu'),
			$overlay=D.$Game.find('div.JAG_SaveMenu_Overlay');
		$saveMenu.css('left',((D.gD.viewportW-$saveMenu.outerWidth(true))/2)+$(window).scrollLeft()+'px');	
	
		// FADE IN OVERLAY, THEN MENU
		$overlay.stop(true,false).fadeTo(200, 0.85, function(){
			$saveMenu.stop(true,false).fadeTo(200, 1); });
			
		// BIND EVENTS TO OVERLAY AND LOAD AND SAVE BUTTONS
		$saveMenu.find('div.JAG_Save').on('click',function(){ D.$Game.saveGame(JAG); });
		$saveMenu.find('div.JAG_Load').on('click',function(){ D.$Game.loadGame(JAG); });
		$overlay.on('click',function(){ 	
			if(JAG.OBJ.saveORload) return;	
			D.$Game.closeMenu(JAG); 
		});

	// OTHERWISE CLOSE IT
	}else{ D.$Game.closeMenu(JAG); };

},



/***********************************************************************************************/
// CLOSE LOAD/SAVE MENU
/***********************************************************************************************/
closeMenu:function(JAG){
	var $saveMenu=D.$Game.find('div.JAG_SaveMenu'),
		$overlay=D.$Game.find('div.JAG_SaveMenu_Overlay');
		
	clearTimeout(D.sD.menuTimer);
	JAG.OBJ.saveORload=false;
		
	// FADE OUT MENU AND OVERLAY, THEN REMOVE
	$saveMenu.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
		$overlay.stop(true,false).animate({opacity:0},{duration:200,queue:false,complete:function(){
			$saveMenu.add($overlay).remove();
		}});
	}});	
},


	
	
	
/***********************************************************************************************/
// MAKE SURE BROWSER SUPPORTS LOCALSTORAGE
/***********************************************************************************************/
supportsSave:function(){
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  }catch(e){
    return false;
  }
},




/***********************************************************************************************/
// SAVE GAME
/***********************************************************************************************/
saveGame:function(JAG){
	// MAKE SURE LOCALSTORAGE IS SUPPORTED
	if(!$(this).supportsSave()){ return false; };
	
	// CURRENTLY SAVING
	if(JAG.OBJ.saveORload) return;	
	JAG.OBJ.saveORload=true;
	
	// CLEAR EXISTING	
	localStorage.clear();

	// LOOP THROUGH ALL ATTRIBUTES
	localStorage.$Game=JAG.OBJ.$Game.attr('id');
	localStorage.$currentScene=JAG.OBJ.$currentScene.attr('id');
	localStorage.$currentItem=JAG.OBJ.$currentItem ? JAG.OBJ.$currentItem.attr('id') : 'false';
	localStorage.Inventory=JAG.Story.Inventory;
	
	// LOOP THROUGH SCENES AND SAVE WHETHER THE CHARACTER HAS BEEN THERE
	var $Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
		numScenes=$Scenes.length;	
	for(var i=0; i<numScenes; i++){
		var sceneID=$Scenes[i].id.toLowerCase().replace(/ /g,'');		
		localStorage[sceneID+'_beenHere']=$($Scenes[i]).data('scene').beenHere==undefined ? false : $($Scenes[i]).data('scene').beenHere;
	};
	
	// USE TIMER TO MAKE IT LOOK LIKE DATE IS BEING SAVED
	$('div.JAG_SaveMenu').find('p').text('Saving Game...');
	D.sD.menuTimer=setTimeout(function(){
		// CLOSE MENU
		D.$Game.closeMenu(JAG);
		return true;
	}, 2000);
},

/***********************************************************************************************/
// LOAD GAME
/***********************************************************************************************/
loadGame:function(JAG){
	// LOGGING - for(var key in localStorage){ console.log(key + ':' + localStorage[key]); };

	// MAKE SURE LOCALSTORAGE IS SUPPORTED
	if(!$(this).supportsSave()){ return false; };
	
	// CURRENTLY LOADING
	if(JAG.OBJ.saveORload) return;
	JAG.OBJ.saveORload=true;	

	// LOAD ALL GAME VALUES
	var $currentScene=JAG.OBJ.$currentScene;
	JAG.OBJ.$Game=$('#'+localStorage.$Game);
	JAG.OBJ.$currentScene=$('#'+localStorage.$currentScene);
	JAG.OBJ.$currentChapter=JAG.OBJ.$currentScene.parents('ul:first');
	JAG.OBJ.$currentItem=localStorage.$currentItem==='false' ? false : $('#'+localStorage.$currentItem);
	JAG.OBJ.$selectedItem=false;
	JAG.OBJ.$canvas=false;
	JAG.OBJ.$foreground=false;

	// LOOP THROUGH SCENES AND LOAD WHETHER THE CHARACTER HAS BEEN THERE
	var $Scenes=JAG.OBJ.$Game.find('li.JAG_Scene');
		numScenes=$Scenes.length;	
	for(var i=0; i<numScenes; i++){
		var sceneID=$Scenes[i].id.toLowerCase().replace(/ /g,'');
		$($Scenes[i]).data('scene').beenHere=localStorage[sceneID+'_beenHere'];
	};
	

	// CLEAR INVENTORY
	JAG.Story.Inventory=[];
	var currentInv=$('div.JAG_Inventory').find('li').not(':empty');
	for(var InvI=0; InvI<currentInv.length; InvI++){
		var $InvObj=$(currentInv[InvI]).find('img'),
			InvD=$InvObj.data('item');

		// IF THIS ITEM IS IN THE SAVE GAME INVENTORY WE CAN KEEP IT
		if(localStorage.Inventory.indexOf(InvD.text) >=0){
			console.log("keeping "+InvD.text)
		
		// OTHERWISE PUT IT BACK TO FROM_SCENE
		}else{
			console.log("put back" +InvD.text)
			// REMOVE FROM INVENTORY
			$InvObj.remove()
			// PLACE BACK ON SCENE
			// !!!!!
		};
	};

	// LOOP THROUGH AND REBUILD INVENTORY
	var InvItems=localStorage.Inventory.split(','),
		numItems=InvItems.length;
	for(var i=0; i<numItems; i++){
		// FIND THIS ITEM
		var InvItem=InvItems[i].toLowerCase().replace(/ /g,'');

		// INVITEM IS THE NAME ("MAP") - IDs ARE ONLY ASSIGNED AFTER VISITING A SCENE
		if(InvItem && $('#JAG_ID_'+InvItem).length){
			var	$Item=$('#JAG_ID_'+InvItem),
				iD=$Item.data('item');
			// REMOVE ITEM FROM SCENE
			$Item.remove();
			// ADD TO INVENTORY
			$Item.addToInv(JAG, iD);
		};
	};

	// USE TIMER TO MAKE IT LOOK LIKE DATE IS BEING LOADED
	$('div.JAG_SaveMenu').find('p').text('Loading Save Game...');
	D.sD.menuTimer=setTimeout(function(){
		// CLOSE MENU
		D.$Game.closeMenu(JAG);
		// LAUNCH
		$currentScene.transSceneOut(JAG, JAG.OBJ.$currentScene, false)
	    return true;
	}, 2000);
}


});