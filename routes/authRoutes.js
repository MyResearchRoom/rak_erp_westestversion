const { Router } = require("express");
const { login, refreshToken, logout, changePassword } = require("../controller/authcontroller");
const { authenticate } = require("../middleware/auth");
const { chnagePasswordValidations } = require("../validation/userValidation");
const { validateRequest } = require("../middleware/validate");

const router = Router();

router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.patch(
    "/changePassword",
    authenticate(["ADMIN"]),
    chnagePasswordValidations,
    validateRequest,
    changePassword,
)

module.exports = router;