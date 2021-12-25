import './index.scss';

import React, { useEffect, useState, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Toast, ImageViewer } from 'antd-mobile';
import HooksCropperModal from '../HooksCropperModal/HooksCropperModal';

import { clearAll } from '../../helpers';
import { MyContext } from '../../models/context';
import {
  myRemarks,
  informationDetails,
  addNotes,
  addFriend,
  removeFriend,
  logout,
} from '../../api';
import { Upload } from '../A-components/upload';

const localNames = window.localStorage.getItem('name');
const ChatRecord = () => {
  const { messages } = useContext(MyContext);
  const history = useHistory();
  const fs: any = useRef(null);
  const [localName, setLocalName] = useState<any>('');
  const [tabTex, setTabTex] = useState<any>('个人资料');
  const [LLNumber, setLLNumber] = useState<any>(
    localStorage.getItem('LLNumber') || ''
  );
  const [sexImage, setsexImage] = useState<any>(
    localStorage.getItem('mySex') || ''
  );
  const [myHead, setMyHead] = useState<any>(
    localStorage.getItem('myHeadPortrait') || ''
  );
  const [myHeadZoom, setMyHeadZoom] = useState<any>(
    localStorage.getItem('myapathZoom') || ''
  );
  const [headPortrait, setHeadPortrait] = useState<any>(
    localStorage.getItem('headPortrait') || ''
  );
  const [headPortraitB, setHeadPortraitB] = useState<any>('');
  const [toNames, setToNames] = useState<any>(
    localStorage.getItem('myName') || ''
  );
  const [toChatName, setToChatName] = useState<any>(
    localStorage.getItem('toChatName') || ''
  );
  const [myName] = useState<any>(localStorage.getItem('name') || '');
  const [myRegion, setMyRegion] = useState<any>(
    localStorage.getItem('myRegion') || ''
  );
  const [imgId] = useState<any>(localStorage.getItem('imgId') || '');

  const [setUps, setSetUp] = useState(false);
  const [nickName, setNickName] = useState<any>('');
  const [setRegion, setSetRegion] = useState<any>('');
  const [personalInformation] = useState<any>(
    localStorage.getItem('personalInformation')
  );
  const [remarksNuber, setRemarksNuber] = useState<any>('');
  const [fromType] = useState<any>(localStorage.getItem('fromType'));
  const [addSearchFriends, setAddSearchFriends] = useState<any>(
    localStorage.getItem('addSearchFriends')
  );

  const [friend, setFriend] = useState(true);
  const [remove, setRemove] = useState(false);

  const [tabShow, setTabShow] = useState<any>(false);
  const [onInputText, setInputText] = useState<any>('');
  const [searchResults, setSearchResults] = useState(false);

  const [hooksModalFile, setHooksModalFile] = useState<any>('');
  const [hooksModalVisible, setHooksModalVisible] = useState<any>(false);
  const [FileVl, setFileVl] = useState<any>('');
  const [type, setType] = useState<any>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    informationDetailsQ();
  }, []);
  // useEffect(() => {
  //   if (messages.icon) {
  //     setMyHead(messages.icon);
  //   }
  // }, [messages]);

  const informationDetailsQ = (text?: any) => {
    // 好友资料详情
    const types = localStorage.getItem('type');
    if (types === 'groupChat') {
      setHeadPortrait(localStorage.getItem('headPortrait_groupChat'));
    }
    if (personalInformation || fromType || text) {
      setTabTex('详细资料');
      informationDetails({
        toChatName:
          types === 'groupChat'
            ? localStorage.getItem('toChatName_groupChat')
            : text
            ? text
            : toChatName,
        myName: myName,
        type: text ? '' : 'chat',
      }).then((data) => {
        // console.log(data);
        if (data.code === 200) {
          setSearchResults(true);
          setLLNumber(data.LLNumber);
          setsexImage(data.sex);
          setLocalName(data.name);
          setHeadPortrait(data.apathZoom);
          setHeadPortraitB(data.imges);
          setMyHead(data.imges);
          setMyHeadZoom(data.apathZoom);
          localStorage.setItem('toChatName', data.name);
          localStorage.setItem('headPortrait', data.apathZoom);
          // localStorage.setItem("myHeadPortrait", data.imges);
          setToChatName(data.name);
          if (data.remarksNameNo === 'no') {
            setToNames(data.remarksName);
            setNickName(data.remarksName);
            localStorage.setItem('nickName', data.remarksName);
            localStorage.setItem('toNames', data.remarksName);
          } else {
            setToNames(data.remarksName);
            setNickName(data.remarksNameNick);
            localStorage.setItem('nickName', data.remarksName);
            localStorage.setItem('toNames', data.remarksNameNick);
          }
          if (data.remarksNuber) {
            setRemarksNuber(data.remarksNuber);
            localStorage.setItem('remarksNuber', data.remarksNuber);
          } else {
            localStorage.setItem('remarksNuber', '');
          }
          if (data.myRegion) {
            setMyRegion(data.myRegion);
          } else {
            setMyRegion('');
          }
          if (data.friend === 'no' && data.name !== localNames) {
            setFriend(false);
          }
          if (data.name === localNames) {
            setRemove(true);
          }
        } else if (data.code === 2001) {
          //用户不存在请先注册
          Toast.show({
            content: data.msg,
            position: 'top',
          });
        } else if (data.code === 1001) {
          setSearchResults(false);
          Toast.show({
            content: data.msg,
            position: 'top',
          });
        }
      });
    } else {
      setRemove(true);
    }
  };

  const setUp = () => {
    if (!setUps) {
      if (personalInformation) {
        setTabTex('添加备注');
      } else {
        setTabTex('资料设置');
        setNickName(localStorage.getItem('myName') || '');
        setSetRegion(localStorage.getItem('myRegion') || '');
      }
    } else {
      if (searchResults) {
        setToNames(localStorage.getItem('nickName'));
        setRemarksNuber(localStorage.getItem('remarksNuber'));
        setNickName(localStorage.getItem('toNames'));
        setSetUp(!setUps);
        return;
      }
      if (personalInformation) {
        setTabTex('详细资料');
        setToNames(localStorage.getItem('toNames'));
        setRemarksNuber(localStorage.getItem('remarksNuber'));
      } else {
        setTabTex('个人资料');
        setNickName('');
        setSetRegion('');
      }
    }
    setSetUp(!setUps);
  };
  const goBackS = () => {
    if (localStorage.getItem('type') === 'groupChat') {
      localStorage.removeItem('addSearchFriends');
      localStorage.removeItem('type');
      history.push('/');
      return;
    }
    localStorage.removeItem('personalInformation');
    localStorage.removeItem('remarksNuber');
    localStorage.removeItem('fromType');
    localStorage.removeItem('type');
    setAddSearchFriends('');
    localStorage.removeItem('addSearchFriends');
    history.goBack();
  };
  const save = () => {
    if (personalInformation || searchResults) {
      if (!toNames && !remarksNuber) {
        Toast.show({
          content: '没有要保存的信息！请填写...',
          position: 'top',
        });
        return;
      }
      const types = localStorage.getItem('type');
      addNotes({
        toChatName:
          types === 'groupChat'
            ? localStorage.getItem('toChatName_groupChat')
            : onInputText
            ? onInputText
            : toChatName,
        remarksName: toNames,
        remarksNuber: remarksNuber,
        myName: myName,
      }).then((data) => {
        // console.log(data);
        if (data.code === 1001) {
          //"用户名或密码错误"
          Toast.show({
            content: data.msg,
            position: 'top',
          });
        } else if (data.code === 200) {
          informationDetailsQ(searchResults ? onInputText : '');
          setTabTex('详细资料');
          setSetUp(!setUps);
          if (data.remarksName) {
            localStorage.setItem('toNames', data.remarksName);
          }
          Toast.show({
            icon: 'success',
            content: data.msg,
          });
        } else if (data.code === 2001) {
          //用户不存在请先注册
          Toast.show({
            content: data.msg,
            position: 'top',
          });
        }
      });
    } else {
      if (!nickName && !setRegion) {
        Toast.show({
          content: '没有要保存的信息！请填写...',
          position: 'top',
        });
        return;
      }
      myRemarks({
        nickName: nickName,
        myRegion: setRegion,
        myName: myName,
      }).then((data) => {
        // console.log(data);
        if (data.code === 1001) {
          Toast.show({
            content: data.msg,
            position: 'top',
          });
        } else if (data.code === 200) {
          setNickName('');
          setSetRegion('');
          setUp();
          if (data.nickName) {
            setToNames(data.nickName);
            localStorage.setItem('myName', data.nickName);
            localStorage.setItem('toNames', data.nickName);
          }
          if (data.myRegion) {
            setMyRegion(data.myRegion);
            localStorage.setItem('myRegion', data.myRegion);
          }
          Toast.show({
            icon: 'success',
            content: data.msg,
          });
        } else if (data.code === 2001) {
        }
      });
    }
  };
  const onChange = (e: any, type: any) => {
    if (e) {
      if (type === 1) {
        if (personalInformation || searchResults) {
          setToNames(e.target.value);
        } else {
          setNickName(e.target.value);
        }
      }
      if (type === 2) {
        if (personalInformation || searchResults) {
          setRemarksNuber(e.target.value);
        } else {
          setSetRegion(e.target.value);
        }
      }
    }
  };

  const mockUpload = async (file: any) => {
    const fileN = file.target.files[0];
    let typeName = fileN.name.split('.');
    setType(typeName[typeName.length - 1]);
    // const datas = await Upload(file, imgId, myName);
    // setMyHead(datas);
    setHooksModalFile(fileN);
    setHooksModalVisible(true);
  };

  const handleGetResultImgUrl = async (blob: any) => {
    // const str = URL.createObjectURL(blob);
    console.log(blob);
    const { icon, apathZoom }: any = await Upload(blob, type, imgId, myName);
    if (icon) {
      setMyHead(icon);
      setMyHeadZoom(apathZoom);
    }
    console.log(icon);
  };

  const setHooksModalVisibles = () => {
    setHooksModalVisible(false);
    if (fs) {
      fs.current.value = null;
    }
  };

  const chatroom = () => {
    localStorage.setItem('nickName', toNames);
    if (personalInformation || searchResults) {
      localStorage.setItem('toChatName', localName);
      localStorage.setItem('headPortrait', headPortrait);
    } else {
      localStorage.setItem('toChatName', myName);
    }

    localStorage.setItem('type', 'chat');
    history.push('/chatroom');
  };

  const addFriends = () => {
    addFriend({
      addName: toNames,
      fromNumber: myName,
      addNumber: toChatName,
    }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        //向对方发送添加好友验证消息
        window.socket.emit('clientmessage', {
          fromName: myName,
          toName: toChatName,
          text: { friend: 'no', addName: toNames },
        });
        history.push('/');
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
      } else {
        Toast.show({
          content: data.msg,
          position: 'top',
        });
      }
    });
  };
  const options = () => {
    //移除好友；
    removeFriend({
      removeName: toNames,
      fromNumber: myName,
      removeNumber: toChatName,
    }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        //向对方发送添加好友验证消息
        window.socket.emit('clientmessage', {
          fromName: myName,
          toName: toChatName,
          text: '移除好友',
        });
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
        history.push('/');
      } else {
        Toast.show({
          content: data.msg,
          position: 'top',
        });
      }
    });
  };
  const logouts = () => {
    logout({ name: localNames }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
        clearAll();
        history.push('/register');
      } else {
        Toast.show({
          content: data.msg,
          position: 'top',
        });
      }
    });
  };
  const viewAvatar = () => {
    setVisible(true);
  };
  const signOuts = () => {
    clearAll();
    Toast.show({
      content: '已退出登录',
      position: 'top',
    });
    history.push('/login');
  };
  const tabs = () => {
    setTabShow(!tabShow);
  };
  const tabsHid = () => {
    if (tabShow) {
      setTabShow(false);
    }
  };
  const onSearch = () => {
    // console.log(onInputText);
    informationDetailsQ(onInputText);
  };
  return (
    <div className="personalInformation" onClick={tabsHid}>
      {addSearchFriends ? (
        <>
          <div className="searchBox home-search-go">
            <img
              src="/images/fanhui.png"
              className="xiangmu-left"
              alt=""
              onClick={goBackS}
            />
            <div className="home-search">
              <input
                placeholder="请输入昵称、聊聊号或手机号"
                type="text"
                className="mint-field-core sousuo"
                onChange={(e: any) => setInputText(e.target.value)}
              />
            </div>
            <span className="sousuoGo" onClick={onSearch}>
              搜索
            </span>
          </div>
          {!searchResults ? (
            <div className="contents_search_no">快来搜一搜聊一聊...</div>
          ) : (
            ''
          )}
        </>
      ) : (
        <div className="searchBox">
          <div className="home-search">
            <img
              src="/images/fanhui.png"
              className="xiangmu-left"
              alt=""
              onClick={goBackS}
            />
            <span>{tabTex}</span>
            {friend &&
            !remove &&
            (searchResults || !personalInformation || !fromType) ? (
              <>
                <img
                  src="/images/dashujukeshihuaico.png"
                  alt=""
                  className="xiangmu-rigth"
                  onClick={tabs}
                ></img>
                <ul className={`${tabShow ? 'show' : ''}`}>
                  <li onClick={options}>移除好友</li>
                </ul>
              </>
            ) : remove ? (
              <>
                <img
                  src="/images/dashujukeshihuaico.png"
                  alt=""
                  className="xiangmu-rigth"
                  onClick={tabs}
                ></img>
                <ul className={`${tabShow ? 'show' : ''}`}>
                  <li onClick={signOuts}>退出登录</li>
                  <li onClick={logouts}>注销账号</li>
                  <label>
                    <li>
                      <input
                        onChange={(files: any) => mockUpload(files)}
                        style={{ display: 'none' }}
                        type={`${
                          personalInformation || searchResults ? '' : 'file'
                        }`}
                        name=""
                        accept="image/jpeg,image/jpg,image/png"
                        ref={fs}
                      />
                      更换头像
                    </li>
                  </label>
                </ul>
              </>
            ) : (
              ''
            )}
          </div>
        </div>
      )}
      {!addSearchFriends || searchResults ? (
        <div className="contents">
          <div className="logo">
            <div className="fankiu">
              <div className="content-food border-bottom">
                <div className="imgas">
                  <label>
                    <p onClick={viewAvatar}>
                      <img
                        className="border"
                        src={personalInformation ? headPortrait : myHeadZoom}
                        alt=""
                        id="imges"
                      />
                    </p>
                  </label>
                </div>
                {hooksModalVisible && (
                  <HooksCropperModal
                    uploadedImageFile={hooksModalFile}
                    onClose={setHooksModalVisibles}
                    onSubmit={handleGetResultImgUrl}
                  />
                )}
                <div className="texts">
                  <span className="first">
                    <i>{toNames}</i>
                    <img
                      className="sexImages"
                      src={`${
                        sexImage === 'Sir'
                          ? '/images/user__easyico.png'
                          : '/images/user__easyico_1.png'
                      }`}
                      alt=""
                    />
                  </span>
                  <span className="lalst">
                    聊聊号：<a>{LLNumber}</a>
                  </span>
                  {personalInformation || searchResults ? (
                    <span className="lalst lalst_name">
                      昵称：<a>{nickName}</a>
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
            <ImageViewer
              image={personalInformation ? headPortraitB : myHead}
              visible={visible}
              onClose={() => {
                setVisible(false);
              }}
            />
          </div>
          <div className="denglu-text">
            {!personalInformation && !searchResults ? (
              <div className="sheZhi denglu_sheZhi" onClick={setUp}>
                资料设置
              </div>
            ) : friend &&
              (searchResults || !personalInformation || !fromType) ? (
              <div className="sheZhi denglu_sheZhi" onClick={setUp}>
                设置备注
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="denglu-text ziZhu">
            {remarksNuber ? (
              <div className="beiZhu">
                <span>电话号码：</span>
                <span>{remarksNuber}</span>
              </div>
            ) : (
              ''
            )}
            <div className="diQu">
              <span>地区：</span>
              <span>{myRegion ? myRegion : '未设置'}</span>
            </div>
            <div className="xiangCe">
              <span>个人相册</span>
              <span></span>
            </div>
          </div>
          {friend && (searchResults || !personalInformation || !fromType) ? (
            <div className="denglu-food" onClick={chatroom}>
              <span>发送消息</span>
            </div>
          ) : (
            ''
          )}
          <div
            className="denglu-food friends"
            style={{ display: `${!friend && searchResults ? '' : 'none'}` }}
          >
            <span onClick={addFriends}>添加好友</span>
          </div>
          <div className={`tanChuang ${setUps ? 'tanChuangB' : ''}`}>
            <div id="tanChuang_top"></div>
            <div className="tanChuang_cont">
              <div className="sheZhi sheZhiFirst">
                {personalInformation || searchResults ? (
                  <span>备注名：</span>
                ) : (
                  <span>昵称：</span>
                )}
                <input
                  value={
                    personalInformation || searchResults ? toNames : nickName
                  }
                  placeholder={`${
                    personalInformation ? '请输入备注' : '请输入昵称'
                  }`}
                  type="text"
                  className="ferst mint-field-core"
                  onChange={(e) => onChange(e, 1)}
                />
              </div>
              <div className="sheZhi sheZhiLste">
                {personalInformation || searchResults ? (
                  <span>电话号码：</span>
                ) : (
                  <span>地区：</span>
                )}
                <input
                  value={
                    personalInformation || searchResults
                      ? remarksNuber
                      : setRegion
                  }
                  placeholder={`${
                    personalInformation ? '请输入电话' : '请输入地区'
                  }`}
                  type="text"
                  className="last mint-field-core"
                  onChange={(e) => onChange(e, 2)}
                />
              </div>
            </div>
            <div className="tanChuang_food tanChuang_first" onClick={save}>
              <span>保&nbsp;&nbsp;存</span>
            </div>
            <div className="tanChuang_food tanChuang_last" onClick={setUp}>
              <span>取&nbsp;&nbsp;消</span>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ChatRecord;
