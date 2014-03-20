var Space = (function($,$R,$M){
	
	var counter = 0;
	
	function Gravity(star){var _=this;
		_.star = star;
		_.G = 5e-2;
		_.acceleration = function(solid){
			//if(counter++>1000) throw "Execution stopped by developer";
			/*******************
				F = m*a;
				F = G*m1*m2/(r*r);
				a = G*M/(r*r);
			********************/
			var solPos = new $M.Vector(solid.transformation.T.x, solid.transformation.T.y),
				stPos = new $M.Vector(star.transformation.T.x, star.transformation.T.y),
				distance = stPos.add(solPos.mul(-1))
				L = distance.getLength();
			var a = new $M.Vector(distance).mul(1/L).mul(_.G*_.star.mass/(L*L));
			return a;
		}
	}
	Gravity.prototype = $M.Gravity;

	
	return {
		version: "1.0",
		Gravity: Gravity
	};
})(jQuery, Raphael, Mote);