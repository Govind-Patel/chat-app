const isLogin = async(req,res,next) =>{
    try {
        if(req.session.user){
            
        }else{
            res.redirect("/");
        }
        next();
    } catch (error) {
        console.log(error.messsage);
    }
}

const isLogout = async(res,req,next) =>{
    console.log(res.session.user);
    try {
        if(res.session.user){
            res.redirect("dashboard");
        }
        next();
    } catch (error) {
        console.log(error.messsage);
    }
}
module.exports = {isLogin,isLogout};