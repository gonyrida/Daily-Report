// backend\src\services\dailyReportService.js
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
  const { projectName, reportDate, user } = reportData;
  const d = new Date(reportDate);
  const normalizedDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

  // 1. Get the "Historical Truth" (Same logic we used in createReport)
  const history = await DailyReport.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(user), 
        projectName, 
        reportDate: { $lt: normalizedDate } 
      } 
    },
    {
      $facet: {
        materials: [
          { $unwind: "$materials" },
          { $group: { _id: "$materials.description", total: { $sum: "$materials.today" } } }
        ],
        machinery: [
          { $unwind: "$machinery" },
          { $group: { _id: "$machinery.description", total: { $sum: "$machinery.today" } } }
        ],
        workingTeam: [
          { $unwind: "$workingTeam" },
          { $group: { _id: "$workingTeam.description", total: { $sum: "$workingTeam.today" } } }
        ],
        managementTeam: [
          { $unwind: "$managementTeam" },
          { $group: { _id: "$managementTeam.description", total: { $sum: "$managementTeam.today" } } }
        ]
      }
    }
  ]);

  // This creates 4 clean maps for your frontend
  const formatMap = (arr) => arr.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.total }), {});

  const historyMaps = {
    materials: formatMap(history[0].materials),
    machinery: formatMap(history[0].machinery),
    workingTeam: formatMap(history[0].workingTeam),
    managementTeam: formatMap(history[0].managementTeam),
  };

  const processArray = (items = []) => items.map(item => {
    const prev = historyMap[item.description] || 0;
    const today = Number(item.today) || 0;
    return { ...item, prev, accumulated: prev + today };
  });

  // 2. Find existing or create new
  let report = await DailyReport.findOne({
    user,
    projectName,
    reportDate: { 
      $gte: new Date(normalizedDate).setUTCHours(0,0,0,0), 
      $lte: new Date(normalizedDate).setUTCHours(23,59,59,999) 
    },
  });

  const updatedData = {
    ...reportData,
    reportDate: normalizedDate,
    managementTeam: processArray(reportData.managementTeam),
    workingTeam: processArray(reportData.workingTeam),
    materials: processArray(reportData.materials),
    machinery: processArray(reportArray.machinery),
  };

  if (report) {
    report.set(updatedData);
  } else {
    report = new DailyReport({ ...updatedData, status: "draft" });
  }

  return await report.save();
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
  const { projectName, reportDate, user } = reportData;
  const d = new Date(reportDate);
  const normalizedDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

  // 1. THE MATH ENGINE: Calculate the ACTUAL sum of history for this user
  const history = await DailyReport.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(user), 
        projectName, 
        reportDate: { $lt: normalizedDate } 
      } 
    },
    {
      $facet: {
        materials: [
          { $unwind: "$materials" },
          { $group: { _id: "$materials.description", total: { $sum: "$materials.today" } } }
        ],
        machinery: [
          { $unwind: "$machinery" },
          { $group: { _id: "$machinery.description", total: { $sum: "$machinery.today" } } }
        ],
        workingTeam: [
          { $unwind: "$workingTeam" },
          { $group: { _id: "$workingTeam.description", total: { $sum: "$workingTeam.today" } } }
        ],
        managementTeam: [
          { $unwind: "$managementTeam" },
          { $group: { _id: "$managementTeam.description", total: { $sum: "$managementTeam.today" } } }
        ]
      }
    }
  ]);

  // This creates 4 clean maps for your frontend
  const formatMap = (arr) => arr.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.total }), {});

  const historyMaps = {
    materials: formatMap(history[0].materials),
    machinery: formatMap(history[0].machinery),
    workingTeam: formatMap(history[0].workingTeam),
    managementTeam: formatMap(history[0].managementTeam),
  };

  // 2. APPLY TOTALS: Use the historyMap to ensure today's 'prev' is always correct
  const processArray = (items = []) => items.map(item => {
    const prev = historyMap[item.description] || 0;
    const today = Number(item.today) || 0;
    return { ...item, prev, accumulated: prev + today };
  });

  const report = new DailyReport({
    ...reportData,
    reportDate: normalizedDate,
    managementTeam: processArray(reportData.managementTeam),
    workingTeam: processArray(reportData.workingTeam),
    materials: processArray(reportData.materials),
    machinery: processArray(reportData.machinery),
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
