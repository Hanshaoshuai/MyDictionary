





$(function(){
	var phone=/^1[34578]\d{9}$/;
	$(".txt-input").click(function(){
//		this.value="";
//		this.css({"color":"#000000"});
//		this.style.color="#000000"
	})
	$(".item-btns").click(function(){
		if($(".txt-input")[0].value==""){
			$(".shouji").css({"display":"block"}).delay(1200).fadeOut(800);
		}else{
			if(!$(".txt-input")[0].value.match(phone)) {
				$(".shouji").text("输入手机号有误");
				$(".shouji").css({"display":"block"}).delay(1200).fadeOut(800);
			}
		}
		if($(".txt-password")[0].value==""){
			$(".mima").css({"display":"block"}).delay(1200).fadeOut(800);
		}
	})
})


//if(!phone.test(this.phone)) {
//			this.tishi="输入手机号有误";
//			Toast('输入手机号有误');
//			return;
//		}else{
//			ph=1;
//		}
//		if(!this.password) {
//			this.tishi="请输入密码";
//			Toast('请输入密码');
//			return;
//		}else{
//			pw=1;
//		}