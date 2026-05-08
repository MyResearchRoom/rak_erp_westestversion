const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createReceipt, getReceiptsList, deleteReceipts, getReceiptById } = require("../controller/receipts");
const { addReceiptValidation } = require("../validation/receiptValidations");
const { validateRequest } = require("../middleware/validate");
const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    addReceiptValidation,
    validateRequest,
    createReceipt,
);

router.get(
    "/receiptsList",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getReceiptsList
);

router.delete(
    "/delete/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    deleteReceipts
)

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getReceiptById,
)

module.exports = router;