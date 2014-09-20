define(["jquery", "html", "scheme"], function($, $H, Scheme){
	function Buglet(name, field){var _=this;
		_.name = name;
		_.field = field;
		_.scheme = new Scheme();
	}
	
	$.extend(Buglet.prototype, {
		show: function(){var _=this;
			_.field.screen.rect(10, 10, 20, 20).attr({fill:"#0f0"});
		}
	});
	
	
	return Buglet;
});