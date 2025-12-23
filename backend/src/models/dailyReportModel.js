const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    description: { type: String, required: true }, // Changed from 'name'
    unit: { type: String, default: "" },
    name: { type: String, required: true },
    prev: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
  },
  { _id: false }
);

const dailyReportSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

module.exports = DailyReport;
