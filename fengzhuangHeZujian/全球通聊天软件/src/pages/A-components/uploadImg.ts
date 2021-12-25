import { Toast } from 'antd-mobile';
import { fileUpload } from '../../api';
export const UploadImg = (
  file: any,
  dateTime: any,
  type: any,
  clientmessage: any,
  fileType: string
) => {
  // console.log(file);
  const isDebug: any =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  // const imageSize = (base64Str: any) => {
  //   const indexBase64 = base64Str.indexOf('base64,');
  //   if (indexBase64 < 0) return -1;
  //   const str = base64Str.substr(indexBase64 + 6);
  //   return (str.length * 1).toFixed(2);
  // };
  return new Promise((resolve, reject) => {
    if (file) {
      // console.log(reader.result);
      var image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = function () {
        var canvas = document.createElement('canvas');
        var canvasZoom = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvasZoom.width = 100;
        canvasZoom.height = (100 / image.width) * image.height;
        var imageCanvas = canvas.getContext('2d');
        var imageCanvasZoom = canvasZoom.getContext('2d');

        if (imageCanvas && imageCanvasZoom) {
          // imageCanvas.drawImage(image, 0, 0, 300, 300);
          // console.log(canvas, image.width, image.height);
          imageCanvas.drawImage(image, 0, 0, image.width, image.height);
          imageCanvasZoom.drawImage(
            image,
            0,
            0,
            100,
            (100 / image.width) * image.height
          );
          // console.log(
          //   canvas.toDataURL('image/jpeg', 1),
          //   canvasZoom.toDataURL('image/jpeg', 1)
          // );
          let dataurl = '';
          let dataurlZoom = '';
          let size = 1;
          // for (let i = 0; i < 10; i++) { // 开启循环压缩
          dataurl = canvas.toDataURL('image/jpeg', size);
          dataurlZoom = canvasZoom.toDataURL('image/jpeg', 1);
          // if (imageSize(dataurl) <= 1000000) {
          // console.log(imageSize(dataurl));
          // console.log(dataurl);
          // onSubmit(dataurl);
          // resolve(dataurl);
          const formDate = new FormData();
          formDate.append('image', 'true');
          formDate.append('classIcon', dataurl);
          formDate.append('classIconZoom', dataurlZoom);
          formDate.append('imgId', dateTime);
          formDate.append('type', type);
          formDate.append('fileType', fileType);
          formDate.append('clientmessage', JSON.stringify(clientmessage));
          if (isDebug) {
            formDate.append('isDebug', isDebug);
          }
          if (image.width > image.height || image.width === image.height) {
            formDate.append('length', 'width');
          } else {
            formDate.append('length', 'height');
          }
          // image.url = reader.result;
          // console.log(formDate);
          fileUpload(formDate)
            .then((data) => {
              console.log(data);
              if (data.code === 200) {
                resolve(data);
              } else {
                Toast.show({
                  content: '上传失败，请稍后再试！',
                  position: 'top',
                });
              }
            })
            .catch((err) => {
              console.log('error');
            });
          // return;
          // }
          // size -= 0.1;
          // console.log(imageSize(dataurl));
          // }
        }
      };
    }
  });
};
