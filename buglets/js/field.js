define(["jquery", "raphael"], function($, $R){
	
	function Field(pnlID){var _=this;
		var pnl = $("#"+pnlID);
		_.screen = $R(pnlID);
		
		// отрисовка фона
		_.screen.rect(0, 0, pnl.width(), pnl.height()).attr({fill:"cfc"});
		
		
		_.screen.customAttributes.progress = function (v) {
			var path = this.data("mypath"),
				attrs = this.attr(),
				offset = { x: 0, y: 0 };

			if (!path) return{transform: "t0,0"};
			
			if (attrs.hasOwnProperty("width")) {
				offset.x = -this.attr("width") / 2;
				offset.y = -this.attr("height") / 2;
			}
			
			var len = path.getTotalLength();
			var point = path.getPointAtLength(v * len);

// 			var trail = this.data("mytrail");
// 			if (trail) {
// 				trail.attr("path", path.getSubpath(0, v * len));
// 			}
			
			return {
				transform: "t" + (point.x + offset.x) + "," + (point.y + offset.y) + 
				"r" + (point.alpha < 180 ? point.alpha + 180 : point.alpha)
			};
		};

		
	}

	
	
	return Field;
});