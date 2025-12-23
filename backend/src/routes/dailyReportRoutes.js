// const express = require("express");
// const router = express.Router();
// const dailyReportController = require("../controllers/dailyReportController");

// router.get("/", dailyReportController.getDailyReports);
// router.post("/", dailyReportController.createDailyReport);
// router.get(
//   "/project/:projectName/date/:date",
//   dailyReportController.getReportByDate
// );
// router.put("/", dailyReportController.saveOrUpdateReport);
// router.post("/save", dailyReportController.saveOrUpdateReport);
// router.put("/submit/:projectName/:date", dailyReportController.submitReport);

// module.exports = router;

const express = require("express");
const router = express.Router();
// const  = require("../controllers/dailyReportController");
const {
  dailyReportController,
  getDailyReports,
  createDailyReport,
  getReportByDate,
  saveOrUpdateReport,
  submitReport,
} = require("../controllers/dailyReportController");
// Get all reports
router.get("/daily-reports", getDailyReports);
// Create new report
router.post("/daily-reports", createDailyReport);
// Save or update report
router.post("/daily-reports/save", saveOrUpdateReport);
// Submit report - MAKE SURE THIS LINE EXISTS
router.post("/daily-reports/submit", submitReport);
// Get report by date
router.get("/daily-reports/date/:date", getReportByDate);

// Get report by project and date
router.get(
  "/project/:projectName/date/:date",
  dailyReportController.getReportByDate
);

// // Save or create report (matches frontend POST /save)
// router.post("/save", dailyReportController.saveOrUpdateReport);

// // Submit report (matches frontend POST /submit with body {projectName, date})
// router.post("/submit", dailyReportController.submitReport);

module.exports = router;
