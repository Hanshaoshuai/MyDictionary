
//  注释有使用说明

var tmpDown; //  导出的二进制对象
var scriptLoad = false; //是否加载完成；

var index = function PureComponent(obj){
  var types = obj.type,            // 导入Excel('Import')/导出Excel('export'),
      elements = obj.elements,    // input上传变更后的dom元素;
      dataList = obj.dataList,    // 要导出Excel的数据, 格式：[{}]
      textName = obj.textName,    // 要导出Excel文件名
      fileTypes = obj.fileTypes,  // 自定义文件类型
      EXCEL = undefined;

  function componentWillMount(){
    EXCEL = `EXCEL${uidS('EXCEL')}`;
    return componentDidMount();
  }

  function componentDidMount(){
    if(!document.getElementById('scriptEXCEL')){
      return new Promise((resolve, reject) => {
        const dom = document.createElement('script');
        dom.id = 'scriptEXCEL'
        // dom.src = "https://gw-office.alipayobjects.com/basement_prod/0efb83da-6233-4e83-b2e6-2d491902518f.js";  // 公司内网使用
          dom.src = 'http://oss.sheetjs.com/js-xlsx/xlsx.full.min.js'; // 其他链接使用
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(dom);
        //  console.log(body,dom);
        dom.onload = function(params) {
          // console.log('加载完成===》》》')
          scriptLoad = true;
          resolve(implement());
        }
      })
    }else{
      return implement();
    }
  }

  function implement(){
    if(types === 'Import'){
      return new Promise((resolve, reject) => {
        importf(elements, resolve, reject);
      })
    }else if(types === 'export'){
      if(!textName){
        console.warn("最好设置自己的Excel文件名！")
      }
      return new Promise((resolve, reject) => {
        downloadList(dataList, fileTypes, resolve, reject);
      })
    }else{
      console.error('入参types属性错误！');
      return new Promise((resolve, reject) => {
        reject('入参types属性错误！');
      })
    }
  }

  // function componentWillReceiveProps(nextProps) {
  //   console.log('props==>>', nextProps);
  //   this.setState({
  //     disabled: nextProps.disabled,
  //   });
  // }

  function uidS(text){
    const CHARS = 'abcdefghigklmnopqrstuvwxyz';
    const NUMS = '0123456789';
    const ALL = CHARS + NUMS;
    //  最简单的 uid 生成器够用就好
    function uid(n) {
      n = n ? n : 6;
      if (n < 2) {
        throw new RangeError('n  不能小于  2');
      }
      return ('xx' + 'z'.repeat(n - 2)).replace(/[xz]/g, function(c) {
        return c === 'x' ?
          CHARS[Math.random() * 26 | 0] :
          ALL[Math.random() * 36 | 0];
      });
    }
    console.log('uidS====>>>',uid('name66uid'));
    return uid(text);
  }

  function importf(dom, resolve, reject){ // 导入
    setTimeout(function () {
      reject('err，数据处理发生错误！')
    }, 20000);
    if(dom.files && dom.files.length !== 0){
      files = dom.files[0]
    }else{
      console.error('input没有找到files！') 
      reject('err');
      return;
    }
    const fileReader = new FileReader();// 不支持IE
    const newList = [];
    let workbook = {};
    let values = []; // 存储获取到的数据
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files);
    fileReader.onload = (ev) => {
      try {
        const data = ev.target.result;
        workbook = XLSX.read(data, { type: 'binary' });
        // 以二进制流方式读取得到整份excel表格对象
      } catch (e) {
        console.error('读取失败，请检查文件类型！');
        reject('读取失败，请检查文件类型！');
        // alert('读取失败，请检查文件类型');
        return;
      }
      // 表格的表格范围，可用于判断表头是否数量是否正确
      let fromTo = '';
      // 遍历每张表读取
      Object.keys(workbook.Sheets).forEach((key) => {
        // console.log('每张表读取===>>',key,workbook.Sheets)
        if (workbook.Sheets.hasOwnProperty(key)){
          const newObj = {
            keyName: key,
            value: values.concat(XLSX.utils.sheet_to_json(workbook.Sheets[key])),
          }
          newList.push(newObj);
          fromTo = workbook.Sheets[key]['!ref'];
          values = values.concat(XLSX.utils.sheet_to_json(workbook.Sheets[key]));
          // break; // 只取第一张表，如果读取所有表就注释掉这一句
        }
      });
      dataList = newList;
      if(newList.length > 0){
        resolve({
          "judges": true,
          "data": dataList,
        });
      }
      // console.log('EXCEL数据整理==》》》》', dataList, fromTo, );
    };
  }

  function downloadList(list, type, resolve, reject){ // 导出
    console.log('导出数据==》》》》', list);
    setTimeout(function () {
      reject('err，数据处理发生错误！')
    }, 20000);
    if(Array.isArray(list)){
      if(list.length == 0){
        console.error('导出数据不能为空！');
        reject({
          "judges": false,
          "text": '导出的数据有误！',
        });
        return;
      }else{
        downloadExl(list, type, resolve, reject);
      }
    }else{
      reject('err，入参数据格式不正确！（Array）');
    }
  }

  function downloadExl(json, type, resolve, reject){
    const dataObj = json[0];
    json.unshift({});
    const keyMap = []; // 获取keys
    Object.keys(dataObj).forEach((key) => {
      keyMap.push(key);
      json[0][key] = key;
    })
    const tmpdata = [];// 用来保存转换好的json 
    json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
      v: v[k],
      position: (j > 25 ? getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
    }))).reduce((prev, next) => prev.concat(next)).forEach((v, i) => tmpdata[v.position] = {v: v.v});
    const outputPos = Object.keys(tmpdata); // 设置区域,比如表格从A1到D10
    console.log('qqqqqqq===>>',outputPos,tmpdata, type)
    const tmpWB = {
      SheetNames: ['mySheet'], // 保存的表标题
      Sheets: {
        'mySheet': Object.assign({},
          tmpdata, // 内容
          {
            '!ref': `${outputPos[0]  }:${  outputPos[outputPos.length - 1]}` // 设置填充区域
          })
      }
    };
    tmpDown = new Blob([s2ab(XLSX.write(tmpWB,
      {bookType: (type == undefined ? 'xlsx' : type),bookSST: false, type: 'binary'}// 这里的数据是用来定义导出的格式类型
      ))], {
      type: ""
    }); // 创建二进制对象写入转换好的字节流
    var href = URL.createObjectURL(tmpDown); // 创建对象超链接
    var dom = document.createElement('a');
    console.log('数据处理===》》',tmpWB,tmpDown);
    dom.target="blank";
    if(textName){
      dom.download = textName + '.xlsx';
    }else{
      dom.download = '数据列表.xlsx';
    }
    dom.href = href;
    dom.click();
    // document.getElementById(hf).href = href; // 绑定a标签
    // document.getElementById("hf").click(); // 模拟点击实现下载
    setTimeout(() => { // 延时释放
      URL.revokeObjectURL(tmpDown); // 用URL.revokeObjectURL()来释放这个object URL
    }, 100);
    resolve({
      "judges": true,
      "text": '处理成功正在导出。',
    });
  }

  function s2ab(s){ // 字符串转字符流
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  function getCharCol(n){// 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
    let s = '';
    let m = 0
    while (n > 0) {
      m = n % 26 + 1
      s = String.fromCharCode(m + 64) + s
      n = (n - m) / 26
    }
    return s
  }
  return componentWillMount();
}

module.exports.excelFile = index;