const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { validateCreateExpense } = require("../validation/expenseValidation");
const { getexpenseList, createExpense, deleteExpense, getExpenseById, changeStatusOfExpene } = require("../controller/expense");
const { upload } = require("../middleware/upload");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    upload.single("receipt"),
    validateCreateExpense,
    validateRequest,
    createExpense
);

router.get(
    "/expenseList",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getexpenseList
)

router.get(
    "/:id",
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getExpenseById
)

router.delete(
    "/delete/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    deleteExpense,
);

router.patch(
    "/changeStatus/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    changeStatusOfExpene,
);

module.exports = router;
