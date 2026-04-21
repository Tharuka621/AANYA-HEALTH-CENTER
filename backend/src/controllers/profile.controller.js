const { pool } = require('../config/db');

/*
 * GET /api/profile — returns profile data for the current logged-in user,
 * enriched with role-specific tables (doctors, patients, etc.)
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = (req.user.role || '').toUpperCase();

    // Base user info (common to all roles)
    const [userRows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, r.name as role, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    const baseProfile = userRows[0];
    let roleData = {};
    let stats = {};

    switch (role) {
      case 'DOCTOR': {
        // Doctor-specific data
        const [doctorRows] = await pool.query(
          `SELECT d.id as doctor_id, d.specialization, d.qualification, d.license_no
           FROM doctors d WHERE d.user_id = ? LIMIT 1`,
          [userId]
        );
        if (doctorRows.length) {
          roleData = doctorRows[0];

          // Doctor stats
          const doctorId = doctorRows[0].doctor_id;
          const [[doctorStats]] = await pool.query(
            `SELECT
              (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = ? AND a.status != 'cancelled') as total_appointments,
              (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.doctor_id = ?) as total_patients,
              (SELECT COUNT(*) FROM visits v WHERE v.doctor_id = ? AND v.status = 'DONE') as completed_visits,
              (SELECT COUNT(*) FROM prescriptions p WHERE p.doctor_id = ?) as total_prescriptions`,
            [doctorId, doctorId, doctorId, doctorId]
          );
          stats = doctorStats || {};
        }
        break;
      }

      case 'PATIENT': {
        // Patient-specific data
        const [patientRows] = await pool.query(
          `SELECT p.id as patient_id, p.nic, p.dob, p.gender, p.address,
                  p.emergency_contact_name, p.emergency_contact_phone
           FROM patients p WHERE p.user_id = ? LIMIT 1`,
          [userId]
        );
        if (patientRows.length) {
          roleData = patientRows[0];

          // Allergies
          const [allergyRows] = await pool.query(
            `SELECT allergy_name FROM patient_allergies WHERE patient_id = ? ORDER BY allergy_name`,
            [patientRows[0].patient_id]
          );
          roleData.allergies = allergyRows.map(r => r.allergy_name);

          // Patient stats
          const patientId = patientRows[0].patient_id;
          const [[patientStats]] = await pool.query(
            `SELECT
              (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = ?) as total_appointments,
              (SELECT COUNT(*) FROM visits v WHERE v.patient_id = ? AND v.status = 'DONE') as completed_visits,
              (SELECT COUNT(*) FROM prescriptions p WHERE p.patient_id = ?) as total_prescriptions,
              (SELECT COUNT(*) FROM lab_orders lo WHERE lo.patient_id = ?) as total_lab_orders`,
            [patientId, patientId, patientId, patientId]
          );
          stats = patientStats || {};
        }
        break;
      }

      case 'RECEPTIONIST': {
        // Receptionist stats — today's activity
        const [[recStats]] = await pool.query(
          `SELECT
            (SELECT COUNT(*) FROM appointments a
             INNER JOIN doctor_slots ds ON a.slot_id = ds.id
             WHERE ds.slot_date = CURDATE() AND a.status != 'cancelled') as today_appointments,
            (SELECT COUNT(*) FROM appointments a
             INNER JOIN doctor_slots ds ON a.slot_id = ds.id
             WHERE ds.slot_date = CURDATE() AND a.status = 'checked_in') as today_checked_in,
            (SELECT COUNT(*) FROM visits WHERE DATE(check_in_time) = CURDATE()) as today_visits,
            (SELECT COUNT(*) FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE r.name = 'PATIENT') as total_patients`
        );
        stats = recStats || {};
        break;
      }

      case 'PHARMACIST': {
        // Pharmacist stats
        const [[pharmStats]] = await pool.query(
          `SELECT
            (SELECT COUNT(*) FROM prescriptions WHERE status = 'ACTIVE') as pending_prescriptions,
            (SELECT COUNT(*) FROM prescriptions WHERE status = 'DISPENSED') as dispensed_prescriptions,
            (SELECT COUNT(*) FROM (
               SELECT m.id FROM medicines m
               LEFT JOIN (SELECT medicine_id, SUM(qty_available) as total FROM inventory_batches GROUP BY medicine_id) ib ON m.id = ib.medicine_id
               WHERE COALESCE(ib.total, 0) <= COALESCE(m.low_stock_threshold, 10)
             ) as low_stock) as low_stock_items,
            (SELECT COUNT(*) FROM medicines) as total_inventory_items`
        );
        stats = pharmStats || {};
        break;
      }

      case 'LAB':
      case 'LAB_TECH': {
        // Lab tech stats
        const [[labStats]] = await pool.query(
          `SELECT
            (SELECT COUNT(*) FROM lab_order_items WHERE status = 'PENDING') as pending_tests,
            (SELECT COUNT(*) FROM lab_order_items WHERE status = 'IN_PROGRESS') as in_progress_tests,
            (SELECT COUNT(*) FROM lab_order_items WHERE status = 'COMPLETED') as completed_tests,
            (SELECT COUNT(*) FROM lab_orders) as total_orders`
        );
        stats = labStats || {};
        break;
      }

      case 'ADMIN': {
        // Admin stats
        const [[adminStats]] = await pool.query(
          `SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE r.name = 'DOCTOR') as total_doctors,
            (SELECT COUNT(*) FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE r.name = 'PATIENT') as total_patients,
            (SELECT COUNT(*) FROM appointments WHERE status != 'cancelled') as total_appointments`
        );
        stats = adminStats || {};
        break;
      }
    }

    return res.json({
      ok: true,
      profile: {
        ...baseProfile,
        ...roleData,
      },
      stats,
    });
  } catch (err) {
    console.error('[V2] GET PROFILE ERROR:', err);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/profile — update basic profile info for the current user 
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone } = req.body;

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ ok: false, message: 'Full name is required' });
    }

    await pool.query(
      `UPDATE users SET full_name = ?, phone = ? WHERE id = ?`,
      [String(full_name).trim(), phone || null, userId]
    );

    return res.json({ ok: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};
