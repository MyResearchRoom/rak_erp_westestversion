const { check } = require("express-validator");

const addReceiptValidation = [
  check("companyId")
    .notEmpty()
    .withMessage("Company id is required")
    .isInt({ min: 1 })
    .withMessage("Company id must be a valid number"),

  check("invoiceId")
    .notEmpty()
    .withMessage("Invoice id is required")
    .isInt({ min: 1 })
    .withMessage("Invoice id must be a valid number"),

  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  check("paymentDate")
    .notEmpty()
    .withMessage("Payment date is required")
    .isDate()
    .withMessage("Invalid payment date format"),

  check("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["bank transfer", "upi", "cheque", "cash", "card"])
    .withMessage("Invalid payment method"),

  check("transactionReference")
    .trim()
    .notEmpty()
    .withMessage("Transaction reference is required")
    .isLength({ min: 3 })
    .withMessage("Transaction reference must be at least 3 characters"),
];

const editReceiptValidation = [
  check("companyId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Company id must be a valid number"),

  check("invoiceId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invoice id must be a valid number"),

  check("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  check("paymentDate")
    .optional()
    .isDate()
    .withMessage("Invalid payment date format"),

  check("paymentMethod")
    .optional()
    .isIn(["bank transfer", "upi", "cheque", "cash", "card"])
    .withMessage("Invalid payment method"),

  check("transactionReference")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Transaction reference cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Transaction reference must be at least 3 characters"),
];

module.exports = {
  addReceiptValidation,
  editReceiptValidation,
};