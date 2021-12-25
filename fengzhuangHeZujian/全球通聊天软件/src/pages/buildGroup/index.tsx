import './index.scss';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Toast, CheckList } from 'antd-mobile';

import { buildGroup, getBuddyList } from '../../api';

const ChatList = () => {
  const history = useHistory();
  const [localName] = useState<any>(localStorage.getItem('name') || '');
  const [myIcon] = useState<any>(localStorage.getItem('myName'));
  const [inputText, setInputText] = useState<any>('');
  const [checkListName, setCheckListName] = useState<any>([localName]);
  const [friendList, setFriendList] = useState<any>([]);
  useEffect(() => {
    getBuddyList({ name: localStorage.getItem('name') }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        if (data.body?.length > 0) {
          data.body = data.body.filter((item: any) => {
            if (!Array.isArray(item.name)) {
              return item;
            }
            return false;
          });
          setFriendList(data.body);
        }
      }
    });
  }, []);

  const unique = (arr: any, keys: any) => {
    if (!Array.isArray(arr)) {
      return;
    }
    const list: any = [];
    let newlist: any = keys.slice(0);
    for (var i = 0; i < arr.length; i++) {
      for (let j = 0; j < newlist.length; j++) {
        if (arr[i].name === newlist[j]) {
          newlist.splice(j, 1);
          list.push(arr[i]);
          j--;
          break;
        }
      }
    }
    return list;
  };

  const onChange = (e: any) => {
    // console.log(e.target.value);
    if (e.target) {
      setInputText(e.target.value);
    }
  };
  const checkLists = (e: any) => {
    // console.log(e);
    setCheckListName(e);
  };
  const buildGroups = () => {
    // console.log(inputText, friendList, checkListName);
    let objs_name: any = [],
      textName: any = 0,
      objs_nickName = [],
      keys = false,
      objs_img = [],
      newFriendList: any = [];
    if (checkListName.length === 0) {
      return;
    }
    if (inputText === '') {
      Toast.show({
        content: '请填写群名！',
        position: 'top',
      });
      return;
    }
    if (checkListName.length === 1) {
      Toast.show({
        content: '建群限制两人以上！',
        position: 'top',
      });
      return;
    }
    newFriendList = unique(friendList, checkListName);
    console.log(newFriendList);
    for (var i = 0; i < newFriendList.length; i++) {
      if (newFriendList[i].name === localName) {
        keys = true;
      }
      objs_name.push({
        name: newFriendList[i].name,
        newsNumber: 0,
      });
      objs_nickName.push(newFriendList[i].nickName);
      objs_img.push({
        classIcon: newFriendList[i].apathZoom,
        name: newFriendList[i].name,
        nickName: newFriendList[i].nickName,
      });
      textName += newFriendList[i].name * 1;
    }
    if (!keys) {
      Toast.show({
        content: '请选中建群者！',
        position: 'top',
      });
      return;
    }
    textName = textName.toString();
    let list: any = {
      nickName: objs_nickName,
      name: objs_name,
      imgId: objs_img,
      signIn: 'yes',
      dateTime: '',
      text: myIcon + '发起了群聊...',
      buildingGroupName: inputText,
      newsNumber: 0,
      groupOwner: localName,
      textName: textName,
      groupName: `${inputText}${Date.parse(new Date() as any)}.txt`,
    };
    list = JSON.stringify(list);
    // console.log(list);
    //建群
    buildGroup({ data: list }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
        console.log(objs_name);
        window.socket.emit('clientmessage', {
          fromName: localStorage.getItem('name'),
          toName: objs_name,
          text_first: 'yes',
          text: myIcon + '发起了群聊...',
          nickName: inputText,
        });
        history.push('/');
      }
    });
  };
  const goBackS = () => {
    history.push('/');
  };

  return (
    <div className="buildGroup group">
      <div className="xiangmu-header">
        <img
          className="xiangmu-left"
          src="/images/fanhui.png"
          alt=""
          onClick={goBackS}
        />
        <span>发起群聊</span>
        <span className="xiangmu-rigth" onClick={buildGroups}>
          确定
        </span>
      </div>
      <div className="denglu-text">
        <div className="beiZhu">
          <span>为本群起个好名字吧：</span>
          <input
            value={inputText}
            placeholder="请输入群名"
            type="text"
            className="ferst mint-field-core"
            onChange={(e) => onChange(e)}
          />
        </div>
      </div>
      <div className="box box_friend">
        <div className="fankiu" style={{ paddingTop: '2.4rem' }}>
          <CheckList
            multiple
            defaultValue={checkListName}
            onChange={checkLists}
          >
            {friendList.map((item: any, index: number) => {
              return (
                <CheckList.Item value={item.name} key={index}>
                  {
                    <div className="content-food">
                      <div className="imgas">
                        <p>
                          <img className="border" src={item.apathZoom} alt="" />
                        </p>
                      </div>
                      <div className="texts">
                        <span className="first">{item.nickName}</span>
                        <div className="texts-bottom border-bottom"></div>
                      </div>
                    </div>
                  }
                </CheckList.Item>
              );
            })}
          </CheckList>
        </div>
        {friendList.lenght === 0 ? <div className="bottom">暂无好友</div> : ''}
      </div>
    </div>
  );
};

export default ChatList;
