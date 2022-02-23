// let socket = io();

// socket.on('message', data=>{
//     appendList(data)
// })


// var sendMsgForm = document.getElementById('send-msg-Form')
// var chatList = document.getElementById('chatList')

// sendMsgForm.addEventListener('submit',e=>{
//     e.preventDefault();
//     socket.emit('chatmessage',sendMsgForm.msg.value)

//     sendMsgForm.msg.value = ""

// })



// function appendList(msg){

//     html = '<li class="other"> <div class="avatar"><img src="https://i.imgur.com/DY6gND0.png" draggable="false"/></div><div class="msg"><p>'+msg+'<emoji class="suffocated"/></p><time>20:18</time></div></li>'
//     document.getElementById("chatList").innerHTML = document.getElementById("chatList").innerHTML + html
// }