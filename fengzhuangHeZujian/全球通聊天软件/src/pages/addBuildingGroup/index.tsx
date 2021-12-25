import '../buildGroup/index.scss';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Toast, CheckList } from 'antd-mobile';

import { getBuddyList, addBuildingGroup } from '../../api';

const ChatList = () => {
  const history = useHistory();
  const [localName] = useState<any>(localStorage.getItem('name') || '');
  const [myIcon] = useState<any>(localStorage.getItem('myName'));
  const [textNameOld] = useState<any>(localStorage.getItem('textName'));
  const [inputText] = useState<any>(localStorage.getItem('nickName'));
  const [checkListName, setCheckListName] = useState<any>([]);
  const [friendList, setFriendList] = useState<any>([]);
  const [toChatName] = useState<any>(
    JSON.parse(localStorage.getItem('toChatName') || '[]')
  );
  const [groupName] = useState<any>(localStorage.getItem('groupName') || '');

  useEffect(() => {
    getBuddyList({ name: localName }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        if (data.body?.length > 0) {
          for (let i = 0; i < toChatName.length; i++) {
            data.body = data.body.filter((item: any) => {
              if (Array.isArray(item.name)) {
                return false;
              }
              if (toChatName[i].name === item.name) {
                return false;
              }
              return item;
            });
          }
          // console.log(data.body, toChatName);
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

  const checkLists = (e: any) => {
    // console.log(e);
    setCheckListName(e);
  };
  const buildGroups = () => {
    // console.log(inputText, friendList, checkListName);
    let objs_name: any = [],
      textName: any = 0,
      objs_nickName: any = [],
      // keys = false,
      objs_img = [],
      newFriendList: any = [];
    if (checkListName.length === 0) {
      Toast.show({
        content: '请选择添加成员！',
        position: 'top',
      });
      return;
    }
    newFriendList = unique(friendList, checkListName);
    // console.log(newFriendList);
    // return;
    for (var i = 0; i < newFriendList.length; i++) {
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
    textName = textName.toString();
    let list: any = {
      nickName: objs_nickName,
      name: objs_name,
      imgId: objs_img,
      text: myIcon + '邀请【' + objs_nickName.join('、') + '】加入群聊',
      buildingGroupName: inputText,
      textName: textName,
      groupName,
    };
    list = JSON.stringify(list);
    // console.log(list);
    //群中添加成员
    addBuildingGroup({ data: list }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
        // console.log(objs_name);
        window.socket.emit('clientmessage', {
          fromName: localName,
          toName: objs_name,
          text_first: 'yes',
          text: myIcon + '邀请【' + objs_nickName.join('、') + '】加入群聊',
          nickName: inputText,
          textName: inputText + textName,
          textName_1: inputText + textNameOld,
          groupName,
        });
        history.push('/');
      }
    });
  };
  const goBackS = () => {
    // history.push("/");
    history.goBack();
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
        <span>添加成员</span>
        <span className="xiangmu-rigth" onClick={buildGroups}>
          确定
        </span>
      </div>
      <div className="box box_friend">
        <div className="fankiu" style={{ paddingTop: '0.9rem' }}>
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
                      <div className="texts border-bottom">
                        <span className="first">{item.nickName}</span>
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
