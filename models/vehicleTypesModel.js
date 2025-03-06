module.exports = (Sequelize, sequelize, DataTypes) => {
    return sequelize.define(
      "vehicleType",
      {
        ...require("./cors")(Sequelize, DataTypes),
        category: {
          type: DataTypes.STRING(255), // Bike, Auto, Car, etc.
          allowNull: true,
          defaultValue: "",
        },
        name: {
          type: DataTypes.STRING(50), // Specific vehicle name (e.g., Activa, Swift, etc.)
          allowNull: false,
          defaultValue: "",
        },
        fuelType: {
          type: DataTypes.ENUM("Petrol", "Diesel", "Hybrid", "Electric"),
          allowNull: false,
          defaultValue: "Petrol",
        },
      },
      {
        timestamps: true,
        tableName: "vehicleType",
      }
    );
  };
  