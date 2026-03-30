const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const doctorRoutes = require("./routes/doctor.routes");
const pharmacistRoutes = require("./routes/pharmacist.routes");
const labRoutes = require("./routes/lab.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const patientRoutes = require("./routes/patient.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files (lab report PDFs, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/pharmacist", pharmacistRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("Aanya backend is running ✅"));

module.exports = app;

