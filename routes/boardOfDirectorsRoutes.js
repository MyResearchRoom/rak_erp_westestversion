const { Router } = require("express");
const multer = require("multer");

const { validateRequest } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const {
  boardOfDirectorValidation,
  editBoardOfDirectorValidation,
} = require("../validation/boardOfDirectorsValidations");

const {
  addBoardOfDirector,
  getBoardOfDirectors,
  deleteBoardOfDirector,
  editBoardOfDirector,
  getBoardOfDirectorById,
  uploadBoardOfDirectors,
} = require("../controller/boardOfDirectorsManagmentController");

const router = Router();

/* =======================
   📦 MULTER CONFIG
======================= */
const upload = multer({
  storage: multer.memoryStorage(), // IMPORTANT for buffer (you are using buffer in controller)
});

/* =======================
   📄 ADD DIRECTOR
======================= */
router.post(
  "/add/:id",
  authenticate(["ADMIN", "EMPLOYEE"]),
  upload.fields([
    { name: "kycDocument", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "sevenTwelve", maxCount: 1 },
  ]),
  boardOfDirectorValidation,
  validateRequest,
  addBoardOfDirector
);

/* =======================
   📄 GET ALL DIRECTORS
======================= */
router.get(
  "/director-list/:id",
  authenticate(["ADMIN", "EMPLOYEE", "COMPANY"]),
  getBoardOfDirectors
);

/* =======================
   📄 GET SINGLE DIRECTOR
======================= */
router.get(
  "/:id",
  authenticate(["ADMIN", "EMPLOYEE", "COMPANY"]),
  getBoardOfDirectorById
);

/* =======================
   ❌ DELETE DIRECTOR
======================= */
router.delete(
  "/delete/:id",
  authenticate(["ADMIN", "EMPLOYEE"]),
  deleteBoardOfDirector
);

/* =======================
   ✏️ EDIT DIRECTOR
======================= */
router.patch(
  "/edit/:id",
  authenticate(["ADMIN", "EMPLOYEE"]),
  upload.fields([
    { name: "kycDocument", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "sevenTwelve", maxCount: 1 },
  ]),
  editBoardOfDirectorValidation,
  validateRequest,
  editBoardOfDirector
);

/* =======================
   📊 BULK UPLOAD (EXCEL)
======================= */
router.post(
  "/upload-BOD/:id",
  authenticate(["ADMIN", "EMPLOYEE"]),
  upload.single("file"),
  uploadBoardOfDirectors
);

module.exports = router;
