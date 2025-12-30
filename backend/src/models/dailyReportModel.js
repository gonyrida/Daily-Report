const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    unit: { type: String, default: "" },
    prev: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    // REMOVED: name field (you already have description)
  },
  { _id: false }
);

const dailyReportSchema = new mongoose.Schema(
  {
    // 1. ADD THE USER REFERENCE
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },

    weather: {
      type: String,
      required: true,
    },

    weatherPeriod: {
      type: String,
      enum: ["AM", "PM"],
      required: true,
    },

    temperature: {
      type: String,
      default: "",
    },

    activityToday: {
      type: String,
      required: true,
    },

    workPlanNextDay: {
      type: String,
      default: "",
    },

    managementTeam: [ResourceSchema],
    workingTeam: [ResourceSchema],
    materials: [ResourceSchema],
    machinery: [ResourceSchema],

    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },

    submittedAt: {
      type: Date,
      default: null,
    }, // ← ADD THIS
  },
  {
    timestamps: true,
  }
);

// 2. THE SCALABILITY FIX: Update the index to include the User
// This makes the combination of User + Date + Project unique.
dailyReportSchema.index({ user: 1, reportDate: 1, projectName: 1 }, { unique: true });

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

module.exports = DailyReport;
