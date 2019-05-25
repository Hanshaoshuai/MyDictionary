### 描述

时间格式转换、倒计时处理6种方法6种使用场景

### 安装

``` javascript
npm install gettimesjs --save
```  

### 使用方法

``` javascript
import {
  formatDate,
  pastTime,
  specificPastTime,
  countDown,
  realTimeReverse,
  realTimeReverseSeparate
  } from 'getTime';
```

#### getTime中共有六个方法各有不同的使用场景。 

``` javascript
'formatDate()' 使用：'setInterval(()=>{formatDate("yyyy-MM-dd EE AM hh:mm:ss S q")}'入参为字符串字可按需去除；

'pastTime()' 使用：入参为时间戳，显示过去时间格式为：刚刚、多少分钟前、多少小时前...；

'specificPastTime()' 使用：入参为时间戳，显示过去时间式为：几时几分、超过24小时显示几月几日；

'countDown()' 使用：入参为固定的时间戳，倒计时格式：还剩 几天几小时几分钟（realTimeReverse可代替它）；

'realTimeReverse()' 使用：'setInterval(()=>{realTimeReverse(num)},10)'入参为固定的时间戳，倒计时格式：还剩下 几天几小时几分钟几秒；

'realTimeReverseSeparate()' 使用：'setInterval(()=>{realTimeReverseSeparate(num)},10)'入参为固定的时间戳，倒计时格式：返回为对象：{D:天、H:小时、M:分钟、S:秒、MS:毫秒}；
```