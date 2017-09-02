//@example ?id=123456&a=b
//@retrun Object {id:123456,a:b}


export function urlParse(){
	let url=window.location.search;
	let obj={};
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
