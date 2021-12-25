import { remo, local } from '../../api';
import React, { useEffect, useRef, useState } from 'react';

let timer: any = null;
const VideoCallPlay = ({
  call,
  onStartQuery,
  videoCallCancel,
  actionName,
  onFinish,
  chatNames,
}: any) => {
  // 传输视频，不传输音频
  const [mediaStreamConstraints, setMediaStreamConstraints] = useState({
    video: true,
    audio: true,
  });
  const [actionNames, setActionNames] = useState('');
  const [start, setStart] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const localVideo: any = useRef();
  const remoteVideo: any = useRef();
  let localPeerConnection: any = null;
  let transceiver: any = null;
  var webcamStream: any = null;

  useEffect(() => {
    if (onStartQuery && call) {
      startIntervals();
    }
  }, []);

  useEffect(() => {
    setActionNames(actionName);
  }, [actionName]);

  useEffect(() => {
    if (onFinish) {
      clearIntervals();
    }
  }, [onFinish]);

  const onActionName = () => {
    console.log(actionNames);
    if (actionNames === '切换语音') {
      console.log(actionNames);
      setActionNames('静音');
      setMediaStreamConstraints({
        video: false,
        audio: true,
      });
    } else if (actionNames === '静音') {
      setActionNames('开启声音');
      setMediaStreamConstraints({
        video: false,
        audio: false,
      });
    } else if (actionNames === '开启声音') {
      setActionNames('静音');
      setMediaStreamConstraints({
        video: false,
        audio: true,
      });
    }
  };

  const startIntervals = () => {
    if (!call) {
      setStart(true);
    }
    startQuery(); // 开始呼叫
    startAction(); // 点击调用 获取本地视频
  };

  const clearIntervals = () => {
    clearInterval(timer); // 关闭
    localVideo.current.srcObject?.getTracks()[0]?.stop();
    localVideo.current.srcObject?.getTracks()[1]?.stop();
    // remoteVideo.current.srcObject.getTracks()[1].stop();
    localPeerConnection = null;
    transceiver = null;
    webcamStream = null;
    if (!start) {
      if (call) {
        if (callStarted) {
          videoCallCancel();
        } else {
          videoCallCancel('取消通话');
        }
      } else {
        videoCallCancel('拒绝通话！');
      }
    } else {
      videoCallCancel();
    }
  };

  // 这个方法循环去请求去GET
  const startQuery = () => {
    timer = setInterval(function () {
      console.log('这个方法循环去请求去');
      remo({ chatNames }).then((res: any) => {
        if (res === '无数据' || res === '') {
        } else {
          console.log('这个方法循环去请求去===>>>>', res);
          setCallStarted(true);
          // let msg = JSON.parse(res)
          let msg = res;
          // 做检测
          chackData(msg);
        }
      });
    }, 1000);
  };

  // 检测函数
  const chackData = (msg: any) => {
    console.log('收到-远端-type' + msg.MessageType);
    switch (msg.MessageType) {
      case '1':
        handleVideoOfferMsg(msg);
        break;
      case '2':
        handleVideoAnswerMsg(msg);
        break;
      case '3':
        handleNewICECandidateMsg(msg);
        break;
    }
  };

  // 返回需要发送的数据
  const sendDataByType = (type: any) => {
    console.log(localPeerConnection.localDescription.sdp);
    let obj: any = {
      Data: localPeerConnection.localDescription.sdp,
      IceDataSeparator: ' ',
    };
    switch (type) {
      case 'Offer':
        obj.MessageType = '1';
        break;
      case 'Answer':
        obj.MessageType = '2';
        break;
    }
    return obj;
  };

  // 收到别的 offer 需要调用post发送 内容
  const handleVideoOfferMsg = async (msg: any) => {
    console.log('远端-收到offer');
    if (!localPeerConnection) {
      createPeerConnection();
    }
    let obj: any = {
      type: 'offer',
      sdp: msg.Data,
    };
    var desc = new RTCSessionDescription(obj);
    localPeerConnection.setRemoteDescription(desc);

    if (!webcamStream) {
      try {
        // 播放本地视频
        webcamStream = await navigator.mediaDevices.getUserMedia(
          mediaStreamConstraints
        );
        console.log('--------本地的被动视频流---------');
        if (localVideo) {
          localVideo.current.srcObject = webcamStream;
        }
        console.log(webcamStream);
      } catch (err) {
        handleGetUserMediaError(err);
        return;
      }
      try {
        webcamStream.getTracks().forEach(
          (transceiver = (track: any) =>
            localPeerConnection.addTransceiver(track, {
              streams: [webcamStream],
            }))
        );
      } catch (err) {
        handleGetUserMediaError(err);
      }
    }
    await localPeerConnection.setLocalDescription(
      await localPeerConnection.createAnswer()
    );
    console.log(localPeerConnection);
    // 调用 post 请求 回复
    /////////////////////////////////////////////////
    let objs = sendDataByType('Answer');
    startPost(objs);
  };

  // 收到answer
  const handleVideoAnswerMsg = async (msg: any) => {
    console.log('收到answer');
    let obj: any = {
      type: 'answer',
      sdp: msg.Data,
    };
    var desc = new RTCSessionDescription(obj);
    console.log(desc);
    await localPeerConnection.setRemoteDescription(desc).catch();
  };

  // 收到ice
  const handleNewICECandidateMsg = async (msg: any) => {
    console.log(msg);
    let arr = msg.Data.split(msg.IceDataSeparator);
    console.log(arr);
    let obj = {
      candidate: arr[0],
      sdpMid: arr[1],
      sdpMLineIndex: arr[2],
    };
    var candidate = new RTCIceCandidate(obj);
    try {
      await localPeerConnection.addIceCandidate(candidate);
    } catch (err) {
      console.log('iec 调用失败');
      console.log(err);
    }
  };

  // post请求方法
  const startPost = (obj: any) => {
    console.log(obj);
    local(obj).then((res: any) => {});
  };

  // 获取本地视频
  const startAction = async () => {
    // startButton.disabled = true;
    createPeerConnection();

    try {
      // 播放本地视频
      webcamStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints
      );
      console.log('--------本地的---------');
      if (localVideo) {
        localVideo.current.srcObject = webcamStream;
      }
      console.log(webcamStream);
    } catch (err) {
      handleGetUserMediaError(err);
      return;
    }
    try {
      webcamStream.getTracks().forEach(
        (transceiver = (track: any) =>
          localPeerConnection.addTransceiver(track, {
            streams: [webcamStream],
          }))
      );
    } catch (err) {
      handleGetUserMediaError(err);
    }
  };

  const createPeerConnection = async () => {
    localPeerConnection = new RTCPeerConnection();
    localPeerConnection.onicecandidate = handleICECandidateEvent;
    localPeerConnection.ontrack = handleTrackEvent;
    localPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
  };

  const handleICECandidateEvent = (event: any) => {
    console.log('准备回调ice事件');
    console.log(event.candidate);
    if (event.candidate) {
      let obj = {
        Data:
          event.candidate.candidate +
          '|' +
          event.candidate.sdpMid +
          '|' +
          event.candidate.sdpMLineIndex,
        MessageType: 3,
        IceDataSeparator: '|',
      };
      startPost(obj);
    }
  };

  const handleTrackEvent = (event: any) => {
    const mediaStream = event.streams[0];
    if (remoteVideo) {
      remoteVideo.current.srcObject = mediaStream;
    }
    // remoteStream = mediaStream;
  };

  const handleNegotiationNeededEvent = async () => {
    console.log('进入 createOffer()');
    try {
      const offer = await localPeerConnection.createOffer();
      await localPeerConnection.setLocalDescription(offer);
      let obj = sendDataByType('Offer');
      console.log(obj);
      startPost(obj);
    } catch {}
  };

  const handleGetUserMediaError = (e: any) => {
    console.log(e);
    switch (e.name) {
      case 'NotFoundError':
        alert(
          'Unable to open your call because no camera and/or microphone' +
            'were found.'
        );
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert('Error opening your camera and/or microphone: ' + e.message);
        break;
    }
  };

  return (
    <div className="videoCall">
      <video
        id="localVideo"
        autoPlay={true}
        // playsinline
        ref={localVideo}
      ></video>
      <div className="videoCall-button">
        {
          <>
            <div className="videoCall-switch-box">
              <div className="videoCall-cancel" onClick={clearIntervals}>
                {call && !callStarted ? '取消' : '挂断'}
              </div>
            </div>
            <div className="videoCall-switch-box">
              {start || call ? (
                <div
                  className="videoCall-cancel-center"
                  onClick={clearIntervals}
                >
                  关闭
                </div>
              ) : (
                <div
                  className="videoCall-cancel-center videoCall-cancel-center-srart"
                  onClick={startIntervals}
                >
                  接听
                </div>
              )}
            </div>
            <div className="videoCall-switch-box">
              <div className="videoCall-switch" onClick={onActionName}>
                {actionNames}
              </div>
            </div>
          </>
        }
      </div>
      <div className="videoCall-vice">
        <video
          id="remoteVideo"
          autoPlay={true}
          // playsinline
          ref={remoteVideo}
        ></video>
      </div>
    </div>
  );
};
export default VideoCallPlay;
