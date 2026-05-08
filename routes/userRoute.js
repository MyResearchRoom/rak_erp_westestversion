const { Router } = require("express");
const { AdminRegistration, EmplyoeeRegistration, getEmployeeList, deleteEmployee, getEmployeeById, editEmployee } = require("../controller/user");
const { userRegisterValidation } = require("../validation/userValidation");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.post(
    "/admin-register", 
    userRegisterValidation,
    validateRequest,
    AdminRegistration
);

router.post(
    "/emp-register",
    authenticate(["ADMIN"]), 
    userRegisterValidation,
    validateRequest,
    EmplyoeeRegistration
);

router.get(
    "/getEmployees",
    authenticate(["ADMIN"]), 
    getEmployeeList,
);

router.get(
    "/:id",
    authenticate(["ADMIN"]),
    getEmployeeById,
);

router.delete(
  "/delete/:id",
  authenticate(["ADMIN"]),
  deleteEmployee
);

router.patch(
    "/edit/:id",
    authenticate(["ADMIN"]),
    editEmployee
);

module.exports = router;
