const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All profile routes require authentication (any role)
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
