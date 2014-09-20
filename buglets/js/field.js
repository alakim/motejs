define(["jquery", "raphael"], function($, $R){
	
	function Field(pnlID){var _=this;
		_.screen = $R(pnlID);
	}

	
	
	return Field;
});