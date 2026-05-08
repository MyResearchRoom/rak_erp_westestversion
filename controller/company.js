const { Company,User,sequelize} = require('../models');
const bcrypt = require("bcryptjs");
const { errorResponse, successResponse } = require('../utils/response');
const { Op, where } = require('sequelize');
const { validateQueryParams } = require('../utils/validateQueryParams');

exports.createCompany = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      gstin,
      pan,
      companyType,
      address,
      city,
      state,
      pincode,
      contactPerson,
      email,
      mobileNumber,
      password,
      assignEmployee,
    } = req.body;

    const normalizedGstin = gstin?.toUpperCase();
    const normalizedPan = pan?.toUpperCase();

    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [{ gstin: normalizedGstin }, { pan: normalizedPan }],
      },
      transaction,
    });

    if (existingCompany) {
      await transaction.rollback();
      return errorResponse(res, "Company with this GSTIN or PAN already exists", 400);
    }

    const existingCompanyWithEmail = await Company.findOne({
      where: { email },
      transaction,
    });

    if (existingCompanyWithEmail) {
      await transaction.rollback();
      return errorResponse(res, "Company with this email already exists", 400);
    }

    const employee = await User.findByPk(assignEmployee, { transaction });

    if (!employee) {
      await transaction.rollback();
      return errorResponse(res, "Assigned employee not found", 400);
    }

    // ✅ File handling
    const logo = req.file ? req.file.buffer : null;
    const logoContentType = req.file ? req.file.mimetype : null;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const company = await Company.create(
      {
        name,
        gstin: normalizedGstin,
        pan: normalizedPan,
        companyType,
        address,
        city,
        state,
        pincode,
        contactPerson,
        email,
        mobileNumber,
        password: hashedPassword,
        connectedDate: new Date(),
        assignEmployee,
        logo,
        logoContentType,
      },
      { transaction }
    );

    const companyUser = await User.create(
      {
        name,
        email,
        mobileNumber,
        password: hashedPassword,
        role: "COMPANY",
      },
      { transaction }
    );

    if (!companyUser) {
      await transaction.rollback();
      return errorResponse(res, "Company user not created", 400);
    }

    await transaction.commit();

    const data = company.toJSON();
    delete data.password;

    return successResponse(res, "Company created successfully", data);

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return errorResponse(res, "Failed to create company", 500);
  }
};

exports.getcompanyList = async(req,res)=>{
    try{
        const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
        const { status, employeeId , companyType} = req.query;
        const { role, id} = req.user; 

        let whereClause = {};

        if (role === "EMPLOYEE") {
          whereClause.assignEmployee=id;
        }

        if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { gstin: { [Op.like]: `%${searchTerm}%` } },
            { pan: { [Op.like]: `%${searchTerm}%` } },
        ];
        }

        if(status){
            whereClause.status=status;
        }

        if(employeeId){
            whereClause.assignEmployee=employeeId;
        }
        
        if(companyType){
            whereClause.companyType=companyType;
        }

        const {count,rows} =await  Company.findAndCountAll({
            where: whereClause,
            include:[
                {
                    model: User,
                    as: "assignEmployeeData",
                    attributes: ["id", "name", "email"],
                },
            ],
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        })

        const companiesWithLogo = rows.map((company) => {
            const data = company.toJSON();

            if (data.logo) {
                const base64 = data.logo.toString("base64");

                data.logo = `data:${data.logoContentType};base64,${base64}`;
            } else {
                data.logo = null;
            }

            return data;
        });

        successResponse(res, "Companies fetched successfully", {
        companies: companiesWithLogo,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit,
        },
        });
    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch companies", 500);
    }

};

exports.getCompanyById = async (req,res)=>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id, {
            include: [
                {
                model: User,
                as: "assignEmployeeData",
                attributes: ["id", "name", "email"],
                },
            ],
        });

        if(!company){
            return errorResponse(res, "Company not found", 404);
        }

        const data = company.toJSON();

        if (data.logo) {
            const base64 = data.logo.toString("base64");
            data.logo = `data:${data.logoContentType};base64,${base64}`;
        } else {
            data.logo = null;
        }

        return successResponse(res, "Company data fetched successfully", data);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch company", 500);
    }
};

exports.editCompany = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id) {
      await transaction.rollback();
      return errorResponse(res, "Company id is required", 400);
    }

    const company = await Company.findByPk(id, { transaction });

    if (!company) {
      await transaction.rollback();
      return errorResponse(res, "Company not found", 404);
    }

    const logo = req.file ? req.file.buffer : company.logo;
    const logoContentType = req.file ? req.file.mimetype : company.logoContentType;

    const allowedFields = [
      "name",
      "gstin",
      "pan",
      "companyType",
      "address",
      "city",
      "state",
      "pincode",
      "contactPerson",
      "email",
      "mobileNumber",
      "assignEmployee",
    ];

    let updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.gstin) updateData.gstin = updateData.gstin.toUpperCase();
    if (updateData.pan) updateData.pan = updateData.pan.toUpperCase();

    if (updateData.gstin || updateData.pan) {
      const existing = await Company.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            updateData.gstin ? { gstin: updateData.gstin } : null,
            updateData.pan ? { pan: updateData.pan } : null,
          ].filter(Boolean),
        },
        transaction,
      });

      if (existing) {
        await transaction.rollback();
        return errorResponse(res, "GSTIN or PAN already exists", 400);
      }
    }

    updateData.logo = logo;
    updateData.logoContentType = logoContentType;

    const user = await User.findOne({
      where: { email: company.email },
      transaction,
    });

    await company.update(updateData, { transaction });

    if (user && updateData.email) {
      user.email = updateData.email;
      await user.save({ transaction });
    }

    await transaction.commit();

    return successResponse(res, "Company updated successfully", company);

  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return errorResponse(res, "Failed to edit company", 500);
  }
};

exports.deleteCompany =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Company id is required", 400);
        }

        const company = await Company.findByPk(id);

        if (!company) {
            return errorResponse(res, "Company not found", 404);
        }

        await company.destroy();

        return successResponse(res, "Company deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete company", 500);
    }
};

exports.changeStatusOfCompany = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Company id is required", 400);
    }

    const company = await Company.findByPk(id, { transaction });

    if (!company) {
      await transaction.rollback();
      return errorResponse(res, "Company not found", 404);
    }

    const companyUser = await User.findOne({
      where: { email: company.email },
      transaction,
    });

    if (!companyUser) {
      await transaction.rollback();
      return errorResponse(res, "Company user not found", 404);
    }

    const newIsBlock = !companyUser.isBlock;

    const newStatus = newIsBlock ? "inactive" : "active";

    await company.update(
      { status: newStatus },
      { transaction }
    );

    await companyUser.update(
      { isBlock: newIsBlock },
      { transaction }
    );

    await transaction.commit();

    return successResponse(
      res,
      `Company ${newIsBlock ? "blocked" : "unblocked"} successfully`
    );

  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return errorResponse(res, "Failed to change company status", 500);
  }
};



