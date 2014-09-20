define(["jquery", "raphael"], function($, $R){
	
	function Field(pnlID){var _=this;
		var pnl = $("#"+pnlID);
		_.screen = $R(pnlID);
		
		// отрисовка фона
		_.screen.rect(0, 0, pnl.width(), pnl.height()).attr({fill:"cfc"});
	}

	
	
	return Field;
});