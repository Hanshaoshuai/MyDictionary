function Page() {
	this.box = $("#box");
	this.btns = $(".btn");
}
$.extend(Page.prototype, {
	init: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		for(var i=0; i<this.btns.length; i++) {			
			this.btns.eq(i).on("click", $.proxy(this.handleBoxShowClick, this, i));
		}
	},
	handleBoxShowClick: function(index) {
		var modalBox = new ModalBox(this.box, index);
		this.btns.eq(index).hide();
		$(modalBox).on("change", $.proxy(this.handleBtnRecover, this, index));
	},
	handleBtnRecover:function(index) {
		this.btns.eq(index).show();
	}
});
var page=new Page();
page.init();


