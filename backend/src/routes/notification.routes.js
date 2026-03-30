const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All notification routes require authentication
router.use(authenticate);

// Get role-specific notifications for the current user
router.get('/', getNotifications);

module.exports = router;
