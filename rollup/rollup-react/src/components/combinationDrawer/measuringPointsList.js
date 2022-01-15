import React, { useState, useRef } from 'react';
import CombinationDrawer from './combinationDrawer';

const MeasuringPointsList = () => {

  const list = [
    {
      key: '0',
      title: '',
      // width: 200,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '-1',
      value: (
        <div style={{ width: '100px', height: '20px' }}>
          <div onClick={() => indexFilter('0', '点击我1')}>点击我1</div>
          <div onClick={() => indexFilter('0', '点击我2')}>点击我2</div>
          <div onClick={() => indexFilter('0', '点击我3')}>点击我3</div>
        </div>
      ),
      state: true,
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
          <div onClick={() => indexFilter('1', '一级点击我1')}>一级点击我1</div>
          <div onClick={() => indexFilter('1', '一级点击我2')}>一级点击我2</div>
        </div>
      ),
      state: false,
    },
    {
      key: '2',
      title: '',
      // width: 700,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '1',
      value: (
        <div
          style={{ width: '300px', height: '20px' }}
          onClick={() => indexFilter('2', '二级点击我')}
        >
          二级点击我
        </div>
      ),
      state: false,
    },
    {
      key: '3',
      title: '',
      // width: 400,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '2',
      value: (
        <div
          style={{ width: '300px', height: '20px' }}
          onClick={() => indexFilter('3', '三级点击我')}
        >
          三级点击我
        </div>
      ),
      state: false,
    },
    {
      key: '4',
      title: '',
      // width: 500,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '3',
      value: (
        <div style={{ width: '400px', height: '20px' }} onClick={() => submitClose(4)}>
          {'提交=>关闭'}
        </div>
      ),
      state: false,
    },
  ];
  const list1 = [
    {
      key: '0',
      title: '',
      // width: 200,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '-1',
      value: (
        <div style={{ width: '200px', height: '20px' }}>
          <div onClick={() => indexFilter('0', '点击我1')}>2点击我1</div>
          <div onClick={() => indexFilter('0', '点击我2')}>2点击我2</div>
          <div onClick={() => indexFilter('0', '点击我3')}>2点击我3</div>
        </div>
      ),
      state: true,
    },
    {
      key: '1',
      title: '',
      // width: 200,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '0',
      value: (
        <div style={{ width: '360px', height: '20px' }}>
          <div onClick={() => indexFilter('1', '一级点击我1')}>2一级点击我1</div>
          <div onClick={() => indexFilter('1', '一级点击我2')}>2一级点击我2</div>
        </div>
      ),
      state: false,
    },
    {
      key: '2',
      title: '',
      // width: 200,
      transition: 0,
      notExpanded: false,
      fatherSonConnection: '1',
      value: (
        <div style={{ width: '400px', height: '20px' }}>
          <div onClick={() => indexFilter('2', '二级点击我1')}>3一级点击我1</div>
          <div onClick={() => indexFilter('2', '二级点击我2')}>3一级点击我2</div>
        </div>
      ),
      state: false,
    },
  ];
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
};

export default MeasuringPointsList;
