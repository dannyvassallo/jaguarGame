/***********************************************************************************************/
// Jaguar - ACTIONS PARSER MODULE (DESCRIPTION BAR) */
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// SETUP EVENTS TO POPULATE DESCRIPTION BAR
/***********************************************************************************************/
dBar:function(JAG){
	// FIND ALL OBJECTS, CHARACTERS AND AUX CHARACTERS IN THIS SCENE
	var Els=[], 
		DIVs=D.$Scene.find('div'),
		totalDIVs=DIVs.length;
	for(var i=0; i<totalDIVs; i++){
		if($(DIVs[i]).hasClass('JAG_Aux_Char') || $(DIVs[i]).hasClass('JAG_Item')) Els.push(DIVs[i]);
	};
	
	// UPDATE DESCRIPTION BAR FOR OBJECTS AND CHARACTERS
	$(Els).on('mouseenter mouseleave', function(e){
		var $this=$(this),
			itemType=$this.hasClass('JAG_Item') ? 'item' : 'character',
			data=$this.data(itemType);
		switch(e.type){			
			case 'mouseenter':
				// DON'T ALLOW USE ON CHARACTERS
				if(JAG.Story.ActionWord==='Use' && itemType==='character') return;
				if(data.text!==false) $this.updateBar(JAG, 'enter', itemType, data.text); 
			break;
		
			case 'mouseleave': 
				$this.updateBar(JAG, 'exit', false, false); 
			break;
		};
	});
	
	// VERBS EVENTS
	$('div.JAG_Actions li').on('mouseenter mouseleave click', function(e){
		var $this=$(this),
			text=$this.text();
		switch(e.type){
			case 'mouseenter': 
				if(JAG.Story.ActionWord!=='Use' && JAG.Story.ActionWord!=='Give') $this.updateBar(JAG, 'enter', 'actionWord', text); 
			break;
			case 'mouseleave': $this.updateBar(JAG, 'exit', false, false); break;
			// SET CURRENT VERB AS ACTION
			case 'click':
				JAG.Story.ActionWord=text;
				JAG.Story.joinWord=false;
				$this.updateBar(JAG, 'enter', 'actionWord', text);
			break;
		};
	});
},




/***********************************************************************************************/
// UPDATE DESCRIPTION BAR TEXT $Item.updateBar(JAG, mouseSTATUS, itemType, text);
/***********************************************************************************************/
updateBar:function(JAG, status, itemType, text){
	var $Item=$(this),
		$dBar=JAG.OBJ.$dBar,
		$ActionWord=$dBar.find('span.JAG_ActionWord'),
		$Item1Word=$dBar.find('span.JAG_Item1Word'),
		$JoinWord=$dBar.find('span.JAG_JoinWord'),
		$Item2Word=$dBar.find('span.JAG_Item2Word'),
		AW=JAG.Story.ActionWord,
		GIVE=AW==='Give' ? true : false,
		USE=AW==='Use' ? true : false,
		// SIGNALS THAT THE USER HAS SELECTED AN ITEM TO GIVE OR USE
		isGIVE=$JoinWord.text()===' to';
		
	// TEST FOR STATUS TYPE
	switch(status){
		// ENTER 
		case 'enter':
			switch (itemType){	
				// VERB
				case 'actionWord': 
					if(!isGIVE){ 
						$ActionWord.text(text); 
					}else{
						$ActionWord.text(text);
						$Item1Word.text(''); 
						$JoinWord.text(''); 
					};
				break;
				
				// CHARACTER
				case 'character':
					if(GIVE || USE){ $Item2Word.text(' '+text);
					}else{ $Item1Word.text(' '+text); };
				break;
				
				// ITEM
				case 'item':
					var	inInv=JAG.Story.Inventory.indexOf($Item.data('item').text) > -1;
				
					if($Item.data('item').type==='exit'){
						$ActionWord.text('');
						$Item1Word.text('');
						$JoinWord.text('');
					};

					// MAKE INVENTORY CHECKS
					if(isGIVE) return;
					
					$Item2Word.text(USE ? ' '+text : text);
				break;
			};			
		break;

		// EXIT
		case 'exit':
			$ActionWord.text(JAG.Story.ActionWord ? JAG.Story.ActionWord : ' ');
			if(!GIVE && !USE) $Item1Word.add($JoinWord).text(' ');
			$Item2Word.text(' ');
		break;
		
		// CLICK
		case 'click':
			$ActionWord.text(AW);
			$Item1Word.text(text);
			$JoinWord.text(GIVE ? ' to' : USE ? ' with ' : '');
			$Item2Word.text(' ');
		break;		
	};
},




/***********************************************************************************************/
// PARSE BAR AND RETRIEVE ACTION WORD
/***********************************************************************************************/
parseBar:function(JAG, iD){ 
	return JAG.OBJ.$dBar.find('span.JAG_ActionWord').text().toLowerCase().replace(' ','_').replace(/ /g,''); 
}

});