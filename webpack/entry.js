//var hello = require("./md1.js");

//引入css
//require("!style-loader!css-loader!./main.css");
//require("./main.css");

var times= require('gettimesjs');
var getuppercase= require('getuppercase');

var dom = document.getElementById('box');
var dom1 = document.getElementById('box1');
var dom2 = document.getElementById('box2');
var dom3 = document.getElementById('box3');
var dom4 = document.getElementById('box4');
var dom5 = document.getElementById('box5');


dom1.innerText=times.numToTime(1524300940833);
dom2.innerText=times.numToTime1(1514301940833);
dom3.innerText=times.numToTime2(1524303940833);
setInterval(function(){
	dom.innerText=times.formatDate("yyyy-MM-dd EE AM hh:mm:ss S q");
	dom4.innerText=times.numToTime3(1524303940833);
},10);
dom5.innerText=getuppercase.digitUppercase(686868.68);


require('./style.css')
document.write("哈哈，我是bundle.js的前身!");
$('.box').css({
	"color":"red"
})
