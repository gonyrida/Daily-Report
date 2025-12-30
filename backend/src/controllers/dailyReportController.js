const dailyReportService = require("../services/dailyReportService");

// Get all reports - SCOPED
const getDailyReports = async (req, res) => {
  try {
    const userId = req.user.userId; // Matches your decoded token property
    const reports = await dailyReportService.getAllReports(userId); // <--- Pass it
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new report - SCOPED
const createDailyReport = async (req, res) => {
  try {
    // Add the authenticated userId to the body before sending to service
    const reportData = { 
      ...req.body, 
      user: req.user.id // <--- ADD THIS: Attach the owner
    };
    
    const report = await dailyReportService.createReport(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReportByDate = async (req, res) => {
  try {
    // 1. Extract what's available from params
    const { date, projectName } = req.params;
    
    // 2. IMPORTANT: Use userId from the token (aligned with your middleware)
    const userId = req.user.userId; 

    // 3. Date Normalization (ensures YYYY-MM-DD match)
    const datePart = new Date(date).toISOString().split('T')[0];
    const normalizedDate = new Date(`${datePart}T00:00:00.000Z`);

    let report;

    if (projectName) {
      // If we have a project name, use the specific finder
      report = await dailyReportService.getReportByDate(projectName, normalizedDate, userId);
    } else {
      // If we ONLY have a date (like your frontend call), use the DateOnly finder
      // This is the "Long Run" fix for loading the last worked-on project for that day
      report = await dailyReportService.getReportByDateOnly(normalizedDate, userId);
    }

    if (!report) {
      return res.status(404).json({ message: "No report found for this date" });
    }

    res.json(report);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Save or update report
const saveOrUpdateReport = async (req, res) => {
  try {
    const reportData = req.body;
    const userId = req.user.userId; // Matches your decoded token property

    if (!reportData.reportDate) return res.status(400).json({ message: "Date required" });

    const dateOnly = new Date(reportData.reportDate).toISOString().split('T')[0];
    reportData.reportDate = new Date(`${dateOnly}T00:00:00.000Z`);
    
    // ATTACH THE OWNER TO THE DATA
    reportData.user = userId; 

    const report = await dailyReportService.saveOrUpdateReport(reportData);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit report - SECURED
const submitReport = async (req, res) => {
  console.log("DEBUG BACKEND CONTROLLER: Received Body ->", req.body);

  try {
    const { projectName, date } = req.body;
    const userId = req.user.userId; // Matches your decoded token property

    const datePart = new Date(date).toISOString().split('T')[0];
    const normalizedDate = new Date(`${datePart}T00:00:00.000Z`);

    // 2. PASS userId to the Service (to match our new service signature)
    const report = await dailyReportService.submitDailyReport(
      projectName, 
      normalizedDate, 
      userId 
    );

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Submit Error:", error);
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
