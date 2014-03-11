﻿var Angry = (function($,$R,$M){
	var attColor = {fill:"#ccc", stroke:"#888"},
		height = 150,
		width = 100,
		basketSize = 15,
		basketWidth = basketSize*2,
		elasticModulus = .02;
		
	var basket, tape;
	
	function animate(){
		with(basket){
			var dt = +new Date - data("time"),
				tension = data("tension"),
				angle = data("angle"),
				velocity = data("velocity");
		}
		var m = 1,
			a = tension/m,
			dx = dt*velocity.vx,
			dy = dt*velocity.vy,
			dVx = a*dt*Math.cos(angle),
			dVy = a*dt*Math.sin(angle)
			
		velocity.accelerate(dVx, dVy);
		var tapePath = tape.attr("path");
		tapePath[1][1] -= dx;
		tapePath[1][2] -= dy;
		tape.attr("path", tapePath);
		
		// console.log(dx, dy);
		// console.log(tapePath);
		// console.log($R.getTotalLength(tapePath));
		
		tension = ($R.getTotalLength(tapePath) - width)*elasticModulus;
		console.log(tension);
		
		if(tension>0){
			basket.data("tension", tension);
			$M.requestAnimFrame()(animate);
		}
	}
		
	function draggable(basket){
		var drag = {
			move: function(dx, dy, x, y, e) {
				var trf = this.data("current_transform").clone().shift(dx, dy);
				
				var basePoint = this.data("basePoint"),
					x0 = this.attr("x"),
					y0 = this.attr("y"),
					x1 = x0 + trf.T.x + basketWidth,
					y1 = y0 + trf.T.y + basketSize/2,
					alpha = $R.angle(basePoint.x, basePoint.y, x1, y1);
					
				trf.R = alpha;
				this.transform(trf);
				
				// var tape = this.data("tape");
				var path = tape.attr("path");
				path[1][1] = x1;
				path[1][2] = y1;
				tape.attr({path:path});
				
				this.data("tension", ($R.getTotalLength(path) - width)*elasticModulus);
				this.data("angle", alpha);
			},
			start:function(x, y, e) {
				this.data("current_transform", $M.Transformation.obtain(this));
			},
			end: function(e) {
				var tension = this.data("tension");
				this.data("time", +new Date);
				this.data("velocity", new $M.Velocity);
				$M.requestAnimFrame()(animate);
			}
		};
		basket.drag(drag.move, drag.start, drag.end);
		return basket;
	}
	
	
	function Gun(pos, template){
		template = template || function(screen, pos){
			var support = screen.rect(pos.x, pos.y-height, 5, height).attr(attColor);
			basket = screen.rect(pos.x-width, pos.y-height-basketSize/2, basketWidth, basketSize).attr({fill:"#ccc", stroke:"#888"})
			tape = screen.path(["M", pos.x, pos.y-height, "l", -width+basketWidth, 0]);
			//basket.data("tape", tape);
			basket.data("basePoint", {x:pos.x, y:pos.y-height});
			draggable(basket);
			
			return support;
		};
		var gun = $M.solid(pos, 1e7, template).static();
		return gun;
	}
	
	return {
		version: "1.0",
		gun: Gun
	};
})(jQuery, Raphael, Mote);