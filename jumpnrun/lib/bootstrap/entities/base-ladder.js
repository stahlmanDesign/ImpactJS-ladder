/**
 *  @base-ladder.js
 *  @version: 2.0
 *  @author: Justin Stahlman
 *  @date: 01 Novembre 2013
 *  @uses code from bootstrap entity
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *	@used with permission
 *
 */
ig.module(
    'bootstrap.entities.base-ladder'
)
.requires(
    'impact.entity'
)
.defines(function () {

	EntityBaseLadder = ig.Entity.extend({
		_wmScalable:true,
		spriteId: 0,			// Use this if you have different sprites in your texture
		ladderTexture: null,	// defined in ladder.js, not in base-ladder.js
		ladderSpeed: 100, 		// default. An entity can override this so different entites climb at different speeds
		gravityFactor:0,
		checkAgainst:ig.Entity.TYPE.A,
		collides:ig.Entity.COLLIDES.NONE,
		zIndex: 3,				// must be in front of entities that can climb when instantiated, due to the order in which WM saves and loads entities.
		eligibleClimbers : [],	// set below in init()

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			if (settings.id != undefined) { this.spriteId = settings.id; }
		},
		update: function() {
			this.eligibleClimbers = [ig.game.player];	// add entites here. Must be in update loop if player killed and regenerated in level after ladder init
			if(!this.eligibleClimbers[0].isConfiguredForClimbing)this.makeEntitiesEligibleClimbers(); // reduce update calls
		},
		makeEntitiesEligibleClimbers:function(){
			if (ig.global.wm) return;
			for (var i=0; i< this.eligibleClimbers.length; i++){
				if(this.eligibleClimbers[i].isConfiguredForClimbing == undefined) {				// if more than one ladder in a level, only instantite ladder code once for the entity
					this.eligibleClimbers[i].zIndex = this.zIndex + 1;					// zIndex can be changed so entity is in front of ladder AFTER instantiation
					this.configureEntityInstanceForClimbing(this.eligibleClimbers[i]);	// this allows EntityPlayer[0] to use ladders. Support for other entities could be added in future
				}
			}
		},
		draw: function() {
			if (!this.ladderTexture) return;
			if (ig.editor) {
				if (this.size.x > this.ladderTexture.width) this.size.x = this.ladderTexture.width;
				if (this.size.y > this.ladderTexture.height) this.size.y = this.ladderTexture.height;
			}
			this.ladderTexture.drawTile(
			this.pos.x - this.offset.x - ig.game._rscreen.x, this.pos.y - this.offset.y - ig.game._rscreen.y, 0, this.size.x, this.size.y, 0, this.spriteId);
		},
		check: function(other) {

			if (other.isConfiguredForClimbing) {
				other.ladderTouchedTimer.set(0.1);										// we are in check function, so there is contact with ladder. Reset it. when reaches 0, that means NOT touching ladder. may need to set this to 0.2 if device processor too slow or too many entities
				other.isTouchingLadder = true; 											// entity is touching ladder, so climbing is now an option if up or down detected
				if (other.ladderReleaseTimer.delta() > -0.1) {							// ladderReleaseTimer almost up ...
					if (other.vel.y < 0 && other.momentumDirection.y != -1) {				// moving up, but not by user input/keypress up, therefore must be jumping
						other.isClimbing = true;												// ladderReleaseTimer almost up so grab on to ladder instead of jumping through. Use this to invoke (optional) climbing animation
					} else {																// ladderReleaseTimer just started ...
						if (other.isClimbing && other.momentumDirection.y != 0) {				// if isClimbing up or down
							if (other.ladderSpeed) this.ladderSpeed = other.ladderSpeed; 			// determine speed. use other.ladderSpeed if exists, otherwise use ladder default this.ladderSpeed
							other.vel.y = this.ladderSpeed * other.momentumDirection.y; 			// change velocity down(1), ide(0) or up(-1)
						} else {																// not climbing up or down, but stick to ladder while falling or jumping to/through it
							other.momentumDirection.y = 0;											// set neutral momentum in y axis
							other.vel.y = 0;														// become idle in y axis
							other.pos.y = other.last.y;												// snap to a y position immediately
							// if (other.isTouchingLadder && other.momentumDirection.y == 0)other.isClimbing = true;
																									// uncomment to always show climbing animation while on ladder, while walking across ladder, while jumping through
																									// leave comment to allow standing/walking atop ladder, and jumping animation (not climbing) when jumping past a ladder
						}
						if (other.momentumDirection.y == 1 && other.pos.y == other.last.y) {	// moving down, but position not changed, therefore at bottom of ladder
							other.momentumDirection.y = 0;											// set neutral momentum in y axis to avoid climbing in place at bottom of ladder
							other.isClimbing = false;												// stop showing (optional) climbing animation
						}
					}
				} else {																// ladderReleaseTimer just started
					other.isTouchingLadder = false;											// jumping off or through ladder, so ignore it
				}
			}

		},
		configureEntityInstanceForClimbing: function(entityInstance){

			entityInstance.isConfiguredForClimbing = true; 			// if a level does not contain a ladder, this will be false so will ignore ladder computation. also ignore on check()
			entityInstance.isTouchingLadder = false;				// determines potential to climb
			entityInstance.isClimbing = false;						// use this to invoke (optional) climbing animation
			entityInstance.momentumDirection = {'x':0,'y':0};		// INTENDED movement on ladder (allows walking past/on top of a ladder and ignoring it unless up or down pressed)
			entityInstance.ladderReleaseTimer = new ig.Timer(0.0);	// timer which allows to briefly ignore ladder when jumping off or through
			entityInstance.ladderTouchedTimer = new ig.Timer(0.0);	// if > 0, then check function not fired so not in contact with ladder
			entityInstance.ladderSpeed = this.ladderSpeed;			// if not set in WM, will use default speed of ladder
			entityInstance.zIndex = this.zIndex+1;					// TODO sometimes player is behind ladder. a fix may be here

			entityInstance.checkForLadder = function(entity){

				if (entity == ig.game.player){					// calculations currently only work for player but support for other entities could be added

					var accel = entity.standing ? entity.accelGround : entity.accelAir;	// determine accel depending if in air or on ground etc.
					if (ig.input.state('left')) { 					// pressed left
						entity.momentumDirection.x = -1;			// set momentum left
						entity.accel.x = -accel;					// set acceleration left
						entity.flip = true;							// animation look left
						if (!entity.isTouchingLadder) {				// not touching ladder
							entity.isClimbing = false; 					// not climbing.  TODO not clear --> Don't allow moving horizontally off the while in climbing mode
						}
					} else if (ig.input.state('right')) { 			// pressed right
						entity.momentumDirection.x = 1;				// set momentum right
						entity.accel.x = accel;						// set acceleration right
						entity.flip = false;						// animation look right
						if (!entity.isTouchingLadder) {				// not touching ladder
							entity.isClimbing = false; 					// not climbing.  TODO not clear --> Don't allow moving horizontally off the while in climbing mode
						}
					} else {									// not pressed left or right
						//this.momentumDirection.x = 0; 			// optional movement system that doesn't require key being pressed all the time to move. Must implement separately in player
						entity.accel.x = 0;							// allow friction to stop you
					}

					if ((entity.isTouchingLadder					// is touching ladder
							&& (ig.input.pressed('up'))			// and pressed
							|| ig.input.pressed('down'))) {		// (or down)
						entity.isClimbing = true;					// is climbing
						entity.ladderReleaseTimer.set(0.0);			// allow grabbing onto ladder if jumping off a ladder. Cancel ladderRelease if was jumping. if > 0, cling to ladder. if < 0, allow to jump off/through
						entity.vel.x = 0; 							// don't allow to fall off sides of ladder (unless specifically presses left or right)

						// momentumDirection allows for up, down and idle movement (-1, 0 & 1) to stop vertically on ladders, but keypress need not be constantly pressed to climb
						if (ig.input.pressed('up')) {
							entity.momentumDirection.y > -1 ? entity.momentumDirection.y-- : entity.momentumDirection.y = -1;

						} else if (ig.input.pressed('down')) {
							entity.momentumDirection.y < 1 ? entity.momentumDirection.y++ : entity.momentumDirection.y = 1;
						}
					}

					// jump
					if ((entity.standing						// if standing,
							|| entity.isClimbing				//    climbing,
							|| entity.isTouchingLadder)			//    or touching ladder
							&& (ig.input.pressed('jump'))) {	//    AND pressed jump
								entity.vel.y = -entity.jump;		// then allow jump (allows jumping off ladder)
								entity.ladderReleaseTimer.set(0.8); // approximate seconds your player takes to jump and fall back down
								entity.isClimbing = false;			// not climbing while in air jumping
					}
					//when climbing past top of ladder, the entity falls back softly and can walk left or right
					if (!entity.standing && !entity.isTouchingLadder && entity.vel.y < 0) {
						entity.isClimbing = false;
					}
					// prevent fall down ladder if ground touched but ladderReleaseTimer still running from recent jump
					if (entity.standing) {
						entity.ladderReleaseTimer.set(0.0)
					}

					// --------- end ladder code
				}
			}
		}
	});
});