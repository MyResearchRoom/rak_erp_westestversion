const { Router } = require("express");
const { getPermissions, grantPermission, getUserPermissions } = require("../controller/permission");

const router = Router();

router.get("/list", getPermissions);
router.post("/add-userPermission", grantPermission);
router.get("/:userId",getUserPermissions);
module.exports = router;