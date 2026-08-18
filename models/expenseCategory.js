const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ExpenseCategories extends Model {
    static associate(models) {
        ExpenseCategories.hasMany(models.Expenses, {
            foreignKey: "categoryId",
            as: "expenses",
        });
        ExpenseCategories.belongsTo(models.Company, {
          foreignKey: "companyId",
          as: "company",
        });
    }
  }

  ExpenseCategories.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      companyId: {
        type:DataTypes.INTEGER,
        allowNull:true,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ExpenseCategories",
      tableName: "expense_categories",
      timestamps: true,
    }
  );

  return ExpenseCategories;
};
