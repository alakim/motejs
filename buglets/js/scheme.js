define(["jquery"], function($){
	
	function Scheme(sw){var _=this;
		_.switch = sw;
		_.commands = [];
	}

	
	$.extend(Scheme.prototype, {
		addCommand: function(cmd){
			this.commands.push(cmd);
		}
	});
	
	
	return Scheme;
});