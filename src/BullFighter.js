var Util = require('./Util')
var BullFighter = {
	framesToReact: 100,
	oles: 4,
	init: function(lorenzoGame){
		this.lorenzoGame = lorenzoGame;
		this.game = lorenzoGame.game;
		this.sprite = this.game.add.sprite(90, 60, 'sprites', 6);
		this.sprite.anchor.setTo(.5, 0);
		this.game.physics.arcade.enable(this.sprite);
		this.sprite.body.collideWorldBounds = true;
		this.sprite.animations.add('idle', [6, 7], 2, true);
		this.sprite.animations.add('attack', [6, 7, 8, 7], 5, true);
		this.sprite.animations.add('run', [9, 10, 11], 5, true);
		this.sprite.animations.add('victory', [24, 25], 2, true);
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.sprite.animations.play('idle');
	},
	_flipSprite: function(){
		this._flipped = !this._flipped;
		this.sprite.scale.x *= -1;
	},
	update: function(){
		if (this.enemy){
			if ( (this.enemy.sprite.x > this.sprite.x && this._flipped) || 
				 (this.enemy.sprite.x < this.sprite.x && !this._flipped) ){
				this._flipSprite();
			}
		}
		if (this.attacking){
			if (this.deadly){
				if (this._distanceToEnemy() < 10){
					this.enemy.hit(this._flipped ? -1 : 1);
					this.deadly = false;
					if (this.enemy.dead){
						this.sprite.animations.stop();
					}
				}
			}
		} 
		if (this._react()){
			this._doAI();	
		}

		if (this.sprite.y < 54) {
			this.sprite.body.velocity.y = 0;
			this.sprite.y = 54;
	    }
	    if (this.sprite.y > 82){
	    	this.sprite.body.velocity.y = 0;
			this.sprite.y = 82;	
	    }
	},
	_react: function(){
		if (this.dead)
			return;
		this.framesToReact --;
		if (--this.framesToReact < 0){
			this.framesToReact = Math.floor(Math.random()*30)+30;
			return true;
		}
		return false;
	},
	_doAI: function(){
		if (this.attacking || this.oleing){

		} else if (this.enemy.dead){
			this.sprite.animations.play('victory');
			var vectors = this._getDirectionalVectorsToCenter();
	        this.sprite.body.velocity.x = vectors.x * 40;
	        this.sprite.body.velocity.y = vectors.y * 20;
		} else if (this._attackBull()){
			this.attacking = true;
			this.sprite.animations.play('attack');
			// Attack animation is 5 FPS, meaning each frame takes 200ms. 
			this.game.time.events.add(400, this._setDeadly, this);
			this.game.time.events.add(600, this._resetDeadly, this);
			this.game.time.events.add(800, this._resetMovement, this);
		} else {
			var idle = true;
			if (this._getCloserToBull()) {
				idle = false;
				var vectors = this._getDirectionalVectors();
		        this.sprite.body.velocity.x = vectors.x * 40;
		        this.sprite.body.velocity.y = vectors.y * 20;
		    } else if (this._getFartherFromBull()){
		    	idle = false;
				var vectors = this._getDirectionalVectors();
		        this.sprite.body.velocity.x = vectors.x * 40 * -1;
		        this.sprite.body.velocity.y = vectors.y * 20 * -1;
		    } else {
		    	this.sprite.body.velocity.x = 0;
		    	this.sprite.body.velocity.y = 0;
		    }
		    if (idle){
		    	this.sprite.animations.play('idle');
		    } else {
		    	this.sprite.animations.play('run');
		    }

		}
	},
	hit: function(dir){
		if (--this.oles > 0){
			this.ole();
		} else {
			this.die(dir);
		}
	},
	ole: function(){
		this.sprite.animations.stop();
        this.sprite.frame = 18;
        this.oleing = true;
        this.game.time.events.add(600, this._resetOleing, this);
        if (this.sprite.y > 70){
        	this.sprite.y -= 5;
        } else {
        	this.sprite.y += 5;
        }

	},
	isInvulnerable: function(){
		return this.oleing || this.attacking;
	},
	_resetOleing: function(){
		this.oleing = false;
	},
	die: function(direction){
		this.sprite.animations.stop();
		this.lorenzoGame.stage1Shocking();
		this.dead = true;
		this.sprite.frame = 19;
		this.sprite.body.velocity.x = 30 * direction; 
		this.game.time.events.add(1500, this._layDead, this);
	},
	_layDead: function(){
		this.sprite.frame = 20;
		this.game.time.events.add(3000, this.enemy.bullfighterDead, this.enemy);
	},
	_distanceToEnemy: function(){
		return Util.distance(this.sprite.x, this.sprite.y, this.enemy.sprite.x, this.enemy.sprite.y);
	},
	_attackBull: function(){
		return this._distanceToEnemy() < 10;
	},
	_getCloserToBull: function(){
		return this._distanceToEnemy() > 35;
	},
	_getFartherFromBull: function(){
		return this._distanceToEnemy() < 5;
	},
	_getDirectionalVectors: function(){
		return {
			x: Math.sign(this.enemy.sprite.x - this.sprite.x),
			y: Math.sign(this.enemy.sprite.y - this.sprite.y)
		}
	}, 
	_getDirectionalVectorsToCenter: function(){
		return {
			x: Math.sign(80 - this.sprite.x),
			y: Math.sign(80 - this.sprite.y)
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
	}
}

module.exports = BullFighter;