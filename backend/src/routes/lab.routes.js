const express = require("express");
const router = express.Router();
const { authenticate, hasRole } = require("../middlewares/auth.middleware");
const { getPatientLabOrders } = require("../controllers/lab.controller");

// Patient routes (requires authentication)
router.get("/patient/lab-orders", authenticate, hasRole('PATIENT'), getPatientLabOrders);

module.exports = router;
