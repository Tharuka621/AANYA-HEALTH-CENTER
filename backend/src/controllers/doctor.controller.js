const { pool } = require('../config/db');

// Helper: look up doctors.id from users.id
const getDoctorId = async (userId) => {
    const [rows] = await pool.query('SELECT id FROM doctors WHERE user_id = ? LIMIT 1', [userId]);
    if (rows.length === 0) throw new Error('Doctor profile not found');
    return rows[0].id;
};

// GET /api/doctor/queue?slot_id=X — today's patient queue, optionally filtered by slot
exports.getDoctorQueue = async (req, res) => {
    try {
        const userId = req.user.id;
        const doctorId = await getDoctorId(req.user.id);
        const today = new Date().toISOString().split('T')[0];
        const { slot_id } = req.query;

        const params = [userId, doctorId, today];
        let slotFilter = '';
        if (slot_id) {
            slotFilter = 'AND ds.id = ?';
            params.push(slot_id);
        }

        const [visits] = await pool.query(
            `SELECT
        v.id as visit_id,
        v.appointment_id,
        v.patient_id,
        v.status as visit_status,
        v.doctor_notes,
        v.diagnosis,
        v.check_in_time,
        a.appointment_no,
        a.reason as appointment_reason,
        ds.id as slot_id,
        TIME_FORMAT(ds.start_time, '%H:%i') as appointment_time,
        ds.slot_date,
        u.full_name as patient_name,
        u.phone as patient_phone,
        u.email as patient_email,
        p.nic,
        p.dob as date_of_birth,
        p.gender,
        vt.id as vital_id,
        vt.temperature,
        vt.systolic_bp,
        vt.diastolic_bp,
        vt.pulse,
        vt.weight,
        vt.sugar_level,
        vt.notes as vital_notes
      FROM visits v
      INNER JOIN appointments a ON v.appointment_id = a.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      INNER JOIN patients p ON v.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN vitals vt ON vt.visit_id = v.id
      WHERE ds.doctor_id IN (?, ?)
        AND ds.slot_date = ?
        ${slotFilter}
      ORDER BY ds.start_time ASC, v.check_in_time ASC`,
            params
        );

        res.json(visits);
    } catch (err) {
        console.error('getDoctorQueue error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// GET /api/doctor/today-queue — all active (checked-in) patients for this doctor's slots
exports.getTodayQueue = async (req, res) => {
    try {
        const userId = req.user.id;       // users.id — what doctor_slots.doctor_id stores
        const doctorId = await getDoctorId(userId); // doctors.id — what visits.doctor_id stores

        const [visits] = await pool.query(
            `SELECT
        v.id as visit_id,
        v.appointment_id,
        v.patient_id,
        v.status as visit_status,
        v.doctor_notes,
        v.diagnosis,
        v.check_in_time,
        a.appointment_no,
        a.reason as appointment_reason,
        ds.id as slot_id,
        TIME_FORMAT(ds.start_time, '%H:%i') as appointment_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as slot_end_time,
        ds.slot_date,
        u.full_name as patient_name,
        u.phone as patient_phone,
        u.email as patient_email,
        p.nic,
        p.dob as date_of_birth,
        p.gender,
        vt.id as vital_id,
        vt.temperature,
        vt.systolic_bp,
        vt.diastolic_bp,
        vt.pulse,
        vt.weight,
        vt.sugar_level,
        vt.notes as vital_notes
      FROM visits v
      INNER JOIN appointments a ON v.appointment_id = a.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      INNER JOIN patients p ON v.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN vitals vt ON vt.visit_id = v.id
      WHERE ds.doctor_id IN (?, ?)
        AND v.status IN ('WAITING', 'IN_CONSULTATION', 'DONE')
        AND ds.id IN (
          SELECT DISTINCT ds2.id FROM doctor_slots ds2
          INNER JOIN appointments a2 ON a2.slot_id = ds2.id
          INNER JOIN visits v2 ON v2.appointment_id = a2.id
          WHERE ds2.doctor_id IN (?, ?) AND v2.status IN ('WAITING','IN_CONSULTATION')
        )
      ORDER BY ds.slot_date ASC, ds.start_time ASC, v.check_in_time ASC`,
            [userId, doctorId, userId, doctorId]
        );

        res.json(visits);
    } catch (err) {
        console.error('getTodayQueue error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};


// GET /api/doctor/today-slots — today's slots with appointment + checked-in counts
exports.getDoctorTodaySlots = async (req, res) => {
    try {
        const userId = req.user.id;
        const doctorId = await getDoctorId(req.user.id);
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const [slots] = await pool.query(
            `SELECT
        ds.id,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        TIME_FORMAT(ds.end_time, '%H:%i') as end_time,
        ds.max_appointments,
        ds.is_active,
        COUNT(DISTINCT a.id) as booked_count,
        COUNT(DISTINCT v.id) as checked_in_count,
        COUNT(DISTINCT CASE WHEN v.status = 'DONE' THEN v.id END) as done_count
      FROM doctor_slots ds
      LEFT JOIN appointments a ON a.slot_id = ds.id AND a.status != 'cancelled'
      LEFT JOIN visits v ON v.appointment_id = a.id
      WHERE ds.doctor_id IN (?, ?) AND ds.slot_date = ? AND ds.is_active = 1
      GROUP BY ds.id
      ORDER BY ds.start_time ASC`,
            [userId, doctorId, date]
        );

        res.json(slots);
    } catch (err) {
        console.error('getDoctorTodaySlots error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// POST /api/doctor/visits/:visitId/start — change WAITING -> IN_CONSULTATION
exports.startConsultation = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { visitId } = req.params;

        const [result] = await pool.query(
            `UPDATE visits SET status = 'IN_CONSULTATION'
       WHERE id = ? AND doctor_id = ? AND status = 'WAITING'`,
            [visitId, doctorId]
        );

        // Also works if already IN_CONSULTATION — just respond OK
        res.json({ message: 'Consultation started' });
    } catch (err) {
        console.error('startConsultation error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// GET /api/doctor/stats — today's appointment stats
exports.getDoctorStats = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const today = new Date().toISOString().split('T')[0];

        const [[stats]] = await pool.query(
            `SELECT
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT CASE WHEN v.status = 'DONE' THEN v.id END) as completed,
        COUNT(DISTINCT CASE WHEN v.status IN ('WAITING','IN_CONSULTATION') THEN v.id END) as in_queue,
        COUNT(DISTINCT CASE WHEN a.status = 'scheduled' AND v.id IS NULL THEN a.id END) as not_checked_in
      FROM appointments a
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      LEFT JOIN visits v ON v.appointment_id = a.id
      WHERE a.doctor_id = ? AND ds.slot_date = ? AND a.status != 'cancelled'`,
            [doctorId, today]
        );

        res.json(stats);
    } catch (err) {
        console.error('getDoctorStats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/doctor/medicines — active medicines list
exports.getMedicines = async (req, res) => {
    try {
        const [medicines] = await pool.query(
            `SELECT id, name, unit, description, category
       FROM medicines WHERE is_active = 1 ORDER BY name ASC`
        );
        res.json(medicines);
    } catch (err) {
        console.error('getMedicines error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/doctor/lab-tests — all available lab tests
exports.getLabTests = async (req, res) => {
    try {
        const [tests] = await pool.query(
            `SELECT id, name, price, description, type FROM lab_tests ORDER BY type, name`
        );
        res.json(tests);
    } catch (err) {
        console.error('getLabTests error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/doctor/visits/:visitId/consultation — save notes + diagnosis
exports.saveConsultation = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { visitId } = req.params;
        const { doctor_notes, diagnosis } = req.body;

        const [result] = await pool.query(
            `UPDATE visits SET doctor_notes = ?, diagnosis = ?, status = 'IN_CONSULTATION'
       WHERE id = ? AND doctor_id = ?`,
            [doctor_notes || null, diagnosis || null, visitId, doctorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Visit not found or not authorized' });
        }

        res.json({ message: 'Consultation notes saved' });
    } catch (err) {
        console.error('saveConsultation error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// POST /api/doctor/visits/:visitId/prescriptions — create prescription + items
exports.createPrescription = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const doctorId = await getDoctorId(req.user.id);
        const { visitId } = req.params;
        const { medicines, instructions } = req.body;
        // medicines: [{medicine_id, dosage, duration_days, qty, note}]

        if (!medicines || medicines.length === 0) {
            return res.status(400).json({ message: 'At least one medicine is required' });
        }

        // Get patient_id from visit
        const [[visit]] = await connection.query(
            'SELECT patient_id FROM visits WHERE id = ? AND doctor_id = ?',
            [visitId, doctorId]
        );
        if (!visit) {
            await connection.rollback();
            return res.status(404).json({ message: 'Visit not found or not authorized' });
        }

        // Create or get prescription
        const [existing] = await connection.query(
            'SELECT id FROM prescriptions WHERE visit_id = ? FOR UPDATE',
            [visitId]
        );
        let prescriptionId;

        if (existing.length > 0) {
            prescriptionId = existing[0].id;
            await connection.query(
                `UPDATE prescriptions SET instructions = ?, status = 'ACTIVE' WHERE id = ?`,
                [instructions || null, prescriptionId]
            );
            await connection.query(
                `DELETE FROM prescription_items WHERE prescription_id = ?`,
                [prescriptionId]
            );
        } else {
            const [prescResult] = await connection.query(
                `INSERT INTO prescriptions (visit_id, doctor_id, patient_id, instructions, status)
                 VALUES (?, ?, ?, ?, 'ACTIVE')`,
                [visitId, doctorId, visit.patient_id, instructions || null]
            );
            prescriptionId = prescResult.insertId;
        }

        // Insert items
        for (const med of medicines) {
            await connection.query(
                `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, duration_days, qty, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [prescriptionId, med.medicine_id, med.dosage, med.duration_days, med.qty, med.note || null]
            );
        }

        // Update visit status
        await connection.query(
            `UPDATE visits SET status = 'IN_CONSULTATION' WHERE id = ?`,
            [visitId]
        );

        await connection.commit();
        res.status(201).json({ message: 'Prescription created', prescriptionId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('createPrescription error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};

// POST /api/doctor/visits/:visitId/lab-orders — create lab order + items
exports.createLabOrder = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const doctorId = await getDoctorId(req.user.id);
        const { visitId } = req.params;
        const { test_ids, notes } = req.body;

        if (!test_ids || test_ids.length === 0) {
            return res.status(400).json({ message: 'At least one test must be selected' });
        }

        // Get patient_id from visit
        const [[visit]] = await connection.query(
            'SELECT patient_id FROM visits WHERE id = ? AND doctor_id = ?',
            [visitId, doctorId]
        );
        if (!visit) {
            await connection.rollback();
            return res.status(404).json({ message: 'Visit not found or not authorized' });
        }

        // Create or get lab order
        const [existing] = await connection.query(
            'SELECT id FROM lab_orders WHERE visit_id = ? FOR UPDATE',
            [visitId]
        );
        let labOrderId;

        if (existing.length > 0) {
            labOrderId = existing[0].id;
            await connection.query(
                `UPDATE lab_orders SET status = 'ORDERED' WHERE id = ?`,
                [labOrderId]
            );
            await connection.query(
                `DELETE FROM lab_order_items WHERE lab_order_id = ?`,
                [labOrderId]
            );
        } else {
            const [orderResult] = await connection.query(
                `INSERT INTO lab_orders (visit_id, doctor_id, patient_id, status)
                 VALUES (?, ?, ?, 'ORDERED')`,
                [visitId, doctorId, visit.patient_id]
            );
            labOrderId = orderResult.insertId;
        }

        // Insert items
        for (const testId of test_ids) {
            await connection.query(
                `INSERT INTO lab_order_items (lab_order_id, lab_test_id, status) VALUES (?, ?, 'PENDING')`,
                [labOrderId, testId]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Lab order created', labOrderId, notes });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('createLabOrder error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};

// PUT /api/doctor/visits/:visitId/complete — mark visit as DONE
exports.completeVisit = async (req, res) => {
    try {
        const doctorId = await getDoctorId(req.user.id);
        const { visitId } = req.params;

        const [result] = await pool.query(
            `UPDATE visits SET status = 'DONE' WHERE id = ? AND doctor_id = ?`,
            [visitId, doctorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Visit not found or not authorized' });
        }

        await pool.query(
            `UPDATE appointments a
       INNER JOIN visits v ON v.appointment_id = a.id
       SET a.status = 'completed'
       WHERE v.id = ?`,
            [visitId]
        );

        res.json({ message: 'Visit completed' });
    } catch (err) {
        console.error('completeVisit error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// GET /api/doctor/patients/:patientId/history — past visits, prescriptions, lab orders
exports.getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Past visits (excluding current)
        const [visits] = await pool.query(
            `SELECT
        v.id, v.status, v.doctor_notes, v.diagnosis, v.check_in_time,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') as start_time,
        u.full_name as doctor_name
      FROM visits v
      INNER JOIN appointments a ON v.appointment_id = a.id
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      INNER JOIN doctors d ON v.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      WHERE v.patient_id = ? AND v.status = 'DONE'
      ORDER BY ds.slot_date DESC, v.check_in_time DESC
      LIMIT 20`,
            [patientId]
        );

        // Past prescriptions
        const [prescriptions] = await pool.query(
            `SELECT
        pr.id, pr.visit_id, pr.instructions, pr.status, pr.created_at,
        u.full_name as doctor_name,
        GROUP_CONCAT(
          CONCAT(m.name, ' (', pi.dosage, ', ', pi.qty, ' ', pi.duration_days, 'd)')
          SEPARATOR ' | '
        ) as medicines_summary
      FROM prescriptions pr
      INNER JOIN doctors d ON pr.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      LEFT JOIN prescription_items pi ON pi.prescription_id = pr.id
      LEFT JOIN medicines m ON m.id = pi.medicine_id
      WHERE pr.patient_id = ?
      GROUP BY pr.id
      ORDER BY pr.created_at DESC
      LIMIT 10`,
            [patientId]
        );

        // Past lab orders
        const [labOrders] = await pool.query(
            `SELECT
        lo.id, lo.status, lo.created_at,
        u.full_name as doctor_name,
        GROUP_CONCAT(lt.name SEPARATOR ', ') as tests
      FROM lab_orders lo
      INNER JOIN doctors d ON lo.doctor_id = d.id
      INNER JOIN users u ON d.user_id = u.id
      LEFT JOIN lab_order_items loi ON loi.lab_order_id = lo.id
      LEFT JOIN lab_tests lt ON lt.id = loi.lab_test_id
      WHERE lo.patient_id = ?
      GROUP BY lo.id
      ORDER BY lo.created_at DESC
      LIMIT 10`,
            [patientId]
        );

        res.json({ visits, prescriptions, labOrders });
    } catch (err) {
        console.error('getPatientHistory error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// GET /api/doctor/patients — all patients who have appointments with this doctor
exports.getDoctorPatients = async (req, res) => {
    try {
        const userId = req.user.id;
        const doctorId = await getDoctorId(userId);

        const [patients] = await pool.query(
            `SELECT
        p.id AS patient_id,
        u.full_name,
        u.email,
        u.phone,
        p.nic,
        p.date_of_birth,
        p.gender,
        p.address,
        p.emergency_contact,
        p.blood_group,
        p.created_at,
        p.updated_at,
        MAX(ds.slot_date) AS last_visit,
        COUNT(DISTINCT a.id) AS appointment_count,
        GROUP_CONCAT(DISTINCT pa.allergy_name ORDER BY pa.allergy_name SEPARATOR ', ') AS allergies
      FROM appointments a
      INNER JOIN doctor_slots ds ON a.slot_id = ds.id
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN patient_allergies pa ON pa.patient_id = p.id
      WHERE ds.doctor_id = ? AND a.status != 'cancelled'
      GROUP BY p.id, u.id, p.nic, p.date_of_birth, p.gender, p.address, p.emergency_contact, p.blood_group, p.created_at, p.updated_at
      ORDER BY MAX(ds.slot_date) DESC, u.full_name ASC`,
            [doctorId]
        );

        res.json(patients);
    } catch (err) {
        console.error('getDoctorPatients error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
