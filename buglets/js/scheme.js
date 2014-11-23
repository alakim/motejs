define(["jquery", "switch"], function($, Switch){
	
 	function Scheme(buglet){var _=this;
		_.switch = new Switch();
		_.buglet = buglet;
		_.commands = [];
	}
	
	var delay = 2000;

	
	$.extend(Scheme.prototype, {
		exec: function(){var _=this;
			var i = 0;
			function step(){
				if(i>=_.commands.length) return;
				_.commands[i++].exec();
				setTimeout(step, delay);
			}
			step();
		},
		addCommand: function(cmd){
			this.commands.push(cmd);
		},
		delCommand: function(cmdIdx){
			this.commands.splice(cmdIdx, 1);
		}
	});
	
	Scheme.delay = function(v){
		if(v==null) return delay;
		delay = v;
	}
	
	
	return Scheme;
});