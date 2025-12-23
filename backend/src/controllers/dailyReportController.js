const dailyReportService = require("../services/dailyReportService");

// Get all reports
const getDailyReports = async (req, res) => {
  try {
    const reports = await dailyReportService.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new report
const createDailyReport = async (req, res) => {
  try {
    const report = await dailyReportService.createReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get report by project + date
const getReportByDate = async (req, res) => {
  try {
    const { projectName, date } = req.params;
    const report = await dailyReportService.getReportByDate(
      projectName,
      new Date(date)
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save or update report
const saveOrUpdateReport = async (req, res) => {
  try {
    const reportData = req.body;

    // Ensure reportDate is a Date
    if (!reportData.reportDate) {
      return res.status(400).json({ message: "reportDate is required" });
    }
    reportData.reportDate = new Date(reportData.reportDate);

    const report = await dailyReportService.saveOrUpdateReport(reportData);
    res.status(200).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Submit report
const submitReport = async (req, res) => {
  try {
    const { projectName, date } = req.query;
    if (!projectName || !date) {
      return res
        .status(400)
        .json({ message: "projectName and date are required" });
    }

    const report = await dailyReportService.submitDailyReport(
      projectName,
      new Date(date)
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
    console.log("Report submitted successfully", report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDailyReports,
  createDailyReport,
  getReportByDate,
  saveOrUpdateReport,
  submitReport,
};
