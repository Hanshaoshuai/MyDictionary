import { Toast } from 'antd-mobile';
// import { fileUpload } from "../../api";
// export const Upload = (file: any, imgId?: any, myName?: any) => {
//   console.log(file);
//   return new Promise((resolve, reject) => {
//     if (file.target?.files && file.target.files[0]) {
//       // formDate = new FormData();
//       // formDate.append("classIcon", file.target.files[0]);
//       // formDate.append("name", "imge");
//       // formDate.append("imgId", "");
//       let AllowImgFileSize = 2100000; //上传图片最大值(单位字节)（ 2 M = 2097152 B ）超过2M上传失败
//       const reader: any = new FileReader();
//       const formDate = new FormData();
//       // var file = $('#button')[0].files[0];
//       const imgUrlBase64 = reader.readAsDataURL(file.target.files[0]);
//       reader.onload = (e: any) => {
//         //var ImgFileSize = reader.result.substring(reader.result.indexOf(",") + 1).length;//截取base64码部分（可选可不选，需要与后台沟通）
//         if (AllowImgFileSize !== 0 && AllowImgFileSize < reader.result.length) {
//           Toast.show({
//             content: "上传失败，请上传不大于2M的图片！",
//             position: "top",
//           });
//           reject(false);
//         } else {
//           //执行上传操作
//           // alert(reader.result);
//           // console.log(reader.result);
//           formDate.append("classIcon", reader.result);
//           formDate.append("name", "imge");
//           if (imgId && myName) {
//             formDate.append("imgId", imgId);
//             formDate.append("myName", myName);
//           } else {
//             formDate.append("imgId", "");
//           }
//           // image.url = reader.result;
//           console.log(formDate);
//           fileUpload(formDate)
//             .then((data) => {
//               console.log(data);
//               localStorage.setItem("imgId", data.id);
//               if (imgId && myName) {
//                 localStorage.setItem("myHeadPortrait", data.icon);
//               }

//               resolve(data.icon);
//             })
//             .catch((err) => {
//               console.log("error");
//             });
//         }
//       };
//     }
//   });
// };

import { fileUpload } from '../../api';
export const Upload = (file: any, type: any, imgId?: any, myName?: any) => {
  const isDebug: any =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  // console.log(file);
  return new Promise((resolve, reject) => {
    if (file) {
      var image = new Image();
      image.src = file;
      image.onload = function () {
        var canvasZoom = document.createElement('canvas');
        canvasZoom.width = 100;
        canvasZoom.height = 100;
        var imageCanvas = canvasZoom.getContext('2d');
        if (imageCanvas) {
          imageCanvas.drawImage(image, 0, 0, 100, 100);
          const dataurlZoom = canvasZoom.toDataURL('image/jpeg', 1);
          const formDate = new FormData();
          //执行上传操作
          formDate.append('classIcon', file);
          formDate.append('name', 'imge');
          formDate.append('classIconZoom', dataurlZoom);
          if (imgId && myName) {
            formDate.append('imgId', imgId);
            formDate.append('myName', myName);
          } else {
            formDate.append('imgId', '');
          }
          formDate.append('type', type);
          // image.url = reader.result;
          if (isDebug) {
            formDate.append('isDebug', isDebug);
          }
          // console.log(formDate);
          fileUpload(formDate)
            .then((data) => {
              console.log(data);
              if (data.icon) {
                localStorage.setItem('imgId', data.id);
                if (imgId && myName) {
                  localStorage.setItem('myHeadPortrait', data.icon);
                  localStorage.setItem('myapathZoom', data.apathZoom);
                }
                resolve({ icon: data.icon, apathZoom: data.apathZoom });
              } else {
                resolve(null);
                Toast.show({
                  content: '上传失败，请稍后再试！',
                  position: 'top',
                });
              }
            })
            .catch((err) => {
              console.log('error');
            });
        }
      };
    }
  });
};
