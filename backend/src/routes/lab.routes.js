const express = require("express");
const router = express.Router();
const path = require("path");
const { authenticate, hasRole } = require("../middlewares/auth.middleware");
const { getPatientLabOrders, getPendingLabOrders, getCompletedLabOrders, updateOrderStatus, addLabResult } = require("../controllers/lab.controller");
const upload = require("../config/upload");

// Patient routes (requires authentication)
router.get("/patient/lab-orders", authenticate, hasRole('PATIENT'), getPatientLabOrders);

// Serve lab report PDF to authenticated patients
router.get("/reports/file/:filename", authenticate, (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(__dirname, "../../uploads/lab-reports", filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving lab report file:", err);
      res.status(404).json({ ok: false, message: "File not found" });
    }
  });
});

// Lab Technician routes
router.get("/orders/pending", authenticate, hasRole('LAB', 'LAB_TECH'), getPendingLabOrders);
router.get("/orders/completed", authenticate, hasRole('LAB', 'LAB_TECH'), getCompletedLabOrders);
router.put("/orders/:id/status", authenticate, hasRole('LAB', 'LAB_TECH'), updateOrderStatus);

// Result upload: accepts multipart/form-data with an optional "file" field (PDF)
router.post(
  "/orders/item/:itemId/result",
  authenticate,
  hasRole('LAB', 'LAB_TECH'),
  upload.single('file'),
  addLabResult
);

module.exports = router;
