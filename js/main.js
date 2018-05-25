/* globals echarts,TweenMax,Linear */
this.FTKJ = this.FTKJ || {};
(function() {
	var Main = function(dom) {
		this.model = new FTKJ.Model({
			dom:dom
		});
		this.myCharts = []; // 保存echarts 实例， window.resize 时调用各个实例的 resize;

		this.redLogData = []; // 保存红方日志的数据;
		this.blueLogData = []; // 保存蓝方日志的数据;

		this.sockedArr = []; // 保存socked链接

		this.objNames = [];
		for (let key in FTKJ.config.ipToPc) {

			this.objNames.push(FTKJ.config.ipToPc[key]);
		}

		// 正则匹配
		this.regJson = {
			time: /\d{2}\:\d{2}\:\d{2}/, //  13:12:38
		};

		let _this = this;

		this.model.modelReady = function(){
			_this.init();
		};
	};

	var p = Main.prototype;

	p.init = function() {
		this.initDom();
		this.initChart();
		this.initEvent();
		this.initSocked();

		this.initPage();

		this.test();
	};


	p.initDom = function() {
		this.$chartdom = $('.chartdom'); // middle 五个圆
		this.$right2chart = $('#m_right2_chart'); // right2 柱图

		this.$middle = $('#middle');	// 中间五个圆
		this.$redLog = $('#redLog');	// 红方日志
		this.$blueLog = $('#blueLog');	// 蓝方日志
		this.$whiteLog = $('#whiteLog');// 白方系统
		this.$ranking = $('#ranking');	// 实时排名

		this.$redLogUl = $('#redLogUl'); 	// 红方日志列表
		this.$blueLogUl = $('#blueLogUl'); 	// 蓝方日志列表
		this.$rankingUl = $('#rankingUl'); 	// 实时排名列表
		this.$whiteLogUl = $('#whiteLogUl'); 	// 实时排名列表

		this.$num1 = $('#num1'); 	// 	扫描次数
		this.$num2 = $('#num2');	// 	传统攻击
		this.$num3 = $('#num3'); 	// 	工控攻击
		this.$num4 = $('#num4'); 	//	攻破次数
		this.$num5 = $('#num5'); 	//  报警次数

		this.$container3D = $('#container3D');

		this.$leftMask = $('#leftMask');
		this.$rightMask = $('#rightMask');
	};

	p.test =  function() {
		this.$leftMask.trigger('mousedown');
	 	for (let i = 0; i < 100; i++) {
	 		let json = {
			 	'attack_type': Math.random()*4 | 0,    // 0->工控攻击  1->正在扫描	2->传统攻击(默认)
			 	'ip_source': '192.168.2.115:42790', 		// 源IP
			 	'ip_destination': '192.168.s1.12',  // 目标IP
			 	// 'ip_destination': '172.25.s21.101',  // 目标IP
			 	'time': 'May-8-23:13:04' 	// 时间 ，取时分秒。
		 	};
	 		this.redLogData.push(json);
	 	}

		// this.model.addLine(this.ipToPc('2132'),this.ipToPc('123132'));
		// this.model.addLine('area4_pc_A1_1','area2_plc4');
		// this.model.addLine('area4_pc_B1_7','area2_plc6');
		// this.model.addLine('area4_pc_B2_7','area1_pc2');
		// this.model.addLine('area4_pc_A1_7','area3_server_A2');

	};

	p.initSocked = function() {
		let _this = this;
		let wsHost = '192.168.1.14:8080';

		let redLogSocked = new WebSocket('ws://'+wsHost+'/admin/red_websocket/');
		let blueLogSocked = new WebSocket('ws://'+wsHost+'/admin/blue_websocket/');
		let rankingLogSocked = new WebSocket('ws://'+wsHost+'/admin/websocket/group_ranking/');
		let whiteLogSocked = new WebSocket('ws://'+wsHost+'/api/v1/webscoket/echo/123');

		redLogSocked.onmessage = function(e) {
			// console.log('red',e.data);
			_this.upDateRedLog(e.data);
		};

		blueLogSocked.onmessage = function(e) {
			// console.log('blue',e.data);
			_this.upDateBlueLog(e.data);
		};
		rankingLogSocked.onmessage = function(e) {
			// console.log('ranking',e.data);
			_this.upDateRanking(e.data);
		};
		whiteLogSocked.onmessage = function(e) {
			// console.log('white',e.data);
			_this.upDateWhiteLog(e.data);
		};

		this.sockedArr.push(redLogSocked,blueLogSocked,rankingLogSocked,whiteLogSocked);
		

		this.blueAutoUpdate(); // 蓝方日志需要预先开启一个定时器。
		this.redAutoUpdate(); // 蓝方日志需要预先开启一个定时器。
	};

	p.initPage = function() {
		let obj = {per:0};
		new TweenMax(obj,0.3,{
			per:1,
			ease:Linear.easeNone,
			onUpdate:function(){
				$('.opa0').css({
					opacity:obj.per
				});
			}
		});
	};

	/**
	 * 后台每次传入一个数据，
	 * {
	 * 'attack_type': 2,    // 0->工控攻击  1->正在扫描	2->传统攻击(默认)
	 * 'ip_destination': '192.168.1.18:532345',  // 目标IP 
	 * 'ip_source': '192.168.2.115:42790', 		// 源IP
	 * 'time': 'May-8-23:13:04' 	// 时间 ，取时分秒。
	 * }
	 */
	p.upDateRedLog = function(json) {
		
		if (typeof json == 'string') {
			json = eval('('+json+')');
		}
		this.redLogData.push(json);

	};

	/**
	 * 后台每次传入一个数组，数组里10个数组，保存到数据数组里面
	 * 预先开启一个定时器，间隔1s往页面添加数据(每次添加数组数组的第一个数据，添加到页面后在数据数组删除该数据);
	 * 单个数据为数组
	 * ['ICS-VSPHD01','光驱挂载','2018-05-11T14:01:13Z','接入介质']
	 */
	p.upDateBlueLog = function(arr) {
		if (typeof arr == 'string') {
			arr = eval('('+arr+')');
		}
		this.blueLogData = this.blueLogData.concat(arr);
	};

	/**
	 * 后台每次传入一个数据，
	 * {status:[1,'渣渣团队','2018-05-12 13:12:38.296103+00:00','550人比赛，剩下最后的一个代号是什么']}
	 */
	p.upDateWhiteLog = function(json) {
		if (typeof json == 'string') {
			json = eval('('+json+')');
		}
		let arr = json.status;
		let sName = 'flag';
		let cName = 'c_green';
		if (arr[0] == 2) {
			sName = '报告';
			cName = 'c_blue';
		}
		this.$num4.html(this.$num4.html()*1 + 1);
		let str = '<li class="limitli '+cName+'">'+
				'<span>'+sName+'</span>'+
				'<p>'+arr[2].match(this.regJson.time)+'  '+arr[1]+' '+arr[3]+'</p>'+
			'</li>';
		this.upDateLog(this.$whiteLogUl,10,str,0.5);
	};

	/**
	 * 后台没出传入所有组的数据 (大数组)，根据比分已经排好序
	 * 页面展示前14名的数据。
	 * [{
	 * 	group_info:{id:2,name:'瑞气十足'},
	 * 	total_ques:5,
	 * 	total_score:220
	 * }]
	 */
	p.upDateRanking = function(arr) {
		if (typeof arr == 'string') {
			arr = eval('('+arr+')');
		}
		let str = '';
		for (let i = 1; i <= arr.length-1; i++) {
			if (i >= 14) {break;}
			let item = arr[i];
			str += '<li class="limitli v_middle">'+
				'<span class="spanw1">'+i+'</span>'+
				'<span class="spanw2">'+item.group_info.name+'</span>'+
				'<span class="spanw3">'+item.total_score+'</span>'+
				'<span class="spanw4"><b class="flag f_red"></b>'+item.total_ques+'</span>'+
			'</li>';
		}
		// this.$rankingUl.html(str);
	};

	/**
	 * [往页面里添加数据并动态展示，每次添加一条]
	 * @param  {[$ul]} $ul [展示列表ul对象]
	 * @param  {[number]} n   [页面最多展示多少条]
	 * @param  {[string]} str [添加的新的内容]
	 */
	p.upDateLog = function($ul,n,str,during) {
		let len = $ul.children().length;
		if (len >= n) {
			let $li0 = $ul.find('li').eq(0);
			let h = $li0.height();
			let top = $ul.data('top') || 0;
			top -= h;
			new TweenMax($ul,during,{
				top:top,
				onCompleteParams:[$ul,$li0],
				onComplete:function($parent,$son){
					top += h;
					$son.remove();
					$parent.css({
						top:top
					});
					$parent.data('top',top);
				}
			});
		}
		let $li = $(str);
		$li.css({
			opacity:0,
			position:'relative',
			top:20
		});
		$ul.append($li);
		let obj = {per:0};
		new TweenMax(obj,during,{
			per:1,
			onUpdate:function(){
				$li.css({
					opacity:obj.per,
					top:20*(1-obj.per)
				});
			}
		});
	};

	p.redAutoUpdate = function() {
		let _this = this;
		loop(500);
		function loop(time){
			setTimeout(function(){
				let json = _this.redLogData.shift();
				let loopTime = 100;
				if (json) {
					let aType = json['attack_type'];
					let cName = 'c_blue';
					let cColor = '#2896ff';
					let sName = '传统攻击';
					if (aType == 0) {
						cName = 'c_red';
						sName = '工控攻击';
						cColor = '#02c096';
						_this.$num3.html(_this.$num3.html()*1 + 1);
					}else if (aType == 1) {
						cName = 'c_yellow';
						sName = '正在扫描';
						cColor = '#ffaf15';
						_this.$num1.html(_this.$num1.html()*1 + 1);
					}else{
						_this.$num2.html(_this.$num2.html()*1 + 1);
					}
					let str = '<li class="limitli '+cName+'">'+
								'<span>'+sName+'</span>'+
								'<p>'+json['time'].split('-')[2]+'  '+json['ip_source']+' -> '+json['ip_destination']+'</p>'+
							'</li>';
					_this.upDateLog(_this.$redLogUl,10,str,0.1);
					_this.model.addLine(_this.ipToPc(json['ip_source']),_this.ipToPc(json['ip_destination']),cColor,aType);
				}
				loop(loopTime);
			},time);
		}
	};

	p.blueAutoUpdate = function() {
		let _this = this;
		setInterval(function(){
			let arr = _this.blueLogData.shift();
			if (!arr) {return ;}
			let cName = 'c_green';
			switch(arr[3]){
				case '设备故障':
				case '系统漏洞':
				case '安全事件':
					cName = 'c_red';
					break;
				case '接入介质':
				case '生产状态':
					cName = 'c_yellow';
					break;
				case '网络互联':
				case '网络服务':
				case '网络通信':
					cName = 'c_blue';
					break;
			}
			let str = '<li class="limitli '+cName+'">'+
				'<span>'+arr[3]+'</span>'+
				'<p>'+arr[2].match(_this.regJson.time)+'  '+arr[0]+' '+arr[1]+'</p>'+
			'</li>';
			_this.$num5.html(_this.$num5.html()*1 + 1);
			_this.upDateLog(_this.$blueLogUl,10,str,0.3);
		},500);
	};

	p.initEvent = function() {
		let _this = this;
		// 更新图表
		$(window).resize(function(){
			for (let i = 0; i < _this.myCharts.length; i++) {
				_this.myCharts[i].resize();
			}
			for (var i = 0; i < _this.sockedArr.length; i++) {
				_this.sockedArr[i].close();
			}
		});
		let timer = null;

		// 3D空间物体放大缩小,移动视角时，3D模型自转停止，用户无操作时，等待5秒，视角缩放回复到最初位置继续自转
		$(window).on('scroll,mousewheel',function(){
			_this.model.pause();
			clearTimeout(timer);
			timer = setTimeout(function(){
				_this.model.reauto();
			},5000);
		});

		$(window).mousedown(function(){
			console.log('手动控制视角');
			_this.model.pause();
			clearTimeout(timer);
		});

		$(window).mouseup(function() {
			clearTimeout(timer);
			timer = setTimeout(function(){
				console.log('恢复自动模式');
				_this.model.reauto();
			},5000);
		});

		// 页面关闭时 断开 socked 连接
		$(window).on('beforeunload',function(){
			for (let i = 0; i < _this.sockedArr.length; i++) {
				_this.sockedArr[i].send('close');
				_this.sockedArr[i].close();
			}
		});	

		//	因为要阻止上面定义的window的mousedown事件，所以这里用mousedown事件
		this.$leftMask.mousedown(function(ev) {
			ev.stopPropagation();
			let isShow = $(this).data('isShow');
			let w = _this.$redLog.outerWidth();
			let oldLeft = _this.$redLog.offset().left;
			let l =$(this).data('l');
			if (!isShow) {
				l = oldLeft;
				$(this).data('l',l);
			}
			let left = l;
			if (!isShow) {
				left = -w;
			}
			let obj = {
				per:0
			};
			new TweenMax(obj,0.5,{
				per:1,
				onUpdate:function(){
					_this.$redLog.css('left',_this.step(oldLeft,left,obj.per));
					_this.$ranking.css('left',_this.step(oldLeft,left,obj.per));
				}
			});
			
			$(this).data('isShow',!isShow);
			_this.$rightMask.trigger('mousedown');
		});	

		this.$rightMask.mousedown(function(ev) {
			ev.stopPropagation();
			let isShow = $(this).data('isShow');
			let w = _this.$blueLog.outerWidth();
			let oldRight = $(window).width() - _this.$blueLog.offset().left - w ;
			let r = $(this).data('r');
			if (!r) {
				r = oldRight;
				$(this).data('r',r);
			}
			let right = r;
			if (!isShow) {
				right = -w;
			}
			let obj = {
				per:0
			};
			new TweenMax(obj,0.5,{
				per:1,
				onUpdate:function(){
					_this.$blueLog.css('right',_this.step(oldRight,right,obj.per));
					_this.$whiteLog.css('right',_this.step(oldRight,right,obj.per));
				}
			});
			
			$(this).data('isShow',!isShow);
		});	

	};

	p.initChart = function() {
		let dis = 4;
		let option = {
			color:['rgba(0,0,0,0)','#ff8506','rgba(0,0,0,0)'],
			series:{
				type:'pie',
				radius:['70%','80%'],
				data:[dis,90 - 2*dis,dis,dis,90 - 2*dis,dis,dis,90 - 2*dis,dis,dis,90 - 2*dis,dis],
				label:{
					show:false
				},
				silent:true,
				animation:false
			}
		};
		let _this = this;
		this.$chartdom.each(function(idx,ele){
			let color = $(ele).attr('color');
			let myChart = echarts.init(ele);
			option.color[1] = color || '#ff8506';
			myChart.setOption(option);
			_this.myCharts.push(myChart);
		});
	};

	p.ipToPc = function(ip){
		ip = ip.split(':')[0];
		let name = FTKJ.config.ipToPc[ip];
		if (name === undefined) {
			// 没有匹配到name 则去随机的位置。
			name = this.objNames[Math.random()*(this.objNames.length-1) | 0];
		}
		return name;
	};

	p.step = function(s,e,t) {
		return s + (e-s)*t;
	};

	p.render = function() {
		this.model.render();
	};

	FTKJ.Main = Main;
})();