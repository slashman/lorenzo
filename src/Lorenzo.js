var Util = require('./Util');

var Lorenzo = {
	attacking: false,
	inBullfight: true,
	stage: 1,
	score: 5000,
	scoreDownTimer: 60,
	init: function(lorenzoGame){
		this.lorenzoGame = lorenzoGame;
		this.game = lorenzoGame.game;
		this.sprite = this.game.add.sprite(60, 60, 'sprites', 0);
		this.sprite.anchor.setTo(.5, 0);
		this.game.physics.arcade.enable(this.sprite);
		this.sprite.body.collideWorldBounds = true;
		this.sprite.body.setSize(10, 5, 0, 9);
		this.sprite.animations.add('idle', [0, 1], 2, true);
		this.sprite.animations.add('attack', [0, 1, 2, 1], 5, true);
		this.sprite.animations.add('run', [3, 4, 5], 5, true);
		this.sprite.animations.add('die', [21, 22], 1, false);
		this.cursors = this.game.input.keyboard.createCursorKeys();
		if (!this.game.device.desktop){
 			this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
 			this.stick = this.pad.addDPad(20, 20, 20, 'dpad');
 			this.stick.scale = 0.2;
			this.attackButton = this.pad.addButton(140, 20, 'dpad', 'button1-up', 'button1-down');
			this.attackButton.scale = 0.4; 
		}
	}, 
	_flipSprite: function(){
		this._flipped = !this._flipped;
		this.sprite.scale.x *= -1;
	},
	isCharging: function(){
		if (this._flipped){
			return this.sprite.body.velocity.x < 0;
		} else {
			return this.sprite.body.velocity.x > 0;
		}
	},
	isStanding: function(){
		return this.sprite.body.velocity.x == 0;
	},
	_distanceToEnemy: function(){
		return Util.distance(this.sprite.x, this.sprite.y, this.enemy.sprite.x, this.enemy.sprite.y);
	},
	hit: function(){
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
		this.dead = true;
		this.sprite.animations.play('die');
		this.lorenzoGame.playSFX('death');
		if (this.inBullfight){
			this.reduceScore(1000);
			this.game.time.events.add(1500, this._addCorpse, this);	
		} else {
			if (this.lorenzoGame.stage1Music)
				this.lorenzoGame.stage1Music.stop();
		}
	},
	_addCorpse: function(){
		var sprite = this.game.add.sprite(this.sprite.x, this.sprite.y, 'sprites', 22, this.lorenzoGame.stageGroup);
		sprite.anchor.setTo(.5, 0);
		if (this._flipped){
			sprite.scale.x *= -1;
		}
		this.sprite.visible = false;
		this.game.time.events.add(1500, this._respawn, this);
	},
	_respawn: function(){
		this.sprite.visible = true;
		this.sprite.bringToTop();
		this.enemy.sprite.bringToTop();
		this.dead = false;
		this.sprite.x = 20;
		this.sprite.y = 20;
		this.lorenzoGame.playSFX('respawn');
	},
	isLeftDown: function(){
 		return this.cursors.left.isDown || (this.stick && this.stick.isDown && this.stick.direction === Phaser.LEFT);
 	},
 	isRightDown: function(){
 		return this.cursors.right.isDown || (this.stick && this.stick.isDown && this.stick.direction === Phaser.RIGHT);
 	},
 	isUpDown: function(){
 		return this.cursors.up.isDown || (this.stick && this.stick.isDown && this.stick.direction === Phaser.UP);
 	},
 	isDownDown: function(){
 		return this.cursors.down.isDown || (this.stick && this.stick.isDown && this.stick.direction === Phaser.DOWN);
 	},
 	isAttackDown: function(){
 		return this.game.input.keyboard.isDown(Phaser.KeyCode.Z) || (this.attackButton && this.attackButton.isDown);
 	},
	update: function() {
		if (this.dead)
			return;
		// Set nearest enemy
		if (this.stage === 3){
			this.enemy = this.lorenzoGame.getClosestButcher();
		}
		if (!this.attacking && this.enemy && !this.enemy.dead){
			if ( (this.enemy.sprite.x > this.sprite.x && this._flipped) || 
				 (this.enemy.sprite.x < this.sprite.x && !this._flipped) ){
				this._flipSprite();
			}
		}
		if (this.attacking && this.enemy){
			if (this.deadly){
				if (this._distanceToEnemy() < 5 && !this.enemy.isInvulnerable()){
					this.enemy.hit(this._flipped ? -1 : 1);
					this.deadly = false;
					if (this.enemy.dead){
						this.sprite.body.velocity.x = 0;
						this.sprite.body.velocity.y = 0;
					}
				}
			}
		} else if (this.stage !== 2 && this.isAttackDown() && (this.isCharging() || this.isStanding())){
			this.attacking = true;
			this.sprite.animations.play('attack');
			// Attack animation is 5 FPS, meaning each frame takes 200ms. 
			this.game.time.events.add(400, this._setDeadly, this);
			this.game.time.events.add(600, this._resetDeadly, this);
			this.game.time.events.add(800, this._resetMovement, this);
		} else {
			var idle = true;
			if (this.stage != 2){
				if (this.isLeftDown()) {
					idle = false;
			        this.sprite.body.velocity.x = -40;
			    } else if (this.isRightDown()) {
			    	idle = false;
			        this.sprite.body.velocity.x = 40;
			    } else {
			    	this.sprite.body.velocity.x = 0;
			    }
			} else {
				idle = false;
				this.sprite.body.velocity.x = 0;
			}
		    if (this.isUpDown()) {
		    	idle = false;
		        this.sprite.body.velocity.y = -20;
		        if (!this.sprite.body.velocity.x && this.stage != 2)
		        	this.sprite.body.velocity.x = 10 * (this._flipped ? -1 : 1);
		    } else if (this.isDownDown()) {
		    	idle = false;
		    	this.sprite.body.velocity.y = 20;
		    	if (!this.sprite.body.velocity.x  && this.stage != 2)
		        	this.sprite.body.velocity.x = 10 * (this._flipped ? 1 : -1);
		    } else {
		    	this.sprite.body.velocity.y = 0;
		    	if (this.stage === 2){
		    		this.sprite.body.velocity.x = 0;
		    	}
		    }
		    if (idle){
		    	this.sprite.animations.play('idle');
		    } else {
		    	this.sprite.animations.play('run');
		    }
		}
		if (this.stage !== 2 && this.enemy && !this.enemy.dead){
			// Time runs out
			if (--this.scoreDownTimer < 0){
				this.reduceScore(10);
				this.scoreDownTimer = 60;
			}
		}
		if (this.sprite.y < 54) {
			this.sprite.body.velocity.y = 0;
			this.sprite.y = 54;
	    }
	    if (this.sprite.y > 82){
	    	this.sprite.body.velocity.y = 0;
			this.sprite.y = 82;	
	    }
	    if (this.sprite.x > 148 && this.stage === 1 && !this.inBullfight){
	    	this.lorenzoGame.setStage2();
	    }
	},
	_setDeadly: function(){
		this.deadly = true;
	},
	_resetDeadly: function(){
		this.deadly = false;
	},
	_resetMovement: function(){
		this.attacking = false;
	},
	bullfighterDead: function(){
		this.inBullfight = false;
		if (this._flipped){
			this._flipSprite();
		}
		this.lorenzoGame.stage1Music = this.game.add.audio('run',0.5, true);
		this.lorenzoGame.stage1Music.play();
		var goSprite = this.game.add.sprite(132, 60, 'sprites', 23, this.lorenzoGame.stageGroup);
		goSprite.animations.add('blink', [23, 26], 2, true);
		goSprite.animations.play('blink');
		for (var i = 0; i < 5; i++){
			//this.lorenzoGame.addMobber();
			this.game.time.events.add(500* i, this.lorenzoGame.addMobber, this.lorenzoGame);
		}

	},
	reduceScore: function(points){
		this.score -= points;
		if (this.score < 0){
			this.score = 0;
		}
		this.lorenzoGame.updateScore();
	}
}

module.exports = Lorenzo;