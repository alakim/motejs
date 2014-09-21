define(["jquery", "html", "scheme"], function($, $H, Scheme){
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

		//var alpha = (point.alpha < 180 ? point.alpha + 180 : point.alpha)+rotation;
		var alpha = point.alpha + rotation;
		
		buglet.direction = alpha - 90;
		buglet.pos.x = point.x;
		buglet.pos.y = point.y;
		
		return {
			transform: "t" + (point.x + offset.x) + "," + (point.y + offset.y) + 
			"r" + alpha
		};
	};
	
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
			_.icon.transform(["T", _.pos.x, _.pos.y, "R", _.direction+rotation]);
			_.scheme.exec();
		},
		
		move: function(newPos){var _=this;
			var lng = Vector.length(_.pos.x, _.pos.y, newPos.x, newPos.y)/2,
				vertex = {
// 					x: (_.direction+rotation>90?-1:1) * lng*Math.cos(_.direction+rotation) + _.pos.x,
// 					y: (_.direction+rotation>180?-1:1) * lng*Math.sin(_.direction+rotation) + _.pos.y
					x: lng*Math.cos(_.direction+rotation) + _.pos.x,
					y: lng*Math.sin(_.direction+rotation) + _.pos.y
				};
			
			var trace = _.field.screen.path(["M", _.pos.x, _.pos.y, "Q", vertex.x, vertex.y, newPos.x, newPos.y]).attr({stroke:"#f00"});
			// визуализация узла и направления для отладки
			_.field.screen.circle(vertex.x, vertex.y, 3).attr({fill:"#f00"});
			_.field.screen.path(["M", _.pos.x, _.pos.y, "L", Math.cos(_.direction+rotation)*25+_.pos.x, Math.sin(_.direction+rotation)*25+_.pos.y]);
			
			_.icon.data("mypath", trace);
			_.icon.data("buglet", _);
			_.icon.attr("progress", 0);
			_.icon.animate({ progress: 1 }, Scheme.delay()*.98, function(){
				// визуализация направления для отладки
				_.field.screen.path(["M", _.pos.x, _.pos.y, "L", Math.cos(_.direction+rotation)*25+_.pos.x, Math.sin(_.direction+rotation)*25+_.pos.y]).attr({stroke:"#00f"});
			});

			
			//$.extend(_.pos, newPos);
			//_.icon.transform(["T", _.pos.x, _.pos.y, "R", _.direction+rotation]);
		}
	});
	
	
	return Buglet;
});