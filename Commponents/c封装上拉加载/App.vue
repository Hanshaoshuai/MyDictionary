<template>
  	<div class="page-loadmore">
	    <div class="page-loadmore-wrapper" ref="wrapper" :style="{ height: wrapperHeight + 'px' }">
	      	<mt-loadmore :top-method="loadTop" @translate-change="translateChange" @top-status-change="handleTopChange" :bottom-method="loadBottom" @bottom-status-change="handleBottomChange" :bottom-all-loaded="allLoaded" :top-distance=50 :bottom-distance=50 ref="loadmore">
		        <ul class="page-loadmore-list" ref="lists">
		          	<li v-for="(item,index) in list" class="page-loadmore-listitem border-bottom">
		          		<div class="imgs"><img :src="item.img" alt="" /></div>
		          		<div class="text">
		          			<div>{{item.name}}</div>
		          			<div class="page">单价：<font>{{item.sell_price}} 元</font></div>
		          			<div>销量：<font>{{item.catid}}</font></div>
		          		</div>
		          	</li>
		        </ul>
		       	<div slot="top" class="mint-loadmore-top">
		          	<span v-show="topStatus !== 'loading'" :class="{ 'is-rotate': topStatus === 'drop' }" ref="statusTop"> ↓ </span>
		          	<span v-show="topStatus == 'drop'">请释放更新吧</span>
		          	<transition name="fade">
			          	<span v-show="topStatus === 'loading'">
			            	<mt-spinner :type="3" color="#26a2ff"></mt-spinner>
			          	</span>
		          	</transition>
		        </div>
		        <div slot="bottom" class="mint-loadmore-bottom">
		          	<span v-show="bottomStatus !== 'loading'" :class="{ 'is-rotate': bottomStatus === 'drop' }" ref="statusBottom"> ↑ </span>
		          	<span v-show="bottomStatus == 'drop'">请释放加载吧</span>
		          	<transition name="fade">
			          	<span v-show="bottomStatus === 'loading'">
			            	<mt-spinner :type="3" color="#26a2ff"></mt-spinner>
			          	</span>
		          	</transition>
		        </div>
	      	</mt-loadmore>
	      	<transition name="fade">
	      		<span class="Prompt" v-show="PromptShow">暂无更多数据</span>
	      	</transition>
	    </div>
  	</div>
</template>

<script type="text/babel">
  	export default {
	    data() {
	      	return {
	      		listdata:"",//获取的总数据
		        list: [],	//上拉加载数据
		        refurbish:[],//刷新数据
		        allLoaded: false,
		        bottomStatus: '',
		        wrapperHeight: 0,
		        topStatus: '',
		        translate: 0,
		        PromptShow:false
	      	};
	    },
	    methods: {
	    	handleTopChange(status) {
		        this.topStatus = status;
	      	},
	      	loadTop(drop) {
	      		this.topStatus = drop;
	        	setTimeout(() => {
	        		var length = this.listdata.length;
	        		var y = 0;
	        		var w = 20;
                   	var p = this.listdata.length;
                   	if(p<w){
                   		w = p;
                   	}
		          	for (let i = 0; i < w; i++) {
		          		y=Math.floor(Math.random()*length);
		          		console.log(y)
		          		this.refurbish[i]=(this.listdata[y]);
		          	}
		          	this.list = this.refurbish;
		          	this.$refs.loadmore.onTopLoaded();
	        	}, 1000);
	      	},
	      	handleBottomChange(status) {
	        	this.bottomStatus = status;
	      	},
	      	translateChange(translate) {
		        const translateNum = +translate;
		        this.translate = translateNum.toFixed(2);
		        console.log(this.translate)
	      	},
	      	loadBottom() {
		        setTimeout(() => {
		        	var length = this.listdata.length;
		          	var lastValue = this.list.length;
		          	var u = 0;
		          	if (lastValue <= length) {
		          		var x = 10;
		          		if(length-lastValue<10){
		          			x=length-lastValue;
		          			u = 1;
		          		};
			            for (let i = 0; i < x; i++) {
			              	this.list.push(this.listdata[lastValue + i]);
			            };
		          	}else{
		            	this.allLoaded = true;
//		            	let times = setTimeout(()=>{
//				        	this.PromptShow = false;
//				        	clearTimeout(times);
//				        },1500);
		          	};
		          	if (lastValue == length && u == 1) {
		          		this.PromptShow = true;
			          	let times = setTimeout(()=>{
				        	this.PromptShow = false;
				        	clearTimeout(times);
				        },1500);
			        };
		          	this.$refs.loadmore.onBottomLoaded();
		        }, 1000);
	      	},
		},
	    created() {
//	        this.$http.get('http://datainfo.duapp.com/shopdata/getGoods.php?callback=').then((response) => {
//	                   	this.listdata = response.data;
//	                   	console.log(this.listdata)
//	                   	this.listdata = this.listdata.substring(1,this.listdata.length-1);
//	                   	this.listdata = JSON.parse(this.listdata);
	        this.$http.get('http://121.196.218.57/index.php/api/shop/shopList').then((response) => { 
	        			this.listdata = response.data.data;
	        			console.log(this.listdata)
	                   	var w = 10;
	                   	var p = this.listdata.length;
	                   	if(p<w){
	                   		w = p;
	                   	};
	                   	console.log(this.listdata)
	                   	for (let i = 0; i < w; i++) {
				        	this.list.push(this.listdata[i]);
				      	};
				      	this.$nextTick(function() {
					      	console.log(this.$refs.lists)
					      	this.$refs.lists.children[0].setAttribute("class","page-loadmore-listitem border-topbottom");
				      	});
	        		}, (response) => {
	                    console.log('error');
	        		});
	    },
	    mounted() {
	    	this.$nextTick(function() {
	      		this.wrapperHeight = document.documentElement.clientHeight - this.$refs.wrapper.getBoundingClientRect().top;
			});
	    }
  	};
</script>
<style lang="scss">
	@import "./common/css/border";
/*<style lang="scss" scoped>*/
	.mint-loadmore-top span {
	    -webkit-transition: .2s linear;
	    transition: .2s linear
	}
	.mint-loadmore-top span {
	    display: inline-block;
	    vertical-align: middle
	}
	.mint-loadmore-top span.is-rotate {
	    -webkit-transform: rotate(180deg);
	    transform: rotate(180deg)
	}
	.page-loadmore .mint-spinner {
	    display: inline-block;
	    vertical-align: middle
	}
	.page-loadmore-listitem {
		width:100%;
		overflow:hidden;
		.text{
			width:40%;
			float:right;
			padding:0.2rem 0.14rem;
			line-height:0.18rem;
			.page{
				padding:0.1rem 0 0.1rem 0;
				font{
					color:#C9302C;
				}
			}
		}
	}
	.page-loadmore-listitem .imgs{
		overflow:hidden;
		width: 1.6rem;
		height: 1.6rem;
	    margin:0.1rem 0 0.1rem 0.18rem;
	    float:left;
		img{
			width:100%; 
		   	height:100%; 
		   	background-image:url(../dist/20170618105619.jpg);
		   	background-size:100%;
		   	/*background-position:1px 1px;*/
	    	background-repeat:no-repeat;
		}
	}
	.page-loadmore-listitem:last-child {
	}
	.page-loadmore-wrapper {
	    overflow: scroll
	}
	.mint-loadmore-bottom span {
	    display: inline-block;
	    -webkit-transition: .2s linear;
	    transition: .2s linear;
	    vertical-align: middle
	}
	.mint-loadmore-bottom span.is-rotate {
	    -webkit-transform: rotate(180deg);
	    transform: rotate(180deg)
	}
	/*c3动画*/
	.fade-enter-active {
	  	transition: all .6s ease;
	}
	.fade-leave-active {
	  	transition: all .6s ease;
	}
	.fade-enter, .fade-leave-active {
	  	/*transform: translateY(0.5rem);*/
	  	/*transform:rotate(360deg);*/
	  	opacity: 0;
	}
	.Prompt{
		position:fixed;
		left:0;
		bottom:0;
		display:inline-block;
		width:100%;
		height:0.5rem;
		line-height:0.5rem;
		text-align:center;
		color:#2C3E50;
		background:rgba(0,0,0,0.05);
	}
</style>
