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
				.replace("r", this.R instanceof Array?this.R.join(","):this.R);
		}
	});
	$.extend(Transformation, {
		obtain: function(icon){
			var Tx = 0, Ty = 0, R = 0;
			var tAttr = icon.attr("transform");
			$.each(tAttr, function(i, cmd){
				if(cmd[0]=="T"){ 
					Tx+=cmd[1];
					Ty+=cmd[2];
				}
				else if(cmd[0]=="R"){
					if(cmd.length==2) R = cmd[1]
					else if(cmd.length==4) R = [cmd[1], cmd[2], cmd[3]];
				}
			});
			return new Transformation(Tx, Ty, R);
		}
	});
	
	function FallState(solid, velocity){
		this.time = +new Date;
		this.solid = solid;
		this.baseTransform = solid.transformation;
		this.velocity = velocity || solid.velocity || new Vector();
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
					
				var d = new Vector(state.velocity).mul(dt);
				solid.transformation.shift(d.x, d.y);
				solid.bbox.x+=d.x; solid.bbox.x2+=d.x; solid.bbox.cx+=d.x; 
				solid.bbox.y+=d.y; solid.bbox.y2+=d.y; 
				
				state.velocity.add(0, state.acceleration*dt);
				
				var ground = solid.getGroundPos();
				
				var screenWidth = solid.world.getScreen().width;
				
				var absPos = {
					x: solid.transformation.T.x,
					y: solid.transformation.T.y + solid.bbox.height
				};
				
				function terminate(){
					fallingSolids.splice(i--, 1); // TERMINATE FALLING
					solid.icon.attr({transform:solid.transformation});
					solid.updateBBox();
				}
				
				if(absPos.y>=ground && solid.velocity.y>0){
					solid.transformation.T.y = ground - solid.bbox.height;
					terminate();
				}
				else if(solid.world.reflect.top && absPos.y<0 && solid.velocity.y<0){
					solid.transformation.T.y = 0;
					terminate();
					solid.velocity.x = state.velocity.x;
					solid.velocity.y = -state.velocity.y;
					solid.fall();
				}
				else if(solid.world.reflect.left && absPos.x<0 && solid.velocity.x<0){
					solid.transformation.T.x = 0;
					terminate();
					solid.velocity.x = -state.velocity.x;
					solid.velocity.y = state.velocity.y;
					solid.fall();
				}
				else if(solid.world.reflect.right && absPos.x>screenWidth && solid.velocity.x>0){
					solid.transformation.T.x = screenWidth - solid.bbox.width;
					terminate();
					solid.velocity.x = -state.velocity.x;
					solid.velocity.y = state.velocity.y;
					solid.fall();
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
			fall: function(solid){
				if(solid.static) return;
				solid.fallState = new FallState(solid);
				solid.updateBBox();
				fallingSolids.push(solid);
				fallingSolids.length && requestAnimFrame(animationStep);
			}
		};
	})();
	
		
	function draggable(solid){
		var drag = {
			move: function(dx, dy, x, y, e) {
				if(!solid.draggable || !solid.drag.state)return;
				var now = +new Date
					dt = now - solid.drag.state.time;
				solid.drag.state.time = now;
				
				var rate = .5;
				var x0 = solid.transformation.T.x,
					y0 = solid.transformation.T.y;
				
				solid.transformation = solid.drag.state.baseTransform.clone().shift(dx, dy);
				solid.icon.attr({transform: solid.transformation});

				solid.velocity.set(
					(solid.transformation.T.x - x0)*rate/dt,
					(solid.transformation.T.y - y0)*rate/dt
				);
				solid.drag.move.call(solid.icon, dx, dy, x, y, e);
			},
			start:function(x, y, e) {
				if(!solid.draggable)return;
				solid.drag.state = {
					baseTransform: Transformation.obtain(this),
					time: +new Date
				};
				solid.drag.start.call(solid.icon, x, y, e);
			},
			end: function(e) {
				if(!solid.draggable)return;
				solid.drag.state = null;
				solid.updateBBox();
				for(var sld,C=solid.world.solids,i=0; sld=C[i],i<C.length; i++){
					if(sld===solid) continue;
					if($R.isBBoxIntersect(solid.bbox, sld.bbox)){
						solid.connect(sld);
						sld.accept(solid);
					}
				}
				solid.drag.end.call(solid.icon, e);
				solid.fall();
			}
		};
		solid.icon.drag(drag.move, drag.start, drag.end);
	}
	
	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		var worldInstance = {
			getScreen: function(){return screen;},
			solids: [],
			reflect:{top:1, left:1, right:1},
			add: function(solid){
				var icon = solid.template(screen);
				icon.transform(solid.transformation);
				icon.data("solid", solid);
				solid.icon = icon;
				solid.world = worldInstance;
				solid.updateBBox();
				solid.world.solids.push(solid);
				draggable(solid);
				if(!solid.static) solid.fall();
				return solid;
			},
			gravity: Gravity
		};
		template(worldInstance, screen);


		return worldInstance;
	}
	
	function Vector(x, y){
		switch(arguments.length){
			case 2: this.x = x; this.y = y; break;
			case 1: if(x instanceof Array){this.x = x[0]; this.y = x[1];}
					else if(x instanceof Vector){this.x = x.x; this.y = x.y}
				break;
			default: this.x = 0; this.y = 0; break;
		}
		if(arguments.length==2){this.x = x; this.y = y;}
	}
	$.extend(Vector, {
		scalarProd: function(v1, v2){return v1.x*v2.x + v1.y*v2.y;}
	});
	$.extend(Vector.prototype, {
		add: function(x, y){
			if(arguments.length==1){
				if(x instanceof Array){this.x+=x[0]; this.y+=x[1];}
				else if(x instanceof Vector){this.x+=x.x; this.y+=x.y;}
			}
			else{this.x+=x; this.y+=y;}
			return this;
		},
		mul: function(rate){this.x*=rate;this.y*=rate; return this;},
		getAngle: function(degreeMode){
			degreeMode = degreeMode==null?true:degreeMode;
			var angle = Math.atan(this.y/this.x);
			return degreeMode?angle/Math.PI*180:angle;
		},
		getLength: function(){return Math.sqrt(this.x*this.x + this.y*this.y);},
		getPolar: function(degreeMode){
			degreeMode = degreeMode==null?true:degreeMode;
			return {
				mod:this.getLength(), 
				angle:this.getAngle(degreeMode)
			};
		},
		set: function(x, y){this.x = x; this.y = y; return this;},
		setPolar: function(mod, angle, degreeMode){
			degreeMode = degreeMode==null?true:degreeMode;
			if(degreeMode) angle = angle/180*Math.PI;
			this.x = Math.cos(angle)*mod;
			this.y = Math.sin(angle)*mod;
			return this;
		},
		toString: function(){
			return [this.x, this.y].join();
		}
	});
	
	// function deg2Rad (deg) { return deg / 180 * Math.PI; }
	// function rad2Deg (rad) { return rad / Math.PI * 180; }

	// // Возвращает разложение вектора в системе координат, 
	// // развернутой на угол angle (в градусах)
	// function vector(vx, vy, angle){
	// 	var abs = Math.sqrt(vx*vx + vy*vy),
	// 		vAngle = Math.atan(vx/vy) + deg2rad(angle); // угол вектора относительно новой системы координат
	// 	
	// 	return {
	// 		vx: vx, vy: vy,
	// 		// модуль вектора
	// 		abs: abs,
	// 		// нормальная составляющая
	// 		n: Math.sin(vAngle)*abs,
	// 		// продольная составляющая
	// 		t: Math.cos(vAngle)*abs
	// 	}
	// }
	// 
	// function Collision(solid1, solid2, decrement){
	// 	var pos1 = solid1.getPosition(),
	// 		pos2 = solid2.getPosition();
	// 	var angle = $R.angle(pos1.x, pos1.y, pos2.x, pos2.y);
    // 
	// 	decrement = decrement || .5;
	// 	// var v = {
	// 	// 	vx: (solid1.velocity.vx + solid2.velocity.vx)*decrement,
	// 	// 	vy: (solid1.velocity.vy + solid2.velocity.vy)*decrement
	// 	// };
	// 	
	// 	var v1 = vector(solid1.velocity.vx, solid1.velocity.vy, angle),
	// 		v2 = vector(solid2.velocity.vx, solid2.velocity.vy, angle);
	// 		
	// 	
	// }
	
	function Solid(world, pos, param){
		var options = {};
		$.extend(options, Solid.defaultOptions);
		$.extend(options, param);
		
		if(!pos) pos = {x:0, y:0};
		else if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		
		var solidInstance = {
			id: getUID(),
			mass: options.mass,
			transformation: new Transformation(pos.x, pos.y),
			getPosition: function(){
				return {
					x: this.transformation.T.x,
					x: this.transformation.T.y
				};
			},
			velocity: new Vector(),
			template: options.template,
			fallState: null,
			icon:null,
			bbox:null,
			static: options.static,
			draggable: options.draggable,
			falling: true,
			fall: function(){
				if(!this.falling) return;
				this.world.gravity.fall(this);
			},
			updateBBox: function(){
				var b = this.icon.getBBox();
				this.bbox = {
					x: b.x,
					x2: b.x2,
					cx: (b.x2+b.x)/2,
					y: b.y,
					y2: b.y2,
					width: b.width,
					height: b.height
				}
			},
			getGroundPos: function(){var _=this;
				var cx = _.bbox.cx,
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
			},
			connect: function(solid){
				// console.log([this.id, " connected to ", solid.id]);
			},
			accept: function(solid){
				// console.log([this.id, " accepts ", solid.id]);
			},
			drag:{
				start: function(){},
				move: function(){},
				end: function(){}
			}
		};
		return world.add(solidInstance);
	}
	Solid.defaultOptions = {
		draggable: true,
		"static": false,
		mass: 1,
		template: function(screen){return screen.rect(0, 0, 10, 10).attr({fill:"#ffc", stroke:"#448"});}
	};

	return {
		version:"3.3",
		world: World,
		solid: Solid,
		getUID: getUID,
		Transformation: Transformation,
		Vector: Vector,
		requestAnimFrame: function(){return requestAnimFrame;}
	};
})(jQuery, Html, Raphael);