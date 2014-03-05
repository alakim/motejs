var Anim = (function($, $R){
	
	var animationElements = [];
	
	var requestAnimFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {setTimeout(callback, 16);};

	function getPosition(elem){
		return {
			x: +elem.attr("x"),
			y: +elem.attr("y")
		};
	}
	
	var step = {dx:3, dy:3};
	var range = {x:300, y:200};
	
	function doStep(){
		for(var el, C=animationElements, i=0; el=C[i],i<C.length; i++){
			var pos = getPosition(el.elem);
			if(pos.x<range.x && pos.y<range.y){
				el.elem.attr({x:pos.x+step.dx, y:pos.y+step.dy});
			}
			else{
				//console.log(1, i, animationElements.length);
				animationElements.splice(i--, 1);
				//console.log(2, i, animationElements.length);
			}
		}
		animationElements.length && requestAnimFrame(doStep);
	}
	
	function animate(elem){
		var e = {
			elem:elem
		};
		animationElements.push(e);
		//console.log(3, animationElements.length);
		animationElements.length && requestAnimFrame(doStep);
	}
	
	return {
		animate: animate
	};
})(jQuery, Raphael);