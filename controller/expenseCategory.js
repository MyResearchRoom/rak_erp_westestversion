const { Company, Expenses, ExpenseCategories, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

exports.addCategory = async(req,res)=>{
try{
    
    const {name,description}=req.body;

    if(!name){
        return errorResponse(res, "Expense category name is reequired", 400);
    }

    const existingCategory = await ExpenseCategories.findOne({
      where: {
        name: {
          [Op.like]: name.toLowerCase()
        },
      },
    });

    if (existingCategory) {
        return errorResponse(res, "Category with this name already exists", 400);
    }
    
    const category = await ExpenseCategories.create(
        {
            name,
            description
        },
    );

    if (!category) {
        return errorResponse(res, "Category not added successfully", 400);
    }
    
    return successResponse(res, "Category added successfully", category);

}catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to add category", 500);
}
};

exports.getCategoriesList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });

        let whereClause = {};

        if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
        ];
        }

        const {count,rows} =await  ExpenseCategories.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        })

        successResponse(res, "Categories fetched successfully", {
        categories: rows,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch categories", 500);
    }

}

exports.getCategoryById = async (req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Catgeory id is required", 400);
        }

        const catgeory = await ExpenseCategories.findByPk(id);

        if(!catgeory){
            return errorResponse(res, "Catgeory not found", 404);
        }

        return successResponse(res, "Catgeory data fetched successfully", catgeory);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch catgeory data", 500);
    }
};

exports.deleteCategory =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Catgeory id is required to delete", 400);
        }

        const category = await ExpenseCategories.findByPk(id);

        if (!category) {
            return errorResponse(res, "Category not found", 404);
        }

        await category.destroy();

        return successResponse(res, "Category deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete category", 500);
    }
};

exports.editCategory = async (req,res) =>{
  try {
    const {id}=req.params;
    const {name,description}=req.body;

    if(!id){
        return errorResponse(res, "Category id is required", 400);
    }

    const catgeory = await ExpenseCategories.findByPk(id);

    if(!catgeory){
        return errorResponse(res, "Category not found", 404);
    }

    const existingCategory = await ExpenseCategories.findOne({
        where: {
            name: {[Op.like]: name.toLowerCase()},
            id: { [Op.ne]: id },
        },
    });

    if (existingCategory) {
        return errorResponse(res, "Category with this name already exists", 400);
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    await catgeory.update(updateData);

    return successResponse(res, "Category updated successfully", catgeory);

  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to edit category", 500);
  }
};