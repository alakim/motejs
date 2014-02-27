var Mote = (function($,H,R){

	function screen(panel){
		if(panel.jquery) panel = panel[0];
		var paper = new R(panel);
		
		return {
			//canvas: paper,
			add: function(obj){
				var img = obj.template(paper, obj.position);
				img.data("myset", img);
				
				img.drag(
					function(dx, dy, x, y, e) {//dragmove
						var myset = this.data("myset");
						myset.transform(this.data("mytransform")+'T'+dx+','+dy);
					},
					function(x, y, e) {//dragstart
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
					},
					function(e) {//dragend
						var myset = this.data("myset");
						myset.data("mytransform", this.transform());
					}
				);

			}
		}
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
			static: function(v){this.isStatic = v==null?true:v;}
		};
	}

	return {
		version:"1.0",
		screen: screen,
		object: moteObject
	};
})(jQuery, Html, Raphael);