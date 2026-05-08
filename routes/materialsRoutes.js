const { Router } = require("express");
const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { addMaterials, getMaterialsList, editMaterial, getMaterialById, deleteMaterial } = require("../controller/materials");
const { addMaterialValidation, editMaterialValidation } = require("../validation/materialValidations");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    addMaterialValidation,
    validateRequest,
    addMaterials,
);

router.get(
    "/materialList",
    authenticate(["ADMIN","EMPLOYEE"]),
    getMaterialsList,
);

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    getMaterialById,
);

router.patch(
    "/edit/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
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