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
	
	function Velocity(vx, vy){
		this.vx = vx||0;
		this.vy = vy||0;
	}
	$.extend(Velocity.prototype, {
		set: function(vx, vy){
			this.vx = vx;
			this.vy = vy;
		},
		accelerate: function(dVx, dVy){
			this.vx+=dVx;
			this.vy+=dVy;
		},
		toString: function(){
			return [this.vx, this.vy].join();
		}
	});
	
	function FallState(solid, velocity){
		this.time = +new Date;
		this.solid = solid;
		this.baseTransform = solid.transformation;
		this.velocity = velocity || solid.velocity || new Velocity();
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
					
				var dx = state.velocity.vx*dt,
					dy = state.velocity.vy*dt;
				solid.transformation.shift(dx, dy);
				
				state.velocity.accelerate(0, state.acceleration*dt);
				
				var ground = solid.getGroundPos();
				
				var absPos = solid.transformation.T.y + solid.spawnPosition.y + solid.bbox.height;
				if(absPos>=ground){
					solid.transformation.T.y = ground - solid.spawnPosition.y - solid.bbox.height;
					fallingSolids.splice(i--, 1); // TERMINATE FALLING
					
					solid.icon.attr({transform:solid.transformation});
					solid.updateBBox();
				}
				else{
					solid.icon.attr({transform:solid.transformation});
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
				solid.updateBBox();
				fallingSolids.push(solid);
				fallingSolids.length && requestAnimFrame(animationStep);
			}
		};
	})();
	
	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		var worldInstance = {
			getScreen: function(){return screen;},
			solids: [],
			add: function(solid){
				var icon = solid.template(screen, solid.spawnPosition);
				icon.data("solid", solid);
				solid.icon = icon;
				solid.world = worldInstance;
				solid.updateBBox();
				solid.world.solids.push(solid);
				
				icon.drag(
					function(dx, dy, x, y, e) {//move
						if(solid.isStatic || !solid.drag)return;
						var now = +new Date
							dt = now - solid.drag.time;
						solid.drag.time = now;
						
						var kVel = .5;
						var x0 = solid.transformation.T.x,
							y0 = solid.transformation.T.y;
						
						solid.transformation = solid.drag.baseTransform.clone().shift(dx, dy);
						solid.icon.attr({transform: solid.transformation});

						solid.velocity.set(
							(solid.transformation.T.x - x0)*kVel/dt,
							(solid.transformation.T.y - y0)*kVel/dt
						);
					},
					function(x, y, e) {//start
						if(solid.isStatic)return;
						solid.drag = {
							baseTransform: Transformation.obtain(this),
							time: +new Date
						};
					},
					function(e) {//end
						if(solid.isStatic)return;
						solid.drag = null;
						solid.updateBBox();
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
			id: getUID(),
			spawnPosition: pos,
			transformation: new Transformation(),
			velocity: new Velocity(),
			template: template,
			fallState: null,
			icon:null,
			bbox:null,
			isStatic: false,
			"static": function(v){this.isStatic = v==null?true:v; return this;},
			fall: function(){
				this.world.gravity.fall(this);
			},
			updateBBox: function(){
				var b = this.icon.getBBox();
				this.bbox = {
					x: b.x,
					x2: b.x2,
					y: b.y,
					y2: b.y2,
					width: b.width,
					height: b.height
				}
			},
			getGroundPos: function(){var _=this;
				var cx = (_.bbox.x2 + _.bbox.x)/2,
					groundY = _.world.gravity.groundPosition;
				for(var sld,C=_.world.solids,i=0; sld=C[i],i<C.length; i++){
					if(sld===_ || !sld.bbox) continue;
					if(cx>sld.bbox.x && cx<sld.bbox.x2){
						if(sld.bbox.y<groundY)
							groundY = sld.bbox.y;
					}
				}
				return groundY;
			},
			traceBBox: function(color){var _=this;
				var box = _.bbox,
					color = color || "#f00",
					screen = _.world.getScreen(),
					attr = {stroke:color};
				screen.rect(box.x, box.y, box.width, box.height).attr(attr);
				screen.circle(box.x2, box.y2, 4).attr(attr);
			}
		};
	}

	return {
		version:"2.1",
		world: World,
		solid: Solid
	};
})(jQuery, Html, Raphael);