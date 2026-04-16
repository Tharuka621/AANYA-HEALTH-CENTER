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
  updatePatientAppointment,
  cancelAppointment,
  getAppointmentFee,
  bookAppointmentWithPayment,
  getReceptionistSlots,
  getSlotAppointments,
  checkInPatient,
  registerWalkIn
} = require('../controllers/appointment.controller');
const { authenticate, hasRole } = require('../middlewares/auth.middleware');

// Public route - get available slots for a date
router.get('/slots/available', getAvailableSlots);

// Get appointment fee (can be public or authenticated depending on your requirements)
router.get('/fee', getAppointmentFee);

// Patient routes
router.post('/book', authenticate, hasRole('PATIENT'), bookAppointment);
router.post('/book-with-payment', authenticate, hasRole('PATIENT'), bookAppointmentWithPayment);
router.get('/patient/appointments', authenticate, hasRole('PATIENT'), getPatientAppointments);
router.put('/patient/appointments/:appointmentId', authenticate, hasRole('PATIENT'), updatePatientAppointment);

// Doctor routes - manage availability slots
router.get('/doctor/slots', authenticate, hasRole('DOCTOR'), getDoctorSlots);
router.post('/doctor/slots', authenticate, hasRole('DOCTOR'), createDoctorSlot);
router.put('/doctor/slots/:slotId', authenticate, hasRole('DOCTOR'), updateDoctorSlot);
router.delete('/doctor/slots/:slotId', authenticate, hasRole('DOCTOR'), deleteDoctorSlot);
router.get('/doctor/appointments', authenticate, hasRole('DOCTOR'), getDoctorAppointments);

// Receptionist routes
router.get('/receptionist/slots', authenticate, hasRole('RECEPTIONIST'), getReceptionistSlots);
router.get('/receptionist/slots/:slotId/appointments', authenticate, hasRole('RECEPTIONIST'), getSlotAppointments);
router.post('/receptionist/appointments/:appointmentId/check-in', authenticate, hasRole('RECEPTIONIST'), checkInPatient);
router.post('/receptionist/register-walk-in', authenticate, hasRole('RECEPTIONIST'), registerWalkIn);

// Common routes - cancel appointment
router.put('/cancel/:appointmentId', authenticate, cancelAppointment);

module.exports = router;
