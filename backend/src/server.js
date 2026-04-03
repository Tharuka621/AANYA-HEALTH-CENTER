require("dotenv").config();
const app = require("./app");
const { testDbConnection } = require("./config/db");
const { ensureReportsSchema } = require("./config/reporting");
const { startReminderJob } = require("./jobs/appointmentReminder");

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

testDbConnection();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDbConnection();
    console.log("✅ MySQL connected successfully");
    await ensureReportsSchema();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);

      // Start the appointment reminder scheduler
      startReminderJob();
    });
  } catch (err) {
    console.error("❌ Database connection failed (full error):", err);
    process.exit(1);
  }
}

startServer();
