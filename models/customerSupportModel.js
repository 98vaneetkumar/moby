module.exports = (Sequelize, sequelize, DataTypes) => {
    return sequelize.define(
      "customerSupport",
      {
        ...require("./cors")(Sequelize, DataTypes),
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue:''
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue:''
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: '',
        },
      },
      {
        timestamps: true,
        tableName: "customerSupport",
      }
    );
  };
  