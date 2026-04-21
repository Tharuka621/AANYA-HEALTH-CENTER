const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// ============================================
// APPOINTMENT CONTROLLER
// ============================================
// Handles all appointment operations:
// - Patient booking and slot selection
// - Doctor slot management
// - Receptionist check-in and vitals
// - Walk-in patient registration
// - Appointment cancellation and updates

// ============================================
// PATIENT-FACING ENDPOINTS
// ============================================

// Get available slots for a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    // Fail fast on invalid client input instead of running DB queries.
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
// Shows doctor all their time slots for management
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
// Allows doctors to add appointment slots to their schedule
const createDoctorSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slot_date, start_time, end_time, max_appointments, is_active } = req.body;
    // max_appointments controls how many patients can book this slot

    console.log('Creating slot for doctor:', doctorId);
    console.log('Slot data:', { slot_date, start_time, end_time, max_appointments, is_active });
//Doctor slot create requires all fields
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
// Allows doctors to modify their existing slot details
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

    // If no row was updated, the slot either does not exist or is not owned by this doctor.
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
// Prevents deletion if active appointments exist
const deleteDoctorSlot = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { slotId } = req.params;

    // Validate no active appointments exist before allowing delete
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


// APPOINTMENT BOOKING


// Book an appointment (for patients)
// Patients select a doctor slot and create an appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slot_id, doctor_id, reason } = req.body;

    if (!slot_id || !doctor_id) {
      return res.status(400).json({ message: 'Slot ID and Doctor ID are required' });
    }

    // Step 1: Resolve patient ID from user ID
    const [patientRows] = await pool.query(
      'SELECT id FROM patients WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (patientRows.length === 0) {
      return res.status(400).json({ message: 'Patient profile not found. Please complete your profile.' });
    }
    const patientId = patientRows[0].id;

    // Step 2: Resolve doctor ID from user ID
    const [doctorRows] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
      [doctor_id]
    );
    if (doctorRows.length === 0) {
      return res.status(400).json({ message: 'Doctor profile not found.' });
    }
    const doctorId = doctorRows[0].id;

    // Step 3: Verify slot exists and has capacity
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

    // Step 4: Prevent double-booking - check for existing appointment
    const [existingAppointment] = await pool.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND slot_id = ? AND status != "cancelled"',
      [patientId, slot_id]
    );

    if (existingAppointment.length > 0) {
      return res.status(400).json({ message: 'You already have an appointment for this slot' });
    }

    // Step 5: Create the appointment record
    const query = `
      INSERT INTO appointments (patient_id, doctor_id, slot_id, reason, status, booked_by)
      VALUES (?, ?, ?, ?, 'scheduled', 'PATIENT')
    `;

    const [result] = await pool.query(query, [
      patientId,
      doctorId,
      slot_id,
      reason || ''
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
// Retrieves all patient appointments with queue position and timing info
const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        a.id,
        a.appointment_no,
        a.patient_id,
        a.doctor_id,
        a.slot_id,
        a.reason,
        a.status,
        a.created_at,
        u.full_name as doctor_name,
        u.email as doctor_email,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as end_time,
        ds.max_appointments,
        TIMESTAMPDIFF(MINUTE, ds.start_time, ds.end_time) as slot_duration_minutes,
        (
          SELECT COUNT(*) FROM appointments a2
          WHERE a2.slot_id = a.slot_id
            AND a2.status != 'cancelled'
            AND a2.id <= a.id
        ) as queue_position
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      WHERE p.user_id = ?
      ORDER BY ds.slot_date DESC, ds.start_time DESC
    `;

    const [appointments] = await pool.query(query, [userId]);

    // Calculate queue position and estimated arrival time
    const appointmentsWithNumber = appointments.map(apt => {
      const queuePos = apt.queue_position || 1;
      const maxApts = apt.max_appointments || 10;
      const slotDuration = apt.slot_duration_minutes || 60;
      // Minutes per patient in this slot
      const minutesPerPatient = Math.floor(slotDuration / maxApts);
      /*
       * Estimate when the patient should arrive by taking the slot start time,
       * then adding the waiting time based on their position in the queue.
       * Each patient is assumed to take an equal share of the slot duration.
       */
      let estimatedArrival = null;
      if (apt.start_time) {
        const [h, m] = apt.start_time.split(':').map(Number);
        const totalMinutes = h * 60 + m + (queuePos - 1) * minutesPerPatient;
        const arrHour = Math.floor(totalMinutes / 60) % 24;
        const arrMin = totalMinutes % 60;
        const period = arrHour >= 12 ? 'PM' : 'AM';
        const displayHour = arrHour % 12 || 12;
        estimatedArrival = `${displayHour}:${String(arrMin).padStart(2, '0')} ${period}`;
      }
      return {
        ...apt,
        appointmentNumber: apt.appointment_no || `APT${String(apt.id).padStart(6, '0')}`,
        queue_position: queuePos,
        minutes_per_patient: minutesPerPatient,
        estimated_arrival_time: estimatedArrival,
      };
    });

    res.json(appointmentsWithNumber);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get doctor's appointments
// Retrieves all scheduled appointments for doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Resolve doctor ID from user ID
    const [doctorRows] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ? LIMIT 1', [userId]
    );
    if (doctorRows.length === 0) {
       return res.status(404).json({ message: 'Doctor profile not found' });
    }
    const doctorId = doctorRows[0].id;

    const query = `
      SELECT
        a.id,
        a.appointment_no,
        a.patient_id,
        a.doctor_id,
        a.slot_id,
        a.reason,
        a.status,
        a.created_at,
        u.full_name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as end_time
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      WHERE a.doctor_id = ?
      ORDER BY ds.slot_date DESC, ds.start_time DESC
    `;

    const [appointments] = await pool.query(query, [doctorId]);

    const appointmentsWithNumber = appointments.map(apt => ({
      ...apt,
      appointmentNumber: apt.appointment_no || `APT${String(apt.id).padStart(6, '0')}`
    }));

    res.json(appointmentsWithNumber);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment fee
// Fetches current consultation fee from database
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
      // Use default fee (LKR 2500) if not configured
      return res.json({ amount: 2500 });
    }

    res.json({ amount: fees[0].amount });
  } catch (error) {
    console.error('Error fetching appointment fee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book an appointment with payment (for patients)
// Creates appointment AND payment in single transaction
// Ensures both succeed or both fail
const bookAppointmentWithPayment = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Transaction ensures appointment + payment are saved together (all-or-nothing).
    await connection.beginTransaction();

    const userId = req.user.id;
    const { slot_id, doctor_id, reason, payment_method, payment_ref, amount } = req.body;

    console.log('Booking appointment for user:', userId);
    console.log('Booking data:', { slot_id, doctor_id, reason, payment_method, amount });

    // Business-rule failures should abort the transaction and return a clear 4xx error.
    if (!slot_id || !doctor_id || !payment_method || !amount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Slot ID, Doctor ID, Payment Method, and Amount are required' });
    }

    // Step 1: Resolve patient ID
    const [patientRows] = await connection.query(
      'SELECT id FROM patients WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (patientRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Patient profile not found. Please complete signup.' });
    }
    const patientId = patientRows[0].id;

    // Step 2: Resolve doctor ID
    const [doctorRows] = await connection.query(
      'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
      [doctor_id]
    );
    if (doctorRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Doctor profile not found.' });
    }
    const doctorId = doctorRows[0].id;

    // Step 3: Verify slot availability
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

    // Step 4: Prevent double-booking
    const [existingAppointment] = await connection.query(
      'SELECT id FROM appointments WHERE patient_id = ? AND slot_id = ? AND status != "cancelled"',
      [patientId, slot_id]
    );

    if (existingAppointment.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'You already have an appointment for this slot' });
    }

    // Step 5: Create appointment record
    const appointmentQuery = `
      INSERT INTO appointments (appointment_no, patient_id, doctor_id, slot_id, reason, status, booked_by)
      VALUES (?, ?, ?, ?, ?, 'scheduled', 'PATIENT')
    `;

    // Generate unique appointment number using timestamp + random component
    const appointmentNo = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [appointmentResult] = await connection.query(appointmentQuery, [
      appointmentNo,
      patientId,
      doctorId,
      slot_id,
      reason || ''
    ]);

    const appointmentId = appointmentResult.insertId;
    console.log('Appointment created with ID:', appointmentId);

    // Step 6: Create payment record
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

    // Step 7: Commit transaction (confirms both records)
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: appointmentId,
      appointmentNumber: appointmentNo,
      paymentStatus: 'completed'
    });
  } catch (error) {
    // Roll back only if we successfully obtained a DB connection.
    if (connection) await connection.rollback();
    if (connection) connection.release();
    console.error('Error booking appointment:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update appointment reason and optionally time slot (for patients)
// Allows patients to change appointment details or reschedule
const updatePatientAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    const { reason, slot_id } = req.body;

    if (slot_id) {
      // If rescheduling, validate new slot has availability
      const [slot] = await pool.query(
        `SELECT ds.*, COUNT(a.id) as booked_count
         FROM doctor_slots ds
         LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled' AND a.id != ?
         WHERE ds.id = ? AND ds.is_active = 1
         GROUP BY ds.id`,
        [appointmentId, slot_id]
      );

      if (slot.length === 0) {
        return res.status(404).json({ message: 'Slot not found or inactive' });
      }

      if (slot[0].booked_count >= slot[0].max_appointments) {
        return res.status(400).json({ message: 'Slot is fully booked' });
      }

      // ds.doctor_id references users.id, but appointments.doctor_id references doctors.id
      const [doctorRows] = await pool.query('SELECT id FROM doctors WHERE user_id = ? LIMIT 1', [slot[0].doctor_id]);
      if (doctorRows.length === 0) {
        return res.status(400).json({ message: 'Doctor profile not found for this slot' });
      }
      const actualDoctorId = doctorRows[0].id;

      const query = `
        UPDATE appointments 
        SET reason = COALESCE(?, reason), slot_id = ?, doctor_id = ?
        WHERE id = ? AND patient_id = (SELECT id FROM patients WHERE user_id = ?)
      `;

      const [result] = await pool.query(query, [reason, slot_id, actualDoctorId, appointmentId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Appointment not found or unauthorized' });
      }
    } else {
      const query = `
        UPDATE appointments 
        SET reason = COALESCE(?, reason)
        WHERE id = ? AND patient_id = (SELECT id FROM patients WHERE user_id = ?)
      `;

      const [result] = await pool.query(query, [reason, appointmentId, userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Appointment not found or unauthorized' });
      }
    }

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel appointment
// Allows patients or doctors to cancel their appointments
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { appointmentId } = req.params;

    // Build query based on user role for access control
    let query = 'UPDATE appointments SET status = \'cancelled\' WHERE id = ?';
    let params = [appointmentId];

    if (role === 'PATIENT') {
      query += ' AND patient_id = (SELECT id FROM patients WHERE user_id = ?)';
      params.push(userId);
    } else if (role === 'DOCTOR') {
      query += ' AND doctor_id = (SELECT id FROM doctors WHERE user_id = ?)';
      params.push(userId);
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found or unauthorized' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// RECEPTIONIST ENDPOINTS
// ============================================
// Reception staff functions for managing check-ins and waiting list

// Get all slots for receptionist (with date filter)
// Shows all available slots for check-in purposes
const getReceptionistSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const query = `
      SELECT 
        ds.id,
        ds.doctor_id,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as end_time,
        ds.max_appointments,
        ds.is_active,
        u.full_name as doctor_name,
        (SELECT COUNT(*) FROM appointments a WHERE a.slot_id = ds.id AND a.status != 'cancelled') as booked_count
      FROM doctor_slots ds
      INNER JOIN users u ON ds.doctor_id = u.id
      WHERE ds.slot_date = ?
      ORDER BY ds.start_time ASC
    `;

    const [slots] = await pool.query(query, [date]);
    res.json(slots);
  } catch (error) {
    console.error('Error getting receptionist slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments for a specific slot
// Shows all appointments scheduled for a given slot
const getSlotAppointments = async (req, res) => {
  try {
    const { slotId } = req.params;
    const query = `
      SELECT 
        a.id,
        a.status,
        a.reason,
        u.full_name as patient_name,
        u.phone,
        p.nic,
        pv.temperature, pv.systolic_bp, pv.diastolic_bp, pv.pulse, pv.weight, pv.sugar_level, pv.notes as vital_notes
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN patient_vitals pv ON a.id = pv.appointment_id
      WHERE a.slot_id = ? AND a.status != 'cancelled'
    `;
    const [appointments] = await pool.query(query, [slotId]);

    // Add appointment number
    const formatted = appointments.map(apt => ({
      ...apt,
      appointment_no: `APT-${String(apt.id).padStart(6, '0')}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error getting slot appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check in patient and save vitals
// Receptionist confirms arrival, records vital signs, updates doctor queue
// Uses transaction for consistency
const checkInPatient = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { appointmentId } = req.params;
    const { vitals } = req.body;

    console.log('Checking in appointment:', appointmentId, 'Vitals:', vitals);

    // Step 1: Get appointment details
    const [apts] = await connection.query(
      'SELECT patient_id, doctor_id, slot_id FROM appointments WHERE id = ?',
      [appointmentId]
    );
    if (apts.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const { patient_id, doctor_id } = apts[0];

    // Step 2: Update appointment status to checked_in
    await connection.query(
      "UPDATE appointments SET status = 'checked_in' WHERE id = ?",
      [appointmentId]
    );

    // Step 3: Create visit record (doctor's queue reads from visits)
    const [visitResult] = await connection.query(
      `INSERT INTO visits (appointment_id, patient_id, doctor_id, check_in_time, status, checked_in_by)
       VALUES (?, ?, ?, NOW(), 'WAITING', ?)
       ON DUPLICATE KEY UPDATE check_in_time = NOW(), status = 'WAITING'`,
      [appointmentId, patient_id, doctor_id, null]
    );
    const visitId = visitResult.insertId || visitResult.insertId;

    // Step 4: Save vitals to patient_vitals
    await connection.query(
      `INSERT INTO patient_vitals
        (appointment_id, patient_id, temperature, systolic_bp, diastolic_bp, pulse, weight, sugar_level, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        temperature=VALUES(temperature), systolic_bp=VALUES(systolic_bp),
        diastolic_bp=VALUES(diastolic_bp), pulse=VALUES(pulse),
        weight=VALUES(weight), sugar_level=VALUES(sugar_level), notes=VALUES(notes)`,
      [
        appointmentId, patient_id,
        vitals?.temperature || null, vitals?.systolic_bp || null, vitals?.diastolic_bp || null,
        vitals?.pulse || null, vitals?.weight || null, vitals?.sugar_level || null, vitals?.notes || ''
      ]
    );

    // Step 5: Also save vitals to vitals table (doctor reads via visits)
    if (vitals && visitResult.insertId) {
      await connection.query(
        `INSERT INTO vitals (visit_id, temperature, systolic_bp, diastolic_bp, pulse, weight, sugar_level, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          temperature=VALUES(temperature), systolic_bp=VALUES(systolic_bp),
          diastolic_bp=VALUES(diastolic_bp), pulse=VALUES(pulse),
          weight=VALUES(weight), sugar_level=VALUES(sugar_level), notes=VALUES(notes)`,
        [
          visitResult.insertId,
          vitals?.temperature || null, vitals?.systolic_bp || null, vitals?.diastolic_bp || null,
          vitals?.pulse || null, vitals?.weight || null, vitals?.sugar_level || null, vitals?.notes || ''
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Patient checked in successfully', visitId: visitResult.insertId });
  } catch (error) {
    // Revert partial writes if any step fails during check-in.
    if (connection) await connection.rollback();
    console.error('Error checking in patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    // Always release pooled connection to avoid connection leaks.
    if (connection) connection.release();
  }
};


// Register walk-in patient
// Creates new patient if needed, books appointment, checks in immediately
const registerWalkIn = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { patientInfo, slotId, doctorId: doctorUserId, reason, vitals } = req.body;

    console.log('Registering walk-in patient:', patientInfo.full_name);

    // Step 0: Resolve doctor ID from user ID
    const [doctorRows] = await connection.query(
      'SELECT id FROM doctors WHERE user_id = ? LIMIT 1',
      [doctorUserId]
    );
    if (doctorRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Doctor profile not found for this user.' });
    }
    const doctorId = doctorRows[0].id;

    let patientId;
    let userId;

    // Step 1: Check if patient already exists by NIC
    const [existingPatient] = await connection.query(
      'SELECT id, user_id FROM patients WHERE nic = ? LIMIT 1',
      [patientInfo.nic]
    );

    if (existingPatient.length > 0) {
      patientId = existingPatient[0].id;
      userId = existingPatient[0].user_id;
      console.log('Using existing patient profile:', patientId);
    } else {
      // Step 2: Create new user for walk-in
      const email = patientInfo.email || `walkin_${Date.now()}@aanya.com`;
      const password_hash = await bcrypt.hash('Patient@123', 10);

      const [userResult] = await connection.query(
        "INSERT INTO users (full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = 'PATIENT'))",
        [patientInfo.full_name, email, patientInfo.phone, password_hash]
      );
      userId = userResult.insertId;

      // Step 3: Create patient profile
      const [patientResult] = await connection.query(
        "INSERT INTO patients (user_id, nic, gender, dob, address) VALUES (?, ?, ?, ?, ?)",
        [userId, patientInfo.nic, patientInfo.gender, patientInfo.date_of_birth || null, patientInfo.address]
      );
      patientId = patientResult.insertId;
    }

    // Step 4: Create appointment (immediately checked in)
    const appointmentNo = `WALK-${Date.now()}`;
    const [appointmentResult] = await connection.query(
      "INSERT INTO appointments (appointment_no, patient_id, doctor_id, slot_id, reason, status, booked_by) VALUES (?, ?, ?, ?, ?, 'checked_in', 'RECEPTIONIST')",
      [appointmentNo, patientId, doctorId, slotId, reason || 'Walk-in']
    );
    const appointmentId = appointmentResult.insertId;

    // Step 5: Create visit record for doctor's queue
    const [visitResult] = await connection.query(
      `INSERT INTO visits (appointment_id, patient_id, doctor_id, check_in_time, status, checked_in_by)
       VALUES (?, ?, ?, NOW(), 'WAITING', ?)`,
      [appointmentId, patientId, doctorId, req.user.id]
    );
    const visitId = visitResult.insertId;

    // Step 6: Save vital signs to both tables
    if (vitals) {
      await connection.query(
        `INSERT INTO patient_vitals
          (appointment_id, patient_id, temperature, systolic_bp, diastolic_bp, pulse, weight, sugar_level, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [appointmentId, patientId,
          vitals.temperature || null, vitals.systolic_bp || null, vitals.diastolic_bp || null,
          vitals.pulse || null, vitals.weight || null, vitals.sugar_level || null, vitals.notes || '']
      );
      
      // Also to vitals table (doctor reads this via visits table)
      if (visitId) {
        await connection.query(
          `INSERT INTO vitals (visit_id, temperature, systolic_bp, diastolic_bp, pulse, weight, sugar_level, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [visitId,
          vitals.temperature || null, vitals.systolic_bp || null, vitals.diastolic_bp || null,
          vitals.pulse || null, vitals.weight || null, vitals.sugar_level || null, vitals.notes || '']
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Walk-in patient registered and checked in successfully',
      appointmentId,
      visitId
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error registering walk-in:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Get waiting list for a specific date
// Shows all checked-in patients awaiting doctor consultation
const getWaitingList = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const query = `
      SELECT 
        a.id,
        a.appointment_no,
        a.status,
        u.full_name as patient_name,
        du.full_name as doctor_name,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as end_time,
        v.id as visit_id,
        (
          SELECT COUNT(*) FROM appointments a2
          WHERE a2.slot_id = a.slot_id
            AND a2.status != 'cancelled'
            AND a2.id <= a.id
        ) as queue_no
      FROM appointments a
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN doctors d ON a.doctor_id = d.id
      INNER JOIN users du ON d.user_id = du.id
      INNER JOIN visits v ON a.id = v.appointment_id
      WHERE ds.slot_date = ? AND a.status = 'checked_in' AND v.is_called = 0
      ORDER BY ds.start_time ASC, a.id ASC
    `;
    const [waitingList] = await pool.query(query, [date]);
    
    res.json(waitingList);
  } catch (error) {
    console.error('Error getting waiting list:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark visit as called
// When patient is called by doctor, receptionist marks this to prevent duplicate calling
const markVisitAsCalled = async (req, res) => {
  try {
    const { visitId } = req.params;
    // Mark as called (prevents showing in waiting list again)
    await pool.query("UPDATE visits SET is_called = 1 WHERE id = ?", [visitId]);
    res.json({ message: 'Patient marked as called' });
  } catch (error) {
    console.error('Error marking visit as called:', error);
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
  updatePatientAppointment,
  cancelAppointment,
  getAppointmentFee,
  bookAppointmentWithPayment,
  getReceptionistSlots,
  getSlotAppointments,
  checkInPatient,
  registerWalkIn,
  getWaitingList,
  markVisitAsCalled
};
