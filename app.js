require('dotenv').config();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dynamic-chat-app');

const express = require('express');
let app = express();
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');

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
    
});


http.listen(3000,()=>{
    console.log("server connect");
});