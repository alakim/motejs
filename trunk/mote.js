var Mote = (function($,$H,$R){

	function screen(panel){
		if(panel.jquery) panel = panel[0];
		var paper = new $R(panel);
		
		paper.customAttributes.gravityProgress = function (v) {
			var data = this.data("fallData");
			var t = data.duration*v;
			this.attr({y:data.pos0.y + data.acceleration*t*t/2});
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
				acceleration: .0002,
				fall: function(obj, height){
					var a = obj.screen.gravity.acceleration;
					var duration = Math.sqrt(height*2/a);
					obj.icon.data("fallData", {
						pos0:{x:obj.icon.attr("x"), y:obj.icon.attr("y")},
						height: height,
						duration: duration,
						acceleration: a
					});
					
					obj.icon.attr("gravityProgress", 0);
					obj.icon.animate({ gravityProgress: 1 }, duration);
				}
			}
		};
		return instance;
	}
	
	
	function moteObject(pos, template){
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
			fall: function(height){
				this.screen.gravity.fall(this, height);
			}
		};
	}

	return {
		version:"1.0",
		screen: screen,
		object: moteObject
	};
})(jQuery, Html, Raphael);