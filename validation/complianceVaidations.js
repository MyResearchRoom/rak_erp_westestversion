const { check, body } = require("express-validator");

const COMPLIANCE_DOC_NAMES = [
  "statutoryAudit",
  "incomeTaxReturn",
  "accountsWritingCharges",
  "tdsReturns",
  "adt1",
  "inc20A",
  "mgt7",
  "aoc4",
  "dpt3",
  "dirKyc",
  "minutesDrafting",
  "maintenanceOfRegisters",
  "incomeTaxAudit",
];

const validateCreateCompliance = [
  check("companyId")
    .notEmpty()
    .withMessage("Company is required")
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  ...COMPLIANCE_DOC_NAMES.map((doc) =>
    body(`${doc}_dueDate`)
      .optional({ checkFalsy: true })
      .isDate()
      .withMessage(`${doc} due date is invalid`)
  ),

  ...COMPLIANCE_DOC_NAMES.map((doc) =>
    body(`${doc}_financialYear`)
      .optional({ checkFalsy: true })
      .matches(/^\d{4}-\d{4}$/)
      .withMessage(`${doc} financial year must be in YYYY-YYYY format`)
  ),

  body().custom((_, { req }) => {
    const bodyKeys = Object.keys(req.body);

    const otherIndexes = new Set();

    bodyKeys.forEach((key) => {
      const match = key.match(/^otherDoc_(\d+)_/);

      if (match) {
        otherIndexes.add(match[1]);
      }
    });

    for (const index of otherIndexes) {
      const name = req.body[`otherDoc_${index}_name`];

      if (name && name.length > 255) {
        throw new Error(
          `Other document ${index} name exceeds 255 characters`
        );
      }

      const dueDate = req.body[`otherDoc_${index}_dueDate`];

      if (dueDate && isNaN(Date.parse(dueDate))) {
        throw new Error(
          `Other document ${index} due date is invalid`
        );
      }

      const financialYear =
        req.body[`otherDoc_${index}_financialYear`];

      if (
        financialYear &&
        !/^\d{4}-\d{4}$/.test(financialYear)
      ) {
        throw new Error(
          `Other document ${index} financial year is invalid`
        );
      }
    }

    return true;
  }),
];

const validateUpdateCompliance = [
  check("companyId")
    .notEmpty()
    .withMessage("Company is required")
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  ...COMPLIANCE_DOC_NAMES.map((doc) =>
    body(`${doc}_dueDate`)
      .optional({ checkFalsy: true })
      .isDate()
      .withMessage(`${doc} due date is invalid`)
  ),

  ...COMPLIANCE_DOC_NAMES.map((doc) =>
    body(`${doc}_financialYear`)
      .optional({ checkFalsy: true })
      .matches(/^\d{4}-\d{4}$/)
      .withMessage(`${doc} financial year must be in YYYY-YYYY format`)
  ),

  body().custom((_, { req }) => {
    const bodyKeys = Object.keys(req.body);

    const otherIndexes = new Set();

    bodyKeys.forEach((key) => {
      const match = key.match(/^otherDoc_(\d+)_/);

      if (match) {
        otherIndexes.add(match[1]);
      }
    });

    for (const index of otherIndexes) {
      const name = req.body[`otherDoc_${index}_name`];

      if (name && name.length > 255) {
        throw new Error(
          `Other document ${index} name exceeds 255 characters`
        );
      }

      const dueDate = req.body[`otherDoc_${index}_dueDate`];

      if (dueDate && isNaN(Date.parse(dueDate))) {
        throw new Error(
          `Other document ${index} due date is invalid`
        );
      }

      const financialYear =
        req.body[`otherDoc_${index}_financialYear`];

      if (
        financialYear &&
        !/^\d{4}-\d{4}$/.test(financialYear)
      ) {
        throw new Error(
          `Other document ${index} financial year is invalid`
        );
      }
    }

    return true;
  }),
];

module.exports = {
  validateCreateCompliance,
  validateUpdateCompliance,
};