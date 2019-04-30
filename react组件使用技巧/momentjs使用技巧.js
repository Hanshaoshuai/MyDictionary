//1、计算两个日期时间差
  const time = moment.duration(moment('20180702') - moment(20180623)).asDays();

//2、[使用moment.js加减日期时间 ](https://majing.io/posts/10000006081171)
  增加日期时间
  语法

  moment().add(Number, String);
  moment().add(Duration);
  moment().add(Object);
  添加天数

  moment().add(7, 'days');
  可以简写为

  moment().add(7, 'd');
  类型列表

  years（y）：年
  quarters（Q）：季度
  months（M）：月
  weeks（w）：周
  days（d）：日
  hours（h）：时
  minutes（m）：分
  seconds（s）：秒
  milliseconds（ms）：毫秒
  链式添加时间

  moment().add(7, 'days').add(1, 'months');
  也可以使用对象

  moment().add({days:7,months:1}); 
  时间间隔duration

  var duration = moment.duration({'days' : 1});
  moment().add(duration); 
  指定特地日期时间

  moment("2018-01-28").add(1, 'months');
  减日期时间
  语法

  moment().subtract(Number, String);
  moment().subtract(Duration);
  moment().subtract(Object);

  3.时间前后判断
  http://momentjs.cn/docs/#/query/is-before/
  moment().isBefore(Moment|String|Number|Date|Array);
  moment().isBefore(Moment|String|Number|Date|Array, String);
  moment().isAfter(Moment|String|Number|Date|Array);
  moment().isAfter(Moment|String|Number|Date|Array, String);
  moment('2010-10-20').isBefore('2010-10-21'); // true