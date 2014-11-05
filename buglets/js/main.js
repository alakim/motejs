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

requirejs(["jquery", "html", "settings", "cpanel", "buglet", "field", "commands", "simplebuglet"], function($, $H, $S, CPanel, Buglet, Field, Cmd, SimpleBuglet) {
	// $S.showPath = true;
	// $S.deleteOldPath = false;
	
	var field = new Field("out");
	
	(function(){ 
		
		
		if(true){
			// создание баглета
			var bg1 = new Buglet("Our First Buglet", field, {x:25, y:55}, -50);
			
			// тестовый список команд
			// как-то не красиво вызываются конструкторы команд
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:159, y:168}, bg1.scheme));
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:259, y:288}, bg1.scheme));
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:374, y:308}, bg1.scheme));
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:474, y:208}, bg1.scheme));
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:374, y:108}, bg1.scheme));
			bg1.scheme.addCommand(new Cmd.MoveCmd({x:324, y:228}, bg1.scheme));
			
			bg1.show();
		}
		
		
		if(true){
			var bg2 = new Buglet("Our Second Buglet", field, {x:325, y:55}, 130);
			bg2.scheme.addCommand(new Cmd.MoveCmd({x:359, y:568}, bg2.scheme));
			bg2.show();
		}
		
		var bg3 = new SimpleBuglet("Our Third Buglet", field, {x:425, y:255}, 30);
		bg3.scheme.addCommand(new Cmd.MoveCmd({x:59, y:368}, bg3.scheme));
		bg3.show();
		
		setTimeout(function(){
			bg3.setHealth(.5);
		}, 1500);
		
		var cpnl = new CPanel("cpanel"); // после создания всех баглетов

	})();
	
});