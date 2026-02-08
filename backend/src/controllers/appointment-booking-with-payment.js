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
      VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
    `;

    // Generate unique appointment number
    const appointmentNo = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [appointmentResult] = await connection.query(appointmentQuery, [
      appointmentNo,
      patientId,
      doctor_id,
      slot_id,
      reason || '',
      patientId
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

// Export the new functions
module.exports = {
  getAppointmentFee,
  bookAppointmentWithPayment
};
