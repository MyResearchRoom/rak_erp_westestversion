const { check } = require("express-validator");

const validateCreateCompliance = [

  check("companyId")
    .notEmpty()
    .withMessage("Company is required")
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  check("docName")
    .notEmpty()
    .withMessage("Document name is required")
    .isLength({ max: 255 })
    .withMessage("Document name too long"),

  check("docNumber")
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage("Document number too long"),

  check("issueAuthority")
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage("Issue Authority too long"),

  check("issueDate")
    .notEmpty()
    .withMessage("Issue Date is required")
    .isDate()
    .withMessage("Invalid issue date format"),

  check("expiryDate")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Invalid expiry date format"),

  check("note")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Note too long"),
];

const validateUpdateCompliance = [
    check("companyId")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage("Company must be a valid ID"),

    check("docName")
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage("Document name too long"),

    check("docNumber")
        .optional({ checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage("Document number too long"),

    check("issueAuthority")
        .optional({ checkFalsy: true })
        .isLength({ max: 20 })
        .withMessage("Issue Authority too long"),

    check("issueDate")
        .notEmpty()
        .withMessage("Issue Date is required")
        .isDate()
        .withMessage("Invalid issue date format"),

    check("expiryDate")
        .optional({ checkFalsy: true })
        .isDate()
        .withMessage("Invalid expiry date format"),

    check("note")
        .optional({ checkFalsy: true })
        .isLength({ max: 500 })
        .withMessage("Note too long"),
];

module.exports = {
    validateCreateCompliance,
    validateUpdateCompliance
}