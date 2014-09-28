define(["jquery", "html", "settings", "buglet"], function($, $H, $S, Buglet){
	
	var templates = {
		main: function(){with($H){
			return div(
				h2("Control Panel"),
				input({type:"button", value:"Start", "class":"btStart"}),
				table({border:0},
					tr(td("Show paths"), td(input({type:"checkbox", "class":"cbShowPaths"}))),
					tr(td("Delete old paths"), td(input({type:"checkbox", "class":"cbDelOldPaths"})))
				),
				div(
					h3("Select Buglet"),
					templates.bugletSelector()
				),
				table(
					tr({"class":"cmdMove"},
						td(input({type:"button", value:"Move", "class":"btMove"})),
						td("X:", input({type:"text", "class":"tbMoveX", value:0})),
						td("Y:", input({type:"text", "class":"tbMoveY", value:0}))
					)
				)
			);
		}},
		bugletSelector: function(){with($H){
			var coll = Buglet.instances;
			return table({"class":"bugletSelector"}, 
				apply(coll, function(buglet, i){
					return tr(
						td(buglet.name),
						td(input({type:"checkbox", bugletIndex:buglet.index, checked:true}))
					);
				})
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
		
		$(".cmdMove .btMove").click(function(){
			$.each(Buglet.instances, function(i, buglet){
				var chBox = $(".bugletSelector input[bugletIndex="+buglet.index+"]"),
				   checked = chBox[0].checked;
				if(checked){
					var x = +$(".cmdMove .tbMoveX").val(),
						y = +$(".cmdMove .tbMoveY").val();
					buglet.move({x:x, y:y});
				}
			});
		});
	}

	
	
	return CPanel;
});