const express = require("express");
const router = express.Router();

const { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus,
  getUserById,
  deleteUser,
  getDashboardStats,
  getAllAppointments,
  getAllLabTests,
  getAllPrescriptions,
  getInventory,
  createMedicine,
  getInvoices,
  getInvoiceItems,
  recordInvoicePayment,
} = require("../controllers/user.controller");

const { authenticate, isAdmin } = require("../middlewares/auth.middleware");

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// User management routes
router.get('/dashboard-stats', getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", toggleUserStatus);
router.delete("/users/:userId", deleteUser);

// Admin data routes
router.get('/appointments', getAllAppointments);
router.get('/lab-tests', getAllLabTests);
router.get('/prescriptions', getAllPrescriptions);
router.get('/pharmacy/inventory', getInventory);
router.post('/pharmacy/medicines', createMedicine);
router.get('/billing/invoices', getInvoices);
router.get('/billing/invoices/:invoiceId/items', getInvoiceItems);
router.post('/billing/invoices/:invoiceId/pay', recordInvoicePayment);

module.exports = router;
