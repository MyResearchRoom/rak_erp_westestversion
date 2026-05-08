const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const {upload} = require("../middleware/upload");
const { addCompanyDetails, editCompoamnyDetails, getCompanyProfileById } = require("../controller/companyDetails");

const router = Router();

router.post(
    "/add/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.array("documents"),
    addCompanyDetails,
);

router.patch(
    "/edit/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.array("documents"),
    editCompoamnyDetails,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE",,"COMPANY"]),
    getCompanyProfileById
)


module.exports = router;