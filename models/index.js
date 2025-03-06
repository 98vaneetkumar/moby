const Sequelize = require("sequelize");
const vehicleTypesModel = require("./vehicleTypesModel");
const sequelize = require("../dbConnection").sequelize;

module.exports = {
  userModel: require("./userModel")(Sequelize, sequelize, Sequelize.DataTypes),
  cmsModel: require("./cmsModel")(Sequelize, sequelize, Sequelize.DataTypes),
  faqModel:require("./faqModel")(Sequelize, sequelize, Sequelize.DataTypes),
  customerSupportModel:require("./customerSupportModel")(Sequelize, sequelize, Sequelize.DataTypes),
  vehicleTypesModel: require("./vehicleTypesModel")(Sequelize, sequelize, Sequelize.DataTypes),
};
 