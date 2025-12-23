const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dailyReportRoutes = require("./routes/dailyReportRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/daily-reports", dailyReportRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
// Error handling middleware
app.use(require("./middleware/errorHandler"));
app.use(cors());

module.exports = app;
