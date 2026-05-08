const { check } = require("express-validator");

const addCreateExpenseCatgeory = [
  check("name")
    .notEmpty()
    .withMessage("Expense Category name is required")
    .isLength({ max: 255 })
    .withMessage("Expense Category is too long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Description is too long"),
];

const editCreateExpenseCatgeory = [
  check("name")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("Name is too long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("description is too long"),
];

module.exports = {
    addCreateExpenseCatgeory,
    editCreateExpenseCatgeory
}