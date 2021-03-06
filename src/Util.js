var Util = {
	distance: function(x1, y1, x2, y2){
		return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );	
	},
	randomSign: function(){
		return Math.floor(Math.random() * 3) - 1;
	},
	rand: function(low, hi){
		return Math.floor(Math.random() * (hi - low)) + low;
	},
	noop: function(){
		return true;
	}
}

module.exports = Util;