var express = require('express');
var router = express.Router();
const controller = require('../controllers/index');
const {authentication,forgotPasswordVerify} = require('../middlewares/authentication');
const { userSite_session } = require("../helpers/commonHelper.js");



module.exports=function(){

    router.get("/", controller.userController.welcome_page);
    router.get("/users", controller.userController.welcome_page);
    router.get("/login", controller.userController.welcome_page);
    router.get("/signup", controller.userController.welcome_page);

    router.get("/user_dashboard", userSite_session, controller.userController.user_dashboard);

    router.get("/homepage", userSite_session, controller.userController.homepage);
    router.get("/ridehistory", userSite_session, controller.userController.ridehistory);
    router.get("/activerides", userSite_session, controller.userController.activerides);
    router.get("/upcomingrides", userSite_session, controller.userController.upcomingrides);
    router.get("/notificationpage", userSite_session, controller.userController.notificationpage);
    router.get("/requestsrides", userSite_session, controller.userController.requestsrides);
    router.get("/userprofile", userSite_session, controller.userController.userprofile);





    router.post('/signUp', controller.userController.signUp);
    router.post('/login', controller.userController.login);
    router.post('/logout', controller.userController.logout);
    router.post('/updateUserProfile', userSite_session, controller.userController.updateUserProfile);





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

