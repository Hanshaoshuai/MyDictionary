//@example ?id=123456&a=b
//@retrun Object {id:123456,a:b}


export function urlParse(){
	let url = "",
		obj={};
	if(window.location.search){
		url = window.location.search; //获取url中"?"符后的字串
	}else{
		url = window.location.href; //获取url中"?"符后的字串
	}
	let reg=/[?&][^?&]+=[^?&]+/g;//匹配   ?id=123456&a=b  正则
	let arr=url.match(reg);
	//['?di=123456','&a=b']
	if(arr){
		arr.forEach((item)=>{
			let tempArr=item.substring(1).split("=");
			let key=decodeURIComponent(tempArr[0]);
			let val=decodeURIComponent(tempArr[1]);
			obj[key]=val;
		});
	}
	return obj;
}
function getRequest() {  
	var url = location.search; //获取url中"?"符后的字串  
	var theRequest = new Object();  
	if (url.indexOf("?") != -1) {  
		var str = url.substr(1);  
		strs = str.split("&");  
		for (var i = 0; i < strs.length; i++) {  
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);  
		}  
	}  
	return theRequest;  
}  
 
console.log(getRequest());