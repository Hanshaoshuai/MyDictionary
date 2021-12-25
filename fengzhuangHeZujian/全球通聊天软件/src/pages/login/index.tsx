import './index.scss';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Toast } from 'antd-mobile';

import { getToken, setToken } from '../../helpers';

import { login } from '../../api';
import Selector, { SelectorTabs } from './selector';

const ChatList = () => {
  const history = useHistory();
  const [telephone, setTelephone] = useState<any>();
  const [password, setPassword] = useState<any>('');
  const [setSelectedKey, setSetSelectedKey] = useState<any>(2);
  useEffect(() => {
    if (getToken()) {
      history.push('/chatRecord');
    }
  }, []);

  const onChange = (e: any, text: string) => {
    // console.log(e.target.value);
    if (text === '1') {
      setTelephone(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };
  const logIn = () => {
    if (!telephone) {
      Toast.show({
        content: '请填写手机号！',
        position: 'top',
      });
      return;
    }
    if (!password) {
      Toast.show({
        content: '请输入密码！',
        position: 'top',
      });
      return;
    }
    login({ name: telephone, password })
      .then((data) => {
        // console.log('123456', data);
        if (data.code === 1001) {
          //"用户名或密码错误"
          Toast.show({
            icon: 'fail',
            content: data.msg,
          });
        } else if (data.code === 200) {
          setToken(telephone);
          localStorage.setItem('myName', data.nickName);
          localStorage.setItem('name', telephone);
          localStorage.setItem('imgId', data.imgId);
          history.push('/');
          Toast.show({
            icon: 'success',
            content: data.msg,
          });
        } else if (data.code === 2001) {
          //用户不存在请先注册
          Toast.show({
            icon: 'fail',
            content: data.msg,
          });
        }
      })
      .catch((err) => {
        Toast.show({
          icon: 'fail',
          content: err,
        });
      });
  };
  const register = () => {
    history.push('/register');
  };

  const dataList1: any = [
    {
      key: 0,
      content: <div>我们</div>,
    },
    {
      key: 1,
      content: (
        <div>
          <div>是否</div>
        </div>
      ),
    },
    {
      key: 2,
      content: '可以',
    },
    {
      key: 3,
      content: '携手',
    },
    {
      key: 4,
      content: '共进',
    },
  ];
  const dataList: any = [
    {
      key: 0,
      content: <div>我们一起</div>,
    },
    {
      key: 1,
      content: (
        <div>
          <div>看日出</div>
          <div>看日落</div>
        </div>
      ),
    },
    {
      key: 2,
      content: '每天睁开眼第一看到就是你',
    },
    {
      key: 3,
      content: '无论吃饭早与晚都有你陪伴',
    },
    {
      key: 4,
      content: '幸福生活',
    },
  ];
  const selectedKey = (state: any) => {
    const { e, key, value } = state;
    console.log(state, e, key, value);
    setSetSelectedKey(key);
  };

  return (
    <div className="denglu">
      <div className="searchBox">
        <div className="home-search">
          <span>登录</span>
          <div className="fanhui-right"></div>
        </div>
      </div>
      <div className="contents">
        <div className="logo">
          <ul>
            <li></li>
          </ul>
        </div>
        <div className="denglu-text">
          <ul>
            <li>
              <span></span>
              <input
                onChange={(e) => onChange(e, '1')}
                placeholder="请输入手机号"
                type="number"
                className="ferst mint-field-core"
              />
            </li>
            <li>
              <span></span>
              <input
                onChange={(e) => onChange(e, '2')}
                placeholder="请输入密码"
                type="password"
                className="last mint-field-core"
              />
            </li>
          </ul>
        </div>
        <div className="denglu-food" onClick={logIn}>
          <span>登&nbsp;&nbsp;录</span>
        </div>
        <div className="denglu-to">
          <ul>
            <li className="denglu-wangji">忘记密码</li>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <li onClick={register} className="denglu-zhuce">
              立即注册
            </li>
          </ul>
        </div>
        <div className="denglu-list denglu-bottom">合作热线：18310998379</div>
      </div>
      {/* <div
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
          <Selector
            defaults={2} // 设置默认高亮；如果与<SelectorTabs/>一起使用默认值要与<SelectorTabs/>的setSelectedKey值相等
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
          <SelectorTabs
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
      </div> */}
    </div>
  );
};

export default ChatList;
