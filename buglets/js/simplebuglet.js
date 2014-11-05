define(["jquery", "html", "oop", "buglet"], function($, $H, $OOP, Buglet){
	
	function SimpleBuglet(name, field, pos, direction){
		this.init(name, field, pos, direction);
	}
	
	$OOP.inherit(SimpleBuglet, Buglet);

	$OOP.mixin(SimpleBuglet.prototype, {
		show: function(){var _=this;
			_.icon = _.field.screen.set();
			_.iconSize = {
				w: 40,
				h: 20
			};
			
			var 	w = _.iconSize.w,
				w2 = _.iconSize.w/2,
				h2 = _.iconSize.h/2,
				s = h2, // ширина скоса
				hw = 3, // healthPoint width
				hL = s*.7, // healthPoint left
				mrg = 1; // margin - отступ от края
			
			// отрисовка пиктухи (относительно нуля)
 			_.icon.push(_.field.screen.path([
				"M", -w2, -h2,
				"L", w2-s, -h2,
				"L", w2, 0,
				"L", w2-s, h2,
				"L", -w2, h2,
				"L", -w2+s, 0,
				"z"
			]).attr({fill:"#999"}));
			
			function hpPath(val){
				val = val || 0;
				var	pL = -w2+hL,
					pR = pL+(w-hL-s)*val;
				return [
					"M", pL, -h2+mrg,
					"L", pR, -h2+mrg,
					"L", pR, -h2+mrg+hw,
					"L", pL, -h2+mrg+hw,
					"z",
					"M", pL, h2-mrg,
					"L", pR, h2-mrg,
					"L", pR, h2-mrg-hw,
					"L", pL, h2-mrg-hw,
					"z"
				];
			}
			
			_.icon.push(_.field.screen.path(hpPath(1)).attr({fill:"#f00"}));
			_.healthPoint = _.field.screen.path(hpPath(.8)).attr({fill:"#0f8"});
			_.icon.push(_.healthPoint);
			
			
			
			//_.icon.push(_.field.screen.rect(-4, 2.5-_.iconSize.h/2, 10, 15).attr({fill:"#ff0"}));
			
			// позиционирование пиктухи
			_.icon.transform(["t", _.pos.x, _.pos.y, "r", _.posDirection(_.direction), -_.iconSize.w/2, -_.iconSize.h/2]);
			
		}
	});
	
	
	return SimpleBuglet;
});