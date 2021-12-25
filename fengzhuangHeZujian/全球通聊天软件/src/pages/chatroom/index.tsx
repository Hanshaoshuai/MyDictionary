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
import { FileUpload } from '../A-components/fileUpload';
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
import VideoCallPlay from './videoCallPlay';

let Flength = 0;
let dateTimes: any = '';
let domKeys = 0;
let textName = 0;
let textName_1 = 0;
let nickNames = '';
let domListL: any = [];
let toChatNameLength = 0;
let locComplete: any = '';
const ChatList = () => {
  const chatNames: any = localStorage.getItem('toChatName');
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

  const [videoCalls, setVideoCalls] = useState(false);
  const [call, setCall] = useState(false);
  const [actionName, setActionName] = useState('切换语音');
  const [onFinish, setOnFinish] = useState(false);

  useEffect(() => {
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
    console.log(messages);
    if (firstEntry) {
      messageVariety(messages);
    }
    setFirstEntry(true);

    if (
      messages?.text?.VideoAndVoice === '视频' &&
      messages?.text?.toName === myLocName
    ) {
      setVideoCalls(true);
    } else if (
      messages?.text?.VideoAndVoice === '语音' &&
      messages?.text?.toName === myLocName
    ) {
      setVideoCalls(true);
      setActionName('静音');
    } else if (
      messages?.text?.VideoAndVoice === '通话结束' &&
      messages?.text?.toName === myLocName
    ) {
      setOnFinish(true);
    }
  }, [messages]);

  useEffect(() => {
    const videoRef: any = document.getElementById('vdo') || false;
    if (!videoRef) return;
    videoRef.play() as any;
    setplays(true);
  }, [onPlayUrl]);

  const onSetVideoCalls = (text: string) => {
    setCall(true);
    setVideoCalls(true);
    setActionName(text);
    setExpressionShow(false);
    setAddAnothers(false);
  };

  const videoCallCancel = (text: string) => {
    setVideoCalls(false);
    setOnFinish(false);
    if (onFinish) return;
    window.socket.emit('clientmessage', {
      fromName: myLocName,
      toName: toChatName,
      text: `${text ? text : '通话结束'}`,
      VideoAndVoice: '通话结束',
    });
  };

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
        newList.push(FasongShijian());
        if (data.text.text.friends === 'yes') {
          newList.push(
            TishiNeirong('你通过了对方的好友验证请求，现在可以开始聊天啦😄')
          );
          setContentList(newList);
        } else if (data.text.text.friend === 'no') {
          newList.push(
            TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
          );
          setContentList(newList);
        } else if (data.text.text.friends === 'no') {
          newList.push(TishiNeirong('您拒绝了对方的好友验证请求！'));
          setContentList(newList);
        } else {
          newList.push(My('', data.text.text, data.text.file));
          setContentList(newList);
          // console.log("11111-", newList, contentList);
        }
        return;
      } else if (
        data.text.fromName === myLocName &&
        data.text.toName !== '' &&
        data.text.toName !== myLocName
      ) {
        // console.log("111-", data.text);
        newList.push(FasongShijian());
        newList.push(My('', data.text.text, data.text.file));
        setContentList(newList);
        return;
      } else if (
        data.text.toName === myLocName &&
        data.text.fromName === window.localStorage.getItem('toChatName')
      ) {
        // console.log("222-", data.text);
        newList.push(FasongShijian());
        clearNumber(data.text.fromName, data.text.toName);
        if (data.text.text.friends === 'yes') {
          // $(".shuru").show();
          newList.push(TishiNeirong(data.text.text.text));
          setContentList(newList);
          setShuruShow(true);
        } else if (data.text.text.friend === 'no') {
          newList.push(
            You(
              'yes',
              '',
              '😄来自' + data.text.fromName + '的好友验证请求，是否同意！'
            )
          );
          setContentList(newList);
          // $(".shuru").hide();
          setShuruShow(false);
        } else {
          if (data.text.text.friends === 'no') {
            newList.push(
              You(
                'yes',
                'no',
                '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
                'no'
              )
            );
            setContentList(newList);
          } else {
            newList.push(
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
            setContentList(newList);
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
        newList.push(FasongShijian());
        setContentList(newList);
        if (data.text.text_first) {
          newList.push(TishiNeirong(data.text.text));
          setContentList(newList);
        } else {
          let imgs = '';
          imgIdLoc.map((item: any) => {
            if (item.name === data.text.fromName) {
              imgs = item.classIcon;
            }
            return item;
          });
          newList.push(
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
          setContentList(newList);
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
    domKeys += 1;
    const timeHour = new Date().getTime();
    if (timeHour - dateTimes < 100000) {
      // console.log(timeHour - dateTimes);
      dateTimes = timeHour;
      return;
    }
    dateTimes = timeHour;

    const style: any = {};
    style.fontSize = 0;
    style.padding = '0.2rem 0';
    style.textAlign = 'center';
    style.width = '82%';
    style.margin = '0px auto';
    const style1: any = {};
    style1.color = '#fff';
    style1.fontSize = '0.32rem';
    style1.background = '#cfced2';
    style1.display = 'inline-block';
    style1.padding = '0 0.12rem';
    style1.borderRadius = '0.08rem';
    style1.margin = '0';

    return (
      <div key={domKeys} style={style}>
        <p style={style1}>{ChushiHuaTimes()}</p>
      </div>
    );
    // contentTexte.scrollTop=contentTexte.scrollHeight;  //滚动条始终在下面
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
    if (text === 'no') {
      return;
    }
    domKeys += 1;
    const style1: any = {};
    style1.color = '#fff';
    // style1.lineHeight = "0.44rem";
    style1.fontSize = '0.32rem';
    style1.background = '#cfced2';
    style1.display = 'inline-block';
    style1.padding = '0 0.12rem';
    style1.borderRadius = '0.08rem';
    style1.wordWrap = 'break-word';

    const style: any = {};
    style.fontSize = '0';
    style.width = '82%';
    style.margin = '0 auto';
    style.padding = '0.2rem 0';
    style.textAlign = 'center';
    return (
      <div key={domKeys} style={style}>
        <span style={style1}>{times}</span>
      </div>
    );
  };

  const TishiNeirong = (texts: string) => {
    domKeys += 1;
    //或其他公告提示信息
    return (
      <div
        key={domKeys}
        style={{
          width: '82%',
          fontSize: '0',
          margin: '0 auto',
          padding: '0.2rem 0',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: '#b4b4b4',
            lineHeight: '0.4rem',
            fontSize: '0.32rem',
            wordWrap: 'break-word',
          }}
        >
          {texts}
        </span>
      </div>
    );
  };

  const HuanquSenqing = (cont: string, DianJi: string | number, type: any) => {
    //换名片和发送项目申请提示处理函数
    domKeys += 1;
    const locFromName = window.localStorage.getItem('fromName');
    const myName = window.localStorage.getItem('name');

    const style: any = {
      width: '4.04rem',
      margin: '0 auto',
      minHeight: '1.26rem',
      position: 'relative',
      background: '#fff',
    };

    const style1: any = {};
    style1.lineHeight = '0.42rem';
    style1.fontSize = '0.32rem';
    style1.wordWrap = 'break-word';
    style1.padding = '0 0 0.72rem 0';
    style1.color = '#07111B';
    style1.margin = '0px';

    const style2: any = {
      position: 'absolute',
      fontSize: '0.32rem',
      display: 'inline-block',
      left: '0',
      bottom: '0',
      color: mingSpanC,
      width: '46%',
      height: '0.62rem',
      borderRadius: '0.08rem',
      background: mingSpanB,
      lineHeight: '0.62rem',
      textAlign: 'center',
    };

    let i = 0;
    if (DianJi === 1 || DianJi === 'yes') {
      i = 1;
      style2.color = '#000000';
      style2.background = '#f5f4f9';
    }
    const agrees = () => {
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

    const style3: any = {};
    style3.position = 'absolute';
    style3.fontSize = '0.32rem';
    style3.right = '0';
    style3.bottom = '0';
    style3.width = '46%';
    style3.height = '0.62rem';
    style3.borderRadius = '0.08rem';
    style3.background = '#f5f4f9';
    style3.lineHeight = '0.62rem';
    style3.textAlign = 'center';

    const refuses = () => {
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
    return (
      <div key={domKeys} style={style}>
        <p style={style1}>{cont}</p>
        <span ref={agreess} style={style2} onClick={agrees}>
          {type === 'no' ? '是' : '同意'}
        </span>
        <span style={style3} onClick={refuses}>
          {type === 'no' ? '否' : '拒绝'}
        </span>
      </div>
    );
  };

  const My = (type: any, cont: string, file?: any) => {
    // console.log(file);
    domKeys += 1;
    const style: any = {};
    style.width = '14%';
    style.float = 'left';
    style.overflow = 'hidden';

    const style1: any = {};
    style1.width = '0.76rem';
    style1.height = '0.76rem';
    // style1.border = "0.01rem solid #e7e6e9";
    style1.boxSizing = 'border-box';
    style1.float = 'right';
    style1.overflow = 'hidden';
    style1.borderRadius = '0.08rem';

    const style2: any = {};
    style2.background = '#EAEAEA';
    style2.float = 'right';
    style2.borderRadius = '0.08rem';
    style2.width = '100%';

    const imgStyle: any = { borderRadius: '0.08rem' };
    if (file?.length === 'width') {
      imgStyle.width = '130px';
    } else {
      imgStyle.height = '190px';
    }

    return (
      <div
        key={domKeys}
        className="fankiu-you"
        style={{
          width: '92%',
          margin: '0 auto',
          textAlign: 'justify',
          lineHeight: '0.4rem',
          overflow: 'hidden',
          padding: '0.1rem 0',
        }}
      >
        <div
          className="fankiu-text clearbox"
          style={{ width: '86%', float: 'left', position: 'relative' }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: `${file ? '0' : '0.16rem 0.2rem'}`,
              background: `${file ? '' : '#ff7a59'}`,
              color: '#fff',
              float: 'right',
              maxWidth: '77%',
              borderRadius: '0.08rem',
              fontSize: '0.32rem',
              border: '0.01rem solid #e7e6e9',
              wordWrap: 'break-word',
              lineHeight: `${file ? '0' : '0.4rem'}`,
            }}
          >
            {file && !file?.file ? (
              <span
                onLoad={imgsOnLoad}
                style={{
                  color: 'rgba(255, 122, 89)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  fontSize: '0.41rem',
                  background: 'url(/images/tuPianJiaZaiZhong.png)',
                  backgroundSize: '100% 100%',
                  borderRadius: '0.08rem',
                }}
              >
                <>
                  <Loading color="currentColor" />
                  <span
                    id={file.index}
                    style={{
                      fontSize: '13px',
                      lineHeight: '12px',
                    }}
                  >
                    上传中...
                  </span>
                </>
              </span>
            ) : file?.file ? (
              <span
                onLoad={imgsOnLoad}
                style={{
                  color: 'rgba(255, 122, 89)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.08rem',
                  width: `${
                    file?.fileType === 'video'
                      ? '100px'
                      : file?.fileType !== 'image'
                      ? 'auto'
                      : 'auto'
                  }`,
                  height: `${file?.fileType === 'video' ? '100px' : 'auto'}`,
                  minHeight: `${file?.fileType !== 'image' && '42px'}`,
                  fontSize: '0.41rem',
                  background: `${
                    file?.fileType === 'image'
                      ? 'url(/images/tuPianJiaZaiZhong.png)'
                      : file?.fileType === 'video'
                      ? 'rgb(207, 206, 210)'
                      : '#FFF'
                  }`,
                  backgroundSize: '100% 100%',
                }}
              >
                {file?.fileType === 'video' ? (
                  <div
                    style={{
                      padding: '6px',
                      borderRadius: '100%',
                      border: '0.03rem solid rgb(255, 122, 89)',
                    }}
                    onClick={() => onPlay(file.url)}
                  >
                    <PlayOutline />
                  </div>
                ) : file?.fileType === 'image' ? (
                  <img
                    onLoad={imgsOnLoad}
                    style={imgStyle}
                    src={file.apathZoom}
                    alt=""
                    onClick={() => setVisibles(file.url)}
                  />
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: '0.32rem',
                        lineHeight: '0.4rem',
                        padding: '0.16rem 0.2rem',
                        flex: '1',
                        width: '190px',
                      }}
                      onClick={() => fileDownload(file.url)}
                    >
                      {file.url.split('/')[file.url.split('/').length - 1]}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        maxWidth: '60px',
                        overflowWrap: 'break-word',
                        padding: '10px 8px 10px 0',
                      }}
                    >
                      <FileOutline
                        style={{
                          width: '30px',
                          height: '30px',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          lineHeight: '14px',
                          display: 'inline-block',
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        {file.size}
                      </span>
                    </div>
                  </>
                )}
              </span>
            ) : (
              cont
            )}
          </span>
          <div
            style={{
              backgroundSize: '100% 100%',
              position: 'absolute',
              width: '0.16rem',
              height: '0.22rem',
              top: '0.26rem',
              right: '-0.13rem',
            }}
          ></div>
        </div>
        <div className="fankiu-img" style={style}>
          <div style={style1}>
            <img src={Myimg} alt="" style={style2} />
          </div>
        </div>
      </div>
    );
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
    domKeys += 1;
    const style: any = {};
    style.width = '92%'; //样式4
    style.margin = '0 auto';
    style.lineHeight = '0.4rem';
    style.textAlign = 'justify';
    style.display = 'flex';
    style.padding = '0.1rem 0';

    const style3: any = {};
    style3.width = '86%';
    style3.position = 'relative';

    const style4: any = {};
    style4.display = 'inline-block';
    style4.padding = `${file ? '0' : '0.16rem 0.2rem'}`;
    style4.background = `${file ? '' : '#fff'}`;
    style4.lineHeight = `${file ? '0' : '0.4rem'}`;
    style4.maxWidth = '77%';
    style4.borderRadius = '0.08rem';
    style4.fontSize = '0.32rem';
    style4.border = '0.01rem solid #e7e6e9';
    style4.wordWrap = 'break-word';
    style4.float = 'left';

    const style1: any = {};
    style1.width = '14%';
    style1.height = '0.76rem';

    const style2: any = {};
    style2.width = '0.76rem';
    style2.height = '0.76rem';
    // style2.border = "0.01rem solid #e7e6e9";
    style2.boxSizing = 'border-box';
    style2.overflow = 'hidden';
    style2.borderRadius = '0.08rem';
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

    const style6: any = {};
    style6.background = '#EAEAEA';
    style6.borderRadius = '0.08rem';
    style6.float = 'left';
    style6.width = '100%';

    const style5: any = {};
    style5.backgroundSize = '100% 100%';
    style5.position = 'absolute';
    style5.width = '0.16rem';
    style5.height = '0.22rem';
    style5.top = '0.26rem';
    style5.left = '-0.13rem';
    style5.zIndex = '100';

    const style7: any = {};
    style7.fontSize = '0.26rem';
    style7.color = '#07111B';
    style7.lineHeight = '0.2rem';
    style7.padding = '0 0 0.1rem 0.1rem';
    style7.color = 'rgb(180, 180, 180)';

    const imgStyle: any = { borderRadius: '0.08rem' };
    if (file?.length === 'width') {
      imgStyle.width = '130px';
    } else {
      imgStyle.height = '190px';
    }

    if (file) {
      cont = (
        <span>
          {file && !file?.file ? (
            <span
              style={{
                color: 'rgba(255, 122, 89)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url(/images/tuPianJiaZaiZhong.png)',
                backgroundSize: 'cover',
                width: '100px',
                height: '100px',
                fontSize: '0.41rem',
              }}
            >
              <Loading color="currentColor" />
            </span>
          ) : file?.file ? (
            <span
              onLoad={imgsOnLoad}
              style={{
                color: 'rgba(255, 122, 89)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.08rem',
                width: `${
                  file?.fileType === 'video'
                    ? '100px'
                    : file?.fileType !== 'image'
                    ? 'auto'
                    : 'auto'
                }`,
                height: `${file?.fileType === 'video' ? '100px' : 'auto'}`,
                minHeight: `${file?.fileType !== 'image' && '42px'}`,
                fontSize: '0.41rem',
                background: `${
                  file?.fileType === 'image'
                    ? 'url(/images/tuPianJiaZaiZhong.png)'
                    : file?.fileType === 'video'
                    ? 'rgb(207, 206, 210)'
                    : '#FFF'
                }`,
                backgroundSize: '100% 100%',
              }}
            >
              {file?.fileType === 'video' ? (
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '100%',
                    border: '0.03rem solid rgb(255, 122, 89)',
                  }}
                  onClick={() => onPlay(file.url)}
                >
                  <PlayOutline />
                </div>
              ) : file?.fileType === 'image' ? (
                <img
                  onLoad={imgsOnLoad}
                  style={imgStyle}
                  src={file.apathZoom}
                  alt=""
                  onClick={() => setVisibles(file.url)}
                />
              ) : (
                <>
                  <div
                    style={{
                      fontSize: '0.32rem',
                      lineHeight: '0.4rem',
                      padding: '0.16rem 0.2rem',
                      flex: '1',
                      width: '190px',
                    }}
                    onClick={() => fileDownload(file.url)}
                  >
                    {file.url.split('/')[file.url.split('/').length - 1]}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      maxWidth: '60px',
                      overflowWrap: 'break-word',
                      padding: '10px 8px 10px 0',
                    }}
                  >
                    <FileOutline
                      style={{
                        width: '30px',
                        height: '30px',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        lineHeight: '14px',
                        display: 'inline-block',
                        width: '100%',
                        textAlign: 'center',
                      }}
                    >
                      {file.size}
                    </span>
                  </div>
                </>
              )}
            </span>
          ) : (
            cont
          )}
        </span>
      );
    }

    return (
      <div key={domKeys} className="fankiu-my" style={style}>
        <div className="fankiu-img" style={style1}>
          <div style={style2} onClick={onImaF}>
            <img src={newYouimg} alt="" style={style6} />
          </div>
        </div>
        <div className="fankiu-text" style={style3}>
          {type === 'yes' && DianJi ? (
            <>
              <div style={style7}>{myIconName}</div>
              <span style={style4}>{cont}</span>
            </>
          ) : type === 'yes' ? (
            <>
              <span style={style4}>{cont}</span>
              <div style={style5}></div>
            </>
          ) : (
            <span style={style4}>{HuanquSenqing(cont, DianJi, type)}</span>
          )}
        </div>
      </div>
    );
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
          domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          if (item.text.friends === 'yes') {
            setShuruShowL = true;
            domList.push(
              TishiNeirong('你已通过对方的好友验证请求，现在可以开始聊天啦😄')
            );
          } else if (item.text.friend === 'no') {
            domList.push(
              TishiNeirong('您向对方发送了好友验证请求，请耐心等待！')
            );
          } else if (item.text.friends === 'no') {
            domList.push(TishiNeirong('您拒绝了对方的好友验证请求！'));
          } else {
            domList.push(My('', item.text, item.file));
            setShuruShowL = true;
          }
        } else if (chatType === 'groupChat') {
          domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          if (item.text_first) {
            domList.push(TishiNeirong(item.text));
          } else {
            domList.push(My('', item.text, item.file));
          }
          setShuruShowL = true;
        }
      } else if (
        item.fromName === myLocName &&
        item.toName !== '' &&
        item.text.toName !== myLocName
      ) {
        // console.log("222", item.text);
        domList.push(My('', item.text, item.file));
        setShuruShowL = true;
      } else if (item.toName === '' && item.fromName === myLocName) {
      } else if (item.toName === '' && item.fromName !== myLocName) {
        //
      } else if (item.toName === myLocName) {
        // console.log('333',data.body[i]);
        domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
        if (item.text.friend === 'no') {
          if (item.friend === 'yes') {
            domList.push(
              You(
                yes,
                '',
                '😄来自' + item.fromName + '的好友验证请求，是否同意！',
                1
              )
            );
          } else {
            domList.push(
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
            domList.push(
              You(yes, 'yes', item.text.text, false, false, false, item.file)
            );
          } else if (item.text.friends === 'no') {
            domList.push(
              You(
                yes,
                'no',
                '🙁对方拒绝了您的好友验证请求！是否再次添加好友...',
                item.friend
              )
            );
          } else {
            domList.push(
              You(yes, 'yes', item.text, false, false, false, item.file)
            );
            setShuruShowL = true;
          }
        }
      } else if (item.type === 'groupChat') {
        if (item.text_first) {
          domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          domList.push(TishiNeirong(item.text));
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
          domList.push(tousuoGo(moment(item.dateTime), item.dateTimes));
          domList.push(
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
    scrollHeights();
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
        upload(dateTime, i);
        const datas: any = await FileUpload(
          list[i],
          dateTime + i,
          nameList,
          type,
          fileType,
          clientmessage
        );
        if (datas.code === 200) {
          window.socket.emit('clientmessage', {
            //只作为文件上传完成使用
            uploadCompleted: true,
          });
        }
      } else {
        upload(dateTime, i);
        const datas: any = await UploadImg(
          list[i],
          dateTime + i,
          type,
          clientmessage,
          fileType
        );
        // console.log(datas);
        if (datas.code === 200) {
          window.socket.emit('clientmessage', {
            //只作为图片上传完成使用
            uploadCompleted: true,
          });
        }
      }
    }
    setDeleteFl(!deleteFl);
  };
  const upload = (dateTime: any, i: number) => {
    onUploadProgress.onUploadProgress = (progressEvent) => {
      let complete =
        (((progressEvent.loaded / progressEvent.total) * 100) | 0) + '%';
      // console.log('上传=====>>>>', complete);
      if (complete === '100%') {
        complete = '99%';
      }
      const dom: any = document.getElementById(`${dateTime + i}`);
      if (dom) {
        dom.innerHTML = complete;
      }

      // setProgress(complete);
    };
  };

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
          {contentList}
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
                  <OtherItems
                    setFileList={setFileList}
                    deleteFl={deleteFl}
                    boxDom={contentScroll}
                    onSetVideoCalls={onSetVideoCalls}
                  />
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
      {videoCalls && (
        <VideoCallPlay
          call={call}
          onStartQuery={videoCalls}
          videoCallCancel={videoCallCancel}
          actionName={actionName}
          onFinish={onFinish}
          chatNames={chatNames}
        />
      )}
    </div>
  );
};

export default ChatList;
