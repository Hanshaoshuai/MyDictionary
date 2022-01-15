### 描述

excel文件上传填充表格和将表格导数据出excel文件

### 安装

``` javascript
npm install excel-filejs --save
```  

### 使用方法

``` javascript
import { excelFile } from 'excel-filejs';
```

#### excel上传获取数据 

运用`<input type="file"/>` onchange后获取此dom 作为一个入参；

``` javascript
excelFile({
  type: 'Import',   // 'Import'上传获取Excel数据,
  elements: dom,    // 点击input选择文件后的dom元素;
}).then((res) => {
  console.log('获取上传的数据===》》', res);
}).catch((error) => {
  console.log('err', error);
});
```

#### 导出excel文件

``` javascript
excelFile({
  type: "export",             // 'export'导出Excel,
  dataList: list,             // 要导出Excel的数据, 格式：[{}]
  textName: '2019年下载量统计', // 自定义Excel文件名或不传
  // fileTypes: 'xls',        // 自定义文件类型
}).then(res => {
  console.log('返回数据==》》',res);
}).catch(error => {
  console.log('err',error);
  }
);
```