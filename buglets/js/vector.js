define([], function(){
		
	return {
		length: function(x1, y1, x2, y2){
			return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
		},
		point: function(origin, alpha, length){
			return {
				x:length*Math.cos(alpha*Math.PI/180)+origin.x,
				y:length*Math.sin(alpha*Math.PI/180)+origin.y
			};
		}
	};	
});