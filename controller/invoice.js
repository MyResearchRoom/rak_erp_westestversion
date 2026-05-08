const { Company,InvoiceItems, Invoices,Materials, InvoiceCustomerDetails, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');


exports.createInvoice = async(req,res)=>{
    const transaction = await sequelize.transaction();
    try{
        const {companyId,invoiceDate,items,customerDetails } =req.body

        if(!companyId){
            await transaction.rollback();
            return errorResponse(res, "Company id is required to create invoice", 400);
        }

        if (!items || !items.length) {
            await transaction.rollback();
            return errorResponse(res, "Invoice items are required", 400);
        }

        if (!customerDetails) {
            await transaction.rollback();
            return errorResponse(res, "Customer details are required", 400);
        }

        const {
            name,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            pan,
            gstin
        } = customerDetails;

        const company = await Company.findByPk(companyId, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }

        const invoiceNumber = await generateInvoiceNumber(transaction);

        let subTotal = 0;
        let totalGST = 0;
        let totalAmount = 0;
        let totalCGSTPercent=0;
        let totalSGSTPercent=0;

        let invoiceItemsData = [];

        for (let item of items) {
            const quantity = Number(item.quantity);
            const rate = Number(item.rate);
            const gst = Number(item.gst);

            const itemSubTotal = quantity * rate;
            const gstAmount = (itemSubTotal * gst) / 100;

            const cgst = gst / 2;
            const sgst = gst / 2;

            const itemTotal = itemSubTotal + gstAmount;

            subTotal += itemSubTotal;
            totalGST += gstAmount;
            totalAmount += itemTotal;
            totalCGSTPercent += cgst;
            totalSGSTPercent += sgst

            invoiceItemsData.push({
                materialId: item.materialId,
                quantity,
                rate,
                subTotal: itemSubTotal,
                cgstPercent:cgst,
                sgstPercent:sgst,
                totalGSTAmount: gstAmount,
                totalAmount: itemTotal,
            });
        }

        const invoiceDateObj = new Date(invoiceDate);
        const overDueDateObj = new Date(invoiceDateObj);
        overDueDateObj.setMonth(overDueDateObj.getMonth() + 1);

        const overDueDate = overDueDateObj.toISOString().split("T")[0];

        const invoice = await Invoices.create(
            {
                invoiceNumber,
                companyId,
                invoiceDate,
                overDueDate,
                subTotal,
                totalCGSTPercent,
                totalSGSTPercent,
                totalGSTAmount: totalGST,
                totalAmount,
                totalPaid: 0,
                totalRemaining: totalAmount,
            },
            { transaction }
        );

        invoiceItemsData = invoiceItemsData.map((item) => ({
            ...item,
            invoiceId: invoice.id,
        }));

        await InvoiceItems.bulkCreate(invoiceItemsData, { transaction });

        await InvoiceCustomerDetails.create(
        {
            invoiceId: invoice.id,  
            name,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            pan,
            gstin: gstin || null, 
        },
        { transaction }
        );

        await transaction.commit();

        return successResponse(res, "Invoice created successfully", 

    );

    }catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse(res, "Failed to create invoice", 500);
    }

};

exports.getInvoiceList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const { role, email,id: userId} = req.user; 
        const {date,companyId,status}=req.query;

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
            return successResponse(res, "No invoices found", {
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

        if (searchTerm) {
        whereClause[Op.and].push({
            [Op.or]: [
            { invoiceNumber: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
            { "$company.name$": { [Op.like]: `%${searchTerm}%` } },
            ],
        });
        }

        if(companyId){
            whereClause[Op.and].push({ companyId });
        }

        if(status){
            const validStatus = ["paid", "pending", "partially paid","overdue"];
            if (!validStatus.includes(status)) {
                return errorResponse(res, "Invalid status passed", 400);
            }

            whereClause[Op.and].push({ status: status });
        }

        if(date){
            whereClause[Op.and].push({ invoiceDate: date });
        }

        const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

        const { count, rows } = await Invoices.findAndCountAll({
            where: finalWhere,
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name"],
                    required: true,
                },
                {
                    model: InvoiceCustomerDetails,
                    as: "customer",
                    required: true,
                },
            ],
            distinct: true, 
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        successResponse(res, "Invoices fetched successfully", {
        invoices: rows,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch invoices", 500);
    }

}

exports.getInvoiceById = async(req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Invoice id is required to get invoice details", 400);
        }

        const invoice = await Invoices.findOne({
            where: {id:id},
            include: [
                {
                    model: Company,
                    as: "company", 
                },
                {
                    model: InvoiceItems,
                    as: "invoiceItems", 
                    include:[
                        {
                            model: Materials,
                            as:"material"
                        }
                    ]
                },
                {
                    model: InvoiceCustomerDetails,
                    as: "customer",
                    required: true,
                },
            ],
        })

        if(!invoice){
            return errorResponse(res, "Invoice not found", 404);
        }

        let invoiceData = invoice.toJSON();

        if (invoiceData.company &&invoiceData.company.logo &&invoiceData.company.logoContentType) {
            const base64Image = invoiceData.company.logo.toString("base64");
            invoiceData.company.logo = `data:${invoiceData.company.logoContentType};base64,${base64Image}`;
        } else {
            invoiceData.company.logo=null
        }

        return successResponse(res, "Invoice fetched successfully", invoiceData);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch invoice", 500);
    }
}

exports.getInvoiceByCompanyId = async(req,res) =>{
    try{
        const {companyId}=req.params;
        
        if(!companyId){
            return errorResponse(res, "Company id is required to get invoice company wise", 400);
        }

        const company = await Company.findByPk(companyId);

        if (!company) {
        return errorResponse(res, "Company not found", 404);
        }

        const invoice = await Invoices.findAll({
            where: {companyId:companyId},
            include: [
                {
                    model: Company,
                    as: "company", 
                },
            ],
            order: [["createdAt", "DESC"]],
        })

        const formattedInvoices = invoice.map((inv) => {
            const invoice = inv.toJSON();

            if (
                invoice.company &&
                invoice.company.logo &&
                invoice.company.logoContentType
            ) {
                const base64Image = invoice.company.logo.toString("base64");

                invoice.company.logo = `data:${invoice.company.logoContentType};base64,${base64Image}`;
            }

            // delete invoice.company.logo;
            delete invoice.company.logoContentType;

            return invoice;
        });

        return successResponse(res, "Invoice fetched successfully", formattedInvoices);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch invoice company wise", 500);
    }
}

exports.deleteInvoice =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Invoice id is required to delete invoice", 400);
        }

        const invoice = await Invoices.findByPk(id);

        if (!invoice) {
            return errorResponse(res, "Invoice not found to delete", 404);
        }

        await invoice.destroy();

        return successResponse(res, "Invoice deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete invoice", 500);
    }
};
