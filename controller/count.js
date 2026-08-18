const { Op, where } = require('sequelize');
const { Company,CompanyDetails,User,Receipts, Invoices,Materials,BoardOfDirectors,FarmerMembers,Expenses, ExpenseCategories,ComplianceDocuments, OtherComplianceDocuments, sequelize} = require('../models');
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
  if (diffDays <= 5) return "Expiring Soon";
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


    const totalCompanies = await Company.count({
        where: { ...companyWhere }
    });


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
    const totalExpensesCategory = await ExpenseCategories.count({where: whereCondition});
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

    const complianceOtherDocuments = await OtherComplianceDocuments.findAll({
            attributes: ["dueDate"],
            where: whereCondition,
            raw: true,
        });

        complianceOtherDocuments.forEach((doc) => {
            const status = getComplianceStatus(doc.dueDate);

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

exports.getAdminDashBoardCount = async(req,res)=>{
    try{
        const { role, email,id: userId} = req.user;  

        const { year } = req.query;

        const selectedYear = year ? year : new Date().getFullYear();

        const selectedFinancialYear = `${selectedYear}-${Number(selectedYear) + 1}`;

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

        const startDate = new Date(`${selectedYear}-01-01`);
        const endDate = new Date(`${Number(selectedYear) + 1}-01-01`);

        const totalPrivateLtdCompanies = await Company.count({
            where: { ...companyWhere,companyType: "private_ltd"}
        });

        const totalPublicLtdCompanies = await Company.count({
            where: { ...companyWhere,companyType: "public_ltd"}
        });

        const totalLLPCompanies = await Company.count({
            where: { ...companyWhere,companyType: "llp"}
        });

        const totalOPCCompanies = await Company.count({
            where: { ...companyWhere,companyType: "opc"}
        });

        const totalPartnershipCompanies = await Company.count({
            where: { ...companyWhere,companyType: "partnership"}
        });

        const totalProprietorshipCompanies = await Company.count({
            where: { ...companyWhere,companyType: "proprietorship"}
        });

        const totalProducerCompanyCompanies = await Company.count({
            where: { ...companyWhere,companyType: "producer_company"}
        });

        const totalSection8pCompanies = await Company.count({
            where: { ...companyWhere,companyType: "section8"}
        });

        const totalTrustCompanies = await Company.count({
            where: { ...companyWhere,companyType: "trust"}
        });

        const totalSocietyCompanies = await Company.count({
            where: { ...companyWhere,companyType: "society"}
        });

        const totalCooperativeCompanies = await Company.count({
            where: { ...companyWhere,companyType: "cooperative"}
        });

        const totalGovernmentCompanies = await Company.count({
            where: { ...companyWhere,companyType: "government"}
        });

        const totalProducerOrganisationCompanies = await Company.count({
            where: { ...companyWhere,companyType: "producer_organisation"}
        });

        const totalOtherCompanies = await Company.count({
            where: { ...companyWhere,companyType: "other"}
        });

        const totalFarmerMembers = await FarmerMembers.count({ where: whereCondition });

        const totalFemaleFarmerMembers = await FarmerMembers.count({ 
            where: { ...whereCondition, gender:"female"}
        });

        const totalBoardOfDirectors = await BoardOfDirectors.count({ where: whereCondition });
        const totalFemaleBoardOfDirectors = await BoardOfDirectors.count({ 
            where: { ...whereCondition, gender:"female"}
        });

        const totalLandholdingAcres =
        (await CompanyDetails.sum("totalLandholdingAcres", {
            where: whereCondition,
        })) || 0;

        const totalPrivateLtdCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                companyType: "private_ltd",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalPublicLtdCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "public_ltd",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalOPCCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "opc",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalPartnershipCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "partnership",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalProprietorshipCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "proprietorship",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalProducerCompanyCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "producer_company",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalSection8CompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "section8",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalTrustCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "trust",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalSocietyCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "society",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalCooperativeCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "cooperative",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalGovernmentCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "government",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalProducerOrganisationCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "producer_organisation",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalOtherCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "other",
                },
                required: true,
            },
            ],
        })) || 0;

        const totalLLPCompanyRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
            include: [
            {
                model: Company,
                as: "company",
                attributes: [],
                where: {
                    companyType: "llp",
                },
                required: true,
            },
            ],
        })) || 0;

        const complianceDocuments = await ComplianceDocuments.findAll({
            attributes: ["dueDate"],
            where: {
                ...whereCondition,
                financialYear: selectedFinancialYear,
            },
            raw: true,
        });

        let validComplianceDoc = 0;
        let expiringSoonComplianceDoc = 0;
        let expiredComplianceDoc = 0;

        complianceDocuments.forEach((doc) => {
            const status = getComplianceStatus(doc.dueDate);

            if (status === "Valid") validComplianceDoc++;
            else if (status === "Expiring Soon") expiringSoonComplianceDoc++;
            else if (status === "Expired") expiredComplianceDoc++;
        });

        const complianceOtherDocuments = await OtherComplianceDocuments.findAll({
            attributes: ["dueDate"],
            where: {
                ...whereCondition,
                financialYear: selectedFinancialYear,
            },
            raw: true,
        });

        complianceOtherDocuments.forEach((doc) => {
            const status = getComplianceStatus(doc.dueDate);

            if (status === "Valid") validComplianceDoc++;
            else if (status === "Expiring Soon") expiringSoonComplianceDoc++;
            else if (status === "Expired") expiredComplianceDoc++;
        });

        successResponse(res, "Data retrieved successfully", {
            counts: {
                totalPrivateLtdCompanies,
                totalPublicLtdCompanies,
                totalLLPCompanies,
                totalOPCCompanies,
                totalPartnershipCompanies,
                totalProprietorshipCompanies,
                totalProducerCompanyCompanies,
                totalSection8pCompanies,
                totalTrustCompanies,
                totalSocietyCompanies,
                totalCooperativeCompanies,
                totalGovernmentCompanies,
                totalProducerOrganisationCompanies,
                totalOtherCompanies,

                totalLandholdingAcres,

    
                totalFarmerMembers,
                totalBoardOfDirectors,
                totalFemaleFarmerMembers,
                totalFemaleBoardOfDirectors,

                totalPrivateLtdCompanyRevenue,
                totalPublicLtdCompanyRevenue,
                totalOPCCompanyRevenue,
                totalPartnershipCompanyRevenue,
                totalProprietorshipCompanyRevenue,
                totalProducerCompanyCompanyRevenue,
                totalSection8CompanyRevenue,
                totalTrustCompanyRevenue,
                totalSocietyCompanyRevenue,
                totalCooperativeCompanyRevenue,
                totalGovernmentCompanyRevenue,
                totalProducerOrganisationCompanyRevenue,
                totalOtherCompanyRevenue,
                totalLLPCompanyRevenue,

                validComplianceDoc,
                expiredComplianceDoc,
                expiringSoonComplianceDoc,
            },
        });

    }catch (error) {
        console.log(error);
        
        errorResponse(res, "Failed to get admin dashboard counts", 500);
    }
};

exports.getCompanyDashBoardCount = async(req,res)=>{
try{
    const { role, email,id: userId} = req.user;  

    const { year } = req.query;

    const selectedYear = year ? year : new Date().getFullYear();

    const selectedFinancialYear = `${selectedYear}-${Number(selectedYear) + 1}`;

    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${Number(selectedYear) + 1}-01-01`);

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

    const totalFarmerMembers = await FarmerMembers.count({ where: whereCondition });

    const totalFemaleFarmerMembers = await FarmerMembers.count({ 
        where: { ...whereCondition, gender:"female"}
    });

    const totalBoardOfDirectors = await BoardOfDirectors.count({ where: whereCondition });

    const totalFemaleBoardOfDirectors = await BoardOfDirectors.count({ 
        where: { ...whereCondition, gender:"female"}
    });

    const totalLandholdingAcres =
    (await CompanyDetails.sum("totalLandholdingAcres", {
        where: whereCondition,
    })) || 0;

    const totalInvoices = await Invoices.count({ where: whereCondition });

    const totalReceipt = await Receipts.count({ where: whereCondition });

    const CompanyDetailsFarmers = await CompanyDetails.findOne({
        where: whereCondition,
    });

    const totalSmallFarmers = CompanyDetailsFarmers?.smallFarmers || 0;
    const totalMarginalFarmers = CompanyDetailsFarmers?.marginalFarmers || 0;
    const totalAuthorizedShareCapital =
    CompanyDetailsFarmers?.authorizedShareCapital || 0;
    const totalPaidUpCapital =
    CompanyDetailsFarmers?.totalPaidUpCapital || 0;

    const totalRevenue =
        (await Invoices.sum("totalAmount", {
            where: {
            ...whereCondition,
            invoiceDate: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
            },
    })) || 0;

    const complianceDocuments = await ComplianceDocuments.findAll({
            attributes: ["dueDate"],
            where: {
                ...whereCondition,
                financialYear: selectedFinancialYear,
            },
            raw: true,
        });

    let validComplianceDoc = 0;
    let expiringSoonComplianceDoc = 0;
    let expiredComplianceDoc = 0;
    let totalComplianceDocument = 0;

    complianceDocuments.forEach((doc) => {
            const status = getComplianceStatus(doc.dueDate);

            if (status === "Valid") validComplianceDoc++;
            else if (status === "Expiring Soon") expiringSoonComplianceDoc++;
            else if (status === "Expired") expiredComplianceDoc++;
    });

    const complianceOtherDocuments = await OtherComplianceDocuments.findAll({
            attributes: ["dueDate"],
            where: {
                ...whereCondition,
                financialYear: selectedFinancialYear,
            },
            raw: true,
    });

    complianceOtherDocuments.forEach((doc) => {
            const status = getComplianceStatus(doc.dueDate);

            if (status === "Valid") validComplianceDoc++;
            else if (status === "Expiring Soon") expiringSoonComplianceDoc++;
            else if (status === "Expired") expiredComplianceDoc++;
    });

    totalComplianceDocument = complianceDocuments.length + complianceOtherDocuments.length;
    successResponse(res, "Data retrieved successfully", {
        counts: {
            totalFarmerMembers,
            totalFemaleFarmerMembers,
            totalBoardOfDirectors,
            totalFemaleBoardOfDirectors,
            totalLandholdingAcres,
            totalInvoices,
            totalReceipt,
            totalSmallFarmers,
            totalMarginalFarmers,

            validComplianceDoc,
            expiredComplianceDoc,
            expiringSoonComplianceDoc,
            totalComplianceDocument,

            totalRevenue,
            totalAuthorizedShareCapital,
            totalPaidUpCapital,
        },
    });

}catch (error) {
    console.log(error);
        
    errorResponse(res, "Failed to get company dashboard counts", 500);
}
};

