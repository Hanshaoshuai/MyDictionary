function Page() {
	this.stopTime = 2000; //停留时间
	this.rollTime = 5000; //滚动时间
	this.containerList = $(".containerList");
	this.init();
}

$.extend(Page.prototype, {
	
	init() {
		this.createDomStructure();
	},
	
	createDomStructure() {
		var html = "";
		for(var i = 0; i < 5; i++) {
			html += `<div class="container-list-detail containerListDetail">${i+1}</div>`;
		}
		this.containerList.html(html);
		this.carouselRoll();
	},
	
	carouselRoll() {
		var height = this.containerList.height();
		this.startMove({
			"top": -height
		}, this.carouselRollCallback.bind(this));
	},
	
	carouselRollCallback() {
		setTimeout(this.carouselRollCallbackAnonymous.bind(this), this.stopTime);
	},
	
	carouselRollCallbackAnonymous() {
		this.containerList.css("top", 0).append(this.containerList.find(".containerListDetail").eq(0))
		this.carouselRoll();
	},
	
	startMove(json, fn) { //  {"width":300,"height":300}
		clearInterval(this.containerList.timer);
		this.containerList.timer = setInterval(this.startMoveAnonymous.bind(this, json, fn), 30);
	},
	
	startMoveAnonymous(json, fn) {
		var flag = true;
		for(var attr in json) {
			var current = 0;
			current = parseInt(this.getStyle(this.containerList, attr));
			var speed = (json[attr] - current) / 10;
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
			if(json[attr] != current) {
				flag = false;
			}
			this.containerList.css(attr, current + speed)
		}
		if(flag) {
			clearInterval(this.containerList.timer);
			fn && fn();
		}
	},
	
	getStyle(obj, attr) {
		return parseInt(obj.css(attr));
	}
	
});

new Page();