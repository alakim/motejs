define(["jquery", "html"], function($, $H){
	
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
	$.extend(MoveCmd, {
		viewDialog: function(pnl, cmd){
			function template(cmd){with($H){
				return div(
					div("X: ", input({type:"text"})),
					div("Y: ", input({type:"text"})),
					div(input({type:"button", value:"OK"}))
				);
			}}
			pnl.html(template(cmd));
		}
	});
	

	
	return {
		MoveCmd: MoveCmd
	};
});