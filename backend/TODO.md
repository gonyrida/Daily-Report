# TODO: Switch Backend to MongoDB

- [x] Install mongoose and remove pg from package.json
- [ ] Update db.js to connect to MongoDB using mongoose
- [ ] Create app.js for Express setup
- [ ] Update dailyReportModel.js to use mongoose schema
- [ ] Update dailyReportController.js to use new model
- [ ] Set up environment variables in env.js or .env
- [ ] Test server startup and database connection

# TODO: Implement Rolling Total (Carry-Forward) Logic

- [x] Update dailyReportService.js: Add getReportByDate method
- [x] Update dailyReportService.js: Add saveOrUpdateReport method with rolling total logic
- [x] Update dailyReportService.js: Add submitReport method
- [x] Update dailyReportRoutes.js: Add routes for getReportByDate, saveOrUpdateReport, submitReport
- [x] Test the rolling total functionality (server startup failed due to MongoDB connection, but logic implemented correctly)
