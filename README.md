ImpactJS-ladder
===============

This is an Entity for  [ImpactJS](http://www.impactjs.com) to allow other entities to climb in a platform game.

Features
--------

 * can walk on top of ladder as if it were ground (instead of falling through)
 * can jump off ladder (a timer releases entity momentarily)
 * releases entity from climbing action when ground reached (doesn't climb in place at bottom)
 * can configure speed (or use ladder's default speed)
 * majority of code inside ladder.js so it should be easy to set up


Example
-------
[a demo](http://impactjs.com/forums/private/ladder-entity "Demo")  is available here

Installation
------------
1. copy the bootstrap folder into your lib folder (the ladder is based on Jesse Freeman's "bootstrap" plugins for ImpactJS so you can drag the size in Weltmeister). This folder contains the base-ladder.js entity which contains most of the plugin code.
2. copy the ladder.js entity into your game/entities folder
3. copy the ladderTexture.png file into your media folder. The plugin should adapt to the size of your texture.
4. in player.js, make sure your player is named as per the v1.23 jumpnrun demo: ig.game.player = this;


5. add these few lines of code near the end of your player's update function:

``` javascript

			// ------------------ begin ladder code ------------------
		    if (this.isConfiguredForClimbing){		// this will only be true if level contains a ladder
		        this.checkForLadder(this);
		        if (this.ladderTouchedTimer.delta() > 0) this.isTouchingLadder = false;
		        // reset in case player leaves ladder. This allows to walk across/atop ladder
		    }else{
			    var ladders = ig.game.getEntitiesByType("EntityLadder")
				if (ladders != undefined) {
			    	for (var i = 0 ; i < ladders.length; i ++){
			    		ladders[i].makeEntitiesEligibleClimbers();
			    	}
				}
		    }
		    // ------------------  end  ladder code ------------------

		// Move!
		this.parent();

```

6. Add one or more ladder entities to your game in Weltmeister. The ladder is resizeable and contains its own texture (if you use a name other than ladderTexture.png, change the filename in ladder.js). The width of your file determines the width of the ladder. The height is adjustable in Weltmeister.
7. You will have to add your own climbing animation for the player, and make sure your player can receive up and down input from the user (bind the arrow keys to "up" and "down" for example)
8. there is a ladderSpeed variable that you can set in Weltmeister. The default is 100. If this is too fast, make the number lower.

Known issues
------------
1. The zIndex is sometimes not right and the player walks behind the ladder. add this right before the ladder code to make player always on top:
			this.zIndex = 99; // put player on top
			ig.game.sortEntitiesDeferred();					// assure player is sorted to be on top so fog of war hides other entities. Also required if using ladder if you want player in front of ladder instead of behind

2. Ladder size MUST be changed by draggin in WM or else ladder will be invisible