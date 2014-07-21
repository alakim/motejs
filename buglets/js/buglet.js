define(["jquery", "html", "scheme", "switch"], function($, $H, Scheme, Switch){
	function Buglet(name){var _=this;
		_.name = name;
		var sw = new Switch();
		_.scheme = new Scheme(sw);
	}
	
	$.extend(Buglet.prototype, {
		show: function(pnl){
			$(pnl).append($H.div(this.name));
		}
	});
	
	
	return Buglet;
});