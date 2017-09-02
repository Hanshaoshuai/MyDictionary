// 构造函数
function Carousel(id, option){
    this.box = $("#" + id);
    this.showIndex = 0;         // 当前显示图片的下标
    if(option.active){
        this.btn = this.box.children(".btn").children("li");        // 获取所有焦点
        this.activeClass = option.active;       // 焦点样式
        this.activeCarousel(this.showIndex);    // 焦点轮播
        this.activeEvent();                         // 焦点事件
    }
    if(option.sideBtn){
        this.prev = this.box.children(".prev");     // 上一张元素
        this.next = this.box.children(".next");     // 下一张元素
        this.nextBtn();              // 执行上一张函数
        this.prevBtn();             // 执行下一张函数
    }
    this.step = option.step || 400;     // 间隔时长
    this.img = this.box.children(".carousel").find("img");      // 获取所有图片
    this.img.eq(0).fadeIn();
    this.length = this.img.length;
    this.start();       // 调用轮播函数
    this.boxEvent();    // 外框事件
}
// 外框事件
Carousel.prototype.boxEvent = function(){
    var self = this;
    // 鼠标进入停止轮播
    // mouseover 子元素也会触发。
    // mouseenter 只有绑定事件的dom元素触发
    this.box.on("mouseenter", function(){
        clearInterval(self.interval);
    });
    // 鼠标进入开始轮播
    // mouseleave 子元素也会触发。
    // mouseleave 只有绑定事件的dom元素触发
    this.box.on("mouseleave", function(){
        self.start();
    })
};
// 开始轮播函数
Carousel.prototype.start = function(){
    clearInterval(this.interval);
    this.interval = setInterval(function(){
        // 下一张图片
        this.nextImg();
    }.bind(this), 2000);
};
// 显示下一张函数
Carousel.prototype.nextImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex++;
    // 当前显示图片临界判断
    if(this.showIndex == this.length){
        prevIndex = this.length - 1;
        this.showIndex = 0;
    }
    // 切换
    this.switch(prevIndex, this.showIndex);
};
// 显示上一张函数
Carousel.prototype.prevImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex--;
    // 当前显示图片临界判断
    if(this.showIndex == -1){
        this.showIndex = this.length - 1;
    }
    // 切换
    this.switch(prevIndex, this.showIndex);
};
// 切换函数
Carousel.prototype.switch = function(index, showIndex){
    // 图片切换
    this.img.eq(index).fadeOut(400).end().eq(showIndex).fadeIn(400);
    // 焦点切换
    if(this.btn) this.activeCarousel(showIndex);
};
// 焦点切换函数
Carousel.prototype.activeCarousel = function(index){
    this.btn.eq(index).addClass(this.activeClass).siblings().removeClass(this.activeClass);
};
// 焦点事件函数
Carousel.prototype.activeEvent = function(){
    var self = this;
    this.btn.on("mouseenter", function(){
        var index = parseInt($(this).html()) - 1;
        // 切换
        self.switch(self.showIndex, index);
        // 鼠标离开时，从当前下标开始
        self.showIndex = index;
    });
};
// 上一张图片
Carousel.prototype.prevBtn = function(){
    var self = this;
    self.prev.on("click", function(){
        self.prevImg();
       /* // off() 防止多次触发mouseleave事件
        self.prev.off("mouseleave").one("mouseleave", function(){
            //console.log(66)
            self.start();
        })*/
    })
};
// 下一张图片
Carousel.prototype.nextBtn = function(){
    var self = this;
    self.next.on("click", function(){
        self.nextImg()
        /*// off() 防止多次触发mouseleave事件;
        self.next.off("mouseleave").one("mouseleave", function(){
            //console.log(55)
            self.start();
        })*/
    })
};
// 实例化
var dom1 = new Carousel("box", {
    active: "btnActive",        //焦点
    sideBtn: true,              // 上一张，下一张是否显示
    step: 400                    // 间隔时长
});