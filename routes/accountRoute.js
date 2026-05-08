const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { getAccountDetails } = require("../controller/acountController");

const router = Router();

router.get(
    "/accountDetails",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getAccountDetails,
);

module.exports = router;
