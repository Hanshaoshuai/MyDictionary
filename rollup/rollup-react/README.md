### 描述

基于 react 抽屉嵌套，类似手风琴效果

### 效果如图

![效果如图](https://cloud.githubusercontent.com/assets/4214509/22519594/709cbdc6-e8e3-11e6-9e35-1182e6121e27.gif)

### 安装

```javascript
npm install combination-drawer-react --save
```

### 引入方式

```javascript
import { CombinationDrawer } from 'combination-drawer-react'; // 项目没有用TS，可以这样引入;
const { CombinationDrawer } = require('combination-drawer-react'); // 项目中使用了TS，可以这样引入;
```

#### 使用方法

```javascript
数据格式规定如下：

const list = [
  {
    key: '0', // 必须
    title: '',
    // width: 200, 可有可无
    transition: 0, // 必须
    notExpanded: false, // 必须
    fatherSonConnection: '-1', // 必须,一级为-1，往下叠加
    value: ( // 必须
      <div style={{ width: '100px', height: '20px' }}>
        <div onClick={() => indexFilter('0', '点击我 1')}>点击我 1</div>
        <div onClick={() => indexFilter('0', '点击我 2')}>点击我 2</div>
        <div onClick={() => indexFilter('0', '点击我 3')}>点击我 3</div>
      </div>
    ),
    state: true, // 必须第一级必须为 true 往下为 false
  },
  {
    key: '1',
    title: '',
    // width: 200,
    transition: 0,
    notExpanded: false,
    fatherSonConnection: '0',
    value: (
      <div style={{ width: '160px', height: '20px' }}>
        <div onClick={() => indexFilter('1', '一级点击我 1')}>一级点击我 1</div>
        <div onClick={() => indexFilter('1', '一级点击我 2')}>一级点击我 2</div>
      </div>
    ),
    state: false,
  },
]

const list1=[{}] // 自己的数据
```

```javascript
const drawers = useRef(null);
const [drawerShow, setDrawerShow] = useState(false);
const [filters, setFilters] = useState({});
const indexFilter = (index, title) => {
  // 进入下一层抽屉
  setFilters({ index, title });
};
const submitClose = (index) => {
  // 提交事件后关闭该层抽屉
  if (drawers) {
    drawers.current.getInfo(index);
  }
};
const [newList, setNewList] = useState(list);
const onSetDrawerShows = (index) => {
  if (index === 1) {
    setNewList(list);
  }
  if (index === 2) {
    setNewList(list1);
  }
  setDrawerShow(true);
};
return (
  <div>
    <div onClick={() => onSetDrawerShows(1)} style={{ cursor: 'pointer' }}>
      点击1
    </div>
    <div onClick={() => onSetDrawerShows(2)} style={{ cursor: 'pointer' }}>
      点击2
    </div>
    <div>
      <CombinationDrawer
        ref={drawers}
        list={newList} // 数据
        drawerShow={drawerShow} // 抽屉开关true/false
        setDrawerShow={setDrawerShow} // 关闭抽屉事件
        filters={filters} // 进入下一层抽屉参数（index，和 标题）
        titles={true} // 是否显示顶部标题层级关系：如（第一层/第二次/第三层）并点击返回该层抽屉
        redundantWidth={35} // 每层抽屉露出的宽度
        initial={false} // 设置true，初始化最多展示1个抽屉；
      />
    </div>
  </div>
);
```
