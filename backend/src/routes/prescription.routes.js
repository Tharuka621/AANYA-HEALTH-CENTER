const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getPatientPrescriptions,
  getPrescriptionItems
} = require("../controllers/prescription.controller");

// Patient routes (requires authentication)
router.get("/patient/prescriptions", authenticate, getPatientPrescriptions);
router.get("/prescriptions/:id/items", authenticate, getPrescriptionItems);

module.exports = router;
