// mongod --config /usr/local/etc/mongod.conf
// mongo
// nodemon

//MySql密码 1yDx59q,nkv!
//查看所用已启动项目：
//pm2 list
//
//启动项目
// pm2 start index.js
//pm2 start index.js --attach 启动后监听显示日志流
//
//重启：
//pm2 restart XXX
//
//
//停止：
//pm2 stop XXX
//
//
//删除
//pm2 delete XXX

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var util = require('util'); // util.inspect()是将对象转换成字符串
var fs = require('fs');
// var multer = require('multer');
const Router = require('router')
const router = Router()

router.__dataStore = {}

const formidable = require('formidable');
var MongoClient = require('mongodb').MongoClient;


var app = express();
app.use(bodyParser.json())// 创建 application/json 解析并注册  不然  req.body  接收不到前端传递的数据
var url = 'mongodb://127.0.0.1:27017/runoob';

app.use(cookieParser());
// app.use(multer({ dest: path.join(__dirname, './uploads/'), limits: { fieldSize: 100000000000 } }).any());
// app.use(multer({ storage: storage, limits: { fieldSize: 100000000000 } }).any());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');

  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('strict-origin-when-cross-origin', '*');

  next();
});

// var hostName = '127.0.0.1';
var hostName = ''; // 这个ip地址，之前一直以为是在这里指定IP地址，意味着输入这个IP地址就能访问到你的服务器了，其实并不是。如果指定IP地址，是意味着只有ip地址为这个才可以访问。所以，通常，如果任何人都可以访问，则不写// 页面调用接口，服务器IP加上下面的端口号就可以了
var ports = 2021;
var server = app.listen(ports, hostName, () => {
  console.log(`服务器运行在http:${hostName}:${ports}`);
  // var host = server.address().address;
  // var port = server.address().port;
});
var io = require('socket.io')(server, { cors: true });

app.use('/public', express.static(path.join(__dirname, 'public'))); //中间件来设置静态文件路径。例如你将图片CSS,JavaScript文件放在public目录下
// app.get('/index.html', function (req, res) {
//   console.log(req, __dirname);
//   res.sendFile(__dirname + '/' + 'index.html');
// });

io.sockets.on('connection', function (socket) {
  //此处每个回调socket就是一个独立的客户端，通常会用一个公共列表数组统一管理
  //socket.broadcast用于向整个网络广播(除自己之外)
  // 监听客户端emit的clientmessage事件发送的消息
  socket.on('clientmessage', function (data) {
    // console.log('clientmessagkkkkkkkkkkkkkkkkkkkkk', data);
    if (data.uploadCompleted) {//只作为图片上传完成使用
      socket.broadcast.emit('message', {
        text: 'uploadCompleted',
      });
      socket.emit('message', {
        text: 'uploadCompleted',
      })
      return;
    }
    if (data.toDataURL) {
      socket.broadcast.emit('message', {
        text: data,
      });
      socket.emit('message', {
        text: data,
      });
      return;
    }
    if (Array.isArray(data.toName)) {
      data.type = 'groupChat';
    } else {
      data.type = 'chat';
    }
    data.dateTime = Date.parse(new Date());
    //推送给除自己外其他所有用户的消息，类似于广播
    // socket.broadcast.emit('message', {
    //   text: data,
    // });
    if (data.text_last) {
      return;
    }
    if (Array.isArray(data.toName)) {
      //群聊//记录存入
      todo(data, socket);
      // socket.emit('message', {
      //   text: data,
      // });
    } else {
      data.toName = data.toName.toString();
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db('runoob');
        var whereStr = { name: data.toName }; // 查询条件
        dbo
          .collection('site')
          .find(whereStr)
          .toArray(function (err, result) {
            if (err) throw err;
            // console.log(result);
            if (result && result.length !== 0) {
              data.type = 'chat';
              //记录存入
              todo(data, socket);
            } else if (data.toName !== '') {
              data.type = 'chat';
              data.text = '没有该用户！';
              socket.emit('message', {
                text: data,
              });
            }
            db.close();
          });
      });
    }
  });
  //发送给自己的消息
  socket.emit('message', {
    text: '你上线了',
  });
  //告诉所有人上线了(除自己之外)
  socket.broadcast.emit('message', {
    text: uid + '上线了',
  });
  //连接断开，如关闭页面时触发
  socket.on('disconnect', function (data) {
    // console.log('123456789', data);
    // socket.emit('c_leave','离开');
    //socket.broadcast用于向整个网络广播(除自己之外)
    socket.broadcast.emit('message', {
      text: uid + '离开了',
    });
  });
});

//存入记录
function todo(obj, socket) {
  // console.log('写入文件', obj);
  //创建目录
  var fromTo = null,
    objs = [];
  fs.mkdir('./chatRecord', function (error) {
    if (error) {
      // console.log(error);
      return false;
    }
    // console.log('创建目录成功');
  });
  if (obj.type === 'groupChat') {
    if (obj.groupName) {
      fromTo = obj.groupName;
      fsChenge(obj, socket);
    }
  } else {
    fromTo = (obj.fromName * 1 + obj.toName * 1).toString() + '.txt';
    fsChenge(obj, socket);
  }
  function fsChenge(emitData, socket) {
    // console.log('写入文件名2222', fromTo);
    fs.exists('./chatRecord/' + fromTo, function (exists) {
      if (exists) {
        // console.log('文件存在');
        // 5.fs.readFile 读取文件
        fs.readFile('./chatRecord/' + fromTo, function (error, data) {
          if (error) {
            // console.log('读取文件error', error);
            return false;
          }
          //console.log(data);  //data是读取的十六进制的数据。  也可以在参数中加入编码格式"utf8"来解决十六进制的问题;
          // console.log('读取出所有行的信息 ',data.toString());  //读取出所有行的信息
          objs = JSON.parse(data.toString());
          var length = objs.length;
          if (obj.text.friends === 'yes') {
            if (objs.length === 1) {
              objs[0].friend = 'yes';
            } else {
              if (length >= 1) {
                objs[length - 1].friend = 'yes';
              }
              if (length >= 2) {
                objs[length - 2].friend = 'yes';
              }
            }
          } else if (obj.text.addFriend === 2) {
            if (objs.length === 2) {
              objs[1].friend = 'yes';
            } else {
              objs[length - 1].friend = 'yes';
              // objs[length-2].friend = 'yes';
            }
          } else {
            if (objs.length === 1) {
              objs[0].friend = 'yes';
            } else {
              if (length >= 1) {
                objs[length - 1].friend = 'yes';
              }
              if (length >= 2) {
                objs[length - 2].friend = 'yes';
              }
            }
          }
          objs.push(obj);
          objs = JSON.stringify(objs);
          fs.writeFile(
            './chatRecord/' + fromTo,
            objs,
            'utf8',
            function (error) {
              if (error) {
                // console.log(error);
                return false;
              }
              // console.log('写入成功');
              creatNameber(emitData, socket);
            }
          );
        });
      }
      if (!exists) {
        // console.log('文件不存在');
        //3. fs.writeFile  写入文件（会覆盖之前的内容）（文件不存在就创建）  utf8参数可以省略
        objs.push(obj);
        objs = JSON.stringify(objs);
        fs.writeFile('./chatRecord/' + fromTo, objs, 'utf8', function (error) {
          if (error) {
            // console.log(error);
            return false;
          }
          // console.log('写入成功');
          creatNameber(emitData, socket);
        });
      }
    });
  }
  // 下面是存入数据库的
  // 	MongoClient.connect(url, function (err, db) {
  // 		if (err) throw err;
  // 		console.log('数据库已创建');
  // 		var dbase = db.db("runoob");
  // 		dbase.createCollection('chatRecord', function (err, res) {
  // 			if (err) throw err;
  // 			console.log("创建集合!");
  // 			db.close();
  // 			MongoClient.connect(url, function(err, db) {
  // 				if (err) throw err;
  // 				var dbo = db.db("runoob");
  // 				dbo.collection("chatRecord").insertOne(obj, function(err, res) {
  // 					if (err) throw err;
  // 					console.log("记录成功");
  // 					creatNameber(obj,socket)
  // 					db.close();
  // 				});
  // 			});
  // 		});
  // 	});
}

//  视频聊天部分↓↓↓
app.get('/data/:id', function (req, res) {
  console.log('get===>>>', req.query, req.params)
  const deviceId = req.params.id
  // console.log(deviceId)
  if (!router.__dataStore[deviceId] || router.__dataStore[deviceId].length === 0) {
    // console.log('无数据')
    res.statusCode = 200
    res.end('无数据')
  } else {
    // console.log(router.__dataStore)
    const data = router.__dataStore[deviceId].shift()
    // console.log('我发给了谁' + deviceId)
    console.log('data====>>>>>', data)
    res.statusCode = 200
    res.end(JSON.stringify(data))
  }
})

app.post('/data/:id', (req, res) => {
  console.log('post请求成功===>>>', req.params)
  const deviceId = req.params.id
  // console.log(deviceId)
  if (!router.__dataStore[deviceId]) {
    router.__dataStore[deviceId] = []
  }
  // console.log('我准备push了')
  // console.log(req.body)
  router.__dataStore[deviceId].push(req.body)
  res.statusCode = 200
  res.end('11')
})
//  视频聊天部分↑↑↑

//消息累计
function creatNameber(obj, socket) {
  // console.log('消息累计', obj);
  var dateTime = parseInt(Date.parse(new Date())).toString();
  if (obj.type === 'groupChat') {
    // console.log('群聊');
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db('runoob');
      var whereStr = { buildingGroupName: obj.nickName }; // 查询条件
      dbo
        .collection('buildingGroup')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          if (result_1[0]) {
            // console.log('数据：', result_1[0]);
            //					var dateTime = parseInt(Date.parse(new Date())).toString();
            for (var i = 0; i < result_1[0].name.length; i++) {
              if (result_1[0].name[i].name !== obj.fromName) {
                result_1[0].name[i].newsNumber += 1;
              }
            }
            // console.log('数据ok：', result_1[0].name);image/*, video/
            MongoClient.connect(url, function (err, db) {
              var dbo = db.db('runoob');
              var whereStr = { buildingGroupName: obj.nickName }; // 查询条件
              var text_a = '';
              if (obj.myIconName) {
                text_a = obj.myIconName + '：';
              }
              if (!obj.text) {
                obj.text = `[${obj.file.fileClass}文件]`
                if (obj.file.fileType === 'image') {
                  obj.text = `[${obj.file.fileClass}图片]`
                }
                if (obj.file.fileType === 'video') {
                  obj.text = `[${obj.file.fileClass}视频]`
                }
              }

              var updateStr = {
                $set: {
                  name: result_1[0].name,
                  text: text_a + obj.text,
                  dateTime: dateTime,
                },
              }; //更换内容
              // console.log('第-道', updateStr);
              dbo
                .collection('buildingGroup')
                .updateOne(whereStr, updateStr, function (err, res) {
                  if (err) throw err;
                  // console.log(res);
                  // console.log('更改请求方数据成功');
                  socket.emit('message', {
                    text: obj,
                  });
                  if (!obj.file) {
                    socket.broadcast.emit('message', {
                      text: obj,
                    });
                  }
                  db.close();
                  // resto.send({code:200,msg:'已阅读暂无消息'});
                });
            });
          } else {
            db.close();
          }
        });
    });
    return;
  } else {
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db('runoob');
      var whereStr = { name: obj.fromName }; // 查询条件
      dbo
        .collection('site')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          if (result_1) {
            var objs = result_1[0].linkFriends;
            for (var i = 0; i < objs.length; i++) {
              // if (!obj.Own && objs[i].fromName) {
              //   break;
              // }
              if (objs[i].friendName === obj.toName) {
                objs[i].newsNumber = objs[i].newsNumber * 1 + 1;
                objs[i].dateTime = parseInt(Date.parse(new Date())).toString();
                if (!obj.text) {
                  obj.text = `[${obj.file.fileClass}文件]`
                  if (obj.file.fileType === 'image') {
                    obj.text = `[${obj.file.fileClass}图片]`
                  }
                  if (obj.file.fileType === 'video') {
                    obj.text = `[${obj.file.fileClass}视频]`
                  }
                }
                objs[i].chatRecord = obj.text;
                //							var dateTime = parseInt(Date.parse(new Date())).toString();
                // console.log('消息累计返回符合非共和国', objs);
                MongoClient.connect(url, function (err, db) {
                  var dbo = db.db('runoob');
                  var whereStr = { name: obj.fromName }; // 查询条件
                  var updateStr = {
                    $set: { linkFriends: objs, dateTime: dateTime },
                  }; //更换内容
                  // console.log('第-道', updateStr);
                  dbo
                    .collection('site')
                    .updateOne(whereStr, updateStr, function (err, res) {
                      if (err) throw err;
                      // console.log('消息提示累计成功');
                      // cocket发送消息
                    });
                });
                break;
              }
            }
            db.close();
          } else {
            db.close();
          }
        });
    });
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db('runoob');
      var whereStr = { name: obj.toName }; // 查询条件
      dbo
        .collection('site')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          if (result_1) {
            var objs = result_1[0].linkFriends;
            for (var i = 0; i < objs.length; i++) {
              if (objs[i].friendName === obj.fromName) {
                objs[i].chatRecord = obj.text;
                objs[i].dateTime = dateTime;
                // console.log('消息累计返回符合非共和国', objs);
                MongoClient.connect(url, function (err, db) {
                  var dbo = db.db('runoob');
                  var whereStr = { name: obj.toName }; // 查询条件
                  var updateStr = {
                    $set: { linkFriends: objs, dateTime: dateTime },
                  }; //更换内容
                  // console.log('第2道', updateStr);
                  dbo
                    .collection('site')
                    .updateOne(whereStr, updateStr, function (err, res) {
                      if (err) throw err;
                      // console.log('消息提示累计成功');
                    });
                });
                break;
              }
            }
            db.close();
          } else {
            db.close();
          }
        });
    });
    socket.emit('message', {
      text: obj,
    });
    socket.broadcast.emit('message', {
      text: obj,
    });
  }
}

//钱多多
app.get('/qq', function (req, res, next) {
  var result = {
    results: [
      { name: 1001, login: '您未登录解放路!' },
      { name: 1002, login: '您未登录的合法化!' },
      { name: 1003, login: '您未登录收到回复客户!' },
      { name: 1004, login: '您未登录东方嘉盛!' },
      { name: 1005, login: '您未登录非得浪费东方嘉盛!' },
    ],
  };
  // console.log('post请求参数：', req.body);
  res.send(result);
});


// app.configure(function() {
//   //默认情况下Express并不知道该如何处理该请求体，因此我们需要增加bodyParser中间件，用于分析
//   //application/x-www-form-urlencoded和application/json
//   //请求体，并把变量存入req.body。我们可以像下面的样子来“使用”中间件[这个保证POST能取到请求参数的值]：
//   app.use(express.bodyParser());
// });

// //创建集合
//  MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     console.log('数据库已创建');
//     var dbase = db.db("runoob");
//     dbase.createCollection('site', function (err, res) {
//         if (err) throw err;
//         console.log("创建集合!");
//         db.close();
//     });
// });
// //插入一条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var myobj = { name: "菜鸟教程", url: "'😀 😃 😄 😁 😆 😅 😂 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙
// 		😚 😋 😜 😝 😛 🤑 🤗 🤓 😎 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 😤 😠 😡 😶 😐 😑 😯 😦 😧 😮 😲 😵
// 		 😳 😱 😨 😰 😢 😥 😭 😓 😪 😴 🙄 🤔 😬 🤐 😷 🤒 🤕 😈 👿 👹 👺 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻
// 		 😼 😽 🙀 😿 😾 👐 🙌 👏 🙏 👍 👎 👊 ✊ 🤘 👌 👈 👉 👆 👇 ✋  🖐 🖖 👋  💪 🖕 ✍️  💅 🖖 💄 💋 👄 👅 👂 👃 👁 👀 '" };
//     dbo.collection("site").insertOne(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("文档插入成功");
//         db.close();
//     });
// });
//
// //插入多条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var myobj =  [
//         { name: '菜鸟工具', url: 'https://c.runoob.com', type: 'cn'},
//         { name: 'Google', url: 'https://www.google.com', type: 'en'},
//         { name: 'Facebook', url: 'https://www.google.com', type: 'en'}
//        ];
//     dbo.collection("site").insertMany(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("插入的文档数量为: " + res.insertedCount);
//         db.close();
//     });
// });
//
// //更新一条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var whereStr = {"name":'菜鸟教程'};  // 查询条件
//     var updateStr = {$set: { "url" : "https://www.runoob.com" }};
//     dbo.collection("site").updateOne(whereStr, updateStr, function(err, res) {
//         if (err) throw err;
//         console.log("文档更新成功");
//         db.close();
//     });
// });
// //更新多条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var whereStr = {"type":'en'};  // 查询条件
//     var updateStr = {$set: { "url" : "https://www.runoob.com" }};
//     dbo.collection("site").updateMany(whereStr, updateStr, function(err, res) {
//         if (err) throw err;
//          console.log(res.result.nModified + " 条文档被更新");
//         db.close();
//     });
// });
// //删除一条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var whereStr = {"name":'菜鸟教程'};  // 查询条件
//     dbo.collection("site").deleteOne(whereStr, function(err, obj) {
//         if (err) throw err;
//         console.log("文档删除成功");
//         db.close();
//     });
// });
// //删除多条数据
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("runoob");
//     var whereStr = { type: "en" };  // 查询条件
//     dbo.collection("site").deleteMany(whereStr, function(err, obj) {
//         if (err) throw err;
//         console.log(obj.result.n + " 条文档被删除");
//         db.close();
//     });
// });
// setTimeout(function(){
// 	// 查询数据
// 	MongoClient.connect(url, function(err, db) {
// 	    if (err) throw err;
// 	    var dbo = db.db("runoob");
// 	    dbo.collection("site"). find({}).toArray(function(err, result) { // 返回集合中所有数据
// 	        if (err) throw err;
// 	        // console.log(result);
// 	        db.close();
// 	    });
// 	});
//
// 	// 查询指定条件的数据
// 	MongoClient.connect(url, function(err, db) {
// 	    if (err) throw err;
// 	    var dbo = db.db("runoob");
// 	     var whereStr = {"name":'菜鸟教程'};  // 查询条件
// 	    dbo.collection("site").find(whereStr).toArray(function(err, result) {
// 	        if (err) throw err;
// 	        // console.log(result);
// 	        db.close();
// 	    });
// 	});
// },2000)

//是否登录
var uid = '';
app.post('/post0', function (req, res, next) {
  var resto = res;
  // console.log('post请求参数：', util.inspect(req.cookies), req.body);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.name }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result[0].signIn === 'yes') {
          uid = result[0].name;
          // console.log(uid);
          resto.send({ code: 200, msg: '登录状态' });
        } else {
          resto.send({ code: 1001, msg: '未登录' });
        }
        db.close();
      });
  });
});
//登录
app.post('/post', function (req, res, next) {
  var resto = res;
  console.log('post请求参数：', req.body);
  // console.log(__dirname);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.name }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result.length === 0) {
          resto.send({ code: 2001, msg: '用户不存在请先注册' });
        } else if (result.length === 1) {
          if (
            result[0].name === req.body.name &&
            result[0].password === req.body.password
          ) {
            // MongoClient.connect(url, function (err, db) {
            //   var dbo = db.db('runoob');
            var whereStr = { name: req.body.name }; // 查询条件
            var updateStr = { $set: { signIn: 'yes' } }; //更换内容
            dbo
              .collection('site')
              .updateOne(whereStr, updateStr, function (err, res) {
                if (err) throw err;
                // console.log('更换成功');
                db.close();
              });
            // });
            resto.send({
              code: 200,
              msg: '您已登录成功',
              imgId: result[0].imgId,
              nickName: result[0].nickName,
            });
          } else {
            resto.send({ code: 1001, msg: '用户名或密码错误' });
          }
        }
      });
  });
});
function random3(len) {
  var pwd = '';
  for (var idx = 0; idx < len; idx++) {
    var seed = parseInt(Math.random() * 9);
    pwd = pwd + seed;
  }
  return pwd;
}
//注册
app.post('/registers', function (req, res, next) {
  var resto = res,
    reqs = req,
    result = { code: 1001, msg: '注册失败请重新注测' };
  // console.log('post请求参数：', req.body.name);
  req.body.signIn = '';
  var dateTime = parseInt(Date.parse(new Date())).toString();
  req.body.LLNumber = 'll' + random3(9);
  req.body.linkFriends = [
    {
      friendName: req.body.name,
      adopt: 'yes',
      fromName: req.body.name,
      toName: '',
      newsNumber: 0,
      dateTime: dateTime,
      chatRecord: '暂无！',
      headPortrait: req.body.headPortrait,
    },
  ];
  MongoClient.connect(url, function (err, db) {
    // console.log('1111===', err);
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.name }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, res) {
        // 返回集合中所有数据
        // console.log('22222===', res);
        if (err) throw err;
        if (res.length === 0) {
          // if (!res.acknowledged) {
          MongoClient.connect(url, function (err, db) {
            // console.log('创建集合!');
            if (!err) {
              // console.log('数据库已创建');
              var dbase = db.db('runoob');
              dbase.createCollection('site', function (err, res) {
                // console.log(err, res);
                // if (err) throw err;
                // console.log('创建集合!');
              });
            }
          });
          // }
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('runoob');
            dbo.collection('site').insertOne(reqs.body, function (err, res) {
              // console.log(err, res);
              if (err) throw err;
              // console.log('恭喜您注册成功');
              result.code = 200;
              result.msg = '恭喜您注册成功,请登录';
              resto.send(result);
              db.close();
            });
          });
          return;
        } else if (res[0].name === req.body.name) {
          result.code = 2002;
          result.msg = '用户已存在请去登录';
          resto.send(result);
          db.close();
        }
      });
  });
});

//退出登录
app.post('/post3', function (req, res, next) {
  var resto = res,
    result = { code: 1001, msg: '您未登录!' };
  // console.log('post请求参数：', req.body);
  if (req.body.name === '') {
    resto.send(result);
  } else {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db('runoob');
      var whereStr = { name: req.body.name }; // 查询条件
      var updateStr = { $set: { signIn: 'no' } };
      dbo
        .collection('site')
        .updateOne(whereStr, updateStr, function (err, res) {
          if (err) throw err;
          result.code = 200;
          result.msg = '退出成功';
          resto.send(result);
          db.close();
        });
    });
  }
});
//注销
app.post('/post2', function (req, res, next) {
  var resto = res,
    result = { code: 1001, msg: '注销失败或用户不存在' };
  // console.log('post请求参数：', req.body);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.name }; // 查询条件
    dbo.collection('site').deleteMany(whereStr, function (err, obj) {
      if (err) throw err;
      // console.log(obj.result + '个用户');
      if (obj.result) {
        resto.send(result);
      } else {
        result.code = 200;
        result.msg = '注销成功';
        resto.send(result);
      }
      db.close();
    });
  });
});

//图片接口
app.get('/get', function (req, res) {
  // console.log('请求url：', req.path);
  // console.log('Git请求参数：', req.query);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.query.id }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result[0] && result[0].signIn === 'yes') {
          uid = result[0].name;
          // console.log(uid);
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('runoob');
            var whereStr = { imgId: req.query.imgId }; // 查询条件
            dbo
              .collection('headPortrait')
              .find(whereStr)
              .toArray(function (err, result) {
                // 返回集合中所有数据
                if (err) throw err;
                // console.log(result);
                res.send({ code: 200, body: result });
                db.close();
              });
          });
        } else {
          res.send({ code: 2001, body: [] });
          db.close();
        }
      });
  });
});
// 文件视频图片查询
app.post('/queryFile', function (req, res) {
  let filePath = path.join(__dirname, req.path)
  fs.exists(filePath, function (err) {
    // console.log('123', `${filePath}/${fileName}.${reqs.body.type}`, err)
    if (!err) {
      // console.log('0000', err);
      fs.readFile(filePath, function (error, data) {
        if (error) {
          // console.log('11111', error);
          res.send({ code: 2001, msg: "失败" })
          return false;
        } else {
          res.send({ code: 200, data: data })
        }
      });
    }
  })
})

const addText = async (obj, apath, filePath, apathZoom) => {
  // console.log(obj)
  obj.clientmessage = JSON.parse(obj.clientmessage);
  var fromTos = null,
    objs = [];
  let yes = false;
  const writeFiles = (fromTo) => {
    fs.exists(filePath, function (err) {
      // console.log('123', apath, filePath, err, fromTo)
      if (err) {
        fs.readFile('./chatRecord/' + fromTo, function (error, data) {
          if (error) {
            // console.log('读取文件error', error);
            return false;
          }
          //console.log(data);  //data是读取的十六进制的数据。  也可以在参数中加入编码格式"utf8"来解决十六进制的问题;
          // console.log('读取出所有行的信息 ', data.toString());  //读取出所有行的信息
          objs = JSON.parse(data.toString());
          objs = objs.map((item) => {
            // console.log(item.file?.index * 1 === obj.imgId * 1, item.file?.index, obj.imgId)
            if (item.file && (item.file.index * 1 === obj.imgId * 1)) {
              item.file.url = apath;
              item.file.apathZoom = apathZoom;
              item.file.fileType = obj.fileType
              item.file.file = true;
              item.file.size = obj.size;
              if (obj.fileName) {
                item.file.fileName = true;
              } else {
                item.file.length = obj.length
              }

              // console.log(item)
            }
            return item;
          })
          objs = JSON.stringify(objs);
          // console.log(objs)
          fs.writeFile(
            './chatRecord/' + fromTo,
            objs,
            'utf8',
            function (error) {
              if (error) {
                // console.log(error);
                return false;
              } else {
                // console.log('写入成功');
                return true;
              }

            }
          );

        });
      }
    })
  }
  if (obj.clientmessage.type === 'groupChat') {
    fromTos = obj.clientmessage.groupName;
    yes = writeFiles(fromTos);
  } else {
    fromTos = (obj.clientmessage.fromName * 1 + obj.clientmessage.toName * 1).toString() + '.txt';
    yes = writeFiles(fromTos);
  }
  return yes;
}

// 上传图片
app.post('/file_upload', function (req, res) {
  // console.log('未处理上传的文件信息', req);  // 上传的文件信息 image imgId clientmessage
  const forms = formidable({ multiples: false, maxFieldsSize: 10000000000 });
  forms.on('progress', function (bytesReceived, bytesExpected) {
    // console.log(bytesReceived, bytesExpected);当有数据块被处理之后会触发该事件，对于创建进度条非常有用
    // if (bytesReceived === bytesExpected) {
    //   console.log('end===>>>');
    // }
  })
  // form.on('end', function () {})
  forms.parse(req, (err, fields, files) => {
    // console.log(err, fields, files)
    if (err) {
      res.send({ code: 2001, msg: "上传失败" })
      return;
    }

    var resto = res,
      reqs = fields,
      result = { code: 1001, msg: '图片提交失败', icon: '' };

    let fileName = (new Date()).getTime() + parseInt(Math.random() * 3435) + parseInt(Math.random() * 6575);
    if (reqs.image) {
      fileName = reqs.imgId
      // reqs.body.imgId = fileName;
    }

    let filePath = path.join(__dirname, '../images/Avatars')
    let apath = `/images/Avatars/${fileName}.${reqs.type}`
    let apathZoom = `/images/Avatars/${fileName}Zoom.${reqs.type}`

    if (reqs.file) { // 文件或视频处理
      fileName = reqs.fileName
      filePath = path.join(__dirname, '../images/file')
      apath = `/images/file/${fileName}.${reqs.type}`
      if (reqs.isDebug) {
        filePath = path.join(__dirname, '../public/images/file')
      }
    } else {
      if (reqs.image) {
        filePath = path.join(__dirname, '../images/images')
        apath = `/images/images/${fileName}.${reqs.type}`
        apathZoom = `/images/images/${fileName}Zoom.${reqs.type}`
      }
      if (reqs.isDebug) {
        filePath = path.join(__dirname, '../public/images/Avatars')
        if (reqs.image) {
          filePath = path.join(__dirname, '../public/images/images')
        }
      }
    }
    let base64 = null
    let base64Zoom = null
    let dataBuffer = null
    let dataBufferZoom = null
    if (reqs.file) {
      dataBuffer = Buffer.from(reqs.classIcon, 'binary');
    } else {
      base64Zoom = reqs.classIconZoom?.replace(/^data:image\/\w+;base64,/, "");
      base64 = reqs.classIcon.replace(/^data:image\/\w+;base64,/, ""); //去掉图片base64码前面部分data:image/png;base64
      if (base64Zoom) {
        dataBufferZoom = Buffer.from(base64Zoom, 'base64');
      }
      dataBuffer = Buffer.from(base64, 'base64'); //把base64码转成buffer对象，
    }
    // fs.createReadStream(base64).pipe(fs.createWriteStream(`${filePath}/${fileName}Zoom.${reqs.type}`));
    // let apath = `http://localhost:3000/node/images/${fileName}.${reqs.type}`
    // console.log(filePath)
    fs.exists(filePath, function (err) {
      // console.log('123', `${filePath}/${fileName}.${reqs.type}`, err)
      if (!err) {
        // console.log('0000', err);
        fs.mkdir(filePath, function (error) {
          if (error) {
            // console.log('11111', error);
            res.send({ code: 2001, msg: "首次上传失败" })
            return false;
          }
          if (dataBufferZoom) {
            fs.writeFile(`${filePath}/${fileName}Zoom.${reqs.type}`, dataBufferZoom, (err) => {

            })
          }
          fs.writeFile(`${filePath}/${fileName}.${reqs.type}`, dataBuffer, (err) => {
            if (err) {
              // console.log('2222', err)
              res.send({ code: 2001, msg: "首次上传失败" })
            } else {
              // console.log('2222', err)
              const tos = () => {
                res.send({ code: 200, msg: "首次上传成功", icon: apath, id: fileName, apath, apathZoom })
              }
              if ((reqs.image || reqs.file) && addText(reqs, apath, filePath, apathZoom)) {
                tos()
              } else if (reqs.image !== "true") { tos() }
            }
          })
        });
      } else {
        if (!reqs.image && !reqs.file) {
          MongoClient.connect(url, function (err, db) {
            var dbo = db.db('runoob');
            var whereStr = { name: reqs.myName }; // 查询条件
            var updateStr = { $set: { headPortrait: apath, apathZoom: apathZoom } }; //更换内容
            // console.log('第-道', updateStr);
            dbo
              .collection('site')
              .updateOne(whereStr, updateStr, function (err, res) {
                if (err) throw err;
                // console.log('======', res.result);
                // console.log('更改请求方数据成功');
                // db.close();
              });
            dbo
              .collection('buildingGroup')
              .find({})
              .toArray(function (err, result_2) {
                // 返回集合中所有数据
                if (err) throw err;
                // console.log('群聊数据', result_2);
                // var img_list = [];
                if (result_2) {
                  for (var i = 0; i < result_2.length; i++) {
                    for (var e = 0; e < result_2[i].imgId.length; e++) {
                      if (result_2[i].imgId[e].name === reqs.myName) {
                        const buildingGroupName = result_2[i].buildingGroupName;
                        const index = i;
                        result_2[i].imgId[e].classIcon = apath;
                        result_2[i].imgId[e].apathZoom = apathZoom;
                        MongoClient.connect(url, function (err, db) {
                          var dbo = db.db('runoob');
                          var whereStr = { buildingGroupName: buildingGroupName }; // 查询条件
                          var updateStr = { $set: result_2[index] }; //更换内容
                          // console.log('第-道', updateStr);
                          dbo
                            .collection('buildingGroup')
                            .updateOne(whereStr, updateStr, function (err, res) {
                              if (err) throw err;
                              // console.log('======', res.result);
                              // console.log('更改请求方数据成功');
                              db.close();
                            });
                        });
                        break;
                      }
                    }
                  }
                }
                db.close();
              });
          });
          // MongoClient.connect(url, function (err, db) {
          //   if (err) throw err;
          //   var dbo = db.db('runoob');
          //   // var whereStr = {'imgId':req.query.imgId};  // 查询条件
          //   dbo
          //     .collection('buildingGroup')
          //     .find({})
          //     .toArray(function (err, result_2) {
          //       // 返回集合中所有数据
          //       if (err) throw err;
          //       // console.log('群聊数据', result_2);
          //       // var img_list = [];
          //       if (result_2) {
          //         for (var i = 0; i < result_2.length; i++) {
          //           for (var e = 0; e < result_2[i].imgId.length; e++) {
          //             if (result_2[i].imgId[e].name === reqs.myName) {
          //               const buildingGroupName = result_2[i].buildingGroupName;
          //               const index = i;
          //               result_2[i].imgId[e].classIcon = apath;
          //               result_2[i].imgId[e].apathZoom = apathZoom;
          //               MongoClient.connect(url, function (err, db) {
          //                 var dbo = db.db('runoob');
          //                 var whereStr = { buildingGroupName: buildingGroupName }; // 查询条件
          //                 var updateStr = { $set: result_2[index] }; //更换内容
          //                 // console.log('第-道', updateStr);
          //                 dbo
          //                   .collection('buildingGroup')
          //                   .updateOne(whereStr, updateStr, function (err, res) {
          //                     if (err) throw err;
          //                     // console.log('======', res.result);
          //                     // console.log('更改请求方数据成功');
          //                     db.close();
          //                   });
          //               });
          //               break;
          //             }
          //           }
          //         }
          //       }
          //       db.close();
          //     });
          // });
        }
        if (dataBufferZoom) {
          fs.writeFile(`${filePath}/${fileName}Zoom.${reqs.type}`, dataBufferZoom, (err) => {

          })
        }
        fs.writeFile(`${filePath}/${fileName}.${reqs.type}`, dataBuffer, (err) => {
          if (err) {
            console.log(err)
            res.send({ code: 2001, msg: "上传失败" })
          } else {
            // console.log(err)
            const tos = () => {
              res.send({ code: 200, msg: "上传成功", icon: apath, id: fileName, apath, apathZoom })
            }
            if ((reqs.image || reqs.file) && addText(reqs, apath, filePath, apathZoom)) {
              tos()
            } else if (reqs.image !== "true") { tos() }

          }
        })
      }
    })
    //文档更新成功
    // MongoClient.connect(url, function (err, db) {
    //   if (err) throw err;
    //   var dbo = db.db('runoob');
    //   var whereStr = { imgId: reqs.imgId }; // 查询条件
    //   var updateStr = { $set: { classIcon: reqs.classIcon } };
    //   dbo
    //     .collection('headPortrait')
    //     .updateOne(whereStr, updateStr, function (err, res) {
    //       if (err) throw err;
    //       // console.log('======', res);
    //       if (res.acknowledged && reqs.myName) {
    //         MongoClient.connect(url, function (err, db) {
    //           var dbo = db.db('runoob');
    //           var whereStr = { name: reqs.myName }; // 查询条件
    //           var updateStr = { $set: { imgId: reqs.imgId } }; //更换内容
    //           // console.log('第-道', updateStr);
    //           dbo
    //             .collection('site')
    //             .updateOne(whereStr, updateStr, function (err, res) {
    //               if (err) throw err;
    //               // console.log('======', res.result);
    //               // console.log('更改请求方数据成功');
    //               result.code = 200;
    //               result.id = reqs.imgId;
    //               result.msg = '更换成功';
    //               result.icon = reqs.classIcon;
    //               // 									resto(result);
    //               // console.log('文档更新成功');
    //               resto.send(result);
    //               db.close();
    //             });
    //         });
    //         return;
    //       }
    //       MongoClient.connect(url, function (err, db) {
    //         // if (err) throw err;
    //         // console.log('数据库已创建');
    //         var dbase = db.db('runoob');
    //         dbase.createCollection('headPortrait', function (err, res) {
    //           // if (err) throw err;
    //           // console.log('创建集合!');
    //         });
    //       });
    //       if (res.acknowledged && !reqs.myName) {
    //         // result = {code:200,msg:"图片提交成功",icon:reqs.classIcon};
    //         MongoClient.connect(url, function (err, db) {
    //           if (err) throw err;
    //           var dbo = db.db('runoob');
    //           dbo
    //             .collection('headPortrait')
    //             .insertOne(reqs, function (err, res) {
    //               if (err) throw err;
    //               // console.log('图片插入成功', err, res);
    //               result.code = 200;
    //               result.id = reqs.imgId;
    //               result.msg = '头像设置成功';
    //               result.icon = reqs.classIcon;
    //               resto.send(result);
    //               db.close();
    //             });
    //         });
    //       }
    //       db.close();
    //     });
    // });
  });
});
//消息请求
app.get('/get1', function (req, res) {
  // console.log('请求url：', req.path);
  // console.log('get1请求参数：', req.query);
  var fromTo = null;
  var objs = [];
  var list = {};
  if (req.query.type === 'groupChat') {
    // var friendName = JSON.parse(req.query.friendName);
    // // toNames = toNames.split(",");
    // for (var i = 0; i < friendName.length; i++) {
    //   fromTo += friendName[i].name * 1;
    // }
    // fromTo = req.query.nickName + fromTo + '.txt';
    fromTo = req.query.groupName
  } else {
    fromTo =
      (req.query.friendName * 1 + req.query.myName * 1).toString() + '.txt';
  }
  // console.log('读取文件名' + fromTo);
  fs.readFile('./chatRecord/' + fromTo, function (error, data) {
    if (error) {
      // console.log('读取文件', error);
      res.send({ code: 200, body: [] });
      return false;
    }
    //console.log(data);  //data是读取的十六进制的数据。  也可以在参数中加入编码格式"utf8"来解决十六进制的问题;
    // console.log('读取出所有行的信息 ',data.toString());  //读取出所有行的信息
    if (!data) return;
    objs = JSON.parse(data.toString());
    if (objs.length > 0) {
      objs.sort(function (a, b) {
        return a.dateTime - b.dateTime;
      });
      list.code = 200;
      list.body = objs;
      // console.log('读取文件', list);
      res.send(list);
    } else {
      res.send({ code: 200, body: [] });
    }
  });
  // 	MongoClient.connect(url, function(err, db) {
  // 			if (err) throw err;
  // 		var dbo = db.db("runoob");
  // 		var fromTo = (req.query.friendName*1+req.query.myName*1).toString();
  // 		var whereStr = {'fromTo':fromTo};  // 查询条件
  // 		var page = ((req.query.page*1)-1)*(req.query.pageSize*1);
  // 		var pageSize = req.query.pageSize * 1;
  // 		var mysort = { dateTime: -1 };
  // 		var list = {}
  // 		console.log("Git请求参数：",whereStr)
  // 		dbo.collection("chatRecord").find(whereStr).sort(mysort).skip(page).limit(pageSize).toArray(function(err, result) { // 返回集合中所有数据
  // 			if (err) throw err;
  // 			// console.log(result);
  // 			db.close();
  // 			if(result.length > 0){
  // 				result.sort(function (a, b) {
  // 					return a.dateTime - b.dateTime;
  // 				});
  // 				list.code = 200;
  // 				list.body = result;
  // 				res.send(list);
  // 			}else{
  // 				res.send({'code':200,'body':[]});
  // 			}
  // 		});
  // 	});
});

//所有人列表请求
app.get('/get2', function (req, res) {
  // console.log('请求url：', req.path);
  // console.log('Git请求参数：', req.query);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    // var whereStr = {'type':req.query.type};  // 查询条件
    var page = (req.query.page * 1 - 1) * (req.query.pageSize * 1);
    var pageSize = req.query.pageSize * 1;
    var mysort = { imgId: -1 };
    var list = {};
    dbo
      .collection('site')
      .find({})
      .sort(mysort)
      .skip(page)
      .limit(pageSize)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result && result.length > 0) {
          result.sort(function (a, b) {
            return b.imgId - a.imgId;
          });
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('runoob');
            // var whereStr = {'imgId':req.query.imgId};  // 查询条件
            dbo
              .collection('headPortrait')
              .find({})
              .toArray(function (err, result_1) {
                // 返回集合中所有数据
                if (err) throw err;
                // console.log(result_1);
                for (var e = 0; e < result.length; e++) {
                  for (var i = 0; i < result_1.length; i++) {
                    if (result[e].imgId === result_1[i].imgId) {
                      result[e].headPortrait = result_1[i].classIcon;
                      break;
                    }
                  }
                }
                // console.log(result);
                list.code = 200;
                list.body = result;
                res.send(list);
                db.close();
              });
          });
        } else {
          res.send({ code: 200, body: [] });
          db.close();
        }
      });
  });
});

//添加好友
app.post('/post4', function (req, res, next) {
  var resto = res;
  // console.log('请求url：', req.path);
  // console.log('post请求参数：', req.body);
  var dateTime = parseInt(Date.parse(new Date())).toString();
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.fromNumber }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result && result.length === 0) {
          resto.send({ code: 2001, msg: '网络忙请稍后....' });
          db.close();
        } else if (result && result.length === 1) {
          if (result[0].linkFriends) {
            var ok = '';
            for (var i = 0; i < result[0].linkFriends.length; i++) {
              if (result[0].linkFriends[i].friendName === req.body.addNumber) {
                ok = 1;
                break;
              }
            }
            if (ok === '') {
              MongoClient.connect(url, function (err, db) {
                var dbo = db.db('runoob');
                var obj = result[0].linkFriends;
                obj.push({
                  friendName: req.body.addNumber,
                  adopt: '',
                  fromName: '',
                  toName: req.body.fromNumber,
                  newsNumber: 0,
                  headPortrait: result[0].headPortrait
                });
                var whereStr = { name: req.body.fromNumber }; // 查询条件
                var updateStr = {
                  $set: { linkFriends: obj, dateTime: dateTime },
                }; //更换内容
                // console.log('第二道', updateStr);
                dbo
                  .collection('site')
                  .updateOne(whereStr, updateStr, function (err, res) {
                    if (err) throw err;
                    // console.log('我的好友数据添加成功2');
                  });
              });
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('runoob');
                var whereStr = { nickName: req.body.addName }; // 查询条件
                dbo
                  .collection('site')
                  .find(whereStr)
                  .toArray(function (err, result_1) {
                    if (err) throw err;
                    // let number = result_1[0].newsNumber * 1;
                    // number += 1;
                    var obj = result_1[0].linkFriends;
                    obj.push({
                      friendName: req.body.fromNumber,
                      adopt: '',
                      fromName: req.body.fromNumber,
                      toName: '',
                      newsNumber: 0,
                      headPortrait: result_1[0].headPortrait
                    });
                    // console.log(obj, +'....' + number);
                    MongoClient.connect(url, function (err, db) {
                      var dbo = db.db('runoob');
                      var whereStr = { nickName: req.body.addName }; // 查询条件
                      var updateStr = {
                        $set: { linkFriends: obj, dateTime: dateTime },
                      }; //更换内容
                      // console.log('第二道', updateStr);
                      dbo
                        .collection('site')
                        .updateOne(whereStr, updateStr, function (err, res) {
                          if (err) throw err;
                          // console.log(res);
                          // console.log('对方更换成功');
                          resto.send({
                            code: 200,
                            msg: '已告知对方请耐心等待',
                          });
                          db.close();
                        });
                    });
                  });
              });
            } else {
              if (req.body.addFriend === 2) {
                resto.send({ code: 200, msg: '已告知对方请耐心等待' });
              } else {
                resto.send({ code: 2000, msg: '已添加对方好友！' });
              }
              db.close();
            }
          } else {
            resto.send({ code: 1001, msg: '网络忙请稍后....' });
            db.close();
          }
        } else {
          resto.send({ code: 1001, msg: '网络忙请稍后....' });
          db.close();
        }
      });
  });
});

//移除好友
app.post('/post4_1', function (req, res, next) {
  var resto = res;
  // console.log('post请求参数：', req.body);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.fromNumber }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
        if (result && result.length === 0) {
          resto.send({ code: 2001, msg: '网络忙请稍后....' });
          db.close();
        } else if (result && result.length === 1) {
          if (result[0].linkFriends) {
            //					if(ok == ''){
            MongoClient.connect(url, function (err, db) {
              var dbo = db.db('runoob');
              var obj = [];
              for (var i = 0; i < result[0].linkFriends.length; i++) {
                if (
                  result[0].linkFriends[i].friendName !== req.body.removeNumber
                ) {
                  obj.push(result[0].linkFriends[i]);
                }
              }
              var whereStr = { name: req.body.fromNumber }; // 查询条件
              var updateStr = { $set: { linkFriends: obj } }; //更换内容
              // console.log('第二道', updateStr);
              dbo
                .collection('site')
                .updateOne(whereStr, updateStr, function (err, res) {
                  if (err) throw err;
                  // console.log('我的好友数据移除好友成功2');
                });
            });
            MongoClient.connect(url, function (err, db) {
              var dbo = db.db('runoob');
              var whereStr = { name: req.body.removeNumber }; // 查询条件
              dbo
                .collection('site')
                .find(whereStr)
                .toArray(function (err, result_1) {
                  if (err) throw err;
                  var obj = [];
                  for (var i = 0; i < result_1[0].linkFriends.length; i++) {
                    if (
                      result_1[0].linkFriends[i].friendName !==
                      req.body.fromNumber
                    ) {
                      obj.push(result_1[0].linkFriends[i]);
                    }
                  }
                  // console.log(obj, '灌灌灌灌灌....');
                  MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db('runoob');
                    var whereStr = { name: req.body.removeNumber }; // 查询条件
                    var updateStr = { $set: { linkFriends: obj } }; //更换内容
                    // console.log('第二道', updateStr);
                    dbo
                      .collection('site')
                      .updateOne(whereStr, updateStr, function (err, res) {
                        if (err) throw err;
                        // console.log(res);
                        // console.log('对方移除好友成功');
                        resto.send({ code: 200, msg: '已将对方移除' });
                        db.close();
                      });
                  });
                });
            });
            //					}else{
            //						if(req.body.addFriend == 2){
            //							resto.send({code:200,msg:'已告知对方请耐心等待'});
            //						}else{
            //							resto.send({code:2000,msg:'已添加对方好友！'});
            //						}
            //					}
          } else {
            resto.send({ code: 1001, msg: '网络忙请稍后....' });
            db.close();
          }
        } else {
          resto.send({ code: 1001, msg: '网络忙请稍后....' });
          db.close();
        }
      });
  });
});
//好友联系人列表请求
app.get('/get3', function (req, res) {
  // console.log('请求url：', req.path);
  // console.log('Git请求参数：', req.query);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var mysort = { dateTime: -1 };
    var list = {};
    dbo
      .collection('site')
      .find({})
      .sort(mysort)
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        if (result && result.length > 0) {
          var objs = [];
          // console.log('好友联系人列表',result);
          for (var i = 0; i < result.length; i++) {
            for (var e = 0; e < result[i].linkFriends.length; e++) {
              if (result[i].linkFriends[e].friendName === req.query.name) {
                result[i].password = '';
                result[i].dateTime = result[i].linkFriends[e].dateTime;
                objs.push(result[i]);
                break;
              }
            }
          }
          // console.log('好友联系人列表', objs);
          // MongoClient.connect(url, function (err, db) {
          //   if (err) throw err;
          //   var dbo = db.db('runoob');
          //   // var whereStr = {'imgId':req.query.imgId};  // 查询条件
          //   dbo
          //     .collection('headPortrait')
          //     .find({})
          //     .toArray(function (err, result_1) {
          //       // 返回集合中所有数据
          //       if (err) throw err;
          //       // console.log(result_1);
          //       // for (var e = 0; e < objs.length; e++) {
          //       //   for (var i = 0; i < result_1.length; i++) {
          //       //     if (objs[e].imgId === result_1[i].imgId) {
          //       //       objs[e].headPortrait = result_1[i].classIcon;
          //       //       break;
          //       //     }
          //       //   }
          //       // }
          //群聊数据
          if (req.query.buildingGroup !== 'no') {
            MongoClient.connect(url, function (err, db) {
              if (err) throw err;
              var dbo = db.db('runoob');
              // var whereStr = {'imgId':req.query.imgId};  // 查询条件
              dbo
                .collection('buildingGroup')
                .find({})
                .toArray(function (err, result_2) {
                  // 返回集合中所有数据
                  if (err) throw err;
                  // console.log('群聊数据', result_2);
                  // var img_list = [];
                  if (result_2) {
                    for (var i = 0; i < result_2.length; i++) {
                      for (var e = 0; e < result_2[i].name.length; e++) {
                        if (result_2[i].name[e].name === req.query.name) {
                          // console.log('1111');
                          // for (
                          //   var u = 0;
                          //   u < result_2[i].imgId.length;
                          //   u++
                          // ) {
                          //   // console.log('2222');
                          //   for (var w = 0; w < result_1.length; w++) {
                          //     // console.log('3333');
                          //     if (
                          //       result_2[i].imgId[u] === result_1[w].imgId
                          //     ) {
                          //       // console.log(result_1[w].imgId);
                          //       img_list.push({
                          //         classIcon: result_1[w].classIcon,
                          //         name: result_2[i].name[u].name,
                          //         newsNumber:
                          //           result_2[i].name[u].newsNumber,
                          //         nickName: result_2[i].nickName[u],
                          //       });
                          //       break;
                          //     }
                          //   }
                          // }
                          // result_2[i].imgId = img_list;
                          // img_list = [];
                          objs.push(result_2[i]);
                          break;
                        }
                      }
                    }
                  }
                  objs.sort(function (a, b) {
                    return b.dateTime - a.dateTime;
                  });
                  list.code = 200;
                  list.body = objs;
                  // console.log(objs);
                  res.send(list);
                  db.close();
                });
            });
          } else {
            list.code = 200;
            list.body = objs;
            res.send(list);
            db.close();
          }
          // });
          // });
        } else {
          res.send({ code: 200, body: [] });
          db.close();
        }
      });
  });
});
//建群
app.post('/buildingGroup', function (req, res, next) {
  var resto = res,
    reqs = req,
    result = { code: 1001, msg: '建群失败请重新操作' };
  // console.log('请求url：', req.path);
  req.body = JSON.parse(req.body.data);
  // console.log('post请求参数：', req.body);
  req.body.dateTime = parseInt(Date.parse(new Date())).toString();
  req.body.linkFriends = [
    {
      friendName: req.body.name,
      adopt: 'yes',
      fromName: req.body.name,
      toName: '',
      newsNumber: 0,
      dateTime: req.body.dateTime,
      chatRecord: '暂无！',
    },
  ];
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      // console.log('数据库已创建');
      var dbase = db.db('runoob');
      dbase.createCollection('buildingGroup', function (err, res) {
        // if (err) throw err;
        // console.log('创建集合!');
      });
    });
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db('runoob');
      dbo.collection('buildingGroup').insertOne(reqs.body, function (err, res) {
        if (err) throw err;
        // console.log('恭喜您建群成功');
        result.code = 200;
        result.msg = '恭喜您建群成功';
        resto.send(result);
        db.close();
      });
    });
  });
});
//移除本群
app.post('/buildingGroup_move', function (req, res, next) {
  var resto = res,
    result = { code: 1001, msg: '移除失败请重新操作' };
  // req.body = JSON.parse(req.body.nickName);
  // console.log('post请求参数：', req.body.nickName);
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db('runoob');
    var whereStr = { buildingGroupName: req.body.nickName }; // 查询条件
    dbo.collection('buildingGroup').deleteOne(whereStr, function (err, obj) {
      if (err) throw err;
      // console.log('该群成功移除');
      result.code = 200;
      result.msg = '该群成功移除';
      resto.send(result);
      db.close();
    });
  });
});
//转让本群
//app.post("/buildingGroup_Transfer",function(req,res,next){
//	var resto= res,
//		reqs = req,
//		result = {'code':1001,'msg':"移除失败请重新操作"};
//		// req.body = JSON.parse(req.body.nickName);
//	console.log("post请求参数：",req.body.nickName);
//	MongoClient.connect(url, function(err, db) {
//		var dbo = db.db("runoob");
//		var whereStr = {"buildingGroupName":req.body.nickName};  // 查询条件
//		dbo.collection("buildingGroup").deleteOne(whereStr, function(err, obj) {
//			if (err) throw err;
//			console.log("该群成功移除");
//			db.close();
//			result.code = 200;
//			result.msg = "该群成功移除";
//			resto.send(result);
//		});
//	});
//});
//本群添加成员或转让本群；
app.post('/buildingGroup_add', function (req, res, next) {
  var resto = res,
    result = { code: 1001, msg: '添加失败请重新操作' };
  req.body = JSON.parse(req.body.data);
  // console.log('请求url：', req.path);
  // console.log('post请求参数：', req.body);
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db('runoob');
    var whereStr = { buildingGroupName: req.body.buildingGroupName }; // 查询条件
    dbo
      .collection('buildingGroup')
      .find(whereStr)
      .toArray(function (err, result_1) {
        if (err) throw err;
        if (result_1[0]) {
          // console.log(result_1[0]);
          var obj = result_1[0];
          var obj_1 = [],
            obj_2 = [],
            obj_3 = [];
          var dateTime = parseInt(Date.parse(new Date())).toString();
          if (req.body.moveName === 'yes') {
            for (var i = 0; i < obj.name.length; i++) {
              if (obj.name[i].name !== req.body.name[0].name) {
                obj_1.push(obj.name[i]);
                obj_2.push(obj.nickName[i]);
                obj_3.push(obj.imgId[i]);
              }
            }
            obj.name = obj_1;
            obj.nickName = obj_2;
            obj.imgId = obj_3;
            obj.text = req.body.text;
            // console.log('判断转让本群', req.body.Transfer);
          } else {
            for (let i = 0; i < req.body.nickName.length; i++) {
              obj.nickName.push(req.body.nickName[i]);
              obj.name.push(req.body.name[i]);
              obj.imgId.push(req.body.imgId[i]);
            }
          }
          // console.log('添加成员更改后的数据', obj);
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db('runoob');
            var whereStr = { buildingGroupName: req.body.buildingGroupName }; // 查询条件
            var updateStr = null;
            if (req.body.Transfer) {
              //判断转让本群
              updateStr = {
                $set: {
                  dateTime: dateTime,
                  textName: req.body.textName,
                  groupOwner: req.body.Transfer,
                  nickName: obj.nickName,
                  name: obj.name,
                  imgId: obj.imgId,
                },
              }; //更换内容
            } else {
              updateStr = {
                $set: {
                  dateTime: dateTime,
                  textName: req.body.textName,
                  nickName: obj.nickName,
                  name: obj.name,
                  imgId: obj.imgId,
                },
              }; //更换内容
            }
            // console.log('第-道', updateStr);
            dbo
              .collection('buildingGroup')
              .updateOne(whereStr, updateStr, function (err, res) {
                if (err) throw err;
                // console.log(res);
                if (res) {
                  // console.log('第2道更改数据成功');
                  if (req.body.moveName === 'yes') {
                    resto.send({
                      code: 200,
                      msg: '成功退出' + req.body.buildingGroupName,
                    });
                  } else {
                    resto.send({ code: 200, msg: '已添加成功' });
                  }
                } else {
                  resto.send(result);
                }
                db.close();
              });
          });
        } else {
          resto.send({ code: 1001, msg: '网络忙请稍后....' });
          db.close();
        }
      });
  });
});

//对方确定添加你为好友；
app.post('/post5', function (req, res, next) {
  var resto = res;
  // console.log('请求url：', req.path);
  // console.log('post请求参数：', req.body);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.fromName }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result_1) {
        if (err) throw err;
        if (result_1) {
          var obj = result_1[0].linkFriends;
          for (var i = 0; i < obj.length; i++) {
            if (obj[i].friendName === req.body.myName) {
              if (req.body.friends === 'no') {
                obj[i].adopt = '';
              } else {
                obj[i].adopt = 'yes';
              }
              obj[i].newsNumber = 0;
              // console.log(obj);
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('runoob');
                var whereStr = { name: req.body.fromName }; // 查询条件
                var updateStr = { $set: { linkFriends: obj } }; //更换内容
                // console.log('第-道', updateStr);
                dbo
                  .collection('site')
                  .updateOne(whereStr, updateStr, function (err, res) {
                    if (err) throw err;
                    // console.log(res);
                    // console.log('更改请求方数据成功');
                    // resto.send({code:200,msg:'已告知对方请耐心等待'});
                  });
              });
              break;
            }
          }
          db.close();
        } else {
          db.close();
        }
      });
  });
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.myName }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result_1) {
        if (err) throw err;
        if (result_1) {
          var obj = result_1[0].linkFriends;
          for (var i = 0; i < obj.length; i++) {
            if (obj[i].friendName === req.body.fromName) {
              if (req.body.friends === 'no') {
                obj[i].adopt = '';
              } else {
                obj[i].adopt = 'yes';
              }
              if (req.body.clear) {
                obj[i].newsNumber = 0;
              } else {
                obj[i].newsNumber = 0;
              }
              // console.log(obj);
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('runoob');
                var whereStr = { name: req.body.myName }; // 查询条件
                var updateStr = { $set: { linkFriends: obj } }; //更换内容
                // console.log('第-道', updateStr);
                dbo
                  .collection('site')
                  .updateOne(whereStr, updateStr, function (err, res) {
                    if (err) throw err;
                    // console.log(res);
                    // console.log('更改自己数据成功');
                    resto.send({
                      code: 200,
                      msg: '添加好友成功，开始聊天吧！',
                    });
                  });
              });
              break;
            }
          }
          db.close();
        } else {
          db.close();
        }
      });
  });
});
//消息清零
app.post('/post6', function (req, res, next) {
  var resto = res;
  // console.log('请求url：', req.path);
  // console.log('post请求参数：', req.body);
  // req.body.myName = JSON.parse(req.body.myName);
  // console.log('post请求参数req.body.myName：', req.body.nickName);
  if (req.body.type === 'groupChat') {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db('runoob');
      var whereStr = { buildingGroupName: req.body.nickName }; // 查询条件
      dbo
        .collection('buildingGroup')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          if (result_1[0]) {
            // console.log('数据：', result_1[0]);
            for (var i = 0; i < result_1[0].name.length; i++) {
              if (result_1[0].name[i].name === req.body.fromName) {
                result_1[0].name[i].newsNumber = 0;
                // console.log('数据ok：', result_1[0].name);
                MongoClient.connect(url, function (err, db) {
                  if (err) throw err;
                  var dbo = db.db('runoob');
                  var whereStr = { buildingGroupName: req.body.nickName }; // 查询条件
                  var updateStr = { $set: { name: result_1[0].name } }; //更换内容
                  // console.log('第-道', updateStr);
                  dbo
                    .collection('buildingGroup')
                    .updateOne(whereStr, updateStr, function (err, res) {
                      if (err) throw err;
                      // console.log(res);
                      // console.log('更改请求方数据成功');
                      resto.send({ code: 200, msg: '已阅读暂无消息' });
                    });
                });
                break;
              }
            }
            db.close();
          } else {
            db.close();
          }
        });
    });
  } else {
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db('runoob');
      var whereStr = { name: req.body.fromName }; // 查询条件
      dbo
        .collection('site')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          if (result_1[0]) {
            var obj = result_1[0].linkFriends;
            for (let i = 0; i < obj.length; i++) {
              if (obj[i].friendName === req.body.myName) {
                if (req.body.friends === 'no') {
                  obj[i].adopt = '';
                } else {
                  obj[i].adopt = 'yes';
                }
                obj[i].newsNumber = 0;
                // console.log(obj);
                MongoClient.connect(url, function (err, db) {
                  var dbo = db.db('runoob');
                  var whereStr = { name: req.body.fromName }; // 查询条件
                  var updateStr = { $set: { linkFriends: obj } }; //更换内容
                  // console.log('第-道', updateStr);
                  dbo
                    .collection('site')
                    .updateOne(whereStr, updateStr, function (err, res) {
                      if (err) throw err;
                      // console.log(res);
                      // console.log('更改请求方数据成功');
                      resto.send({ code: 200, msg: '已阅读暂无消息' });
                    });
                });
                break;
              }
            }
            db.close();
          } else {
            db.close();
          }
        });
    });
  }
});
// 添加备注
app.post('/remarks', function (req, res) {
  // console.log(req.body); // 上传的文件信息
  var resto = res,
    reqs = req,
    result = { code: 1001, msg: '操作失败！', icon: '' };

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.toChatName }; // 查询条件
    dbo
      .collection('site')
      .find(whereStr)
      .toArray(function (err, result_1) {
        if (err) throw err;
        if (result_1) {
          // console.log(result_1);
          var obj = result_1[0].linkFriends;
          for (let i = 0; i < obj.length; i++) {
            if (obj[i].friendName === req.body.myName) {
              if (reqs.body.remarksName !== '') {
                obj[i].remarksName = reqs.body.remarksName;
              }
              if (reqs.body.remarksNuber !== '') {
                obj[i].remarksNuber = reqs.body.remarksNuber;
              }
              // console.log(obj);
              MongoClient.connect(url, function (err, db) {
                if (err) throw err;
                var dbo = db.db('runoob');
                var whereStr = { name: req.body.toChatName }; // 查询条件
                var updateStr = { $set: { linkFriends: obj } }; //更换内容
                // console.log('第-道', updateStr);
                dbo.collection('site').updateOne(whereStr, updateStr, function (err, res) {
                  if (err) throw err;
                  // console.log('======', res);
                  // console.log('更改请求方数据成功');
                  if (res.acknowledged) {
                    if (reqs.body.remarksName !== '') {
                      result.remarksName = reqs.body.remarksName;
                    } else {
                      result.remarksName = obj[i].remarksName;
                    }
                    if (reqs.body.remarksNuber !== '') {
                      result.remarksNuber = reqs.body.remarksNuber;
                    } else {
                      result.remarksNuber = obj[i].remarksNuber;
                    }

                    result.code = 200;
                    result.msg = '保存成功';
                    resto.send(result);
                  } else {
                    resto.send(result);
                  }
                });
              });
              break;
            }
          }
          db.close();
        } else {
          resto.send(result);
          db.close();
        }
      });
  });
});
//资料详情
app.post('/remarks1', function (req, res) {
  // console.log(req.body); // 上传的文件信息
  var resto = res,
    result = { code: 1001, msg: '未搜到结果哦！', icon: '' };
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db('runoob');
    var whereStr = null,
      star = 0;
    function remarksTo() {
      if (
        /^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/.test(
          req.body.toChatName
        )
      ) {
        // console.log('shouji');
        whereStr = { name: req.body.toChatName }; // 查询条件
      } else {
        if (star === 0) {
          whereStr = { nickName: req.body.toChatName }; // 查询条件
        } else {
          whereStr = { LLNumber: req.body.toChatName }; // 查询条件
        }
      }
      dbo
        .collection('site')
        .find(whereStr)
        .toArray(function (err, result_1) {
          if (err) throw err;
          // console.log(result_1);
          if (result_1[0]) {
            // console.log('>>>>>>>>>>', result_2);
            result.imges = result_1[0].headPortrait || '';
            result.apathZoom = result_1[0].apathZoom || '';
            // console.log(result_1[0].linkFriends);
            var obj = result_1[0].linkFriends;
            var arrayOne = 0;
            if (result_1[0].myRegion) {
              result.myRegion = result_1[0].myRegion;
            }
            result.sex = result_1[0].sex;
            for (var i = 0; i < obj.length; i++) {
              // console.log(obj[i].friendName);imgId
              if (obj[i].friendName === req.body.myName) {
                // console.log(obj[i].friendName);
                // console.log(obj[i]);
                result.code = 200;
                if (obj[i].remarksName) {
                  result.remarksName = obj[i].remarksName;
                  result.remarksNameNick = result_1[0].nickName;
                } else {
                  result.remarksName = result_1[0].nickName;
                  result.remarksNameNo = 'no';
                }
                if (obj[i].remarksNuber) {
                  result.remarksNuber = obj[i].remarksNuber;
                } else {
                  result.remarksNuber = obj[i].remarksNuber;
                }
                result.LLNumber = result_1[0].LLNumber;
                result.name = result_1[0].name;
                result.msg = '成功';
                arrayOne = 1;
                resto.send(result);
                db.close();
                break;
              }
            }
            if (arrayOne === 0) {
              result.code = 200;
              result.LLNumber = result_1[0].LLNumber;
              result.name = result_1[0].name;
              result.remarksName = result_1[0].nickName;
              result.friend = 'no';
              result.msg = '成功';
              resto.send(result);
              db.close();
            }
          } else {
            if (star === 1) {
              resto.send(result);
              db.close();
            }
            if (star === 0) {
              star += 1;
              remarksTo();
            }
          }
        });
    }
    remarksTo();
  });
});
//更改个人资料
app.post('/myRemarks', function (req, res) {
  // console.log(req.body); // 上传的文件信息
  var resto = res,
    result = { code: 1001, msg: '网络错误！', icon: '' };

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db('runoob');
    var whereStr = { name: req.body.myName }; // 查询条件
    var updateStr = {
      $set: { nickName: req.body.nickName, myRegion: req.body.myRegion },
    }; //更换内容
    // console.log('第-道', updateStr);
    dbo.collection('site').updateOne(whereStr, updateStr, function (err, res) {
      if (err) throw err;
      // console.log('======', res, res.result);
      // console.log('更改请求方数据成功');
      // db.close();
      if (res.acknowledged) {
        result.code = 200;
        result.msg = '保存成功';
        result.nickName = req.body.nickName;
        result.myRegion = req.body.myRegion;
        resto.send(result);
      } else {
        resto.send(result);
      }
      db.close();
    });
  });
});

