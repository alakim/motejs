define(["jquery"], function($){
	
	function MoveCmd(pos, scheme){
		this.pos = pos;
		this.scheme = scheme;
	}
	$.extend(MoveCmd.prototype, {
		exec: function(){var _=this;
			_.scheme.buglet.move(_.pos);
		}
	});

	
	return {
		MoveCmd: MoveCmd
	};
});