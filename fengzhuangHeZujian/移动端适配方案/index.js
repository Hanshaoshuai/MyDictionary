
var ua = navigator.userAgent.toLowerCase();
!function(e){function t(n){if(i[n])return i[n].exports;var r=i[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var i={};return t.m=e,t.c=i,t.p="",t(0)}([function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=window;t["default"]=i.vl=function(e,t){var n=e||100,r=t||750,a=i.document,d=navigator.userAgent,o=d.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i),l=d.match(/U3\/((\d+|\.){5,})/i),s=l&&parseInt(l[1].split(".").join(""),10)>=80,u=a.documentElement,c=1;if(o&&o[1]>534||s){u.style.fontSize=n+"px";var p=a.createElement("div");p.setAttribute("style","width: 1rem;display:none"),u.appendChild(p);var m=i.getComputedStyle(p).width;if(u.removeChild(p),m!==u.style.fontSize){var v=parseInt(m,10);c=100/v}}var f=a.querySelector('meta[name="viewport"]');f||(f=a.createElement("meta"),f.setAttribute("name","viewport"),a.head.appendChild(f)),f.setAttribute("content","width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1");var h=function(){u.style.fontSize=n/r*u.clientWidth*c+"px"};h(),i.addEventListener("resize",h)},e.exports=t["default"]}]);
// 设置基础字体大小及字体缩放比例
if(ua.match(/iPad/i)!="ipad" || navigator.userAgent.indexOf("iPad") == -1) {
	// vl(100, 750);
	vl(100, 1080);
}else{
	vl(100, 1024);
}
