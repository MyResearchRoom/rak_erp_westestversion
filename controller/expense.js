const { Company, Expenses,User, ExpenseCategories, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');
const generateExpenseNumber = require('../utils/generateExpenseNumber');

exports.createExpense = async(req,res)=>{
    const transaction = await sequelize.transaction();
    try{
        const {categoryId,companyId,date,amount,description,paymentMethod,reference, notes,} =req.body
        const {id} = req.user; 

        const receipt = req.file ? req.file.buffer : null;
        const receiptContentType = req.file ? req.file.mimetype : null;

        const category = await ExpenseCategories.findByPk(categoryId, { transaction });

        if (!category) {
            await transaction.rollback();
            return errorResponse(res, "Expense category not found", 404);
        }

        const company = await Company.findByPk(companyId, { transaction });

        if (!company) {
            await transaction.rollback();
            return errorResponse(res, "Company not found", 404);
        }


        const expenseNumber = await generateExpenseNumber(transaction);


        const expense = await Expenses.create(
            {
                expenseNumber,
                categoryId,
                companyId,
                date,
                amount,
                description,
                paymentMethod,
                createdBy:id,
                reference: reference ? reference : null,
                notes: notes ? notes : null,
                receipt,
                receiptContentType
            },
            { transaction }
        );

        const parsedAmount = Number(amount);
        const companyBalance = Number(company.balence);
        const updatedBalance = companyBalance - parsedAmount;

        await company.update(
            { balence: updatedBalance }, 
            { transaction }    
        );

        const data = expense.toJSON();
        delete data.receipt;

        await transaction.commit();

        return successResponse(res, "Expense created successfully", data);

    }catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse(res, "Failed to create expense", 500);
    }

};

exports.getexpenseList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const { role, email,id: userId} = req.user; 
        const {categoryId,companyId,status,paymentMethod,fromDate,toDate}=req.query;
     

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
            return successResponse(res, "No Expense found", {
            expenses: [],
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
            { expenseNumber: { [Op.like]: `%${searchTerm}%` } },
            { status: { [Op.like]: `%${searchTerm}%` } },
            { "$company.name$": { [Op.like]: `%${searchTerm}%` } },
            ],
        });
        }

        if(categoryId){
            whereClause[Op.and].push({ categoryId:categoryId });
        }

        if(companyId){
            whereClause[Op.and].push({ companyId });
        }

        if(status){
            const validStatus = ["pending","approved","rejected"];
            if (!validStatus.includes(status)) {
                return errorResponse(res, "Invalid status passed", 400);
            }

            whereClause[Op.and].push({ status: status });
        }

        if(paymentMethod){
            const validPM = ["bank transfer","upi","cheque","cash","card"];
            if (!validPM.includes(paymentMethod)) {
                return errorResponse(res, "Invalid payment method passed", 400);
            }

            whereClause[Op.and].push({ paymentMethod: paymentMethod });
        }

        if (fromDate && toDate) {
            whereClause[Op.and].push({
                date: {[Op.between]: [fromDate, toDate],},
            });
        } else if (fromDate) {
            whereClause[Op.and].push({
                date: {[Op.gte]: fromDate,},
            });
        } else if (toDate) {
            whereClause[Op.and].push({
                date: {[Op.lte]: toDate,},
            });
        }

        const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};

        const { count, rows } = await Expenses.findAndCountAll({
            where: finalWhere,
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name"],
                    required: true,
                },
                {
                    model: ExpenseCategories,
                    as: "expenseCategory",
                    required: true,
                },
                
            ],
            distinct: true, 
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });

        const expenses = rows.map((expense) => {
            const data = expense.toJSON();

            if (data.receipt) {
                const base64 = data.receipt.toString("base64");

                data.receipt = `data:${data.receiptContentType};base64,${base64}`;
            } else {
                data.receipt = null;
            }

            return data;
        });

        successResponse(res, "Expenses fetched successfully", {
        expenses: expenses,
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

}

exports.deleteExpense =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Expense id is required", 400);
        }

        const expense = await Expenses.findByPk(id);

        if (!expense) {
            return errorResponse(res, "Expense not found", 404);
        }

        await expense.destroy();

        return successResponse(res, "Expense deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete Expense", 500);
    }
};

exports.getExpenseById =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Expense id is required", 400);
        }

        const expense = await Expenses.findOne({
            where: {id:id},
            include: [
                {
                    model: Company,
                    as: "company", 
                },
                {
                    model:ExpenseCategories,
                    as:"expenseCategory",
                },
                {
                    model: User,
                    as:"createdByUser",
                    attributes: ["id", "name","role"],
                }
            ],
        });

        if (!expense) {
            return errorResponse(res, "Expense not found", 404);
        }

        const data=expense.toJSON();

        if(data.receipt){
            const base64 = data.receipt.toString("base64");
            data.receipt = `data:${data.receiptContentType};base64,${base64}`;
        } else {
            data.receipt = null;
        }

        if (data.company && data.company.logo && data.company.logoContentType) {
            const base64Image = data.company.logo.toString("base64");
            data.company.logo = `data:${data.company.logoContentType};base64,${base64Image}`;
        } else {
            data.company.logo=null
        }


        return successResponse(res, "Expense data fetched successfully",data);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch Expense", 500);
    }
};

exports.changeStatusOfExpene = async(req,res)=>{
    try{
        const {id}=req.params;
        const {status}=req.body;

        if(!id){
            return errorResponse(res, "Expense id is required", 400);
        }

        if(!status){
            return errorResponse(res, "Status is required", 400);
        }

        if (!["approved", "rejected"].includes(status)) {
        return errorResponse(
            res,
            "Expense status must be either 'approved' or 'rejected'",
            400
        );
        }

        const expense = await Expenses.findByPk(id);

        if (!expense) {
            return errorResponse(res, "Expense not found", 404);
        }

        if (expense.status !== "pending") {
            return errorResponse(res, `Expense already processed (${expense.status})`, 400);
        }

        if (expense.status === status) {
            return errorResponse(
                res,
                `Expense status is already ${status}`,
                400
            );
        }

        expense.status=status;
        await expense.save();

        return successResponse(
            res,
            `Expense ${status} successfully`
        );

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to approve or reject Expense", 500);
    }
}

