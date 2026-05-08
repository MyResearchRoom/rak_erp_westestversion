const { Company,Receipts, Invoices, InvoiceCustomerDetails, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const generateReceiptNumber = require('../utils/generateReceiptNumber');

exports.createReceipt = async(req,res)=>{
    const transaction = await sequelize.transaction();
    try{
        const { companyId,invoiceId,amount,paymentDate,paymentMethod,transactionReference }=req.body;

        if(!companyId){
            await transaction.rollback();
            return errorResponse(res, "Company id is required to generate receipt", 400);
        }

        const company = await Company.findByPk(companyId,{transaction});

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        if(!invoiceId){
            return errorResponse(res, "Invoice id is required to generate receipt", 400);
        }

        const invoice= await  Invoices.findOne({
            where:{
                id:invoiceId,
                companyId:companyId,
            },
            transaction,
        })

        if (!invoice) {
            await transaction.rollback();
            return errorResponse(res, "Invoice not found for this company", 404);
        }

        const remaining = Number(invoice.totalRemaining);
        const paid=Number(invoice.totalPaid);
        const payAmount = Number(amount);

        if (remaining === 0) {
            await transaction.rollback();
            return errorResponse(res, "Invoice already fully paid", 400);
        }

        if (payAmount > remaining) {
            await transaction.rollback();
            return errorResponse(
                res,
                `Amount exceeds remaining balance (${remaining})`,
                400
            );
        }
        
        const receiptNumber= await generateReceiptNumber(transaction);

        const receipt = await Receipts.create(
            {
                receiptNumber,
                companyId,
                invoiceId,
                amount:payAmount,
                paymentDate,
                paymentMethod,
                transactionReference,
            },
            { transaction }
        );

        if(!receipt){
            await transaction.rollback();
            return errorResponse(res, "Receipt not created successfully..", 404);
        }

        const newPaid = paid + payAmount;
        const newRemaining = remaining - payAmount;

        await invoice.update(
        {
            totalPaid: newPaid,
            totalRemaining: newRemaining,
            status:
            newRemaining === 0
                ? "paid"
                : newPaid > 0
                ? "partially paid"
                : "pending",
        },
        { transaction }
        );

        const parsedAmount = Number(amount);
        const companyBalance = Number(company.balence);
        const updatedBalance = companyBalance + parsedAmount;

        await company.update(
            { balence: updatedBalance }, 
            { transaction }    
        );

        await transaction.commit();

        return successResponse(res, "Receipt created successfully", receipt);

    }catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse(res, "Failed to create receipt", 500);
    }

};

exports.getReceiptsList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const { role, email,id: userId} = req.user; 
        const {paymentMethod,companyId,date}=req.query;

        const whereClause = {
            [Op.and]: [],
        };

        if (role === "COMPANY") {
            const company = await Company.findOne({ where: { email } });

            if (!company) {
                return errorResponse(res, "Company not found", 404);
            }

            whereClause[Op.and].push({ companyId: company.id });
        }

        if (role === "EMPLOYEE") {
            const companies = await Company.findAll({
                where: { assignEmployee: userId },
                attributes: ["id"],
            });

            if (!companies.length) {
                return successResponse(res, "No receipts found", {
                invoices: [],
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
        }

        if(companyId){
            whereClause[Op.and].push({ companyId });
        }

        if(paymentMethod){
            const validPaymentMethods = ["bank transfer","upi","cheque","cash","card"];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return errorResponse(res, "Invalid payment method passed", 400);
            }
            whereClause[Op.and].push({ paymentMethod: paymentMethod });
        }

        if(date){
            whereClause[Op.and].push({ paymentDate: date });
        }

        if (searchTerm) {
            whereClause[Op.and].push({
                [Op.or]: [
                { receiptNumber: { [Op.like]: `%${searchTerm}%` } },
                { paymentMethod: { [Op.like]: `%${searchTerm}%` } },
                { "$company.name$": { [Op.like]: `%${searchTerm}%` } },
                { "$invoice.invoiceNumber$": { [Op.like]: `%${searchTerm}%` } },
                ],
            });
        }

        const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

        const { count, rows } = await Receipts.findAndCountAll({
            where: finalWhere,
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name"],
                    required: true,
                },
                {
                    model: Invoices,
                    as: "invoice",
                    attributes: ["id", "invoiceNumber"],
                    required: true,
                    include:[
                        {
                            model: InvoiceCustomerDetails,
                            as: "customer",
                            required: true,
                        },
                    ]
                }
            ],
            distinct: true, 
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        successResponse(res, "Receipts fetched successfully", {
        receipts: rows,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch receipts", 500);
    }

}

exports.getReceiptById = async(req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Receipt id is required to get invoice details", 400);
        }

        const receipt = await Receipts.findOne({
            where: {id:id},
            include: [
                {
                    model: Company,
                    as: "company", 
                    required: true,
                },
                {
                    model: Invoices,
                    as: "invoice", 
                    required: true,
                    include:[
                        {
                            model: InvoiceCustomerDetails,
                            as: "customer",
                            required: true,
                        },
                    ]
                },
            ],
        })

        if(!receipt){
            return errorResponse(res, "Receipt not found", 404);
        }

        let receiptData = receipt.toJSON();

        if (receiptData.company && receiptData.company.logo && receiptData.company.logoContentType) {
            const base64Image = receiptData.company.logo.toString("base64");
            receiptData.company.logo = `data:${receiptData.company.logoContentType};base64,${base64Image}`;
        } else {
            receiptData.company.logo=null
        }


        return successResponse(res, "Receipt fetched successfully", receiptData);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch receipt", 500);
    }
}

exports.deleteReceipts =async (req,res) => {
    const transaction = await sequelize.transaction();
    try{
        const {id}=req.params;

        if(!id){
            await transaction.rollback();
            return errorResponse(res, "receipt id is required to delete", 400);
        }

        const receipt = await Receipts.findByPk(id, { transaction });

        if (!receipt) {
            await transaction.rollback();
            return errorResponse(res, "receipt not found to delete", 404);
        }

        const invoice = await Invoices.findByPk(receipt.invoiceId, {
            transaction,
        });

        if (!invoice) {
            await transaction.rollback();
            return errorResponse(res, "Invoice not found", 404);
        }


        const amount=Number(receipt.amount);

        const currentPaid = Number(invoice.totalPaid);
        const currentRemaining = Number(invoice.totalRemaining);

        const newPaid = currentPaid - amount;
        const newRemaining = currentRemaining + amount;

        await invoice.update(
            {
                totalPaid: newPaid,
                totalRemaining: newRemaining,
                status:
                newPaid === 0
                    ? "pending"
                    : newRemaining === 0
                    ? "paid"
                    : "partially paid",
            },
            { transaction }
        );

        await receipt.destroy({ transaction });

        await transaction.commit();

        return successResponse(res, "Receipt deleted successfully");

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse(res, "Failed to delete receipt", 500);
    }
};

