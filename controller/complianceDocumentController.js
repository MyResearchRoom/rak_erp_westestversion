const { Company, ComplianceDocuments, OtherComplianceDocuments, sequelize } = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

// ─── Known compliance document keys (must match frontend `name` fields) ───────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getComplianceStatus = (expiryDate) => {
  if (!expiryDate) return "Valid";
  const today = new Date();
  const expDate = new Date(expiryDate);
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expired";
  if (diffDays <= 15) return "Expiring Soon";
  return "Valid";
};

/**
 * Returns the current Indian Financial Year start year.
 * Indian FY runs April 1 → March 31.
 * e.g. if today is Jan 2026 → FY is 2025-2026 → startYear = 2025
 *      if today is May 2026 → FY is 2026-2027 → startYear = 2026
 */
const getIndianFYStartYear = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-indexed
  const year  = today.getFullYear();
  // Indian FY starts in April (month 4)
  return month >= 4 ? year : year - 1;
};

/**
 * Parse the flat FormData sent by the frontend into structured arrays.
 *
 * FormData shape from the frontend:
 *   companyId
 *   {docName}_file          → req.files field name
 *   {docName}_dueDate       → req.body
 *   {docName}_financialYear → req.body
 *   otherDoc_{i}_name
 *   otherDoc_{i}_dueDate
 *   otherDoc_{i}_financialYear
 *   otherDoc_{i}_file
 *
 * multer must be configured with `.fields([...])` — see comment at bottom.
 */
const parseFormData = (body, files) => {
  // ── Standard compliance documents ─────────────────────────────────────────
  const documents = COMPLIANCE_DOC_NAMES.map((name) => {
    const fileArr = files[`${name}_file`];
    const file    = fileArr && fileArr[0] ? fileArr[0] : null;

    return {
      name,
      dueDate:       body[`${name}_dueDate`]       || null,
      financialYear: body[`${name}_financialYear`] || null,
      buffer:        file ? file.buffer            : null,
      mimeType:      file ? file.mimetype          : null,
    };
  });

  // ── Other / custom documents ───────────────────────────────────────────────
  // Collect all indices present in body (otherDoc_0_*, otherDoc_1_*, …)
  const otherIndices = new Set();
  Object.keys(body).forEach((key) => {
    const match = key.match(/^otherDoc_(\d+)_/);
    if (match) otherIndices.add(Number(match[1]));
  });
  Object.keys(files).forEach((key) => {
    const match = key.match(/^otherDoc_(\d+)_file/);
    if (match) otherIndices.add(Number(match[1]));
  });

  const otherDocuments = [...otherIndices].sort((a, b) => a - b).map((i) => {
    const fileArr = files[`otherDoc_${i}_file`];
    const file    = fileArr && fileArr[0] ? fileArr[0] : null;

    return {
      docName:       body[`otherDoc_${i}_name`]          || null,
      dueDate:       body[`otherDoc_${i}_dueDate`]        || null,
      financialYear: body[`otherDoc_${i}_financialYear`]  || null,
      buffer:        file ? file.buffer                   : null,
      mimeType:      file ? file.mimetype                 : null,
    };
  });

  return { documents, otherDocuments };
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

exports.addComplianceData = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { companyId } = req.body;

    if (!companyId) {
      await transaction.rollback();
      return errorResponse(res, "companyId is required", 400);
    }

    const company = await Company.findByPk(companyId, { transaction });
    if (!company) {
      await transaction.rollback();
      return errorResponse(res, "Company not found", 404);
    }

    const { documents, otherDocuments } = parseFormData(req.body, req.files || {});

    // ── Upsert standard compliance documents ──────────────────────────────
    // One row per (companyId, name) — update if already exists, insert if not.
    const complianceResults = [];

    for (const doc of documents) {
      // Only persist rows that have at least one meaningful value
      if (!doc.buffer && !doc.dueDate && !doc.financialYear) continue;

      const [record, created] = await ComplianceDocuments.findOrCreate({
        where: {
          companyId,
          docName: doc.name,
          financialYear: doc.financialYear || null,
        },
        defaults: {
          companyId,
          docName:       doc.name,
          dueDate:       doc.dueDate,
          financialYear: doc.financialYear,
          doc:           doc.buffer,
          docContentType: doc.mimeType,
        },
        transaction,
      });

      if (!created) {
        const updateData = {};
        updateData.docName = doc.name;
        if (doc.dueDate)       updateData.dueDate       = doc.dueDate;
        if (doc.financialYear) updateData.financialYear = doc.financialYear;
        if (doc.buffer)        { updateData.doc = doc.buffer; updateData.docContentType = doc.mimeType; }
        await record.update(updateData, { transaction });
      }

      const plain = record.toJSON();
      delete plain.doc; // don't send binary back
      complianceResults.push(plain);
    }

    // ── Insert other/custom documents ─────────────────────────────────────
    const otherResults = [];
    const otherFinancialYears = [
      ...new Set(otherDocuments.map((od) => od.financialYear).filter(Boolean)),
    ];

    for (const financialYear of otherFinancialYears) {
      await OtherComplianceDocuments.destroy({
        where: { companyId, financialYear },
        transaction,
      });
    }

    for (const od of otherDocuments) {
      if (!od.docName?.trim()) continue; // skip blank rows

      const record = await OtherComplianceDocuments.create(
        {
          companyId,
          docName:        od.docName.trim(),
          dueDate:        od.dueDate        || null,
          financialYear:  od.financialYear  || null,
          doc:            od.buffer         || null,
          docContentType: od.mimeType       || null,
        },
        { transaction }
      );

      const plain = record.toJSON();
      delete plain.doc;
      otherResults.push(plain);
    }

    await transaction.commit();

    return successResponse(res, "Compliance created successfully", {
      documents:      complianceResults,
      otherDocuments: otherResults,
    });

  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return errorResponse(res, "Failed to add compliance data", 500);
  }
};

// ─── EDIT ─────────────────────────────────────────────────────────────────────

exports.editCompliance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { companyId } = req.body;

    if (!companyId) {
      await transaction.rollback();
      return errorResponse(res, "companyId is required", 400);
    }

    const company = await Company.findByPk(companyId, { transaction });
    if (!company) {
      await transaction.rollback();
      return errorResponse(res, "Company not found", 404);
    }

    const { documents, otherDocuments } = parseFormData(req.body, req.files || {});

    // ── Upsert standard compliance documents ──────────────────────────────
    const complianceResults = [];

    for (const doc of documents) {
      if (!doc.buffer && !doc.dueDate && !doc.financialYear) continue;

      const [record, created] = await ComplianceDocuments.findOrCreate({
        where: {
          companyId,
          docName: doc.name,
          financialYear: doc.financialYear || null,
        },
        defaults: {
          companyId,
          docName:        doc.name,
          dueDate:        doc.dueDate,
          financialYear:  doc.financialYear,
          doc:            doc.buffer,
          docContentType: doc.mimeType,
        },
        transaction,
      });

      if (!created) {
        const updateData = {};
        updateData.docName = doc.name;
        if (doc.dueDate)       updateData.dueDate       = doc.dueDate;
        if (doc.financialYear) updateData.financialYear = doc.financialYear;
        if (doc.buffer)        { updateData.doc = doc.buffer; updateData.docContentType = doc.mimeType; }
        await record.update(updateData, { transaction });
      }

      const plain = record.toJSON();
      delete plain.doc;
      complianceResults.push(plain);
    }

    // ── Replace other documents for this company ──────────────────────────
    // Strategy: delete all existing other-docs for companyId, then re-insert.
    // This keeps it simple and in sync with whatever the frontend sends.
    const otherFinancialYears = [
      ...new Set(otherDocuments.map((od) => od.financialYear).filter(Boolean)),
    ];

    if (otherFinancialYears.length > 0) {
      await OtherComplianceDocuments.destroy({
        where: { companyId, financialYear: { [Op.in]: otherFinancialYears } },
        transaction,
      });
    }

    const otherResults = [];

    for (const od of otherDocuments) {
      if (!od.docName?.trim()) continue;

      const record = await OtherComplianceDocuments.create(
        {
          companyId,
          docName:        od.docName.trim(),
          dueDate:        od.dueDate        || null,
          financialYear:  od.financialYear  || null,
          doc:            od.buffer         || null,
          docContentType: od.mimeType       || null,
        },
        { transaction }
      );

      const plain = record.toJSON();
      delete plain.doc;
      otherResults.push(plain);
    }

    await transaction.commit();

    return successResponse(res, "Compliance updated successfully", {
      documents:      complianceResults,
      otherDocuments: otherResults,
    });

  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return errorResponse(res, "Failed to edit compliance data", 500);
  }
};

// ─── GET BY COMPANY (for edit pre-population) ─────────────────────────────────

exports.getComplianceById = async (req, res) => {
  try {
    const companyId = req.params.companyId || req.params.id;
    const { financialYear } = req.query;

    if (!companyId) return errorResponse(res, "companyId is required", 400);

    const company = await Company.findByPk(companyId, {
      attributes: ["id", "name"],
    });
    if (!company) return errorResponse(res, "Company not found", 404);

    const docs = await ComplianceDocuments.findAll({
      where: financialYear ? { companyId, financialYear } : { companyId },
      order: [["createdAt", "ASC"]],
    });

    const otherDocs = await OtherComplianceDocuments.findAll({
      where: financialYear ? { companyId, financialYear } : { companyId },
      order: [["createdAt", "ASC"]],
    });

    const formatDoc = (doc) => {
      const d = doc.toJSON();
      d.name = d.docName;
      if (d.doc && d.docContentType) {
        d.doc = `data:${d.docContentType};base64,${Buffer.from(d.doc).toString("base64")}`;
      } else {
        d.doc = null;
      }
      return d;
    };

    return successResponse(res, "Compliance data fetched successfully", {
      companyId,
      CompanyData: company.toJSON(),
      documents:      docs.map(formatDoc),
      otherDocuments: otherDocs.map(formatDoc),
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch compliance", 500);
  }
};

// ─── GET INDIAN FINANCIAL YEAR OPTIONS ────────────────────────────────────────
// Returns 3 options: previous FY, current FY, next FY
// Indian Financial Year: April 1 → March 31
// e.g. if today = Jan 2026 → current FY = 2025-2026
//      if today = May 2026 → current FY = 2026-2027

exports.getFinancialYearOptions = async (req, res) => {
  try {
    const currentFYStart = getIndianFYStartYear();

    const financialYears = [
      {
        label:    `${currentFYStart - 1}-${currentFYStart}`,
        value:    `${currentFYStart - 1}-${currentFYStart}`,
        tag:      "Previous Year",
      },
      {
        label:    `${currentFYStart}-${currentFYStart + 1}`,
        value:    `${currentFYStart}-${currentFYStart + 1}`,
        tag:      "Current Year",
      },
      {
        label:    `${currentFYStart + 1}-${currentFYStart + 2}`,
        value:    `${currentFYStart + 1}-${currentFYStart + 2}`,
        tag:      "Next Year",
      },
    ];

    return successResponse(res, "Financial year options fetched successfully", {
      financialYears,
      currentFinancialYear: `${currentFYStart}-${currentFYStart + 1}`,
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch financial year options", 500);
  }
};

// ─── LIST ─────────────────────────────────────────────────────────────────────

exports.getComplianceDocumentList = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({ ...req.query });
    const { companyId, financialYear } = req.query;
    const { role, email, id: userId } = req.user;

    if (!companyId) return errorResponse(res, "companyId is required", 400);

    const whereClause = { companyId };
    if (financialYear) whereClause.financialYear = financialYear;
    if (searchTerm) {
      whereClause[Op.or] = [
        { docName: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { count, rows } = await ComplianceDocuments.findAndCountAll({
      where: whereClause,
      include: [{ model: Company, as: "CompanyData" }],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const allDocs = await ComplianceDocuments.findAll({
      where: whereClause,
      attributes: ["dueDate"],
    });

    const statusSummary = { valid: 0, expiringSoon: 0, expired: 0, total: 0 };
    allDocs.forEach((doc) => {
      const status = getComplianceStatus(doc.dueDate);
      statusSummary.total++;
      if (status === "Valid")              statusSummary.valid++;
      else if (status === "Expiring Soon") statusSummary.expiringSoon++;
      else if (status === "Expired")       statusSummary.expired++;
    });

    const complianceDocuments = rows.map((doc) => {
      const d = doc.toJSON();
      d.name = d.docName;
      if (d.doc && d.docContentType) {
        d.doc = `data:${d.docContentType};base64,${Buffer.from(d.doc).toString("base64")}`;
      } else {
        d.doc = null;
      }
      d.status = getComplianceStatus(d.dueDate);
      if (d.CompanyData?.logo) {
        d.CompanyData.logo = `data:${d.CompanyData.logoContentType};base64,${Buffer.from(d.CompanyData.logo).toString("base64")}`;
      }
      return d;
    });

    return successResponse(res, "Compliance documents fetched successfully", {
      compliance: complianceDocuments,
      statusSummary,
      pagination: {
        totalRecords: count,
        totalPages:   Math.ceil(count / limit),
        currentPage:  page,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch compliance documents", 500);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

exports.deleteCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, "compliance id is required", 400);

    const compliance = await ComplianceDocuments.findByPk(id);
    if (!compliance) return errorResponse(res, "Compliance not found", 404);

    await compliance.destroy();
    return successResponse(res, "Compliance deleted successfully");

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete compliance", 500);
  }
};

// ─── getComplianceList (company-level summary, unchanged logic) ───────────────

exports.getComplianceList = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { companyId } = req.query;
    const { role, email, id: userId } = req.user;

    const whereClause = { [Op.and]: [] };

    if (role === "COMPANY") {
      const company = await Company.findOne({ where: { email } });
      if (!company) return errorResponse(res, "Company not found", 404);
      whereClause[Op.and].push({ id: company.id });
    }

    if (role === "EMPLOYEE") {
      const companies = await Company.findAll({
        where: { assignEmployee: userId },
        attributes: ["id"],
      });
      if (!companies.length) {
        return successResponse(res, "No compliance data found", {
          compliance: [],
          pagination: { totalRecords: 0, totalPages: 0, currentPage: page, itemsPerPage: limit },
        });
      }
      whereClause[Op.and].push({ id: { [Op.in]: companies.map((c) => c.id) } });
    }

    if (companyId) whereClause[Op.and].push({ id: companyId });

    const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

    const { count, rows } = await Company.findAndCountAll({
      where: finalWhere,
      include: [{ model: ComplianceDocuments, as: "complianceDocuments", required: true }],
      distinct: true,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const compliance = rows.map((row) => {
      const data = row.toJSON();
      if (data.logo) {
        data.logo = `data:${data.logoContentType};base64,${Buffer.from(data.logo).toString("base64")}`;
      } else {
        data.logo = null;
      }

      const statusCount = { valid: 0, expiringSoon: 0, expired: 0 };
      data.complianceDocuments = data.complianceDocuments.map((doc) => {
        const fd = { ...doc };
        fd.name = fd.docName;
        if (doc.doc && doc.docContentType) {
          fd.doc = `data:${doc.docContentType};base64,${Buffer.from(doc.doc).toString("base64")}`;
        } else {
          fd.doc = null;
        }
        const status = getComplianceStatus(doc.dueDate);
        fd.status = status;
        if (status === "Valid")              statusCount.valid++;
        else if (status === "Expiring Soon") statusCount.expiringSoon++;
        else if (status === "Expired")       statusCount.expired++;
        return fd;
      });

      data.statusSummary = statusCount;
      return data;
    });

    return successResponse(res, "Compliance document fetched successfully", {
      compliance,
      pagination: {
        totalRecords: count,
        totalPages:   limit ? Math.ceil(count / limit) : 1,
        currentPage:  page,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch compliance list", 500);
  }
};

/*
─── MULTER SETUP REQUIRED IN YOUR ROUTE FILE ────────────────────────────────────

  const multer  = require('multer');
  const storage = multer.memoryStorage();
  const upload  = multer({ storage });

  // Build the fields array dynamically from COMPLIANCE_DOC_NAMES
  const COMPLIANCE_DOC_NAMES = [ ...same list as above... ];
  const uploadFields = [
    ...COMPLIANCE_DOC_NAMES.map(name => ({ name: `${name}_file`, maxCount: 1 })),
    ...Array.from({ length: 20 }, (_, i) => ({ name: `otherDoc_${i}_file`, maxCount: 1 })),
  ];

  router.post('/compliance',           upload.fields(uploadFields), complianceController.addComplianceData);
  router.put('/compliance/:companyId', upload.fields(uploadFields), complianceController.editCompliance);
  router.get('/compliance/:companyId', complianceController.getComplianceById);

  // ── NEW: Financial Year options endpoint (no auth needed, or add middleware if required) ──
  router.get('/compliance/financial-years', complianceController.getFinancialYearOptions);

─── SEQUELIZE MODEL NEEDED: OtherComplianceDocuments ────────────────────────────

  module.exports = (sequelize, DataTypes) => {
    const OtherComplianceDocuments = sequelize.define('OtherComplianceDocuments', {
      companyId:      { type: DataTypes.INTEGER,  allowNull: false },
      docName:        { type: DataTypes.STRING,   allowNull: false },
      dueDate:        { type: DataTypes.DATEONLY, allowNull: true  },
      financialYear:  { type: DataTypes.STRING,   allowNull: true  },
      doc:            { type: DataTypes.BLOB('long'), allowNull: true },
      docContentType: { type: DataTypes.STRING,   allowNull: true  },
    });

    OtherComplianceDocuments.associate = (models) => {
      OtherComplianceDocuments.belongsTo(models.Company, {
        foreignKey: 'companyId', as: 'CompanyData',
      });
    };

    return OtherComplianceDocuments;
  };

─── ComplianceDocuments model needs a `name` column ─────────────────────────────
  Add:  name: { type: DataTypes.STRING, allowNull: false }
  And a unique index on (companyId, name) for the findOrCreate upsert to work safely.

*/
