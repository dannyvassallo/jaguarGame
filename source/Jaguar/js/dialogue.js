/***********************************************************************************************/
// Jaguar - DIALOGUE TEXT MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// POSITION AND SHOW SPEECH TEXT  $item.saySomething(JAG, $Char, speech);
/***********************************************************************************************/
saySomething:function(JAG, $Char, speech){
	if(speech === undefined) return;

	var $Item=$(this), 
		cD=$Char.data('character'),
		totalQuestions=speech.length;

	// MAKE SURE ALL PREVIOUS TEXT IS DONE-DONE [ADD NEW P ELEMENTS]
	$Char.next('p.JAG_Char_Dialogue').remove();
	$('<p class="JAG_Char_Dialogue"/>').insertAfter($Char);
	var $Text=$Char.next('p.JAG_Char_Dialogue');

	// FULL CONVERSATION
	if($.isArray(speech) && speech[0]!==undefined){

		// ADD DIALOGUE PANEL
		if(!$('#JAG_dialogue').length) $('<div id="JAG_dialogue"/>').insertBefore($('div.JAG_Panel'));
		var $DiagPanel=$('#JAG_dialogue'), questions='';
			
		// LOOP THROUGH QUESTIONS (speech[question block][question || answer][string]
		for(var i=0; i<totalQuestions; i++){
			questions+='<div class="JAG_question">'+speech[i][0][0].split('||')[0]+'</div>'; 
		};
		
		// ADD QUESTIONS, SHOW DIALOG PANEL
		$DiagPanel.html(questions).stop(true,false).fadeTo(1, 500);

		// CLICK QUESTION TO ASK
		$DiagPanel.stop(true,false).animate({opacity:1},{duration:300, queue:false})
			.find('div.JAG_question').on('click',function(){

			// RETURN IF SOMEONE IS ALREADY TALKING			
			for(var i=0, l=$('p.JAG_Char_Dialogue').length; i<l; i++){
				if($($('p.JAG_Char_Dialogue')[i]).css('opacity').pF()>0) return;
			};
	
			// START CONVERSATION
			D.$Char.converse(JAG, $Item, $(this), speech);
		});

	// SINGLE LINE RESPONSE FROM MAIN CHARACTER
	}else{
		// DIALOGUE WITH THIS CHARACTER HAS BEEN COMPLETED		
		if($.isArray(speech)) var speech=JAG.Speech.talk_no_more;
		D.sD.talking=true;
				
		// HIDE AFTER READ
		$Text.css({color:cD.text_color, display:'block', opacity:1}).html(speech).textDims(JAG, $Char, cD)
			.stop(true,false).delay(speech.length * D.sD.text_time.pF())
			.animate({opacity:0},{duration:600,queue:true,complete:function(){
				D.sD.talking=false;
				$Text[0].style.display='none';		
		}});		
	};
},







/***********************************************************************************************/
// HANDLE CONVERSATIONS - $Char.converse(JAG, $AuxChar, $question, speed);
/***********************************************************************************************/
converse:function(JAG, $AuxChar, $question, speech){
	D.sD.talking=true;
	
	// CALCULATE POSITIONS FOR TEXT
	var $Char=$(this),
		cD=$Char.data('character'),
		$DiagPanel=$('#JAG_dialogue'),
		$Text=$Char.next('p.JAG_Char_Dialogue'),
		AcD=$AuxChar.data('character'),
		$AuxText=$AuxChar.next('p.JAG_Char_Dialogue'),
		question=$question.text().split('||')[0],
		textTime=D.sD.text_time.pF(),
		// INDEX OF QUESTION CLICKED
		Q_Index=$question.index();


	// 1. POSE THE QUESTION - POSITION TEXT [MAKE SURE WITHIN VIEWPORT] AND SET TALKING SPRITE
	$Text.css({color:cD.text_color, display:'block', opacity:1}).html(question).textDims(JAG, $Char, cD);
		$Char.find('img')[0].src=$Char.loadSprite(JAG, cD, 'talk_to');


	// 2. FADE-OUT QUESTION - HIDE TEXT AND STOP TALKING
	$Text.delay(Math.max(question.length.pF() * textTime,1500)).animate({opacity:0},{duration:800, queue:true, complete:function(){		

		D.sD.talking=false;
		$Text[0].style.display='none';
		$Char.find('img')[0].src=$Char.loadSprite(JAG, cD, 'stopping');

		var relatedQs=AcD.talk_to_text[Q_Index],
			numQs=relatedQs.length;
			
		// LOOP THROUGH FOLLOWUP QUESTIONS
		for(var i=0; i<numQs; i++){
			var response=AcD.talk_to_text[Q_Index][i][0].split('||')[1];

			// UPDATE QUESTION - POSITION WITHIN VIEWPORT
			$AuxText.css({color:AcD.text_color, display:'block', opacity:1}).html(response).textDims(JAG, $AuxChar, AcD);

			// START TALKING - AUX CHARACTER RESPONSE
			D.sD.talking=true;					
			$AuxChar.find('img')[0].src=$AuxChar.loadSprite(JAG, AcD, 'talk_to');
			var timeToShowResponse=Math.max(response.length*textTime,1500);

			// UPDATE OR REMOVE QUESTION
			if(i!==numQs-1){
				$question.html(AcD.talk_to_text[Q_Index][i+1][0].split('||')[0]); 
			}else{
				// NO MORE FOLLOWUP QUESTIONS
				$question.remove();
			};

			// REMOVE FOLLOWUP QUESTION FROM ARRAY
		    AcD.talk_to_text[Q_Index].splice(i, 1);
			// REMOVE WRAPPER ARRAY IS NO MORE FOLLOWUP QUESTIONS
			if(AcD.talk_to_text[Q_Index].length===0) AcD.talk_to_text.splice(Q_Index, 1);
			break;
		};
		

		/*** STOP TALKING - AUX CHARACTER ***/
		$AuxText.stop(true,false).delay(timeToShowResponse).animate({opacity:0},{duration:800, queue:true, complete:function(){
			D.sD.talking=false;
			$AuxChar.find('img')[0].src=$AuxChar.loadSprite(JAG, AcD, 'stopping');
			
			$AuxText[0].style.display='none';

			// NO QUESTIONS LEFT
			if(!$DiagPanel.find('div.JAG_question').length){
				
				// ++EXPERIENCE POINTS FOR FULLY TALKING TO THIS CHARACTER
				if(AcD.value.pF() > 0){
					D.gD.experience+=AcD.value.pF(); 
					if(JAG.OBJ.$EXP) JAG.OBJ.$EXP.html(D.gD.experience);
					AcD.value=0;					
				};
				
				// CLOSE DIALOG PANEL
				$DiagPanel.closeDiag(JAG);
				
				// PERFORM SECONDARY ACTIONS
				if(AcD.done_talking) $AuxChar.actionLoop(JAG, AcD.done_talking, 'done_talking');
			};
		}});
		
	}});
},




/***********************************************************************************************/
// POSITIONS TEXT WITHIN VIEWPORT AND CENTERED OVER CHARACTER
/***********************************************************************************************/
textDims:function(JAG, $Char, cD){
	// PERMITTED POSITIONS OF TEXT (SMALLEST=20 TO KEEP ON SCREEN TOP/LEFT)
	var	$Text=$(this),
		txtW=$Text.outerWidth(true), 
		txtH=$Text.outerHeight(true),
		H=$Char.height(),
		mT=$Char.css('margin-top').pF(),
		vW=D.gD.viewportW.pF(),
		vH=D.gD.viewportH.pF(),
		buffer=50; // VIEWPORT BUFFER	

	// ADJUST WIDTH OF TEXT IF LARGER THAN 60% OF VIEWPORT
	if(txtW > vW*.7){
		$Text[0].style.width=vW*.7;
		var txtW=vW*.7, txtH=$Text.outerHeight(true);
	};
	
	// TOP / LEFT
	var Qtop=Math.max(cD.CharY-txtH+mT-20,buffer),
		Qleft=Math.max(cD.CharX-(txtW/2),buffer);
	
	// BOTTOM / RIGHT
	if(Qtop > (vH-txtH-buffer)) var Qtop=vH-txtH-buffer;
	if(Qleft > (vW-txtW-buffer)) var Qleft=vW-txtW-buffer;
	
	// POSITION TEXT	
	$Text.css({top:Qtop+'px', left:Qleft+'px'});
	
	return $Text;
},




/***********************************************************************************************/
// CLOSE DIALOG PANEL - $DiagPanel.closeDiag(JAG);
/***********************************************************************************************/
closeDiag:function(JAG){
	var $DiagPanel=$(this);

	$DiagPanel.stop(true,false).animate({opacity:0},{duration:500,queue:false,complete:function(){
		D.sD.talking=false;
		$DiagPanel.remove();
	}});			
}});