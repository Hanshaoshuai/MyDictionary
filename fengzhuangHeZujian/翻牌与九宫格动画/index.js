

const page = {
	aplay (){
		var stopStep=1;//表示最终奖品位置  
	    var runT=null;//转动方法  
	    var step=-1;//计算转动的步数，控制转速和停止  
	    var during=2;//转速  
	    $("button").click(function(e){  
	        stopStep=Math.floor(Math.random()*8+1);  
	        runT=setTimeout(runF,100);  
	    });  
	    function runF(){  
	        if(step>=(32+stopStep))//设置转动多少圈  
	        {  
	            $(".gift"+(step%8)).css("background-color","#F00");  
	            step=stopStep;  
	            alert("you get"+step);
	            during=2;
	            clearTimeout(runT);//停止转动  
	            return;  
	        }  
	        if(step>=(24+stopStep)){ //在即将结束转动前减速  
	        		during+=1;                 
          	}else{   
              	if(during<=2){ //控制中间转速  
                  	during=2;   
              	}   
              	during--;   
          	}             
	        step++;  
	        $(".gift").each(function(index, element) {  
	            $(this).css("background-color","#a3a3a3");  
	        });  
	        $(".gift"+(step%8)).css("background-color","#F00");  
	        runT=setTimeout(runF,during*50);  
	    }
	},
	aplays (){
		let ls=this;
	    // 纸牌元素们 
	    let eleList = $(".box");
		$(".box").on("click",function () {
//			console.log($(eleList[0]).children('.list'))
			ls.funBackOrFront(this.id,eleList[this.id].querySelectorAll(".list"));
		});
	},
	// 确定前面与后面元素
	funBackOrFront(index,eleList) {
		let ls=this;
		// 在前面显示的元素，隐藏在后面的元素
		var eleBack = null, eleFront = null, leng=eleList.length;
//		console.log(eleList)
		for(var i=0; i<leng; i++){
			if($(eleList[i]).hasClass("out")) {
	            eleBack = $(eleList[i]);
	        } else {
	            eleFront = $(eleList[i]);
	        }
		}
	    // 1. 当前在前显示的元素翻转90度隐藏, 动画时间225毫秒
	    // 2. 结束后，之前显示在后面的元素逆向90度翻转显示在前
	    // 3. 完成翻面效果
	    eleFront.addClass("out").removeClass("in");
	    setTimeout(function (){
	        eleBack.addClass("in").removeClass("out");
	        		// 重新确定正反元素
//		        ls.funBackOrFront(this.id,eleBack,eleFront,eleList[this.id].querySelectorAll('.list'));
	    }, 225);
	},
}
$(function () {
    page.aplay();
    page.aplays();
});


