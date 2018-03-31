var express = require('express');
var router = express.Router();
var http = require('http');
var cheerio = require('cheerio');
var fs = require("fs");

/* GET home page. */
router.get('/', function(request, response, next) {

  http.get("http://www.sina.com.cn/",function(res){
  	
  	if(res.statusCode == 200) {
  		var html = "";
  		res.on("data",function(data){
  			html += data;
  		})

  		res.on("end",function(){

  			$ = cheerio.load(html);

  			var result = {
  				ret : true,
  				data: {
  					list: []
  				}
  			},
  			navItems = $(".nav-mod-1 li");

  			for(var i = 0 ;i < navItems.length; i++) {

  				var itemsEveryone = navItems.eq(i);
  				console.log(itemsEveryone)
  				var items = itemsEveryone.find("a").text();
  				var href = itemsEveryone.find("a").attr("href");
  				result.data.list.push({
  					items: items,
  					href: href
  				})
  			}

      fs.writeFile('sina.json',  JSON.stringify(result), function(err){
          if(err) {
            console.log("写入数据失败");
          }else{
            console.log("写入数据成功");
          }
      });

  		response.json(result);

  		})
  	}

  })

});

module.exports = router;
