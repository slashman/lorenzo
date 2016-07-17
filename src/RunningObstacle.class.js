var Util = require('./Util')

function RunningObstacle(game, x, y, frames, group){
	this.game = game;
	this.sprite = this.game.add.sprite(x, y, 'sprites', frames[0], group);
	this.sprite.anchor.setTo(.5, 0);
	this.game.physics.arcade.enable(this.sprite);
	this.sprite.animations.add('run', frames, 5, true);
	this.sprite.animations.play('run');
};

RunningObstacle.prototype = {
	framesToReact: 300,
	update: function(){
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
			return false;
		this.framesToReact --;
		if (--this.framesToReact < 0){
			this.framesToReact = Math.floor(Math.random()*30)+30;
			return true;
		}
		return false;
	},
	_doAI: function(){
        this.sprite.body.velocity.x = -40;
        this.sprite.body.velocity.y = Util.randomSign() * 20;
        console.log(Util.randomSign());
	}
};

module.exports = RunningObstacle;