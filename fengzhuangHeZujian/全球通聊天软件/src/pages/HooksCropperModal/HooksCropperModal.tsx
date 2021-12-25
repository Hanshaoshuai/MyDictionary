import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Space } from "antd-mobile";

import Cropper from "react-cropper"; // 引入Cropper
import "cropperjs/dist/cropper.css"; // 引入Cropper对应的css

import "./HooksCropperModal.scss";

const HooksCropperModal = ({ uploadedImageFile, onClose, onSubmit }: any) => {
  const [src, setSrc] = useState<any>(null);
  const [cropperRef, setCropperRef] = useState<any>(null);

  useEffect(() => {
    if (uploadedImageFile) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target) {
          const dataURL: any = e.target.result;
          setSrc(dataURL);
        }
      };

      fileReader.readAsDataURL(uploadedImageFile);
    }
  }, [uploadedImageFile]);
  const convertBase64UrlToBlob = (urlData: any) => {
    var bytes = window.atob(urlData.split(",")[1]); //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i);
    }

    return new Blob([ab], { type: "image/png" });
  };
  const imageSize = (base64Str: any) => {
    const indexBase64 = base64Str.indexOf("base64,");
    if (indexBase64 < 0) return -1;
    const str = base64Str.substr(indexBase64 + 6);
    return (str.length * 1).toFixed(2);
  };

  // const getImgSize = (str:any)=> {
  //   //获取base64图片大小，返回KB数字
  //   var str = base64url.replace('data:image/jpeg;base64,', '');//这里根据自己上传图片的格式进行相应修改
  //   var strLength = str.length;
  //   var fileLength = parseInt(strLength - (strLength / 8) * 2);
  //   // 由字节转换为KB
  //   var size = "";
  //   size = (fileLength / 1024).toFixed(2);
  //   return parseInt(size);
  // }

  const handleSubmit = () => {
    // let filename = uploadedImageFile.name;
    // TODO: 这里可以尝试修改上传图片的尺寸
    if (cropperRef) {
      let dataurl = "";
      let size = 1;
      for (let i = 0; i < 10; i++) {
        dataurl = cropperRef.getCroppedCanvas().toDataURL("image/jpeg", size);
        if (imageSize(dataurl) <= 1000000) {
          console.log(imageSize(dataurl));
          // console.log(dataurl);
          //把选中裁切好的的图片传出去
          onSubmit(dataurl);
          // 关闭弹窗
          onClose(false);
          return;
        }
        size -= 0.1;
        console.log(imageSize(dataurl));
      }

      // cropperRef.getCroppedCanvas().toBlob((e: any) => {
      //   console.log(e);
      //   // onSubmit(e);
      // }, "image/jpeg");
      // const news = convertBase64UrlToBlob(dataurl);
      // console.log(news);
    }
  };
  const onCropperInit = (e: any) => {
    // console.log(e);
    setCropperRef(e);
  };

  return (
    <div className="hooks-cropper-modal">
      <div className="modal-panel">
        <div className="cropper-container-container">
          <div className="cropper-container">
            {uploadedImageFile ? (
              <Cropper
                src={src}
                className="cropper"
                // ref={cropperRef}
                onInitialized={(e: any) => onCropperInit(e)}
                // Cropper.js options
                viewMode={1}
                aspectRatio={1} // 固定为1:1  可以自己设置比例, 默认情况为自由比例
                guides={false}
                preview=".cropper-preview"
                //裁剪变化时的回调函数
                // crop={onCrop}
                zoomable={true} //是否允许放大图像
                background={false} //是否显示背景的马赛克
                rotatable={true} //是否旋转
              />
            ) : (
              ""
            )}
          </div>
          <div className="preview-container">
            <div className="cropper-preview" />
          </div>
        </div>
        <div className="button-row">
          <Button
            style={{ margin: "9px 91px 9px 0", padding: "0 13px" }}
            onClick={() => onClose(false)}
          >
            取消
          </Button>
          <Button
            color="success"
            style={{ margin: "9px 0 9px 91px", padding: "0 13px" }}
            onClick={handleSubmit}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HooksCropperModal;
