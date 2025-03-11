module.exports = (Sequelize, sequelize, DataTypes) => {
  return sequelize.define(
    "users",
    {
      ...require("./cors")(Sequelize, DataTypes),
      role: {
        type: DataTypes.INTEGER, // 0 for (Admin) 1 for (User) 2 for (Driver) 3 for (Dispatch Admin)
        allowNull: false,
        defaultValue: 1,
      },

      fullName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      socialType: {
        type: DataTypes.INTEGER,
        allowNull: true, // 1 FOR GOOOGLE 2 FOR FACEBOOK
        defaultValue: 0,
      },
      socialId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      phoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        defaultValue: "",
      },

      password: {
        type: DataTypes.STRING(60),
        allowNull: true,
        defaultValue: "",
      },
      otpVerify: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      profilePicture: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      businessName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "N/A",
      },
      businessAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "N/A",
      },

      businessLatitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
      },
      businessLongitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null,
      },

      pickupLatitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
      },
      pickupLongitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null,
      },

      dropoffLatitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        defaultValue: null,
      },
      dropoffLongitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        defaultValue: null,
      },

      
      resetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },

      resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      deviceToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },

      deviceType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
    },
    {
      timestamps: true,
      tableName: "users",
    }
  );
};
