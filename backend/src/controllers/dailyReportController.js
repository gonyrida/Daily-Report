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
    const { date, projectName } = req.params;
    const userId = req.user.userId; 
    const datePart = new Date(date).toISOString().split('T')[0];
    const normalizedDate = new Date(`${datePart}T00:00:00.000Z`);

    // 1. Try to find the existing report
    const report = await dailyReportService.getReportByDate(projectName, normalizedDate, userId);

    // 2. ALWAYS fetch the history map, even if the report doesn't exist yet!
    // This allows the Frontend to show "Previous: 500" for a new day.
    const history = await dailyReportService.getAccumulatedTotals(userId, projectName, normalizedDate);

    // 3. Return a package instead of just the report
    res.json({
      report: report || null, // No more 404! Just return null if empty
      historyMap: history     // e.g., { "Cement": 500, "Worker": 10 }
    });
  } catch (error) {
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
