var Lorenzo = require('./Lorenzo');
var BullFighter = require('./BullFighter');
var AngryMobber = require('./AngryMobber.class');
var RunningObstacle = require('./RunningObstacle.class');
var Util = require('./Util');

var PhaserStates = {
	preload: function() {
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.spritesheet('stage1-anim', 'img/stage1-ppl.png', 160, 96);
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.image('stage2', 'img/stage2.png');
		this.game.load.image('stage2-ind', 'img/stage2-ind.png');
		this.game.load.image('stage3', 'img/stage3.png');
		this.game.load.image('stage3-mid0', 'img/stage3-mid.png');
		this.game.load.spritesheet('sprites', 'img/sprites.png', 14, 14);
	},
	create: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		LorenzoGame.start();
	}, 
	update: function() {
		LorenzoGame.update();
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
	update: function(){
		for (var i = 0; i < this.entities.length; i++){
			if (!this.entities[i].sprite.body){
				this.entities.splice(i,1);
				i--;
				continue;
			}
			this.entities[i].update();
		}
		if (!Lorenzo.dead && Lorenzo.stage === 2){
			if (--this.framecount <= 0){
				this.framecount = 1;
				this.back1Sprite.x --;
				this.back2Sprite.x --;
				if (this.back1Sprite.x <= -160)
					this.back1Sprite.x = 160;
				if (this.back2Sprite.x <= -160)
					this.back2Sprite.x = 160;
			}
			if (Lorenzo.invulnerableCount){
				Lorenzo.invulnerableCount--;
			}
			if (Lorenzo.invulnerableCount <= 0 && this.game.physics.arcade.collide(Lorenzo.sprite, this.bullsGroup, Util.noop, Util.noop, this)){
			 	Lorenzo.sprite.x -= 5;
			 	Lorenzo.invulnerableCount = 40;
			 	if (Lorenzo.sprite.x <= 20){
			 		Lorenzo.hit();
			 		this.indicatorSprite.animations.stop();
			 		this.indicatorSprite.body.velocity.x = 0;
			 	}
	    	}
	    	if (this.indicatorSprite.x > 150){
	    		Lorenzo.invulnerableCount = 9999;
	    		Lorenzo.sprite.body.velocity.x = 60;
	    	}
	    	if (Lorenzo.sprite.x > 140){
	    		console.log("win");
	    	}
		}
	},
	addMobber: function(){
		if (Lorenzo.stage === 1)
			this.entities.push(new AngryMobber(this.game, -40, Math.floor(Math.random()*32)+64, Lorenzo, this.mobbersGroup));
	},
	addRunningBull: function(){
		if (Lorenzo.stage === 2){
			this.entities.push(new RunningObstacle(this.game, Lorenzo, 180, Math.floor(Math.random()*32)+64, [27, 28, 29, 28], this.bullsGroup));
			if (!Lorenzo.dead)
				this.game.time.events.add(Math.floor(Math.random()*2000)+500, this.addRunningBull, this);
		} 
	},
	setStage1: function(){
		this.game.add.sprite(0, 0, 'stage1', 0, this.stageGroup);
		this.peopleSprite = this.game.add.sprite(0, 0, 'stage1-anim', 0, this.stageGroup);
		this.peopleSprite.animations.add('cheer', [0, 1], 2, true);
		this.peopleSprite.animations.play('cheer');
		this.mobbersGroup = this.game.add.group();
		Lorenzo.stage = 1;
	},
	setStage2: function(){
		// Wipe out Stage 1
		this.stageGroup.destroy(true);
		this.mobbersGroup.destroy(true);
		// Set stage 2
		this.framecount = 10;
		this.stageGroup = this.game.add.group();
		this.back1Sprite = this.game.add.sprite(0, 0, 'stage2', 0, this.stageGroup);
		this.back2Sprite = this.game.add.sprite(160, 0, 'stage2', 0, this.stageGroup);
		this.game.add.sprite(6, 4, 'stage2-ind', 0, this.stageGroup);
		this.indicatorSprite = this.game.add.sprite(0, 0, 'sprites', 0, this.stageGroup);
		this.game.physics.arcade.enable(this.indicatorSprite);
		this.indicatorSprite.animations.add('run', [3, 4, 5], 5, true);
		this.indicatorSprite.animations.play('run');
		this.indicatorSprite.body.velocity.x = 2;
		Lorenzo.invulnerableCount = 0;

		Lorenzo.sprite.bringToTop();
		Lorenzo.sprite.x = 90;
		Lorenzo.sprite.y = 60;
		Lorenzo.stage = 2;
		this.bullsGroup = this.game.add.group();
		for (var i = 0; i < 5; i++){
			var mobberSprite = this.game.add.sprite(-3 + Util.rand(0, 10), 50 + i*10, 'sprites', 12, this.stageGroup);
			mobberSprite.animations.add('run', [12, 13], 5, true);
			mobberSprite.animations.play('run');
		}
		this.addRunningBull();
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