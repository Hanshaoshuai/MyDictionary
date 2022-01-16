### 描述

基于 react 的类似选择器视图，tabSwitch 和 tabSwitchPage 可以组合使用联动效果，又类似轮播

### 安装

```javascript
npm install tab-switch-react --save
```

### 引入方式

```javascript
import { tabSwitch, tabSwitchPage } from 'tab-switch-react'; // 项目没有用TS，可以这样引入;
const { tabSwitch, tabSwitchPage } = require('tab-switch-react'); // 项目中使用了TS，可以这样引入;
```

#### 使用方法

```javascript
const selectedKey = (state) => {
  const { e, key, value } = state;
  console.log(state, e, key, value);
  setSetSelectedKey(key);
};

return (
  <div
    style={{
      width: '100%',
      height: '100%',
      // position: 'fixed',
      // top: '0',
      // left: '0',
      background: '#fff',
      zIndex: 1000000000,
    }}
  >
    <div
      style={{
        width: '100%',
        height: '50%',
        background: '#fff',
        zIndex: 1000000000,
      }}
    >
      <TabSwitch
        defaults={2} // 设置默认高亮；如果与<TabSwitchTabs/>一起使用默认值要与<TabSwitchTabs/>的setSelectedKey值相等
        dataList={dataList1} // 数据[]SwitchContent
        selectedKey={selectedKey} // 回调函数返回当前高亮数据；动态控制高亮回调无效：() => {}
        inclination={10} // 设置向右侧偏移度可更改 number 开启覆盖默认
        styles={{ overflow: '', color: '#ff7a59' }} // 溢出内容是否遮盖或其他样式设置，hidden
        itemHeight={20} // 设置高亮区域高度 开启覆盖默认
        borderColor={'1px solid #ff7a59'} // 设置高亮区域边框，动态控制高亮的时候不生效；
        blurLayer={false} // 未高亮的每项是否渐变模糊默认开启，false关闭；白色背景可以使用；blurLayer和transparency选一
        transparency={0.4} // 未高亮的每项是否渐变模糊默认开启，其他背景使用；blurLayer和transparency选一 范围(0.1-1)
      />
    </div>
    <div
      style={{
        width: '100%',
        height: '50%',
        background: '#fff',
        zIndex: 1000000000,
      }}
    >
      <TabSwitchTabs
        dataList={dataList} // 数据[]SwitchContent
        inclination={0} // 设置向右侧偏移度可更改 number 开启覆盖默认
        styles={{ overflow: '' }} // 溢出内容是否遮盖或其他样式设置，hidden
        itemHeight={40} // 设置高亮区域高度 开启覆盖默认
        borderColor={'1px solid #ff7a59'} // 设置高亮区域边框，动态控制高亮的时候不生效；
        setSelectedKey={setSelectedKey} // 动态控制高亮
        gradientSpeed={0.03} // 控制渐变速度需要和动态控制高亮一起用生效；
        alignItems // flex属性内容默认左右居中,string: flex-start，flex-end
      />
    </div>
  </div>
);
```
