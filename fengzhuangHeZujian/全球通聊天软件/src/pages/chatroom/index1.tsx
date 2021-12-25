import './index.scss';

import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useHistory } from 'react-router-dom';
import { CheckList, Toast, Loading, ImageViewer } from 'antd-mobile';
import {
  PlayOutline,
  CloseCircleOutline,
  FileOutline,
} from 'antd-mobile-icons';

import { expressionList } from './expression';
import { moment, isObject } from '../../helpers';
import { MyContext } from '../../models/context';
import OtherItems from './otherItems';
import { UploadImg } from '../A-components/uploadImg';
import Spins from '../A-Spin';

import {
  requestMessage,
  addFriend,
  requestResponse,
  messageClear,
  addBuildingGroup,
  buildingGroupMove,
  uploadFile,
  fileUpload,
} from '../../api';
import { onUploadProgress } from '../../services/request';
import { sync } from 'resolve';

let Flength = 0;
let dateTimes: any = '';
let domKeys = 0;
let textName = 0;
let textName_1 = 0;
let nickNames = '';
let domListL: any = [];
let toChatNameLength = 0;
let boxDom: any = null;
const ChatList = () => {
  const agreess: any = useRef();
  const texts: any = useRef();
  const boxTextes: any = useRef();
  const contentScroll: any = useRef();
  const history = useHistory();
  const { messages } = useContext(MyContext);
  const [tabShow, setTabShow] = useState<any>(false);
  const [expressionShow, setExpressionShow] = useState(false);
  const [addAnothers, setAddAnothers] = useState(false);

  const [voiceSotten, setVoiceSotten] = useState(false);
  const [inputContent, setInputContent] = useState('');

  const [shuruShow, setShuruShow] = useState(false);
  const [page] = useState(1);
  const [pageSize] = useState(10);
  const [textNameOld] = useState(localStorage.getItem('textName'));
  const [Myimg] = useState<any>(localStorage.getItem('myapathZoom'));
  const [Youimg] = useState<any>(localStorage.getItem('headPortrait'));
  const [nickNameTop] = useState<any>(localStorage.getItem('nickName'));
  const [chatType] = useState(localStorage.getItem('type'));
  const [myLocName] = useState<any>(localStorage.getItem('name'));
  const [toChatName] = useState<any>(localStorage.getItem('toChatName'));
  const [locMyName] = useState(localStorage.getItem('myName'));
  const [groupOwner] = useState(localStorage.getItem('groupOwner'));
  const [imgId] = useState(localStorage.getItem('imgId'));
  const [imgIdLoc] = useState(
    JSON.parse(localStorage.getItem('imgIdLoc') || '[]')
  );
  const [contentList, setContentList] = useState<any>([]);
  const [mingSpanC] = useState('#f5f4f9');
  const [mingSpanB] = useState('#ff7a59');
  const [tanCengShow, setTanCengShow] = useState(false);
  const [checkListvalue, setCheckListvalue] = useState([]);
  const [getListL, setGetListL] = useState<any>(
    JSON.parse(localStorage.getItem('getListL') || '[]')
  );
  const [groupName] = useState<any>(localStorage.getItem('groupName') || '');
  const [firstEntry, setFirstEntry] = useState(false);
  const [deleteFl, setDeleteFl] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [getBuddyLists] = useState(
    JSON.parse(localStorage.getItem('getBuddyLists') || '[]')
  );
  const [origin, setorigin] = useState(window.location.origin);
  const [dataListL, setDataListL] = useState<any>(true);
  const [onPlayUrl, setOnPlayUrl] = useState<any>('');
  const [plays, setplays] = useState(true);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    boxDom = document.getElementById('box');
    if (!voiceSotten && texts && texts.current) {
      texts.current.innerText = inputContent;
      if (!expressionShow && Flength !== 0) {
        moveCursor();
      }
    }
  }, [voiceSotten]);

  useEffect(() => {
    scrollHeights(); //滚动底部
  }, [contentList, expressionShow, addAnothers]);

  useEffect(() => {
    getList('');
  }, []);

  useEffect(() => {
    //监听服务服务端emit的message事件发送的消息
    if (firstEntry) {
      messageVariety(messages);
    }
    setFirstEntry(true);
  }, [messages]);

  useEffect(() => {
    const videoRef: any = document.getElementById('vdo') || false;
    if (!videoRef) return;
    videoRef.play() as any;
    setplays(true);
  }, [onPlayUrl]);

  const imgsOnLoad = () => {
    scrollHeights(); //滚动底部
    setExpressionShow(false);
    setAddAnothers(false);
  };
  const setVisibles = (url: any) => {
    setFileUrl(url);
    setVisible(true);
  };

  const onPlay = (url: any) => {
    setOnPlayUrl(url);
  };
  const videoPlays = () => {
    // 视频开关
    setplays(!plays);
    setOnPlayUrl('');
  };
  const fileDownload = (e: string) => {
    console.log(origin + e);
    window.open(`${origin + e}`);
  };
  const messageVariety = (data: any) => {
    if (data.text === 'uploadCompleted') {
      getList('');
      return;
    }
    if (groupName && groupName !== data.text?.groupName) {
      return;
    } else if (data.text?.file && data.text.fromName !== myLocName) {
      return;
    }
    if (
      data.text &&
      Object.prototype.toString.call(data.text) === '[object Object]'
    ) {
      if (data.text.groupName && !groupName) {
        return;
      }
      console.log(data);
      let newList: any = contentList.slice(0);
      if (data.text.fromName === myLocName) {
        if (data.text.text_last) {
          return;
        }
        // newList.push(FasongShijian());
        boxDom.appendChild(FasongShijian());
        if (data.text.text.friends === 'yes') {
          // newList.push(
          //   TishiNeirong('你通过了对方的好友验证请求，现在可以开始聊天啦😄')
          // );
          boxDom.appendChild(
            TishiNeirong('你通过了对方的好友验证请求，现在可以开始聊天啦😄')
          );
          // setContentList(newList);
        } else if (data.text.text.friend === 'no') {
          // newList.push(
          //   TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
          // );
          boxDom.appendChild(
            TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
          );
          // setContentList(newList);
        } else if (data.text.text.friends === 'no') {
          // newList.push(TishiNeirong('您拒绝了对方的好友验证请求！'));
          boxDom.appendChild(TishiNeirong('您拒绝了对方的好友验证请求！'));
          // setContentList(newList);
        } else {
          // newList.push(My('', data.text.text, data.text.file));
          // setContentList(newList);
          boxDom.appendChild(My('', data.text.text, data.text.file));
          // console.log("11111-", newList, contentList);
        }
        return;
      } else if (
        data.text.fromName === myLocName &&
        data.text.toName !== '' &&
        data.text.toName !== myLocName
      ) {
        // console.log("111-", data.text);
        // newList.push(FasongShijian());
        // newList.push(My('', data.text.text, data.text.file));
        // setContentList(newList);
        boxDom.appendChild(FasongShijian());
        boxDom.appendChild(My('', data.text.text, data.text.file));
        return;
      } else if (
        data.text.toName === myLocName &&
        data.text.fromName === window.localStorage.getItem('toChatName')
      ) {
        // console.log("222-", data.text);
        // newList.push(FasongShijian());
        boxDom.appendChild(FasongShijian());
        clearNumber(data.text.fromName, data.text.toName);
        if (data.text.text.friends === 'yes') {
          // $(".shuru").show();
          // newList.push(TishiNeirong(data.text.text.text));
          // setContentList(newList);
          boxDom.appendChild(TishiNeirong(data.text.text.text));
          setShuruShow(true);
        } else if (data.text.text.friend === 'no') {
          // newList.push(
          //   You(
          //     'yes',
          //     '',
          //     '😄来自' + data.text.fromName + '的好友验证请求，是否同意！'
          //   )
          // );
          boxDom.appendChild(
            You(
              'yes',
              '',
              '😄来自' + data.text.fromName + '的好友验证请求，是否同意！'
            )
          );
          // setContentList(newList);
          // $(".shuru").hide();
          setShuruShow(false);
        } else {
          if (data.text.text.friends === 'no') {
            // newList.push(
            //   You(
            //     'yes',
            //     'no',
            //     '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
            //     'no'
            //   )
            // );
            boxDom.appendChild(
              You(
                'yes',
                'no',
                '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
                'no'
              )
            );
            // setContentList(newList);
          } else {
            // newList.push(
            //   You(
            //     'yes',
            //     'yes',
            //     data.text.text,
            //     false,
            //     false,
            //     false,
            //     data.text.file
            //   )
            // );
            boxDom.appendChild(
              You(
                'yes',
                'yes',
                data.text.text,
                false,
                false,
                false,
                data.text.file
              )
            );
            // setContentList(newList);
          }
        }
        return;
      } else if (data.text.type === 'groupChat') {
        //群聊数据
        // console.log("333-", data);
        if (data.text.text_last) {
          Toast.show({
            content: '本群已被移除！',
            position: 'top',
          });
          history.push('/chatRecord');
          return;
        }
        // newList.push(FasongShijian());
        // setContentList(newList);
        boxDom.appendChild(FasongShijian());
        if (data.text.text_first) {
          // newList.push(TishiNeirong(data.text.text));
          // setContentList(newList);
          boxDom.appendChild(TishiNeirong(data.text.text));
        } else {
          let imgs = '';
          imgIdLoc.map((item: any) => {
            if (item.name === data.text.fromName) {
              imgs = item.classIcon;
            }
            return item;
          });
          // newList.push(
          //   You(
          //     'yes',
          //     'yes',
          //     data.text.text,
          //     data.text.fromName,
          //     data.text.myIconName,
          //     imgs,
          //     data.text.file
          //   )
          // );
          // setContentList(newList);
          boxDom.appendChild(
            You(
              'yes',
              'yes',
              data.text.text,
              data.text.fromName,
              data.text.myIconName,
              imgs,
              data.text.file
            )
          );
          clearNumber(
            myLocName,
            localStorage.getItem('toChatName'),
            'groupChat',
            nickNameTop
          );
        }
        return;
      }
      if (data.text.toName === '' && data.text.fromName !== myLocName) {
        // console.log("444-", data.text);
      }
      // if (data.text.file) {
      //   getList("");
      // }
    }
  };

  const scrollHeights = useCallback(() => {
    if (contentScroll !== null) {
      const el_height = contentScroll.current.scrollHeight; //   ===>  获得滚动条的高度
      contentScroll.current.scrollTop = el_height; //  ===> 设置滚动条的位置，滚动到底部
    }
  }, []);

  const ChushiHuaTimes = () => {
    //初始化时间函数
    const times = new Date(); //实例化日期对象；
    let myMonth = times.getMonth(); //当前的月份；
    myMonth = myMonth + 1; //当前的月份；
    // const myDate = times.getDate(); //当前的日期；
    let myHours: any = times.getHours(); //当前的小时；
    let newNum = times.getTime(),
      time = new Date(newNum).toLocaleString();
    let myMinutes: any = '';
    if (/上午/.test(time)) {
      if (myHours === 12 || myHours < 5) {
        if (myHours === 12) {
          myHours = '凌晨00';
        } else {
          myHours = '凌晨0' + myHours.toString();
        }
      } else if (myHours === 5) {
        myHours = '清晨0' + myHours.toString();
      } else if (myHours > 5 && myHours < 11) {
        if (myHours === 10) {
          myHours = '早上' + myHours.toString();
        } else {
          myHours = '早上0' + myHours.toString();
        }
      } else if (myHours > 10 && myHours < 12) {
        myHours = '中午' + myHours.toString();
      }
    } else {
      if (myHours === 12 || myHours < 13) {
        if (myHours === 12) {
          myHours = '中午' + myHours.toString();
        } else {
          myHours = '中午' + myHours.toString();
        }
      } else if (myHours > 12 && myHours < 19) {
        myHours = '下午' + myHours.toString();
      } else if (myHours > 18 || myHours === 0) {
        myHours = '晚上' + myHours.toString();
      }
    }
    if (times.getMinutes() < 10) {
      myMinutes = '0' + times.getMinutes().toString(); //当前的分钟；
    } else {
      myMinutes = times.getMinutes(); //当前的分钟；
    }
    // console.log(times)
    return myHours + ':' + myMinutes;
  };

  const FasongShijian = () => {
    //发送时间显示函数
    const box = document.createElement('div');
    const timeHour = new Date().getTime();
    if (timeHour - dateTimes < 100000) {
      // console.log(timeHour - dateTimes);
      dateTimes = timeHour;
      return box;
    }
    dateTimes = timeHour;

    const boxP = document.createElement('p');
    boxP.innerText = ChushiHuaTimes();
    box.appendChild(boxP);

    box.style.fontSize = '0';
    box.style.padding = '0.2rem 0';
    box.style.textAlign = 'center';
    box.style.width = '82%';
    box.style.margin = '0px auto';

    boxP.style.color = '#fff';
    boxP.style.fontSize = '0.32rem';
    boxP.style.background = '#cfced2';
    boxP.style.display = 'inline-block';
    boxP.style.padding = '0 0.12rem';
    boxP.style.borderRadius = '0.08rem';
    boxP.style.margin = '0';

    return box;
  };

  const clearNumber = (
    fromName?: any,
    toName?: any,
    groupChat?: any,
    nickNameTop?: any
  ) => {
    // console.log(fromName, toName, groupChat, nickNameTop);
    let toName_1 = null;
    if (groupChat) {
      toName_1 = JSON.stringify(toName);
    } else {
      toName_1 = toName;
    }
    // 消息清零
    messageClear({
      fromName: fromName,
      myName: toName_1,
      clear: 'ok',
      type: groupChat,
      nickName: nickNameTop,
    }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        // alert(data.msg);
      }
    });
  };

  const tousuoGo = (times: any, text: string) => {
    //提示投诉信息内容按钮
    const box = document.createElement('div');
    if (text === 'no') {
      return box;
    }
    const boxSpan = document.createElement('span');
    boxSpan.innerText = times;
    box.appendChild(boxSpan);

    box.style.fontSize = '0';
    box.style.width = '82%';
    box.style.margin = '0 auto';
    box.style.padding = '0.2rem 0';
    box.style.textAlign = 'center';

    boxSpan.style.color = '#fff';
    boxSpan.style.fontSize = '0.32rem';
    boxSpan.style.background = '#cfced2';
    boxSpan.style.display = 'inline-block';
    boxSpan.style.padding = '0 0.12rem';
    boxSpan.style.borderRadius = '0.08rem';
    boxSpan.style.wordWrap = 'break-word';

    return box;
  };

  const TishiNeirong = (texts: string) => {
    //或其他公告提示信息
    const box = document.createElement('div');
    const boxSpan = document.createElement('span');
    boxSpan.innerText = texts;
    box.appendChild(boxSpan);

    box.style.width = '82%';
    box.style.fontSize = '0';
    box.style.margin = '0 auto';
    box.style.padding = '0.2rem 0';
    box.style.textAlign = 'center';

    boxSpan.style.color = '#b4b4b4';
    boxSpan.style.lineHeight = '0.4rem';
    boxSpan.style.fontSize = '0.32rem';
    boxSpan.style.wordWrap = 'break-word';

    return box;
  };

  const HuanquSenqing = (cont: string, DianJi: string | number, type: any) => {
    //换名片和发送项目申请提示处理函数
    const locFromName = window.localStorage.getItem('fromName');
    const myName = window.localStorage.getItem('name');

    const box = document.createElement('div');
    const boxP = document.createElement('p');
    const boxAgrees = document.createElement('span');
    const boxRefuses = document.createElement('span');

    boxP.innerText = cont;
    boxAgrees.innerText = `${type === 'no' ? '是' : '同意'}`;
    boxRefuses.innerText = `${type === 'no' ? '否' : '拒绝'}`;
    box.appendChild(boxP);
    box.appendChild(boxAgrees);
    box.appendChild(boxRefuses);

    box.style.width = '4.04rem';
    box.style.margin = '0 auto';
    box.style.minHeight = '1.26rem';
    box.style.position = 'relative';
    box.style.background = '#fff';

    boxP.style.lineHeight = '0.42rem';
    boxP.style.fontSize = '0.32rem';
    boxP.style.wordWrap = 'break-word';
    boxP.style.padding = '0 0 0.72rem 0';
    boxP.style.color = '#07111B';
    boxP.style.margin = '0px';

    boxAgrees.style.position = 'absolute';
    boxAgrees.style.fontSize = '0.32rem';
    boxAgrees.style.display = 'inline-block';
    boxAgrees.style.left = '0';
    boxAgrees.style.bottom = '0';
    boxAgrees.style.color = mingSpanC;
    boxAgrees.style.width = '46%';
    boxAgrees.style.height = '0.62rem';
    boxAgrees.style.borderRadius = '0.08rem';
    boxAgrees.style.background = mingSpanB;
    boxAgrees.style.lineHeight = '0.62rem';
    boxAgrees.style.textAlign = 'center';

    boxRefuses.style.position = 'absolute';
    boxRefuses.style.fontSize = '0.32rem';
    boxRefuses.style.right = '0';
    boxRefuses.style.bottom = '0';
    boxRefuses.style.width = '46%';
    boxRefuses.style.height = '0.62rem';
    boxRefuses.style.borderRadius = '0.08rem';
    boxRefuses.style.background = '#f5f4f9';
    boxRefuses.style.lineHeight = '0.62rem';
    boxRefuses.style.textAlign = 'center';

    let i = 0;
    if (DianJi === 1 || DianJi === 'yes') {
      i = 1;
      boxAgrees.style.color = '#000000';
      boxAgrees.style.background = '#f5f4f9';
    }
    boxAgrees.onclick = () => {
      //添加好友同意事件
      var timeHour = new Date().getTime();
      var dateYes = 'no';
      if (timeHour - dateTimes > 100000) {
        // console.log(timeHour - dateTimes);
        dateYes = 'yes';
      }
      if (i === 1) {
        return;
      }
      i++;
      // console.log(i);
      if (type === 'no') {
        var name = localStorage.getItem('name'),
          addName = localStorage.getItem('toChatName'),
          nickName = localStorage.getItem('toNames');
        //再次添加好友；
        addFriend({
          addName: nickName,
          fromNumber: name,
          addNumber: addName,
          addFriend: 2,
        }).then((data) => {
          console.log(data);
          if (data.code === 200) {
            if (agreess) {
              agreess.current.classList.add('active');
              // agreess.current.style.color = "#000000";
              // agreess.current.style.background = "#f5f4f9";
            }
            //再次向对方发送添加好友验证消息
            window.socket.emit('clientmessage', {
              fromName: name,
              toName: addName,
              text: { friend: 'no', addName: nickName, addFriend: 2 },
              dateTimes: dateYes,
            });
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
      } else {
        //同意添加好友请求
        requestResponse({
          fromName: locFromName,
          myName: myName,
          friends: 'yes',
        }).then((data) => {
          console.log(data);
          if (data.code === 200) {
            Toast.show({
              icon: 'success',
              content: data.msg,
            });
            if (agreess) {
              agreess.current.classList.add('active');
              // agreess.current.style.color = "#000000";
              // agreess.current.style.background = "#f5f4f9";
            }
            setShuruShow(true);
            //向对方发送同意好友消息
            window.socket.emit('clientmessage', {
              fromName: myName,
              toName: locFromName,
              text: {
                from: myName,
                text: '我通过了你的好友验证请求，我们现在可以聊天啦！😄',
                friends: 'yes',
              },
              dateTimes: dateYes,
            });
          }
        });
      }
    };

    boxRefuses.onclick = () => {
      //绑定好友拒绝事件
      if (type === 'no') {
        return;
      }
      if (i === 1) {
        return;
      }
      var timeHour = new Date().getTime();
      var dateYes = 'no';
      if (timeHour - dateTimes > 100000) {
        // console.log(timeHour - dateTimes);
        dateYes = 'yes';
      }
      if (DianJi === 1) {
        return;
      }
      i++;
      //好友拒绝请求
      requestResponse({
        fromName: locFromName,
        myName: myName,
        friends: 'no',
      }).then((data) => {
        console.log(data);
        if (data.code === 200) {
          if (agreess) {
            agreess.current.classList.add('active');
            // agreess.current.style.color = "#000000";
            // agreess.current.style.background = "#f5f4f9";
          }
          //向对方发送添加好友拒绝消息
          window.socket.emit('clientmessage', {
            fromName: myName,
            toName: locFromName,
            text: {
              from: myName,
              text: '您拒绝了对方的好友验证请求！',
              friends: 'no',
            },
            dateTimes: dateYes,
          });
        }
      });
    };
    return box;
  };

  const textDom = (boxTexte_span_span: any, file: any, cont: any) => {
    if (file && !file?.file) {
      boxTexte_span_span.onload = imgsOnLoad;
      boxTexte_span_span.style.color = 'rgba(255, 122, 89)';
      boxTexte_span_span.style.display = 'flex';
      boxTexte_span_span.style.flexDirection = 'column';
      boxTexte_span_span.style.alignItems = 'center';
      boxTexte_span_span.style.justifyContent = 'center';
      boxTexte_span_span.style.width = '100px';
      boxTexte_span_span.style.height = '100px';
      boxTexte_span_span.style.fontSize = '0.41rem';
      boxTexte_span_span.style.background =
        'url(/images/tuPianJiaZaiZhong.png)';
      boxTexte_span_span.style.backgroundSize = '100% 100%';
      boxTexte_span_span.style.borderRadius = '0.08rem';
      const boxTexte_span_span_span = document.createElement('span');
      boxTexte_span_span_span.style.fontSize = '13px';
      if (!progress) {
        // boxTexte_span_span.appendChild(<Loading color="currentColor" />)
        boxTexte_span_span_span.style.lineHeight = '12px';
        boxTexte_span_span_span.innerText = `上传中...${progress}`;
      } else {
        boxTexte_span_span_span.innerText = `上传失败...${progress}`;
      }
      boxTexte_span_span.appendChild(boxTexte_span_span_span);
    } else if (file?.file) {
      boxTexte_span_span.onload = imgsOnLoad;
      boxTexte_span_span.style.color = 'rgba(255, 122, 89)';
      boxTexte_span_span.style.display = 'flex';
      boxTexte_span_span.style.alignItems = 'center';
      boxTexte_span_span.style.justifyContent = 'center';
      boxTexte_span_span.style.borderRadius = '0.08rem';
      boxTexte_span_span.style.width = `${
        file?.fileType === 'video'
          ? '100px'
          : file?.fileType !== 'image'
          ? 'auto'
          : 'auto'
      }`;
      boxTexte_span_span.style.height = `${
        file?.fileType === 'video' ? '100px' : 'auto'
      }`;
      boxTexte_span_span.style.minHeight = `${
        file?.fileType !== 'image' && '42px'
      }`;
      boxTexte_span_span.style.fontSize = '0.41rem';
      boxTexte_span_span.style.background = `${
        file?.fileType === 'image'
          ? 'url(/images/tuPianJiaZaiZhong.png)'
          : file?.fileType === 'video'
          ? 'rgb(207, 206, 210)'
          : '#FFF'
      }`;
      boxTexte_span_span.style.backgroundSize = '100% 100%';
      if (file?.fileType === 'video') {
        const boxTexte_span_span_div = document.createElement('div');
        boxTexte_span_span_div.onclick = () => onPlay(file.url);
        boxTexte_span_span.appendChild(boxTexte_span_span_div);
        // boxTexte_span_span_div.appendChild(<PlayOutline />);
      } else if (file?.fileType === 'image') {
        const boxTexte_span_span_img = document.createElement('img');
        boxTexte_span_span_img.onload = imgsOnLoad;
        boxTexte_span_span_img.style.borderRadius = '0.08rem';
        boxTexte_span_span_img.src = file.apathZoom;
        boxTexte_span_span_img.onclick = () => setVisibles(file.url);
        if (file?.length === 'width') {
          boxTexte_span_span_img.style.width = '130px';
        } else {
          boxTexte_span_span_img.style.height = '190px';
        }
        boxTexte_span_span.appendChild(boxTexte_span_span_img);
      } else {
        const boxTexte_span_span_divUrl = document.createElement('div');
        boxTexte_span_span_divUrl.onclick = () => fileDownload(file.url);
        boxTexte_span_span_divUrl.style.fontSize = '0.32rem';
        boxTexte_span_span_divUrl.style.lineHeight = '0.4rem';
        boxTexte_span_span_divUrl.style.padding = '0.16rem 0.2rem';
        boxTexte_span_span_divUrl.style.flex = '1';
        boxTexte_span_span_divUrl.style.width = '190px';
        boxTexte_span_span_divUrl.innerText =
          file.url.split('/')[file.url.split('/').length - 1];

        const boxTexte_span_span_divS = document.createElement('div');
        boxTexte_span_span_divS.style.display = 'flex';
        boxTexte_span_span_divS.style.flexDirection = 'column';
        boxTexte_span_span_divS.style.alignItems = 'center';
        boxTexte_span_span_divS.style.textAlign = 'center';
        boxTexte_span_span_divS.style.maxWidth = '60px';
        boxTexte_span_span_divS.style.overflowWrap = 'break-word';
        boxTexte_span_span_divS.style.padding = '10px 8px 10px 0';

        const boxTexte_span_span_divS_span = document.createElement('span');
        boxTexte_span_span_divS_span.style.fontSize = '13px';
        boxTexte_span_span_divS_span.style.lineHeight = '14px';
        boxTexte_span_span_divS_span.style.display = 'inline-block';
        boxTexte_span_span_divS_span.style.width = '100%';
        boxTexte_span_span_divS_span.style.textAlign = 'center';
        boxTexte_span_span_divS_span.innerText = file.size;
        // boxTexte_span_span_divS.appendChild(<FileOutline
        //   style={{
        //     width: '30px',
        //     height: '30px',
        //   }}
        // />);
        boxTexte_span_span_divS.appendChild(boxTexte_span_span_divS_span);

        boxTexte_span_span.appendChild(boxTexte_span_span_divUrl);
        boxTexte_span_span.appendChild(boxTexte_span_span_divS);
      }
    } else {
      boxTexte_span_span.innerText = cont;
    }
    return;
  };

  const My = (type: any, cont: string, file?: any) => {
    // console.log(file);

    const box = document.createElement('div');
    const boxTexte = document.createElement('div');

    const boxTexte_span = document.createElement('span');
    const boxTexte_span_span = document.createElement('span');
    if (file) {
      textDom(boxTexte_span_span, file, cont);
    }

    const boxTexte_div = document.createElement('div');

    const boxImgBox = document.createElement('div');
    const boxImgBox_div = document.createElement('div');
    const boxImgBox_div_img = document.createElement('img');
    boxImgBox_div_img.src = Myimg;

    box.appendChild(boxTexte);
    boxTexte.appendChild(boxTexte_span);
    boxTexte_span.appendChild(boxTexte_span_span);
    boxTexte.appendChild(boxTexte_div);

    box.appendChild(boxImgBox);
    boxImgBox.appendChild(boxImgBox_div);
    boxImgBox_div.appendChild(boxImgBox_div_img);

    box.className = 'fankiu-you';
    box.style.width = '92%';
    box.style.margin = '0 auto';
    box.style.textAlign = 'justify';
    box.style.lineHeight = '0.4rem';
    box.style.overflow = 'hidden';
    box.style.padding = '0.1rem 0';

    boxTexte.className = 'fankiu-text clearbox';
    boxTexte.style.width = '86%';
    boxTexte.style.float = 'left';
    boxTexte.style.position = 'relative';

    boxImgBox.className = 'fankiu-img';
    boxImgBox.style.width = '14%';
    boxImgBox.style.float = 'left';
    boxImgBox.style.overflow = 'hidden';

    boxTexte_span.style.display = 'inline-block';
    boxTexte_span.style.padding = `${file ? '0' : '0.16rem 0.2rem'}`;
    boxTexte_span.style.background = `${file ? '' : '#ff7a59'}`;
    boxTexte_span.style.color = '#fff';
    boxTexte_span.style.float = 'right';
    boxTexte_span.style.maxWidth = '77%';
    boxTexte_span.style.borderRadius = '0.08rem';
    boxTexte_span.style.fontSize = '0.32rem';
    boxTexte_span.style.border = '0.01rem solid #e7e6e9';
    boxTexte_span.style.wordWrap = 'break-word';
    boxTexte_span.style.lineHeight = `${file ? '0' : '0.4rem'}`;

    boxTexte_div.style.backgroundSize = '100% 100%';
    boxTexte_div.style.position = 'absolute';
    boxTexte_div.style.width = '0.16rem';
    boxTexte_div.style.height = '0.22rem';
    boxTexte_div.style.top = '0.26rem';
    boxTexte_div.style.right = '-0.13rem';

    boxImgBox_div.style.width = '0.76rem';
    boxImgBox_div.style.height = '0.76rem';
    boxImgBox_div.style.boxSizing = 'border-box';
    boxImgBox_div.style.float = 'right';
    boxImgBox_div.style.overflow = 'hidden';
    boxImgBox_div.style.borderRadius = '0.08rem';

    boxImgBox_div_img.style.background = '#EAEAEA';
    boxImgBox_div_img.style.float = 'right';
    boxImgBox_div_img.style.borderRadius = '0.08rem';
    boxImgBox_div_img.style.width = '100%';

    return box;
  };

  const You = (
    yes?: any,
    type?: string,
    cont?: any,
    DianJi?: any,
    myIconName?: any,
    imgs?: any,
    file?: any
  ) => {
    let newYouimg = Youimg;
    if (imgs) {
      newYouimg = imgs;
    }
    // console.log(file);
    const onImaF = () => {
      //				对方个人资料
      if (yes) {
        if (DianJi) {
          // console.log(DianJi);
          const imglist = JSON.parse(localStorage.getItem('imgIdLoc') || '[]');
          for (var i = 0; i < imglist.length; i++) {
            if (imglist[i].name === DianJi) {
              localStorage.setItem(
                'headPortrait_groupChat',
                imglist[i].classIcon
              );
              newYouimg = imglist[i].classIcon;
              localStorage.setItem('toChatName_groupChat', DianJi);
              break;
            }
          }
        }
        localStorage.setItem('personalInformation', '1');
        history.push('/personalInformation');
      }
    };
    const box = document.createElement('div');

    const boxImg = document.createElement('div');
    boxImg.className = 'fankiu-img';
    boxImg.style.width = '14%';
    boxImg.style.height = '0.76rem';

    const boxImg_div = document.createElement('div');
    boxImg_div.onclick = onImaF;

    boxImg_div.style.width = '0.76rem';
    boxImg_div.style.height = '0.76rem';
    boxImg_div.style.boxSizing = 'border-box';
    boxImg_div.style.overflow = 'hidden';
    boxImg_div.style.borderRadius = '0.08rem';

    const boxImg_div_img = document.createElement('img');
    boxImg_div_img.src = newYouimg;
    boxImg_div_img.style.background = '#EAEAEA';
    boxImg_div_img.style.borderRadius = '0.08rem';
    boxImg_div_img.style.float = 'left';
    boxImg_div_img.style.width = '100%';

    const boxTexte = document.createElement('div');
    boxTexte.className = 'fankiu-text';
    boxTexte.style.width = '86%';
    boxTexte.style.position = 'relative';

    const boxTexte_div = document.createElement('div');
    const boxTexte_span = document.createElement('span');
    boxTexte_span.style.display = 'inline-block';
    boxTexte_span.style.padding = `${file ? '0' : '0.16rem 0.2rem'}`;
    boxTexte_span.style.background = `${file ? '' : '#fff'}`;
    boxTexte_span.style.lineHeight = `${file ? '0' : '0.4rem'}`;
    boxTexte_span.style.maxWidth = '77%';
    boxTexte_span.style.borderRadius = '0.08rem';
    boxTexte_span.style.fontSize = '0.32rem';
    boxTexte_span.style.border = '0.01rem solid #e7e6e9';
    boxTexte_span.style.wordWrap = 'break-word';
    boxTexte_span.style.float = 'left';

    if (type === 'yes' && DianJi) {
      boxTexte_div.innerText = myIconName;
      // boxTexte_span.innerText = cont;
      boxTexte_div.style.fontSize = '0.26rem';
      boxTexte_div.style.color = '#07111B';
      boxTexte_div.style.lineHeight = '0.2rem';
      boxTexte_div.style.padding = '0 0 0.1rem 0.1rem';
      boxTexte_div.style.color = 'rgb(180, 180, 180)';

      boxTexte.appendChild(boxTexte_div);
      boxTexte.appendChild(boxTexte_span);
    } else if (type === 'yes') {
      boxTexte.appendChild(boxTexte_span);
      boxTexte.appendChild(boxTexte_div);

      boxTexte.style.backgroundSize = '100% 100%';
      boxTexte.style.position = 'absolute';
      boxTexte.style.width = '0.16rem';
      boxTexte.style.height = '0.22rem';
      boxTexte.style.top = '0.26rem';
      boxTexte.style.left = '-0.13rem';
      boxTexte.style.zIndex = '100';
    } else {
      // boxTexte_span.innerHTML = HuanquSenqing(cont, DianJi, type)
      boxTexte.appendChild(boxTexte_span);
    }

    box.appendChild(boxImg);
    boxImg_div.appendChild(boxImg_div_img);

    box.appendChild(boxTexte);

    const style: any = {};
    style.width = '92%'; //样式4
    style.margin = '0 auto';
    style.lineHeight = '0.4rem';
    style.textAlign = 'justify';
    style.display = 'flex';
    style.padding = '0.1rem 0';

    const imgStyle: any = { borderRadius: '0.08rem' };
    if (file?.length === 'width') {
      imgStyle.width = '130px';
    } else {
      imgStyle.height = '190px';
    }
    if (file) {
      textDom(boxTexte_span, file, cont);
    }
    // if (file) {
    //   cont = (
    //     <span>
    //       {file && !file?.file ? (
    //         <span
    //           style={{
    //             color: 'rgba(255, 122, 89)',
    //             display: 'flex',
    //             flexDirection: 'column',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             backgroundImage: 'url(/images/tuPianJiaZaiZhong.png)',
    //             backgroundSize: 'cover',
    //             width: '100px',
    //             height: '100px',
    //             fontSize: '0.41rem',
    //           }}
    //         >
    //           <Loading color="currentColor" />
    //         </span>
    //       ) : file?.file ? (
    //         <span
    //           onLoad={imgsOnLoad}
    //           style={{
    //             color: 'rgba(255, 122, 89)',
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             borderRadius: '0.08rem',
    //             width: `${
    //               file?.fileType === 'video'
    //                 ? '100px'
    //                 : file?.fileType !== 'image'
    //                 ? 'auto'
    //                 : 'auto'
    //             }`,
    //             height: `${file?.fileType === 'video' ? '100px' : 'auto'}`,
    //             minHeight: `${file?.fileType !== 'image' && '42px'}`,
    //             fontSize: '0.41rem',
    //             background: `${
    //               file?.fileType === 'image'
    //                 ? 'url(/images/tuPianJiaZaiZhong.png)'
    //                 : file?.fileType === 'video'
    //                 ? 'rgb(207, 206, 210)'
    //                 : '#FFF'
    //             }`,
    //             backgroundSize: '100% 100%',
    //           }}
    //         >
    //           {file?.fileType === 'video' ? (
    //             <div
    //               style={{
    //                 padding: '6px',
    //                 borderRadius: '100%',
    //                 border: '0.03rem solid rgb(255, 122, 89)',
    //               }}
    //               onClick={() => onPlay(file.url)}
    //             >
    //               <PlayOutline />
    //             </div>
    //           ) : file?.fileType === 'image' ? (
    //             <img
    //               onLoad={imgsOnLoad}
    //               style={imgStyle}
    //               src={file.apathZoom}
    //               alt=""
    //               onClick={() => setVisibles(file.url)}
    //             />
    //           ) : (
    //             <>
    //               <div
    //                 style={{
    //                   fontSize: '0.32rem',
    //                   lineHeight: '0.4rem',
    //                   padding: '0.16rem 0.2rem',
    //                   flex: '1',
    //                   width: '190px',
    //                 }}
    //                 onClick={() => fileDownload(file.url)}
    //               >
    //                 {file.url.split('/')[file.url.split('/').length - 1]}
    //               </div>
    //               <div
    //                 style={{
    //                   display: 'flex',
    //                   flexDirection: 'column',
    //                   alignItems: 'center',
    //                   textAlign: 'center',
    //                   maxWidth: '60px',
    //                   overflowWrap: 'break-word',
    //                   padding: '10px 8px 10px 0',
    //                 }}
    //               >
    //                 <FileOutline
    //                   style={{
    //                     width: '30px',
    //                     height: '30px',
    //                   }}
    //                 />
    //                 <span
    //                   style={{
    //                     fontSize: '13px',
    //                     lineHeight: '14px',
    //                     display: 'inline-block',
    //                     width: '100%',
    //                     textAlign: 'center',
    //                   }}
    //                 >
    //                   {file.size}
    //                 </span>
    //               </div>
    //             </>
    //           )}
    //         </span>
    //       ) : (
    //         cont
    //       )}
    //     </span>
    //   );
    // }

    return box;
  };

  const getList = (types: any) => {
    // if( toChatName !== myLocName && toChatNameLength===0){
    //   setGetListL([])
    // }
    // if (getListL && getListL.length > 0) {
    //   dataCollation(getListL, types);
    // }
    requestMessage({
      type: chatType,
      page: page,
      pageSize: pageSize,
      friendName: localStorage.getItem('toChatName'),
      myName: myLocName,
      nickName: nickNameTop,
      groupName,
    }).then((data) => {
      console.log(data);
      setDataListL(false);
      if (data.code && data.code === 200 && data.body.length > 0) {
        dataCollation(data.body, types);
        // setGetListL(data.body);
        localStorage.setItem('getListL', JSON.stringify(data.body));
      } else {
        setShuruShow(true);
      }
      // page += 1;
    });
  };

  const dataCollation = (data: any, types: any) => {
    let domList: any = [];
    // const lengths = data.body.length;
    let yes = '';
    let setShuruShowL = false;
    dateTimes = data[data.length - 1].dateTime;
    // console.log("111", data);
    data.map((item: any) => {
      if (!data[data.length - 1].friend) {
        yes = 'yes';
      }
      if (item.fromName === myLocName) {
        if (item.type === 'chat') {
          // domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          boxDom.appendChild(tousuoGo(moment(item.dateTime), item.dateTimes));
          if (item.text.friends === 'yes') {
            setShuruShowL = true;
            // domList.push(
            //   TishiNeirong('你已通过对方的好友验证请求，现在可以开始聊天啦😄')
            // );
            boxDom.appendChild(
              TishiNeirong('你已通过对方的好友验证请求，现在可以开始聊天啦😄')
            );
          } else if (item.text.friend === 'no') {
            // domList.push(
            //   TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
            // );
            boxDom.appendChild(
              TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
            );
          } else if (item.text.friends === 'no') {
            // domList.push(TishiNeirong('您拒绝了对方的好友验证请求！'));
            boxDom.appendChild(TishiNeirong('您拒绝了对方的好友验证请求！'));
          } else {
            // domList.push(My('', item.text, item.file));
            boxDom.appendChild(My('', item.text, item.file));
            setShuruShowL = true;
          }
        } else if (chatType === 'groupChat') {
          // domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          boxDom.appendChild(tousuoGo(moment(item.dateTime), item.dateTimes));
          if (item.text_first) {
            // domList.push(TishiNeirong(item.text));
            boxDom.appendChild(TishiNeirong(item.text));
          } else {
            // domList.push(My('', item.text, item.file));
            boxDom.appendChild(My('', item.text, item.file));
          }
          setShuruShowL = true;
        }
      } else if (
        item.fromName === myLocName &&
        item.toName !== '' &&
        item.text.toName !== myLocName
      ) {
        // console.log("222", item.text);
        // domList.push(My('', item.text, item.file));
        boxDom.appendChild(My('', item.text, item.file));
        setShuruShowL = true;
      } else if (item.toName === '' && item.fromName === myLocName) {
      } else if (item.toName === '' && item.fromName !== myLocName) {
        //
      } else if (item.toName === myLocName) {
        // console.log('333',data.body[i]);
        // domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
        boxDom.appendChild(tousuoGo(moment(item.dateTime), item.dateTimes));
        if (item.text.friend === 'no') {
          if (item.friend === 'yes') {
            // domList.push(
            //   You(
            //     yes,
            //     '',
            //     '😄来自' + item.fromName + '的好友验证请求，是否同意！',
            //     1
            //   )
            // );
            boxDom.appendChild(
              You(
                yes,
                '',
                '😄来自' + item.fromName + '的好友验证请求，是否同意！',
                1
              )
            );
          } else {
            // domList.push(
            //   You(
            //     yes,
            //     '',
            //     '😄来自' + item.fromName + '的好友验证请求，是否同意！'
            //   )
            // );
            boxDom.appendChild(
              You(
                yes,
                '',
                '😄来自' + item.fromName + '的好友验证请求，是否同意！'
              )
            );
          }
        } else {
          if (item.text.friends === 'yes') {
            setShuruShowL = true;
            // domList.push(
            //   You(yes, 'yes', item.text.text, false, false, false, item.file)
            // );
            boxDom.appendChild(
              You(yes, 'yes', item.text.text, false, false, false, item.file)
            );
          } else if (item.text.friends === 'no') {
            // domList.push(
            //   You(
            //     yes,
            //     'no',
            //     '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
            //     item.friend
            //   )
            // );
            boxDom.appendChild(
              You(
                yes,
                'no',
                '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
                item.friend
              )
            );
          } else {
            // domList.push(
            //   You(yes, 'yes', item.text, false, false, false, item.file)
            // );
            boxDom.appendChild(
              You(yes, 'yes', item.text, false, false, false, item.file)
            );
            setShuruShowL = true;
          }
        }
      } else if (item.type === 'groupChat') {
        if (item.text_first) {
          // domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          // domList.push(TishiNeirong(item.text));
          boxDom.appendChild(tousuoGo(moment(item.dateTime), item.dateTimes));
          boxDom.appendChild(TishiNeirong(item.text));
        } else {
          const imglist = JSON.parse(localStorage.getItem('imgIdLoc') || '[]');
          let imgs = '';
          for (var i = 0; i < imglist.length; i++) {
            if (imglist[i].name === item.fromName) {
              imgs = imglist[i].classIcon;
              break;
            }
          }
          if (!imgs) return item;
          // domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          // domList.push(
          //   You(
          //     yes,
          //     'yes',
          //     item.text,
          //     item.fromName,
          //     item.myIconName,
          //     imgs,
          //     item.file
          //   )
          // );
          boxDom.appendChild(tousuoGo(moment(item.dateTime), item.dateTimes));
          boxDom.appendChild(
            You(
              yes,
              'yes',
              item.text,
              item.fromName,
              item.myIconName,
              imgs,
              item.file
            )
          );
        }
        setShuruShowL = true;
      }
      return item;
    });
    if (types) {
      // dom1.scrollTop(0);
    } else {
    }
    setShuruShow(setShuruShowL);
    setContentList(domList);
  };
  const onTimes = () => {
    const times = setTimeout(() => {
      scrollHeights(); //滚动底部
      clearTimeout(times);
    }, 210);
  };

  const goBackS = () => {
    if (localStorage.getItem('personalInformation')) {
      localStorage.removeItem('type');
      localStorage.removeItem('imgIdLoc');
      history.push('/');
    } else {
      localStorage.removeItem('type');
      localStorage.removeItem('imgIdLoc');
      history.goBack();
    }
  };
  const voices = () => {
    Flength += 1;
    setVoiceSotten(!voiceSotten);
    setExpressionShow(false);
  };
  const expressions = () => {
    setVoiceSotten(false);
    if (texts && expressionShow) {
      moveCursor();
    }
    setExpressionShow(!expressionShow);
    setAddAnothers(false);
    onTimes();
  };
  const moveCursor = () => {
    texts.current.focus();
    // 光标移动到最后
    let range = document.createRange();
    range.selectNodeContents(texts.current);
    range.collapse(false);
    let sel: any = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    onTimes();
  };

  const expressionD = () => {
    var textList = [];
    var spans = [];
    for (var i = 1; i < expressionList.length; i++) {
      spans.push(
        <span onClick={(e) => addEmoticons(e)} key={i}>
          {expressionList[i]}
        </span>
      );
      if (i % 8 === 0 || i === expressionList.length - 1) {
        textList.push(
          <div key={i} className="expression_box">
            {spans}
          </div>
        );
        spans = [];
      }
    }
    return textList;
  };
  const contenteditable = (e: any) => {
    // console.log(e.target.innerText);
    setInputContent(e.target.innerText);
  };
  const addEmoticons = (e: any) => {
    texts.current.innerText += e.target.innerText;
    setInputContent(texts.current.innerText);
  };
  const onchange = () => {
    setExpressionShow(false);
    setAddAnothers(false);
    // moveCursor();
  };
  const tabs = () => {
    setTabShow(!tabShow);
  };
  const tabsHid = () => {
    if (tabShow) {
      setTabShow(false);
    }
  };

  const send = async (text?: any) => {
    // console.log(inputContent, text);
    //发送消息
    var timeHour = new Date().getTime();
    var dateYes = 'no';
    const chatNames: any = localStorage.getItem('toChatName');
    if (timeHour - dateTimes > 100000) {
      // console.log(timeHour - dateTimes);
      dateYes = 'yes';
    }
    const Trim = (str: string) => {
      return str.replace(/(^\s*)|(\s*$)/g, '');
    };

    if (text || Trim(inputContent) !== '') {
      // console.log(inputContent, text);
      if (chatType === 'chat') {
        await window.socket.emit('clientmessage', {
          fromName: myLocName,
          // toName: $('#texts0')[0].value,
          toName: chatNames,
          text: text ? '' : inputContent,
          fromTo: (chatNames * 1 + myLocName * 1).toString(),
          dateTimes: dateYes,
          Own: chatNames === myLocName ? true : false,
          file: text,
        });
      } else {
        //群聊
        let toChatNames = JSON.parse(chatNames),
          fromChat: any = null;
        for (var i = 0; i < toChatNames.length; i++) {
          fromChat += toChatNames[i].name * 1;
        }
        fromChat = nickNameTop + fromChat.toString();
        await window.socket.emit('clientmessage', {
          fromName: myLocName,
          // toName: $('#texts0')[0].value,
          toName: JSON.parse(chatNames),
          text: text ? '' : inputContent,
          fromTo: fromChat,
          nickName: nickNameTop,
          dateTimes: dateYes,
          myIconName: locMyName,
          groupName,
          imgId: [],
          file: text,
        });
      }
    }
    texts.current.innerText = '';
    setInputContent('');
    moveCursor();
    if (!text && !expressionShow) {
      texts.current.focus();
    } else {
      texts.current.blur();
    }
    return false;
  };

  const addsAnother = () => {
    setAddAnothers(!addAnothers);
    setExpressionShow(false);
    if (addAnothers) {
      moveCursor();
    }
    onTimes();
  };

  const options = (type: number) => {
    // console.log("123", type);
    if (type === 1) {
      history.push('/allMembers');
      return;
    }
    if (type === 2) {
      history.push('/addBuildingGroup');
      return;
    }
    if (type === 3) {
      for (var i = 0; i < imgIdLoc.length; i++) {
        if (imgIdLoc[i].name !== myLocName) {
          textName += imgIdLoc[i].name * 1;
        }
        textName_1 += imgIdLoc[i].name * 1;
      }
      let list: any = {
        nickName: [locMyName],
        name: [{ name: myLocName, newsNumber: 0 }],
        imgId: [imgId],
        text: '【' + locMyName + '】已退出本群',
        buildingGroupName: nickNameTop,
        moveName: 'yes',
        textName: textName.toString(),
      };
      list = JSON.stringify(list);
      // console.log(list, nickNameTop + textName, nickNameTop + textName_1);
      //退出本群
      addBuildingGroup({ data: list }).then((data) => {
        // console.log(data);
        if (data.code === 200) {
          Toast.show({
            icon: 'success',
            content: data.msg,
          });
          window.socket.emit('clientmessage', {
            fromName: myLocName,
            toName: [{ name: myLocName, newsNumber: 0 }],
            text_first: 'yes',
            text: '【' + locMyName + '】已退出本群',
            nickName: nickNameTop,
            textName: nickNameTop + textName,
            textName_1: nickNameTop + textNameOld,
          });
          history.push('/');
        }
      });
      return;
    }
    if (type === 4) {
      setTanCengShow(true);
      return;
    }
    if (type === 5) {
      //移除本群;
      buildingGroupMove({ nickName: nickNameTop }).then((data) => {
        // console.log(data);
        if (data.code === 200) {
          Toast.show({
            icon: 'success',
            content: data.msg,
          });
          window.socket.emit('clientmessage', {
            fromName: myLocName,
            toName: [],
            text_last: 'yes',
            text: nickNameTop + '已将本群移除...',
            type: 'groupChat',
          });
          history.push('/');
        }
      });
      return;
    }
  };

  const Sure = () => {
    if (!checkListvalue[0]) {
      Toast.show({
        content: '请选择要转让者！',
        position: 'top',
      });
      return;
    }
    // console.log("确定");
    for (var i = 0; i < imgIdLoc.length; i++) {
      if (imgIdLoc[i].name !== myLocName) {
        textName += imgIdLoc[i].name * 1;
      }
      if (checkListvalue[0] === imgIdLoc[i].name) {
        nickNames = imgIdLoc[i].nickName;
      }
      // textName_1 += imgIdLoc[i].name * 1;
    }
    let list: any = {
      nickName: [locMyName],
      name: [{ name: myLocName, newsNumber: 0 }],
      imgId: [imgId],
      text:
        '【' +
        locMyName +
        '】已退出将本群转让给' +
        '【' +
        nickNames +
        '】为本群群主',
      buildingGroupName: nickNameTop,
      moveName: 'yes',
      Transfer: checkListvalue[0],
      textName: textName.toString(),
    };
    list = JSON.stringify(list);
    // console.log(list, textName, textName_1, nickNameTop);
    //转让本群
    addBuildingGroup({ data: list }).then((data) => {
      // console.log(data);
      if (data.code === 200) {
        Toast.show({
          icon: 'success',
          content: data.msg,
        });
        window.socket.emit('clientmessage', {
          fromName: myLocName,
          toName: [{ name: myLocName, newsNumber: 0 }],
          text_first: 'yes',
          text:
            '【' +
            locMyName +
            '】已退出将本群转让给' +
            '【' +
            nickNames +
            '】为本群群主',
          nickName: nickNameTop,
          textName: nickNameTop + textName,
          textName_1: nickNameTop + textNameOld,
          Transfer: checkListvalue[0],
        });
        history.push('/');
      }
    });
  };
  const Cancel = () => {
    setTanCengShow(false);
  };
  const onChange = (e: any) => {
    // console.log(e);
    setCheckListvalue(e);
  };

  const setFileList = async (list: any) => {
    console.log(list);

    setAddAnothers(false);
    texts.current.blur();
    const dateTime: any = new Date().getTime();
    for (let i = 0; i < list.length; i++) {
      console.log(list[i]);
      const fileType = list[i].type.split('/')[0];
      console.log(fileType);
      const nameList = list[i].name.split('.');
      const type = nameList[nameList.length - 1];
      // console.log(imgs);
      // imgs.onload = async () => {
      // console.log(imgs.width, imgs.height);
      const chatNames: any = localStorage.getItem('toChatName');
      let clientmessage = {};
      if (chatType === 'chat') {
        clientmessage = {
          fromName: myLocName,
          toName: chatNames,
          type: chatType,
        };
      } else {
        //群聊
        let toChatNames = JSON.parse(chatNames),
          fromChat: any = null;
        for (let i = 0; i < toChatNames.length; i++) {
          fromChat += toChatNames[i].name * 1;
        }
        fromChat = nickNameTop + fromChat.toString();
        clientmessage = {
          groupName: groupName,
          type: chatType,
        };
      }
      await send({
        file: false,
        fileName: '',
        fileType: fileType,
        fileClass: type,
        size: '',
        index: dateTime + i,
        url: '',
      });
      if (
        fileType === 'application' ||
        fileType === 'text' ||
        fileType === 'video' ||
        fileType === 'audio'
      ) {
        const formDate = new FormData();
        const reader = new FileReader();
        let dataUrl = '';
        const isDebug: any =
          !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        reader.onload = (e: any) => {
          // console.log(e.total);
          let size: any = 0;
          if (e.total <= 1024) {
            size = `${e.total}B`;
          } else {
            size = e.total / 1024;
            if (size <= 1024) {
              size = `${size.toFixed(2)}K`;
            } else {
              size = size / 1024;
              if (size <= 1024) {
                size = `${size.toFixed(2)}M`;
              } else {
                size = size / 1024;
                if (size <= 1024) {
                  size = `${size.toFixed(2)}G`;
                } else {
                  size = `${(size / 1024).toFixed(2)}T`;
                }
              }
            }
          }

          dataUrl = e.target.result;

          // console.log(list[0].name, dataUrl);
          formDate.append('file', 'true');
          formDate.append('classIcon', dataUrl);
          formDate.append('imgId', dateTime + i);
          formDate.append('fileName', nameList[0]);
          formDate.append('type', type);
          formDate.append('size', size);
          formDate.append('fileType', fileType);
          formDate.append('clientmessage', JSON.stringify(clientmessage));
          if (isDebug) {
            formDate.append('isDebug', isDebug);
          }
          onUploadProgress.onUploadProgress = (progressEvent) => {
            let complete =
              (((progressEvent.loaded / progressEvent.total) * 100) | 0) + '%';
            console.log('上传=====>>>>', complete);
            setProgress(complete);
          };
          fileUpload(formDate).then((res: any) => {
            // console.log(res);
            if (res.code === 200) {
              getList('');
              window.socket.emit('clientmessage', {
                //只作为文件上传完成使用
                uploadCompleted: true,
              });
            }
          });
        };
        reader.readAsBinaryString(list[0]);
      } else {
        const datas: any = await UploadImg(
          list[i],
          dateTime + i,
          type,
          clientmessage,
          fileType
        );
        // console.log(datas);
        if (datas.code === 200) {
          getList('');
          window.socket.emit('clientmessage', {
            //只作为图片上传完成使用
            uploadCompleted: true,
          });
        }
        // };
        // const formDate = new FormData();
        // formDate.append("imgId", list[i]);
      }
    }
    setDeleteFl(!deleteFl);
  };

  // // const domS = <div>{progress}</div>;
  // const domS = document.createElement('div');
  // domS.style.width = '10px';
  // domS.innerText = 'progress';
  // if (texts.current) {
  //   texts.current.append(domS);
  //   // console.log(texts.current);
  // }

  return (
    <div className="yijian" onClick={tabsHid}>
      <div className="searchBox">
        <div className="home-search">
          <img
            className="xiangmu-left"
            src="/images/fanhui.png"
            alt=""
            onClick={goBackS}
          />
          <span className="toNames">
            {nickNameTop ? nickNameTop : localStorage.getItem('toNames')}
          </span>
          {chatType === 'groupChat' ? (
            <img
              className="xiangmu-rigth"
              src="/images/dashujukeshihuaico.png"
              alt=""
              onClick={tabs}
            />
          ) : (
            ''
          )}
          <ul
            className={`${tabShow && chatType === 'groupChat' ? 'show' : ''}`}
          >
            <li onClick={() => options(1)}>查看所有成员</li>
            <li onClick={() => options(2)}>添加成员</li>
            {myLocName !== groupOwner ? (
              <li className="groupOwner_log" onClick={() => options(3)}>
                退出本群
              </li>
            ) : (
              <>
                <li className="groupOwner" onClick={() => options(4)}>
                  转让退出本群
                </li>
                <li className="groupOwner" onClick={() => options(5)}>
                  移除本群
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="content-text" id="contentTexte" ref={contentScroll}>
        <div
          className={`box boxTexte ${
            expressionShow || addAnothers ? 'boxTexteB' : ''
          }`}
          id="box"
          ref={boxTextes}
        >
          {/* {contentList} */}
        </div>
        {shuruShow ? (
          <div className="shuru border-top" id="shuru">
            <ul>
              <li>
                <img
                  className="voice"
                  src={`/images${
                    voiceSotten ? '/shoufeijianpan.png' : '/shurufayuyin.png'
                  }`}
                  alt=""
                  onClick={voices}
                />
                {voiceSotten ? (
                  <div className="voice_botten">
                    <div className="voice_botten_text">按住&nbsp;说话</div>
                  </div>
                ) : (
                  <p
                    ref={texts}
                    placeholder="请详输入内容..."
                    id="texts"
                    className="mint-field-core"
                    onClick={onchange}
                    onInput={contenteditable}
                  ></p>
                )}
                <img
                  className="expressions"
                  src={`/images/${
                    expressionShow
                      ? 'shoufeijianpan.png'
                      : 'shurufaxiaolian.png'
                  }`}
                  alt=""
                  onClick={expressions}
                />
                <div
                  className="fasong"
                  style={{ background: `${inputContent ? '#ff7a59' : ''}` }}
                >
                  {inputContent ? (
                    <span onClick={() => send()}>发送</span>
                  ) : (
                    <img
                      onClick={addsAnother}
                      src="/images/tianjiaqunchengyuan.png"
                      alt=""
                    />
                  )}
                </div>
              </li>
            </ul>
            <div
              className={`expression ${
                expressionShow
                  ? 'expressionB'
                  : addAnothers
                  ? 'addsAnotherShow'
                  : ''
              }`}
            >
              <div className="expressionList">
                {expressionShow ? (
                  expressionD()
                ) : (
                  <OtherItems setFileList={setFileList} deleteFl={deleteFl} />
                )}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className={`tanCeng ${tanCengShow ? 'tanCengShow' : ''}`}>
        <div className="tanCeng_cont">
          <div className="tanCeng_cont_top">请选择转让群主</div>
          <div className="tanCeng_cont_box">
            <div className="tanCeng_cont_box_tex">
              <CheckList defaultValue={checkListvalue} onChange={onChange}>
                {imgIdLoc.map((item: any, index: number) => {
                  if (item.name === myLocName) {
                    return null;
                  }
                  return (
                    <CheckList.Item key={index} value={item.name}>
                      <div className="content-food border-bottom">
                        <div>
                          <div className="imgas">
                            <p>
                              <img
                                className="border"
                                src={item.classIcon}
                                alt=""
                              />
                            </p>
                          </div>
                          <span className="first">{item.nickName}</span>
                        </div>
                      </div>
                    </CheckList.Item>
                  );
                })}
              </CheckList>
            </div>
          </div>
          <div className="tanCeng_cont_bottom">
            <span onClick={Sure}>确定</span>
            <span onClick={Cancel}>取消</span>
          </div>
        </div>
      </div>
      <ImageViewer
        image={fileUrl}
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
      />
      {dataListL && (
        <Spins styleSize={[65, 33]} color={'#ff7a59'} fontSize={'33px'} />
      )}
      {onPlayUrl && (
        <div className="video-style">
          <video
            id="vdo"
            className="videos"
            controls={true}
            autoPlay={true}
            // name="media"
            // muted="muted"
            onClick={videoPlays}
          >
            <source src={`${onPlayUrl}`} type="" />
          </video>
          <div onClick={videoPlays} className="video-closure">
            <CloseCircleOutline className="video-closure-icon" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
