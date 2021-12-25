import { Button } from 'antd-mobile';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CloseCircleOutline } from 'antd-mobile-icons';
// import banner from "../../../public/images/playground.glb"; // 引入全景图
import './index.scss';

declare global {
  interface Window {
    Cesium?: any;
    viewer?: any;
    ActiveXObject?: any;
    URL_CONFIG?: any;
  }
}
let cameraChangedListener: any = null;
const SuperMap = () => {
  const history = useHistory();
  const infoBoxContainer = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState(true);
  const [switchsVisibility, setSwitchsVisibility] = useState(false);
  const [switchsX, setSwitchsX] = useState(0);
  const [switchsY, setSwitchsY] = useState(0);
  const [titles, setTitles] = useState<any>({});
  const [resets, setResets] = useState(false);
  const [fullScreen, setFullScreen] = useState<any>(true);

  const [markerList] = useState<any>([
    { id: 0, name: '标点', longitude: 910, latitude: 170, height: 330000 },
    { id: 1, name: '标点1', longitude: 920, latitude: 180, height: 330000 },
    { id: 2, name: '标点2', longitude: 900, latitude: 180, height: 330000 },
  ]);

  useEffect(() => {
    const renderer = document.getElementById('cesiumContainer');
    if (window.Cesium) {
      if (window.viewer?.imageryLayers.length > 1) {
        window.viewer.imageryLayers.removeAll();
      }

      let viewer = new window.Cesium.Viewer('cesiumContainer', {
        //初始化
        terrainProvider: new window.Cesium.CesiumTerrainProvider({
          url: 'http://{s}/realspace/services/3D-dixingyingxiang/rest/realspace/datas/DatasetDEM',
          isSct: true,
          subdomains: ['www.supermapol.com'],
          invisibility: true,
        }),
        selectionIndicator: false, //关闭默认高亮
      });
      window.viewer = viewer;
      console.log(viewer);
      markerList[0] &&
        markerList.forEach((item: any) => {
          viewer.entities.removeById(item.id);
          viewer.entities.add({
            // 添加自定义坐标点
            id: item.id,
            show: true,
            position: window.Cesium.Cartesian3.fromDegrees(
              item.longitude,
              item.latitude,
              item.height
            ),
            billboard: {
              image:
                item.state === 'operation'
                  ? '/images/user__easyico.png'
                  : '/images/user__easyico.png',
              width: 44,
              height: 50,
              pixelOffset: new window.Cesium.Cartesian2(0, -30),
            },
            name: item.name,
            label: new window.Cesium.LabelGraphics({
              text: item.name,
              font: '14px sans-serif bold',
              // pixelOffset: new Cesium.Cartesian2(0, 30),
              distanceDisplayCondition: {
                near: 100,
                far: 1500000,
              },
            }),
            description: '',
          });
        });
      if (viewer.scene) {
        console.log(viewer.scene);
        setClickEvent(viewer.scene);
      }
      //视角变更监控
      cameraChangedListener =
        viewer.camera.changed.addEventListener(cameraChangeListener);
    }

    if (renderer) {
      renderer.ondblclick = (e: any) => {
        if (e && !history?.location) {
          setVisibility(false);
        }
      };
    }
    return () => {
      cameraChangedListener && cameraChangedListener();
    };
  }, []);

  useEffect(() => {
    if (window.viewer?.imageryLayers.length >= 1) {
      // window.viewer.imageryLayers.removeAll();
      window.viewer.camera.flyTo({
        // 可以初始化视角
        destination: window.Cesium.Cartesian3.fromDegrees(
          954390.6508635766,
          3330021.765306049,
          20000000 // 视角深度
        ),
        orientation: {
          // 地球相对窗口方向位置
          heading: 10,
          pitch: -1.58,
          roll: 2.708944180085382e-13,
        },
        duration: 4,
      });
    }
  }, [resets]);
  const setClickEvent = (scene: any) => {
    const handler = new window.Cesium.ScreenSpaceEventHandler(scene.canvas); // 监听点击事件
    if (handler.setInputAction) {
      handler.setInputAction((evt: any) => {
        const pick = scene.pick(evt.position); // 自定义坐标点数据
        var position = scene.pickPosition(evt.position); // 地图坐标
        console.log(evt, position, pick);
        if (pick?.id) {
          if (infoBoxContainer && infoBoxContainer.current) {
            infoBoxContainer.current.id = pick.id.id;
          }
          setSwitchsX(evt.position.x); // 自定义坐标点相对屏幕像素x
          setSwitchsY(evt.position.y); // 自定义坐标点相对屏幕像素y
          setTitles(pick?.id);
          setSwitchsVisibility(true);
        }
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  };
  const cameraChangeListener = () => {
    // console.log(infoBoxContainer?.current?.style.display);
    if (
      infoBoxContainer &&
      infoBoxContainer.current &&
      infoBoxContainer.current.style.display === 'block'
    ) {
      const scene = window.viewer.scene;
      const entity = window.viewer.entities.getById(
        infoBoxContainer.current.id
      );
      const Cartesian3 = entity.position._value;
      const position = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        scene,
        Cartesian3
      );
      // console.log(position);
      setSwitchsX(position.x - 19); // 自定义坐标点相对屏幕像素x
      setSwitchsY(position.y - 19); // 自定义坐标点相对屏幕像素y
    }
  };
  const realspace = () => {
    // window.viewer.scene.open(
    //   'http://www.supermapol.com/realspace/services/3D-CBD/rest/realspace'
    // );
    setSwitchsVisibility(false);
    // var promise = window.viewer.scene.open(
    //   'http://{s}/realspace/services/3D-NewCBD/rest/realspace',
    //   undefined,
    //   {
    //     subdomains: ['www.supermapol.com'],
    //   }
    // );
    // window.viewer.flyTo(promise);

    var imageLayer = window.viewer.imageryLayers.addImageryProvider(
      new window.Cesium.SuperMapImageryProvider({
        url: 'http://{s}/realspace/services/3D-dixingyingxiang/rest/realspace/datas/MosaicResult',
        subdomains: ['www.supermapol.com'],
        // url: 'https://dev.virtualearth.net',
        // mapStyle: window.Cesium.BingMapsStyle.AERIAL,
        // key: window.URL_CONFIG.BING_MAP_KEY,
      })
    );
    window.viewer.flyTo(imageLayer);
  };
  const reset = () => {
    setResets(!resets);
  };
  const switchs = () => {
    setSwitchsVisibility(false);
  };
  const onFullScreen = () => {
    if (fullScreen) {
      fullScreens();
    } else {
      exitScreen();
    }
    setFullScreen(!fullScreen);
  };
  //全屏
  const fullScreens = () => {
    var el: any = document.documentElement;
    var rfs =
      el.requestFullScreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullScreen;

    //typeof rfs != "undefined" && rfs
    if (rfs) {
      rfs.call(el);
    } else if (typeof window.ActiveXObject !== 'undefined') {
      //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
      var wscript = new window.ActiveXObject('WScript.Shell');
      if (wscript != null) {
        wscript.SendKeys('{F11}');
      }
    }
  };
  //退出全屏
  const exitScreen = () => {
    var el: any = document;
    var cfs =
      el.cancelFullScreen ||
      el.webkitCancelFullScreen ||
      el.mozCancelFullScreen ||
      el.exitFullScreen;

    //typeof cfs != "undefined" && cfs
    if (cfs) {
      cfs.call(el);
    } else if (typeof window.ActiveXObject !== 'undefined') {
      //for IE，这里和fullScreen相同，模拟按下F11键退出全屏
      var wscript = new window.ActiveXObject('WScript.Shell');
      if (wscript != null) {
        wscript.SendKeys('{F11}');
      }
    }
  };
  const cesiumContainerNone = () => {
    setVisibility(false);
  };
  return (
    <div
      className="cesiumContainer-box"
      style={{ display: `${visibility ? 'block' : 'none'}` }}
    >
      <div className="switch switch-box" onClick={cesiumContainerNone}>
        <CloseCircleOutline className="video-closure-icon" />
      </div>
      <div id="cesiumContainer" className="cesiumContainer"></div>
      <div className="cesiumContainer-button">
        <Button className="button" color="primary" onClick={realspace}>
          添加S3M图层
        </Button>
        <Button className="button" color="primary" onClick={reset}>
          重置
        </Button>
        <Button className="button" color="primary" onClick={onFullScreen}>
          {fullScreen ? '全屏' : '小屏'}
        </Button>
      </div>
      <div
        ref={infoBoxContainer}
        className="pop-ups"
        style={{
          display: `${switchsVisibility ? 'block' : 'none'}`,
          width: '410px',
          height: 'auto',
          top: `${switchsY + 19}px`,
          left: `${switchsX + 19}px`,
        }}
      >
        <div className="pop-ups-title">
          <div className="switch" onClick={switchs}>
            <CloseCircleOutline className="video-closure-icon" />
          </div>
          {titles.name}
        </div>
        {`_id：${titles.id}`}
        <div className="button-box">
          <Button className="button" color="primary" onClick={realspace}>
            进入设备
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperMap;
