var Mote = (function($,$H,$R){
	
	function Transformation(Tx, Ty, R){
		this.T = {x:Tx||0, y:Ty||0};
		this.R = R||0;
	}
	$.extend(Transformation.prototype, {
		shift: function(dx, dy){
			return new Transformation(this.T.x+dx, this.T.y+dy, this.R);
		},
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
	
	function FallState(solid, acceleration, velocity){
		this.solid = solid;
		this.baseTransform = solid.transformation;
		this.velocity = velocity || new Velocity();
		this.acceleration = acceleration;
	}
	$.extend(FallState.prototype, {
		doStep: function(){var _=this;
			var dt = 1;// _.solid.world.time.slice;
			//console.log(_.velocity);
			_.solid.transformation = _.solid.transformation.shift(_.velocity.dx*dt, _.velocity.dy*dt);
			//console.log(_.solid.transformation+'');
			_.velocity.accelerate(0, _.acceleration*dt);
			_.solid.icon.attr({transform:_.solid.transformation});
		}
	});
	
	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		screen.customAttributes.gravityProgress = function (v) {
			var solid = this.data("solid"),
				fallState = solid.fallState,
				t = fallState.duration*v,
				dy = fallState.acceleration*t*t/2;
			//console.log(solid.velocity.dx);
			//solid.transformation = fallState.baseTransform.shift(solid.velocity.dx*t, dy+solid.velocity.dy*t);
			solid.transformation = fallState.baseTransform.shift(solid.velocity.dx*t, dy);
			solid.icon.attr({transform:solid.transformation});
		}
		
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
						solid.transformation = solid.drag.baseTransform.shift(dx, dy);
						solid.velocity.set(
							(solid.transformation.T.x - x0)*kVel,
							(solid.transformation.T.y - y0)*kVel
						);
						//console.log(solid.velocity+"");
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
			time:{
				slice: 1000,
				animatedSolids:[],
				animationStarted: false,
				startAnimation: function(){var _=this;
					function step(){
						if(!_.animationStarted) return;
						for(var i=0; i<_.animatedSolids.length; i++){
							var solid = _.animatedSolids[i];
							solid.fallState.doStep();
						}
						setTimeout(step, _.slice);
					}
					
					_.animationStarted = true;
					step();
				},
				stopAnimation: function(){
					this.animationStarted = false;
				}
			},
			gravity:{
				acceleration: function(height){return 10;},
				groundPosition: 450,
				getHeight: function(solid){
					var groundPos = solid.world.gravity.groundPosition;
					return groundPos - solid.icon.getBBox().y2;
				},
				fall: function(solid){
					if(solid.isStatic) return;
					
					var height = solid.world.gravity.getHeight(solid),
						a = solid.world.gravity.acceleration(height),
						duration = Math.sqrt(height*2/a),
						//%%%% a*t*t/2 + u*t - s = 0
						//%%%% t = (-u + Math.sqrt(u*u + 4*a*s))/(2*a)
						// u = solid.velocity.dy;
						// duration = (-u + Math.sqrt(u*u + 4*a*height))/(2*a);
						bRect = solid.icon.getBBox();
						
					// solid.fallState = {
					// 	baseTransform: solid.transformation,
					// 	height: height,
					// 	duration: duration,
					// 	acceleration: a
					// };
					
					solid.fallState = new FallState(solid, a);
					solid.world.time.animatedSolids.push(solid);
					
					
					// solid.icon.attr("gravityProgress", 0);
					// solid.icon.animate({ gravityProgress: 1 }, duration, function(){
					// 	solid.velocity.set(0, 0);
					// });
				}
			}
		};
		template(worldInstance, screen);
		worldInstance.time.startAnimation();
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
		version:"1.0",
		world: World,
		solid: Solid
	};
})(jQuery, Html, Raphael);