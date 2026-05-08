const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { getReportDetails } = require("../controller/report");

const router = Router();

router.get(
    "/reportDetails",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getReportDetails,
);

module.exports = router;
