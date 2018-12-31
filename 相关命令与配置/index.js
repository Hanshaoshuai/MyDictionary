好1技术访谈：
npm install vue-cli -g    安装vue命令环境

第一种simple
vue init simple vue-deme

第二种webpack   有Eslint代码检查  和单元测试
vue init webpack vue-deme

cnpm install


第三种webpack-simple   没有Eslint代码检查  和单元测试
vue init webpack-simple vue-deme

cnpm install

http://www.jb51.net/article/84973.htm    倾力总结40条常见的移动端Web页面问题解决方案


$("p").find("span")    从所有的段落开始，进一步搜索下面的span元素。与$("p span")相同。


jQuery 代码:                            对于每个匹配的元素所要执行的函数


$("img").each(function(i){					你可以使用 'return' 来提前跳出 each() 循环。

   this.src = "test" + i + ".jpg";
 });
 
 结果:
<img src="test0.jpg" />, <img src="test1.jpg" /> 

在each() 循环里所要执行的函数
$(function(){
	var a = "";
	$(".colorS_s").find("ul").find("li").click(function(){
		$(".colorS_s").each(function(){
			if($(this).find(".another").length > 0 ){
				var a_title = $(this).prev(".colorS").find("p").text();
				var a_id = $(this).find(".another").attr("id_data");
				var a_data = a_title+":"+a_id;
				if(a){
					a += ","+a_data;
				}else{
					a += a_data;
				}
				
			}
		});
		console.log(a);
	});
})
function auto_time(week,time){
	var timer=setInterval(function(){
		var arr=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
		var str="";
		var d=new Date();
		var w=d.getDay();
		var h=d.getHours();
		var m=d.getMinutes();
		var s=d.getSeconds();
		h=h.toString().length<2?"0"+h:h;
		m=m.toString().length<2?"0"+m:m;
		s=s.toString().length<2?"0"+s:s;
		str=h+":"+m+":"+s;
		//console.log(w+"/"+str)//测试是否正确
		if(w == week && str == time){
			alert("现在是"+arr[w]+"，早上"+time+"。")
		}
	},1000)
}
auto_time("3","06:30:00");//一定要是字符串形式


http://yuip076.com/

13483045948
15330078046

什么是CSS hack

http://www.360doc.com/content/14/0828/06/1659610_405244148.shtml
http://git.oschina.net/    码云网


后台管理模板
http://www.mycodes.net/154/7449.htm



D:\新建文件夹\Desktop\远程资料\远程资料最新\yaf_mmg_512\application\modules\Admin\views\order
http://local.mmg.com/app/app/index.html?id=1
http://my.com/application/modules/Admin/views/order/orderupdate.html
http://my.com/index.php/admin/index/index


账户是90906密码是333333


我:
192.168.6.13 本地测试环境
我:
test.51maimaigo.com 线上测试环境
我:
本地测试环境根目录地址为   /datadisk/wwwroot/mmg
我:
线上测试环境 根目录为   /datadisk/wwwroot/mmg2


用手机去预览 需通过ifconfig、windows是ipconfig查看本机的ip  把localhost换成本机ip同样访问  再通过cli.im网站草料生成二维码手机扫描手机必须统一局域网
ifconfig
ipconfig
"18500281418"



https://shixian.com/consultants		实现  兼职
https://cloud.baidu.com/index.html?track=cp:npinzhuan|pf:pc|pp:left|ci:|pu:495	百度云
https://ant.design/index-cn  react pc 组件库


我本人的	AppID(小程序ID)wxf24741fba4eb3cd2
我本人的	AppSecret(小程序密钥)wx51f72fe2e0317442
http://blog.csdn.net/wangsf789/article/details/53419781		微信小程序进行微信支付步骤简述
https://greasyfork.org/zh-CN/scripts	用户脚本下载



https://www.fir.im/   								发布接口API
developer.apple.com 								发布证书下载
http://www.jianshu.com/p/9d9e3699515e  				iOS开发证书与配置文件的使用
http://ask.dcloud.net.cn/article/152   				iOS证书(.p12)和描述文件(.mobileprovision)申请使用教程
https://zhidao.baidu.com/question/440631981.html  	ios应用程序 怎么上传到appstore
https://itunesconnect.apple.com/					苹果上架官网


chrome://inspect/#devices		真机调试


http://blog.csdn.net/qq_27626333/article/details/51823302	HTML5+规范：Push(管理推送消息功能)
http://www.html5plus.org/doc/zh_cn/contacts.html··			mui获取通讯录
http://www.html5plus.org/doc/zh_cn/nativeui.html			mui弹出系统选择按钮框
http://blog.csdn.net/xiejunna/article/details/53086574		html5 runtime运行环境
http://blog.csdn.net/xiejunna/article/details/53086574		html5 runtime运行环境
http://ask.dcloud.net.cn/article/1349       				Hbuilder集成微信支付教程(简单流程)
http://ask.dcloud.net.cn/article/32							mui设置全屏显示
http://blog.csdn.net/sinat_33713995/article/details/74783768	mui设置沉浸式状态栏
http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.open	Webview模块管理应用窗口界面，实现多窗口的逻辑控制管理操作。通过plus.webview可获取应用界面管理对象。


http://blog.csdn.net/x386277405/article/details/52702627	 js/jquery实现复制、粘贴、剪切触发事件




18357018864
http://www.adobe.com/cn/downloads.html   //编辑器下载网站


scrollTop为滚动条在Y轴上的滚动距离。
clientHeight为内容可视区域的高度。
scrollHeight为内容可视区域的高度加上溢出（滚动）的距离。
从这个三个属性的介绍就可以看出来，滚动条到底部的条件即为scrollTop + clientHeight == scrollHeight。（兼容不同的浏览器）


http://www.jb51.net/article/109570.htm							Vue 过渡实现轮播图效果
https://www.cnblogs.com/best/p/8176281.html						前端MVC Vue2学习总结（四）——条件渲染、列表渲染、事件处理器
https://segmentfault.com/a/1190000007474673  					vue播放器使用
https://segmentfault.com/a/1190000008479698  					vue上传图片文件地址；
http://www.jb51.net/article/116915.htm
https://segmentfault.com/q/1010000007566567   					vue上传图片文件地址；
http://www.sojson.com/blog/214.html  							原生上传文件或图片；
http://www.jianshu.com/p/011d308d7dd7   						滚动
https://ustbhuangyi.github.io/better-scroll/doc/zh-hans/#		起步   滚动
https://www.v2ex.com/t/341875
http://www.jianshu.com/p/31ad32e7ec13   						滚动插件
http://blog.csdn.net/zjw0742/article/details/77802611  			优化滚动条插件
http://blog.csdn.net/zhaohaixin0418/article/details/71212475    基于vue2写的上拉加载
http://www.jianshu.com/p/31ad32e7ec13  							vue-cli中vue-scroller的详细用法，上拉加载下拉刷新,vue-axios获取数据的详细过程

	
http://www.qqtn.com/article/article_185683_1.html				微信附近小程序怎么申请？微信附近的小程序怎么发布？


https://segmentfault.com/a/1190000010377156						移动端视频播放
https://surmon-china.github.io/vue-video-player/				移动端视频播放
https://segmentfault.com/a/1190000011346597

http://blog.csdn.net/ssisse/article/details/52311713			来获取元素在页面的位置Javascript getBoundingClientRect()
https://www.cnblogs.com/limeiky/p/6179964.html					来获取元素在页面的位置Javascript getBoundingClientRect()
https://blog.csdn.net/prospertu/article/details/50635362		js监听页面的scroll事件



https://mp.weixin.qq.com/s/hYjGyIdLK3UCEVF0lRYRCg      				Git常用命令大全，迅速提升你的Git水平
$ git config --global user.name "请输入您的用户名"
$ git config --global user.email "请输入您的邮箱"


encodeURIComponent('showToolBar=YES&showTitleBar=NO')					控制台编译


https://www.cnblogs.com/autobyme/p/6962100.html		Charles破解注册
https://www.jianshu.com/p/46d29e60dd1b
https://www.cnblogs.com/mrjade/p/7677051.html


bkmobilegw
hpm domain
http://www.pc6.com/edu/66489.html       修改Hosts文件的方法
http://www.jb51.net/os/MAC/464531.html      修改Hosts文件的方法
命令 q 或 wq
git stash
git stash pop stash@{0}
git stash clear

--no-verify 绕过eslint

git 在pull或者合并分支的时候有时会遇到这个界面。可以不管(直接下面3,4步)，如果要输入解释的话就需要:
git checkout -b develop_20181026 origin/develop_20181026
1.按键盘字母 i 进入insert模式
2.修改最上面那行黄色合并信息,可以不修改
3.按键盘左上角"Esc"
4.输入":wq",注意是冒号+wq,按回车键即可
sourcetree.        git管理工具


下载 iHosts       开发测试 使用localhost  
127.0.0.1  localhost


https://www.cnblogs.com/zamhown/p/6429163.html						使用Node.js快速搭建简单的静态文件服务器
chrome://inspect/#devices											Chrome 测试安卓专用  
https://www.cnblogs.com/hezihao/p/8028856.html						webpack学习
https://tinypng.com/												智能PNG和JPEG压缩
https://github.com/amfe/lib-flexible								一个移动端的适配方案(flexible方案)

使用Charles

过滤网关的请求呢
1,只显示我想要的网关的请求：Proxy→ Recording Setting→Include→add
	Protocol：测试、stable环境是http协议，线上是https环境
	Host：就是想要的网关
	Port：80
	另一种是排除法   点击sequence   然后右击请求地址  点击ignore  会将这个网关加入到Recording Setting→Exclude列表中
2网关设置断点：Proxy→Breakpoints

iTerm2
Homebrew
nvm


发布安装包命令
Underscore.js

首先执行npm adduser
	Username: hanshaoshuai
	Password: 865923han
	Email: (this IS public) 361062939@qq.com
	Logged in as hanshaoshuai on https://registry.npmjs.org/.

在执行npm publish
	如果出现下面报错说明package.json中的mame属性名有人用过了换一个就行了  如果 ERR! publish Failed PUT 400  说明你package.json中的mame属性名有大写字母不允许大写；
	npm ERR! publish Failed PUT 403
	npm ERR! code E403
	npm ERR! You do not have permission to publish "gettime". Are you logged in as the correct user? : gettime

	npm ERR! A complete log of this run can be found in:
	npm ERR!     C:\Users\Hanshaoshuai\AppData\Roaming\npm-cache\_logs\2018-04-22T15_12_48_625Z-debug.log



VS code   使用设置:
{
    "emmet.syntaxProfiles": {
      "vue-html": "html",
      "vue": "html"
    },
    "files.associations": {
      "*.ejs": "html",
      "*.twig": "html"
    },
    "beautify.language": {
      "js": {
        "type": ["json"],
        "filename": [".jshintrc", ".jsbeautifyrc"]
      },
      "css": ["css", "scss", "less"],
      "html": ["htm", "html", "twig", "ejs", "velocity"]
    },
    "html.format.wrapAttributes": "force-expand-multiline",
    "gitlens.advanced.messages": {
      "suppressCommitHasNoPreviousCommitWarning": false,
      "suppressCommitNotFoundWarning": false,
      "suppressFileNotUnderSourceControlWarning": false,
      "suppressGitVersionWarning": false,
      "suppressLineUncommittedWarning": false,
      "suppressNoRepositoryWarning": false,
      "suppressResultsExplorerNotice": false,
      "suppressShowKeyBindingsNotice": true,
      "suppressUpdateNotice": false,
      "suppressWelcomeNotice": true
    },
    "workbench.iconTheme": "vscode-icons",
    "editor.fontSize": 15,
    "editor.tabSize": 2,
    "terminal.integrated.fontSize": 15,
    "editor.lineHeight": 20,
    "editor.fontFamily": "Ayuthaya, Menlo, Monaco, 'Courier New', monospace",
    "editor.wordWrap": "on",
    "workbench.colorTheme": "One Dark Pro",
    "sublimeTextKeymap.promptV3Features": true,
    "editor.formatOnSave": false,
    "editor.multiCursorModifier": "ctrlCmd",
    "editor.snippetSuggestions": "top",
    "editor.formatOnPaste": false,
    "eslint.autoFixOnSave": true,
    "emmet.includeLanguages": {
      "javascript": "javascriptreact",
      "velocity": "html"
    },
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "html",
      {
        "language": "vue",
        "autoFix": true
      }
    ],
    "javascript.validate.enable": false,
    "prettier.singleQuote": true,
    "prettier.eslintIntegration": true,
    "css.validate": false,
    "scss.validate": false,
    "window.zoomLevel": 0,
    "gitlens.historyExplorer.enabled": true,
    "git.confirmSync": false,
    "vsicons.dontShowNewVersionMessage": true
}
插件安装使用：