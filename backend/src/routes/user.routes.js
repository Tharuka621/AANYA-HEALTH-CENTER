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
  getLabTestCatalog,
  updateLabTestCatalog,
  createLabTest,
  deleteLabTest,
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
router.get('/lab-tests/catalog', getLabTestCatalog);
router.post('/lab-tests/catalog', createLabTest);
router.put('/lab-tests/catalog/:id', updateLabTestCatalog);
router.delete('/lab-tests/catalog/:id', deleteLabTest);
router.get('/prescriptions', getAllPrescriptions);
router.get('/pharmacy/inventory', getInventory);
router.post('/pharmacy/medicines', createMedicine);
router.get('/billing/invoices', getInvoices);
router.get('/billing/invoices/:invoiceId/items', getInvoiceItems);
router.post('/billing/invoices/:invoiceId/pay', recordInvoicePayment);

module.exports = router;
