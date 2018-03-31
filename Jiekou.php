<?php
header("Access-Control-Allow-Origin: *");
echo <<<EOT
	{
		banner:[http://images.sctvgo.com/ad/201703/201703271057038779.jpg],
		nav: [
			{url:"http://m.sctvgo.com/Themes/default/images/menu/cate.png",
			title: "/home",
			name: "商品列表"},
			{url:"http://m.sctvgo.com/Themes/default/images/menu/favor.png",
			title: "/kind",
			name: "我的关注"},
			{url:"http://m.sctvgo.com/Themes/default/images/menu/cart.png",
			title: "/cart",
			name: "购物车"},
			{url:"http://m.sctvgo.com/Themes/default/images/menu/center.png",
			title: "/user",
			name: "我的星空"}
			],
		floorLive:{
			url: "http://images.sctvgo.com/product/web/basic/201610/201610171024370146.jpg",
			name: "clara破壁机升级加热装",
			desc: "clara破壁机升级加热装",
			price: "¥&nbsp;799.00",
			goodsID:"3"
		},
		hotProduct:[
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612221443334190.jpg",
				price: "¥&nbsp;1280.00",
				goodsID:"3"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612051313145179.jpg",
				price: "¥&nbsp;19800.00",
				goodsID:"7"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612211050200757.jpg",
				goodsID:"6",
				price: "¥&nbsp;1280.00"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612051732122497.jpg",
				goodsID:"4",
				price: "¥&nbsp;298.00"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612191731125425.jpg",
				goodsID:"11",
				price: "¥&nbsp;19800.00"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612221506144553.jpg",
				goodsID:"1",
				price: "¥&nbsp;298.00"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201612/201612230929466293.jpg",
				goodsID:"2",
				price: "¥&nbsp;399.00"
			},
			{
				url: "http://images.sctvgo.com/product/web/basic/201611/201611231655478059.jpg",
				goodsID:"8",
				price: "¥&nbsp;298.00"
			}
		],
		kindList: {
			life:[
				{
					url: "http://images.sctvgo.com/product/web/basic/201610/201610211446591992.jpg ",
					price: "¥&nbsp;238.00",
					goodsID:"4",
					name: "洁宜佳活氧洁净管家全方位清洁组"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201611/201611251610095045.jpg  ",
					price: "¥&nbsp;998.00",
					goodsID:"5",
					name: "掇球四君子紫砂壶套组"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201701/201701181530186138.jpg  ",
					price: "¥&nbsp;1999.00",
					goodsID:"6",
					name: "科沃斯智能擦窗机器人"
				}
			],
			food:[
				{
					url: "http://images.sctvgo.com/product/web/basic/201611/201611180903490225.jpg ",
					price: "¥&nbsp;298.00",
					goodsID:"8",
					name: "安多高原牦牛颈骨罐装美味组惠"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201611/201611231655478059.jpg",
					price: "¥&nbsp;298.00",
					goodsID:"9",
					name: "雅妹子腊肉香肠合家欢组惠"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612191725121293.jpg ",
					price: "¥&nbsp;299.00",
					goodsID:"7",
					name: "爱度亚麻油分享组惠"
				}
			],
			popular:[
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612141021339639.jpg  ",
					price: "¥&nbsp;298.00",
					goodsID:"4",
					name: "老爷车男士内绒保暖衬衫"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612221537374102.jpg ",
					price: "¥&nbsp;298.00",
					goodsID:"5",
					name: "道途森登山鞋特惠组惠"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612301039579736.jpg ",
					price: "¥&nbsp;298.00",
					goodsID:"6",
					name: "鸭鸭男士加绒户外冲锋衣"
				}
			],
			cosmetology:[
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612151558183295.jpg ",
					price: "¥&nbsp;298.00",
					goodsID:"3",
					name: "MISSSHOW电动秀足机专享组"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612221548061435.jpg ",
					price: "¥&nbsp;399.00",
					goodsID:"2",
					name: "歌丽姬宝美肌素颜霜"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201701/201701041228390282.jpg ",
					price: "¥&nbsp;299.00",
					goodsID:"15",
					name: "歌丽姬宝赋活新生尊享组"
				}
			],
			jewellery:[
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612231013160225.jpg ",
					price: "¥&nbsp;1980.00",
					goodsID:"10",
					name: "好运连连和田玉套组"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201610/201610191001150744.jpg ",
					price: "¥&nbsp;1280.00",
					goodsID:"11",
					name: "李智会作品《吉祥如意图》花鱼斗方"
				},
				{
					url: "http://images.sctvgo.com/product/web/basic/201612/201612221017023471.jpg ",
					price: "¥&nbsp;5980.00",
					goodsID:"12",
					name: "汉唐古韵羊脂玉挂件套组"
				}
			]
		}
		
	}
EOT;
?>