const { Company, ComplianceDocuments, OtherComplianceDocuments, sequelize } = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

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

const getIndianFYStartYear = () => {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-indexed
  const year = today.getFullYear();
  return month >= 4 ? year : year - 1;
};

const parseFormData = (body, files) => {
  // ── Standard compliance documents ─────────────────────────────────────────
  const documents = COMPLIANCE_DOC_NAMES.map((name) => {
    const fileArr = files[`${name}_file`];
    const file = fileArr && fileArr[0] ? fileArr[0] : null;

    return {
      id: body[`${name}_id`] || null,
      name,
      dueDate: body[`${name}_dueDate`] || null,
      financialYear: body[`${name}_financialYear`] || null,
      buffer: file ? file.buffer : null,
      mimeType: file ? file.mimetype : null,
    };
  });

  // ── Other / custom documents ───────────────────────────────────────────────
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
    const file = fileArr && fileArr[0] ? fileArr[0] : null;

    return {
      id: body[`otherDoc_${i}_id`] || null,
      docName: body[`otherDoc_${i}_name`] || null,
      dueDate: body[`otherDoc_${i}_dueDate`] || null,
      financialYear: body[`otherDoc_${i}_financialYear`] || null,
      buffer: file ? file.buffer : null,
      mimeType: file ? file.mimetype : null,
    };
  });

  return { documents, otherDocuments };
};

const upsertComplianceDocument = async (companyId, doc, transaction) => {
  let record = null;

  if (doc.id) {
    record = await ComplianceDocuments.findOne({
      where: { id: doc.id, companyId,financialYear:doc.financialYear},
      transaction,
    });

    if (record) {
      const updateData = { docName: doc.name };
      if (doc.dueDate) updateData.dueDate = doc.dueDate;
      if (doc.financialYear) updateData.financialYear = doc.financialYear;
      if (doc.buffer) { updateData.doc = doc.buffer; updateData.docContentType = doc.mimeType; }
      await record.update(updateData, { transaction });
    }
  }

  if (!record) {
    const [rec, created] = await ComplianceDocuments.findOrCreate({
      where: {
        companyId,
        docName: doc.name,
        financialYear: doc.financialYear || null,
      },
      defaults: {
        companyId,
        docName: doc.name,
        dueDate: doc.dueDate,
        financialYear: doc.financialYear,
        doc: doc.buffer,
        docContentType: doc.mimeType,
      },
      transaction,
    });

    if (!created) {
      const updateData = { docName: doc.name };
      if (doc.dueDate) updateData.dueDate = doc.dueDate;
      if (doc.financialYear) updateData.financialYear = doc.financialYear;
      if (doc.buffer) { updateData.doc = doc.buffer; updateData.docContentType = doc.mimeType; }
      await rec.update(updateData, { transaction });
    }
    record = rec;
  }
  // console.log("record in upsert function",record);
  
  return record;
};

const upsertOtherDocument = async (companyId, od, transaction) => {
  let record = null;

  if (od.id) {
    record = await OtherComplianceDocuments.findOne({
      where: { id: od.id, companyId, financialYear:od.financialYear,docName:od.docName },
      transaction,
    });

    if (record) {
      const updateData = { docName: od.docName.trim() };
      if (od.dueDate) updateData.dueDate = od.dueDate;
      if (od.financialYear) updateData.financialYear = od.financialYear;
      if (od.buffer) { updateData.doc = od.buffer; updateData.docContentType = od.mimeType; }
      await record.update(updateData, { transaction });
    }
  }

  if(!record){
    const [rec, created] = await OtherComplianceDocuments.findOrCreate({
      where: {
        companyId,
        docName: od.docName,
        financialYear: od.financialYear || null,
      },
      defaults: {
        companyId,
        docName: od.docName.trim(),
        dueDate: od.dueDate,
        financialYear: od.financialYear,
        doc: od.buffer,
        docContentType: od.mimeType,
      },
      transaction,
    });

    if (!created) {
      const updateData = { docName: od.docName.trim() };
      if (od.dueDate) updateData.dueDate = od.dueDate;
      if (od.financialYear) updateData.financialYear = od.financialYear;
      if (od.buffer) { 
        updateData.doc = od.buffer; 
        updateData.docContentType = od.mimeType; }
      await rec.update(updateData, { transaction });
    }
    record = rec;
  }

  // if (!record) {
  //   record = await OtherComplianceDocuments.create(
  //     {
  //       companyId,
  //       docName: od.docName.trim(),
  //       dueDate: od.dueDate || null,
  //       financialYear: od.financialYear || null,
  //       doc: od.buffer || null,
  //       docContentType: od.mimeType || null,
  //     },
  //     { transaction }
  //   );
  // }

  return record;
};


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

    const complianceResults = [];
    for (const doc of documents) {
      if (!doc.buffer && !doc.dueDate && !doc.financialYear && !doc.id) continue;
      const record = await upsertComplianceDocument(companyId, doc, transaction);
      const plain = record.toJSON();
      delete plain.doc;
      complianceResults.push(plain);
    }

    const otherResults = [];
    for (const od of otherDocuments) {
      if (!od.docName?.trim()) continue;
      const record = await upsertOtherDocument(companyId, od, transaction);
      const plain = record.toJSON();
      delete plain.doc;
      otherResults.push(plain);
    }

    await transaction.commit();

    return successResponse(res, "Compliance created successfully", {
      documents: complianceResults,
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
    // companyId still comes from the body (frontend always sends it), but if
    // the route also carries :id (PATCH /compliance/edit/:id) we no longer
    // ignore it — a param id targets ComplianceDocuments directly and takes
    // priority over any per-row id in the body for that single row.
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

    const complianceResults = [];
    for (const doc of documents) {
      if (!doc.buffer && !doc.dueDate && !doc.financialYear && !doc.id) continue;
      const record = await upsertComplianceDocument(companyId, doc, transaction);
      const plain = record.toJSON();
      delete plain.doc;

      // console.log("plain",plain);
      
      complianceResults.push(plain);
    }

    const otherResults = [];
    for (const od of otherDocuments) {
      if (!od.docName?.trim()) continue;
      const record = await upsertOtherDocument(companyId, od, transaction);
      const plain = record.toJSON();
      delete plain.doc;
      otherResults.push(plain);
    }

    await transaction.commit();

    return successResponse(res, "Compliance updated successfully", {
      documents: complianceResults,
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
      documents: docs.map(formatDoc),
      otherDocuments: otherDocs.map(formatDoc),
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch compliance", 500);
  }
};

// ─── GET INDIAN FINANCIAL YEAR OPTIONS ────────────────────────────────────────

exports.getFinancialYearOptions = async (req, res) => {
  try {
    const currentFYStart = getIndianFYStartYear();

    const financialYears = [
      {
        label: `${currentFYStart - 1}-${currentFYStart}`,
        value: `${currentFYStart - 1}-${currentFYStart}`,
        tag: "Previous Year",
      },
      {
        label: `${currentFYStart}-${currentFYStart + 1}`,
        value: `${currentFYStart}-${currentFYStart + 1}`,
        tag: "Current Year",
      },
      {
        label: `${currentFYStart + 1}-${currentFYStart + 2}`,
        value: `${currentFYStart + 1}-${currentFYStart + 2}`,
        tag: "Next Year",
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

// ─── LIST ───────────────────────────────────────────────────────────────────

exports.getComplianceDocumentList = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({ ...req.query });
    const { companyId, financialYear } = req.query;

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
      if (status === "Valid") statusSummary.valid++;
      else if (status === "Expiring Soon") statusSummary.expiringSoon++;
      else if (status === "Expired") statusSummary.expired++;
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
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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
        if (status === "Valid") statusCount.valid++;
        else if (status === "Expiring Soon") statusCount.expiringSoon++;
        else if (status === "Expired") statusCount.expired++;
        return fd;
      });

      data.statusSummary = statusCount;
      return data;
    });

    return successResponse(res, "Compliance document fetched successfully", {
      compliance,
      pagination: {
        totalRecords: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: page,
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

  const COMPLIANCE_DOC_NAMES = [ ...same list as above... ];
  const uploadFields = [
    ...COMPLIANCE_DOC_NAMES.map(name => ({ name: `${name}_file`, maxCount: 1 })),
    ...Array.from({ length: 20 }, (_, i) => ({ name: `otherDoc_${i}_file`, maxCount: 1 })),
  ];

  router.post('/compliance',           upload.fields(uploadFields), complianceController.addComplianceData);
  router.patch('/compliance/edit/:id', upload.fields(uploadFields), complianceController.editCompliance);
  router.get('/compliance/:companyId', complianceController.getComplianceById);
  router.get('/compliance/financial-years', complianceController.getFinancialYearOptions);
*/
