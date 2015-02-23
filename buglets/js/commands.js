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
		viewDialog: function(pnl, scheme, cmd, onOK){
			function template(cmd){with($H){
				return div(
					div("X: ", input({"class":"tbX", type:"text", value:cmd.pos.x})),
					div("Y: ", input({"class":"tbY", type:"text", value:cmd.pos.y})),
					div(
						input({type:"button", "class":"btOk", value:"OK"}),
						input({type:"button", "class":"btCancel", value:"Cancel"})
					)
				);
			}}
			var newMode = !cmd;
			cmd = cmd || new MoveCmd({x:0, y:0}, scheme);
			pnl.html(template(cmd));
			pnl.find(".btOk").click(function(){
				cmd.pos.x = +pnl.find(".tbX").val();
				cmd.pos.y = +pnl.find(".tbY").val();
				if(newMode) scheme.addCommand(cmd);
				pnl.html("");
				onOK();
			});
			pnl.find(".btCancel").click(function(){
				pnl.html("");
			});
		}
	});
	

	
	return {
		MoveCmd: MoveCmd
	};
});