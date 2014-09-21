define(["jquery", "html", "scheme"], function($, $H, Scheme){
	function Buglet(name, field, pos){var _=this;
		_.name = name;
		_.field = field;
		_.scheme = new Scheme(_);
		_.pos = pos;
		_.direction = 50;
		_.icon = null;
		
		
		
		
	}
	
	var Vector = {
		length: function(x1, y1, x2, y2){
			return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
		}
	};
	
	$.extend(Buglet.prototype, {
		show: function(){var _=this;
			_.icon = _.field.screen.set();
			
			// отрисовка пиктухи (относительно нуля)
 			_.icon.push(_.field.screen.path("M 10.6875 0.40625 L 1.1875 12.21875 L 1.1875 47.75 L 11.53125 37.875 L 19.8125 47.75 L 19.8125 12.21875 L 10.6875 0.40625 z ").attr({fill:"#fff"}));
			_.icon.push(_.field.screen.rect(5, 12, 10, 15).attr({fill:"#0f0"}));
			
			// позиционирование пиктухи
			_.icon.transform(["T", _.pos.x, _.pos.y, "R", _.direction]);
			_.scheme.exec();
		},
		move: function(newPos){var _=this;
			var duration = 2000;
			var lng = Vector.length(_.pos.x, _.pos.y, newPos.x, newPos.y)/2,
				node = {
					x: lng*Math.cos(_.direction) + _.pos.x,
					y: lng*Math.sin(_.direction) + _.pos.y
				};
			
			var trace = _.field.screen.path(["M", _.pos.x, _.pos.y, "Q", node.x, node.y, newPos.x, newPos.y]).attr({stroke:"#f00"});
			
			_.icon.data("mypath", trace);
			_.icon.attr("progress", 0);
			_.icon.animate({ progress: 1 }, duration);

			
			$.extend(_.pos, newPos);
			_.icon.transform(["T", _.pos.x, _.pos.y, "R", _.direction]);
		}
	});
	
	
	return Buglet;
});