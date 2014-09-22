define(["jquery", "html", "scheme", "vector"], function($, $H, Scheme, Vector){
	var rotation = 0;
	
	function Buglet(name, field, pos, direction){var _=this;
		_.name = name;
		_.field = field;
		_.scheme = new Scheme(_);
		_.pos = pos;
		_.direction = direction;
		_.icon = null;
	}
	
	// процесс анимации движения баглета
	Buglet.animationProgress = function (v) {
		var path = this.data("mypath"),
			attrs = this.attr(),
			offset = { x: 0, y: 0 },
			buglet = this.data("buglet");

		if (!path) return{transform: "t0,0"};
		
		if (attrs.hasOwnProperty("width")) {
			offset.x = -this.attr("width") / 2;
			offset.y = -this.attr("height") / 2;
		}
		
		var len = path.getTotalLength();
		var point = path.getPointAtLength(v * len);

		var alpha = point.alpha + rotation;
		
		buglet.direction = alpha;
		buglet.pos.x = point.x;
		buglet.pos.y = point.y;
		
		return {
			transform: "t" + (point.x + offset.x) + "," + (point.y + offset.y) + 
			"r" + alpha
		};
	};
	
	$.extend(Buglet.prototype, {
		show: function(){var _=this;
			_.icon = _.field.screen.set();
			
			// отрисовка пиктухи (относительно нуля)
 			_.icon.push(_.field.screen.path("M 10.6875 0.40625 L 1.1875 12.21875 L 1.1875 47.75 L 11.53125 37.875 L 19.8125 47.75 L 19.8125 12.21875 L 10.6875 0.40625 z ").attr({fill:"#fff"}));
			_.icon.push(_.field.screen.rect(5, 12, 10, 15).attr({fill:"#0f0"}));
			
			// позиционирование пиктухи
			_.icon.transform(["T", _.pos.x, _.pos.y, "R", _.direction+rotation]);
			_.scheme.exec();
		},
		
		move: function(newPos){var _=this;
			var lng = Vector.length(_.pos.x, _.pos.y, newPos.x, newPos.y)/2,
				vertex = Vector.point(_.pos, _.direction+rotation, lng);
			
			var trace = _.field.screen.path(["M", _.pos.x, _.pos.y, "Q", vertex.x, vertex.y, newPos.x, newPos.y]).attr({stroke:"#f00"});
			
			_.icon.data("mypath", trace);
			_.icon.data("buglet", _);
			_.icon.attr("progress", 0);
			_.icon.animate({ progress: 1 }, Scheme.delay()*.98);
		}
	});
	
	
	return Buglet;
});