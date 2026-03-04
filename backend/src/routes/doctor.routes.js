const express = require('express');
const router = express.Router();
const {
    getDoctorQueue,
    getTodayQueue,
    getDoctorTodaySlots,
    getDoctorStats,
    getMedicines,
    getLabTests,
    saveConsultation,
    startConsultation,
    createPrescription,
    createLabOrder,
    completeVisit,
    getPatientHistory,
} = require('../controllers/doctor.controller');
const { authenticate, hasRole } = require('../middlewares/auth.middleware');

// All doctor routes require DOCTOR role
router.use(authenticate, hasRole('DOCTOR'));

router.get('/today-queue', getTodayQueue);
router.get('/queue', getDoctorQueue);
router.get('/today-slots', getDoctorTodaySlots);
router.get('/stats', getDoctorStats);
router.get('/medicines', getMedicines);
router.get('/lab-tests', getLabTests);
router.get('/patients/:patientId/history', getPatientHistory);

router.post('/visits/:visitId/start', startConsultation);
router.post('/visits/:visitId/consultation', saveConsultation);
router.post('/visits/:visitId/prescriptions', createPrescription);
router.post('/visits/:visitId/lab-orders', createLabOrder);
router.put('/visits/:visitId/complete', completeVisit);

module.exports = router;
