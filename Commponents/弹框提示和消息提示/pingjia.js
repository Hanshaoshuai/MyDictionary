$(function() {
//	fn();
	yulan();
//	pinfen();
})

//左边
function fn() {
	$("#ul").children().on('click', function() {
		$(this).addClass("active").siblings('li').removeClass('active');
		$.ajax({
			type: "get",
			url: "",
			async: true
		});
	})
}

//右边 图片上传预览
function yulan() {
	var arr = [];
	$("#file_input").change(function() {
		var html = '';
		var $file = $(this);
		var fileObj = $file[0];
		var windowURL = window.URL || window.webkitURL;
		var dd = document.getElementById("yltp");
		var dataURL;
		if(fileObj && fileObj.files && fileObj.files[0]) {
			for(var i = 0; i < fileObj.files.length; i++) {
				arr.push(window.URL.createObjectURL(fileObj.files[i]));
			}
			for(var j = 0; j < arr.length; j++) {
				if(arr.length > 3) {
					console.log(arr);
					var num = arr.length - 1;
					alert("对不起，你上传的图片数量超出限制，请重新上传");
					arr.splice(num,1);
					console.log(arr);
					return;
				}
				html += '<div class="zsimg_div fl">' +
					'<img class="img" src="' + arr[j] + '" />' +
					'<span>删除</span>' +
					'</div>';
			}
			$(dd).html(html);
			$('.zsimg_div').on('mouseenter', function() {
				$(this).children("span").animate({
					"bottom": "0"
				}, 200, function() {
					$(".zsimg_div").children("span").on("click", function() {
						$(this).parent().remove();
						var imgLujin = $(this).siblings('img').attr('src');
						console.log(imgLujin);
						for(var i = 0; i < arr.length; i++){
							if(arr[i] == imgLujin){
								arr.splice(i,1);
								break;
							}
						}
						console.log(arr);
					})
				});
			})
			$('.zsimg_div').on('mouseleave', function() {
				$(this).children("span").animate({
					"bottom": "-40px"
				}, 200);
			})
		} else {
			dataURL = $file.val();
			arr.push(dataURL);
			for(var j = 0; j < arr.length; j++) {
				if(arr.length > 3) {
					alert("对不起，你上传的图片数量超出限制，请重新上传");
					return;
				}
				html += '<div class="zsimg_div fl">' +
					'<img class="img" src="' + arr[j] + '" />' +
					'<span>删除</span>' +
					'</div>';
			}
			$(dd).html(html);
			var imgObj = $('.img');
			for(var i = 0; i < imgObj.length; i++) {
				imgObj[i].style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
				imgObj[i].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = arr[i];
			}
				$('.zsimg_div').on('mouseenter', function() {
				$(this).children("span").animate({
					"bottom": "0"
				}, 200, function() {
					$(".zsimg_div").children("span").on("click", function() {
						$(this).parent().remove();
						var imgLujin = $(this).siblings('img').attr('src');
						console.log(imgLujin);
						for(var i = 0; i < arr.length; i++){
							if(arr[i] == imgLujin){
								arr.splice(i,1);
								break;
							}
						}
						console.log(arr);
					})
				});
			})
			$('.zsimg_div').on('mouseleave', function() {
				$(this).children("span").animate({
					"bottom": "-40px"
				}, 200);
			})
		}
	});
}
//右边 图片上传预览
//function yulan() {
//	var input = document.getElementById("file_input");
//	var result;
//	if(typeof FileReader === 'undefined') {
//		result.innerHTML = "抱歉，你的浏览器不支持 FileReader";
//		input.setAttribute('disabled', 'disabled');
//	} else {
//		input.addEventListener('change', readFile, false);
//	}
//
//	function readFile() {
//		for(var i = 0; i < this.files.length; i++) {
//			if(!input['value'].match(/.jpg|.gif|.png|.bmp/i)) {　　 //判断上传文件格式   
//				return alert("上传的图片格式不正确，请重新选择")　　　　　　　　　
//			}
//			if(this.files.length > 3) {
//				return alert("上传的图片的数量过多,请重新选择")
//			}
//			var reader = new FileReader();
//			reader.readAsDataURL(this.files[i]);
//			reader.onload = function(e) {
//				result = '<div class="zsimg_div fl"><img src="' + this.result + '" alt="" /><span>删除</span></div>';
//				$("#yltp").append(result);
//				$('.zsimg_div').on('mouseenter', function() {
//					$(this).children("span").animate({
//						"bottom": "0"
//					}, 200, function() {
//						$(".zsimg_div").children("span").on("click", function() {
//							$(this).parent().remove();
//						})
//					});
//				})
//				$('.zsimg_div').on('mouseleave', function() {
//					$(this).children("span").animate({
//						"bottom": "-40px"
//					}, 200);
//				})
//			}
//		}
//	}
//}

function pinfen() {
	$(".star_bg").children("a").on('click', function() {
		var cls = $(this).attr("data-a");
		console.log(cls)
		if(cls == "5") {
			$(this).removeClass("star").prevAll().removeClass("star");
			$(this).parent().next().html("非常好");
		}
		if(cls == "4") {
			$(this).removeClass("star");
			$(this).prevAll().removeClass("star");
			$(this).nextAll().addClass("star");
			$(this).parent().next().html("好");
		}
		if(cls == "3") {
			$(this).removeClass("star");
			$(this).prevAll().removeClass("star");
			$(this).nextAll().addClass("star");
			$(this).parent().next().html("一般");
		}
		if(cls == "2") {
			$(this).removeClass("star");
			$(this).prevAll().removeClass("star");
			$(this).nextAll().addClass("star");
			$(this).parent().next().html("差");
		}
		if(cls == "1") {
			$(this).nextAll().addClass("star");
			$(this).parent().next().html("非常差");
		}
	})
}