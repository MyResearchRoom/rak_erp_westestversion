const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { addMaterials, getMaterialsList, editMaterial, getMaterialById, deleteMaterial } = require("../controller/materials");
const { addMaterialValidation, editMaterialValidation } = require("../validation/materialValidations");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    addMaterialValidation,
    validateRequest,
    addMaterials,
);

router.get(
    "/materialList",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getMaterialsList,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getMaterialById,
);

router.patch(
    "/edit/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    editMaterialValidation,
    validateRequest,
    editMaterial,
);

router.delete(
    "/delete/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    deleteMaterial,
)

module.exports = router;