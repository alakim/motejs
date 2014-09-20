﻿requirejs.config({
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

requirejs(["jquery", "html", "buglet", "field", "commands"], function($, $H, Buglet, Field, Cmd) {
	var field = new Field("out");
	
	var bg1 = new Buglet("Our First Buglet", field, {x:25, y:55});
	
	// как-то не красиво вызываются конструкторы команд
	bg1.scheme.addCommand(new Cmd.MoveCmd({x:59, y:68}, bg1.scheme));
	bg1.scheme.addCommand(new Cmd.MoveCmd({x:59, y:88}, bg1.scheme));
	bg1.scheme.addCommand(new Cmd.MoveCmd({x:74, y:108}, bg1.scheme));
	
	bg1.show();
	
});