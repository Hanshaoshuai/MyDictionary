import './index.scss';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { ActionSheet, Button, Dialog, Space, Toast } from 'antd-mobile';
import VideoCallPlay from './videoCallPlay';
import { MyContext } from '../../models/context';

let VideoCallPlayCall: any = null;
const OtherItems = ({
  setFileList,
  deleteFl,
  boxDom,
  onSetVideoCalls,
}: any) => {
  const { messages } = useContext(MyContext);

  const fs: any = useRef(null);
  const fs1: any = useRef(null);
  const [visible, setVisible] = useState(false);

  const [myLocName] = useState<any>(localStorage.getItem('name'));
  const [toChatName] = useState<any>(localStorage.getItem('toChatName'));

  // const [onStartAction, setOnStartAction] = useState(false);
  // const [onStartQuery, setOnStartQuery] = useState(false);
  // const [clearIntervals, setClearIntervals] = useState(false);

  // let localVideoRef: any = null;
  // let remoteVideoRef: any = null;

  useEffect(() => {
    if (fs && fs1) {
      fs.current.value = null;
      fs1.current.value = null;
    }
  }, [deleteFl]);

  const photoAlbum = () => {
    console.log('e.target.value');
  };
  const documents = () => {
    console.log('e.target.value');
  };
  const videoCall = () => {
    console.log('e.target.value');
    setVisible(true);
  };

  const mockUpload = (file: any) => {
    const fileList = file.target.files;
    // console.log(fileList);
    setFileList(fileList);
  };

  const actions: any = [
    { text: '视频', key: 'startVideo' },
    { text: '语音', key: 'startVoice' },
    {
      text: '取消',
      key: 'delete',
      onClick: async () => {
        setVisible(false);
      },
    },
  ];

  const onAction = (action: any) => {
    setVisible(false);
    if (action.key === 'delete') return;
    let actionKey = '';
    if (action.key === 'startVideo') {
      actionKey = '视频';
      onSetVideoCalls('切换语音');
    } else if (action.key === 'startVoice') {
      actionKey = '语音';
      onSetVideoCalls('静音');
    }

    window.socket.emit('clientmessage', {
      fromName: myLocName,
      toName: toChatName,
      text: actionKey,
      VideoAndVoice: actionKey,
    });
  };

  return (
    <div className="otherItems">
      <div className="otherItemsList" onClick={photoAlbum}>
        <label>
          <p>
            <input
              onChange={(files: any) => mockUpload(files)}
              style={{ display: 'none' }}
              type="file"
              name=""
              multiple
              ref={fs}
              accept="image/*, video/*"
            />
            <img src="" alt="" />
          </p>

          <span>相册</span>
        </label>
      </div>
      <div className="otherItemsList" onClick={documents}>
        <label>
          <p>
            <input
              onChange={(files: any) => mockUpload(files)}
              style={{ display: 'none' }}
              type="file"
              name=""
              multiple
              ref={fs1}
              accept="text/*, application/*, audio/*,"
            />
            <img src="" alt="" />
          </p>
          <span>文件</span>
        </label>
      </div>
      <div className="otherItemsList" onClick={videoCall}>
        <label>
          <p>
            <img src="" alt="" />
          </p>
          <span>视频通话</span>
        </label>
      </div>
      <ActionSheet
        visible={visible}
        actions={actions}
        onClose={() => setVisible(false)}
        onAction={(action) => onAction(action)}
        // afterClose={() => {
        //   Toast.show('动作面板已关闭');
        // }}
      />
    </div>
  );
};

export default OtherItems;
