// ���캯��
function Carousel(id, option){
    this.box = $("#" + id);
    this.showIndex = 0;         // ��ǰ��ʾͼƬ���±�
    if(option.active){
        this.btn = this.box.children(".btn").children("li");        // ��ȡ���н���
        this.activeClass = option.active;       // ������ʽ
        this.activeCarousel(this.showIndex);    // �����ֲ�
        this.activeEvent();                         // �����¼�
    }
    if(option.sideBtn){
        this.prev = this.box.children(".prev");     // ��һ��Ԫ��
        this.next = this.box.children(".next");     // ��һ��Ԫ��
        this.nextBtn();              // ִ����һ�ź���
        this.prevBtn();             // ִ����һ�ź���
    }
    this.step = option.step || 400;     // ���ʱ��
    this.img = this.box.children(".carousel").find("img");      // ��ȡ����ͼƬ
    this.img.eq(0).fadeIn();
    this.length = this.img.length;
    this.start();       // �����ֲ�����
    this.boxEvent();    // ����¼�
}
// ����¼�
Carousel.prototype.boxEvent = function(){
    var self = this;
    // ������ֹͣ�ֲ�
    // mouseover ��Ԫ��Ҳ�ᴥ����
    // mouseenter ֻ�а��¼���domԪ�ش���
    this.box.on("mouseenter", function(){
        clearInterval(self.interval);
    });
    // �����뿪ʼ�ֲ�
    // mouseleave ��Ԫ��Ҳ�ᴥ����
    // mouseleave ֻ�а��¼���domԪ�ش���
    this.box.on("mouseleave", function(){
        self.start();
    })
};
// ��ʼ�ֲ�����
Carousel.prototype.start = function(){
    clearInterval(this.interval);
    this.interval = setInterval(function(){
        // ��һ��ͼƬ
        this.nextImg();
    }.bind(this), 2000);
};
// ��ʾ��һ�ź���
Carousel.prototype.nextImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex++;
    // ��ǰ��ʾͼƬ�ٽ��ж�
    if(this.showIndex == this.length){
        prevIndex = this.length - 1;
        this.showIndex = 0;
    }
    // �л�
    this.switch(prevIndex, this.showIndex);
};
// ��ʾ��һ�ź���
Carousel.prototype.prevImg = function(){
    var prevIndex = this.showIndex;
    this.showIndex--;
    // ��ǰ��ʾͼƬ�ٽ��ж�
    if(this.showIndex == -1){
        this.showIndex = this.length - 1;
    }
    // �л�
    this.switch(prevIndex, this.showIndex);
};
// �л�����
Carousel.prototype.switch = function(index, showIndex){
    // ͼƬ�л�
    this.img.eq(index).fadeOut(400).end().eq(showIndex).fadeIn(400);
    // �����л�
    if(this.btn) this.activeCarousel(showIndex);
};
// �����л�����
Carousel.prototype.activeCarousel = function(index){
    this.btn.eq(index).addClass(this.activeClass).siblings().removeClass(this.activeClass);
};
// �����¼�����
Carousel.prototype.activeEvent = function(){
    var self = this;
    this.btn.on("mouseenter", function(){
        var index = parseInt($(this).html()) - 1;
        // �л�
        self.switch(self.showIndex, index);
        // ����뿪ʱ���ӵ�ǰ�±꿪ʼ
        self.showIndex = index;
    });
};
// ��һ��ͼƬ
Carousel.prototype.prevBtn = function(){
    var self = this;
    self.prev.on("click", function(){
        self.prevImg();
       /* // off() ��ֹ��δ���mouseleave�¼�
        self.prev.off("mouseleave").one("mouseleave", function(){
            //console.log(66)
            self.start();
        })*/
    })
};
// ��һ��ͼƬ
Carousel.prototype.nextBtn = function(){
    var self = this;
    self.next.on("click", function(){
        self.nextImg()
        /*// off() ��ֹ��δ���mouseleave�¼�;
        self.next.off("mouseleave").one("mouseleave", function(){
            //console.log(55)
            self.start();
        })*/
    })
};
// ʵ����
var dom1 = new Carousel("box", {
    active: "btnActive",        //����
    sideBtn: true,              // ��һ�ţ���һ���Ƿ���ʾ
    step: 400                    // ���ʱ��
});