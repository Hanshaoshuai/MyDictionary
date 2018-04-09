var g_iLastID=0;

window.onload=function ()
{
	var oBtnSubmit=document.getElementById('btn_submit');
	
	oBtnSubmit.onclick=postMessage;
	
	setInterval(getNewMessage, 500);
};

function postMessage()
{
	var oTxtName=document.getElementById('btn_name');
	var oTxtMsg=document.getElementById('btn_msg');
	var url='message.php?act=post';
	
	var oAjax=InitAjax();
	
	if(oTxtName.value.length==0 || oTxtMsg.value.length==0)
	{
		alert('输入完整信息');
		return;
	}
	
	url+='&name='+encodeURIComponent(oTxtName.value);
	url+='&msg='+encodeURIComponent(oTxtMsg.value);
	
	DoAjaxGet(oAjax, url, onPostComplete);
}

function onPostComplete(sTxt)
{
	var oTxtName=document.getElementById('btn_name');
	var oTxtMsg=document.getElementById('btn_msg');
	
	addNew(oTxtName.value, oTxtMsg.value);
	
	oTxtName.value='';
	oTxtMsg.value='';
	
	g_iLastID=parseInt(sTxt);
}

function getNewMessage()
{
	var url='message.php?act=new&id='+g_iLastID;
	var oAjax=InitAjax();
	DoAjaxGet(oAjax, url, onGetComplete);
}

function onGetComplete(sTxt)
{
	var arr=sTxt.split(':');
	var msg=decodeURIComponent(arr[1]);
	var name=decodeURIComponent(arr[2]);
	
	if(parseInt(arr[0])>0)
	{
		g_iLastID=parseInt(arr[0]);
		addNew(name, msg);
	}
}

function addNew(sName, sMsg)
{
	var oDiv=document.getElementById('content');
	var oUl=oDiv.getElementsByTagName('ul')[0];
	var oTmpUl=document.getElementById('tmp_container');
	var oLi=null;
	var oTimer=null;
	
	var iHeight=0;
	
	//创建元素LI
	oLi=document.createElement('li');
	oLi.innerHTML='<div class="pic"><a href="###"></a></div><p><a href="#">'+sName+'</a>'+sMsg+'<br /><span>1秒钟前</span></p>';
	
	//获取新创建的LI的高度
	oTmpUl.appendChild(oLi);
	iHeight=oLi.offsetHeight+13;
	
	
	oLi.innerHTML='';
	oLi.style.height='0px';
	
	if(oUl.getElementsByTagName('li').length==0)
	{
		oUl.appendChild(oLi);
	}
	else
	{
		oUl.insertBefore(oLi, oUl.getElementsByTagName('li')[0]);
	}
	
	//运动
	var alpha=0;
	oTimer=setInterval
	(
		function ()
		{
			var h=parseInt(oLi.style.height)+2;
			
			if(h>=iHeight)
			{
				h=iHeight;
				clearInterval(oTimer);
				oLi.innerHTML='<div class="pic"><a href="###"></a></div><p><a href="#">'+sName+'</a>'+sMsg+'<br /><span>1ǰ</span></p>';
				
				oLi.style.filter="alpha(opacity:0)";
				oLi.style.opacity="0";
				
				oTimer=setInterval
				(
					function ()
					{
						alpha+=10;
						oLi.style.filter="alpha(opacity:"+alpha+")";
						oLi.style.opacity=alpha/100;
						
						if(alpha==100)
						{
							oLi.style.filter="";
							oLi.style.opacity="";
							
							clearInterval(oTimer);
						}
					},30
				);
			}
			oLi.style.height=h+'px';
		},30
	);
}