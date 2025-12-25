const mongoose = require("mongoose");
const { MONGODB_URI } = require("../config/env");
const {
  getAllReports,
  createReport,
} = require("../services/dailyReportService");

describe("Database Tests", () => {
  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    // Close the connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await mongoose.connection.db.dropDatabase();
  });

  test("should connect to MongoDB", async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  test("should create and retrieve a daily report", async () => {
    const testReport = {
      projectName: "Test Project",
      reportDate: new Date(),
      weather: "Sunny",
      weatherPeriod: "AM",
      temperature: "25°C",
      activityToday: "Test activity",
      workPlanNextDay: "Next day work plan",
      managementTeam: [],
      workingTeam: [],
      materials: [],
      machinery: [],
      status: "draft",
    };

    // Create a report
    const createdReport = await createReport(testReport);
    expect(createdReport.projectName).toBe(testReport.projectName);
    expect(createdReport.activityToday).toBe(testReport.activityToday);

    // Retrieve all reports
    const reports = await getAllReports();
    expect(reports.length).toBe(1);
    expect(reports[0].projectName).toBe(testReport.projectName);
  });
});
