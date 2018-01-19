	//轮播图专用
	//1.图片的父元素 2.按钮的集合 3.左按钮  4.右按钮 5.最大的盒子
	//注：1.给按钮的第一个加个类名on  2.左右按钮的透明度为0  3. 图片前边加最后一张后边加第一张
	//效果：滑到最大的盒子上时候停掉定时器，离开的时候开启定时器
	function autoplay(oUL,nav,oLeft,oRight,container){
		var index = 1;
		var apiece=parseInt(getStyle(oUL.children[0],"width"));
		clearInterval(oUL.autoTab);
		oUL.autoTab = setInterval(auto,2000);
		//自由播放
		function auto(){
			index++;
			minButtton();//切换导航
			pics(); //切换图片	
		}
		//图片的运动
		function pics(){
			startMove(oUL, {left: -apiece*index}, function(){
				//以下代码，必须放在回调中，确保运动结束后再执行。
				if(index == oUL.children.length-1) {
					index = 1;					
					oUL.style.left = -apiece+"px";
				}
			});
		}
		//按钮的运动
		function minButtton(){
			for(var i=0; i<nav.length; i++) nav[i].className = "";
			if(index==0) index=1;
			if(index==oUL.children.length) index=oUL.children.length-1;
			nav[index==oUL.children.length-1?0:index-1].className = "on";	
		}
		//滑到和离开按钮的时候
		for(var i=0;i<nav.length;i++){
			nav[i].index=i;
			nav[i].onmouseover=function(){
				clearInterval(oUL.autoTab);
				index=this.index;
				auto();
			}
			nav[i].onmouseout=function(){
				oUL.autoTab = setInterval(auto,2000);
			}
		}
		if(oLeft&&oRight){
			//左按钮的运动
			oLeft.onmouseover=function(){
				clearInterval(oUL.autoTab);
			}
			oLeft.onmouseout=function(){
				oUL.autoTab = setInterval(auto,2000);
			}
			oLeft.onclick=function(){
				if(flag){
					index--;
					minButtton();
					startMove(oUL, {left: -apiece*index}, function(){
						if(index == 1) {
							index = oUL.children.length-1;					
							oUL.style.left =(-apiece * (oUL.children.length-1) )+"px";
						}
					});
				}	
			}
			//右按钮的运动
			oRight.onmouseover=function(){
				clearInterval(oUL.autoTab);
			}
			oRight.onmouseout=function(){
				oUL.autoTab = setInterval(auto,2000);
			}
			oRight.onclick=function(){
				if(flag){
					auto();
				}	
			}
		}
		//滑到和离开最大盒子的时候
		if(container){
			container.onmouseover=function(){
				clearInterval(oUL.autoTab);
				startMove(oLeft, {opacity:100})
				startMove(oRight, {opacity:100})
			}
			container.onmouseout=function(){
				clearInterval(oUL.autoTab);
				oUL.autoTab = setInterval(auto,2000);
				startMove(oLeft, {opacity:0})
				startMove(oRight, {opacity:0})
			}
		}
	}
	
//obj 代表当前操作的对象     json中存储的是要操作的属性和目标值       fn 用来接收一个函数
var flag=null;
function startMove(obj,json,fn){  //  {"width":300,"height":300}
	clearInterval(obj.timer);
	obj.timer = setInterval(function(){
		flag = true;// 当开关变量的值为 true时，运动结束，可以停止定时器了		
		for(var attr in json){		
			var current = 0;
			if(attr == "opacity"){
				//操作透明度
				current = parseFloat( getStyle( obj,attr ) ) * 100;
			}else if( attr == "zIndex" ){
				current = parseInt( getStyle(obj,attr) );//操作空间定位
			}else{
				//操作的是带有像素值的样式
				current = parseInt( getStyle(obj,attr) );//获取当前操作对象的实际值
			}
			var speed = (json[attr] - current) / 10;
			speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);
			if( json[attr] != current ){
				//如果目标值 和 当前操作的样式值不相等，就不能停止定时器 
				flag = false;				
			}
			//上面的条件不满足  继续执行运动
			if(attr == "opacity"){
				//操作透明度
				obj.style.opacity = (current + speed) / 100;
			}else if(attr == "zIndex"){
				
				obj.style[attr] = current + speed ;
				
			}else{
				//操作的是带有像素值的样式
				obj.style[attr] = current + speed + "px";
			}		
		}		
		//如果flag为true   就停止定时器		
		if(flag){
			clearInterval(obj.timer);
			//一个动作完成后,进入下一个动作(也就是要调用下一个函数)
			if(fn){ //判断如果有函数传递过来，就调用
				fn();
			}
		}
		
	},30)
}
function getStyle(obj,attr){
	return window.getComputedStyle ? window.getComputedStyle(obj,false)[attr] : obj.currentStyle[attr];
}