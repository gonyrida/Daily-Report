// routes/dailyReportRoutes.js
const express = require("express");
const router = express.Router();

const {
  getDailyReports,
  createDailyReport,
  getReportByDate,
  saveOrUpdateReport,
  submitReport, // ← ADD THIS to your imports
} = require("../controllers/dailyReportController");

// These are now relative to /api/daily-reports
router.get("/", getDailyReports);
router.post("/", createDailyReport);
router.post("/save", saveOrUpdateReport);           // /api/daily-reports/save
router.post("/submit", submitReport);               // ← ADD THIS LINE
router.get("/date/:date", getReportByDate);         // /api/daily-reports/date/:date
router.get("/project/:projectName/date/:date", getReportByDate);

module.exports = router;