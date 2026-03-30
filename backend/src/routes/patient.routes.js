const express = require('express');
const router = express.Router();

const { getMyProfile, updateMyProfile } = require('../controllers/patient.controller');
const { authenticate, hasRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.use(hasRole('PATIENT'));

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

module.exports = router;
