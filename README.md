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
1. copy the bootstrap folder into your lib folder (the ladder is based on Jesse Freeman's "bootstrap" plugins for ImpactJS). This foler contains the base-ladder.js entity which contains most of the plugin code.
2. copy the ladder.js entity into your game/entities folder
3. in player.js, make sure your player is named as per the v1.23 jumpnrun demo: ig.game.player = this;


4. add a few lines of code near the end of your player's update function:

``` javascript

		// ------------------ begin ladder code ------------------
		if (this.isConfiguredForClimbing){
			this.checkForLadder(this);
			if (this.ladderTouchedTimer.delta() > 0) this.isTouchingLadder = false;
			// reset in case player leaves ladder. This allows to walk across/atop ladder
		}
		// ------------------  end  ladder code ------------------

		// Move!
		this.parent();

```

5. Add one or more ladder entities to your game in Weltmeister. The ladder is resizeable and contains its own texture.
