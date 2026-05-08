const { check } = require("express-validator");

const boardOfDirectorValidation = [
  check("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["director", "chairman"])
    .withMessage("Invalid role selected"),

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

  check("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address"),

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

  check("faceValue")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Face value must be a valid number"),

  check("shares")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Shares must be a valid number"),

  check("capital")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Capital must be a valid number"),

  check("shareholding")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Shareholding must be a valid number"),

  check("land")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Land must be a valid number"),
];

const editBoardOfDirectorValidation = [
  check("role")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(["director", "chairman"])
    .withMessage("Invalid role selected"),
  
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

  check("mobile")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),

  check("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),

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

  check("faceValue")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Face value must be a valid number"),

  check("shares")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Shares must be a valid number"),

  check("capital")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Capital must be a valid number"),

  check("shareholding")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Shareholding must be a valid number"),

  check("land")
    .optional({ checkFalsy: true })
    .matches(/^\d+(\.\d+)?$/)
    .withMessage("Land must be a valid number"),
];

module.exports = {
  boardOfDirectorValidation,
  editBoardOfDirectorValidation,
};
