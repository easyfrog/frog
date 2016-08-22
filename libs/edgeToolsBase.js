
/**
 * Ajax 功能现实
 */
(function( parent ){

	// ztc namespace
	parent.ztc = parent.ztc || {};

	/**
	 * Ajax 实现
	 *
	 * ajax({
	 * 		url:'http://localhost:27019',
	 * 		success:function(str) {
	 * 			console.log(str);
	 * 		},
	 * 		error:function(status) {
	 * 			console.log('error: ' + status);
	 * 		}
	 * 	})
	 */

	var ajax = function( params ) {
		var xhr = new XMLHttpRequest();

		var url     = params.url;
		var method  = params.method  || 'GET';
		var async   = params.async   || true;
		var success = params.success || null;
		var error   = params.error   || null;
		var data    = params.data    || null;

		// ready state change event handler
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					if (success) {success(xhr.responseText);};
				} else {
					if (error) {error(xhr.status);};
				}
			};
		};

		xhr.addEventListener("load", function() {}, false);
		xhr.addEventListener("error", function() {}, false);
		xhr.addEventListener("abort", function() {}, false);

		/*
		// progress event handler
		xhr.upload.addEventListener('progress', function(evt) {
			//evt.lengthComputable,文件是否是空
			//evt.loaded：文件上传的大小   
			//evt.total：文件总的大小 

			if (evt.lengthComputable) {
				var percent = ((evt.loaded / evt.total) * 100).toFixed(1);
			}
			
			if (params.progress) {
				params.progress(evt);
			}
		}, false);
		//*/

		xhr.open(method, url, async);	
		xhr.send(data);
	};

	parent.ztc.ajax = ajax;


	/**
	 * jsonp 实现
	 *
	 * jsonp("http://localhost:27019", {
	 * 	'db':'general',
	 * 	'coll':'project1',
	 * 	'method':'insert',
	 * }, function(str) {
	 * 	console.log(str);
	 * });
	 */
	
	var jsonp = function(url, data, func, timeout) {
		// 回调函数名
        // var cbStr = 'cb_' + (new Date().getTime());
		var cbStr = 'cb_' + getRandomString();

		url = url + (url.indexOf('?') == -1 ? '?' : '&') + parseData(data) +
			 '&callback=' + cbStr;

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.id = 'id_' + cbStr;

		timeout = timeout || 8000;
		var timeout_id = 0;

		func = func || function(o) {
			console.log('jsonp default callback: ', o);
		};

		window[cbStr] = function(str) {
			clearTimeout(timeout_id);
			jsonpRemove(cbStr);
			func(str);
		}

		var head = document.getElementsByTagName('head');

		if (head && head[0]) {
			head[0].appendChild(script);

			// Timeout
			timeout_id = setTimeout(function(){
				jsonpRemove(cbStr);
				
				// 如果超时,则返回原res为undefined
				func();
			}, timeout);
		};
	};

    var getRandomString = function() {
        var str = '';
        var ts = (new Date().getTime() + '').slice(-3);
        var rnd = (Math.random() + '').slice(-5);
        return ts + rnd;
    };

	var jsonpRemove = function( str ) {
		window[str] = undefined;
		var elem = document.getElementById('id_' + str);
		elem.parentNode.removeChild(elem);
	};

	var parseData = function( data ) {
		var res = '';
		if (typeof data === 'string') {
			res = data;
		} else if (typeof data === 'object') {
			var tmp = false;
			for (var key in data) {
				res += (tmp ? '&' : '') + key + '=' + 
					   encodeURIComponent(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
					   // encodeURIComponent
				tmp = true;
			}
		};

		return res;
	};

	parent.ztc.jsonp = jsonp;

}(window));

/**
 * ���õ�һЩ����
 */
(function(){

	window.ztc = window.ztc || {};
	window.z = window.ztc;

	var tools = tools || {};

	/**
	 * cookie
	 */
	tools.setCookie = function(name,value,days) {
		var date = new Date();
		days = days || 14;
		date.setDate(date.getDate() + days);

		document.cookie = name + '=' + value + '; expires=' + date;
	};

	tools.getCookie = function(name) {
		var arr = document.cookie.split('; ');
		for (var i = 0; i < arr.length; i++) {
			arr2 = arr[i].split('=');
			if (arr2[0] == name) {
				return arr2[1];
			};
		};

		return null;
	};

	tools.removeCookie = function(name) {
		tools.setCookie(name, 1, -1);
	};

	/**
	 * localStorage
	 */
	tools.setItem = function( name, value ) {
		localStorage.setItem(name, value);
	};

	tools.getItem = function( name ) {
		return localStorage.getItem(name);
	};

	tools.removeItem = function( name ) {
		localStorage.removeItem(name);
	};

	/**
	 * Scale to Fix Screen And add window resize event
	 * @param  {symbol Element} stageElement sym.getSymbolElement()
	 * @param  {int} baseWidth    default is 640
	 */
	tools.scaleToFixScreen = function( stageElement, baseWidth ) {
		tools.stageScale = scaleStage(stageElement, baseWidth);
		window.addEventListener('resize', function() {
			scaleStage(stageElement, baseWidth);
		});
		// window.onresize = function() {
		// };
	};

	function scaleStage( stageElement, baseWidth ) { 
		var val = baseWidth || 640;

		var delta = window.innerHeight / window.innerWidth;
		var baseHeight = val * delta;
		var scale =  window.innerWidth / val;
		stageElement.css('width',val);
		stageElement.css('height',baseHeight);

		stageElement[0].style.transform             = 'scale(' + scale + ')';
		stageElement[0].style.WebkitTransform       = 'scale(' + scale + ')';
		stageElement[0].style.MsTransform           = 'scale(' + scale + ')';
		stageElement[0].style.MozTransform          = 'scale(' + scale + ')';
		
		stageElement[0].style.transformOrigin       = '0 0';
		stageElement[0].style.WebkitTransformOrigin = '0 0';
		stageElement[0].style.MsTransformOrigin     = '0 0';
		stageElement[0].style.MozTransformOrigin    = '0 0';

		if (tools.scaleStageCallback) {
			tools.scaleStageCallback(val, baseHeight);
		}
		return scale;
	};

	/**
	 * Scroll Object
	 */
	tools.scroll = function (element, eventHolder) {
		new scrollClass(element, eventHolder);
	};

	var scrollClass = function(element, eventHolder) {
		var s = this;

		s.ele         = element;
		s.eh          = eventHolder;
		s.isMouseDown = false;
		s.lastPick    = {x:0,y:0};
		s.curPick     = {x:0,y:0};

		s.addEvents();
	};

	scrollClass.prototype.addEvents = function() {
		var s = this;
		s.eh.addEventListener('mousedown', function(e){s.md(e);});
		s.eh.addEventListener('mousemove',  function(e){s.mm(e);});
		s.eh.addEventListener('mouseup',    function(e){s.mu(e);});
		s.eh.addEventListener('touchstart',function(e){s.md(e);});
		s.eh.addEventListener('touchmove',  function(e){s.mm(e);});
		s.eh.addEventListener('touchend',   function(e){s.mu(e);});
	};

	scrollClass.prototype.md = function(e) {
		var s = this;
		
		s.lastPick.x = e.touches ? e.touches[0].pageX : e.pageX;
		s.lastPick.y = e.touches ? e.touches[0].pageY : e.pageY;

		var rect = s.ele.getBoundingClientRect();

		if (s.lastPick.x >= rect.left && s.lastPick.x <= rect.right && 
			s.lastPick.y >= rect.top && s.lastPick.y <= rect.bottom) {
			s.isMouseDown = true;
			s.lastScrollTop = s.ele.scrollTop;
		};
	};

	scrollClass.prototype.mm = function(e) {
		var s = this;

		if (!s.isMouseDown) {return;};

		s.curPick.x = e.touches ? e.touches[0].pageX : e.pageX;
		s.curPick.y = e.touches ? e.touches[0].pageY : e.pageY;

		var delta = s.curPick.y - s.lastPick.y;
		s.ele.scrollTop = s.lastScrollTop - delta;
	};

	scrollClass.prototype.mu = function(e) {
		this.isMouseDown = false;
	};

	/**
	 * �ж��Ƿ�����PC�˼��Ƿ�Ϊ΢��������
	 */
	tools.getPlatform = function() {
		if (tools.platform) {
			return tools.platform;
		}
		var userAgentInfo = navigator.userAgent;  
		var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
		var isPC = true;  
		var platform = 'PC';
		var isWX = false;
		for (var v = 0; v < Agents.length; v++) {  
		 if (userAgentInfo.indexOf(Agents[v]) > 0) { 
		 	isPC = false; 
		 	platform = Agents[v];

		 	if (userAgentInfo.indexOf('MicroMessenger') > 0) {
		 		isWX = true;
		 	};

		 	break; 
		 }  
		}

		// version
		var version = -1;
		switch (platform) {
			case 'iPhone':
				version = navigator.userAgent.match(/\d_\d(_\d)?/i)[0].match(/\d+/g).join('');
			break;
			case 'Android':
				version = navigator.userAgent.match(/Android \d.+;/)[0].match(/\d/g).join('');
			break;
		}

		if (version.length < 3) {
			version += '0';
		}
		version = parseInt(version);

		tools.platform = {
			isPC: isPC,
			isWX: isWX,
			platform: platform,
			version: version
		};

		return tools.platform;
	};

	/**
	 * �õ���ǰ�Ǻ���(hen) ��������(shu) ���Ƕ�
	 */
	tools.getOrientationState = function() {
		var res = ['shu', 0];
		if (window.orientation) {
			switch (window.orientation) {
				case 0:
					res[0] = 'shu';
					res[1] = 0;
				break;
				case 180:
					res[0] = 'shu';
					res[1] = 180;
				break;
				case 90:
					res[0] = 'hen';
					res[1] = 90;
				break;
				case -90:
					res[0] = 'hen';
					res[1] = -90;
				break;
			}
		} else {
			res = null;
		}
		return res;
	};

	/**
	 * ���õķ��������ı�ʱ, �����ûص�
	 */
	tools.lookOrientationChange = function( callback ) {
		window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', 
			function() {
				var res = tools.getOrientationState();
				callback(res);
			}, false);
	};

	/**
	 * ΢���е�һЩ���÷���
	 */
	tools.wx = tools.wx || {};

	tools.wx.shareData = {};

	/**
	 * ΢�ŷ�����ʼ��
	 * @param  {json} params {
	 *                       	server: default is 'https://general-easyfrog.rhcloud.com/wx' ,
	 *                        	shareData: {
	 *                        		title:'',
	 *                        		desc:'',
	 *                        		link:'url',
	 *                        		imgUrl:'.../xx.jpg',
	 *                        		success:function(),
	 *                        		cancel:function()
	 *                        	},
	 *                        	url:default is sharData.link,
	 *                        	appName: default is 'zhixuan',
	 *                        	debug: default is false,
	 *                        	jsApiList:[],	// default checkApi,frend, timeLine
	 *                        	appendApiList:[],
	 *                        	callback:function(res),	// res: the wx server result.
	 *                        	appendFunctions:[function(params)...], 	// wx.ready callback array
	 *                       }
	 * @return {void}
	 */
	tools.wx.init = function( params ) {
		if (!ztc.jsonp) {
			console.log('not have ztc and ztc.jsonp function.');
			return;
		};

		if (!window.wx) {
			console.log('not have wx sdk: http://res.wx.qq.com/open/js/jweixin-1.0.0.js');
			return;
		};

		var server = params.server || 'https://general-easyfrog.rhcloud.com/wx';

		// define shareData
	    tools.wx.shareData = params.shareData || {
	    	title: '��������',
	    	desc: '��������',
	    	link: 'http://baidu.com',
	    	imgUrl: 'http://www.easyicon.net/api/resize_png_new.php?id=1185704&size=128',
	    	success: function () { },
	    	cancel: function () { }
	    };

	    // params.url = params.url || tools.wx.shareData.link;
	    params.url = params.url || window.location.href;
	    tools.wx.isReady = false;

		ztc.jsonp(server, {
			appName: params.appName || 'inno',
			url: params.url.split('#')[0]
		}, function(res) {
			// ��ʼ����΢��JS-SDK
			wx.config({
		        debug: params.debug || false,
		        appId: res.appId,
		        timestamp: res.timestamp,
		        nonceStr: res.nonceStr,
		        signature: res.signature,
		        jsApiList: params.jsApiList || [
		            'checkJsApi',
		            'onMenuShareTimeline',
		            'onMenuShareAppMessage',
		            'onMenuShareQQ'
		        ].concat(params.appendApiList || [])
		    });

		    wx.error(function(res) {
		    	console.log('wx error:', res);
		    });

			// ����΢��API
		    wx.ready(function(){
		    	wx.onMenuShareTimeline(tools.wx.shareData);
				wx.onMenuShareAppMessage(tools.wx.shareData);
				wx.onMenuShareQQ(tools.wx.shareData);

				// ����������API����
				if (params.appendFunctions) {
					for (var i = 0; i < params.appendFunctions.length; i++) {
						params.appendFunctions[i](params);
					};
				};

				tools.wx.isReady = true;
			});

		    // ���ûص�
		    if (params.callback) {params.callback(res)};
		}, params.timeout);
	};

	/**
	 * ����Code�õ�΢���û���Ϣ
	 * server: 'rh' | 'inno' (default)
	 */
	tools.wx.getUserInfo = function( code, cb, server ) {
		var _server;
		server = server || 'inno';
		if (server == 'rh') {
			_server = 'https://general-easyfrog.rhcloud.com/wxuser';
		} else if (server == 'inno' || server == undefined) {
			_server = 'http://inno.yesky.com:6345/wxuser';
		} else {
			_server = server;
		}

		ztc.jsonp(_server,{
		    code: code
		}, function(res) {
		    cb(res);
		});
	};

	// ͳ��
	tools.analyze = function( projectName ) {
		if (window.location.protocol == 'file:') {
			return;
		}
		if (!tools.platform) {
			tools.platform = tools.getPlatform();
		}

		/* ͳ������
		{
			"timeline":0,
			"groupmessage":0,
			"android": 0,
			"iphone" : 0,
			"days":{},
			"android_versions": {}
			'iphone_versions': {}
		}
		*/
		var data = {
			$set: {
				"project":projectName
			},
			$inc: {
				"pv" : 1
			},
		};

		var date = new Date();
		var dateStr = date.format('yyyy-MM-dd');
		var queryStr = t.getQueryString('from');

		// ��Դ
		if (queryStr == 'timeline') {
			data.$inc['timeline'] = 1;				// ����Ȧ
		} else if (queryStr == 'groupmessage') {
			data.$inc['groupmessage'] = 1;			// ���ѷ���
		} else if (queryStr == 'singlemessage') {
			data.$inc['singlemessage'] = 1;			// ��������
		}

		// �豸���汾
		if (tools.platform.platform == 'Android') {
			data.$inc['android'] = 1;
			data.$inc['android_versions.' + tools.platform.version] = 1;
		} else if (tools.platform.platform == 'iPhone') {
			data.$inc['iphone'] = 1;
			data.$inc['iphone_versions.' + tools.platform.version] = 1;
		}

		// ����
		data.$inc['days.' + dateStr] = 1;

		tools.analyzeData(projectName, data);
	};

	tools.analyzeData = function(projectName, data) {
		if (window.location.protocol == 'file:') {
			return;
		}
		// db
		var db_url = 'http://inno.yesky.com:6345/db';
		// var db_url = 'https://general-easyfrog.rhcloud.com/db';

		// send to db server
		ztc.jsonp(db_url, {
			coll: 'analyze',
			method: 'update',
			query: {'project': projectName},
			data: data
		}, function(res) {
			if (!res) {
				console.log('analyze timeout!');
				return;
			}

			console.log('analyze complete!');
		}, 15000);
	};

	/**
	 * t.analyzeIncrease(projectName, field);
     * t.analyzeIncrease(projectName, 1, field1, field2, ...);
	 * t.analyzeIncrease(projectName, {field1: 1, field2:-1, ...});
	 */
	tools.analyzeIncrease = function( projectName ) {
		if (window.location.protocol == 'file:') {
			return;
		}
		if (arguments.length < 2) {       // ������Ҫ��������
			return;
		}

        var data = {$inc: {}};

		var increase = 1, 
			start = 1,
			arg2Type = typeof arguments[1];            // 0: string , 1: number, 2: object

		if ( arg2Type == 'object') {                   // json
            var _json = arguments[1];
            var keys = Object.keys(_json);

            keys.forEach(function(itm) {
                data.$inc[itm] = _json[itm];
            });
		} else {                                      // string or number
            if (arg2Type == 'number') {
                if (arguments.length < 3) {
                    return;
                }
                start = 2;
                increase = arguments[1];
            }

            for (var i = start; i < arguments.length; i++) {
                data.$inc[arguments[i]] = increase;
            }
        }

		tools.analyzeData(projectName, data);
	};

	tools.htmlui = tools.htmlui || {};

	/**
	 * ʹ�� Input Text
	 * @param  {symbol} sym       edge animation symbol
	 * @param  {String} container container name
	 * @param  {String} id        id
	 * @param  {String} type      default is 'text'
	 * @param  {css Json} css     css json
	 */
	tools.htmlui.input = function(sym, container, id, type, css) {
		var _type = type || 'text';
		sym.$(container).html('<input type="'+_type+'"" value="" id="'+id+'"/>');
		var _css = {
			'font-size': sym.$(container).height() / 2,
			'width': '100%',
			'height': '100%'
		};

		if (css) {
			for (var i in css) {
				_css[i] = css[i];
			}
		}
		var obj = sym.$('#' + id);

		obj.css(_css);
		obj.bind('blur', function() {
			document.body.scrollTop = 0;
		});
	};

	tools.htmlui.textarea = function(sym, container, id, css) {
		sym.$(container).html('<textarea value="" id="'+id+'"/>');
		var _css = {
			'font-size': 24,
			'width': '100%',
			'height': '100%'
		};

		if (css) {
			for (var i in css) {
				_css[i] = css[i];
			}
		}
		var obj = sym.$('#' + id);

		obj.css(_css);
		obj.bind('blur', function() {
			document.body.scrollTop = 0;
		});
	};

	window.t = window.ztc.tools = window.ztc.tools || tools;

	Date.prototype.format = function(fmt) { //author: meizz   
	  var o = {   
	    "M+" : this.getMonth()+1,                 //�·�   
	    "d+" : this.getDate(),                    //��   
	    "h+" : this.getHours(),                   //Сʱ   
	    "m+" : this.getMinutes(),                 //��   
	    "s+" : this.getSeconds(),                 //��   
	    "q+" : Math.floor((this.getMonth()+3)/3), //����   
	    "S"  : this.getMilliseconds()             //����   
	  };   
	  if(/(y+)/.test(fmt))   
	    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
	  for(var k in o)   
	    if(new RegExp("("+ k +")").test(fmt))   
	  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
	  return fmt;   
	};

	tools.getQueryString = function(name, url) {
	    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
	    url = url || window.location.search;
	    var r = url.substr(1).match(reg);
	    if (r != null) {
	        return decodeURIComponent(r[2]);
	    }
	    return null;
	};

	tools.supportWebGL =  function() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
	} 

}());

(function() {
	/**
	 * data:
	 * 		dom:    	需要拖拽的元素
	 * 		constraint: 限制 'x'|'y'|'none'(default)
	 * 		limit: 		in|edge (in:限定在父物体的内部. edge:边缘限定)
	 */
	var DragManager = function() {
		DragManager.instance = this;
	};

	DragManager.prototype.addDragObject = function( data ) {
		data.dom.constraint  = data.constraint;
		data.dom.limit       = data.limit || '';
		data.dom.isMouseDown = false;
		data.dom.lastPick    = {x:0,y:0};
		data.dom.currentPick = {x:0,y:0};

		this.addEvents(data.dom);
	};

	DragManager.prototype.removeDragObject = function( dom ) {
		var s = this;

		dom.constraint = dom.limit = dom.isMouseDown = dom.lastPick = dom.currentPick = undefined;
		dom.removeEventListener('mousedown',_mouseDown);
		dom.removeEventListener('mousemove',_mouseMove);
		dom.removeEventListener('mouseup',_mouseUp);
		dom.removeEventListener('touchstart',_mouseDown);
		dom.removeEventListener('touchmove',_mouseMove);
		dom.removeEventListener('touchend',_mouseUp);
	};

	function _mouseDown(e) {
		DragManager.instance.mouseDown(e);
	}

	function _mouseMove(e) {
		DragManager.instance.mouseMove(e);
	}

	function _mouseUp(e) {
		DragManager.instance.mouseUp(e);
	}

	DragManager.prototype.mouseDown = function(e) {
		var pick = getPick(e);
		var dom = e.currentTarget;

		dom.isMouseDown = true;
		dom.lastPick = pick;
	};

	DragManager.prototype.mouseMove = function(e) {
		var pick = getPick(e);
		var dom = e.currentTarget;

		if (!dom.isMouseDown) {
			return;
		};

		var _x = pick.x - dom.lastPick.x;
		var _y = pick.y - dom.lastPick.y;

		var toX = dom.offsetLeft + _x;
		var toY = dom.offsetTop + _y;

		if (dom.limit == 'in') {			// 限定在父物体的内部
			if (toX < 0) {
				toX = 0;
			};
			if (toX > dom.parentNode.offsetWidth - dom.offsetWidth) {
				toX = dom.parentNode.offsetWidth - dom.offsetWidth;
			};
			if (toY < 0) {
				toY = 0;
			};
			if (toY > dom.parentNode.offsetHeight - dom.offsetHeight) {
				toY = dom.parentNode.offsetHeight - dom.offsetHeight
			};
		} else if (dom.limit == 'edge') {	// 限定到父物体的边缘,拖拽物体大于父物体
			if (toX > 0 || toX < dom.parentNode.offsetWidth - dom.offsetWidth) {
				toX = dom.offsetLeft;
			};
			if (toY > 0 || toY < dom.parentNode.offsetHeight - dom.offsetHeight) {
				toY = dom.offsetTop;
			};
		}

		switch(dom.constraint) {
			case 'x':
				dom.style.left = toX + 'px';
			break;
			case 'y':
				dom.style.top = toY + 'px';
			break;
			default:
				dom.style.left = toX + 'px';
				dom.style.top = toY + 'px';
			break;
		}

		dom.lastPick = pick;
	};

	DragManager.prototype.mouseUp = function(e) {
		var dom = e.currentTarget;
		dom.isMouseDown = false;
	};

	DragManager.prototype.addEvents = function(dom) {
		dom.addEventListener('mousedown',_mouseDown);
		dom.addEventListener('mousemove',_mouseMove);
		dom.addEventListener('mouseup',_mouseUp);
		dom.addEventListener('touchstart',_mouseDown);
		dom.addEventListener('touchmove',_mouseMove);
		dom.addEventListener('touchend',_mouseUp);
	};

	function getPick(e) {
		return {
			x: e.touches ? e.touches[0].pageX : e.pageX,
			y: e.touches ? e.touches[0].pageY : e.pageY
		};
	}

	window.drag = DragManager;
}());

/*
 *	Adobe Edge Animation
 *	普通的Html5双页上下滑动展示
 *	
 *  example:
 *  	var eu = new EU(sym);
 *  	var config = [
 *  		{
 *  			layer:'page1',
 *  			symbol:'sym1',
 *  			instart:function(){},
 *  			inover:function(){},
 *  			outstart:function(){},
 *  			outover:function(){}
 *  		}
 *  	];
 *  	eu.setConfig(config);
 *  	eu.init();
*/
var EU = function(sym) {
	var s = this;

	// 总符号
	s.sym = sym;

	// 2015/5/9 config -> {
	// 						layer(str), 
	// 						symbol(str), 
	// 						instart/inover(Function, Array), 
	// 						outstart/outover(Function, Array)}
	s.config = undefined;

	// 动画是否完成
	s.animOver 		 = true;
	s.ignoreAnimOver = true;

	// 层的索引
	s.currentIndex = 0;
	s.nextIndex    = 0;
	s.lastIndex    = 0;

	// 层切换方式: alpha/updwon/leftright
	s.changeLayerType = 'updown';

	// 鼠标数据
	s.isMouseDown  = false;
	s.lastPick     = {x:0, y:0};
	s.touchPick    = {x:0, y:0};
	s.thresholdDis = 120;

	// 屏幕宽高
	s.width  = window.innerWidth;
	s.height = window.innerHeight;

	// stage 参考宽度
	s.baseWidth     = 640;
	s.baseHeight    = 1008;
	
	// 阻止默认事件
	s.preventEvents = false;
	s.preventDefault = true;

	// 一些临时变量
	s.currentPosition = 0;

	// 向上滑动反应
	s.slideReaction = true;

	// 缩放大小
	s.scale = 1;

	console.log('eu created! version:1.0.20150513');
}

/**
 * config is Array
 */
EU.prototype.setConfig = function(config) {
	for (var i = 0; i < config.length; i++) {
		var cfg = config[i];
		cfg.instart = cfg.instart instanceof Array ? cfg.instart : cfg.instart instanceof Function ? [cfg.instart] : [];
		cfg.inover = cfg.inover instanceof Array ? cfg.inover : cfg.inover instanceof Function ? [cfg.inover] : [];		
		cfg.outstart = cfg.outstart instanceof Array ? cfg.outstart : cfg.outstart instanceof Function ? [cfg.outstart] : [];		
		cfg.outover = cfg.outover instanceof Array ? cfg.outover : cfg.outover instanceof Function ? [cfg.outover] : [];
	}
	this.config = config;
};

/**
 * 添加层切换事件
 * @param {int} layerID  config中层所在的index || 层的名称
 * @param {string} type     instart,inover,outstart,outover
 * @param {function} listener 事件处理方法
 */
EU.prototype.addLayerEvent = function(layer, type, listener) {
	if (this.config && this.config.length > 0) {
		try {
			var _layer = this.getLayer(layer);
			if (_layer) {
				_layer[type].push(listener);
			} else {
				console.log('NOT HAVE THIS LAYER: ', layer);
			}
		} catch (e) {
			console.log('EU addLayerEvent ERROR: ', e);	
		}
	}
};

/**
 * 移除层切换事件
 */
EU.prototype.removeLayerEvent = function(layer, type, listener) {
	if (this.config && this.config.lenght > 0) {
		var _layer = this.getLayer(layer);
		if (_layer) {
			removeArrElemnet(_layer[type], listener);
		}
	}
};

function removeArrElemnet (arr, element) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == element) {
			arr.splice(i, 1);
		}
	}
}

/**
 * 通过ID或名称得到Config中的层定义
 * @param  {number|string} layerIdOrName 层的ID或名称
 * @return {layer config}               层在Config中的定义
 */
EU.prototype.getLayer = function(layerIdOrName) {
	if (typeof layerIdOrName == 'number') {
		return this.config[layerIdOrName];
	} else if (typeof layerIdOrName == 'string') {
		for (var i = 0; i < this.config.length; i++) {
			if (this.config[i].layer == layerIdOrName) {
				return this.config[i];
			}
		}
	}
	return null;
};

EU.prototype.init = function(scale) {
	var s = this;

	// 先将其它层隐藏
	if (s.config != undefined && s.config.length > 1) {
		for(var i = 1; i < s.config.length; i++) {
			s.sym.$(s.config[i].layer).hide();
		}
	}

	if (scale == undefined) {scale = true;};

	if (scale) {
		// 缩放Stage
		s.scaleStage();

		// 加入窗口缩放时自适应窗口大小
		window.onresize = function()  {
			s.scaleStage();
		};
	};

	s.addEvents();
};

EU.prototype.addEvents = function() {
	var s = this;
	s.sym.getSymbolElement()[0].addEventListener('mousedown', function(e) {s.onMouseDown(e)});
	s.sym.getSymbolElement()[0].addEventListener('mousemove', function(e) {s.onMouseMove(e)});
	s.sym.getSymbolElement()[0].addEventListener('mouseup', function(e) {s.onMouseUp(e)});
	s.sym.getSymbolElement()[0].addEventListener('touchstart',function(e){s.onMouseDown(e)});
	s.sym.getSymbolElement()[0].addEventListener('touchmove',function(e){s.onMouseMove(e)});
	s.sym.getSymbolElement()[0].addEventListener('touchend',function(e){s.onMouseUp(e)});
};

/*
 	层切换的方法
 		fade:		Alpha过渡
		updown:		上下滑动
		leftright:	左右滑动
 */
EU.prototype.changeLayer = function(cl,nl,boo,time,type,complete) {
	var s = this;

	time = time || 300;
	if (boo == undefined) boo = true;
	type = type || 'updown';

	if (!s.animOver && !s.ignoreAnimOver) return;
	nl.show();

	s.animOver = false;

	// 2015/5/9 config in/out function invoke
	s.invoke(s.currentIndex, 'instart');
	s.invoke(s.lastIndex, 'outstart');

	switch(type) {
		// 淡入淡出
		case 'fade':
			nl.css('opacity',0);

			cl.animate({opacity:0},{
			duration:time,
			step:function(now,fx) {
					nl.css('opacity',1 - now);
				},
			complete:function() {
					cl.hide();
					s.animOver = true;
					if (complete) complete();
					s.invoke(s.lastIndex, 'outover');
					s.invoke(s.currentIndex, 'inover');
				}
			});
		break;
		// 上下页滑动
		case 'updown':
			var to = boo ? -s.baseHeight : s.baseHeight;
			nl.css('top',-to);
			nl.css('left',0);

			cl.animate({top: to},{
			duration:time,
			step:function(now,fx) {
					nl.css('top',now - to);
				},
			complete:function() {
					cl.hide();
					s.animOver = true;
					if (complete) complete();
					s.invoke(s.lastIndex, 'outover');
					s.invoke(s.currentIndex, 'inover');
				}
			});
		break;
		// 左右滑动
		case 'leftright':
			var to = boo ? -s.baseWidth : s.baseWidth;
			nl.css('left',-to);
			nl.css('top',0);

			cl.animate({left:to},{
				duration:time,
				step:function(now,fx) {
					nl.css('left',now - to);
				},
				complete:function() {
					cl.hide();
					s.animOver = true;
					if(complete) complete();
					s.invoke(s.lastIndex, 'outover');
					s.invoke(s.currentIndex, 'inover');
				}			
			});
		break;
	}
};

EU.prototype.invoke = function(index, type) {
	var _m = this.config[index][type];
	if (_m instanceof Array) {
		for (var i = 0; i < _m.length; i++) {
			_m[i]();
		}
	} else if (_m instanceof Function) {
		_m();
	}
};

EU.prototype.onMouseDown = function(e) {
	var s = this;

	// 标记鼠标已经按下
	if (s.preventDefault) {
		e.preventDefault();
	}

	if (s.preventEvents) return;

	if (!s.animOver && !s.ignoreAnimOver) return;

	s.isMouseDown = true;

	// 记录当前 Symbol 的时间
	var _sym = s.getCurrentSymbol();
	if (_sym) s.currentPosition = _sym.getPosition();

	// 记录鼠标位置
	s.touchPick.x = s.lastPick.x = e.touches ? e.touches[0].pageX : e.pageX;
	s.touchPick.y = s.lastPick.y = e.touches ? e.touches[0].pageY : e.pageY;
};

EU.prototype.onMouseMove = function(e) {
	var s = this;

	if (s.preventDefault) {
		e.preventDefault();
	}

	if (s.preventEvents) return;

	s.touchPick.x = e.touches ? e.touches[0].pageX : e.pageX;
	s.touchPick.y = e.touches ? e.touches[0].pageY : e.pageY;

	// 视差随上下滑动倒放
	if (s.isMouseDown && (s.animOver || s.ignoreAnimOver) && s.slideReaction) {
		var _sym = s.getCurrentSymbol();
		if (_sym) {
			var duration = s.currentPosition;
			var _y = e.touches ? e.touches[0].pageY : e.pageY;
			var len = Math.abs(_y - s.lastPick.y) / s.baseHeight * duration;
			_sym.stop(duration - len);
		}
	}
};

EU.prototype.onMouseUp = function(e) {
	var s = this;

	// 鼠标抬起
	s.isMouseDown = false;

	// 当鼠标释放按键时插入的代码将运行
	if (s.preventDefault) {
		e.preventDefault();
	}

	if (s.preventEvents) return;

	if (!s.animOver && !s.ignoreAnimOver) return;

	// 如果没有层数据,或层数少于2.则不需要层切换
	if (s.config == undefined || s.config.length < 2) return;

	var y_dis = s.touchPick.y - s.lastPick.y;

	console.log('lastPick.y: ', s.lastPick.y, 'currentPick.y: ', s.touchPick.y, 'distance: ', y_dis);

	if (y_dis > s.thresholdDis) {  			// 向下拖拽超过200像素
		if (s.currentIndex > 0) {
			s.nextIndex = s.currentIndex - 1;

			// do some works
			var nl = s.sym.$(s.config[s.nextIndex].layer);
			var cl = s.sym.$(s.config[s.currentIndex].layer);
			s.lastIndex = s.currentIndex;

			// 2015/2/11 转换之前将下一层的动画位置归0
			s.getCurrentSymbol(s.nextIndex).stop(0);

			s.currentIndex = s.nextIndex;
			s.changeLayer(cl,nl,false,300,s.changeLayerType,function() {s.playSym();});
			
		} else s.playerCurrentSymbol();
	} else if (y_dis < -s.thresholdDis) { 	// 向上拖拽超过200像素
		if (s.currentIndex < s.config.length - 1) {
			s.nextIndex = s.currentIndex + 1;

			// do some works
			var nl = s.sym.$(s.config[s.nextIndex].layer);
			var cl = s.sym.$(s.config[s.currentIndex].layer);
			s.lastIndex = s.currentIndex;

			// 2015/2/11 转换之前将下一层的动画位置归0
			s.getCurrentSymbol(s.nextIndex).stop(0);

			s.currentIndex = s.nextIndex;
			s.changeLayer(cl,nl,true,300,s.changeLayerType,function() {s.playSym();});
					
		} else s.playerCurrentSymbol();
	} else if (Math.abs(y_dis) > 10){		// 拖拽的Y轴距离小于200像素
		s.playerCurrentSymbol();
	}	
};

EU.prototype.slideLayer = function(isforward) {
	var s = this;
	if (isforward == undefined) {isforward = true;};

	s.nextIndex = s.currentIndex + (isforward ? 1 : -1);
	var nl = s.sym.$(s.config[s.nextIndex].layer);
	var cl = s.sym.$(s.config[s.currentIndex].layer);

	s.lastIndex = s.currentIndex;
	s.getCurrentSymbol(s.nextIndex).stop(0);
	s.currentIndex = s.nextIndex;
	s.changeLayer(cl,nl,true,300,s.changeLayerType,function() {s.playSym();});
};

// 播放层动画
EU.prototype.playSym = function() {
	var s = this;
	s.animOver = false;
	
	var curSym, lastSym;
	if (s.config) {
		curSym = s.sym.getSymbol(s.config[s.currentIndex].symbol);
		lastSym = s.sym.getSymbol(s.config[s.lastIndex].symbol);

		if (lastSym) {lastSym.stop(0);};
		if (curSym) {curSym.play(-1);};
	};
};

EU.prototype.getCurrentSymbol = function(i) {
	var s = this;
	i = i || s.currentIndex;
	return s.sym.getSymbol(s.config[i].symbol); 
};

EU.prototype.playerCurrentSymbol = function(time) {
	var s = this;
	var sym = s.getCurrentSymbol();
	if (sym) sym.play(time);
};

EU.prototype.scaleStage = function(val) { 
	var s = this;

	val = val || s.baseWidth;

	var stage = s.sym.$('Stage');
	var delta = window.innerHeight / window.innerWidth;
	s.baseHeight = val * delta;
	s.scale =  window.innerWidth / val;

	stage.css('width',val);
	stage.css('height',s.baseHeight);

	stage.css('transform','scale(' + s.scale + ')');
	stage.css('-webkit-transform','scale(' + s.scale + ')');
	stage.css('-ms-transform','scale(' + s.scale + ')');
	stage.css('-moz-transform','scale(' + s.scale + ')');

	stage.css('transform-origin','0 0');
	stage.css('-webkit-transform-origin','0 0');
	stage.css('-ms-transform-origin','0 0');
	stage.css('-moz-transform-origin','0 0');
}

EU.prototype.setBaseWidth = function(val) {	
	this.baseWidth = val;
	this.scaleStage();
};

EU.prototype.getPick = function(e,index) {
	index = index || 0;
	var res = {x:0,y:0};
	res.x = e.touches ? e.touches[index].pageX : e.pageX;
	res.y = e.touches ? e.touches[index].pageY : e.pageY;
	return res;
};

EU.prototype.getPickX = function(e,index) {
	index = index || 0;
	return e.touches ? e.touches[index].pageX : e.pageX;
};

EU.prototype.getPickY = function(e,index) {
	index = index || 0;
	return e.touches ? e.touches[index].pageY : e.pageY;
};