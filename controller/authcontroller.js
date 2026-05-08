const { errorResponse, successResponse } = require('../utils/response');
const bcrypt = require("bcryptjs");
const { User ,UserPermission,Permission,Company} = require('../models');
const {generateTokens, decodeRefreshToken} =require("../utils/token");
const { createRefreshToken, validate, deleteRefreshToken } = require('../service/refreshToken');
const { findUser } = require('./user');
const { where } = require('sequelize');
const COOKIE_NAME = "refreshToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

exports.login = async (req, res) => {
    try {
        const { email, password ,role} = req.body;
        if (!email || !password || !role) {
            return errorResponse(res, "All fields are required", 400);
        }
        const user = await User.findOne({
            where: {email,role},
            attributes: { include: ["password"] }
        });      

        if (!user) {
            return errorResponse(res,"Invalid details.", 400);
        }

        if (user.isBlock) {
            return errorResponse(res,
            "Your account has been blocked, Please Contact to admin.",
            400
            );
        }

        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) {
            return errorResponse(res,"Invalid password.", 400);
        }

        const { accessToken, refreshToken } = generateTokens(user);

        await createRefreshToken(user.id, refreshToken, req);

        let permissions;
        if (user.role === "EMPLOYEE") {
          permissions = await UserPermission.findAll({
              where: {
              userId: user.id,
              isActive: true,
              },
              include: {
              model: Permission,
              as: "permission",
              },
          });
          permissions = permissions.map((perm) => perm.permission.name);
        }

        let companyId;
        if(user.role==="COMPANY") {
          const company = await Company.findOne({
            where:{email:email},
          });
          if (!company) {
            return errorResponse(res,"Comapny not found for this username.", 400);
          }
          companyId=company.id;
        }

        res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        successResponse(res, "Login successful", {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                mobileNumber: user.mobileNumber
            },
            accessRoute: permissions,
            companyId: companyId,
            });

    }catch (err) {
        console.log(err);
        
    errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    await validate(refreshToken);

    const decoded = decodeRefreshToken(refreshToken);

    const user = await findUser(decoded.id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    await deleteRefreshToken(refreshToken, req);
    await createRefreshToken(user.id, newRefreshToken, req);

    let permissions=[];
    if (user.role === "EMPLOYEE") {
      permissions = await UserPermission.findAll({
        where: {
          userId: user.id,
          isActive: true,
        },
        include: {
          model: Permission,
          as: "permission",
        },
      });
      permissions = permissions.map((perm) => perm.permission.name);
    }
    console.log("permission",permissions);

    let companyId;
        
    if(user.role ==="COMPANY") {     
      const company = await Company.findOne({
        where:{email:user.email},
      });
      if (!company) {
        return errorResponse(res,"Comapny not found for this username.", 400);
      }
      companyId=company.id;
    }

    res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);

    successResponse(res, "Token refresh successful......", {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email:user.email,
        mobileNumber:user.mobileNumber
      },
      accessRoute: permissions,
      companyId: companyId,
    });
  } catch (err) {
    errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken, req);
      res.clearCookie("refreshToken");
    }
    successResponse(res, "Logged out successfully");
  } catch (err) {
    errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id; 

    if (!oldPassword || !newPassword) {
      return errorResponse(res, "Both passwords are required", 400);
    }

    const user = await User.scope(null).findByPk(userId); 

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
       return errorResponse(res, "Old password is incorrect", 400);
    }

    if (oldPassword === newPassword) {
      return errorResponse(res, "New password must be different from old one", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return successResponse(res, "Password changed successfully");

  } catch (err) {
    console.log(err);
    return errorResponse(res, "Failed to change password", 500);
  }
};

