requirejs.config({
    baseUrl: "js",
    paths: {
		jquery: "lib/jquery-1.11.0.min",
		html:"lib/html",
		raphael:"lib/raphael-min"
    },
	urlArgs: "bust=" + (new Date()).getTime(),
	shim:{
		"html":{exports:"Html"},
		"raphael":{exports:"Raphael"}
	}
});

requirejs(["jquery", "html", "buglet", "field"], function($, $H, Buglet, Field) {
	var field = new Field("out");
	
	var bg1 = new Buglet("Our First Buglet", field, {x:25, y:55});
	bg1.show();
	
	setTimeout(function(){
		//bg1.move({x:55, y:67});
	}, 2000);
	
});