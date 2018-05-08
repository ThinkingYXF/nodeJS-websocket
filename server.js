let http = require('http');
let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname)); //指定静态HTML文件的位置
let users = [];							//存储在线人员昵称
server.listen(8085);

//socket部分
io.on('connection', function(socket) {
	//login事件
	socket.on('login', function(nickname) {
		if (users.indexOf(nickname) > -1) {
			socket.emit('nickExisted');
		} else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称
		};
	});
	//断开连接的事件
	socket.on('disconnect', function() {
		if(users.length <= 0){
			console.log('no one online!');
			return false;
		}
		//将断开连接的用户从users中删除
		users.splice(socket.userIndex, 1);
		//通知除自己以外的所有人
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	//收到消息
	socket.on('postMsg',function(msg, color, type){
		color = color || '#000';
		socket.broadcast.emit('newMsg', socket.nickname, msg, color, type);
	});
});
