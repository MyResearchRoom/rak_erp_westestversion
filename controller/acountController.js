const { Company,Receipts, Invoices, InvoiceCustomerDetails, Expenses, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const { query } = require('express-validator');

exports.getAccountDetails = async(req,res)=>{
    try{
        const { page, limit ,searchTerm} = validateQueryParams({ ...req.query });
        const { role, email,id: userId} = req.user; 
        const {companyId,type,financialYear,date}=req.query;
        

        const whereClause = {
            [Op.and]: [],
        };

        const companyWhere = {
            [Op.and]: [],
        };

        if (role === "COMPANY") {
            const company = await Company.findOne({ where: { email } });

            if (!company) {
                return errorResponse(res, "Company not found", 404);
            }

            whereClause[Op.and].push({ companyId: company.id });
            companyWhere[Op.and].push({ id: company.id });
        }

        if (role === "EMPLOYEE") {
            const companies = await Company.findAll({
                where: { assignEmployee: userId },
                attributes: ["id"],
            });

            if (!companies.length) {
                return successResponse(res, "No Account data found", {
                account: [],
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
                companyId: { [Op.in]: companyIds },
            });

            companyWhere[Op.and].push({
                id: { [Op.in]: companyIds },
            });
        }

        if(companyId){
            whereClause[Op.and].push({ companyId });
            companyWhere[Op.and].push({ id: companyId });
        }

        const expenseWhere = { [Op.and]: [...whereClause[Op.and]] };
        const receiptWhere = { [Op.and]: [...whereClause[Op.and]] };

        if (searchTerm) {
        expenseWhere[Op.and].push({
            [Op.or]: [
            { expenseNumber: { [Op.like]: `%${searchTerm}%` }},
            { "$company.name$": { [Op.like]: `%${searchTerm}%` } },
            ],
        });
        }

        if (searchTerm) {
        receiptWhere[Op.and].push({
            [Op.or]: [
            { receiptNumber: { [Op.like]: `%${searchTerm}%` }},
            { "$company.name$": { [Op.like]: `%${searchTerm}%` } },
            ],
        });
        }

        if (date) {
            receiptWhere[Op.and].push({
                paymentDate: date,
            });
            expenseWhere[Op.and].push({
                date: date,
            });
        }

        if (financialYear) {
            receiptWhere[Op.and].push({
                financialYear: financialYear,
            });
            expenseWhere[Op.and].push({
                financialYear: financialYear,
            });
        }

        let expenseData = [];
        let receiptData = [];

        if (!type || type === "expense") {
            const expenses = await Expenses.findAll({
                where: expenseWhere,
                include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name","logo","logoContentType","status","connectedDate","gstin","gstin","pan","companyType","balence"],
                    required: true
                },
                ],
            });

            expenseData = expenses.map((item) => ({
                id:item.id,
                date: item.date,
                transactionId: item.expenseNumber,
                company: item.company?.name,
                description: item.description,
                debit: Number(item.amount),
                credit: 0,
                balance: item.company?.balence,
                reference: item.reference || "-",
                type: "expense", 
                name: item.company?.name,
                logo:  item.company?.logo ?
                    `data:${item.company.logoContentType};base64,${item.company.logo.toString("base64")}`
                    : null,
                
                status:  item.company?.status,
                connectedDate:  item.company?.connectedDate,
                gstin:  item.company?.gstin,
                pan:  item.company?.pan,
                companyType:  item.company?.companyType,
            }));
        }

        if (!type || type === "receipt") {
            const receipts = await Receipts.findAll({
                where: receiptWhere,
                include: [
                    {
                        model: Company,
                        as: "company",
                        attributes: ["id", "name","logo","logoContentType","status","connectedDate","gstin","gstin","pan","companyType","balence"],
                        required: true,
                    },
                    {
                        model: Invoices,
                        as: "invoice",
                        attributes: ["id", "invoiceNumber"],
                        required: true,
                    }
                ],
            });

            receiptData = receipts.map((item) => ({
                id:item.id,
                date: item.paymentDate,
                transactionId: item.receiptNumber,
                company: item.company?.name,
                description: `Payment received against Invoice ${item?.invoice?.invoiceNumber}`,
                debit: 0,
                credit: Number(item.amount),
                balance: item.company?.balence,
                reference: item.reference || "-",
                type: "receipt", 
                name: item.company?.name,
                logo:  item.company?.logo ?
                    `data:${item.company.logoContentType};base64,${item.company.logo.toString("base64")}`
                    : null,
                status:  item.company?.status,
                connectedDate:  item.company?.connectedDate,
                gstin:  item.company?.gstin,
                pan:  item.company?.pan,
                companyType:  item.company?.companyType,
            }));
        }

        let combined = [...expenseData, ...receiptData];

        combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalRecords = combined.length;

        let paginatedData = [];
        let totalPages = 1;

        if (!limit) {
            paginatedData = combined;
            totalPages = 1;
        } else {
            const offset = (page - 1) * limit;
            totalPages = Math.ceil(totalRecords / limit);
            paginatedData = combined.slice(offset, offset + Number(limit));
        }

        const totalDebit = combined.reduce((sum, item) => {
            return sum + Number(item.debit || 0);
        }, 0);

        const totalCredit = combined.reduce((sum, item) => {
            return sum + Number(item.credit || 0);
        }, 0);

        const totalBalance = await Company.sum("balence", {
            where: companyWhere,
        });

        // console.log("paginatedData",paginatedData);

        return successResponse(res, "Account details fetched", {
        account: paginatedData,
        totals: {
            totalDebit,
            totalCredit,
            totalBalance,
        },
        pagination: {
            totalRecords,
            totalPages,
            currentPage: Number(page),
            itemsPerPage: Number(limit),
        },
        });


    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to get account details receipt", 500);
    }
}