//import 'babel-polyfill';
// 或者
//require('babel-polyfill');

//var hello = require("./md1.js");

//引入css
require('./style.css');
require('./index.scss');

var times= require('gettimesjs');
//var getuppercase= require('getuppercase');

import Ajax from 'request.js'
import axios from 'axios';

var dom = document.getElementById('box');
var dom1 = document.getElementById('box1');
var dom2 = document.getElementById('box2');
var dom3 = document.getElementById('box3');
var dom4 = document.getElementById('box4');
var dom5 = document.getElementById('box5');


dom1.innerText=times.numToTime(1524300940833);
dom2.innerText=times.numToTime1(1514301940833);
dom3.innerText=times.numToTime2(1552992599122);
setInterval(function(){
	dom.innerText=times.formatDate("yyyy-MM-dd EE AM hh:mm:ss S q");
	dom4.innerText=times.numToTime3(1552992599122);
},10);
//dom5.innerText=getuppercase.digitUppercase(68.68);



$.ajax({
  	url:'/api/package.json',
  	type: 'GET',
  	dataType: 'json',
  	data: {},
  	success: function(res){
//  	console.log(res)
  	}
}) 


axios.get('/api/package.json', {
    params: {}
})
.then((response) => {
    console.log(response);
})
.catch((response) => {
    console.log(response);
});


Ajax("get","/api/index.json",{}).then((req) => {
  console.log(req)
  return Ajax("get","/api/index.json",{});
}).then((req) =>{
  console.log(req);
}).catch((err) =>{
  console.log(err);
})


document.write("哈哈，我是bundle.js的前身!");
$('.box').css({
	"color":"red"
})
