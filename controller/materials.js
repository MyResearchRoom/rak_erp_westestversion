const { Materials,Company, sequelize} = require('../models');
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

exports.addMaterials = async(req,res)=>{
try{
    
    const {companyId,itemName, hsnCode, unit, gstRate, price}=req.body;
    // console.log("req.body",req.body);
    const { role, email, id: userId } = req.user;

    if(!companyId ){
        return errorResponse(res, "Company id is required", 400);
    }

    if(!itemName || !hsnCode || !unit || !gstRate || !price ){
        return errorResponse(res, "Provide all material required data", 400);
    }

    const company = await Company.findByPk(companyId);

    if (!company) {
        return errorResponse(res, "Company not found", 404);
    }

    if (role === "COMPANY") {
        const companyByLogin = await Company.findOne({ where: { email } });
            

        if (!companyByLogin) {
            return errorResponse(res, "Company not found", 404);
        }

        if (Number(companyId) !== companyByLogin.id) {
            return errorResponse(res, `You are not belongs to ${company.name} company`, 404);
        }

    }

    const existingMaterials = await Materials.findOne({
        where: {
            itemName,
            companyId,
        },
    });

    if (existingMaterials) {
        return errorResponse(res, "Material with this name for provided company already exists", 400);
    }
    
    
    const material = await Materials.create(
        {
            itemName, 
            companyId,
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
        const{unit,gstRate,companyId}=req.query;

        // console.log(unit,gstRate,companyId);
        

        const { role, email, id: userId } = req.user;

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

        if(companyId){
            whereClause.companyId=companyId;
        }

        if (role === "COMPANY") {
            const company = await Company.findOne({ where: { email } });
            // console.log("company",company);
            

            if (!company) {
                return errorResponse(res, "Company not found", 404);
            }

            whereClause.companyId=company.id;
        }

         const {count,rows} =await  Materials.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Company,
                    as: "company",
                    attributes: ["id", "name"],
                    required: true,
                },
            ],
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        })


        // console.log(rows.JSON());
        

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


