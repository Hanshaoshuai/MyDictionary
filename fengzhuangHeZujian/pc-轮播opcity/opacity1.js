function Carousel(id, option){
    this.box = $("#" + id);
    this.showIndex = 0;         
    if(option.active){
        this.btn = this.box.children(".btn").children("li");        
        this.activeClass = option.active;       
        this.activeCarousel(this.showIndex);    
        this.activeEvent();                         
    }
    if(option.sideBtn){
        this.prev = this.box.children(".prev");     
        this.next = this.box.children(".next");     
        this.nextBtn();              
        this.prevBtn();             
    }
    this.step = option.step || 400;     
    this.img = this.box.children(".carousel").find("img");      
    this.img.eq(0).fadeIn();
    this.length = this.img.length;
    this.start();       
    this.boxEvent();    
    this.switch()
}
Carousel.prototype.boxEvent = function(){
    var self = this;
    this.box.on("mouseenter", function(){
        clearInterval(self.interval);
    });
    this.box.on("mouseleave", function(){
        self.start();
    })
};
Carousel.prototype.start = function(){
  	this.interval = setInterval(function(){
        this.nextImg();
    }.bind(this), 3000);
};
Carousel.prototype.nextImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex++;
    if(this.showIndex == this.length){
        prevIndex = this.length - 1;
        this.showIndex = 0;
    }
    this.switch(prevIndex, this.showIndex);
};
Carousel.prototype.prevImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex--;
    if(this.showIndex == -1){
        this.showIndex = this.length - 1;
    }
    this.switch(prevIndex, this.showIndex);
};
Carousel.prototype.switch = function(index, showIndex){
    this.img.eq(index).fadeOut(800).end().eq(showIndex).fadeIn(800);
    if(this.btn) this.activeCarousel(showIndex);
};
Carousel.prototype.activeCarousel = function(index){
    this.btn.eq(index).addClass(this.activeClass).siblings().removeClass(this.activeClass);
};
Carousel.prototype.activeEvent = function(){
    var self = this;
    this.btn.on("mouseenter", function(){
        var index = parseInt($(this).html()) - 1;
        self.switch(self.showIndex, index);
        self.showIndex = index;
    });
};
Carousel.prototype.prevBtn = function(){
    var self = this;
    self.prev.on("click", function(){
        self.prevImg();
    })
};
Carousel.prototype.nextBtn = function(){
    var self = this;
    self.next.on("click", function(){
        self.nextImg()
    })
};
var dom1 = new Carousel("box", {
    active: "btnActive",        
    sideBtn: true,              
    step: 400                    
});