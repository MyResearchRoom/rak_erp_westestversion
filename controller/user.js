const { User,Permission } = require('../models');
const bcrypt = require("bcryptjs");
const { errorResponse, successResponse } = require('../utils/response');
const { createError } = require("../utils/error");
const { validateQueryParams } = require('../utils/validateQueryParams');
const { Op } = require('sequelize');

const DEFAULT_PERMISSIONS = [
  "DASHBOARD",
  "COMPANIES",
  "MATERIALS",
  "EXPENSES",
  "INVOICES",
  "RECEIPTS",
  "ACCOUNTS",
  "COMPLIANCE",
];

exports.AdminRegistration = async (req, res) => {
    try {
        const { name, email, mobileNumber, password, role } = req.body;

        if (!name || !email || !password || !mobileNumber || !role) {
            return errorResponse(res, "All fields are required", 400);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return errorResponse(res, "Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
            role
        });

        if (!user) {
            return errorResponse(res, "User not created", 400);
        }

        if (role === "ADMIN") {
            const permissionCount = await Permission.count();

            if (permissionCount === 0) {
                const permissionRecords = DEFAULT_PERMISSIONS.map((name) => ({
                name,
                createdAt: new Date(),
                updatedAt: new Date(),
                }));

                await Permission.bulkCreate(permissionRecords);
            }
        }

        const userData = user.toJSON();
        delete userData.password;

        return successResponse(res, "Admin registered successfully", userData);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Admin not registered", 500);
    }
};

exports.EmplyoeeRegistration = async (req, res) => {
    try {
        const { name, email, mobileNumber, password ,role} = req.body;

        if (!name || !email  || !password || !mobileNumber || !role) {
            return errorResponse(res, "All fields are required", 400);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return errorResponse(res, "Email already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
            role
        });

        if (!user) {
            return errorResponse(res, "User not created", 400);
        }

        const userData = user.toJSON();
        delete userData.password;

        return successResponse(res, "Emplyoee registered successfully", userData);

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Employee not registered", 500);
    }
};

exports.findUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw createError("User not found.", 404);
  }
  return user;
};

exports.getEmployeeList = async (req,res)=>{
try{
    const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });

    let whereClause = {};

    whereClause.role="EMPLOYEE";
    
    if (searchTerm) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { mobileNumber: { [Op.like]: `%${searchTerm}%` } },
        ];
    }

    const {count,rows} =await  User.findAndCountAll({
        where: whereClause,
        offset,
        limit,
        order: [["createdAt", "DESC"]],
    })
    successResponse(res, "Employees list fetched successfully", {
        employees: rows,
        pagination: {
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit,
        },
        });
} catch(error){
    console.log(error);
    return errorResponse(res, "Failed to fetch employees", 500);
}
};

exports.deleteEmployee =async (req,res) => {
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Employee id is required to delete", 400);
        }

        const employee = await User.findByPk(id);

        if (!employee) {
            return errorResponse(res, "Employee not found", 404);
        }

        await employee.destroy();

        return successResponse(res, "Employee deleted successfully");

    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to delete employee", 500);
    }
};

exports.getEmployeeById = async (req,res) =>{
    try{
        const {id}=req.params;

        if(!id){
            return errorResponse(res, "Employee id is required", 400);
        }

        const employee = await User.findByPk(id);

        if(!employee){
            return errorResponse(res, "Employee not found", 404);
        }

        return successResponse(res, "Employee data fetched successfully", employee);


    } catch (error) {
        console.log(error);
        return errorResponse(res, "Failed to fetch employee data", 500);
    }
};

exports.editEmployee = async (req,res) =>{
  try {
    const { id } = req.params;

    const { name, email, mobileNumber} = req.body;


    if (!id) {
      return errorResponse(res, "employee id is required to edit", 400);
    }

    const employee = await User.findByPk(id);

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    if (email && email !== employee.email) {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return errorResponse(res, "Email already exists", 400);
        }
    }

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (mobileNumber) employee.mobileNumber = mobileNumber;

    await employee.save();

    return successResponse(res, "Employee updated successfully", employee);

  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed to edit Employee", 500);
  }
};