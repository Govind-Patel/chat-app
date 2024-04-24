const express = require('express');
const user_route = express();
// const ejs = require('ejs');

const bodyParser = require('body-parser');

const session = require('express-session');
const {SESSION_SECRET} = process.env;
user_route.use(session({secret:SESSION_SECRET,resave: false,saveUninitialized: false }));

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.set('view engine','ejs');
// user_route.set('view','./view');

user_route.use(express.static('public'));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storage});

const userControlle = require('../controllers/userController');

const auth = require('../middleware/auth');

user_route.get('/register',auth.isLogout,userControlle.registerLoad);
user_route.post('/register',upload.single('image'),userControlle.register);

user_route.get('/',auth.isLogout,userControlle.loadLogin);
user_route.post('/',userControlle.login);
user_route.get('/logout',auth.isLogin,userControlle.logout);

user_route.get('/dashboard',auth.isLogin,userControlle.loadDashboard);

user_route.post('/save-chat',userControlle.saveChat);

// user_route.get('/register',userControlle.registerLoad);
// user_route.post('/register',upload.single('image'),userControlle.register);

// user_route.get('/',userControlle.loadLogin);
// user_route.post('/',userControlle.login);
// user_route.get('/logout',userControlle.logout);

// user_route.get('/dashboard',userControlle.loadDashboard);

module.exports = user_route;