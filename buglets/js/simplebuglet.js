define(["jquery", "html", "oop", "buglet"], function($, $H, $OOP, Buglet){
	
	var maxHealth = 10;
	
	function SimpleBuglet(name, field, pos, direction){var _=this;
		_.init(name, field, pos, direction);
		var health = 10;
		_.getHealth = function(){return health;};
		_.setHealth = function(val){var _=this;
			if(val<0) val = 0;
			health = val;
			_.healthPoint.attr({path:_.hpPath(val)});
		};
		
	}
	
	$OOP.inherit(SimpleBuglet, Buglet);

	$OOP.mixin(SimpleBuglet.prototype, {
		hpPath: function(val){var _=this;
			val = val==null?maxHealth:val;
			
			var reVal = val/maxHealth; // относительное значение

			var 	h2 = _.iconSize.h/2,
				s = h2, // ширина скоса
				hw = 3, // healthPoint width
				hL = s*.7, // healthPoint left
				mrg = 1; // margin - отступ от края
			
			var	pL = -_.iconSize.w/2+hL,
				pR = pL+(_.iconSize.w-hL-s)*reVal,
				pU = -h2+mrg,
				pB = pU + hw;
			return [
				"M", pL, pU,
				"L", pR, pU,
				"L", pR, pB,
				"L", pL, pB,
				"z",
				"M", pL, -pU,
				"L", pR, -pU,
				"L", pR, -pB,
				"L", pL, -pB,
				"z"
			];
		},
		show: function(){var _=this;
			_.icon = _.field.screen.set();
			_.iconSize = {
				w: 40,
				h: 20
			};
			
			var 	w = _.iconSize.w,
				w2 = _.iconSize.w/2,
				h2 = _.iconSize.h/2,
				s = h2; // ширина скоса
			
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
						
			_.icon.push(_.field.screen.path(_.hpPath()).attr({fill:"#f00"}));
			_.healthPoint = _.field.screen.path(_.hpPath()).attr({fill:"#0f8"});
			_.icon.push(_.healthPoint);
			
			
			
			//_.icon.push(_.field.screen.rect(-4, 2.5-_.iconSize.h/2, 10, 15).attr({fill:"#ff0"}));
			
			// позиционирование пиктухи
			_.icon.transform(["t", _.pos.x, _.pos.y, "r", _.posDirection(_.direction), -_.iconSize.w/2, -_.iconSize.h/2]);
			
		},
		respawn: function(){ // при респавне должны сохраняться кое-какие характеристики баглета
			this.setHealth(maxHealth);
			this.setPos(this.spawnPos.pos, this.spawnPos.direction);
		},
		hurt:function(){var _=this;
			_.setHealth(_.getHealth() - 1);
			if(_.getHealth()==0){
				_.respawn();
			}
		}
	});
	
	
	return SimpleBuglet;
});