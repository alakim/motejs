define(["jquery"], function($){
	
	function MoveCmd(pos, scheme){
		this.pos = pos;
		this.scheme = scheme;
	}
	$.extend(MoveCmd.prototype, {
		exec: function(){var _=this;
			_.scheme.buglet.move(_.pos);
		},
		toString: function(){
			return "move to "+this.pos.x+","+this.pos.y;
		}
	});

	
	return {
		MoveCmd: MoveCmd
	};
});