define(["jquery", "switch"], function($, Switch){
	
	function MoveCmd(pos, scheme){
		this.pos = pos;
		this.scheme = scheme;
	}
	$.extend(MoveCmd.prototype, {
		exec: function(){var _=this;
			_.scheme.buglet.move(_.pos);
		}
	});
	
 	function Scheme(buglet){var _=this;
		_.switch = new Switch();
		_.buglet = buglet;
		_.commands = [
			new MoveCmd({x:59, y:68}, _),
			new MoveCmd({x:59, y:88}, _),
			new MoveCmd({x:74, y:108}, _)
		];
	}

	
	$.extend(Scheme.prototype, {
		exec: function(){var _=this;
			var delay = 500;
			var i = 0;
			function step(){
				if(i>=_.commands.length) return;
				_.commands[i++].exec();
				setTimeout(step, delay);
			}
			setTimeout(function(){
				step();
			}, delay);
		},
		addCommand: function(cmd){
			this.commands.push(cmd);
		}
	});
	
	
	return Scheme;
});