var Lorenzo = require('./Lorenzo');
var BullFighter = require('./BullFighter');
var AngryMobber = require('./AngryMobber.class');

var LorenzoGame = {
	init: function(){
		this.game = new Phaser.Game(160, 96, Phaser.AUTO, '', { preload: this.preload, create: this.create, update: this.update }, false, false);
	},
	preload: function() {
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.spritesheet('stage1-anim', 'img/stage1-ppl.png', 160, 96);
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.image('stage2', 'img/stage2.png');
		this.game.load.image('stage3', 'img/stage3.png');
		this.game.load.image('stage3-mid0', 'img/stage3-mid.png');
		this.game.load.spritesheet('sprites', 'img/sprites.png', 14, 14);
	},
	create: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.add.sprite(0, 0, 'stage1');
		LorenzoGame.peopleSprite = this.game.add.sprite(0, 0, 'stage1-anim', 0);
		LorenzoGame.peopleSprite.animations.add('cheer', [0, 1], 2, true);
		LorenzoGame.peopleSprite.animations.play('cheer');
		Lorenzo.init(LorenzoGame);
		BullFighter.init(LorenzoGame);
		Lorenzo.enemy = BullFighter;
		BullFighter.enemy = Lorenzo;
		LorenzoGame.entities = [];
		LorenzoGame.entities.push(Lorenzo);
		LorenzoGame.entities.push(BullFighter);
	}, 
	update: function() {
		for (var i = 0; i < LorenzoGame.entities.length; i++){
			LorenzoGame.entities[i].update();
		}
	},
	addMobber: function(){
		this.entities.push(new AngryMobber(this.game, -40, Math.floor(Math.random()*32)+64, Lorenzo));
	}
}

// Polyfills
Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}

window.LorenzoGame = LorenzoGame;

module.exports = LorenzoGame;