### 描述

基于 react 的路由切换左右滑动动画

### 效果如图

!(https://cloud.githubusercontent.com/assets/4214509/22519594/709cbdc6-e8e3-11e6-9e35-1182e6121e27.gif)

### 安装

```javascript
npm install react-router-transition-page --save
```

### 引入方式

```javascript
import { ReactRouterTransitionPage } from 'react-router-transition-page'; // 项目没有用TS，可以这样引入;
const { ReactRouterTransitionPage } = require('react-router-transition-page'); // 项目中使用了TS，可以这样引入;
```

#### 使用方法

```javascript
return (
  <ReactRouterTransitionPage
    path={route.path} // 指的是pathname，格式为如：'/login'
    component={route.component} // route.component 是匹配到的组件；
  />
);
```
