const { check } = require("express-validator");

const addMaterialValidation = [
  check("itemName")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ min: 3 })
    .withMessage("Item name must be at least 3 characters long"),

  check("hsnCode")
    .trim()
    .notEmpty()
    .withMessage("HSN code is required")
    .isNumeric()
    .withMessage("HSN code must contain only numbers")
    .isLength({ min: 4, max: 8 })
    .withMessage("HSN code must be between 4 and 8 digits"),

  check("unit")
    .trim()
    .notEmpty()
    .withMessage("Unit is required")
    .isLength({ min: 2 })
    .withMessage("Unit must be at least 2 characters"),

  check("gstRate")
    .notEmpty()
    .withMessage("GST rate is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("GST rate must be between 0 and 100"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

const editMaterialValidation = [
  check("itemName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Item name cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Item name must be at least 3 characters long"),

  check("hsnCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("HSN code cannot be empty")
    .isNumeric()
    .withMessage("HSN code must contain only numbers")
    .isLength({ min: 4, max: 8 })
    .withMessage("HSN code must be between 4 and 8 digits"),

  check("unit")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Unit cannot be empty")
    .isLength({ min: 2 })
    .withMessage("Unit must be at least 2 characters"),

  check("gstRate")
    .optional()
    .notEmpty()
    .withMessage("GST rate cannot be empty")
    .isFloat({ min: 0, max: 100 })
    .withMessage("GST rate must be between 0 and 100"),

  check("price")
    .optional()
    .notEmpty()
    .withMessage("Price cannot be empty")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

module.exports = {
  addMaterialValidation,
  editMaterialValidation,
};
