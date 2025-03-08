"use strict";

/* RENDER: when displaying views/templates with data (forms/errors/user-data) [URL stays same]
 REDIRECT: after successful actions to prevent resubmission (form-success/logout/cancel) [URL changes]*/

const bcrypt = require("bcrypt");
const { Sequelize, Op, fn, col } = require("sequelize");
const moment = require("moment");
const Models = require("../models/index");
const helper = require("../helpers/commonHelper");

module.exports = {
  login_page: async (req, res) => {
    if (req.session.user) return res.redirect("/admin/dashboard");
    res.render("admin/login_page", { layout: false, msg: req.flash("msg") });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const login_data = await Models.userModel.findOne({
        where: { email: email },
      });

      if (!login_data || !bcrypt.compareSync(password, login_data.password)) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (login_data.role !== 0) {
        return res.json({
          success: false,
          message: "Please enter valid credentials",
        });
      }

      req.session.user = login_data;
      req.flash("msg", "You are logged in successfully");

      return res.json({
        success: true,
        message: "You are logged in successfully",
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.redirect("/admin/login");
    }
  },

  logout: async (req, res) => {
    try {
      req.session.destroy(() => {
        res.json({ success: true });
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  profile: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      res.render("admin/profile", {
        title: "Profile",
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  profile_update: async (req, res) => {
    try {
      let fileImage = "";

      if (req.files && req.files.profilePicture) {
        fileImage = await helper.fileUpload(req.files.profilePicture, "images");
      } else {
        let user = await Models.userModel.findOne({
          where: { id: req.params.id },
        });

        fileImage = user.profilePicture;
      }

      // Update user profile
      await Models.userModel.update(
        {
          fullName: req.body.fullName,
          profilePicture: fileImage,
        },
        { where: { id: req.params.id } }
      );

      // Fetch updated user
      let updatedUser = await Models.userModel.findOne({
        where: { id: req.params.id },
      });
      if (updatedUser) {
        req.session.user = updatedUser;
      }

      req.flash("msg", "Profile updated successfully");
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  change_password: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/login");
      res.render("admin/changePassword", {
        title: "Reset Password",
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  change_password_post: async (req, res) => {
    try {
      if (!req.session) {
        console.error("Session is not initialized!");
        return res.status(500).json({ error: "Session not initialized." });
      }

      const { password, new_password, confirm_new_password } = req.body;
      const userId = req.session.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: "User not found. Please log in again." });
      }

      const user = await Models.userModel.findOne({ where: { id: userId } });

      if (!user) {
        return res
          .status(401)
          .json({ error: "User not found. Please log in again." });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ error: "Your old password is incorrect." });
      }

      if (new_password !== confirm_new_password) {
        return res
          .status(400)
          .json({ error: "New password and confirm password do not match." });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await Models.userModel.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      // Destroy session and send a success response
      req.session.destroy();
      return res.json({
        success: true,
        message: "Your password has been updated successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  dashboard: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const [totalUsersExcludingRole0, patients, drivers] = await Promise.all([
        Models.userModel.count({ where: { role: { [Op.ne]: 0 } } }),
        Models.userModel.count({ where: { role: 1 } }),
        Models.userModel.count({ where: { role: 2 } }),
      ]);

      const currentYear = Math.max(2025, moment().year());
      const months = [];
      const counts = {
        allUsers: [], // Sum of all roles except 0
      };

      const startOfYear = moment(`${currentYear}-01-01`)
        .startOf("year")
        .toDate();
      const endOfYear = moment(startOfYear).endOf("year").toDate();

      const monthlyCounts = await Models.userModel.findAll({
        attributes: [
          [fn("MONTH", col("createdAt")), "month"],
          "role",
          [fn("COUNT", col("id")), "count"],
        ],
        where: {
          createdAt: { [Op.between]: [startOfYear, endOfYear] },
          role: { [Op.ne]: 0 }, // Exclude role 0
        },
        group: ["month", "role"],
        raw: true,
      });

      for (let month = 1; month <= 12; month++) {
        months.push(moment(`${currentYear}-${month}-01`).format("MMM, YYYY"));
        counts.allUsers.push(0);
      }

      monthlyCounts.forEach(({ month, role, count }) => {
        // Sum of all users except role 0
        counts.allUsers[month - 1] += parseInt(count);
      });

      res.render("dashboard", {
        title: "Dashboard",
        counts1: counts,
        months1: months,
        totalUsersExcludingRole0,
        patients,
        drivers,
        session: req.session.user,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.redirect("/admin/login");
    }
  },

  getDashboardData: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || moment().year();

      // Ensure the requested year is valid
      if (year < 2024) {
        return res.status(400).json({
          success: false,
          error: "Year must be 2024 or later",
        });
      }

      const startOfYear = moment(`${year}-01-01`).startOf("year").toDate();
      const endOfYear = moment(startOfYear).endOf("year").toDate();

      // Fetch users except role 0
      const monthlyCounts = await Models.userModel.findAll({
        attributes: [
          [fn("MONTH", col("createdAt")), "month"],
          [fn("COUNT", col("id")), "count"],
        ],
        where: {
          createdAt: { [Op.between]: [startOfYear, endOfYear] },
          role: { [Op.ne]: 0 }, // Exclude role 0
        },
        group: ["month"],
        raw: true,
      });

      // Initialize counts array for 12 months
      const counts = new Array(12).fill(0);

      // Populate counts where data is available
      monthlyCounts.forEach(({ month, count }) => {
        counts[month - 1] = parseInt(count);
      });

      // Generate month labels (Jan, Feb, etc.)
      const months = Array.from({ length: 12 }, (_, i) =>
        moment(`${year}-${i + 1}-01`).format("MMM")
      );

      res.json({
        success: true,
        counts: { allUsers: counts },
        months,
      });
    } catch (error) {
      console.error("Dashboard Data Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  aboutUs: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let about_data = await Models.cmsModel.findOne({
        where: { type: 1 },
      });

      // Use res.render instead of res.redirect to render the "about" page
      return res.render("admin/cms/about", {
        title: "About Us",
        about_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  about_post: async (req, res) => {
    try {
      let about_data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 1 },
        }
      );
      req.flash("msg", "About Us updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  aboutorg: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let aboutorg_data = await Models.cmsModel.findOne({
        where: { type: 4 },
      });

      // Use res.render instead of res.redirect to render the "about" page
      return res.render("admin/cms/aboutOrg", {
        title: "About Organization",
        aboutorg_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  aboutorg_post: async (req, res) => {
    try {
      let aboutorg_data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 4 },
        }
      );
      req.flash("msg", "About Organization updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  privacyPolicy: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let policy_data = await Models.cmsModel.findOne({
        where: { type: 2 },
      });
      res.render("admin/cms/privacy", {
        title: "Privacy Policy",
        policy_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  privacy_post: async (req, res) => {
    try {
      let data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 2 },
        }
      );
      req.flash("msg", "Privacy Policy updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  termsConditions: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let terms_data = await Models.cmsModel.findOne({
        where: { type: 3 },
      });
      res.render("admin/cms/terms", {
        title: "Terms & Conditions",
        terms_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  termsConditionsPost: async (req, res) => {
    try {
      let data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 3 },
        }
      );
      req.flash("msg", "Terms and Conditions updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  users_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let user_data = await Models.userModel.findAll({
        where: {
          role: {
            [Sequelize.Op.ne]: 0,
          },
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      res.render("admin/users/usersListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Users",
        user_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  user_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let userId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: userId },
      });
      res.render("admin/users/userView", {
        title: "Users",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  user_status: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(`Updating user ${id} to status: ${status}`); // Debugging

      if (!id || status === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid data provided" });
      }

      const [updatedRows] = await Models.userModel.update(
        { status: status },
        { where: { id: id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating user status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  user_delete: async (req, res) => {
    try {
      const userId = req.body.id;
      // Delete user
      await Models.userModel.destroy({ where: { id: userId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete user " });
      return res.redirect("/admin/login");
    }
  },

  patients_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let patient_data = await Models.userModel.findAll({
        where: {
          role: 1,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      res.render("admin/patients/patientsListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Patients/Users",
        patient_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  patients_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let patientsId = req.params.id;

      // Find patients details
      let data = await Models.userModel.findOne({
        where: { id: patientsId },
      });
      res.render("admin/patients/patientsView", {
        title: "Patients/Users",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  patients_status: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(`Updating patients ${id} to status: ${status}`); // Debugging

      if (!id || status === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid data provided" });
      }

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id: id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating user status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  patients_delete: async (req, res) => {
    try {
      const patientsId = req.body.id;
      // Delete patients
      await Models.userModel.destroy({ where: { id: patientsId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete patients " });
      return res.redirect("/admin/login");
    }
  },

  drivers_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let driver_data = await Models.userModel.findAll({
        where: {
          role: 2,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      res.render("admin/drivers/driversListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Drivers",
        driver_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  drivers_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let driversId = req.params.id;

      // Find drivers details
      let data = await Models.userModel.findOne({
        where: { id: driversId },
      });
      res.render("admin/drivers/driversView", {
        title: "Drivers",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  drivers_status: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(`Updating drivers ${id} to status: ${status}`); // Debugging

      if (!id || status === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid data provided" });
      }

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id: id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating user status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  drivers_delete: async (req, res) => {
    try {
      const driversId = req.body.id;
      // Delete drivers
      await Models.userModel.destroy({ where: { id: driversId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete drivers " });
      return res.redirect("/admin/login");
    }
  },

  faq_list: async (req, res) => {
    try {
      let title = "Faq";
      let faqData = await Models.faqModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/faq/faqListing", {
        title,
        faqData,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_faq");
    }
  },

  add_faq: async (req, res) => {
    try {
      let title = "Faq";
      res.render("admin/faq/faq_add", {
        title,
        session: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_faq");
    }
  },

  create_faq: async (req, res) => {
    try {
      const { question, answer } = req.body;
      await Models.faqModel.create({
        question: question,
        answer: answer,
      });

      req.flash("msg", "Faq added successfully.");
      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      req.flash("msg", "An error occurred while adding the FAQ.");
      res.redirect("/admin/add_faq");
    }
  },

  delete_faq: async (req, res) => {
    try {
      await Models.faqModel.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/faq_list");
    }
  },

  faq_edit: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let faqId = req.params.id;

      let data = await Models.faqModel.findOne({
        where: { id: faqId },
      });
      res.render("admin/faq/faqEdit", {
        title: "Faq",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  faq_update: async (req, res) => {
    try {
      const faqId = req.params.id;
      const { question, answer } = req.body;

      await Models.faqModel.update(
        {
          question: question,
          answer: answer,
        },
        { where: { id: faqId } }
      );

      req.flash("msg", "FAQ updated successfully");
      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  faq_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let faqId = req.params.id;

      let data = await Models.faqModel.findOne({
        where: { id: faqId },
      });
      res.render("admin/faq/faqView", {
        title: "Faq",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  customersupport_listing: async (req, res) => {
    try {
      let title = "Customer Support";
      let customersupportData = await Models.customerSupportModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/customersupport/customersupportListing", {
        title,
        customersupportData,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_customersupport");
    }
  },

  delete_customersupport: async (req, res) => {
    try {
      await Models.customerSupportModel.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.redirect("/admin/customersupport_listing");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/customersupport_listing");
    }
  },

  customersupport_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let customersupportId = req.params.id;

      let data = await Models.customerSupportModel.findOne({
        where: { id: customersupportId },
      });
      res.render("admin/customersupport/customersupportView", {
        title: "Customer Support",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  vehicletypes_listing: async (req, res) => {
    try {
      let title = "Vehicle Types";
      let vehicle_data = await Models.vehicleTypesModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/vehicletype/vehicletypeListing", {
        title,
        vehicle_data,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/dashboard");
    }
  },

  add_vehicletype: async (req, res) => {
    try {
      let title = "Vehicle Types";
      res.render("admin/vehicletype/vehicletypeAdd", {
        title,
        session: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/vehicletypeAdd");
    }
  },

  create_vehicletype: async (req, res) => {
    try {
      const { category, name, fuelType } = req.body;
      await Models.vehicleTypesModel.create({
        category: category,
        name: name,
        fuelType: fuelType,
      });

      req.flash("msg", "vehicle type added successfully.");
      res.redirect("/admin/vehicletypes_listing");
    } catch (error) {
      console.log(error);
      req.flash("msg", "An error occurred while adding the vehicle type.");
      res.redirect("/admin/add_vehicletype");
    }
  },

  vehicletype_status: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(`Updating vehicle type ${id} to status: ${status}`); // Debugging

      if (!id || status === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid data provided" });
      }

      const [updatedRows] = await Models.vehicleTypesModel.update(
        { status: status },
        { where: { id: id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "vehicle type not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating user status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  vehicletype_delete: async (req, res) => {
    try {
      await Models.vehicleTypesModel.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.redirect("/admin/vehicletypes_listing");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/vehicletypes_listing");
    }
  },

  test: async (req, res) => {
    try {
      let objtosave = {
        title: "About Organization",
        description:
          "Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla semper viverra placerat ornare amet semper condimentum habitasse eget. Posuere ullamcorper condimentum magna enim eget id hendrerit aenean vehicula. Odio dignissim etiam eget porttitor, odio sagittis. Justo posuere inceptos et senectus netus eget quisque. Integer aptent suscipit etiam mauris lectus nec hendrerit. Efficitur scelerisque morbi per phasellus ante. Tortor iaculis magna hendrerit eleifend sapien euismod. Accumsan volutpat efficitur tortor finibus, amet sem semper.",
        type: 4,
      };
      const saved = await Models.cmsModel.create(objtosave);
      console.log(saved);
    } catch (error) {
      throw error;
    }
  },
};
