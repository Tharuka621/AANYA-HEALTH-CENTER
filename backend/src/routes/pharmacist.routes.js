const express = require('express');
const router = express.Router();
const { authenticate, hasRole } = require('../middlewares/auth.middleware');
const pharmacistController = require('../controllers/pharmacist.controller');

// All routes require authentication and "pharmacist" role
router.use(authenticate, hasRole('pharmacist', 'PHARMACIST'));

// Prescriptions
router.get('/prescriptions/pending', pharmacistController.getPendingPrescriptions);
router.post('/prescriptions/:id/dispense', pharmacistController.dispensePrescription);

// Inventory
router.get('/inventory', pharmacistController.getInventory);

// Invoices & Payments
router.get('/invoices', pharmacistController.getInvoices);
router.post('/invoices/:id/pay', pharmacistController.recordPayment);

module.exports = router;
