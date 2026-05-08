const { check } = require("express-validator");

const validateCreateExpense = [
  check("categoryId")
    .notEmpty()
    .withMessage("Expense category is required")
    .isInt({ min: 1 })
    .withMessage("Category must be a valid ID"),

  check("companyId")
    .notEmpty()
    .withMessage("Company is required")
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isDate()
    .withMessage("Invalid date format"),

  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 255 })
    .withMessage("Description too long"),

  check("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["bank transfer", "upi", "cheque", "cash", "card"])
    .withMessage("Invalid payment method"),

  check("reference")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Reference too long"),

  check("notes")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Notes too long"),
];

const validateUpdateExpense = [
  check("categoryId")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Category must be a valid ID"),

  check("companyId")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  check("date")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Invalid date format"),

  check("amount")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Description too long"),

  check("paymentMethod")
    .optional({ checkFalsy: true })
    .isIn(["bank transfer", "upi", "cheque", "cash", "card"])
    .withMessage("Invalid payment method"),

  check("reference")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Reference too long"),

  check("notes")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Notes too long"),
];

module.exports = {
    validateCreateExpense,
    validateUpdateExpense
}