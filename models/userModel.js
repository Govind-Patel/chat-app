const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        name:{
            type:String,
            require:true
        },
        email:{
            type:String,
            require:true
        },
        image:{
            type:String,
            require:true
        },
        password:{
            type:String,
            require:true,
        },
        is_online:{
            type:String,
            require:true,
            default:'0',
        }
},
{ Timestamps:true }
);

module.exports = mongoose.model('User',userSchema);