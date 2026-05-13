const { Company, ComplianceDocuments, CompanyDocuments,sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

const getComplianceStatus = (expiryDate) => {
  if (!expiryDate) return "Valid";

  const today = new Date();
  const expDate = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 15) return "Expiring Soon";
  return "Valid";

};

exports.addComplianceData = async (req,res)=>{
    const transaction = await sequelize.transaction();
    try {
        const {
            companyId,docName,docNumber,financialYear,issueAuthority,issueDate,expiryDate,note,
        }= req.body;

        const doc = req.file ? req.file.buffer : null;
        const docContentType = req.file ? req.file.mimetype : null;

        const company = await Company.findByPk(companyId, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        const compliance = await ComplianceDocuments.create(
            {
                companyId,
                docName,
                docNumber: docNumber || null ,
                financialYear: financialYear || null,
                issueAuthority :issueAuthority || null,
                issueDate,
                expiryDate : expiryDate || null,
                note: note || null,
                doc,
                docContentType,
            },
            { transaction }
        )

        if (!compliance) {
            await transaction.rollback();
            return errorResponse(res, "Compilance not created", 400);
        }

        const data = compliance.toJSON();
        delete data.doc;

        await transaction.commit();

        return successResponse(res, "Compliance created successfully", data);

    }catch (error) {
        console.log(error);
        await transaction.rollback();
        return errorResponse(res, "Failed to add compliance data", 500);
    }
};

//search rem    
exports.getComplianceList = async (req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const { companyId} = req.query;
        const { role,email, id:userId} = req.user; 

        const whereClause = {
            [Op.and]: [],
        };

        if (role === "COMPANY") {
            const company = await Company.findOne({ where: { email } });

            if (!company) {
                return errorResponse(res, "Company not found", 404);
            }

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
                pagination: {
                    totalRecords: 0,
                    totalPages: 0,
                    currentPage: page,
                    itemsPerPage: limit,
                },
                });
            }

            const companyIds = companies.map(c => c.id);

            whereClause[Op.and].push({
                id: { [Op.in]: companyIds },
            });
        }

        if (companyId) {
            whereClause[Op.and].push({ id: companyId });
        }

        const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

        const { count, rows } = await Company.findAndCountAll({
            where: finalWhere,
            include: [
                {
                    model: ComplianceDocuments,
                    as: "complianceDocuments",
                    required: true,
                },
            ],
            distinct: true, 
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const compliance = rows.map((compliance) => {
            const data = compliance.toJSON();

            if (data.logo) {
                const base64 = data.logo.toString("base64");

                data.logo = `data:${data.logoContentType};base64,${base64}`;
            } else {
                data.logo = null;
            }

            let statusCount = {
                valid: 0,
                expiringSoon: 0,
                expired: 0,
            };


            data.complianceDocuments = data.complianceDocuments.map((doc) => {
                let formattedDoc = { ...doc };

                if (doc.doc && doc.docContentType) {
                    formattedDoc.doc = `data:${doc.docContentType};base64,${doc.doc.toString("base64")}`;
                } else {
                    formattedDoc.doc = null;
                }

                const status = getComplianceStatus(doc.expiryDate);
                formattedDoc.status = status;
                if (status === "Valid") statusCount.valid++;
                else if (status === "Expiring Soon") statusCount.expiringSoon++;
                else if (status === "Expired") statusCount.expired++;

                return formattedDoc;
            });

            data.statusSummary = statusCount;

            return data;
        });

        successResponse(res, "Compliance document fetched successfully", {
        compliance: compliance,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch expenses", 500);
    }

};

exports.deleteCompliance =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "compliance id is required", 400);
        }

        const compliance = await ComplianceDocuments.findByPk(id);

        if (!compliance) {
            return errorResponse(res, "Compliance not found", 404);
        }

        await compliance.destroy();

        return successResponse(res, "Compliance deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete compliance", 500);
    }
};

exports.getComplianceById =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Compliance id is required", 400);
        }

        const compliance = await ComplianceDocuments.findOne({
            where: {id:id},
            include: [
                {
                    model: Company,
                    as: "CompanyData",
                    attributes:["id","name"],
                    required:true, 
                },               
            ],
        });

        if (!compliance) {
            return errorResponse(res, "Compliance not found", 404);
        }

        const data=compliance.toJSON();

        if(data.doc){
            const base64 = data.doc.toString("base64");
            data.doc = `data:${data.docContentType};base64,${base64}`;
        } else {
            data.doc = null;
        }

        return successResponse(res, "Compliance data fetched successfully",data);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch compliance", 500);
    }
};

exports.editCompliance = async (req,res)=>{
    const transaction = await sequelize.transaction();
    try {
        const {id}=req.params;
        const {
            companyId,docName,docNumber,financialYear,issueAuthority,issueDate,expiryDate,note,
        }= req.body;

        if(!id){
            await transaction.rollback();
            return errorResponse(res, "Compliance id is required", 400);
        }

        const compliance = await ComplianceDocuments.findByPk(id, { transaction });

        if (!compliance) {
            await transaction.rollback();
            return errorResponse(res, "Compliance not found", 404);
        }

        const doc = req.file ? req.file.buffer : null;
        const docContentType = req.file ? req.file.mimetype : null;

        const company = await Company.findByPk(companyId, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        const allowedFields = [
            "companyId",
            "docName",
            "docNumber",
            "financialYear",
            "issueAuthority",
            "issueDate",
            "expiryDate",
            "note",
        ];

        let updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined &&
                req.body[field] !== "") {
            updateData[field] = req.body[field];
        }
        });

        if (req.file) {
            updateData.doc = doc;
            updateData.docContentType = docContentType;
        }

        const companyDoc = await CompanyDocuments.findOne({
            where:{
                companyId,
                docName: compliance.docName
            },
            transaction
        })

        await compliance.update(updateData, { transaction });

        if(companyDoc && req.file){
           await companyDoc.update(
            {
                doc:doc,
                docContentType:docContentType,
            },
            {transaction}
           ) 
        }

        const data = compliance.toJSON();
        delete data.doc;

        await transaction.commit();

        return successResponse(res, "Compliance updated successfully", data);

    }catch (error) {
        console.log(error);
        await transaction.rollback();
        return errorResponse(res, "Failed to edit compliance data", 500);
    }
};
