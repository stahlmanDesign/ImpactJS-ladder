/**
 *  @ladder.js
 *  @version: 2.0
 *  @author: Justin Stahlman
 *  @date: Oct 2013
 */
ig.module(
    'game.entities.ladder'
)
.requires(
	'bootstrap.entities.base-ladder'
)
.defines(function () {

EntityLadder = EntityBaseLadder.extend({
	ladderTexture: new ig.Image("media/ladderTexture.png"),
	size: { x: 70, y: 140 }
    });
})