// backend\src\routes\dailyReportRoutes.js

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

const {
  getDailyReports,
  createDailyReport,
  getReportByDate,
  saveOrUpdateReport,
  submitReport,
} = require("../controllers/dailyReportController");

// --- ALL ROUTES NOW PROTECTED ---

// 1. Get all reports (Only YOURS)
router.get("/", authenticateToken, getDailyReports);

// 2. Initial create (Tied to YOU)
router.post("/", authenticateToken, createDailyReport);

// 3. Save and Submit (Already had it, but keeping it safe)
router.post("/save", authenticateToken, saveOrUpdateReport);
router.post("/submit", authenticateToken, submitReport); 

// 4. Fetching by date (Now scopes to YOU)
router.get("/date/:date", authenticateToken, getReportByDate); // Fixed: added authenticateToken
router.get("/project/:projectName/date/:date", authenticateToken, getReportByDate);

module.exports = router;