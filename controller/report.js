const { Company,User,Receipts,Invoices,Materials,BoardOfDirectors,FarmerMembers,Expenses,ExpenseCategories,ComplianceDocuments, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const { query } = require('express-validator');

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

exports.getReportDetails = async(req,res)=>{
    try{
        const { page, limit,offset } = validateQueryParams({ ...req.query });
        const { role, email,id: userId} = req.user; 
        const {companyId}=req.query;

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
                return successResponse(res, "No report data found", {
                report: [],
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

        if(companyId){
            whereClause[Op.and].push({ id:companyId });
        }

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

        const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

        const { count, rows } = await Company.findAndCountAll({
            where: finalWhere,
            attributes: ["id", "name", "gstin", "companyType", "pan", "logo", "logoContentType"],
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const report = await Promise.all(
            rows.map(async (company) => {
                const companyId = company.id;

                const complianceDocuments = await ComplianceDocuments.findAll({where: { companyId }});

                let validDoc = 0;
                let expiringSoonDoc = 0;
                let expiredDoc = 0;

                complianceDocuments.forEach((doc) => {
                    const status = getComplianceStatus(doc.expiryDate);

                    if (status === "Valid") validDoc++;
                    else if (status === "Expiring Soon") expiringSoonDoc++;
                    else if (status === "Expired") expiredDoc++;
                });
                
                const [
                    farmerCount,
                    directorCount,
                    invoiceCount,
                    receiptCount,
                    expenseCount,
                    complianceCount,
                    invoiceAmount,
                    totalAmountCredited,
                    totalAmountDebited,
                    totalPaidInvoices,
                    totalPartiallyPaidInvoices,
                    totalPendingInvoices,
                    totalOverdueInvoices,
                    totalPendingExpenses,
                    totalApprovedExpenses,
                    totalRejectedExpenses,
                    
                ] = await Promise.all([
                    FarmerMembers.count({ where: { companyId } }),
                    BoardOfDirectors.count({ where: { companyId } }),
                    Invoices.count({ where: { companyId } }),
                    Receipts.count({ where: { companyId } }),
                    Expenses.count({ where: { companyId } }),
                    ComplianceDocuments.count({ where: { companyId } }),
                    Invoices.sum("totalAmount",{ where: { companyId } }) ,
                    Receipts.sum("amount",{ where: { companyId } }),
                    Expenses.sum("amount",{ where: { companyId } }),
                    Invoices.count({ where: { companyId, status: "paid" } }),
                    Invoices.count({ where: { companyId, status: "partially paid" } }),
                    Invoices.count({ where: { companyId, status: "pending" } }),
                    Invoices.count({ where: { companyId, status: "overdue" } }),
                    Expenses.count({ where: { companyId, status: "pending" } }),
                    Expenses.count({ where: { companyId, status: "approved" } }),
                    Expenses.count({ where: { companyId, status: "rejected" } }),
                    
                ]);

                const data = company.toJSON();
                if (data.logo) {
                    const base64 = data.logo.toString("base64");
                    data.logo = `data:${data.logoContentType};base64,${base64}`;
                } else {
                    data.logo = null;
                }

                return {
                    id:companyId,
                    companyName: company.name,
                    gstin:company.gstin,
                    companyType:company.companyType,
                    pan:company.pan,
                    logo: data.logo,

                    farmerCount,
                    directorCount,
                    invoiceCount,
                    receiptCount,
                    expenseCount,
                    complianceCount,
                    invoiceAmount : invoiceAmount || 0,
                    totalAmountCredited : totalAmountCredited || 0,
                    totalAmountDebited : totalAmountDebited || 0,
                    totalPaidInvoices,
                    totalPartiallyPaidInvoices,
                    totalPendingInvoices,
                    totalOverdueInvoices,
                    totalPendingExpenses,
                    totalApprovedExpenses,
                    totalRejectedExpenses,

                    totalValidDoc : validDoc || 0,
                    totalExpiringSoonDoc : expiringSoonDoc || 0,
                    totalExpiredDoc : expiredDoc || 0,

                    
                };
            })
        );

        successResponse(res, "Report fetched successfully", {
            report,
            pagination: {
                totalRecords: count,
                totalPages: limit ? Math.ceil(count / limit) : 1,
                currentPage: page,
                itemsPerPage: limit,
            },
        });



    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to get report details", 500);
    }
}