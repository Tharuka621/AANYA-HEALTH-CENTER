const express = require("express");
const router = express.Router();
const { authenticate, hasRole } = require("../middlewares/auth.middleware");
const { getPatientLabOrders, getPendingLabOrders, getCompletedLabOrders, updateOrderStatus, addLabResult } = require("../controllers/lab.controller");

// Patient routes (requires authentication)
router.get("/patient/lab-orders", authenticate, hasRole('PATIENT'), getPatientLabOrders);

// Lab Technician routes
router.get("/orders/pending", authenticate, hasRole('LAB', 'LAB_TECH'), getPendingLabOrders);
router.get("/orders/completed", authenticate, hasRole('LAB', 'LAB_TECH'), getCompletedLabOrders);
router.put("/orders/:id/status", authenticate, hasRole('LAB', 'LAB_TECH'), updateOrderStatus);
router.post("/orders/item/:itemId/result", authenticate, hasRole('LAB', 'LAB_TECH'), addLabResult);

module.exports = router;
