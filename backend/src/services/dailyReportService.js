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
  // Create date range for the entire day
  const inputDate = new Date(reportDate);
  const startOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    23,
    59,
    59,
    999
  );

  console.log("Searching for report with:", {
    projectName,
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  const report = await DailyReport.findOne({
    projectName,
    reportDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  console.log("Found report:", report ? "YES" : "NO");
  return report;
};

/**
 * Get a report by date only (no projectName required)
 * Used when loading report for a specific date
 */
const getReportByDateOnly = async (reportDate) => {
  // Create date range for the entire day
  const inputDate = new Date(reportDate);
  const startOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    23,
    59,
    59,
    999
  );

  console.log("Searching for any report on date:", {
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  const report = await DailyReport.findOne({
    reportDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({ createdAt: -1 });

  console.log("Found report:", report ? "YES" : "NO");
  return report;
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
  const inputDate = new Date(reportDate);
  const startOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    23,
    59,
    59,
    999
  );

  console.log("Saving/Updating report for:", {
    projectName,
    date: inputDate.toISOString(),
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  let report = await DailyReport.findOne({
    projectName,
    reportDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (report) {
    // Update existing report
    console.log("Updating existing report:", report._id);
    report.set(reportData);
    report.reportDate = inputDate;
    await report.save();
  } else {
    // Create new report with status 'draft'
    console.log("Creating new report");
    report = new DailyReport({
      ...reportData,
      reportDate: inputDate,
      status: "draft",
    });
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

  // Create date range for the entire day
  const inputDate = new Date(reportDate);
  const startOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    23,
    59,
    59,
    999
  );

  console.log("Submitting report for:", {
    projectName,
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  const report = await DailyReport.findOneAndUpdate(
    {
      projectName,
      reportDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    },
    {
      status: "submitted",
      submittedAt: new Date(),
    },
    { new: true }
  );

  console.log("Submit result:", report ? "SUCCESS" : "NOT FOUND");
  return report;
};

/**
 * Create a new report (optional)
 */
const createReport = async (reportData) => {
  const report = new DailyReport({
    ...reportData,
    status: "draft",
  });
  return await report.save();
};

module.exports = {
  getAllReports,
  getReportByDate,
  getReportByDateOnly,
  saveOrUpdateReport,
  submitDailyReport,
  createReport,
};
