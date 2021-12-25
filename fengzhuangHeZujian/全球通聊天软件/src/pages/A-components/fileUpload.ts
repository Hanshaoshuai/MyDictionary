import { Toast } from 'antd-mobile';
import { fileUpload } from '../../api';
export const FileUpload = (
  fileList: any,
  dateTime: any,
  nameList: any,
  type: any,
  fileType: string,
  clientmessage: any
) => {
  const isDebug: any =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  return new Promise((resolve, reject) => {
    if (fileList) {
      const reader = new FileReader();
      reader.readAsBinaryString(fileList);
      let dataUrl = '';
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

        const formDate = new FormData();
        formDate.append('file', 'true');
        formDate.append('classIcon', dataUrl);
        formDate.append('imgId', dateTime);
        formDate.append('fileName', nameList[0]);
        formDate.append('type', type);
        formDate.append('size', size);
        formDate.append('fileType', fileType);
        formDate.append('clientmessage', JSON.stringify(clientmessage));
        if (isDebug) {
          formDate.append('isDebug', isDebug);
        }
        fileUpload(formDate)
          .then((data) => {
            //   console.log(data);
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
      };
    }
  });
};
