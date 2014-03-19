var Space = (function($,$R,$M){
	function Gravity(star){var _=this;
		var fallingSolids = [];
		
		function animationStep(){
			var now = +new Date;
			
			for(var solid,C=fallingSolids,i=0; solid=C[i],i<C.length; i++){
				var state = solid.fallState,
					dt = now - state.time;
				state.time = now;
					
				function terminate(){
					fallingSolids.splice(i--, 1); // TERMINATE FALLING
					solid.icon.attr({transform:solid.transformation});
					solid.updateBBox();
				}
				
				// var d = new Vector(state.velocity).mul(dt);
				// var pos0 = new Vector(
				// 	state.velocity.x>0? solid.transformation.T.x+solid.bbox.width: solid.transformation.T.x,
				// 	state.velocity.y>0? solid.transformation.T.y+solid.bbox.height: solid.transformation.T.y
				// );
				// 
				// state.velocity.add(0, state.acceleration*dt);
				// 
				// var posD = new Vector(pos0).add(d);
				// var fMotion = linearFunction(pos0, posD);
				// 
				// if(solid.world.trace.falling){
				// 	solid.world.getScreen().path(["M",pos0.x, pos0.y, "L", posD.x, posD.y]).attr({stroke:"green"});
				// 	solid.world.getScreen().circle(posD.x, posD.y, 2).attr({fill:"green", "stroke-width":0});
				// }
				// 
				// var collision;
				// for(var sld,All=solid.world.solids,j=0; sld=All[j],j<All.length; j++){
				// 	if(sld===solid) continue;
				// 	collision = Collision.check(solid, fMotion, pos0, posD, sld);
				// 	if(collision) break;
				// }
				// if(!collision){
				// 	collision = Collision.checkBorders(solid, fMotion, pos0, posD);
				// }
				// if(collision){
				// 	terminate();
				// 	collision.activate();
				// }
				// else{
				// 	solid.transformation.shift(d.x, d.y);
				// 	solid.bbox.x+=d.x; solid.bbox.x2+=d.x; solid.bbox.cx+=d.x; 
				// 	solid.bbox.y+=d.y; solid.bbox.y2+=d.y; 
				// 	solid.icon.attr({transform:solid.transformation});
				// };
			}
			fallingSolids.length && $M.requestAnimFrame(animationStep);
		}
		
		$.extend(_,{
			star: star,
			acceleration: function(height){return .001;},
			fall: function(solid){
				if(solid.static) return;
				solid.fallState = new $M.FallState(solid);
				solid.updateBBox();
				fallingSolids.push(solid);
				fallingSolids.length && $M.requestAnimFrame()(animationStep);
			}
		});
	}
	
	return {
		version: "1.0",
		Gravity: Gravity
	};
})(jQuery, Raphael, Mote);