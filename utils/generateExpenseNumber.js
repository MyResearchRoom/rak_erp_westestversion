const { Op } = require("sequelize");
const { Expenses } = require("../models");

const generateExpenseNumber = async (transaction) => {
  const currentYear = new Date().getFullYear();

  const lastExpense = await Expenses.findOne({
    where: {
      expenseNumber: {
        [Op.like]: `EXPENCE-${currentYear}-%`,
      },
    },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  let nextNumber = 1;

  if (lastExpense) {
    const lastNumber = parseInt(lastExpense.expenseNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `EXPENCE-${currentYear}-${paddedNumber}`;
};

module.exports = generateExpenseNumber;