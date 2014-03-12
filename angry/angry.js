var Angry = (function($,$R,$M){
	var attColor = {fill:"#ccc", stroke:"#888"},
		height = 150,
		width = 100,
		basketSize = 15,
		basketWidth = basketSize*2,
		elasticModulus = .0002;
		
	var basket, basketIcon, tape;
	
	function animate(){
		with(basketIcon){
			var dt = +new Date - data("time"),
				tension = data("tension"),
				angle = data("angle"),
				angleRad = $R.rad(angle);
				velocity = data("velocity");
		}
		var m = 1,
			a = tension/m,
			dx = dt*velocity.vx,
			dy = dt*velocity.vy,
			dVx = a*dt*Math.cos(angleRad),
			dVy = a*dt*Math.sin(angleRad),
			targetPoint = basketIcon.data("targetPoint");
			
		velocity.accelerate(dVx, dVy);
		var tapePath = tape.attr("path");
		
		tapePath[1][1] += dx;
		tapePath[1][2] += dy;
		if(tapePath[1][1]>targetPoint.x || tapePath[1][2]<targetPoint.y){
			tapePath[1][1] = targetPoint.x;
			tapePath[1][2] = targetPoint.y;
		}
		tape.attr("path", tapePath);
		
		moveBasketToTape(angle);
		
		tension = ($R.getTotalLength(tapePath) - width)*elasticModulus;
		
		if(tapePath[1][1]<targetPoint.x && tension>0){
			basketIcon.data("tension", tension);
			$M.requestAnimFrame()(animate);
		}
	}
	
	function moveBasketToTape(angle){
		var tapePath = tape.attr("path"),
			tapeEnd = {
				x: tapePath[1][1],
				y: tapePath[1][2]
			};
		var bPos = {
				x: basketIcon.attr("x"),
				y: basketIcon.attr("y")
			},
			bTr = $M.Transformation.obtain(basketIcon);
		
		bTr.T.x = tapeEnd.x - bPos.x - basketWidth;
		bTr.T.y = tapeEnd.y - bPos.y - basketSize/2;
		bTr.R = [angle, tapeEnd.x, tapeEnd.y];
		basketIcon.transform(bTr);
	}
		
	function draggableBasket(basket){
		var drag2 = {
			move: function(dx, dy, x, y, e) {
				var trf = $M.Transformation.obtain(this);
				
				var basePoint = this.data("basePoint"),
					x0 = this.attr("x"),
					y0 = this.attr("y"),
					x1 = x0 + trf.T.x + basketWidth,
					y1 = y0 + trf.T.y + basketSize/2,
					alpha = $R.angle(basePoint.x, basePoint.y, x1, y1);
					
				trf.R = [alpha, x1, y1];
				this.transform(trf);
				
				var path = tape.attr("path");
				path[1][1] = x1;
				path[1][2] = y1;
				tape.attr({path:path});
				
				this.data("tension", ($R.getTotalLength(path) - width)*elasticModulus);
				this.data("angle", alpha);
			},
			start:function(x, y, e) {
				//this.data("current_transform", $M.Transformation.obtain(this));
			},
			end: function(e) {
				var tension = this.data("tension");
				this.data("time", +new Date);
				this.data("velocity", new $M.Velocity);
				var targetPoint = $R.getPointAtLength(tape.attr("path"), width);
				this.data("targetPoint", targetPoint);
				//this.data("screen").circle(targetPoint.x, targetPoint.y, 2).attr({fill:"red"});
				$M.requestAnimFrame()(animate);
			}
		};
		var drag1 = {
			start: function(){console.log("start dragging basket");},
			move: function(){console.log("move dragging basket");},
			end: function(){console.log("end dragging basket");},
		};
		// basket.icon.drag(drag.move, drag.start, drag.end);
		// return basket.icon;
		$.extend(basket.drag, drag2);
	}
	
	
	function Gun(world, pos, template){
		if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		template = template || function(screen, pos){
			var support = screen.rect(pos.x, pos.y-height, 5, height).attr(attColor);
			//basketIcon = screen.rect(pos.x-width, pos.y-height-basketSize/2, basketWidth, basketSize).attr({fill:"#ccc", stroke:"#888"})
			tape = screen.path(["M", pos.x, pos.y-height, "l", -width+basketWidth, 0]);
			//basket.data("screen", screen);
			//draggable(basketIcon);
			
			return support;
		};
		var gun = $M.solid(pos, 1e7, template).static();
		world.add(gun);
		basket = world.add($M.solid(pos, 1, function(screen, pos){
			return screen.rect(pos.x-width, pos.y-height-basketSize/2, basketWidth, basketSize).attr({fill:"#ccc", stroke:"#888"});
		}));
		basket.falling = false;
		draggableBasket(basket);
		basketIcon = basket.icon;
		basketIcon.data("basePoint", {x:pos.x, y:pos.y-height});
		basket.accept = function(solid){
			console.log("basket accepts "+solid.id);
		}
	}
	
	return {
		version: "1.0",
		gun: Gun
	};
})(jQuery, Raphael, Mote);