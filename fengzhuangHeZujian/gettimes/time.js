/*时间格式化*/

// 获取日期、时间、上午/下午，毫秒、季度 "yyyy-MM-dd EE AM hh:mm:ss S q"
function formatDate (fmt) {
	if(!fmt || !isNaN(fmt)) {
		console.error('入参格式错误应为String"yyyy-MM-dd EE AM hh:mm:ss S q"！')
		return;
	}
	fmt = fmt.toString();
	var date = new Date(),
		newNum = new Date().getTime(),
		time = date.toLocaleString(),
		S = Math.floor((date.getMilliseconds() / 10)),
		q = date.getMonth();
	var o = {
		"M+": date.getMonth() + 1,
		"d+": date.getDate(),
		"H+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
		"h+": date.getHours(),
		"m+": date.getMinutes(),
		"s+": date.getSeconds(),
		"S": S < 10 ? "0" + S.toString() : S,
		"q+": function() {
			if(q < 3) {
				return '第一季度'
			} else if(q < 6) {
				return '第二季度'
			} else if(q < 9) {
				return '第三季度'
			} else if(q < 12) {
				return '第四季度'
			}
		}
	};
	var week = {
		"0": "日",
		"1": "一",
		"2": "二",
		"3": "三",
		"4": "四",
		"5": "五",
		"6": "六"
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[date.getDay() + ""])
	}
	if(/(AM+)/.test(fmt)) {
		var x = date.getHours()
		fmt = fmt.replace(RegExp.$1, time.match('上午') ? time.match('上午') : (x<12 ? '上午 ' : '下午 '));
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
		}
	}
	return fmt
}

// 过去式记录格式为：刚刚、多少分钟前、多少小时前，超过24小时为几月几日
function pastTime (num) {
	if(!num || isNaN(num) || num == null || num == true) {
		console.error('入参错误应为时间戳Number！')
		return;
	}
	num = num.toString()
	var newNum = new Date().getTime(),
		time = new Date().toLocaleString(),
		year, mouth, day, newTime = new Date(newNum).toLocaleString();
	time = time.replace(/\d+[\/\-]/, function(text) {
		year = text.match(/\d+/)[0];
		return ''
	});
	time = time.replace(/\d+[\/\-]/, function(text) {
		mouth = text.match(/\d+/)[0];
		return ''
	});
	time = time.replace(/\d+/, function(text) {
		day = text.match(/\d+/)[0];
		return ''
	});
	num = (newNum - num) / 1000;
	if(num < 60) {
		if(num<0) return '你穿越时空啦！';
		return '刚刚';
	} else if(num < 3600) {
		return parseInt(num / 60) + '分钟前';
	} else if(num < 86400) {
		return parseInt(num / 3600) + '小时前';
	} else if(year === newTime.match(/\d+/)[0]) {
		return mouth + '月' + day + '日';
	} else {
		return year + '年' + mouth + '月' + day + '日';
	}
}

// 过去式记录格式为：上午/下午几时几分、超过24小时显示几月几日
function specificPastTime (num){
	if(!num || isNaN(num) || num == null || num == true) {
		console.error('入参错误应为时间戳Number！')
		return;
	}
	var newNum = new Date().getTime(),
		time = new Date(num).toLocaleString(),
		date = new Date(new Date()),
		year,
		mouth,
		day,
		h,
		m,
		newTime = new Date(newNum).toLocaleString(),
		week = {
			"0": "日",
			"6": "一",
			"5": "二",
			"4": "三",
			"3": "四",
			"2": "五",
			"1": "六"
		},
		getDays=new Date().getDate()*1;;
			console.log(newNum)
	time = time.replace(/\d+[\/\-]/, function(text){
		year = text.match(/\d+/)[0];
		return '';
	});
	time = time.replace(/\d+[\/\-]/, function(text){
		mouth = text.match(/\d+/)[0];
		return '';
	});
	time = time.replace(/\d+/, function(text){
		day = text.match(/\d+/)[0];
		return '';
	});
	time = time.replace(/\d+/, function(text){
		h = text.match(/\d+/)[0];
		return '';
	});
	time = time.replace(/\d+/, function(text){
		m = text.match(/\d+/)[0];
		return '';
	});
	num = (newNum - num) / 1000;
	function getHours (){
		if(/上午/.test(time)){
			if(h == 12 || h < 5){
				if(h == 12){
					return '凌晨00' + ':'+ m;
				}else{
					return '凌晨0'+h.toString() + ':'+ m;
				}
			}else if(h == 5){
				return '清晨0'+h.toString() + ':'+ m;
			}else if(h > 5 && h < 11){
				if(h == 10){
					return '早上'+ h.toString() + ':'+ m;
				}else{
					return '早上0'+h.toString() + ':'+ m;
				}
			}else if(h > 10 && h < 12){
				return '中午'+h.toString() + ':'+ m;
			}
		} else {
			if(h == 12 || h < 1){
				if(h == 12){
					return '中午'+h.toString() + ':'+ m;
				}else{
					return '中午'+(h*1+12).toString() + ':'+ m;
				}
			}else if(h > 0 && h < 7){
				return '下午'+(h*1+12).toString() + ':'+ m;
			}else if(h > 6 && h < 12){
				return '晚上'+(h*1+12).toString() + ':'+ m;
			}
		}
	}
	// console.log('ooooooo====',date.getDay());
	if(getDays == day*1){
		return getHours();
	}
	if(getDays - day*1 == 1){
		return '昨天&nbsp'+getHours();
	}else if((getDays - day*1) > 1 && (getDays - day*1) < day*1){
		// return '周' + week[getDays - day*1 + ""] + '&nbsp' + getHours();
	}
	if(year === newTime.match(/\d+/)[0]){
		return mouth + '月' + day + '日&nbsp'+getHours();
	} else {
		return year + '年' + mouth + '月' + day + '日&nbsp'+getHours();
	}
}

// 倒计时格式：一次性提示，还剩下 几天几小时几分钟
function countDown (num) {
	if(!num || isNaN(num) || num == null || num == true) {
		console.error('入参错误应为时间戳Number！')
		return;
	}
	var newNum = new Date().getTime();
	if(num*1 <= newNum) {
		return 0;
	}
	num = (num*1 - newNum) / 1000;
	var D = num / 3600 / 24;
	var H = D - Math.floor(D);
	H = H * 24;
	var M = H - Math.floor(H);
	M = M * 60;
	console.log(D,H,M);
	if(D >= 1) {
		return Math.floor(D) + '天' + Math.floor(H) + "小时" + Math.round(M) + "分钟"
	} else if(H >= 1) {
		return Math.floor(H) + "小时" + Math.round(M) + "分钟"
	} else {
		return Math.round(M) + "分钟"
	}
}

// 倒计时格式：实时刷新性提示，还剩下 几天几小时几分钟几秒
function realTimeCountDown (num) {
	if(!num || isNaN(num) || num == null || num == true) {
		console.error('入参错误应为时间戳Number！')
		return;
	}
	var newNum = new Date().getTime();
	if(num*1 <= newNum) {
		return 0;
	}
	num = (num*1 - newNum) / 1000;
	var D = num / 3600 / 24;
	var H = D - Math.floor(D);
	H = H * 24;
	var M = H - Math.floor(H);
	M = M * 60;
	var S = M - Math.floor(M);
	S = S * 60;
	var MS = S - Math.floor(S);
	MS = Math.floor(MS * 100);
	if(D >= 1) {
		H = H < 10 ? "0" + Math.floor(H).toString() : Math.floor(H);
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		return Math.floor(D) + '天' + H + "小时" + M + "分钟" + S + "秒" + MS + "毫秒"
	} else if(H >= 1) {
		H = H < 10 ? "0" + Math.floor(H).toString() : Math.floor(H);
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		return H + "小时" + M + "分钟" + S + "秒" + MS + "毫秒"
	} else if(M >= 1) {
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		return M + "分钟" + S + "秒" + MS + "毫秒"
	} else {
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		return S + "秒" + MS + "毫秒"
	}
}

// 倒计时格式：实时刷新性提示，返回对象为： {D:天、H:小时、M:分钟、S:秒、MS:毫秒}；
function realTimeCountDownSeparate (num, newNums) {
	if(!num || isNaN(num) || num == null || num == true) {
		console.error('入参错误应为时间戳Number！')
		return;
	}
	let newNum = new Date().getTime();
	if(num*1 <= newNum) {
		return {'D':0,'H':'00','M':'00','S':'00','MS':'000'};
	}
	num = (num*1 - newNum*1) /1000;
	let D = num / 3600 / 24;
	let H = D - Math.floor(D);
	H = H * 24;
	let M = H - Math.floor(H);
	M = M * 60;
	let S = M - Math.floor(M);
	S = S * 60;
	let MS = S - Math.floor(S);
	MS = Math.floor(MS * 100);
	if(D >= 1) {
		H = H < 10 ? "0" + Math.floor(H).toString() : Math.floor(H);
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		// return Math.floor(D) + '天' + H + "小时" + M + "分钟" + S + "秒" + MS + "毫秒"
		return {'D':Math.floor(D),'H':H,'M':M,'S':S,'MS':MS}
	} else if(H >= 1) {
		H = H < 10 ? "0" + Math.floor(H).toString() : Math.floor(H);
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		// return H + "小时" + M + "分钟" + S + "秒" + MS + "毫秒"
		return {'D':0,'H':H,'M':M,'S':S,'MS':MS}
	} else if(M >= 1) {
		M = M < 10 ? "0" + Math.floor(M).toString() : Math.floor(M);
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		// return M + "分钟" + S + "秒" + MS + "毫秒"
		return {'D':0,'H':'00','M':M,'S':S,'MS':MS}
	} else {
		S = S < 10 ? "0" + Math.floor(S).toString() : Math.floor(S);
		MS = MS < 10 ? "0" + MS.toString() : MS;
		// return S + "秒" + MS + "毫秒"
		return {'D':0,'H':'00','M':'00','S':S,'MS':MS}
	}
}

module.exports = {
	"formatDate": function(fmt) {
		return formatDate(fmt);
	},
	"pastTime": function(num) {
		return pastTime(num);
	},
	"specificPastTime": function(num) {
		return specificPastTime(num);
	},
	"countDown": function(num) {
		return countDown(num);
	},
	"realTimeCountDown": function(num) {
		return realTimeCountDown(num);
	},
	"realTimeCountDownSeparate": function(num) {
		return realTimeCountDownSeparate(num);
	}
};