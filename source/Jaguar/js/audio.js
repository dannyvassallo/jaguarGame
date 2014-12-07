/***********************************************************************************************/
// Jaguar - AUDIO MODULE
/***********************************************************************************************/
$.fn.extend({
/***********************************************************************************************/
// LOAD SCENE-SPECIFIC MUSIC - $Scene.loadMusic(JAG);
/***********************************************************************************************/
// SINCE IPADS SUCK, 1 MUSIC AUDIO TAG IS USED. SRC IS DYNAMICALLY CHANGED AND PLAYED
loadMusic:function(JAG){
	var $Scene=$(this),
		$Music=$('#JAG_Music'),
		sD=$Scene.data('scene');

	if(sD.music){
		// NEW SONG
		if(sD.music!==JAG.Story.currentSong){
			JAG.Story.currentSong=sD.music;
			$Music[0].src='Jaguar/audio/'+sD.music+'.mp3';
			$Music[0].play();
			
			// HANDLE MUSIC LOOPING
			if(sD.loop_music){
				$Music.on('ended', function(){
					this.currentTime=0;
					this.play();
				});
			};
				
		// USING THE SAME SONG		
		}else{
			return;			
		};
	
	// STOP PLAYING
	}else{
		JAG.Story.currentSong=false;
		$Music[0].src='';
	};
},




/***********************************************************************************************/
// PLAY SOUND EFFECT
/***********************************************************************************************/
playSound:function(JAG, file){
	// ADD AUDIO ELEMENT
	var $Effect=$('#JAG_Effect');
	$Effect[0].src='Jaguar/audio/'+file+'.mp3';
	$Effect[0].play();
}});