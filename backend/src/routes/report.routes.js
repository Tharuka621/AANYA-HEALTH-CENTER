const express = require('express');
const router = express.Router();

const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const reportController = require('../controllers/report.controller');

router.use(authenticate);
router.use(isAdmin);

router.post('/generate', reportController.generateReport);
router.get('/saved', reportController.getSavedReports);
router.get('/:reportId', reportController.getReportPreview);
router.delete('/:reportId', reportController.deleteReport);

module.exports = router;
