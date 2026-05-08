const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { getCount } = require("../controller/count");

const router = Router();

router.get(
    "/countData",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getCount,
);

module.exports = router;