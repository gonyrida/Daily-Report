const mongoose = require("mongoose");
const { MONGODB_URI } = require("../config/env");
const { getAllReports, createReport } = require("../models/dailyReportModel");

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
      title: "Test Report",
      content: "This is a test report content",
      date: new Date(),
    };

    // Create a report
    const createdReport = await createReport(testReport);
    expect(createdReport.title).toBe(testReport.title);
    expect(createdReport.content).toBe(testReport.content);

    // Retrieve all reports
    const reports = await getAllReports();
    expect(reports.length).toBe(1);
    expect(reports[0].title).toBe(testReport.title);
  });
});
