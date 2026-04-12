const { pool } = require('../config/db');
console.log(`[DIAG] Notification Controller loaded from: ${__filename}`);

/**
 * Get role-specific notifications for the authenticated user.
 * Notifications are computed live from existing tables — not stored separately.
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = (req.user.role || '').toUpperCase();

    let notifications = [];

    switch (role) {
      case 'DOCTOR':
        notifications = await getDoctorNotifications(userId);
        break;
      case 'RECEPTIONIST':
        notifications = await getReceptionistNotifications(userId);
        break;
      case 'PHARMACIST':
        notifications = await getPharmacistNotifications(userId);
        break;
      case 'LAB':
      case 'LAB_TECH':
        notifications = await getLabNotifications(userId);
        break;
      case 'PATIENT':
        notifications = await getPatientNotifications(userId);
        break;
      case 'ADMIN':
        notifications = await getAdminNotifications(userId);
        break;
      default:
        notifications = [];
    }

    res.json({ ok: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ ok: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

// ─── DOCTOR ──────────────────────────────────────────────────────────────────

async function getDoctorNotifications(userId) {
  const notifications = [];

  // 1. Patients waiting (checked-in visits with status WAITING)
  try {
    const [waiting] = await pool.query(
      `SELECT v.id, u.full_name as patient_name, v.check_in_time
       FROM visits v
       INNER JOIN patients p ON v.patient_id = p.id
       INNER JOIN users u ON p.user_id = u.id
       INNER JOIN doctors d ON v.doctor_id = d.id
       WHERE d.user_id = ? AND v.status = 'WAITING'
       ORDER BY v.check_in_time ASC
       LIMIT 10`,
      [userId]
    );
    waiting.forEach(w => {
      notifications.push({
        id: `doc-wait-${w.id}`,
        title: 'Patient Waiting',
        message: `${w.patient_name} is checked in and waiting`,
        type: 'warning',
        category: 'waiting',
        created_at: w.check_in_time,
      });
    });
  } catch (e) { console.error('Doctor waiting query error:', e.message); }

  // 2. Today's upcoming appointments
  try {
    const [upcoming] = await pool.query(
      `SELECT COUNT(*) as count
       FROM appointments a
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN doctor_slots ds ON a.slot_id = ds.id
       WHERE d.user_id = ? AND ds.slot_date = CURDATE() AND a.status = 'scheduled'`,
      [userId]
    );
    if (upcoming[0].count > 0) {
      notifications.push({
        id: 'doc-upcoming-today',
        title: 'Today\'s Appointments',
        message: `You have ${upcoming[0].count} scheduled appointment${upcoming[0].count > 1 ? 's' : ''} today`,
        type: 'info',
        category: 'appointments',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Doctor upcoming query error:', e.message); }

  // 3. Completed lab results for doctor's patients
  try {
    const [labResults] = await pool.query(
      `SELECT loi.id, lt.name as test_name, u.full_name as patient_name,
              COALESCE(lr.completed_at, lo.created_at) as updated_at
       FROM lab_order_items loi
       INNER JOIN lab_orders lo ON loi.lab_order_id = lo.id
       INNER JOIN lab_tests lt ON loi.lab_test_id = lt.id
       INNER JOIN patients p ON lo.patient_id = p.id
       INNER JOIN users u ON p.user_id = u.id
       INNER JOIN doctors d ON lo.doctor_id = d.id
       LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
       WHERE d.user_id = ? AND loi.status = 'DONE'
         AND COALESCE(lr.completed_at, lo.created_at) >= DATE_SUB(NOW(), INTERVAL 48 HOUR)
       ORDER BY COALESCE(lr.completed_at, lo.created_at) DESC
       LIMIT 5`,
      [userId]
    );
    labResults.forEach(lr => {
      notifications.push({
        id: `doc-lab-${lr.id}`,
        title: 'Lab Report Ready',
        message: `${lr.test_name} results for ${lr.patient_name} are ready`,
        type: 'success',
        category: 'lab',
        created_at: lr.updated_at,
      });
    });
  } catch (e) { console.error('Doctor lab query error:', e.message); }

  return notifications;
}

// ─── RECEPTIONIST ────────────────────────────────────────────────────────────

async function getReceptionistNotifications(userId) {
  const notifications = [];

  // 1. Today's scheduled appointments not yet checked in
  try {
    const [pending] = await pool.query(
      `SELECT COUNT(*) as count
       FROM appointments a
       INNER JOIN doctor_slots ds ON a.slot_id = ds.id
       WHERE ds.slot_date = CURDATE() AND a.status = 'scheduled'`
    );
    if (pending[0].count > 0) {
      notifications.push({
        id: 'rec-pending-checkin',
        title: 'Pending Check-ins',
        message: `${pending[0].count} patient${pending[0].count > 1 ? 's' : ''} scheduled today still need to be checked in`,
        type: 'warning',
        category: 'checkin',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Receptionist pending query error:', e.message); }

  // 2. Slots that are nearly full (≥80%)
  try {
    const [nearlyFull] = await pool.query(
      `SELECT ds.id, ds.start_time, ds.end_time, u.full_name as doctor_name,
              ds.max_appointments,
              (SELECT COUNT(*) FROM appointments a WHERE a.slot_id = ds.id AND a.status != 'cancelled') as booked
       FROM doctor_slots ds
       INNER JOIN users u ON ds.doctor_id = u.id
       WHERE ds.slot_date = CURDATE() AND ds.is_active = 1
       HAVING booked >= ds.max_appointments * 0.8`
    );
    nearlyFull.forEach(s => {
      notifications.push({
        id: `rec-full-${s.id}`,
        title: 'Slot Nearly Full',
        message: `Dr. ${s.doctor_name}'s ${s.start_time}-${s.end_time} slot is ${s.booked}/${s.max_appointments} booked`,
        type: s.booked >= s.max_appointments ? 'error' : 'warning',
        category: 'slots',
        created_at: new Date().toISOString(),
      });
    });
  } catch (e) { console.error('Receptionist slots query error:', e.message); }

  // 3. Total appointments today summary
  try {
    const [summary] = await pool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN a.status = 'checked_in' THEN 1 ELSE 0 END) as checked_in
       FROM appointments a
       INNER JOIN doctor_slots ds ON a.slot_id = ds.id
       WHERE ds.slot_date = CURDATE() AND a.status != 'cancelled'`
    );
    if (summary[0].total > 0) {
      notifications.push({
        id: 'rec-today-summary',
        title: 'Today\'s Summary',
        message: `${summary[0].checked_in || 0} checked in out of ${summary[0].total} total appointments`,
        type: 'info',
        category: 'summary',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Receptionist summary query error:', e.message); }

  return notifications;
}

// ─── PHARMACIST ──────────────────────────────────────────────────────────────

async function getPharmacistNotifications(userId) {
  const notifications = [];

  // 1. Pending prescriptions to dispense
  try {
    const [pending] = await pool.query(
      `SELECT COUNT(*) as count FROM prescriptions WHERE status = 'pending'`
    );
    if (pending[0].count > 0) {
      notifications.push({
        id: 'pharm-pending',
        title: 'Pending Prescriptions',
        message: `${pending[0].count} prescription${pending[0].count > 1 ? 's' : ''} waiting to be dispensed`,
        type: 'warning',
        category: 'prescriptions',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Pharmacist pending query error:', e.message); }

  // 2. Low-stock medicines
  try {
    const [lowStock] = await pool.query(
      `SELECT m.id, m.name as medicine_name, COALESCE(ib.total, 0) as quantity, m.low_stock_threshold
       FROM medicines m
       LEFT JOIN (SELECT medicine_id, SUM(qty_available) as total FROM inventory_batches GROUP BY medicine_id) ib ON m.id = ib.medicine_id
       WHERE COALESCE(ib.total, 0) <= COALESCE(m.low_stock_threshold, 10)
       ORDER BY quantity ASC
       LIMIT 5`
    );
    lowStock.forEach(m => {
      notifications.push({
        id: `pharm-stock-${m.id}`,
        title: 'Low Stock Alert',
        message: `${m.medicine_name}: only ${m.quantity} units left (reorder at ${m.low_stock_threshold})`,
        type: 'error',
        category: 'inventory',
        created_at: new Date().toISOString(),
      });
    });
  } catch (e) { console.error('[V2] Pharmacist stock query error:', e.message); }

  // 3. Medicines expiring within 30 days
  try {
    const [expiring] = await pool.query(
      `SELECT ib.id, m.name as medicine_name, ib.expiry_date
       FROM inventory_batches ib
       JOIN medicines m ON ib.medicine_id = m.id
       WHERE ib.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
         AND ib.expiry_date >= CURDATE()
         AND ib.qty_available > 0
       ORDER BY ib.expiry_date ASC
       LIMIT 5`
    );
    expiring.forEach(m => {
      notifications.push({
        id: `pharm-exp-${m.id}`,
        title: 'Expiring Soon',
        message: `${m.medicine_name} expires on ${new Date(m.expiry_date).toLocaleDateString('en-GB')}`,
        type: 'warning',
        category: 'expiry',
        created_at: new Date().toISOString(),
      });
    });
  } catch (e) { console.error('Pharmacist expiry query error:', e.message); }

  return notifications;
}

// ─── LAB TECH ────────────────────────────────────────────────────────────────

async function getLabNotifications(userId) {
  const notifications = [];

  // 1. Pending lab test requests
  try {
    const [pending] = await pool.query(
      `SELECT loi.id, lt.name as test_name, u.full_name as patient_name, lo.created_at
       FROM lab_order_items loi
       INNER JOIN lab_orders lo ON loi.lab_order_id = lo.id
       INNER JOIN lab_tests lt ON loi.lab_test_id = lt.id
       INNER JOIN patients p ON lo.patient_id = p.id
       INNER JOIN users u ON p.user_id = u.id
       WHERE loi.status = 'PENDING' AND lo.status IN ('ORDERED', 'IN_PROGRESS')
       ORDER BY lo.created_at ASC
       LIMIT 10`
    );
    if (pending.length > 0) {
      notifications.push({
        id: 'lab-pending-count',
        title: 'Pending Tests',
        message: `${pending.length} lab test${pending.length > 1 ? 's' : ''} awaiting processing`,
        type: 'warning',
        category: 'pending',
        created_at: new Date().toISOString(),
      });
    }
    pending.slice(0, 3).forEach(t => {
      notifications.push({
        id: `lab-req-${t.id}`,
        title: 'Test Requested',
        message: `${t.test_name} for ${t.patient_name}`,
        type: 'info',
        category: 'request',
        created_at: t.created_at,
      });
    });
  } catch (e) { console.error('Lab pending query error:', e.message); }

  // 2. In-progress tests
  try {
    const [inProgress] = await pool.query(
      `SELECT COUNT(*) as count
       FROM lab_order_items loi
       INNER JOIN lab_orders lo ON loi.lab_order_id = lo.id
       WHERE loi.status = 'PENDING' AND lo.status = 'IN_PROGRESS'`
    );
    if (inProgress[0].count > 0) {
      notifications.push({
        id: 'lab-in-progress',
        title: 'Tests In Progress',
        message: `${inProgress[0].count} test${inProgress[0].count > 1 ? 's' : ''} currently in progress`,
        type: 'info',
        category: 'progress',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Lab in-progress query error:', e.message); }

  return notifications;
}

// ─── PATIENT ─────────────────────────────────────────────────────────────────

async function getPatientNotifications(userId) {
  const notifications = [];

  // 1. Upcoming appointments
  try {
    const [upcoming] = await pool.query(
      `SELECT a.id, ds.slot_date, ds.start_time, ds.end_time, u.full_name as doctor_name
       FROM appointments a
       INNER JOIN patients p ON a.patient_id = p.id
       INNER JOIN doctor_slots ds ON a.slot_id = ds.id
       INNER JOIN users u ON a.doctor_id = u.id
       WHERE p.user_id = ? AND a.status = 'scheduled' AND ds.slot_date >= CURDATE()
       ORDER BY ds.slot_date ASC, ds.start_time ASC
       LIMIT 5`,
      [userId]
    );
    upcoming.forEach(apt => {
      const dateStr = new Date(apt.slot_date).toLocaleDateString('en-GB');
      notifications.push({
        id: `pat-apt-${apt.id}`,
        title: 'Upcoming Appointment',
        message: `Appointment with Dr. ${apt.doctor_name} on ${dateStr} at ${apt.start_time}`,
        type: 'info',
        category: 'appointment',
        created_at: new Date().toISOString(),
      });
    });
  } catch (e) { console.error('Patient appointment query error:', e.message); }

  // 2. Completed lab reports
  try {
    const [reports] = await pool.query(
      `SELECT loi.id, lt.name as test_name,
              COALESCE(lr.completed_at, lo.created_at) as updated_at
       FROM lab_order_items loi
       INNER JOIN lab_orders lo ON loi.lab_order_id = lo.id
       INNER JOIN lab_tests lt ON loi.lab_test_id = lt.id
       INNER JOIN patients p ON lo.patient_id = p.id
       LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
       WHERE p.user_id = ? AND loi.status = 'DONE'
         AND COALESCE(lr.completed_at, lo.created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY COALESCE(lr.completed_at, lo.created_at) DESC
       LIMIT 5`,
      [userId]
    );
    reports.forEach(r => {
      notifications.push({
        id: `pat-lab-${r.id}`,
        title: 'Lab Report Ready',
        message: `Your ${r.test_name} results are ready to view`,
        type: 'success',
        category: 'lab',
        created_at: r.updated_at,
      });
    });
  } catch (e) { console.error('Patient lab query error:', e.message); }

  // 3. Active prescriptions
  try {
    const [prescriptions] = await pool.query(
      `SELECT pr.id, pr.created_at, u.full_name as doctor_name
       FROM prescriptions pr
       INNER JOIN patients p ON pr.patient_id = p.id
       INNER JOIN doctors d ON pr.doctor_id = d.id
       INNER JOIN users u ON d.user_id = u.id
       WHERE p.user_id = ? AND pr.status = 'pending'
         AND pr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY pr.created_at DESC
       LIMIT 5`,
      [userId]
    );
    prescriptions.forEach(pr => {
      notifications.push({
        id: `pat-rx-${pr.id}`,
        title: 'New Prescription',
        message: `Dr. ${pr.doctor_name} has prescribed new medication for you`,
        type: 'info',
        category: 'prescription',
        created_at: pr.created_at,
      });
    });
  } catch (e) { console.error('Patient prescription query error:', e.message); }

  return notifications;
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

async function getAdminNotifications(userId) {
  const notifications = [];

  // 1. New user registrations in last 24 hours
  try {
    const [newUsers] = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );
    if (newUsers[0].count > 0) {
      notifications.push({
        id: 'admin-new-users',
        title: 'New Registrations',
        message: `${newUsers[0].count} new user${newUsers[0].count > 1 ? 's' : ''} registered in the last 24 hours`,
        type: 'info',
        category: 'users',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Admin users query error:', e.message); }

  // 2. Today's appointment volume
  try {
    const [todayApts] = await pool.query(
      `SELECT COUNT(*) as count
       FROM appointments a
       INNER JOIN doctor_slots ds ON a.slot_id = ds.id
       WHERE ds.slot_date = CURDATE() AND a.status != 'cancelled'`
    );
    notifications.push({
      id: 'admin-today-apts',
      title: 'Today\'s Appointments',
      message: `${todayApts[0].count} appointment${todayApts[0].count !== 1 ? 's' : ''} scheduled for today`,
      type: 'info',
      category: 'appointments',
      created_at: new Date().toISOString(),
    });
  } catch (e) { console.error('Admin apts query error:', e.message); }

  // 3. Low-stock medicines (admin overview)
  try {
    const [lowStock] = await pool.query(
      `SELECT COUNT(*) as count FROM (
         SELECT m.id FROM medicines m
         LEFT JOIN (SELECT medicine_id, SUM(qty_available) as total FROM inventory_batches GROUP BY medicine_id) ib ON m.id = ib.medicine_id
         WHERE COALESCE(ib.total, 0) <= COALESCE(m.low_stock_threshold, 10)
       ) as low_stock`
    );
    if (lowStock[0].count > 0) {
      notifications.push({
        id: 'admin-low-stock',
        title: 'Inventory Alert',
        message: `${lowStock[0].count} medicine${lowStock[0].count > 1 ? 's' : ''} below reorder level`,
        type: 'error',
        category: 'inventory',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('[V2] Admin stock query error:', e.message); }

  // 4. Pending lab tests
  try {
    const [pendingLabs] = await pool.query(
      `SELECT COUNT(*) as count
       FROM lab_order_items loi
       INNER JOIN lab_orders lo ON loi.lab_order_id = lo.id
       WHERE loi.status = 'PENDING' AND lo.status IN ('ORDERED', 'IN_PROGRESS')`
    );
    if (pendingLabs[0].count > 0) {
      notifications.push({
        id: 'admin-pending-labs',
        title: 'Pending Lab Tests',
        message: `${pendingLabs[0].count} lab test${pendingLabs[0].count > 1 ? 's' : ''} awaiting processing`,
        type: 'warning',
        category: 'labs',
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) { console.error('Admin labs query error:', e.message); }

  return notifications;
}

module.exports = {
  getNotifications,
};
