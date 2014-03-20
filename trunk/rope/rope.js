var Rope = (function($,$R,$M){
	
	var Vector = $M.Vector;
	
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
		_.draw();
	}
	$.extend(Rope.prototype, {
		draw: function(){var _=this;
			var screen = _.world.getScreen();
			var p1 = new Vector(_.solid1.transformation.T).add(_.settings.from.offset),
				p2 = new Vector(_.solid2.transformation.T).add(_.settings.to.offset);
				
			_.icon = screen.path(["M", p1.x, p1.y, "L", p2.x, p2.y])
				.attr({fill:_.settings.color});
			_.initLength = _.icon.getTotalLength();
		},
		redraw: function(initiator){var _=this;
			var path = _.icon.attr("path"),
				ptIdx = _.solid1===initiator?0:1,
				pt = path[ptIdx],
				ptSettings = ptIdx?_.settings.to:_.settings.from;
				pos = new Vector(initiator.transformation.T).add(ptSettings.offset);
			
			pt[1] = pos.x;
			pt[2] = pos.y;
			_.icon.attr({path: path});
			
			var newLength = _.icon.getTotalLength(),
				vectE = new Vector([path[0][1], path[0][2]]).mul(-1).add([path[1][1], path[1][2]]).mul(1/newLength);
			
			_.tension = vectE.mul((newLength - _.initLength) * _.settings.elasticModulus);
			
			if(_.world.trace.tensions) _.drawTension();
		},
		drawTension: function(){var _=this;
			if(!_.world.trace.tensions) return;
			var rate = 1e4;
			var path = _.icon.attr("path"),
				p0 = new Vector(path[1][1], path[1][2]),
				p1 = new Vector(_.tension).mul(-rate).add(p0);
			//console.log("path: "+p0+","+p1);
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