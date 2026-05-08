const { check } = require("express-validator");

const addFarmerMemberValidation = [

  check("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  
  check("age")
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("Age must be valid integer number"),

  check("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender selected"),

  check("category")
    .optional({ checkFalsy: true })
    .isIn(["general", "obc", "sc", "st"])
    .withMessage("Invalid category selected"),

  check("mobileNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),


  check("pan")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN format"),

  check("aadhaar")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{12}$/)
    .withMessage("Invalid Aadhaar number format (must be 12 digits)"),

  check("pincode")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode number"),
];

const editFarmerMemberValidation = [
  check("fullName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  check("age")
      .optional({ checkFalsy: true })
      .isInt()
      .withMessage("Age must be valid integer number"),

  check("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender selected"),

  check("category")
    .optional({ checkFalsy: true })
    .isIn(["general", "obc", "sc", "st"])
    .withMessage("Invalid category selected"),

  check("mobileNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),

  check("pan")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN format"),

  check("aadhaar")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{12}$/)
    .withMessage("Invalid Aadhaar number format (must be 12 digits)"),

  check("pincode")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode number"),
];

module.exports = {
  addFarmerMemberValidation,
  editFarmerMemberValidation,
};