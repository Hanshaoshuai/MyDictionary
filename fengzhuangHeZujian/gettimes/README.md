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
  realTimeCountDown,
  realTimeCountDownSeparate
  } from 'gettimesjs';
```

#### gettimesjs中共有六个方法各有不同的使用场景。 

``` javascript
'formatDate()' 使用：'setInterval(()=>{formatDate("yyyy-MM-dd EE AM hh:mm:ss S q")},10)'入参为字符串字可按需去除；

'pastTime()' 使用：入参为时间戳，显示过去时间格式为：刚刚、多少分钟前、多少小时前...；

'specificPastTime()' 使用：入参为时间戳，显示过去时间式为：上午/下午几时几分、超过24小时显示几月几日上午/下午几时几分；

'countDown()' 使用：入参为固定的时间戳，倒计时格式：还剩 几天几小时几分钟（realTimeCountDown可代替它）；

'realTimeCountDown()' 使用：'setInterval(()=>{realTimeCountDown(num)},10)'入参为固定的时间戳，倒计时格式：还剩下 几天几小时几分钟几秒；

'realTimeCountDownSeparate()' 使用：'setInterval(()=>{realTimeCountDownSeparate(num)},10)'入参为固定的时间戳，倒计时格式：返回为对象：{D:天、H:小时、M:分钟、S:秒、MS:毫秒}；
```