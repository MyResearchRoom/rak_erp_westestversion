"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Materials extends Model {
    static associate(models) {
      Materials.hasMany(models.InvoiceItems, {
        foreignKey: "materialId",
        as: "invoice",
      });
      Materials.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
    }
  }

  Materials.init(
    {
      
      itemName: {
        type:DataTypes.STRING,
        allowNull:false,
      },
      companyId: {
        type:DataTypes.INTEGER,
        allowNull:true,
      },

      hsnCode: {
        type:DataTypes.STRING,
        allowNull:false,
      },

      unit: {
        type:DataTypes.STRING,
        allowNull:false,
      },
   
      gstRate: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
      },
     
      price: {
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
      },

    },
    {
      sequelize,
      modelName: "Materials",
      tableName: "materials",
      timestamps: true,
    }
  );

  return Materials;
};
