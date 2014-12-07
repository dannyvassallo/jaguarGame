/* PRODUCTION NOTES


TO DO

GENERAL
-------

	[FINAL]
	add contextmenu, consolidate js scripts by writing them to the head in the jquery-jaguar js file

	

	RELEASED WITH THE FOLLOWING CAVEATS
	1. save and load (inventory issue) (may need to produce duplicate objects for inventory items	
	2. on slow connection items are visible (only on first load)
	3. when changing the sprite to still guybrush, do a check to make sure he isn't still moving
	4. scene panning issue when heading right (workaround, position char and use next_pan)
	5. say_after isn't working in all instances

	
	WAY DOWN THE ROAD (MAYBE NEVER)
	1. sound effects not working on ipad	
	2. possibly find a workaround for ie9/10 pointer-events (passing events through the foreground) (should work in ie11)
	3. try doing a tap/hold for double click to exit on ipad	
	4. disable double tap zoom on ipad

*/