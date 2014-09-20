define(["jquery", "switch"], function($, Switch){
	
 	function Scheme(){var _=this;
		_.switch = new Switch();
		_.commands = [];
	}

	
	$.extend(Scheme.prototype, {
		addCommand: function(cmd){
			this.commands.push(cmd);
		}
	});
	
	
	return Scheme;
});