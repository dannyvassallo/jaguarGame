/***********************************************************************************************/
// Jaguar - BUILD ASSIST / DEBUG MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD DEBUG ASSIST TOOLS - $scene.debug(oD);
/***********************************************************************************************/
debug:function(JAG, oD){
	// IF DEBUG WINDOW DOESN'T EXIST ADD IT
	if(!D.gD.showingDebug && !D.$Game.find('div.JAG_Debug_Window').length){
		var DL=(D.gD.viewportW/2) + $(window).scrollLeft()-300, 
			top=(D.gD.viewportH/2) + $(window).scrollTop(),
			showPath='<input type="checkbox" name="Show_Path" value="0"> Show Path <br/>',
			charLines='<input type="checkbox" name="Char_Lines" value="0"> Show Character Boundaries <br/>',
			itemLines='<input type="checkbox" name="Item_Lines" value="0"> Show Item Outlines <br/>',
			horizonLine='<input type="checkbox" name="horizon_Line" value="0"> Show Horizon and Ground Lines <br/>',
			hideFG='<input type="checkbox" name="hide_FG" value="0"> Hide Foreground <br/>',
			showClip='<input type="checkbox" name="show_Clip" value="0"> Show Clipping on Panning Scenes <br/>',
			itemOpacity='<input type="checkbox" name="opacity" value="1"> Hide Scene Items<br/>',
			jumpToScene='<div style="float:left;width:450px;">Jump to Scene [ ID ] <input type="text" name="jumpTo" value=" "> <div id="JAG_jumpToScene">GO</div></div>';

		// ADD TO PAGE
		D.$Game.prepend('<div class="JAG_Debug_Window" style="left:'+DL+'px;top:'+top+'px;"><h2>Jaguar Console - Experience:<span id="JAG_EXP">'+D.gD.experience+'</span> - Scene: <span id="JAG_Debug_currentScene">'+JAG.OBJ.$currentScene.attr('id')+'</span></h2><br/>'+showPath+charLines+itemLines+horizonLine+hideFG+showClip+itemOpacity+jumpToScene+'</div>');

		// SAVE REFERENCE TO DEBUG WINDOW AND EXPERIENCE
		JAG.OBJ.$Debug=D.$Game.find('div.JAG_Debug_Window'); 
		JAG.OBJ.$EXP=$('#JAG_EXP');
		
		// BIND EVENTS TO CHECKBOXES
		JAG.OBJ.$Debug.find('input[name="Show_Path"]').on('change',function(){ $(this).debugPath(JAG, D); }).end()
		.find('input[name="Item_Lines"]').on('change',function(){ $(this).debugItemLines(JAG, D); }).end()
		.find('input[name="hide_FG"]').on('change',function(){ $(this).debugForeground(JAG, D); }).end()
		.find('input[name="horizon_Line"]').on('change',function(){ $(this).debugHorizon(JAG, D); }).end()
		.find('input[name="Char_Lines"]').on('change',function(){ $(this).debugCharLines(JAG, D); }).end()
		.find('input[name="show_Clip"]').on('change',function(){ $(this).debugSceneClipping(JAG, D); }).end()
		.find('input[name="opacity"]').on('change',function(){ $(this).debugOpacity(JAG, D); }).end()		
		.find('input[name="jumpTo"]').on('keypress',function(e){ var code=e.keyCode||e.which; if(code===13) $(this).jumpToScene(JAG, D); });

		// JUMP TO SCENE TEXT INPUT
		$('#JAG_jumpToScene').on('click',function(){ $(this).jumpToScene(JAG, D); });
		
		// SETUP DEBUG WINDOW TO BE DRAGGABLE WITHOUT JQUERY UI
	 	JAG.OBJ.$Debug.dragDebug();
	};

	// SHOW AND HIDE DEBUG WINDOW
	if(!D.gD.showingDebug){ 
		D.gD.showingDebug=true; JAG.OBJ.$Debug[0].style.display='block';
	}else{ 
		D.gD.showingDebug=false; JAG.OBJ.$Debug[0].style.display='none';
	};

	return $(this);
},




/***********************************************************************************************/
// DEBUG - HORIZON LINES
/***********************************************************************************************/
debugHorizon:function(JAG, D){
	// DEBUGGING HORIZON AND FOREGROUND LINES
	if($(this)[0].checked){			
		var HLTop=((D.sD.horizon.split(',')[0].pF()/100) * D.gD.viewportH.pF()),
			FLTop=((D.sD.horizon.split(',')[1].pF()/100) * D.gD.viewportH.pF());

		// ADD LINES IF THEY DON'T EXIST
		if(!D.$Chapter.find('div.JAG_horizonLine').length) $('<div class="JAG_horizonLine"><div class="JAG_Circle"/></div><div class="JAG_GroundLine"><div class="JAG_Circle"/></div></div>').prependTo(D.$Chapter);

		// STYLE LINES
		D.$Chapter.find('div.JAG_horizonLine').css({width:D.gD.viewportW+'px', left:'0px', top:HLTop+'px'});
		D.$Chapter.find('div.JAG_GroundLine').css({width:D.gD.viewportW+'px', left:'0px', top:FLTop+'px'});
	}else{
		// REMOVE LINES
		if(D.$Chapter.find('div.JAG_horizonLine').length){ D.$Chapter.find('div.JAG_horizonLine').add(D.$Chapter.find('div.JAG_GroundLine')).remove(); };
	};
},




/***********************************************************************************************/
// DEBUG - FOREGROUND SHOW/HIDE
/***********************************************************************************************/
debugForeground:function(JAG, D){
	if(JAG.OBJ.$foreground[0]!==undefined) JAG.OBJ.$foreground[0].style.display=$(this)[0].checked ? 'none' : 'block';
},



/***********************************************************************************************/
// DEBUG - PATH SHOW/HIDE
/***********************************************************************************************/
debugPath:function(JAG, D){
	$(JAG.OBJ.$canvas).css('display',$(this)[0].checked ? 'block' : 'none');	
},



/***********************************************************************************************/
// DEBUG - ITEM BOUNDARY LINES
/***********************************************************************************************/
debugItemLines:function(JAG, D){
	if($(this)[0].checked){ 
		D.$Scene.find('div.JAG_Item').addClass('JAG_itemLines');
	}else{ 
		D.$Scene.find('div.JAG_Item').removeClass('JAG_itemLines'); 
	};
},



/***********************************************************************************************/
// DEBUG - CHARACTER BOUNDARY LINES
/***********************************************************************************************/
debugCharLines:function(JAG, D){
	if(D.$Scene.find('div.JAG_Char').length){	
		if($(this)[0].checked){ 
			D.$Char.addClass('JAG_charLines'); 		
			if(!D.$Scene.find('.JAG_charSpot').length) D.$Scene.append('<div class="JAG_charSpot"/>');	
		}else{
			D.$Char.removeClass('JAG_charLines'); 
			D.$Scene.find('div.JAG_charSpot').remove();
		};
	};
},



/***********************************************************************************************/
// DEBUG - SCENE PANNING (SHOW CLIPPING)
/***********************************************************************************************/
debugSceneClipping:function(JAG, D){
	if($(this)[0].checked && D.sD.pan){
		// ADD MIDLINE
		if(!D.$Chapter.find('div.JAG_midLine').length) $('<div class="JAG_midLine"/>').prependTo(D.$Chapter);
		
		// SHOW CLIPPING
		D.$Chapter[0].style.overflow='visible';

		// STYLE MIDLINE
		D.$Chapter.find('div.JAG_midLine').css({height:D.gD.viewportH+'px', left:(D.gD.viewportW/2)+'px', top:'0px'});
	}else{
		// REMOVE MIDLINE AND HIDE CLIPPING
		D.$Chapter.css('overflow','hidden').find('div.JAG_midLine').remove();
	};			
},


/***********************************************************************************************/
// DEBUG - TOGGLE ITEM VISIBILITY (HELPS WITH POSITIONING ITEMS)
/***********************************************************************************************/
debugOpacity:function(JAG, D){
	if($(this)[0].checked){
		D.$Chapter.find('div.JAG_Item').css('opacity',0);
	}else{
		D.$Chapter.find('div.JAG_Item').css('opacity',1);		
	};
},



/***********************************************************************************************/
// DEBUG - JUMP TO SCENE
/***********************************************************************************************/
jumpToScene:function(JAG, D){
	// RETURN IF SCENE VALUE LENGTH IS TOO SMALL OR EMPTY
	var $goto=JAG.OBJ.$Debug.find('input[name="jumpTo"]');
	if($goto.val().length <=1 || $goto==undefined || D.gD.switchingScenes) return;
	
	// CHECK IF SCENE EXISTS
	if(!$('#'+$goto.val().toString()).length){ 
		alert("Invalid Scene"); 
	}else{
		// TRANSITION TO NEXT SCENE
		$(D.$Scene).transSceneOut(JAG, $('#'+$goto.val().replace(/ /g,''))[0]);
	};
}});



/***********************************************************************************************/
// DRAG FUNCTIONALITY FOR DEBUG WINDOW
/***********************************************************************************************/
(function($) {
    $.fn.dragDebug=function(opt){
        opt=$.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle===""){ var $el=this;
        }else{ var $el=this.find(opt.handle); };

        return $el.css('cursor', opt.cursor).on("mousedown", function(e){
            if(opt.handle===""){
                var $drag=$(this).addClass('draggable');
            }else{
                var $drag=$(this).addClass('active-handle').parent().addClass('draggable');
            };
			
            var z_idx=$drag.css('z-index'),
                drg_h=$drag.outerHeight(),
                drg_w=$drag.outerWidth(),
                pos_y=$drag.offset().top+drg_h-e.pageY,
                pos_x=$drag.offset().left+drg_w-e.pageX;
				
            $drag.css('z-index', 1000).parents().on("mousemove", function(e){
                $('.draggable').offset({
                    top:e.pageY+pos_y-drg_h,
                    left:e.pageX+pos_x-drg_w

                }).on("mouseup", function(){
					$(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); 
			
        }).on("mouseup", function(){
            if(opt.handle===""){ $(this).removeClass('draggable');
            }else{ $(this).removeClass('active-handle').parent().removeClass('draggable'); };
        });
    };
})(jQuery);