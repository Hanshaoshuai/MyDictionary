
<input type="text" name="" id="tixt" placeholder="输入cookie只能是字母" />
<div id="dianji"style="width:200px; height:200px;background:red;">提交cookie</div>
<div id="dianji2"style="width:200px; height:200px;background:blue;">显示cookie</div>

<script type="text/javascript">
	var dianji=document.getElementById("dianji")
	var dianji2=document.getElementById("dianji2")
	var tixt=document.getElementById("tixt")
	
	function cookie(){
		document.cookie="name"+"="+tixt.value
	}
	dianji.onclick=function(){
		cookie();
		alert(cookielist().name)
	}
	dianji2.onclick=function(){
		alert(cookielist().name)
	}
	function cookielist(){
		var cookies=document.cookie.split(";")
		var obj={};
		var key;
		var val;
		cookies.map((item)=>{
			key=item.split("=")[0];
			val=item.split("=")[1];
			obj[key]=val;
		});
		return obj;
	}
</script>


export function cookielist(){
	var cookies=document.cookie.split(";")
	var obj={};
	var key;
	var val;
	cookies.map((item)=>{
		key=item.split("=")[0];
		val=item.split("=")[1];
		obj[key]=val;
	});
	return obj;
}




