require("dotenv").config();

module.exports = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://cacpm_users:cacpm1@cacpm.edyltbr.mongodb.net/?appName=CACPM",
  PORT: process.env.PORT || 5000,
  JWT_SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};
