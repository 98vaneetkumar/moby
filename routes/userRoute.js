var express = require('express');
var router = express.Router();
const controller = require('../controllers/index');
const {authentication,forgotPasswordVerify} = require('../middlewares/authentication');


module.exports=function(){


    router.get("/users", controller.userController.welcome_page);
    router.get("/login", controller.userController.welcome_page);
    router.get("/signup", controller.userController.welcome_page);

    router.get("/user_dashboard", controller.userController.user_dashboard);

    router.get("/homepage", controller.userController.homepage);
    router.get("/ridehistory", controller.userController.ridehistory);
    router.get("/activerides", controller.userController.activerides);
    router.get("/upcomingrides", controller.userController.upcomingrides);
    router.get("/notificationpage", controller.userController.notificationpage);
    router.get("/requestsrides", controller.userController.requestsrides);




    // router.post('/signUp', controller.userController.signUp);
    // router.post('/login', controller.userController.login);
    router.post('/logout', authentication, controller.userController.logout);
    router.post('/forgotPassword', controller.userController.forgotPassword);
    router.post('/resendForgotPasswordLink', controller.userController.resendForgotPasswordLink);
    router.get('/resetPassword', forgotPasswordVerify, controller.userController.resetPassword);
    router.post('/forgotChangePassword', controller.userController.forgotChangePassword);
    router.post('/changePassword', authentication, controller.userController.changePassword);
    router.post('/otpVerify', controller.userController.otpVerify);
    router.post('/resendOtp', controller.userController.resendOtp);

    router.get("/cms",authentication, controller.userController.cms)
    router.get("/notificationsList",authentication, controller.userController.notificationsList)

    return router
}

