const { Op } = require("sequelize");
const { Receipts } = require("../models");

const generateReceiptNumber = async (transaction) => {
  const currentYear = new Date().getFullYear();

  const lastReceipt = await Receipts.findOne({
    where: {
      receiptNumber: {
        [Op.like]: `RECEIPT-${currentYear}-%`,
      },
    },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  let nextNumber = 1;

  if (lastReceipt) {
    const lastNumber = parseInt(lastReceipt.receiptNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `RECEIPT-${currentYear}-${paddedNumber}`;
};

module.exports = generateReceiptNumber;