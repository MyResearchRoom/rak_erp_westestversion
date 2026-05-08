const express = require("express");
const router = express.Router();

const userRoutes=require("./userRoute");
const authRoutes=require("./authRoutes");
const UserPermission = require("./permissionRoute");
const CompanyRoute = require("./companyRoute");
const companyDetailRoute = require("./companyDetailsRoute.js");
const BoardOfDirectorsRoute = require("./boardOfDirectorsRoutes");
const FarmerMemberRoute = require("./farmerMembersRoute");
const MaterialRoutes = require("./materialsRoutes");
const InvoiceRoutes = require("./invoiceRoute");
const ReceiptRoute = require("./receipts");
const CountRoute = require("./countRoute");
const ExpenseCategory = require("./expenseCategoryRoutes");
const Expense = require("./expenseRoute");
const AcountRoute = require("./accountRoute");
const ComplianceRoute = require("./complianceDocumentRoute");
const ReportRoute = require("./reportRoute");



router.use("/test", (req, res) => res.send("<h1>This is a test API for rak advisory backend started on 02-04-2026</h1>"));
router.use("/api/user", userRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/permission", UserPermission);
router.use("/api/company", CompanyRoute);
router.use("/api/company-details", companyDetailRoute);
router.use("/api/board-directors", BoardOfDirectorsRoute);
router.use("/api/farmer-member", FarmerMemberRoute);
router.use("/api/material", MaterialRoutes);
router.use("/api/invoice", InvoiceRoutes);
router.use("/api/receipts", ReceiptRoute);
router.use("/api/count", CountRoute);
router.use("/api/expenseCategory", ExpenseCategory);
router.use("/api/expense", Expense);
router.use("/api/account", AcountRoute);
router.use("/api/compliance", ComplianceRoute);
router.use("/api/report", ReportRoute);



module.exports = router;