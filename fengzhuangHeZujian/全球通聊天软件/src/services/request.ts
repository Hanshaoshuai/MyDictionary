import axios from 'axios';

axios.defaults.timeout = 10000000;
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

// function redirectToLogin() {
//   const search = `redirect=${encodeURIComponent(
//     window.location.pathname + window.location.search
//   )}`;

//   window.location.href = "/login?" + search;
// }

//// 拦截器
axios.interceptors.request.use(
  (config) => {
    //你可以在去请求前做的一些时候
    //比如向请求头添加token以及处理全局loading但是每次调用api时都会进行loading所以我们使用按需引入loading
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

//响应器
axios.interceptors.response.use(
  (res) => {
    // 响应器你可以在这里进行数据进行响应之后处理的一些抒情
    // loadinger(false)    //这个函数是用来处理loading的
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
    }

    switch (res.data.state) {
      case 400: {
        // message.warning(res.data.message);
        return res;
      }
      case 401: {
        // message.warning(res.data.message);
        // redirectToLogin();
        return res;
      }
      default:
        return res;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 上传进度
export const onUploadProgress = axios.defaults;
// (progressEvent) => {
//   let complete =
//     (((progressEvent.loaded / progressEvent.total) * 100) | 0) + '%';
//   console.log('上传=====>>>>', complete);
// };

// 下载进度
export const onDownloadProgress = axios.defaults;
// (progressEvent) => {
//   let complete =
//     (((progressEvent.loaded / progressEvent.total) * 100) | 0) + '%';
//   console.log('下载=====>>>>', complete);
// };

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export function request(
  url: string,
  method: Method,
  data: object = {}
): Promise<{ state: number; data?: any; message?: string }> {
  const config =
    method === 'GET' || method === 'DELETE'
      ? { url, method, params: data }
      : { url, method, data };

  const requests: any = new Promise((resolve, reject) => {
    axios
      .request(config)
      .then((res) => {
        if (res.status === 200) {
          resolve(res.data);
        } else {
          resolve(res.data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

  return Promise.race([
    requests,
    new Promise((resolve, reject) => {
      // 暂时关掉
      // setTimeout(
      //   () =>
      //     resolve({
      //       errMsg: '请求超时请稍后再试！',
      //       success: false,
      //       code: 408,
      //     }),
      //   10000
      // );
    }),
  ]);
  // return new Promise((resolve, reject) => {
  //   axios
  //     .request(config)
  //     .then((res) => {
  //       if (res.status === 200) {
  //         resolve(res.data);
  //       } else {
  //         resolve(res.data);
  //       }
  //     })
  //     .catch((err) => {
  //       // message.warning("Network error.");
  //       reject(err);
  //     });
  // });
}
