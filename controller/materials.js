const { Materials, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

exports.addMaterials = async(req,res)=>{
try{
    
    const {itemName, hsnCode, unit, gstRate, price}=req.body;
    console.log("req.body",req.body);
    

    if(!itemName || !hsnCode || !unit || !gstRate || !price ){
        return errorResponse(res, "ProvidE all required data", 400);
    }
    const existingMaterials = await Materials.findOne({
        where: {
            itemName: req.body.itemName,
        },
    });

    if (existingMaterials) {
        return errorResponse(res, "Material with this name already exists", 400);
    }
    
    
    const material = await Materials.create(
        {
            itemName, 
            hsnCode, 
            unit, 
            gstRate, 
            price
        },
    );

    if (!material) {
        return errorResponse(res, "Material not added successfully", 400);
    }
    
    return successResponse(res, "Material added successfully", material);

}catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to add material", 500);
}
};

exports.getMaterialsList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const{unit,gstRate}=req.query;

        let whereClause = {};

        if (searchTerm) {
        whereClause[Op.or] = [
            { itemName: { [Op.like]: `%${searchTerm}%` } },
            { hsnCode: { [Op.like]: `%${searchTerm}%` } },
            { unit: { [Op.like]: `%${searchTerm}%` } },
            { gstRate: { [Op.like]: `%${searchTerm}%` } },
        ];
        }
        
        if(unit){
            whereClause.unit=unit;
        }

        if(gstRate){
            whereClause.gstRate=gstRate;
        }

         const {count,rows} =await  Materials.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        })

        successResponse(res, "Materials fetched successfully", {
        materials: rows,
        pagination: {
            totalRecords: count,
            totalPages: limit ? Math.ceil(count / limit) : 1,
            currentPage: page,
            itemsPerPage: limit,
        },
        });

    }catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch Materials", 500);
    }

}

exports.getMaterialById = async (req,res)=>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Material id is required", 400);
        }

        const material = await Materials.findByPk(id);

        if(!material){
            return errorResponse(res, "Material not found", 404);
        }

        return successResponse(res, "Material data fetched successfully", material);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch material", 500);
    }
};

exports.editMaterial = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id) {
      await transaction.rollback();
      return errorResponse(res, "Material id is required", 400);
    }

    const material = await Materials.findByPk(id, { transaction });

    if (!material) {
      await transaction.rollback();
      return errorResponse(res, "Material not found", 404);
    }

    const allowedFields = [
      "itemName",
      "hsnCode",
      "unit",
      "gstRate",
      "price",
    ];

    let updateData = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined &&
            req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    });

    if(updateData.itemName){
        const existing=await Materials.findOne({
            where:{
                id :{[Op.ne]:id},
                itemName: updateData.itemName,
            },
            transaction
        });
        if (existing) {
            await transaction.rollback();
            return errorResponse(res, "name already exists", 400);
        }
    }

    await material.update(updateData, {transaction});

    await transaction.commit();

    return successResponse(res, "Material updated successfully", material);


  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return errorResponse(res, "Failed to edit material", 500);
  }
};

exports.deleteMaterial =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Material id is required", 400);
        }

        const material = await Materials.findByPk(id);

        if (!material) {
            return errorResponse(res, "Material not found", 404);
        }

        await material.destroy();

        return successResponse(res, "Material deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete material", 500);
    }
};


