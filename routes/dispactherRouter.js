var express = require('express');
var router = express.Router();
const controller = require('../controllers/index');
const {authentication,forgotPasswordVerify} = require('../middlewares/authentication');
const { dispatcher_session } = require("../helpers/commonHelper.js");



module.exports=function(){

    router.get("/", controller.dispatcherController.mainpage);
    router.get("/dispatcher", controller.dispatcherController.mainpage);
    router.get("/login", controller.dispatcherController.mainpage);
    router.get("/signup", controller.dispatcherController.mainpage);

    router.get("/dispatcher_dashboard", dispatcher_session, controller.dispatcherController.dispatcher_dashboard);

    router.get("/homepage", dispatcher_session, controller.dispatcherController.homepage);
    router.get("/ridehistory", dispatcher_session, controller.dispatcherController.ridehistory);
    router.get("/activerides", dispatcher_session, controller.dispatcherController.activerides);
    router.get("/upcomingrides", dispatcher_session, controller.dispatcherController.upcomingrides);
    router.get("/requestsrides", dispatcher_session, controller.dispatcherController.requestsrides);
    router.get("/userprofile", dispatcher_session, controller.dispatcherController.userprofile);





    router.post('/signup', controller.dispatcherController.signup);
    router.post('/login', controller.dispatcherController.login);
    router.post('/logout', controller.dispatcherController.logout);
    router.post('/updateUserProfile', dispatcher_session, controller.dispatcherController.updateUserProfile);





    router.post('/forgotPassword', controller.dispatcherController.forgotPassword);
    router.post('/resendForgotPasswordLink', controller.dispatcherController.resendForgotPasswordLink);
    router.get('/resetPassword', forgotPasswordVerify, controller.dispatcherController.resetPassword);
    router.post('/forgotChangePassword', controller.dispatcherController.forgotChangePassword);
    router.post('/changePassword', authentication, controller.dispatcherController.changePassword);
    router.post('/otpVerify', controller.dispatcherController.otpVerify);
    router.post('/resendOtp', controller.dispatcherController.resendOtp);

    router.get("/cms",authentication, controller.dispatcherController.cms)
    router.get("/notificationsList",authentication, controller.dispatcherController.notificationsList)

    return router
}

