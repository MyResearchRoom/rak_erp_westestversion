const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { uploadFiles } = require("../middleware/upload");
const { validateCreateCompliance ,validateUpdateCompliance} = require("../validation/complianceVaidations");
const { addComplianceData, getComplianceList, getComplianceById, deleteCompliance, editCompliance, getComplianceDocumentList } = require("../controller/complianceDocumentController");

const router = Router();

const COMPLIANCE_DOC_NAMES = [
    "statutoryAudit",
    "incomeTaxReturn",
    "accountsWritingCharges",
    "tdsReturns",
    "adt1",
    "inc20A",
    "mgt7",
    "aoc4",
    "dpt3",
    "dirKyc",
    "minutesDrafting",
    "maintenanceOfRegisters",
    "incomeTaxAudit",
];

const complianceUploadFields = [
    ...COMPLIANCE_DOC_NAMES.map((name) => ({ name: `${name}_file`, maxCount: 1 })),
    ...Array.from({ length: 50 }, (_, i) => ({ name: `otherDoc_${i}_file`, maxCount: 1 })),
];

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    uploadFiles(complianceUploadFields),
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
    "/complianceDocList",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getComplianceDocumentList,
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
    uploadFiles(complianceUploadFields),
    validateUpdateCompliance, 
    validateRequest, 
    editCompliance
)

module.exports = router;
