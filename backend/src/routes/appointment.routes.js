const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  getDoctorSlots,
  createDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment
} = require('../controllers/appointment.controller');
const { authenticate, hasRole } = require('../middlewares/auth.middleware');

// Public route - get available slots for a date
router.get('/slots/available', getAvailableSlots);

// Patient routes
router.post('/book', authenticate, hasRole('PATIENT'), bookAppointment);
router.get('/patient/appointments', authenticate, hasRole('PATIENT'), getPatientAppointments);

// Doctor routes - manage availability slots
router.get('/doctor/slots', authenticate, hasRole('DOCTOR'), getDoctorSlots);
router.post('/doctor/slots', authenticate, hasRole('DOCTOR'), createDoctorSlot);
router.put('/doctor/slots/:slotId', authenticate, hasRole('DOCTOR'), updateDoctorSlot);
router.delete('/doctor/slots/:slotId', authenticate, hasRole('DOCTOR'), deleteDoctorSlot);
router.get('/doctor/appointments', authenticate, hasRole('DOCTOR'), getDoctorAppointments);

// Common routes - cancel appointment
router.put('/cancel/:appointmentId', authenticate, cancelAppointment);

module.exports = router;
