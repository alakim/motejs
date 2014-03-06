var Mote = (function($,$H,$R){
	
	var getUID = (function(){
		var counter = 0;
		return function(){
			return counter++;
		}
	})();
	
	var requestAnimFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {setTimeout(callback, 16);};
	
	function Transformation(Tx, Ty, R){
		this.T = {x:Tx||0, y:Ty||0};
		this.R = R||0;
	}
	$.extend(Transformation.prototype, {
		shift: function(dx, dy){
			this.T.x+=dx;
			this.T.y+=dy;
			return this;
		},
		clone: function(){return new Transformation(this.T.x, this.T.y, this.R)},
		toString: function(){
			return "Tx,yRr".replace("x", this.T.x)
				.replace("y", this.T.y)
				.replace("r", this.R);
		}
	});
	$.extend(Transformation, {
		obtain: function(icon){
			var Tx = 0, Ty = 0, R = 0;
			var tAttr = icon.attr("transform");
			$.each(tAttr, function(i, cmd){
				if(cmd[0]!="T") return;
				Tx+=cmd[1];
				Ty+=cmd[2];
			});
			return new Transformation(Tx, Ty, R);
		}
	});
	
	function Velocity(dx, dy){
		this.dx = dx||0;
		this.dy = dy||0;
	}
	$.extend(Velocity.prototype, {
		set: function(dx, dy){
			this.dx = dx;
			this.dy = dy;
		},
		accelerate: function(dVx, dVy){
			this.dx+=dVx;
			this.dy+=dVy;
		},
		toString: function(){
			return [this.dx, this.dy].join();
		}
	});
	
	function FallState(solid, velocity){
		this.time = +new Date;
		this.solid = solid;
		this.baseTransform = solid.transformation;
		this.velocity = velocity || new Velocity();
		this.acceleration = solid.world.gravity.acceleration(/*height*/);
	}
	
	var Gravity = (function(){
		var fallingSolids = [];
		
		function animationStep(){
			var now = +new Date;
			
			for(var solid,C=fallingSolids,i=0; solid=C[i],i<C.length; i++){
				var state = solid.fallState,
					dt = now - state.time;
				state.time = now;
					
				solid.transformation.shift(state.velocity.dx*dt, state.velocity.dy*dt);
				
				state.velocity.accelerate(0, state.acceleration*dt);
				solid.icon.attr({transform:solid.transformation});
					
				
				var absPos = solid.transformation.T.y + solid.spawnPosition.y;
				if(absPos>=solid.world.gravity.groundPosition){
					fallingSolids.splice(i--, 1); // TERMINATE FALLING
				}
			}
			fallingSolids.length && requestAnimFrame(animationStep);
		}
		
		return {
			acceleration: function(height){return .001;},
			groundPosition: 450,
			getHeight: function(solid){
				var groundPos = solid.world.gravity.groundPosition;
				return groundPos - solid.icon.getBBox().y2;
			},
			fall: function(solid){
				if(solid.isStatic) return;
				
				solid.fallState = new FallState(solid);
				fallingSolids.push(solid);
				fallingSolids.length && requestAnimFrame(animationStep);
			}
		};
	})();
	
	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		var worldInstance = {
			add: function(solid){
				var icon = solid.template(screen, solid.spawnPosition);
				icon.data("solid", solid);
				solid.icon = icon;
				solid.world = worldInstance;
				
				icon.drag(
					function(dx, dy, x, y, e) {//move
						if(solid.isStatic)return;
						var kVel = .03;
						var x0 = solid.transformation.T.x,
							y0 = solid.transformation.T.y;
						
						solid.velocity.set(
							(solid.transformation.T.x - x0)*kVel,
							(solid.transformation.T.y - y0)*kVel
						);
						solid.transformation = solid.drag.baseTransform.clone().shift(dx, dy);
						solid.icon.attr({transform: solid.transformation});
					},
					function(x, y, e) {//start
						if(solid.isStatic)return;
						solid.drag = {
							baseTransform: Transformation.obtain(this)
						};
					},
					function(e) {//end
						if(solid.isStatic)return;
						solid.drag = null;
						solid.fall();
					}
				);
				return solid;
			},
			gravity: Gravity
		};
		template(worldInstance, screen);
		return worldInstance;
	}
	
	
	
	function Solid(pos, template){
		if(!pos) pos = {x:0, y:0};
		else if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		
		if(!template || typeof(template)!="function") 
			template = function(screen, pos){
				return screen.rect(pos.x, pos.y, 10, 10).attr({fill:"#ffc", stroke:"#448"});
			}
		return {
			spawnPosition: pos,
			transformation: new Transformation(),
			velocity: new Velocity(),
			template: template,
			fallState: null,
			isStatic: false,
			"static": function(v){this.isStatic = v==null?true:v; return this;},
			fall: function(){
				this.world.gravity.fall(this);
			}
		};
	}

	return {
		version:"2.1",
		world: World,
		solid: Solid
	};
})(jQuery, Html, Raphael);