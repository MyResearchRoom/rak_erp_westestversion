const { decodeAccessToken } = require("../utils/token");
const { errorResponse } = require("../utils//response");
const { findUser } = require("../controller/user");

exports.authenticate = (roles = []) => {
  return async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = decodeAccessToken(token);

      console.log(decoded);

      const user =await findUser(decoded.id);

      if (user.status === "INACTIVE") {
        return errorResponse(
          res,
          "User status is 'inactive' can't perform any action.",
          400
        );
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return errorResponse(res, "Unauthrized request.", 403);
      }

      req.user = user;

      next();
    } catch (error) {
      console.log(error);
      
      errorResponse(res, "Invalid Or expired token, please login again.", 400);
    }
  };
};


