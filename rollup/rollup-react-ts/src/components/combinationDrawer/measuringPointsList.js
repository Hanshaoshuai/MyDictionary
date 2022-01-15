import { Alert, Card, Button, Col, Form, Row, Input, Table, Divider, Modal } from 'antd';
import React, { useState, useRef, forwardRef, useCallback, useEffect } from 'react';
import { useIntl, history, useModel } from 'umi';
import { CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';

import QueryComponent from '../../components/QueryComponent';
import NewItem from '../../components/NewItem';
import styles from './index.less';
import CombinationDrawer from './combinationDrawer';

const datas: any = [
  {
    key: 0,
    partName: 123,
    idNo: 456,
  },
];

const MeasuringPointsList: React.FC = () => {
  const [form] = Form.useForm();
  const formRef = useRef<any>(null);
  const [loading, setloading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [administratorModal, setAdministratorModal] = useState(false);
  const [administratorList, setAdministratorList] = useState<any>([]);
  const [data, setData] = useState(datas);
  const intl = useIntl();

  const onFinish = (values: any) => {
    console.log(values);
  };
  const onFinishAdd = (values: any) => {
    setAddLoading(true);
    setAddLoading(false);
    console.log(values);
  };
  const add = () => {
    setModalVisible(true);
  };
  const setWorkOrders = (text: boolean) => {
    setModalVisible(text);
  };
  const administratorCancel = (text: boolean) => {
    setAdministratorModal(text);
  };
  const AdministratorModals = (record: any) => {
    setAdministratorModal(true);
    // setAdministratorList(record);
  };
  const columns: any = [
    {
      title: '测点名称',
      dataIndex: 'partName',
      required: true,
    },
    {
      title: '测点编码',
      dataIndex: 'idNo',
      required: true,
      // width: 140,
    },
    {
      title: '测点类型',
      dataIndex: 'remark',
      required: true,
      type: 'select',
    },
    {
      title: '测点位置标识',
      dataIndex: 'name',
      required: true,
    },
    {
      title: '备注',
      dataIndex: 'quantity',
    },
    {
      title: '操作',
      key: 'operation',
      // fixed: 'right',
      width: 60,
      render: (record: any) => (
        <span>
          <a onClick={() => handleSave(record)}>删除</a>
        </span>
      ),
    },
  ];

  const handleSave = (row: { key: any }) => {
    const newData = JSON.parse(JSON.stringify(data));
    const index = newData.findIndex((item: { key: any }) => row.key === item.key);
    newData.splice(index, 1);
    setData(newData);
  };
  const items = [
    { key: '0', label: '测点名称', name: 'projectName', required: false, type: 'input' },
  ];

  const list: any = [
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
  const list1: any = [
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
  const drawers = useRef<any>(null);
  const [drawerShow, setDrawerShow] = useState(false);
  const [filters, setFilters] = useState({});
  const indexFilter: any = (index?: string, title?: string) => {
    // 进入下一层抽屉
    setFilters({ index, title });
  };
  const submitClose = (index: number) => {
    // 提交事件后关闭该层抽屉
    if (drawers) {
      drawers.current.getInfo(index);
    }
  };
  const [newList, setNewList] = useState<any>(list);
  const onSetDrawerShows = (index: any) => {
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
      <Card className="cardPadding">
        <QueryComponent onFinish={onFinish} add={add} items={items} loading={loading} />
        <div onClick={() => onSetDrawerShows(1)} style={{ cursor: 'pointer' }}>
          点击1
        </div>
        <div onClick={() => onSetDrawerShows(2)} style={{ cursor: 'pointer' }}>
          点击2
        </div>
      </Card>
      <Card>
        <div>
          <Table
            columns={columns}
            bordered={false}
            size={'small'}
            // pagination={false}
            dataSource={data}
            // scroll={{ y: 120, x: 800 }}
            loading={loading}
          />
        </div>
      </Card>
      <NewItem
        modalVisible={modalVisible}
        setWorkOrders={(text) => setWorkOrders(text)}
        category={columns}
        loading={addLoading}
        onFinishAdd={onFinishAdd}
      />
      <div>
        <CombinationDrawer
          ref={drawers}
          list={newList}
          drawerShow={drawerShow}
          setDrawerShow={setDrawerShow}
          filters={filters}
          titles={true}
          redundantWidth={35}
          initial={false} // 设置true，初始化最多展示1个抽屉；
        />
      </div>
    </div>
  );
};

export default MeasuringPointsList;
