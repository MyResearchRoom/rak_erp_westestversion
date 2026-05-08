const { Op } = require("sequelize");
const { Invoices } = require("../models");

const generateInvoiceNumber = async (transaction) => {
  const currentYear = new Date().getFullYear();

  const lastInvoice = await Invoices.findOne({
    where: {
      invoiceNumber: {
        [Op.like]: `INVOICE-${currentYear}-%`,
      },
    },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `INVOICE-${currentYear}-${paddedNumber}`;
};

module.exports = generateInvoiceNumber;