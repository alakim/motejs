define(["jquery", "html", "oop", "buglet"], function($, $H, $OOP, Buglet){
	
	function SimpleBuglet(name, field, pos, direction){var _=this;
		console.log("SimpleBuglet constructor");
		_.index = Buglet.instances.length;
		_.name = name;
		_.field = field;
		_.scheme = new Scheme(_);
		_.pos = pos;
		_.direction = direction;
		_.icon = null;
		Buglet.instances.push(_);
		
		_.test2 = function(){
			console.log("test2");
		};
		
		
// 		_.show = function(){var _=this;
// 			console.log("show simple ", this.name);
// 			_.icon = _.field.screen.set();
// 			_.iconSize = {
// 				w: 40,
// 				h: 20
// 			};
// 			
// 			// отрисовка пиктухи (относительно нуля)
//  			_.icon.push(_.field.screen.path([
// 				"M", -20, -10,
// 				"L", 10, -10,
// 				"L", 20, 0,
// 				"L", 10, 10,
// 				"L", -20, 10,
// 				"L", -10, 0,
// 				"z"
// 			]).attr({fill:"#f00"}));
// 			_.icon.push(_.field.screen.rect(-4, 2.5-_.iconSize.h/2, 10, 15).attr({fill:"#ff0"}));
// 			
// 			// позиционирование пиктухи
// 			_.icon.transform(["t", _.pos.x, _.pos.y, "r", posDirection(_.direction), -_.iconSize.w/2, -_.iconSize.h/2]);
// 		};

		
	}
	
	$OOP.inherit(SimpleBuglet, Buglet);

	$OOP.mixin(SimpleBuglet.prototype, {
		test: function(){
			console.log(typeof(this));
		},
	//$.extend(SimpleBuglet.prototype, {
		show: function(){var _=this;
			console.log("show simple ", this.name);
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
			_.icon.transform(["t", _.pos.x, _.pos.y, "r", posDirection(_.direction), -_.iconSize.w/2, -_.iconSize.h/2]);
		}
	});
	
	
	return Buglet;
});