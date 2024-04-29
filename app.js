require('dotenv').config();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dynamic-chat-app');

const express = require('express');
let app = express();
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');

app.use('/',userRoute);

const io = require('socket.io')(http);
const userc = io.of('/user-name');
userc.on('connection',async function(socket){
    console.log('user connect');
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id:userId},{ $set:{is_online:1}});

    //user broadcast online status
    socket.broadcast.emit('getOnlineUser',{user_id:userId});

    socket.on('disconnect',async function(){
        console.log('user disconnetion');
        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}});

        //user broadcasr offline status
        socket.broadcast.emit('getOfflineUser',{user_id:userId});

    });

    //chating implements
    socket.on('newChat',function(data){
        socket.broadcast.emit('loadNewChat',data);
    });
    
    // load old chat 
    socket.on('existsChat', async function(data) {
        // console.log(data);
        var chats = await Chat.find({ 
            $or: [
                { sender_id: data.sender_id, receiver_id: data.receiver_id },
                { sender_id: data.receiver_id, receiver_id: data.sender_id },
            ]
        });
    
        // console.log("Govind", chats);
    
        socket.emit('loadsChat', { chats: chats });
    });
    

    // delete chats
    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted',id);
    });

});


http.listen(3000,()=>{
    console.log("server connect");
});