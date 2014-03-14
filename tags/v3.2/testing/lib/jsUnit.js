/******************************************************************************
*     Среда модульного тестирования 
*	  http://code.google.com/p/grains/source/browse/#svn/trunk/tools
*		
*		
*  Блокировка тестов: 
*     1) можно в конструкторе теста задавать параметр "enabled"
*     2) можно в url формы тестирования задавать номера включаемых/выключаемых тестов:
*         testPage.aspx#+1,2,3 - включаем тесты 1,2,3
*         testPage.aspx#-1,2,3 - выключаем тесты 1,2,3
*
*  Использование макетов:
*    Для создания макета необходимо определить интерфейс,
*    и создать класс, наследующий от JSUnit.MockObject, и реализующий данный интерфейс
*
*    Перед вызовом методов макета необходимо сначала запрограммировать эти вызовы.
*    Для этого нужно вызвать метод expect данного макета, и в него передать:
*        1) имя метода
*        2) массив значений аргументов вызова метода (если метод имеет единственный
*           аргумент, можно не создавать массив, а просто передать это значение)
*        3) значение, возвращаемое в качестве результата выполнения метода
*
*    Если одним из аргументов вызываемого метода является функция-обработчик, 
*    который ДОЛЖЕН БЫТЬ ВЫЗВАН в результате выполнения метода, то 
*    в списке значений аргументов на соответствующем месте следует поместить
*    экземпляр класса JSUnit.CallbackMarker. При вызове этого обработчика указанное
*    значение результата передается этому обработчику.
*
*    Если среди аргуметов вызываемого метода есть функция-обработчик, 
*    которая НЕ ДОЛЖНА БЫТЬ ВЫЗВАНА в результате выполнения метода, вместо нее 
*    следует передать ссылку на функцию JSUnit.emptyFunction.
*
*  Для создания теста достаточно вызвать конструктор класса JSUnit.Test, или производного
*  от него класса. После этого следует определить метод run данного теста.
*  Все созданные экземпляры тестов будут автоматически исполнены после загрузки веб-формы.
*******************************************************************************/

var JSUnit = {
	version: "1.2.199",
	
	MockObject: function(){
		this.expectations = [];
	},
	
	CallbackMarker: function(){},
	
	emptyFunction: function(){},
	
	isIE: function(){
		return navigator.appName.match(/internet\s+explorer/i);
	},
	
	Test: function(testName, testCaseName, enabled){
		JSUnit.instances.push(this);
		this.id = JSUnit.instances.length;
		this.name = testName;
		this.caseName = testCaseName==null?"":testCaseName;
		this.enabled = enabled==null?true:enabled;
	},
	
	instances: [],
	results: [],
	
	runAll: function(){
		function selectTests(){
			var str = document.location.hash;
			var mt = str.match(/#([\+\-])((\d+\,)*\d+)/i);
			if(!mt)
				return;
			var nmrs = mt[2];
			var sign = mt[1];
			if(nmrs.length>0){
				var arr = nmrs.split(",");
				for(var i=0;i<JSUnit.instances.length;i++){
					JSUnit.instances[i].enabled = sign=="-";
				}
				for(var i=0;i<arr.length;i++){
					var idx = parseInt(arr[i])-1;
					JSUnit.instances[idx].enabled = sign=="+";
				}
			}
		}
		selectTests();
		JSUnit.results = [];
		for(var i=0;i<JSUnit.instances.length;i++){
			var t = JSUnit.instances[i];
			var res = {caseName:t.caseName, name:t.name, disabled:!t.enabled};
			if(!t.enabled){
				res.result = true;
			}
			else{
				try{
					t.run();
					res.result = true;
				}
				catch(e){
					res.result = false;
					res.message = e.message?e.message:e;
				}
			}
			JSUnit.results[i] = res;
		}
	},
	
	displayResults: function(){
		var errorsFound = false;
		var html = ["<table border=\"0\" cellpadding=\"3\" cellspacing=\"0\">"];
		var curCase = "";
		for(var i=0;i<JSUnit.results.length;i++){
			var r = JSUnit.results[i];
			if(r.caseName!=curCase){
				curCase = r.caseName;
				html.push("<tr style=\"background-color:#444444; color:#ffffff; font-weight:bold;\"><td colspan=\"3\" valign=\"top\" align=\"center\">"+curCase+"</td></tr>");
				
			}
			html.push("<tr style=\"background-color:#"+(i%2?"f7f7f7":"ffffff")+";\"><td valign=\"top\">");
			html.push(i+1);
			/*html.push("</td><td valign=\"top\">");
			html.push(r.caseName);*/
			html.push("</td><td valign=\"top\">");
			html.push(r.name);
			html.push("</td><td id=\"jsunit_res_"+(i+1)+"\">");
			html.push("<span style=\"color:"+(r.result==true?(r.disabled?"#aaaa00":"green"):"red")+"\">"+(r.result==true?(r.disabled?"disabled":"OK"):r.message)+"</span>");
			html.push("</td></tr>");
			if(r.result!=true)
				errorsFound = true;
		}
		html.push("</table>");
		
		document.body.innerHTML+=(errorsFound?"<p style=\"background-color:yellow;color:red;text-align:center;padding:3px;font-weight:bold;font-size:18px;\">Тестирование завершено с ошибками</p>":"")+html.join("");
	},
	
	init: function(){
		JSUnit.runAll();
		JSUnit.displayResults();
	}
};

JSUnit.MockObject.prototype = {
	
	expect: function(methodName, args, result, maxCount/*=1*/){var _=this;
		// 1) если задан maxCount=0, то это означает, что этот метод не должен вызываться
		// 2) значением result может быть экземпляр класса Callback, тогда вместо возвращения аргумента будет вызвана указанная в нем функция
		function checkInterface(){
			var sampleObject = new (Object.getType(_).getInterfaces()[0])();
			if(typeof(sampleObject[methodName])!="function")
				throw new Error("Mock Interface Error: Method '"+methodName+"()' is not applicable to " + Object.getTypeName(this));
		}
		
		checkInterface();
		
		var ex = {method:methodName, args: args, result: result, counter:0, maxCount:(maxCount==null?1:maxCount)};
		_.expectations.push(ex);
		_[methodName] = function(){
			var args = [];
			for(var i=0; i<arguments.length; i++){
				args.push(arguments[i]);
			}
			if(args.length==0)
				args = null;
			else if(args.length==1)
				args = args[0];
			return _.getResult(methodName, args);
		}
	},
	
	getResult: function(method, args){
		function getCallback(exp){
			if(!args)
				return null;
			for(var i=0;i<args.length;i++){
				var a = args[i];
				if(Object.getTypeName(exp.args[i])=="JSUnit.CallbackMarker"){
					return a;
				}
			}
			return null;
		}
		for(var i=0;i<this.expectations.length;i++){
			var ex = this.expectations[i];
			if(ex.method==method && this.compare(ex.args, args)){
				ex.counter++;
				var clbk = getCallback(ex);
				if(clbk){
					clbk(ex.result);
				}
				else if(ex.result){
					return ex.result;
				}
				return null;
			}
		}
		throw new Error("Unexpected method call: "+Object.getTypeName(this)+"." + method+"("+args+")");
	},
	
	compare: function(x, y){ // сравнение произвольных объектов
		if(x==null && y==null)
			return true;
		if((typeof(x)=="function" && typeof(y)=="undefined") || (typeof(y)=="function" && typeof(x)=="undefined"))// Это случай для работы с макетами - метод макета может быть не определен (соответствующее ожидание не запрограммировано), но ссылка на него передается среди аргументов вызова другого метода
			return true; 
		if((x==null && y!=null)||(x!=null && y==null))
			return false
			
		if((typeof(x)=="function" && Object.getTypeName(y)=="JSUnit.CallbackMarker") || (typeof(y)=="function" && Object.getTypeName(x)=="JSUnit.CallbackMarker") )
			return true; 
		if(typeof(x)!=typeof(y))
			return false;
		if(typeof(x)=="function" && typeof(y)=="function")
			return true; // методы объектов при сравнении не учитываются
		if(x.constructor!=y.constructor)
			return false;
		if(x.constructor==Array){
			if(x.length!=y.length)
				return false;
			for(var i=0; i<x.length; i++){
				if(!this.compare(x[i], y[i]))
					return false;
			}
			return true;
		}
		if(typeof(x)=="object"){
			for(var k in x){
				if(!this.compare(x[k], y[k]))
					return false;
			}
			return true;
		}
		
		return x==y;
	},
	
	checkExpectations: function(){
		for(var i=0;i<this.expectations.length;i++){
			var ex = this.expectations[i];
			if(ex.counter==0 && ex.maxCount>0)
				throw new Error("Expected method call not occured: "+Object.getTypeName(this)+"."+ex.method+"("+ex.args+")");
			else if(ex.counter<ex.maxCount)
				throw new Error("Expected method "+Object.getTypeName(this)+"."+ex.method+"("+ex.args+") called only "+ex.counter+" times (expected "+ex.maxCount+" times)");
			else if(ex.counter>ex.maxCount){
				var countMsg = ex.maxCount==1?("once ("+ex.counter+" times)"):(ex.maxCount+" times");
				throw new Error("Expected method called more that "+countMsg+": "+Object.getTypeName(this)+"."+ex.method+"("+ex.args+")");
			}
		}
		this.expectations = [];
	}
}

JSUnit.Test.prototype = {
	run: function(){},
	assert: function(expr, std, msg){
			
		function valueToString(val){
			if(val==null)
				return "null";
			if(val=="")
				return "\"\"";
			if(typeof(val.length)!="undefined" && typeof(val)!="string"){
				var s = [];
				for(var i=0; i<val.length; i++){
					s.push(valueToString(val[i]));
				}
				return "["+s.join(",")+"]";
			}
			
			if(typeof(val)=="object"){
				var s = [];
				for(var k in val){
					s.push(k+":"+valueToString(val[k]));
				}
				return "{"+s.join("; ")+"}";
			}
			return val.toString();
		}

		function compare(x,y){
			if(x==null && y==null) return true;
			if(x==null || y==null) return false;
			if(typeof(x)!=typeof(y)) return false;
			if(x.constructor==Array){
				if(x.length!=y.length) return false;
				for(var i=0; i<x.length; i++){
					if(!compare(x[i], y[i])) return false;
				}
				return true;
			}
			if(typeof(x)=="object"){
				for(var k in x){
					if(!compare(x[k], y[k])) return false;
				}
				for(var k in y){
					if(!compare(x[k], y[k])) return false;
				}
				return true;
			}
			if(typeof(x)=="function") return true;
			
			return x == y;
		}
		
		function difPos(s1, s2){
			if(typeof(s1)!="string" || typeof(s2)!="string")
				return null;
			for(var i=0; i<s1.length; i++){
				var c1 = s1.charAt(i);
				var c2 = s2.charAt(i);
				if(c1!=c2)
					return i;
			}
			return null;
		}
		if(!compare(expr, std)){
			var pos = difPos(std, expr);
			var posStr = pos==null?"":(" at pos "+pos+": '"+std.slice(0, pos)+"'");
			throw new Error("Assertion failed: "+this._str2Html((msg?msg:""))+" expected: "+this._str2Html(valueToString(std))+", but was: "+this._str2Html(valueToString(expr))+posStr);
		}
	},
	
	_str2Html: function(str){
		if(str==null)
			return "";
		if(typeof(str)=="undefined")
			return "";
		if(typeof(str)!="string")
			str = str.toString();
		return str.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
	}
}

// Отображение ошибок, возникающих в отдельном потоке
JSUnit.Test.displayAsyncError = function(test, error){
	var td = $get("jsunit_res_"+test.id);
	if(!td)
		alert("Ошибка теста "+test.id+": "+error.message);
	else
		td.innerHTML = "<span style=\"color:red;\">"+error.message+"</span>";
}

