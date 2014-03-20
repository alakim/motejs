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
		this.T = new Vector(Tx, Ty);
		this.R = R||0;
	}
	$.extend(Transformation.prototype, {
		shift: function(dx, dy){
			this.T.add(dx, dy);
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
		this.acceleration = function(){
			return solid.world.gravity.acceleration(solid);
		}
	}
	
	var Gravity = (function(){
		var fallingSolids = [];
		var delay = 0,
			minVelocity = 1e-2,
			minAcceleration = 1e-4;
			
		var prevDT;
			
		function animationStep(){
			var now = +new Date;
			
			for(var solid,C=fallingSolids,i=0; solid=C[i],i<C.length; i++){
				if(!solid) continue;
				if(solid.world.debug.animationLimit != null){
					if(solid.world.debug.animationLimit--<=0){
						throw "Debug animation limit exceeded";
					}
				}
				
				var state = solid.fallState,
					dt = now - state.time - delay;
				state.time = now;
				
				
				if(dt>0){
					if(dt>prevDT*100) dt = prevDT;
					prevDT = dt;
				}
					
				function terminate(){
					fallingSolids.splice(i--, 1); // TERMINATE FALLING
					solid.icon.attr({transform:solid.transformation});
					solid.updateBBox();
				}
				
				var d = new Vector(state.velocity).mul(dt);
				var pos0 = new Vector(
					state.velocity.x>0? solid.transformation.T.x+solid.bbox.width: solid.transformation.T.x,
					state.velocity.y>0? solid.transformation.T.y+solid.bbox.height: solid.transformation.T.y
				);
				
				var accel = state.acceleration();
				//console.log("a0 "+accel);
				for(var rope,j=0; rope=solid.ropes[j],j<solid.ropes.length; j++){
					accel.add(rope.tension.mul(-1/solid.mass));
				}
				//console.log("a1 "+accel);
				
				state.velocity.x += accel.x * dt;
				state.velocity.y += accel.y * dt;
				//state.velocity.add(state.acceleration().mul(dt));
				
				
				var posD = new Vector(pos0).add(d);
				var fMotion = linearFunction(pos0, posD);
				
				if(solid.world.trace.falling){
					solid.world.getScreen().path(["M",pos0.x, pos0.y, "L", posD.x, posD.y]).attr({stroke:"green"});
					solid.world.getScreen().circle(posD.x, posD.y, 2).attr({fill:"green", "stroke-width":0});
				}
				if(solid.world.trace.acceleration){
					var rate = 700;
					solid.world.getScreen().path(["M",pos0.x, pos0.y, "l", accel.x*rate, accel.y*rate]).attr({stroke:"#ffa"});
					solid.world.getScreen().circle(pos0.x, pos0.y, 2).attr({fill:"#ffa", "stroke-width":0});
				}
				
				var collision;
				for(var sld,All=solid.world.solids,j=0; sld=All[j],j<All.length; j++){
					if(sld===solid) continue;
					collision = Collision.check(solid, fMotion, pos0, posD, sld);
					if(collision) break;
				}
				if(!collision){
					collision = Collision.checkBorders(solid, fMotion, pos0, posD);
				}
				if(collision){
					terminate();
					collision.activate();
				}
				else{
					solid.transformation.shift(d.x, d.y);
					solid.bbox.x+=d.x; solid.bbox.x2+=d.x; solid.bbox.cx+=d.x; 
					solid.bbox.y+=d.y; solid.bbox.y2+=d.y; 
					solid.icon.attr({transform:solid.transformation});
					solid.redrawRopes();
				};
				
				if(state.velocity.getLength()<minVelocity && accel.getLength()<minAcceleration){
					terminate();
				}
			}
			
			if(fallingSolids.length){
				delay = fallingSolids[0].world.gravity.delay || 0;
				if(delay)
					setTimeout(function(){
						requestAnimFrame(animationStep);
					}, delay);
				else
					requestAnimFrame(animationStep);
			}
		}
		
		var defaultAcceleration = new Vector(0, .001);
		
		return {
			acceleration: function(solid){return defaultAcceleration;},
			groundPosition: 450,
			delay: 0,
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
				solid.redrawRopes();
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
				solid.redrawRopes();
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
			reflect:{top:1, left:1, right:1, bottom:1},
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
			gravity: Gravity,
			trace:{
				falling: false,
				collisions: false,
				acceleration: false,
				tensions: false
			},
			debug:{
				animationLimit: null
			}
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
		set: function(x, y){
			if(arguments.length==1){
				if(x instanceof Array){this.x = x[0]; this.y = x[1];}
				else if(x instanceof Vector){this.x = x.x; this.y = x.y}
			}
			else{
				this.x = x; this.y = y;
			}
			return this;
		},
		setPolar: function(mod, angle, degreeMode){
			degreeMode = degreeMode==null?true:degreeMode;
			if(degreeMode) angle = angle/180*Math.PI;
			this.x = Math.cos(angle)*mod;
			this.y = Math.sin(angle)*mod;
			return this;
		},
		toString: function(){
			return "("+[this.x, this.y].join()+")";
		}
	});
	
	function between(x, a, b){ // возвращает true, если значение x лежит между a и b 
		var arr = [a, x, b];
		arr = arr.sort(function(x1,x2){return x1==x2?0:x1<x2?-1:1;});
		return arr[1]===x;
	}	
	function linearFunction(p1, p2){ // линейная функция y = ax+b, проходящая через точки p1 и p2
		var dX = p2.x - p1.x;
		if(!dX) return {constX:p2.x};
		var a = (p2.y - p1.y)/dX;
		return {a: a, b: p1.y - a*p1.x};
	}

	function Collision(sld1, sld2, direction, pos){
		this.active = sld1;
		this.passive = sld2;
		this.direction = direction;
		this.pos = pos;
		if(sld1.world.trace.collisions)
			sld1.world.getScreen().circle(pos.x, pos.y, 2).attr({fill:"red"});
	}
	$.extend(Collision.prototype, {
		activate: function(){var _=this;
			var minVelocity = 1e-2,
				borderMode = !_.passive,
				decrement = borderMode?_.direction=="top"?.4:1:.6;
			
			if(_.active.decrement<decrement) decrement = _.active.decrement;
			if(_.passive && (_.passive.decrement<decrement)) decrement = _.passive.decrement;
			
			if(_.direction=="right" || _.direction=="left")
				_.active.velocity.x*=-1;
			else 
				_.active.velocity.y*=-1;
			
			_.active.velocity.mul(decrement);
			if(_.direction=="top"){
				_.active.transformation.T.y = _.pos.y - _.active.bbox.height;
				_.active.icon.attr({transform:_.active.transformation});
				
				if(_.active.velocity.getLength()>minVelocity)
					_.active.fall();
			}
			else{
				_.active.fall();
			}
			_.active.onCollision(_);
			if(_.passive) _.passive.onCollision(_);
		}
	});
	$.extend(Collision, {
		check: function(solid1, fMotion, pos0, pos, solid2){
			if(!solid2.bbox) return;
			var box = solid2.bbox;
			var sides = {};
			
			if(solid1.velocity.x>0) sides.left = {x:box.x};
			else if(solid1.velocity.x<0) sides.right = {x:box.x2};
			
			if(solid1.velocity.y>0) sides.top = {y:box.y};
			else if(solid1.velocity.y<0) sides.bottom = {y:box.y2};
			
			for(var sideNm in sides){
				var side = sides[sideNm];
				if(side.x!=null && !fMotion.constX && between(side.x, pos0.x, pos.x)){
					var y = fMotion.a*side.x + fMotion.b;
					if(between(y, box.y, box.y2)) return new Collision(solid1, solid2, sideNm, new Vector(side.x, y));
				}
				if(side.y!=null && between(side.y, pos0.y, pos.y)){
					var x = fMotion.constX || (side.y - fMotion.b)/fMotion.a;
					if(between(x, box.x, box.x2)) return new Collision(solid1, solid2, sideNm, new Vector(x, side.y));
				}
			}
		},
		checkBorders: function(solid, fMotion, pos0, pos){
			var sides = {};
			
			if(solid.velocity.x>0 && solid.world.reflect.right) sides.left = {x:solid.world.getScreen().width};
			else if(solid.velocity.x<0 && solid.world.reflect.left) sides.right = {x:0};
			
			if(solid.velocity.y>0 && solid.world.reflect.bottom) sides.top = {y:solid.world.gravity.groundPosition};
			else if(solid.velocity.y<0 && solid.world.reflect.top) sides.bottom = {y:0};

			for(var sideNm in sides){
				var side = sides[sideNm];
				if(side.x!=null && !fMotion.constX && between(side.x, pos0.x, pos.x)){
					var y = fMotion.a*side.x + fMotion.b;
					return new Collision(solid, null, sideNm, new Vector(side.x, y));
				}
				if(side.y!=null && between(side.y, pos0.y, pos.y)){
					var x = fMotion.constX || (side.y - fMotion.b)/fMotion.a;
					return new Collision(solid, null, sideNm, new Vector(x, side.y));
				}
			}
		}
	});
	
	function Solid(world, pos, param){
		var options = {};
		$.extend(options, Solid.defaultOptions);
		$.extend(options, param);
		
		if(!pos) pos = {x:0, y:0};
		else if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		
		var solidInstance = {
			id: getUID(),
			mass: options.mass,
			decrement: options.decrement,
			transformation: new Transformation(pos.x, pos.y),
			getPosition: function(){
				return {
					x: this.transformation.T.x,
					x: this.transformation.T.y
				};
			},
			velocity: new Vector(options.velocity),
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
					cy: (b.y2+b.y)/2,
					y: b.y,
					y2: b.y2,
					width: b.width,
					height: b.height
				}
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
			ropes:[],
			redrawRopes: function(){
				for(var rope,i=0; rope=this.ropes[i],i<this.ropes.length; i++){
					rope.redraw(this);
				}
			},
			onCollision: options.onCollision,
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
		decrement: .8,
		velocity: [0, 0],
		template: function(screen){return screen.rect(0, 0, 10, 10).attr({fill:"#ffc", stroke:"#448"});},
		onCollision: function(collision){
			//console.log(solid, activeMode);
		}
	};

	return {
		version:"3.7",
		world: World,
		solid: Solid,
		getUID: getUID,
		Transformation: Transformation,
		Vector: Vector,
		Gravity: Gravity,
		FallState: FallState,
		requestAnimFrame: function(){return requestAnimFrame;}
	};
})(jQuery, Html, Raphael);