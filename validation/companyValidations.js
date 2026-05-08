const { check } = require("express-validator");

const companyRegistrationValidation = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),

    check("gstin")
        .trim()
        .notEmpty()
        .withMessage("GSTIN is required")
        .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .withMessage("Invalid GSTIN format"), 

    check("pan")
        .trim()
        .notEmpty()
        .withMessage("PAN number is required")
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .withMessage("Invalid PAN format"),
        
    check("companyType")
        .notEmpty()
        .withMessage("Company type is required"),
    
    check("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required"),

    check("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    check("state")
        .trim()
        .notEmpty()
        .withMessage("State is required"),

    check("pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .matches(/^\d{6}$/)
        .withMessage("Enter a valid 6-digit pincode number"),

    check("contactPerson")
        .trim()
        .notEmpty()
        .withMessage("Contact person name is required"),

    check("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    check("mobileNumber")
        .trim()
        .notEmpty()
        .withMessage("Mobile number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Enter a valid 10-digit mobile number"),

    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&]/)
        .withMessage("Password must contain at least one special character"),
    
    check("assignEmployee")
        .notEmpty()
        .withMessage("Assign employee is required")
        .isInt()
        .withMessage("Assign employee must be a valid ID"),

];

const companyEditValidation = [
  check("name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  check("gstin")
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("Invalid GSTIN format"),

  check("pan")
    .optional()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN format"),

  check("pincode")
    .optional()
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Enter a valid 6-digit pincode number"),

  check("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),

  check("mobileNumber")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),

  check("assignEmployee")
    .optional()
    .isInt()
    .withMessage("Assign employee must be a valid ID"),
];

module.exports = {
    companyRegistrationValidation,
    companyEditValidation,
}