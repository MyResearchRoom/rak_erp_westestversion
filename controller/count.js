const { Op } = require('sequelize');
const { Company,User,Receipts, Invoices,Materials,BoardOfDirectors,FarmerMembers,Expenses, ExpenseCategories,ComplianceDocuments, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');

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

exports.getCount = async (req, res) => {
  try {
    const { role, email,id: userId} = req.user;  

    const whereCondition = {[Op.and]: [],};
    const companyWhere = {[Op.and]: [],};

    if (role === "COMPANY") {
        const company = await Company.findOne({ where: { email } });

        if (!company) {
            return errorResponse(res, "Company not found", 404);
        }

        whereCondition[Op.and].push({ companyId: company.id });
        companyWhere[Op.and].push({ id: company.id });
    }

    if (role === "EMPLOYEE") {
        const companies = await Company.findAll({
            where: { assignEmployee: userId },
            attributes: ["id"],
        });

        if (!companies.length) {
            return successResponse(res, "No count data found",);
        }

        const companyIds = companies.map(c => c.id);

        whereCondition[Op.and].push({
            companyId: { [Op.in]: companyIds },
        });

        companyWhere[Op.and].push({
            id: { [Op.in]: companyIds },
        });
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);


    const totalCompanies = await Company.count();

    const totalInvoices = await Invoices.count({ where: whereCondition });

    const totalFarmerMembers = await FarmerMembers.count({ where: whereCondition });

    const totalBoardOfDirectors = await BoardOfDirectors.count({ where: whereCondition });

    const totalPaidInvoices = await Invoices.count({
    where: { ...whereCondition, status: "paid" }
    });

    const totalPartiallyPaidInvoices = await Invoices.count({
    where: { ...whereCondition, status: "partially paid" }
    });

    const totalPendingInvoices = await Invoices.count({
    where: { ...whereCondition, status: "pending" }
    });

    const totalOverdueInvoices = await Invoices.count({
    where: { ...whereCondition, status: "overdue" }
    });

    const totalReceipt = await Receipts.count({ where: whereCondition });

    const totalPaidAmount = (await Receipts.sum("amount", { where: whereCondition })) || 0;

    const lastReceipt = await Receipts.findOne({
        where: whereCondition,
        order: [["paymentDate", "DESC"]],
        attributes: ["paymentDate"],
    });

    const lastReceiptPaymentDate = lastReceipt?.paymentDate || null;

    const totalExpenses = await Expenses.count({ where: whereCondition });
    const totalExpensesCategory = await ExpenseCategories.count();
    const totalPendingExpeses = await Expenses.count({
        where: { ...whereCondition, status: "pending" }
    });

    const totalExpensePerMonth = await Expenses.sum("amount", {
    where: {
        ...whereCondition,
        date: {
            [Op.gte]: startOfMonth,
            [Op.lt]: nextMonth,
        },
    },
    });

    //account 
    const totalAmountRecieved = (await Receipts.sum("amount",{where: whereCondition})) || 0;

    const totalBalance = await Company.sum("balence", {
        where: companyWhere,
    });

    const totalExpensePerMonthCount = await Expenses.count({
        where: {
            ...whereCondition,
            date: {
                [Op.gte]: startOfMonth,
                [Op.lt]: nextMonth,
            },
        },
        });
    
    const totalReceiptPerMonthCount = await Receipts.count({
        where: {
            ...whereCondition,
            paymentDate: {
                [Op.gte]: startOfMonth,
                [Op.lt]: nextMonth,
            },
        },
        });

    const totalTransactionPerMonth = (totalExpensePerMonthCount || 0) + (totalReceiptPerMonthCount || 0);

    //compliance
    const totalComplianceDocument = (await ComplianceDocuments.count({where: whereCondition})) || 0;

    const complianceDocuments = await ComplianceDocuments.findAll({
        where: whereCondition,
    });

    let validDoc = 0;
    let expiringSoonDoc = 0;
    let expiredDoc = 0;

    complianceDocuments.forEach((doc) => {
        const status = getComplianceStatus(doc.expiryDate);

        if (status === "Valid") validDoc++;
        else if (status === "Expiring Soon") expiringSoonDoc++;
        else if (status === "Expired") expiredDoc++;
    });

    successResponse(res, "Data retrieved successfully", {
        counts: {
            totalCompanies,
            totalInvoices,
            totalFarmerMembers,
            totalBoardOfDirectors,
            totalPaidInvoices,
            totalPartiallyPaidInvoices,
            totalPendingInvoices,
            totalOverdueInvoices,
            totalReceipt,
            totalPaidAmount,
            lastReceiptPaymentDate,

            totalExpenses,
            totalExpensesCategory,
            totalPendingExpeses,
            totalExpensePerMonth,

            totalAmountRecieved,
            totalBalance,
            totalTransactionPerMonth,

            totalComplianceDocument,
            validDoc,
            expiringSoonDoc,
            expiredDoc,
        },
    });
  } catch (error) {
    console.log(error);
    
    errorResponse(res, "Failed to get counts", 500);
  }
};