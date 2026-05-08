const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createInvoice, getInvoiceList, getInvoiceById, deleteInvoice,getInvoiceByCompanyId } = require("../controller/invoice");
const { createInvoiceValidation } = require("../validation/invoiceValidatiions");
const { validateRequest } = require("../middleware/validate");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    createInvoiceValidation,
    validateRequest,
    createInvoice,
);

router.get(
    "/invoiceList", 
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getInvoiceList,
);

router.get(
    "/invoiceByCompany/:companyId",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getInvoiceByCompanyId,
)

router.get(
    "/:id", 
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getInvoiceById,
);


router.delete(
    "/delete/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    deleteInvoice,
)

module.exports = router;