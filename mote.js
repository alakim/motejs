var Mote = (function($,$H,$R){
	
	function getCoordAttrNames(icon){
		if(!icon.attrs) return ["x", "y"];
		return icon.attrs.y?["x","y"]:
				icon.attrs.cy?["cx","cy"]:
				["x","y"]
	}

	function screen(panel, template){
		if(panel.jquery) panel = panel[0];
		var paper = new $R(panel);
		
		paper.customAttributes.gravityProgress = function (v) {
			var data = this.data("fallData");
			var t = data.duration*v;
			this.attr({transform:"t0,"+(data.acceleration*t*t/2)});
		}
		
		var instance = {
			add: function(obj){
				var icon = obj.template(paper, obj.position);
				icon.data("myset", icon);
				obj.icon = icon;
				obj.screen = instance;
				
				icon.drag(
					function(dx, dy, x, y, e) {//move
						if(obj.isStatic)return;
						var myset = this.data("myset");
						myset.transform(this.data("mytransform")+'T'+dx+','+dy);
					},
					function(x, y, e) {//start
						if(obj.isStatic)return;
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
					},
					function(e) {//end
						if(obj.isStatic)return;
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
					}
				);
				return obj;
			},
			gravity:{
				acceleration: .001,
				groundPosition: 450,
				getHeight: function(obj){
					var groundPos = obj.screen.gravity.groundPosition;
					return groundPos - obj.icon.getBBox().y2;
				},
				fall: function(obj){
					var height = obj.screen.gravity.getHeight(obj);
					var a = obj.screen.gravity.acceleration;
					var duration = Math.sqrt(height*2/a);
					var attNames = getCoordAttrNames(obj.icon);
					var bRect = obj.icon.getBBox();
					obj.icon.data("fallData", {
						pos0:{x:bRect.x, y:bRect.y},
						height: height,
						duration: duration,
						acceleration: a
					});
					
					obj.icon.attr("gravityProgress", 0);
					obj.icon.animate({ gravityProgress: 1 }, duration);
				}
			}
		};
		template(instance, paper)
		return instance;
	}
	
	
	function Object(pos, template){
		if(!pos) pos = {x:0, y:0};
		else if(pos instanceof Array) pos = {x:pos[0], y:pos[1]};
		
		if(!template || typeof(template)!="function") 
			template = function(paper, pos){
				return paper.rect(pos.x, pos.y, 10, 10).attr({fill:"#ffc", stroke:"#448"});
			}
		return {
			position: pos,
			template: template,
			isStatic: false,
			"static": function(v){this.isStatic = v==null?true:v; return this;},
			fall: function(){
				this.screen.gravity.fall(this);
			}
		};
	}

	return {
		version:"1.0",
		screen: screen,
		object: Object
	};
})(jQuery, Html, Raphael);