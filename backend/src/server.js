require("dotenv").config();
const app = require("./app");
const { testDbConnection } = require("./config/db");
testDbConnection();
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDbConnection();
    console.log("✅ MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed (full error):", err);
    process.exit(1);
  }
}

startServer();
