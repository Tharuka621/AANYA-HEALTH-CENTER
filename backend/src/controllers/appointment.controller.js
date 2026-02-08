const { pool } = require('../config/db');

// Get available slots for a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const query = `
      SELECT 
        ds.id,
        ds.doctor_id,
        ds.slot_date,
        ds.start_time,
        ds.end_time,
        ds.max_appointments,
        ds.is_active,
        u.full_name as doctor_name,
        u.email as doctor_email,
        COALESCE(COUNT(a.id), 0) as booked_count,
        (ds.max_appointments - COALESCE(COUNT(a.id), 0)) as available_slots
      FROM doctor_slots ds
      INNER JOIN users u ON ds.doctor_id = u.id
      LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
      WHERE ds.slot_date = ? AND ds.is_active = 1
      GROUP BY ds.id
      HAVING available_slots > 0
      ORDER BY ds.start_time ASC
    `;

    console.log('Fetching slots for date:', date);
    const [slots] = await pool.query(query, [date]);
    console.log('Found slots:', slots.length);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get doctor's available slots
const getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log('Fetching slots for doctor_id:', doctorId);

    const query = `
      SELECT 
        id,
        doctor_id,
        slot_date,
        start_time,
        end_time,
        max_appointments,
        is_active
      FROM doctor_slots
      WHERE doctor_id = ?
      ORDER BY slot_date DESC, start_time ASC
    `;

    const [slots] = await pool.query(query, [doctorId]);
    console.log('Found slots:', slots.length);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching doctor slots:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new doctor slot
const createDoctorSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slot_date, start_time, end_time, max_appointments, is_active } = req.body;

    console.log('Creating slot for doctor:', doctorId);
    console.log('Slot data:', { slot_date, start_time, end_time, max_appointments, is_active });

    if (!slot_date || !start_time || !end_time || !max_appointments) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
      INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, max_appointments, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      doctorId,
      slot_date,
      start_time,
      end_time,
      max_appointments,
      is_active !== undefined ? is_active : 1
    ]);

    console.log('Slot created successfully with ID:', result.insertId);
    res.status(201).json({
      message: 'Slot created successfully',
      slotId: result.insertId
    });
  } catch (error) {
    console.error('Error creating doctor slot:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a doctor slot
const updateDoctorSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slotId } = req.params;
    const { slot_date, start_time, end_time, max_appointments, is_active } = req.body;

    const query = `
      UPDATE doctor_slots
      SET slot_date = ?, start_time = ?, end_time = ?, max_appointments = ?, is_active = ?
      WHERE id = ? AND doctor_id = ?
    `;

    const [result] = await pool.query(query, [
      slot_date,
      start_time,
      end_time,
      max_appointments,
      is_active,
      slotId,
      doctorId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Slot not found or unauthorized' });
    }

    res.json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Error updating doctor slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a doctor slot
const deleteDoctorSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slotId } = req.params;

    // Check if there are any appointments for this slot
    const [appointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE slot_id = ? AND status != "cancelled"',
      [slotId]
    );

    if (appointments[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete slot with active appointments. Please cancel appointments first.' 
      });
    }

    const query = 'DELETE FROM doctor_slots WHERE id = ? AND doctor_id = ?';
    const [result] = await pool.query(query, [slotId, doctorId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Slot not found or unauthorized' });
    }

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor slot:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book an appointment (for patients)
const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { slot_id, doctor_id, reason } = req.body;

    if (!slot_id || !doctor_id) {
      return res.status(400).json({ message: 'Slot ID and Doctor ID are required' });
    }

    // Check if slot is available
    const [slot] = await pool.query(
      `SELECT 
        ds.*,
        COUNT(a.id) as booked_count
      FROM doctor_slots ds
      LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
      WHERE ds.id = ? AND ds.is_active = 1
      GROUP BY ds.id`,
      [slot_id]
    );

    if (slot.length === 0) {
      return res.status(404).json({ message: 'Slot not found or inactive' });
    }

    if (slot[0].booked_count >= slot[0].max_appointments) {
      return res.status(400).json({ message: 'Slot is fully booked' });
    }

    // Check if patient already has an appointment for this slot
    const [existingAppointment] = await pool.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND slot_id = ? AND status != "cancelled"',
      [patientId, slot_id]
    );

    if (existingAppointment.length > 0) {
      return res.status(400).json({ message: 'You already have an appointment for this slot' });
    }

    // Book the appointment
    const query = `
      INSERT INTO appointments (patient_id, doctor_id, slot_id, reason, status, booked_by)
      VALUES (?, ?, ?, ?, 'scheduled', ?)
    `;

    const [result] = await pool.query(query, [
      patientId,
      doctor_id,
      slot_id,
      reason || '',
      patientId
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: result.insertId,
      appointmentNumber: `APT${String(result.insertId).padStart(6, '0')}`
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get patient's appointments
const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const query = `
      SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.slot_id,
        a.reason,
        a.status,
        a.created_at,
        u.full_name as doctor_name,
        u.email as doctor_email,
        ds.slot_date,
        ds.start_time,
        ds.end_time
      FROM appointments a
      INNER JOIN users u ON a.doctor_id = u.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      WHERE a.patient_id = ?
      ORDER BY ds.slot_date DESC, ds.start_time DESC
    `;

    const [appointments] = await pool.query(query, [patientId]);
    
    // Add appointment number to each appointment
    const appointmentsWithNumber = appointments.map(apt => ({
      ...apt,
      appointmentNumber: `APT${String(apt.id).padStart(6, '0')}`
    }));

    res.json(appointmentsWithNumber);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const query = `
      SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.slot_id,
        a.reason,
        a.status,
        a.created_at,
        u.full_name as patient_name,
        u.email as patient_email,
        ds.slot_date,
        ds.start_time,
        ds.end_time
      FROM appointments a
      INNER JOIN users u ON a.patient_id = u.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      WHERE a.doctor_id = ?
      ORDER BY ds.slot_date DESC, ds.start_time DESC
    `;

    const [appointments] = await pool.query(query, [doctorId]);
    
    // Add appointment number to each appointment
    const appointmentsWithNumber = appointments.map(apt => ({
      ...apt,
      appointmentNumber: `APT${String(apt.id).padStart(6, '0')}`
    }));

    res.json(appointmentsWithNumber);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment fee
const getAppointmentFee = async (req, res) => {
  try {
    const query = `
      SELECT amount 
      FROM appointment_fees 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const [fees] = await pool.query(query);
    
    if (fees.length === 0) {
      // Default fee if not set in database
      return res.json({ amount: 2500 });
    }
    
    res.json({ amount: fees[0].amount });
  } catch (error) {
    console.error('Error fetching appointment fee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book an appointment with payment (for patients)
const bookAppointmentWithPayment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const patientId = req.user.id;
    const { slot_id, doctor_id, reason, payment_method, payment_ref, amount } = req.body;

    console.log('Booking appointment for patient:', patientId);
    console.log('Booking data:', { slot_id, doctor_id, reason, payment_method, amount });

    if (!slot_id || !doctor_id || !payment_method || !amount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Slot ID, Doctor ID, Payment Method, and Amount are required' });
    }

    // 1. Check if slot is available
    const [slot] = await connection.query(
      `SELECT 
        ds.*,
        COUNT(a.id) as booked_count
      FROM doctor_slots ds
      LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
      WHERE ds.id = ? AND ds.is_active = 1
      GROUP BY ds.id`,
      [slot_id]
    );

    if (slot.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Slot not found or inactive' });
    }

    if (slot[0].booked_count >= slot[0].max_appointments) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Slot is fully booked' });
    }

    // 2. Check if patient already has an appointment for this slot
    const [existingAppointment] = await connection.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND slot_id = ? AND status != "cancelled"',
      [patientId, slot_id]
    );

    if (existingAppointment.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'You already have an appointment for this slot' });
    }

    // 3. Create appointment record
    const appointmentQuery = `
      INSERT INTO appointments (appointment_no, patient_id, doctor_id, slot_id, reason, status, booked_by)
      VALUES (?, ?, ?, ?, ?, 'scheduled', 'PATIENT')
    `;

    // Generate unique appointment number
    const appointmentNo = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [appointmentResult] = await connection.query(appointmentQuery, [
      appointmentNo,
      patientId,
      doctor_id,
      slot_id,
      reason || ''
    ]);

    const appointmentId = appointmentResult.insertId;
    console.log('Appointment created with ID:', appointmentId);

    // 4. Create payment record
    const paymentQuery = `
      INSERT INTO appointments_payments (appointment_id, amount, method, status, payment_ref, paid_at)
      VALUES (?, ?, ?, 'completed', ?, NOW())
    `;

    await connection.query(paymentQuery, [
      appointmentId,
      amount,
      payment_method,
      payment_ref || `PAY${Date.now()}`
    ]);

    console.log('Payment record created for appointment:', appointmentId);

    // 5. Commit transaction
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: appointmentId,
      appointmentNumber: appointmentNo,
      paymentStatus: 'completed'
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error booking appointment:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;

    const query = `
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ? AND (patient_id = ? OR doctor_id = ?)
    `;

    const [result] = await pool.query(query, [appointmentId, userId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found or unauthorized' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  getDoctorSlots,
  createDoctorSlot,
  updateDoctorSlot,
  deleteDoctorSlot,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getAppointmentFee,
  bookAppointmentWithPayment
};
