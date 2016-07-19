var Util = require('./Util')

function Butcher(lorenzoGame, x, y, lorenzo, lorenza, group){
	this.lorenzoGame = lorenzoGame;
	this.game = this.lorenzoGame.game;
	this.enemy = lorenzo;
	this.lorenzo = lorenzo;
	this.lorenza = lorenza;
	this.sprite = this.game.add.sprite(x, y, 'sprites', 12, group);
	this.sprite.anchor.setTo(.5, 0);
	this.game.physics.arcade.enable(this.sprite);
	this.sprite.animations.add('run', [15, 16, 17], 5, true);
	this.sprite.animations.add('attack', [12, 13, 14, 13], 5, true);
	this.sprite.animations.play('run');
};

Butcher.prototype = {
	framesToReact: 100,
	_flipSprite: function(){
		this._flipped = !this._flipped;
		this.sprite.scale.x *= -1;
	},
	update: function(){
		if (this.dead)
			return;
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
		// Change target?
		var lorenzoDistance = Util.distance(this.sprite.x, this.sprite.y, this.lorenzo.sprite.x, this.lorenzo.sprite.y);
		var lorenzaDistance = Util.distance(this.sprite.x, this.sprite.y, this.lorenza.sprite.x, this.lorenza.sprite.y);
		if (lorenzoDistance > lorenzaDistance && !this.lorenza.dead){
			this.enemy = this.lorenza;
		} else if (!this.lorenzo.dead){
			this.enemy = this.lorenzo;
		} else {
			this.enemy = this.lorenza;
		}
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
	        this.sprite.body.velocity.x = vectors.x * 20;
	        this.sprite.body.velocity.y = vectors.y * 10;
		}
	},
	hit: function(direction){
		this.sprite.animations.stop();
		this.dead = true;
		this.sprite.frame = 19; //TODO: Add dead butcher sprite
		this.sprite.body.velocity.y = 0; 
		this.sprite.body.velocity.x = 30 * direction; 
		this.game.time.events.add(500, this._layDead, this);
		this.lorenzoGame.killButcher();
	},
	_layDead: function(){
		this.sprite.frame = 20;
		this.sprite.body.velocity.x = 0; 		
	},
	isInvulnerable: function(){
		return false;
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

module.exports = Butcher;