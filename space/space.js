var Space = (function($,$R,$M){
	
	var counter = 0;
	
	function getAcceleration(star, solid, G){
		/*******************
			F = m*a;
			F = G*m1*m2/(r*r);
			a = G*M/(r*r);
		********************/
		var solPos = new $M.Vector(solid.transformation.T.x, solid.transformation.T.y),
			stPos = new $M.Vector(star.transformation.T.x, star.transformation.T.y),
			distance = stPos.Add(solPos.Mul(-1))
			L = distance.getLength();
		return distance.mul(1/L).Mul(G*star.mass/(L*L));
	}
	
	function Gravity(star){var _=this;
		_.star = star;
		_.G = 5e-2;
		_.acceleration = function(solid){
			//if(counter++>1000) throw "Execution stopped by developer";
			if(_.star instanceof Array){
				var a = new $M.Vector();
				for(var s,i=0; s=_.star[i],i<_.star.length; i++){
					a.Add(getAcceleration(s, solid, _.G));
				}
				return a;
			}
			else return getAcceleration(_.star, solid, _.G);
		}
	}
	Gravity.prototype = $M.Gravity;

	
	return {
		version: "1.1",
		Gravity: Gravity
	};
})(jQuery, Raphael, Mote);