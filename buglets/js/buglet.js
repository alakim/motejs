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
			_.icon = _.field.screen.set();
			
			// отрисовка пиктухи (относительно нуля)
 			_.icon.push(_.field.screen.path("M 10.6875 0.40625 L 1.1875 12.21875 L 1.1875 47.75 L 11.53125 37.875 L 19.8125 47.75 L 19.8125 12.21875 L 10.6875 0.40625 z ").attr({fill:"#fff"}));
			_.icon.push(_.field.screen.rect(5, 12, 10, 15).attr({fill:"#0f0"}));
			
			// позиционирование пиктухи
			_.icon.transform("T" + _.pos.x + ","+ _.pos.y);
			_.scheme.exec();
		},
		move: function(newPos){var _=this;
			$.extend(_.pos, newPos);
			_.icon.transform(_.icon.transform()+'T'+_.pos.x+','+_.pos.y);
		}
	});
	
	
	return Buglet;
});