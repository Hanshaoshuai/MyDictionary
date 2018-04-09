function createPPT(id)
{
	var oDiv=document.getElementById(id);
	/*
	if(!oDiv)
	{
		return;
	}
	*/
	var oOl=oDiv.getElementsByTagName('ol')[0];
	var oUl=oDiv.getElementsByTagName('ul')[0];
	var aBtn=oOl.getElementsByTagName('li');
	var aLi=oUl.getElementsByTagName('li');
	var iNow=0;
	var oTimer=null;
	
	oUl.oTimer=null;
	
	var i=0;
	
	function gotoImg(index)
	{
		for(i=0;i<aBtn.length;i++)
		{
			aBtn[i].className='';
		}
		
		aBtn[index].className='active';
		startMove(oUl, -oDiv.offsetHeight*index);
		//console.log(oDiv.offsetHeight*index)
		iNow=index;
	}
	
	for(i=0;i<aBtn.length;i++)
	{
		aBtn[i].Index=i;
		aBtn[i].onmouseover=function ()
		{
			gotoImg(this.Index);
		};
	}
	
	for(i=0;i<aLi.length;i++)
	{
		aLi[i].onmouseover=function ()
		{
			clearInterval(oTimer);
		};
		
		aLi[i].onmouseout=function ()
		{
			oTimer=setInterval
			(
				function ()
				{
					gotoImg((iNow+1)%aBtn.length);
				}, 3000
			);
		};
	}
	
	oTimer=setInterval
	(
		function ()
		{
			gotoImg((iNow+1)%aBtn.length);
		}, 3000
	);
};

function startMove(oUl, iTarget)
{
	if(oUl.oTimer)
	{
		clearInterval(oUl.oTimer);
	}
	
	oUl.oTimer=setInterval
	(
		function ()
		{
			doMove(oUl, iTarget);
		}, 30
	);
}

function doMove(oUl, iTarget)
{		if(Math.abs(oUl.offsetTop-iTarget)<9){
			clearInterval(oUl.oTimer);
			oUl.oTimer=0;
			oUl.style.top=iTarget+"px"
		}
		else{
		if(oUl.offsetTop<iTarget)
		{
			iSpeed=9;
		}
		else
		{
			iSpeed=-9;
		}
		oUl.style.top=oUl.offsetTop+iSpeed+'px';
		}
}

window.onload=function(){
	createPPT("play")
}
