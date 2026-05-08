const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Expenses extends Model {
    static associate(models) {
        Expenses.belongsTo(models.ExpenseCategories, {
            foreignKey: "categoryId",
            as: "expenseCategory",
        });
        Expenses.belongsTo(models.Company, {
            foreignKey: "companyId",
            as: "company",
        });
        Expenses.belongsTo(models.User, {
            foreignKey: "createdBy",
            as: "createdByUser",
        });
    }
  }

  Expenses.init(
    {
        expenseNumber: {
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
        },

        categoryId :{
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        companyId :{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        amount: {
            type:DataTypes.DECIMAL(10,2),
            allowNull:false,
            defaultValue: 0
        },

        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        paymentMethod :{
            type: DataTypes.ENUM(
                "bank transfer","upi","cheque","cash","card"
            ),
            allowNull:false,
        },

        reference: {
            type:DataTypes.STRING,
            allowNull:true,
        },

        status :{
            type: DataTypes.ENUM(
                "pending","approved","rejected"
            ),
            allowNull:false,
            defaultValue:"pending",
        },

        createdBy: {
            type: DataTypes.INTEGER,
            allowNull:true,
        },

        notes :{
            type:DataTypes.STRING,
            allowNull:true,
        },

        receipt:{
            type: DataTypes.BLOB("long"),
            allowNull:true,
        },

        receiptContentType:{
            type: DataTypes.STRING,
            allowNull: true,
        }
        
    },
    {
      sequelize,
      modelName: "Expenses",
      tableName: "expenses",
      timestamps: true,
    }
  );

  return Expenses;
};
