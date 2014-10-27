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
			
			// отрисовка пиктухи (относительно нуля)
 			_.icon.push(_.field.screen.path([
				"M", -20, -10,
				"L", 10, -10,
				"L", 20, 0,
				"L", 10, 10,
				"L", -20, 10,
				"L", -10, 0,
				"z"
			]).attr({fill:"#f00"}));
			_.icon.push(_.field.screen.rect(-4, 2.5-_.iconSize.h/2, 10, 15).attr({fill:"#ff0"}));
			
			// позиционирование пиктухи
			_.icon.transform(["t", _.pos.x, _.pos.y, "r", _.posDirection(_.direction), -_.iconSize.w/2, -_.iconSize.h/2]);
		}
	});
	
	
	return SimpleBuglet;
});