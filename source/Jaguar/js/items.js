/***********************************************************************************************/
// Jaguar - ITEMS & INVENTORY MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD ITEMS - $scene.loadItems(JAG);
/***********************************************************************************************/
loadItems:function(JAG){
	var Items=D.$Scene.find('div.JAG_Item'),
		numItems=Items.length;
	
	// LOOP THROUGH AND SETUP ALL ITEM DATA
	for(var i=0; i<numItems; i++){
		var $Item=$(Items[i]),
			iD=$Item.data('item');
			itemD=$.extend({}, JAG.Item, !iD?{} : iD||{}),
			lastItem=i+1===numItems ? true : false;
			
		// SAVE DATA AND POSITION
		$Item.data('item',itemD)
		.css({left:itemD.pos.split(',')[0].pF()+'%', display:'block', top:itemD.pos.split(',')[1].pF()+'%', visibility:itemD.hidden ? 'hidden' : 'visible'});
				
		// MAKE ITEM ID=ID.TEXT		
		if(itemD.text) $Item.attr('id','JAG_ID_'+itemD.text.toLowerCase().replace(/ /g,''));
		
		// SAVE THE SCENE NAME IN THIS ITEM'S DATA (FOR SAVING/LOADING GAMES)
		itemD.from_scene=D.$Scene[0].id;
		
		// IF ITEM IS JUST DECORATION, ALLOW CLICK-THROUGHS
		if(!itemD.text && itemD.type==='layer') $Item.css('pointer-events','none');
		
		// CORRECT LAYERING FOR EXIT ITEMS WITH IMAGES
		if(itemD.type==='exit') $Item.css('z-index',3);
		
		// SCENE OBJECTS AND LAYERING OBJECTS
		$Item.loadObject(JAG, itemD, lastItem);
	};

	return $(this);	
},



/***********************************************************************************************/
// LOAD SCENE OBJECTS OBJECTS - $Item.loadObject(JAG, iD);
/***********************************************************************************************/
loadObject:function(JAG, iD, lastItem){
	// RUN ALL OBJECTS THROUGH LOADOBJECT IN ORDER TO MAINTAIN THE LASTITEM
	if(iD.image === undefined){
		if(lastItem){
			// CHECK TO MAKE SURE CHARACTER IS LAYERED IN THE SCENE CORRECTLY		
			var $sceneItems=D.$Scene.find('div.JAG_Item');
			D.$Char.layerItem($sceneItems, $sceneItems.length, D.cD.CharY, D.$Char.outerHeight(true));
		};

		return; 	
	};
	
	var $Object=$(this),
		sceneObj=new Image(),
		src='Jaguar/items/'+iD.image+'.png';
		
	$(sceneObj).one('load',function(){
		var oW=this.width*iD.scale.pF(),
			oH=this.height*iD.scale.pF();
		
		// ADD OBJECT TO SCENE
		$Object.css({width:oW, height:oH, zIndex:3}).html('<img class="JAG_Item_Img" src='+src+' width="'+oW+'" height="'+oH+'">');
		
		// LAYER THE CHARACTERS CORRECTLY NOW THAT ALL ITEMS ARE OFFICIALLY LOADED
		if(lastItem){ 
			// CHECK TO MAKE SURE CHARACTER IS LAYERED IN THE SCENE CORRECTLY		
			var $sceneItems=D.$Scene.find('div.JAG_Item');
			D.$Char.layerItem($sceneItems, $sceneItems.length, D.cD.CharY, D.$Char.outerHeight(true))
		};
				
		// SETUP INVENTORY ARROWS				
		$Object.checkArrows(JAG);
	})[0].src=src;	
},




/***********************************************************************************************/
// ADD INVENTORY ITEM - $Item.addToInv(JAG, iD);
/***********************************************************************************************/
addToInv:function(JAG, iD){
	// FIND FIRST EMPTY INVENTORY SLOT AND ADD IMAGE
	var $Item=$(this),
		$Inv=$('div.JAG_Inventory ul'),
		itemsinRow=$Inv.find('span.JAG_Inv_Set').find('li').length,
		$firstAvailable=$Inv.find('li:empty').first();

	// INVENTORY IS FULL
	if($firstAvailable[0]===undefined){
		var set='';
		// ADD A NEW SET
		for(var i=0; i<itemsinRow; i++) set+='<li></li>';			
		$Inv.append('<span class="JAG_Inv_Set">'+set+'</span>');
		$firstAvailable=$Inv.find('span.JAG_Inv_Set:last').find('li:first');
		
		// REBIND NEW INVENTORY EVENTS
		$('div.JAG_Inventory li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv');
		JAG.OBJ.$Game.bindInv(JAG);
		
		// UPDATE ARROW VISIBILITY
		$Inv.checkArrows(JAG);
	};

	// ADD IT TO THE INVENTORY, PASS DATA AND FADE IT IN
	$firstAvailable.html('<img id="'+$Item.attr('id')+'" src="Jaguar/items/'+iD.image+'.png" style="opacity:0">')
	.find('img').animate({opacity:1},{duration:500,queue:false}).data('item',iD);
	
	// REMOVE IT FROM THE SCENE
	$Item.remove();

	// MARK THIS ITEM AS IN INVENTORY
	JAG.Story.Inventory.push(iD.text.toLowerCase().replace(/ /g,''));
},




/***********************************************************************************************/
// REMOVE INVENTORY ITEM - $Item.remFromInv(JAG, itemName);
/***********************************************************************************************/
remFromInv:function(JAG, itemName){
	var $Item=$(this);
	
	// REMOVE ITEM FROM INVENTORY
	$Item.animate({opacity:0},{duration:250,queue:false,complete:function(){
		// RESHUFFLE INVENTORY ITEMS
		$Item.remove().shuffleInv(JAG);

		// REMOVE ITEM FROM INVENTORY ARRAY
		JAG.Story.Inventory.pop(itemName);
	}});
},




/***********************************************************************************************/
// RESHUFFLE INVENTORY (COMBINING OR REMOVING OBJECTS) - $Item.shuffleInv(JAG);
/***********************************************************************************************/
shuffleInv:function(JAG){
	var $Inv=$('div.JAG_Inventory ul').find('li'),
		totalSpaces=$Inv.length,
		$InvBlocks=$('div.JAG_Inventory').find('span.JAG_Inv_Set'),
		totalBlocks=$InvBlocks.length;
		
	// EXIT IF EMPTY
	if(!$Inv.find('img').length) return;

	// LOOP THROUGH INDIVIDUAL INVENTORY - REMOVE THE EMPTY CONTAINER IN THE MIDDLE
	for(var i=0; i<totalSpaces; i++){
		if($($Inv[i]).is(':empty')) $($Inv[i]).remove();
	};
	
	// LOOP THROUGH ALL BLOCKS REMOVE SPANS
	for(var i2=0; i2<totalBlocks; i2++){
		var cnt=$($($InvBlocks[i2])).contents();
		$($($InvBlocks[i2])).replaceWith(cnt);
	};

	// REMOVE ANY EMPTY SPANS
	$('div.JAG_Inventory ul').find('span.JAG_Inv_Set:empty').remove();
	
	// LOOP THROUGH ALL INVENTORY ITEMS - REBUILD SPANS (EVERY 8 ITEMS)
	var $newInv=$('div.JAG_Inventory ul').find('li');
	for(var i=0; i<$newInv.length; i+=8){
	    var $span=$("<span/>",{class: 'JAG_Inv_Set'});
   		$newInv.slice(i, i+8).wrapAll($span);
	};
	
	// CHECK THE LAST BLOCK TO MAKE SURE THERE ARE 8 EMPTY ITEMS
	var $lastBlock=$('div.JAG_Inventory').find('span.JAG_Inv_Set:last');
	for(var i3=0; i3<8; i3++){
		if($lastBlock.find('li').length < 8){
			$lastBlock.append('<li/>');
		};
	};

	// MOVE THE INVENTORY TO THE FIRST BLOCK AND RESET THE MARGIN
	$('div.JAG_Inventory').find('ul').css('margin-top',0).find('span.JAG_Inv_Set:first').addClass('JAG_currentSet');

	// UPDATE ARROW VISIBILITY
	$Inv.checkArrows(JAG);	
	
	// REBIND NEW INVENTORY EVENTS
	$('div.JAG_Inventory li').off('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv');
	JAG.OBJ.$Game.bindInv(JAG);
	
	return $(this);
},




/***********************************************************************************************/
// CONSTRUCT DESC BAR, VERBS AND INVENTORY PANEL + INV SCROLLING
/***********************************************************************************************/
buildInv:function(JAG){
	// DETERMINE HOW MANY INVENTORY ITEMS ARE VISIBLE AT ONCE
	var itemCount=8, InvItems='';
	for(var i=0; i<itemCount; i++) InvItems+='<li></li>';
	$('<div class="JAG_Desc"><p><span class="JAG_ActionWord"></span><span class="JAG_Item1Word"></span><span class="JAG_JoinWord"></span><span class="JAG_Item2Word"></span></p></div><div class="JAG_Panel"><div class="JAG_Actions"><ul class="JAG_Column1"><li class="JAG_Word">Give</li><li class="JAG_Word">Open</li><li class="JAG_Word">Close</li></ul><ul class="JAG_Column2"><li class="JAG_Word">Pick up</li><li class="JAG_Word">Look at</li><li class="JAG_Word">Talk to</li></ul><ul class="JAG_Column3"><li class="JAG_Word">Use</li><li class="JAG_Word">Push</li><li class="JAG_Word">Pull</li></ul></div><div class="JAG_Inventory"><div class="JAG_Inv_Arrows"><div class="JAG_Arrow_Up"></div><div class="JAG_Arrow_Down"></div></div><ul><span class="JAG_Inv_Set JAG_currentSet">'+InvItems+'</span></ul></div></div></div>')
	.appendTo(JAG.OBJ.$Game);
	
	// SETUP INVENTORY OBJECT EVENTS
	JAG.OBJ.$Game.bindInv(JAG);
	
	// SET REFERENCE TO DESCRIPTION BAR
	JAG.OBJ.$dBar=$(this).find('div.JAG_Desc p');
	
	// SETUP INVENTORY SCROLLING
	JAG.OBJ.$Game.find('div.JAG_Inv_Arrows').on('click',function(e){
		var $Arrow=$(e.target),
			$Inv=JAG.OBJ.$Game.find('div.JAG_Inventory ul'),
			numSets=$Inv.find('span.JAG_Inv_Set').length,
			$currentSet=$Inv.find('span.JAG_currentSet'),
			currentIndex=$currentSet.index(),
			H=$Inv.height()/numSets;

		// EXIT IF INVENTORY CANNOT BE NAVIGATED
		if(numSets <= 1) return;		

		// UP ARROW
		if($Arrow.hasClass('JAG_Arrow_Up')){
			if(!$currentSet.prev('span.JAG_Inv_Set').length) return;
			
			// UPDATE CLASSES
			$currentSet.removeClass('JAG_currentSet').prev('span.JAG_Inv_Set').addClass('JAG_currentSet');

			// SCROLL INVENTORY
			$Inv.css({'margin-top':-(H*(currentIndex-1))+'px'});
			
		// DOWN ARROW
		}else if($Arrow.hasClass('JAG_Arrow_Down')){
			if(!$currentSet.next('span.JAG_Inv_Set').length) return;
			
			// UPDATE CLASSES
			$currentSet.removeClass('JAG_currentSet').next('span.JAG_Inv_Set').addClass('JAG_currentSet');

			// SCROLL INVENTORY
			$Inv.css({'margin-top':-(H*(currentIndex+1))+'px'});
		};
		
		// UPDATE ARROW VISIBILITY
		$Inv.checkArrows(JAG);
	});
},



/***********************************************************************************************/
// BIND INVENTORY OBJECT EVENTS
/***********************************************************************************************/
bindInv:function(JAG){
	$('div.JAG_Inventory li').on('mouseenter.JAG_Inv mouseleave.JAG_Inv click.JAG_Inv',function(e){
		if(!$(this).find('img').length) return;

		var $li=$(this),
			$Item=$li.find('img'),
			iD=$Item.data('item'),
			$ActionWord=JAG.Story.ActionWord;
			
		switch(e.type){
			// INTERACTING WITH INVENTORY			
			case 'click':
				if(JAG.Story.ActionWord){
					// SET AS SELECTED ITEM UNLESS THE JOINWORD IS TRUE 
					// THE JOINWORD INDICATES THE PRESENCE OF 'TO' OR 'WITH'
					if(!JAG.Story.joinWord) JAG.OBJ.$selectedItem=$Item;
					$Item.Action(JAG, 'item', false, true);
				};
			break;
			
			// UPDATE DESCRIPTION BAR			
			case 'mouseenter': $Item.updateBar(JAG, 'enter', 'item', ' '+iD.text); break;				
			
			// CLEAR DESC BAR (UNLESS USING 'GIVE' OR 'USE')
			case 'mouseleave':
				if($ActionWord==='Give' || $ActionWord==='Use') return;
				$Item.updateBar(JAG, 'exit', false, false);
			break;
		};
	});	
},




/***********************************************************************************************/
// CHECKS AND CONTROLS INVENTORY ARROW VISIBILITY
/***********************************************************************************************/
checkArrows:function(JAG){
	var $Inv=JAG.OBJ.$Game.find('div.JAG_Inventory'),
		$Up=$Inv.find('div.JAG_Arrow_Up'),
		$Down=$Inv.find('div.JAG_Arrow_Down'),
		numSets=$Inv.find('span.JAG_Inv_Set').length,
		$currentSet=$Inv.find('span.JAG_currentSet'),
		currentIndex=$currentSet.index()+1;

	// UPDATE ARROW VISIBILITY
	$Up[0].style.visibility=currentIndex > 1 ? 'visible' : 'hidden';
	$Down[0].style.visibility=currentIndex < numSets ? 'visible' : 'hidden';		
}});