define(["jquery", "html", "settings", "buglet"], function($, $H, $S, Buglet){
	
	var templates = {
		main: function(){with($H){
			return div(
				h2("Control Panel"),
				input({type:"button", value:"Start", "class":"btStart"}),
				table({border:0},
					tr(td("Show paths"), td(input({type:"checkbox", "class":"cbShowPaths"}))),
					tr(td("Delete old paths"), td(input({type:"checkbox", "class":"cbDelOldPaths"})))
				)
			);
		}}
	};
	
	function CPanel(pnlID){var _=this;
		_.panel = $("#"+pnlID);
		
		_.panel.html(templates.main());
		
		$(".btStart").click(function(){
			$.each(Buglet.instances, function(i, buglet){
				buglet.start();
			});
		});
		
		$(".cbShowPaths").attr("checked", $S.showPath).click(function(e){
			var v = e.target.checked;
			$S.showPath = v;
		});
		
		$(".cbDelOldPaths").attr("checked", $S.deleteOldPath).click(function(e){
			var v = e.target.checked;
			$S.deleteOldPath = v;
		});
	}

	
	
	return CPanel;
});