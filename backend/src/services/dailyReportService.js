const DailyReport = require("../models/dailyReportModel.js");

/**
 * Get all reports - SCOPED TO USER
 */
const getAllReports = async (userId) => {
  // Fix: Only find reports where the user field matches
  return await DailyReport.find({ user: userId }).sort({ reportDate: -1 });
};

/**
 * Get a single report by projectName + date + user
 */
const getReportByDate = async (projectName, reportDate, userId) => {
  // Create date range for the entire day (Your Timezone Fix stays!)
  const inputDate = new Date(reportDate);

  const startOfDay = new Date(Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate(),
    0, 0, 0, 0
  ));

  const endOfDay = new Date(Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate(),
    23, 59, 59, 999
  ));

  // FIX: Include userId in the query so User B can't find User A's data
  const report = await DailyReport.findOne({
    user: userId, // <--- THE LEAK PLUG
    projectName,
    reportDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  console.log(`Found report for user ${userId}:`, report ? "YES" : "NO");
  return report;
};

/**
 * Get a report by date only (Scoped to User)
 * Used when loading report for a specific date
 */
const getReportByDateOnly = async (reportDate, userId) => { // Added userId
  // Create date range for the entire day (Your Timezone Fix stays!)
  const inputDate = new Date(reportDate);

  const startOfDay = new Date(Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate(),
    0, 0, 0, 0
  ));

  const endOfDay = new Date(Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate(),
    23, 59, 59, 999
  ));

  console.log(`Searching for user ${userId}'s report on date:`, {
    startOfDay: startOfDay.toISOString(),
  });

  // FIX: Added 'user: userId' to the filter
  const report = await DailyReport.findOne({
    user: userId,
    reportDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({ createdAt: -1 });

  console.log("Found report:", report ? "YES" : "NO");
  return report;
};

/**
 * Save or update a report (Scoped to User)
 * If a report exists for the same project + date + user, update it
 */
const saveOrUpdateReport = async (reportData) => {
  // 1. Extract 'user' from reportData (passed from controller)
  const { projectName, reportDate, user } = reportData; 
  const inputDate = new Date(reportDate);

  // Set search window strictly in UTC (Timezone proofing)
  const startOfDay = new Date(inputDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(inputDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // 2. FIX: Include 'user' in the search so we don't overwrite others
  let report = await DailyReport.findOne({
    user, // <--- The Leak Plug
    projectName,
    reportDate: { $gte: startOfDay, $lte: endOfDay },
  });

  if (report) {
    report.set(reportData);
    report.reportDate = inputDate; 
    await report.save();
  } else {
    // 3. Ensure the new report is tied to the correct user
    report = new DailyReport({ 
      ...reportData, 
      reportDate: inputDate, 
      status: "draft" 
    });
    await report.save();
  }
  return report;
};

/**
 * Submit a report (Scoped to User)
 * Marks the report as 'submitted'
 */
const submitDailyReport = async (projectName, reportDate, userId) => { // Added userId
  // DEBUG 4: Scoped log
  console.log(`DEBUG BACKEND SERVICE: Submitting for User ${userId} ->`, { 
    projectName, 
    reportDate: reportDate.toISOString() 
  });

  // FIX: Include 'user: userId' in the filter AND the update
  const report = await DailyReport.findOneAndUpdate(
    { 
      projectName, 
      reportDate, 
      user: userId // <--- Prevents submitting someone else's report
    }, 
    { 
      $set: {
        status: 'submitted', 
        submittedAt: new Date(),
        user: userId // <--- Ensures user ID is set if this is an upsert
      }
    },
    { 
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
  
  return report;
};

/**
 * Create a new report with rolling totals (Scoped to User)
 */
const createReport = async (reportData) => {
  // 1. Extract 'user' from reportData (passed from controller)
  const { projectName, reportDate, user } = reportData;

  if (!projectName || !reportDate || !user) {
    throw new Error("projectName, reportDate, and user are required");
  }

  // Your excellent UTC normalization (Keep this!)
  const d = new Date(reportDate);
  const normalizedDate = new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0
  ));
  
  reportData.reportDate = normalizedDate;

  // 2. THE CRITICAL FIX: Fetch the previous report ONLY for this user
  // Without 'user', User B inherits User A's data totals!
  const previousReport = await DailyReport.findOne({ 
    projectName, 
    user 
  }).sort({ reportDate: -1 });

  // Helper remains the same (it just processes the data found)
  const calculateRollingTotals = (newItems, previousItems = []) => {
    return newItems.map((item) => {
      const prevItem = previousItems.find(
        (p) => p.description === item.description
      );
      const prevAccum = prevItem?.accumulated || 0;
      const today = Number(item.today) || 0;
      return {
        ...item,
        prev: prevAccum,
        accumulated: prevAccum + today,
      };
    });
  };

  // Process all arrays (Management, Working Team, Materials, Machinery)
  const managementTeam = calculateRollingTotals(reportData.managementTeam || [], previousReport?.managementTeam || []);
  const workingTeam = calculateRollingTotals(reportData.workingTeam || [], previousReport?.workingTeam || []);
  const materials = calculateRollingTotals(reportData.materials || [], previousReport?.materials || []);
  const machinery = calculateRollingTotals(reportData.machinery || [], previousReport?.machinery || []);

  // 3. Create the new report tied to the correct user
  const report = new DailyReport({
    ...reportData,
    managementTeam,
    workingTeam,
    materials,
    machinery,
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
