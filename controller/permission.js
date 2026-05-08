const { Permission ,UserPermission, sequelize} = require("../models");
const { errorResponse, successResponse } = require("../utils/response");

exports.getPermissions = async (req, res) => {
  try {
    const data = await Permission.findAll(); 
    if (!data) {
        return errorResponse(res, "Permissions not created yet", 400);
    }
    return successResponse(res, "Permission list successfully", data);

  } catch (error) {
     return errorResponse(res, "Permissions not found", 500);
  }
};

exports.grantPermission = async (req, res) => {
  const { userId, permissionIds } = req.body;

  if (!userId || !Array.isArray(permissionIds)) {
    return res.status(400).json({
      success: false,
      message: "userId and permissionIds are required",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    await UserPermission.destroy({
      where: { userId },
      transaction,
    });

    if (permissionIds.length === 0) {
      await transaction.commit();
      return successResponse(res, "All permissions removed");
    }

    const validPermissions = await Permission.findAll({
      where: { id: permissionIds },
      attributes: ["id"],
    });

    if (validPermissions.length !== permissionIds.length) {
        await transaction.rollback(); 
        return errorResponse(res, "One or more permission names are invalid", 400);
    }

    const newPermissions = permissionIds.map((id) => ({
      userId,
      permissionId: id,
      grantedAt: new Date(),
      isActive: true,
    }));

    await UserPermission.bulkCreate(newPermissions, { transaction });

    await transaction.commit();
    return successResponse(res, "Permission granted successfully");

  } catch (error) {
    await transaction.rollback(); 
    return errorResponse(res, "Permission not granted", 500);
  }
};

exports.getUserPermissions = async (req, res) => {
try{
    const userId = req.params.userId;
    if (!userId) {
        return errorResponse(res, "User ID is required", 400);
    }

    const permissions = await UserPermission.findAll({
        where: { userId, isActive: true },
        include: [
            {
                model: Permission,
                attributes: ["id", "name"],
                as: "permission",
            },
        ],
    });

    const data = permissions.map((permission) => permission.permissionId);

    return successResponse(res, "User permissions list fetch successfully",data);

}catch (error) {
    return errorResponse(res, "Failed to get user permission data", 500);
  }
};