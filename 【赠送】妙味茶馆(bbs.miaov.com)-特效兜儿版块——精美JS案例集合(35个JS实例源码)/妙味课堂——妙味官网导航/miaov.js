var g_iSpeed=0;
var g_iCur=0;
var g_oTimer=null;

window.onload=function ()
{
	var oDiv=document.getElementById('btn_bg');
	var oUl=oDiv.getElementsByTagName('ul')[0];
	var aLi=document.getElementById('header').getElementsByTagName('ul')[0].getElementsByTagName('li');
	var i=0;
	
	for(i=0;i<aLi.length;i++)
	{
		aLi[i].miaovIndex=i;
		aLi[i].onmouseover=startMove;
	}
	
	g_iCur=-oUl.offsetLeft;
};

function startMove()
{
	var oDiv=document.getElementById('btn_bg');
	var oUl=oDiv.getElementsByTagName('ul')[0];
	
	oDiv.style.left=432+g_iCur+'px';
	oUl.style.left=-g_iCur+'px';
	if(g_oTimer)
	{
		clearInterval(g_oTimer);
	}
	g_oTimer=setInterval("doMove("+this.offsetLeft+")", 35);
}

function doMove(iTarget)
{
	var oDiv=document.getElementById('btn_bg');
	var oUl=oDiv.getElementsByTagName('ul')[0];
	
	g_iSpeed+=(iTarget+oUl.offsetLeft)/5;
	g_iSpeed*=0.7;
	
	if(Math.abs(g_iSpeed)>60)
	{
		g_iSpeed=g_iSpeed>0?60:-60;
	}
	
	g_iCur+=g_iSpeed;
	
	if(g_iCur>0)
	{
		g_iCur=Math.ceil(g_iCur);
	}
	else
	{
		g_iCur=Math.floor(g_iCur);
	}
	
	if(Math.abs(iTarget-g_iCur)<1 && Math.abs(g_iSpeed)<1)
	{
		clearInterval(g_oTimer);
		g_oTimer=null;
	}
	else
	{
		oDiv.style.left=432+g_iCur+'px';
		oUl.style.left=-g_iCur+'px';
	}
}