var Lorenzo = require('./Lorenzo');
var Lorenza = require('./Lorenza');
var BullFighter = require('./BullFighter');
var AngryMobber = require('./AngryMobber.class');
var Butcher = require('./Butcher.class');
var RunningObstacle = require('./RunningObstacle.class');
var Util = require('./Util');

var PhaserStates = {
	preload: function() {
		if (!this.game.device.desktop){
 			this.game.load.script('joystick', 'phaser-virtual-joystick.min.js');
 			this.game.load.atlas('dpad', 'img/dpad.png', 'dpad.json');
 		}
		this.game.load.image('title1', 'img/title1.png');
		this.game.load.image('title2', 'img/title2.png');
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.spritesheet('stage1-anim', 'img/stage1-ppl.png', 160, 96);
		this.game.load.image('stage1', 'img/stage1.png');
		this.game.load.image('stage2', 'img/stage2.png');
		this.game.load.image('stage2-ind', 'img/stage2-ind.png');
		this.game.load.image('stage3', 'img/stage3.png');
		this.game.load.spritesheet('digits', 'img/digits.png', 6, 10);
		this.game.load.audio('fight', ['ogg/fight.ogg', 'mp3/fight.mp3']);
		this.game.load.audio('run', ['ogg/run.ogg', 'mp3/run.mp3']);
		
		this.game.load.audio('death', ['wav/death.wav']);
		this.game.load.audio('hitEnemy', ['wav/hitEnemy.wav']);
		this.game.load.audio('hitObstacle', ['wav/hitObstacle.wav']);
		this.game.load.audio('enemyAttack', ['wav/enemyAttack.wav']);
		this.game.load.audio('ole', ['wav/ole.wav']);
		this.game.load.audio('respawn', ['wav/respawn.wav']);

		this.game.load.spritesheet('sprites', 'img/sprites.png', 14, 14);
	},
	create: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
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
	SFX_MAP: {},
	playSFX: function(key){
		this.SFX_MAP[key].play();
	},
	start: function(){
		this.SFX_MAP['death'] = this.game.add.audio('death',0.5, false);
		this.SFX_MAP['hitEnemy'] = this.game.add.audio('hitEnemy',0.5, false);
		this.SFX_MAP['hitObstacle'] = this.game.add.audio('hitObstacle',0.5, false);
		this.SFX_MAP['ole'] = this.game.add.audio('ole',0.5, false);
		this.SFX_MAP['enemyAttack'] = this.game.add.audio('enemyAttack',0.5, false);
		this.SFX_MAP['respawn'] = this.game.add.audio('respawn',0.5, false);
		this.scoreSprites = [];
		
		this.mainGroup = this.game.add.group();
		this.hudGroup = this.game.add.group();

		this.stageGroup = this.game.add.group(this.mainGroup);
		this.setStage1();
		Lorenzo.init(this);
		BullFighter.init(this);
		Lorenzo.enemy = BullFighter;
		BullFighter.enemy = Lorenzo;
		this.entities = [];
		this.entities.push(Lorenzo);
		this.entities.push(BullFighter);
		this.stage1Music = this.game.add.audio('fight',0.5, true);
		this.stage1Music.play();
		for (var i = 0; i < 4; i++){
			this.scoreSprites[i] = this.game.add.sprite(70+i*8, 2, 'digits', 0, this.hudGroup);
		}
		this.updateScore();
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
			 	Lorenzo.reduceScore(6);
			 	this.playSFX('hitObstacle');
			 	Lorenzo.invulnerableCount = 40;
			 	if (Lorenzo.sprite.x <= 20){
			 		Lorenzo.hit();
			 		this.indicatorSprite.animations.stop();
			 		this.indicatorSprite.body.velocity.x = 0;
					for (var i = 0; i < this.mobberSprites.length; i++){
						this.mobberSprites[i].animations.play('attack');
					}
			 	}
	    	}
	    	if (this.indicatorSprite.x > 150){
	    		Lorenzo.invulnerableCount = 9999;
	    		Lorenzo.sprite.body.velocity.x = 60;
	    	}
	    	if (Lorenzo.sprite.x > 140){
	    		this.setStage3();
	    	}
		}
	},
	updateScore: function(){
		for (var i = 0; i < 4; i++){
			this.scoreSprites[i].visible = false;
		}
		var stringScore = Lorenzo.score + '';
		for (var i = 0; i < stringScore.length; i++){
			this.scoreSprites[i].loadTexture('digits', parseInt(stringScore.charAt(i)));
			this.scoreSprites[i].visible = true;
		}
	},
	addMobber: function(){
		if (Lorenzo.stage === 1)
			this.entities.push(new AngryMobber(this, -20, Math.floor(Math.random()*32)+64, Lorenzo, this.mobbersGroup));
	},
	addButcher: function(){
		var distance = Math.floor(Math.random()*60);
		this.entities.push(new Butcher(this, Math.random() > 0.5 ? 160+distance : -distance, Math.floor(Math.random()*32)+64, Lorenzo, Lorenza, this.butchersGroup));
		if (!Lorenzo.dead && --this.pendingButchers > 1)
			this.game.time.events.add(Math.floor(Math.random()*50)*100+5000, this.addButcher, this);
		this.butcherSprites[--this.currentButcher].visible = false;
	},
	RUNNING_BULL: {
		anim: [27, 28, 29, 28],
		bounds: [10, 5, 0, 9]
	},
	RUNNING_FOOL: {
		anim: [30, 31, 32, 31],
		bounds: [4, 5, 3, 7]
	},
	addRunningBull: function(){
		if (Lorenzo.stage === 2){
			this.entities.push(new RunningObstacle(this.game, Lorenzo, 180, Math.floor(Math.random()*32)+64, Math.random() > 0.5 ? this.RUNNING_FOOL : this.RUNNING_BULL, this.bullsGroup));
			if (!Lorenzo.dead)
				this.game.time.events.add(Math.floor(Math.random()*500)+400, this.addRunningBull, this);
		} 
	},
	stage1Shocking: function(){
		this.peopleSprite.animations.stop();
		this.stage1Music.stop();
		this.stage1Music.destroy();
		Lorenzo.score++;
		this.updateScore();
	},
	setStage1: function(){
		this.game.add.sprite(0, 0, 'stage1', 0, this.stageGroup);
		this.peopleSprite = this.game.add.sprite(0, 0, 'stage1-anim', 0, this.stageGroup);
		this.peopleSprite.animations.add('cheer', [0, 1], 2, true);
		this.peopleSprite.animations.play('cheer');
		this.titleSprite = this.game.add.sprite(0, 0, 'title1', 0, this.stageGroup);
		if (this.game.device.desktop){
			this.game.time.events.add(3000, function(){
				this.titleSprite.loadTexture('title2');
			}, this);
		}
		this.game.time.events.add(8000, function(){
			this.titleSprite.destroy();
		}, this);
		this.mobbersGroup = this.game.add.group(this.mainGroup);
		Lorenzo.stage = 1;
	},
	setStage2: function(){
		// Wipe out Stage 1
		this.stageGroup.destroy(true);
		this.mobbersGroup.destroy(true);
		// Set stage 2
		this.framecount = 10;
		this.stageGroup = this.game.add.group(this.mainGroup);
		this.back1Sprite = this.game.add.sprite(0, 0, 'stage2', 0, this.stageGroup);
		this.back2Sprite = this.game.add.sprite(160, 0, 'stage2', 0, this.stageGroup);
		this.game.add.sprite(6, 4, 'stage2-ind', 0, this.stageGroup);
		this.indicatorSprite = this.game.add.sprite(0, 0, 'sprites', 0, this.stageGroup);
		this.game.physics.arcade.enable(this.indicatorSprite);
		this.indicatorSprite.animations.add('run', [3, 4, 5], 5, true);
		this.indicatorSprite.animations.play('run');
		this.indicatorSprite.body.velocity.x = 4;
		Lorenzo.invulnerableCount = 0;
		Lorenzo.sprite.bringToTop();
		Lorenzo.sprite.x = 90;
		Lorenzo.sprite.y = 60;
		Lorenzo.stage = 2;
		this.bullsGroup = this.game.add.group(this.mainGroup);
		this.mobberSprites = [];
		for (var i = 0; i < 4; i++){
			var mobberSprite = this.game.add.sprite(-3 + Util.rand(0, 10), 50 + i*13, 'sprites', 12, this.stageGroup);
			mobberSprite.animations.add('run', [15, 16, 17], 5, true);
			mobberSprite.animations.add('attack', [12, 13, 14, 13], 5, true);
			mobberSprite.animations.play('run');
			this.mobberSprites.push(mobberSprite);
		}
		this.addRunningBull();
		this.updateScore();
	},
	setStage3: function(){
		// Wip out Stage 2
		this.stageGroup.destroy(true);
		//this.bullsGroup.destroy(true);
		this.mobbersGroup.destroy(true); //TODO: Remove this after tests
		// Set stage 3
		this.stage1Music.stop();
		this.stage1Music.destroy();
		this.stage1Music = false;
		/*this.stage1Music = this.game.add.audio('fight',0.5, true);
		this.stage1Music.play();*/
		Lorenzo.stage = 3;
		this.stageGroup = this.game.add.group(this.mainGroup);
		this.game.add.sprite(0, 0, 'stage3', 0, this.stageGroup);
		Lorenzo.sprite.bringToTop();
		Lorenza.init(this, Lorenzo);
		Lorenzo.sprite.x = 60;
		Lorenzo.sprite.y = 60;
		var BUTCHERS = 15;
		this.pendingButchers = BUTCHERS;
		this.killedButchers = 0;
		this.currentButcher = BUTCHERS;
		this.butcherSprites = [];
		this.entities = [];
		this.entities.push(Lorenzo);
		for (var i = 0; i < BUTCHERS; i++){
			this.butcherSprites[i] = this.game.add.sprite(i*10, 12, 'sprites', 12, this.stageGroup); 
		}
		for (var i = 0; i < 2; i++){
			this.addButcher();
		}
	},
	killButcher: function(){
		if (++this.killedButchers === 15){
			/*this.stage1Music.stop();
			this.stage1Music.destroy();*/
		}
	},
	getClosestButcher: function(){
		var minDistance = 99999;
		var closest = false;
		for (var i = 0; i < this.entities.length; i++){
			var entity = this.entities[i];
			if (entity === Lorenzo || entity === Lorenza)
				continue;
			if (entity.dead)
				continue;
			var distance = Util.distance(entity.sprite.x, entity.sprite.y, Lorenzo.sprite.x, Lorenzo.sprite.y);
			if (distance < minDistance){
				minDistance = distance;
				closest = entity;
			}
		}
		return closest;
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