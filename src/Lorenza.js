var Util = require('./Util');

var Lorenza = {
	init: function(lorenzoGame, lorenzo){
		this.lorenzoGame = lorenzoGame;
		this.lorenzo = lorenzo;
		this.game = lorenzoGame.game;
		this.sprite = this.game.add.sprite(70, 57, 'sprites', 33);
		this.sprite.animations.add('idle', [33, 34], 2, true);
		this.sprite.animations.add('die', [36, 37], 1, false);
		this.sprite.animations.play('idle');
	}, 
	hit: function(){
		this.dead = true;
		this.sprite.animations.play('die');
		this.lorenzoGame.playSFX('death');
		this.lorenzo.reduceScore(5000);
	},
	update: function() {}
}

module.exports = Lorenza;