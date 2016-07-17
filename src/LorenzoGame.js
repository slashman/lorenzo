var Lorenzo = require('./Lorenzo');
var BullFighter = require('./BullFighter');
var AngryMobber = require('./AngryMobber.class');

var PhaserStates = {
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
		LorenzoGame.start();
	}, 
	update: function() {
		for (var i = 0; i < LorenzoGame.entities.length; i++){
			if (!LorenzoGame.entities[i].sprite.body){
				LorenzoGame.entities.splice(i,1);
				i--;
				continue;
			}
			LorenzoGame.entities[i].update();
		}
	}
};

var LorenzoGame = {
	init: function(){
		this.game = new Phaser.Game(160, 96, Phaser.AUTO, '', { preload: PhaserStates.preload, create: PhaserStates.create, update: PhaserStates.update }, false, false);
	},
	start: function(){
		this.stageGroup = this.game.add.group();
		this.setStage1();
		Lorenzo.init(this);
		BullFighter.init(this);
		Lorenzo.enemy = BullFighter;
		BullFighter.enemy = Lorenzo;
		this.entities = [];
		this.entities.push(Lorenzo);
		this.entities.push(BullFighter);
	},
	addMobber: function(){
		this.entities.push(new AngryMobber(this.game, -40, Math.floor(Math.random()*32)+64, Lorenzo, this.mobbersGroup));
	},
	setStage1: function(){
		this.game.add.sprite(0, 0, 'stage1', this.stageGroup);
		this.peopleSprite = this.game.add.sprite(0, 0, 'stage1-anim', 0, this.stageGroup);
		this.peopleSprite.animations.add('cheer', [0, 1], 2, true);
		this.peopleSprite.animations.play('cheer');
		this.mobbersGroup = this.game.add.group();
		Lorenzo.stage = 1;
	},
	setStage2: function(){
		this.stageGroup.destroy(true);
		this.mobbersGroup.destroy(true);
		this.game.add.sprite(0, 0, 'stage2', this.stageGroup);
		Lorenzo.sprite.bringToTop();
		Lorenzo.sprite.x = 20;
		Lorenzo.sprite.y = 60;
		Lorenzo.stage = 2;
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