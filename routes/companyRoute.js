const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { createCompany, getcompanyList, getCompanyById, editCompany, deleteCompany, changeStatusOfCompany } = require("../controller/company");
const {upload} = require("../middleware/upload");
const { companyRegistrationValidation, companyEditValidation } = require("../validation/companyValidations");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN"]),
    upload.single("logo"),
    companyRegistrationValidation, 
    validateRequest, 
    createCompany,
);

router.get(
    "/company-list",
    authenticate(["ADMIN","EMPLOYEE"]),
    getcompanyList,
)

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE",,"COMPANY"]),
    getCompanyById,
)

router.post(
    "/edit/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.single("logo"),
    companyEditValidation, 
    validateRequest, 
    editCompany,
);

router.delete(
  "/delete/:id",
  authenticate(["ADMIN","EMPLOYEE"]),
  deleteCompany
);

router.patch(
    "/changeStatus/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    changeStatusOfCompany
)

module.exports = router;
