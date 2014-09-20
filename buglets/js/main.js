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
	
	var bg1 = new Buglet("Our First Buglet", field);
	bg1.show();
	
});