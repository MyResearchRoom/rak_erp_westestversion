const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { getCount, getAdminDashBoardCount, getCompanyDashBoardCount } = require("../controller/count");

const router = Router();

router.get(
    "/countData",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getCount,
);

router.get(
    "/countAdminDashboardData",
    authenticate(["ADMIN","EMPLOYEE"]),
    getAdminDashBoardCount,
);

router.get(
    "/companyDashboardCount",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getCompanyDashBoardCount,
);

module.exports = router;