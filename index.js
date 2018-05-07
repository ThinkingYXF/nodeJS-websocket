window.onload = function(){
	var mySocket = new MySocket();
	mySocket.init();
}
var MySocket = function(){
	this.socket = null;
}
MySocket.prototype = {
	init: function(){
		var that = this;
		this.socket = io.connect();
		this.socket.on('connect',function(){
			document.getElementById('info').textContent = '请输入昵称';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
		});

		document.getElementById('loginBtn').addEventListener('click', function() {
			var nickName = document.getElementById('nicknameInput').value;
			//检查昵称输入框是否为空
			if (nickName.trim().length != 0) {
				//不为空，则发起一个login事件并将输入的昵称发送到服务器
				that.socket.emit('login', nickName);
			} else {
				//否则输入框获得焦点
				document.getElementById('nicknameInput').focus();
			};
		}, false);
		//昵称存在
		this.socket.on('nickExisted', function() {
			document.getElementById('info').textContent = '昵称已存在'; //显示昵称被占用的提示
		});
		//登录成功
		this.socket.on('loginSuccess', function() {
			document.title = 'websocket聊天室 | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
			document.getElementById('messageInput').focus();//让消息输入框获得焦点
		});
		this.socket.on('system', function(nickName, userCount, type) {
			//判断用户是连接还是离开以显示不同的信息
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			that._displayNewMsg('system ', msg, 'red');
			//将在线人数显示到页面顶部
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		});
		this.socket.on('newMsg',function(user, msg){
			that._displayNewMsg(user, msg);
		});

		//发送消息
		document.getElementById('sendBtn').addEventListener('click',function(){
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value;
			messageInput.value = '';
			messageInput.focus();
			if(msg.trim().length != 0){
				that.socket.emit('postMsg', msg);
				that._displayNewMsg('me', msg);
			}
		},false);
	},
	_displayNewMsg: function(user, msg, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	}
}
