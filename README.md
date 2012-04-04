EntityLadder
============

This is an Entity for  [ImpactJS](http://www.impactjs.com) to allow other entities to climb in a platform game.

Features
--------

 * can walk on top of ladder as if it were ground (instead of falling)
 * can jump off ladder (a timer releases entity momentarily)
 * releases entity from climbing action when ground reached
 * configurable speed (if used on vines it could be slower)
 * majority of code inside ladder.js means other entities require only minor changes to use it 


Example
-------

a demo is available here:
http://impactjs.com/forums/private/ladder-entity


Installation
------------
1. copy the light.js into your entities folder
2. register the class in your main.js:
```
.requires(
	'game.entities.ladder'
)
```

3. add a few variables to your player.js (or other entities that will climb):
```
MyGame = ig.Game.extend({
	canClimb: false,
	isClimbing: false,
	momentumDirection: {'x':0,'y':0},
	ladderReleaseTimer: new ig.Timer(0.0),
	ladderSpeed: 75,
	
	init: function() {
	// this allows the ladder update to work correctly for newly generated players.
	// Ladder sets isClimbing = false in its update() in case player left ladder, but must be in proper order so that player can first move onto ladder
	this.zIndex = -99;
	//don't resort if in weltmeister
	if (!ig.global.wm)ig.game.sortEntitiesDeferred();
}
```

4. starting with the Jump n' Run demo, make a few changes to how movement works in update function (in your player.js):
```
update: function() {
	if (ig.input.state('left')) { //move left
			this.momentumDirection.x = -1;
			this.accel.x = -accel;
			this.flip = true;			
			if (!this.canClimb)this.isClimbing=false; // don't allow moving horizontally off the while in climbing mode

		} else if (ig.input.state('right')) { //move right
			this.momentumDirection.x = 1;
			this.accel.x = accel;
			this.flip = false;			
			if (!this.canClimb)this.isClimbing=false; // don't allow moving horizontally off the while in climbing mode
		}else{
			//this.momentumDirection.x = 0; // optional movement system that doesn't require key being pressed all the time to move
			this.accel.x = 0; // allow friction to stop you
		}
		      
		if( this.canClimb && (ig.input.pressed('up') ||  ig.input.pressed('down' )) ) {           
			
			this.isClimbing = true;
			this.ladderReleaseTimer.set(0.0); // cancel ladderRelease if was jumping. if > 0, cling to ladder. if < 0, allow to jump off/through
			this.vel.x = 0; // don't fall off sides of ladder unless specifically presses left or right
            
			//momentumDirection allows for up, down and idle movement (-1, 0 & 1) to stop vertically on ladders, but keypress need not be constantly pressed to climb
			if (ig.input.pressed('up')) {
				this.momentumDirection.y >-1 ? this.momentumDirection.y -- : this.momentumDirection.y = -1;
			}else if( ig.input.pressed('down' )){
				this.momentumDirection.y <1 ? this.momentumDirection.y ++ : this.momentumDirection.y = 1;
			}
		}                
                       
		// jump
		
		if( (this.standing || this.isClimbing || this.canClimb) && (ig.input.pressed('jump') ) ) {
			this.vel.y = -this.jump;
            
			//allow to jump off ladders
			this.ladderReleaseTimer.set(0.8); // approximate seconds your player takes to jump and fall back down
			this.isClimbing=false;
		}
		
		//when climbing past top of ladder, the entity falls back softly and can walk left or right
		if (!this.standing && !this.canClimb && this.vel.y < 0)this.isClimbing=false;
		
		// prevent fall down ladder if ground touched but ladderReleaseTimer still running from recent jump
		if (this.standing)this.ladderReleaseTimer.set(0.0);
}
```

5. add the entity to your game in Weltmeister
```
	put the rectangle on top of ladders, vines or climable walls on your normal graphics layer.
	(remove collision tiles under the ladder graphics)
```

6. that's it!
```
	each ladder can have its own speed by setting the paramter ladderSpeed in Weltmeister.
	default is 65, which climbs at a normal pace in the Jump n' Run demo.
	However, if you set a ladderSpeed in your climber entity, that will override all ladders set in WM
```
