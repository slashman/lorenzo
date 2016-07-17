var Util = require('./Util')

function AngryMobber(game, x, y, enemy, group){
	this.game = game;
	this.enemy = enemy;
	this.sprite = this.game.add.sprite(x, y, 'sprites', 12, group);
	this.sprite.anchor.setTo(.5, 0);
	this.game.physics.arcade.enable(this.sprite);
	this.sprite.animations.add('run', [12, 13], 5, true);
	this.sprite.animations.add('attack', [12, 13, 14, 13], 5, true);
	this.sprite.animations.play('run');
};

AngryMobber.prototype = {
	framesToReact: 100,
	_flipSprite: function(){
		this._flipped = !this._flipped;
		this.sprite.scale.x *= -1;
	},
	update: function(){
		if (this.sprite.x > 0)
			this.sprite.body.collideWorldBounds = true;
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
		if (this.attacking){

		} else if (this._attackBull()){
			this.attacking = true;
			this.sprite.animations.play('attack');
			// Attack animation is 5 FPS, meaning each frame takes 200ms. 
			this.game.time.events.add(400, this._setDeadly, this);
			this.game.time.events.add(600, this._resetDeadly, this);
			this.game.time.events.add(800, this._resetMovement, this);
		} else {
			this.sprite.animations.play('run');
			var vectors = this._getDirectionalVectors();
	        this.sprite.body.velocity.x = vectors.x * 40;
	        this.sprite.body.velocity.y = vectors.y * 20;
		}
	},
	hit: function(dir){
		// They are invincible!
	},
	isInvulnerable: function(){
		return true;
	},
	_distanceToEnemy: function(){
		return Util.distance(this.sprite.x, this.sprite.y, this.enemy.sprite.x, this.enemy.sprite.y);
	},
	_attackBull: function(){
		return !this.enemy.dead && this._distanceToEnemy() < 20;
	},
	_getDirectionalVectors: function(){
		return {
			x: Math.sign(this.enemy.sprite.x - this.sprite.x),
			y: Math.sign(this.enemy.sprite.y - this.sprite.y)
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
};

module.exports = AngryMobber;