import './index.scss';

import { Toast, Radio } from 'antd-mobile';
import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { registers } from '../../api';
import { Upload } from '../A-components/upload';
import HooksCropperModal from '../HooksCropperModal/HooksCropperModal';

const Register = () => {
  const history = useHistory();
  const fs: any = useRef(null);
  const [name, setNames] = useState<any>('');
  const [telephone, setTelephone] = useState<any>();
  const [verify, setVerify] = useState<any>();
  const [password, setPassword] = useState<any>('');
  const [value, setValue] = useState<any>('Sir');
  const [percentBlock] = useState<any>(false);
  const [imgSrc, setImgSrc] = useState<any>('');
  const [imgApathZoom, setImgApathZoom] = useState<any>('');
  const [hooksModalFile, setHooksModalFile] = useState<any>('');
  const [hooksModalVisible, setHooksModalVisible] = useState<any>(false);
  const [type, setType] = useState<any>('');

  const yijianHind = () => {
    // history.goBack();
  };
  const quxiao = () => {};
  const huoquMima = () => {};
  const mima = () => {};
  const toIogin = () => {
    history.push('/login');
  };

  const mockUpload = (file: any) => {
    const fileN = file.target.files[0];
    let typeName = fileN.name.split('.');
    setType(typeName[typeName.length - 1]);
    setHooksModalFile(fileN);
    setHooksModalVisible(true);
    console.log(fileN, typeName[typeName.length - 1]);
  };

  const handleGetResultImgUrl = async (blob: any) => {
    // const str = URL.createObjectURL(blob);
    const { icon, apathZoom }: any = await Upload(blob, type);
    setImgSrc(icon);
    setImgApathZoom(apathZoom);
    // console.log(icon, apathZoom);
  };

  const setHooksModalVisibles = () => {
    setHooksModalVisible(false);
    if (fs) {
      fs.current.value = null;
    }
  };

  const radioChange = (e: any) => {
    // console.log("radio checked", e);
    setValue(e);
  };
  const onChange = (e: any, text: string) => {
    if (text === '0') {
      setNames(e.target.value);
    }
    if (text === '1') {
      setTelephone(e.target.value);
    }
    if (text === '2') {
      setVerify(e.target.value);
    }
    if (text === '3') {
      setPassword(e.target.value);
    }
  };
  const registersQ = () => {
    const imgId = localStorage.getItem('imgId');
    if (!name) {
      Toast.show({
        content: '为自己起个名字吧！',
        position: 'top',
      });
      return;
    }
    if (!telephone) {
      Toast.show({
        content: '你的电话是什么呢！',
        position: 'top',
      });
      return;
    } else {
      if (
        !/^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/.test(
          telephone
        )
      ) {
        Toast.show({
          content: '请输入正确的11位号码！',
          position: 'top',
        });
        return;
      }
    }
    if (!password) {
      Toast.show({
        content: '请输入你的密码！',
        position: 'top',
      });
      return;
    }
    if (!imgId) {
      Toast.show({
        content: '请输上传你的头像！',
        position: 'top',
      });
      return;
    }
    const obj = {
      nickName: name,
      name: telephone,
      password,
      sex: value,
      imgId,
      headPortrait: imgSrc,
      apathZoom: imgApathZoom,
    };
    // console.log(obj);
    registers(obj).then((res) => {
      // console.log("123456", res);
      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: '注册成功',
        });
        history.push('/login');
      }
      if (res.code === 2002) {
        Toast.show({
          content: res.msg,
          position: 'top',
        });
      }
    });
  };
  return (
    <div className="denglu">
      <div className="xiangmu-header" onClick={yijianHind}>
        <span className="xiangmu-left"></span>
        <span>注册</span>
      </div>
      <div className="contents">
        <div className="logo">
          <label>
            <ul>
              <li>
                {percentBlock ? '123' : ''}
                <img src={imgSrc} alt="" id="img" />
                <input
                  onChange={(files: any) => mockUpload(files)}
                  style={{ display: 'none' }}
                  type="file"
                  name=""
                  ref={fs}
                  accept="image/jpeg,image/jpg,image/png"
                />
                <span style={{ display: 'none' }} id="button1">
                  更换头像
                </span>
              </li>
            </ul>
          </label>
          <div className="half-area"></div>
          {hooksModalVisible && (
            <HooksCropperModal
              uploadedImageFile={hooksModalFile}
              onClose={setHooksModalVisibles}
              onSubmit={handleGetResultImgUrl}
            />
          )}
        </div>
        <div className="denglu-text">
          <ul>
            <li>
              <span></span>
              <input
                placeholder="请输入昵称"
                type="text"
                className="nickName mint-field-core"
                onChange={(e) => onChange(e, '0')}
              />
              <a onClick={quxiao}></a>
            </li>
            <li>
              <span className="shouJi"></span>
              <input
                placeholder="请输入手机号"
                type="number"
                onChange={(e) => onChange(e, '1')}
                className="ferst mint-field-core"
              />
              <a onClick={quxiao}></a>
            </li>
            <li>
              <span></span>
              <input
                placeholder="请输验证码"
                onChange={(e) => onChange(e, '2')}
                className="last mint-field-core"
              />
              <a className="yanzhengMa" onClick={huoquMima}>
                获取验证码
              </a>
            </li>
            <li>
              <span></span>
              <input
                placeholder="请输入密码"
                type="password"
                onChange={(e) => onChange(e, '3')}
                className="last1 mint-field-core"
              />
              <a v-show="mimas" onClick={mima}></a>
            </li>
          </ul>
        </div>
        <div className="sir_madam">
          <div id="sir_madam_box">
            <Radio.Group onChange={radioChange} value={value}>
              <Radio style={{ marginRight: '6px' }} value={'Sir'}>
                先生
              </Radio>
              <Radio value={'sex'}>女士</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className="denglu-food" onClick={registersQ}>
          <span>注&nbsp;&nbsp;册</span>
        </div>
        <div className="denglu-to">
          <ul>
            <li className="denglu-wangji">忘记密码</li>&nbsp;&nbsp;|&nbsp;&nbsp;
            <li onClick={toIogin} className="denglu-zhuce">
              <span>登录已有账号</span>
            </li>
          </ul>
        </div>
        <div className="denglu-list denglu-bottom">合作热线：18310998379</div>
      </div>
    </div>
  );
};

export default Register;
