

function uitan(dataLength,pageNums,pushHtml,dom) {
    var ht = {},
    	length=1;
    ht.init = function(d) {
        if(!support_touch_event()) return;
            var startX, startY, endX, endY,
                container = d || document.querySelector(dom);
            container.addEventListener('touchstart', function(e) {
//              e.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
                var touch = e.touches[0]; //获取第一个触点
                var x = touch.pageX; //页面触点X坐标
                var y = touch.pageY; //页面触点Y坐标
                //记录触点初始位置
                startX = x;
                startY = y;
            });
            container.addEventListener('touchmove', function(e) {
//              e.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
                var touch = e.touches[0]; //获取第一个触点
                var x = touch.pageX; //页面触点X坐标
                var y = touch.pageY; //页面触点Y坐标
                endX = x;
                endY = y;
                var abs = Math.abs(y - startY)
                if (abs > 0 && abs < 688) {
                    container.style.cssText =
                    "-webkit-transition: 0ms cubic-bezier(.1, .57, .1, 1);"+
                    "-moz-transition:0ms cubic-bezier(.1, .57, .1, 1);"+
                    "-ms-transition:0ms cubic-bezier(.1, .57, .1, 1);"+
                    "-o-transition:0ms cubic-bezier(.1, .57, .1, 1);"+
                    "transition:0ms cubic-bezier(.1, .57, .1, 1);"+
                    "-webkit-transform: translate(0px, " + (y - startY)/2 + "px) translateZ(0);"+
                    "-moz-transform: translate(0px, " + (y - startY)/2 + "px) translateZ(0);"+
                    "-ms-transform: translate(0px, " + (y - startY)/2 + "px) translateZ(0);"+
                    "-o-transform: translate(0px, " + (y - startY)/2 + "px) translateZ(0);"+
                    "transform: translate(0px, " + (y - startY)/2 + "px) translateZ(0);";
                }
                if((endY - startY) >120){//下拉刷新
            		document.querySelector('.shuaXin').innerText='放手刷新'
                }
                console.log(endY - startY)
            });
            container.addEventListener('touchend', function(e) {
            	console.log(endY - startY)
//              e.preventDefault();
                if (Math.abs(endY - startY) > 0) {
                    container.style.cssText =
                    "-webkit-transition: 600ms cubic-bezier(.1, .57, .1, 1);"+
                    "-moz-transition:600ms cubic-bezier(.1, .57, .1, 1);"+
                    "-ms-transition:600ms cubic-bezier(.1, .57, .1, 1);"+
                    "-o-transition:600ms cubic-bezier(.1, .57, .1, 1);"+
                    "transition:600ms cubic-bezier(.1, .57, .1, 1);"+
                    "-webkit-transform: translate(0px,0px) translateZ(0);"+
                    "-moz-transform: translate(0px,0px) translateZ(0);"+
                    "-ms-transform: translate(0px,0px) translateZ(0);"+
                    "-o-transform: translate(0px,0px) translateZ(0);"+
                    "transform: translate(0px,0px) translateZ(0);";
                }
                container.addEventListener('transitionend',function(){
	                if((endY - startY) >120 && scrollTop==0){//下拉刷新
	            		document.querySelector('.shuaXin').innerText='下拉刷新';
	//          		document.querySelector('.jiaZai').innerText='加载中'
	                	if(length==1){
		            		datelist=[];
		            		pageNums=1;
		            		document.querySelector('.list ul').innerHTML='';
		            		pushHtml();
		            		length+=1;
	                	}
	                	length=1;
	                }
	                container.removeEventListener('transitionend',function(){},false)
                })
            });
        }
        /**
        *@description 检查是否支持touch事件
        */
        function support_touch_event(){
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        }
    return ht.init();
}