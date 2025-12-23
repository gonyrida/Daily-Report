const DailyReport = require("../models/dailyReportModel.js");

/**
 * Get all reports
 */
const getAllReports = async () => {
  return await DailyReport.find().sort({ reportDate: -1 });
};

/**
 * Get a single report by projectName + date
 */
const getReportByDate = async (projectName, reportDate) => {
  return await DailyReport.findOne({ projectName, reportDate });
};

/**
 * Save or update a report
 * If a report exists for the same project + date, update it
 * Otherwise, create a new report
 */
const saveOrUpdateReport = async (reportData) => {
  const { projectName, reportDate } = reportData;

  if (!projectName || !reportDate) {
    throw new Error("projectName and reportDate are required");
  }

  // Ensure reportDate is a Date object
  const date = new Date(reportDate);

  let report = await DailyReport.findOne({ projectName, reportDate: date });

  if (report) {
    // Update existing report
    report.set(reportData);
    await report.save();
  } else {
    // Create new report
    report = new DailyReport({ ...reportData, reportDate: date });
    await report.save();
  }

  return report;
};

/**
 * Submit a report
 * Marks the report as 'submitted'
 */
const submitDailyReport = async (projectName, reportDate) => {
  if (!projectName || !reportDate) {
    throw new Error("projectName and reportDate are required");
  }

  const report = await DailyReport.findOneAndUpdate(
    { projectName, reportDate },
    { status: "submitted" },
    { new: true } // return the updated document
  );

  return report; // may be null if report not found
};

/**
 * Create a new report (optional)
 */
const createReport = async (reportData) => {
  const report = new DailyReport(reportData);
  return await report.save();
};

module.exports = {
  getAllReports,
  getReportByDate,
  saveOrUpdateReport,
  submitDailyReport,
  createReport,
};
