function ModalBox(container, index) {
	this.container = container;
	this.index = index;
	this.flag = true;
	this.init();
}
$.extend(ModalBox.prototype, {
	init: function() {
		this.createElement();
		this.bindEvents();
	},
	createElement: function() {
		var html = `
			<div class="box clear">
				<div class="iconTotal clear">
					<span class="minus left">-</span>
					<span class="plus left">+</span>
					<span class="cols left">×</span>
				</div>模态框${this.index+1}
			</div>`;
		this.ele = $(html);
		this.plus = this.ele.find(".plus");
		this.minus = this.ele.find(".minus");
		this.cols = this.ele.find(".cols");
		this.container.append(this.ele);
		this.ele.show();
	},
	bindEvents: function() {
		this.ele.on("mousedown", $.proxy(this.handleEleMouseDown, this))
		this.ele.on("mouseup", $.proxy(this.handleEleMouseUp, this))
		this.plus.on("click", $.proxy(this.handlePlusClick, this))
		this.minus.on("click", $.proxy(this.handleMinusClick, this))
		this.cols.on("click", $.proxy(this.handleClosClick, this))
	},
	handleEleMouseDown: function(e) {
		if(this.flag) {
			this.rex = e.offsetX;
			this.rey = e.offsetY;
			$(document).on("mousemove", $.proxy(this.handleEleMouseMove, this))	
		}
	},
	handleEleMouseMove: function(e) {
		this.x = e.pageX - this.rex;
		this.y = e.pageY - this.rey;
		var maxW = window.innerWidth - this.ele.width();
		var maxH = window.innerHeight - this.ele.height();
		this.x = this.x <= 0 ? 0 : (this.x >= maxW ? maxW : this.x);
		this.y = this.y <= 0 ? 0 : (this.y >= maxH ? maxH : this.y);
		this.ele.css({"top":this.y+"px","left":this.x+"px"});
	},
	handleEleMouseUp: function() {
		$(document).off("mousemove");
	},
	handleMinusClick: function() {
		window.getSelection?window.getSelection().removeAllRanges() : document.selection.empty();
		this.ele.css({"top": this.y+"px", "left": this.x+"px", "width": this.width+"px", "height": this.height+"px"});
		this.flag = true;
	},
	handlePlusClick: function() {
		window.getSelection?window.getSelection().removeAllRanges() : document.selection.empty();
		this.width = this.ele.width();
		this.height = this.ele.height();
		this.ele.css({"top": 0, "left": 0, "width": "100%", "height": "100%"});
		this.flag = false;
	},
	handleClosClick: function() {
		this.ele.css({"top": this.y+"px", "left": this.x+"px", "width": this.width+"px", "height": this.height+"px"});
		this.ele.remove();
		$(this).trigger("change");
	},
});







