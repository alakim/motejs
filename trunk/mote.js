var Mote = (function($,$H,$R){
	
	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		screen.customAttributes.gravityProgress = function (v) {
			var fallState = this.data("solid").fallState;
			var t = fallState.duration*v;
			this.attr({transform:"t0,"+(fallState.acceleration*t*t/2)});
		}
		
		var worldInstance = {
			add: function(solid){
				var icon = solid.template(screen, solid.spawnPosition);
				icon.data("solid", solid);
				solid.icon = icon;
				solid.world = worldInstance;
				
				icon.data("iconSet", icon);
				icon.drag(
					function(dx, dy, x, y, e) {//move
						if(solid.isStatic)return;
						var iconSet = this.data("iconSet");
						iconSet.transform(this.data("mytransform")+'T'+dx+','+dy);
					},
					function(x, y, e) {//start
						if(solid.isStatic)return;
						var iconSet = this.data("iconSet");
						iconSet.data("mytransform", this.transform());
					},
					function(e) {//end
						if(solid.isStatic)return;
						var iconSet = this.data("iconSet");
						iconSet.data("mytransform", this.transform());
						solid.fall();
					}
				);
				return solid;
			},
			gravity:{
				acceleration: function(height){return .001;},
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
						bRect = solid.icon.getBBox();
						
					solid.fallState = {
						pos0:{x:bRect.x, y:bRect.y},
						height: height,
						duration: duration,
						acceleration: a
					};
					
					solid.icon.attr("gravityProgress", 0);
					solid.icon.animate({ gravityProgress: 1 }, duration);
				}
			}
		};
		template(worldInstance, screen)
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
			template: template,
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