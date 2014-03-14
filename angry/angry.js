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
			d = new $M.Vector(velocity).mul(dt),
			dV = new $M.Vector(
				a*dt*Math.cos(angleRad),
				a*dt*Math.sin(angleRad)
			),
			targetPoint = basketIcon.data("targetPoint");
			
		velocity.add(dV);
		var tapePath = tape.attr("path");
		
		tapePath[1][1] += d.x;
		tapePath[1][2] += d.y;
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
		else{
			basket.updateBBox();
			if(basket.accepted){with(basket){
				var v = icon.data("maxTension")*m*50;
				accepted.velocity.set(v*Math.cos(angleRad), v*Math.sin(angleRad));
				accepted.falling = true;
				accepted.fall();
				accepted = null;
			}}
		}
	}
	
	function moveBasketToTape(angle){
		var tapePath = tape.attr("path"),
			tapeEnd = {
				x: tapePath[1][1],
				y: tapePath[1][2]
			},
			tapeTr = $M.Transformation.obtain(tape);
		
		basketIcon.transform(new $M.Transformation(
			tapeTr.T.x + tapeEnd.x + width - basketWidth,
			tapeTr.T.y + tapeEnd.y + height - basketSize,
			[angle, tapeTr.T.x + tapeEnd.x, tapeTr.T.y + tapeEnd.y]
		));
	}
	
	function moveAccepted(solid, x, y, angle){
		var trf = $M.Transformation.obtain(solid.icon);
		var dx = x,
			dy = y;
		trf = new $M.Transformation(dx, dy, angle);
		solid.icon.transform(trf);
	}
		
	function draggableBasket(basket){
		var drag2 = {
			move: function(dx, dy, x, y, e) {
				var trf = $M.Transformation.obtain(this);
				
				var basePoint = this.data("basePoint"),
					x1 = -width + trf.T.x + basketWidth,
					y1 = -height + trf.T.y + basketSize,
					alpha = $R.angle(basePoint.x, basePoint.y, x1, y1);
					
				trf.R = [alpha, x1, y1];
				this.transform(trf);
				
				var accepted = this.data("solid").accepted;
				if(accepted){
					var bbox = this.getBBox();
					moveAccepted(accepted, bbox.x, bbox.y - basketSize/2, [alpha, bbox.x, bbox.y - basketSize/2]);
				}
				
				var path = tape.attr("path");
				path[1][0] = "L";
				path[1][1] = x1 - basePoint.x;
				path[1][2] = y1 - basePoint.y - height;
				tape.attr({path:path});
				
				var tension = ($R.getTotalLength(path) - width)*elasticModulus
				this.data("maxTension", tension);
				this.data("tension", tension);
				this.data("angle", alpha);
			},
			start:function(x, y, e) {
			},
			end: function(e) {
				var tension = this.data("tension");
				this.data("time", +new Date);
				this.data("velocity", new $M.Vector());
				var targetPoint = $R.getPointAtLength(tape.attr("path"), width);
				this.data("targetPoint", targetPoint);
				$M.requestAnimFrame()(animate);
			}
		};
		$.extend(basket.drag, drag2);
	}
	
	
	function Gun(world, pos, template){
		if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		template = template || function(screen){
			var support = screen.rect(0, -height, 5, height).attr(attColor);
			tape = screen.path(["M", 0, -height, "l", -width+basketWidth, 0]);
			return support;
		};
		var gun = $M.solid(world, pos, {mass:1e7, template:template, static:true, draggable:false});
		tape.transform(gun.transformation);
		basket = $M.solid(world, pos, {
			template: function(screen){
				return screen.rect(-width, -height+basketSize/2, basketWidth, basketSize)
					.attr({fill:"#ccc", stroke:"#888"});
			}
		});
		basket.falling = false;
		draggableBasket(basket);
		basketIcon = basket.icon;
		basketIcon.data("basePoint", new $M.Vector(pos.x, pos.y-height));
		basket.accept = function(solid){
			solid.falling = false;
			basket.accepted = solid;
		}
	}
	
	return {
		version: "1.4",
		gun: Gun
	};
})(jQuery, Raphael, Mote);