define(["jquery", "switch"], function($, Switch){
	
 	function Scheme(buglet){var _=this;
		_.switch = new Switch();
		_.buglet = buglet;
		_.commands = [];
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