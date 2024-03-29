﻿var Rope = (function($,$R,$M){
	
	var Vector = $M.Vector;
	
	function draw(rope){var _=rope;
		var screen = _.world.getScreen();
		var p1 = _.solid1.transformation.T.add(_.settings.from.offset),
			p2 = _.solid2.transformation.T.add(_.settings.to.offset);
			
		_.icon = screen.path(["M", p1.x, p1.y, "L", p2.x, p2.y])
			.attr({fill:_.settings.color});
		_.initLength = _.icon.getTotalLength();
	}
	
	function Rope(settings){var _=this;
		_.settings = {
			color: "#008",
			elasticModulus: 3e-5
		};
		$.extend(_.settings, settings);

		_.solid1 = _.settings.from.solid;
		_.solid2 = _.settings.to.solid;
		_.world = _.solid1.world;
		_.tension = new Vector();
		
		_.solid1.ropes.push(_);
		_.solid2.ropes.push(_);
		draw(_);
	}
	$.extend(Rope.prototype, {
		redraw: function(initiator){var _=this;
			var path = _.icon.attr("path"),
				ptIdx = _.solid1===initiator?0:1,
				pt = path[ptIdx],
				ptSettings = ptIdx?_.settings.to:_.settings.from;
				pos = initiator.transformation.T.add(ptSettings.offset);
			
			pt[1] = pos.x;
			pt[2] = pos.y;
			_.icon.attr({path: path});
			
			var newLength = _.icon.getTotalLength(),
				vectE = new Vector([path[0][1], path[0][2]]).Mul(-1).Add([path[1][1], path[1][2]]).Mul(1/newLength);
			
			_.tension = vectE.Mul((newLength - _.initLength) * _.settings.elasticModulus);
			
			if(_.world.trace.tensions) _.drawTension();
			
			var other = _.solid1===initiator?_.solid2:_.solid1;
			if(!other.fallState){ // выводим объект на другом конце из состояния покоя
				other.fall();
			}
			
		},
		drawTension: function(){var _=this;
			if(!_.world.trace.tensions) return;
			var rate = 1e4;
			var path = _.icon.attr("path"),
				p0 = new Vector(path[1][1], path[1][2]),
				p1 = _.tension.mul(-rate).Add(p0);
			var tensionPath = ["M", p1.x, p1.y, "L", p0.x, p0.y];
			
			if(!_.tensionIcon)
				_.tensionIcon = _.world.getScreen().path(tensionPath).attr({stroke:"#f80", "stroke-width":4});
			else
				_.tensionIcon.attr({path: tensionPath});
		}
	});
	$.extend(Rope, {
		version: "1.0"
	});
	

	return Rope;
})(jQuery, Raphael, Mote);