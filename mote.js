var Mote = (function($,$H,$R){
	
	function getCoordAttrNames(icon){
		if(!icon.attrs) return ["x", "y"];
		return icon.attrs.y?["x","y"]:
				icon.attrs.cy?["cx","cy"]:
				["x","y"]
	}

	function World(panel, template){
		if(panel.jquery) panel = panel[0];
		var screen = new $R(panel);
		
		screen.customAttributes.gravityProgress = function (v) {
			var data = this.data("fallData");
			var t = data.duration*v;
			this.attr({transform:"t0,"+(data.acceleration*t*t/2)});
		}
		
		var instance = {
			add: function(solid){
				var icon = solid.template(screen, solid.spawnPosition);
				icon.data("myset", icon);
				solid.icon = icon;
				solid.world = instance;
				
				icon.drag(
					function(dx, dy, x, y, e) {//move
						if(solid.isStatic)return;
						var myset = this.data("myset");
						myset.transform(this.data("mytransform")+'T'+dx+','+dy);
					},
					function(x, y, e) {//start
						if(solid.isStatic)return;
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
					},
					function(e) {//end
						if(solid.isStatic)return;
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
						solid.fall();
					}
				);
				return solid;
			},
			gravity:{
				acceleration: .001,
				groundPosition: 450,
				getHeight: function(solid){
					var groundPos = solid.world.gravity.groundPosition;
					return groundPos - solid.icon.getBBox().y2;
				},
				fall: function(solid){
					if(solid.isStatic) return;
					var height = solid.world.gravity.getHeight(solid);
					var a = solid.world.gravity.acceleration;
					var duration = Math.sqrt(height*2/a);
					var attNames = getCoordAttrNames(solid.icon);
					var bRect = solid.icon.getBBox();
					solid.icon.data("fallData", {
						pos0:{x:bRect.x, y:bRect.y},
						height: height,
						duration: duration,
						acceleration: a
					});
					
					solid.icon.attr("gravityProgress", 0);
					solid.icon.animate({ gravityProgress: 1 }, duration);
				}
			}
		};
		template(instance, screen)
		return instance;
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