define(["jquery", "html", "scheme"], function($, $H, Scheme){
	function Buglet(name, field, pos){var _=this;
		_.name = name;
		_.field = field;
		_.scheme = new Scheme(_);
		_.pos = pos;
		_.icon = null;
	}
	
	$.extend(Buglet.prototype, {
		show: function(){var _=this;
			_.icon = _.field.screen.rect(_.pos.x, _.pos.y, 20, 20).attr({fill:"#0f0"});
			_.scheme.exec();
		},
		move: function(newPos){var _=this;
			$.extend(_.pos, newPos);
			_.icon.attr({x:_.pos.x, y:_.pos.y});
		}
	});
	
	
	return Buglet;
});