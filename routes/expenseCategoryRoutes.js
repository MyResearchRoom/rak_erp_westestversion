const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { addCreateExpenseCatgeory,editCreateExpenseCatgeory } = require("../validation/expenseCategoryValidation");
const { addCategory, getCategoriesList, deleteCategory, getCategoryById, editCategory } = require("../controller/expenseCategory");

const router = Router();

router.post(
    "/add", 
    authenticate(["ADMIN","EMPLOYEE"]),
    addCreateExpenseCatgeory,
    validateRequest,
    addCategory,
);

router.get(
    "/categoriesList", 
    authenticate(["ADMIN","EMPLOYEE","COMPANY"]),
    getCategoriesList,
);

router.get(
    "/:id", 
    authenticate(["ADMIN","EMPLOYEE"]),
    getCategoryById,
);

router.delete(
    "/delete/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    deleteCategory,
);

router.patch(
    "/edit/:id",
    authenticate(["ADMIN","EMPLOYEE"]),
    editCreateExpenseCatgeory,
    validateRequest,
    editCategory,
)

module.exports = router;