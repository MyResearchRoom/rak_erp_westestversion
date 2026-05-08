const { check } = require("express-validator");

const createInvoiceValidation = [
  check("companyId")
    .notEmpty()
    .withMessage("Company id is required"),

  check("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  check("customerDetails.name")
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ min: 3 })
    .withMessage("name must be at least 3 characters long"),

  check("customerDetails.phone")
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone must be 10 digits"),

  check("customerDetails.email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),

  check("customerDetails.address")
    .notEmpty()
    .withMessage("Address is required"),

  check("customerDetails.city")
    .notEmpty()
    .withMessage("City is required"),

  check("customerDetails.state")
    .notEmpty()
    .withMessage("State is required"),

  check("customerDetails.pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode number"),

  check("customerDetails.pan")
    .notEmpty()
    .withMessage("PAN is required")
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN"),

  check("customerDetails.gstin")
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/)
    .withMessage("Invalid GSTIN"),
];

module.exports = {
  createInvoiceValidation,
};