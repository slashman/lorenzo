var Util = require('./Util');

var Lorenza = {
	init: function(lorenzoGame){
		this.lorenzoGame = lorenzoGame;
		this.game = lorenzoGame.game;
		this.sprite = this.game.add.sprite(70, 57, 'sprites', 0);
		this.sprite.animations.add('idle', [0, 1], 2, true); //TODO: Use Lorenza sprites
		this.sprite.animations.add('die', [21, 22], 1, false);
		this.sprite.animations.play('idle');
	}, 
	hit: function(){
		this.dead = true;
		this.sprite.animations.play('die');
	},
	update: function() {}
}

module.exports = Lorenza;