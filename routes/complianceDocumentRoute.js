const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const {upload} = require("../middleware/upload");
const { validateCreateCompliance ,validateUpdateCompliance} = require("../validation/complianceVaidations");
const { addComplianceData, getComplianceList, getComplianceById, deleteCompliance, editCompliance } = require("../controller/complianceDocumentController");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.single("document"),
    validateCreateCompliance, 
    validateRequest, 
    addComplianceData,
);

router.get(
    "/complianceList",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getComplianceList,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getComplianceById,
)

router.delete(
  "/delete/:id",
  authenticate(["ADMIN","EMPLOYEE"]),
  deleteCompliance
);

router.patch(
    "/edit/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.single("document"),
    validateUpdateCompliance, 
    validateRequest, 
    editCompliance
)

module.exports = router;
