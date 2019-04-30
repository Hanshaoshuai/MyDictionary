//方法一
var arr = [];
var obj = new Object();
typeof obj === 'object'  //true
//方法二
arr instanceof Object  //true
arr instanceof Array //true
方法一二都不严谨
//方法三
var s = 'a string';
var arr = [];
var obj = new Object();
if (typeof s == 'string') {
  console.log("typeof s=='string'  true"); //true
}

//打开浏览器的控制台，可以看到此代码的输出
console.log('s.constructor==String  :' + (s.constructor == String));
console.log('arr.constructor==Array  :' + (arr.constructor == Array));
console.log('obj.constructor==Object  :' + (obj.constructor == Object));

//复杂类型的对象，判断其类型
function User(name, age) {
  this.name = name;
  this.age = age;
}
var u = new User();
console.log('typeof u  :' + typeof u);
//输出object  //显然，使用typeof判断复杂类型的对象，就失效了，但使用constructor就可以获取其真实类型
console.log('u.constructor.name  :' + u.constructor.name);

//方法四
Array.isArray(obj)
function isArray(obj) { 
return Object.prototype.toString.call(obj) === '[object Array]'; 
}
function isObject(obj) { 
return Object.prototype.toString.call(obj) === '[object Object]'; 
}