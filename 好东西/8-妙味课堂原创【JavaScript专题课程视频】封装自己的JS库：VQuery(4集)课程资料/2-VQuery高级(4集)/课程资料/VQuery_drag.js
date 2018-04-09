$().extend('drag', function (){
	var i=0;
	
	for(i=0;i<this.elements.length;i++)
	{
		drag(this.elements[i]);
	}
	
	function drag(oDiv)
	{
		oDiv.onmousedown=function (ev)
		{
			var oEvent=ev||event;
			var disX=oEvent.clientX-oDiv.offsetLeft;
			var disY=oEvent.clientY-oDiv.offsetTop;
			
			document.onmousemove=function (ev)
			{
				var oEvent=ev||event;
				
				oDiv.style.left=oEvent.clientX-disX+'px';
				oDiv.style.top=oEvent.clientY-disY+'px';
			};
			
			document.onmouseup=function ()
			{
				document.onmousemove=null;
				document.onmouseup=null;
			};
		};
	}
});