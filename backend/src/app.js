const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes"); // <-- make sure file name matches

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes); // ✅ THIS MUST BE HERE

app.get("/", (req, res) => res.send("Aanya backend is running ✅"));

module.exports = app;

