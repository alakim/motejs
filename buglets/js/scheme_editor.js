define(["jquery", "html", "raphael", "buglet"], function($, $H, $R, Buglet){
	
 	function SchemeEditor(panelOrID){var _=this;
		_.panel = typeof(panelOrID)=="string"?$("#"+panelOrID):$(panelOrID);
		_.selectedBuglet = null;
		
	}
	
	var templates = {
		main: function(){with($H){
			return div(
				select({"class":"selBuglet"},
					option({value:""}, "-----"),
					apply(Buglet.instances, function(bg){
						return option({value:bg.index}, bg.name);
					})
				),
				div({"class":"schemeView"})
			);
		}},
		schemeView: function(bg){with($H){
			return div(
				// bg.scheme.commands.length, " commands in buglet's scheme"
				p({style:"font-weight:bold;"}, "Scheme commands:"),
				table({border:0},
					apply(bg.scheme.commands, function(cmd, i){
						return tr(
							td(i+1, ": ", cmd.toString()),
							td({width:25, valign:"middle", "class":"btDelCmd"})
						);
					})
				)
			);
		}}
	};
	
	function buildView(buglet){
		$(".schemeView").html(templates.schemeView(buglet));
		$(".schemeView .btDelCmd").each(function(i, el){
			var cmdIdx = i;
			$R(el).path("M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z")
			.attr({fill:"#f00", cursor:"pointer", title:"Delete", cmdIdx:i})
			.transform("s0.5t-3,-8")
			.click(function(){
				if(confirm("Удалить эту команду №"+(cmdIdx+1)+"?\n")){
					buglet.scheme.delCommand(cmdIdx);
					buildView(buglet);
				}
			});
		});

	}
	
	$.extend(SchemeEditor.prototype, {
		view: function(){var _=this;
			_.panel.html(templates.main());
			$(".selBuglet").change(function(){var el=$(this);
				var bgIdx = el.val();
				if(bgIdx==""){
					_.selectedBuglet = null;
					return;
				}
				_.selectedBuglet = Buglet.instances[bgIdx];
				buildView(_.selectedBuglet);
			});
		}
	});
	
	return SchemeEditor;
});