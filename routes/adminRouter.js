var express = require("express");
var router = express.Router();
const controller = require("../controllers/index");
const { session } = require("../helpers/commonHelper.js");

module.exports = function () {
  router.get("/", controller.adminController.login_page);
  router.get("/login", controller.adminController.login_page);
  router.post("/Login", controller.adminController.login);
  router.post("/logout", controller.adminController.logout);
  router.get("/dashboard", session, controller.adminController.dashboard);
  router.get('/getDashboardData', session, controller.adminController.getDashboardData);


  router.get("/profile", controller.adminController.profile);
  router.post("/profile_update/:id", controller.adminController.profile_update);
  router.get("/change_password", controller.adminController.change_password);
  router.post(
    "/change_password_post",
    controller.adminController.change_password_post
  );

  router.get("/aboutUs", session, controller.adminController.aboutUs);
  router.post("/about_post", session, controller.adminController.about_post);

  router.get("/aboutorg", session, controller.adminController.aboutorg);
  router.post("/aboutorg_post", session, controller.adminController.aboutorg_post);

  router.get(
    "/privacyPolicy",
    session,
    controller.adminController.privacyPolicy
  );
  router.post(
    "/privacy_post",
    session,
    controller.adminController.privacy_post
  );

  router.get(
    "/termsConditions",
    session,
    controller.adminController.termsConditions
  );
  router.post(
    "/termsConditionsPost",
    session,
    controller.adminController.termsConditionsPost
  );

  router.get(
    "/users_listing",
    session,
    controller.adminController.users_listing
  );
  router.get("/user_view/:id", session, controller.adminController.user_view);
  router.post("/user_status", session, controller.adminController.user_status);
  router.post("/user_delete", session, controller.adminController.user_delete);


  router.get(
    "/patients_listing",
    session,
    controller.adminController.patients_listing
  );
  router.get("/patients_view/:id", session, controller.adminController.patients_view);
  router.post("/patients_status", session, controller.adminController.patients_status);
  router.post("/patients_delete", session, controller.adminController.patients_delete);


  router.get(
    "/drivers_listing",
    session,
    controller.adminController.drivers_listing
  );
  router.get("/drivers_view/:id", session, controller.adminController.drivers_view);
  router.post("/drivers_status", session, controller.adminController.drivers_status);
  router.post("/drivers_delete", session, controller.adminController.drivers_delete);



router.get('/faq_list', session, controller.adminController.faq_list)
router.get('/add_faq', session, controller.adminController.add_faq)
router.post('/create_faq', session, controller.adminController.create_faq)
router.post('/delete_faq', session, controller.adminController.delete_faq)
router.get("/faq_edit/:id",session, controller.adminController.faq_edit);
router.post("/faq_update/:id", session, controller.adminController.faq_update);
router.get("/faq_view/:id",session, controller.adminController.faq_view);


router.get('/customersupport_listing', session, controller.adminController.customersupport_listing)
router.post('/delete_customersupport', session, controller.adminController.delete_customersupport)
router.get("/customersupport_view/:id",session, controller.adminController.customersupport_view);


router.get('/vehicletypes_listing', session, controller.adminController.vehicletypes_listing)
router.get('/add_vehicletype', session, controller.adminController.add_vehicletype)
router.post('/create_vehicletype', session, controller.adminController.create_vehicletype)
router.post("/vehicletype_status", session, controller.adminController.vehicletype_status);
router.post('/vehicletype_delete', session, controller.adminController.vehicletype_delete)





  router.post("/test", controller.adminController.test);

  return router;
};
