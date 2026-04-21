const { pool } = require("../config/db");

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
              r.name AS role, r.id AS role_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    );

    return res.json({
      ok: true,
      users: rows,
    });
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    console.error("Error details:", err.message);
    console.error("SQL Error code:", err.code);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message,
      code: err.code 
    });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ 
        message: "User ID and role are required" 
      });
    }

    // Validate role exists
    const [roleRows] = await pool.query(
      "SELECT id FROM roles WHERE name = ? LIMIT 1",
      [role.toUpperCase()]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid role specified" 
      });
    }

    const roleId = roleRows[0].id;

    // Update user role
    const [result] = await pool.query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roleId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Get updated user info
    const [userRows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active,
              r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    return res.json({
      ok: true,
      message: "User role updated successfully",
      user: userRows[0],
    });
  } catch (err) {
    console.error("UPDATE USER ROLE ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle user active status (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (!userId || is_active === undefined) {
      return res.status(400).json({ 
        message: "User ID and status are required" 
      });
    }

    const [result] = await pool.query(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (err) {
    console.error("TOGGLE USER STATUS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
              r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ 
        message: "You cannot delete your own account" 
      });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      "SELECT id, full_name FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Delete user (this will cascade delete related records if configured)
    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      message: `User ${userRows[0].full_name} deleted successfully`,
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message 
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[userStats]] = await pool.query(
      `SELECT
          COUNT(*) AS totalUsers,
          SUM(CASE WHEN r.name = 'PATIENT' THEN 1 ELSE 0 END) AS totalPatients,
          SUM(CASE WHEN r.name = 'DOCTOR' THEN 1 ELSE 0 END) AS totalDoctors
       FROM users u
       JOIN roles r ON r.id = u.role_id`
    );

    const [[appointmentStats]] = await pool.query(
      `SELECT
          SUM(CASE WHEN ds.slot_date = CURDATE() THEN 1 ELSE 0 END) AS todayAppointments,
          SUM(CASE WHEN a.status IN ('scheduled', 'checked_in') THEN 1 ELSE 0 END) AS pendingAppointments,
          SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completedAppointments
       FROM appointments a
       LEFT JOIN doctor_slots ds ON ds.id = a.slot_id`
    );

    const [[prescriptionStats]] = await pool.query(
      `SELECT SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activePrescriptions
       FROM prescriptions`
    );

    const [[labStats]] = await pool.query(
      `SELECT SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingLabTests
       FROM lab_order_items`
    );

    return res.json({
      ok: true,
      stats: {
        totalUsers: Number(userStats.totalUsers || 0),
        totalPatients: Number(userStats.totalPatients || 0),
        totalDoctors: Number(userStats.totalDoctors || 0),
        todayAppointments: Number(appointmentStats.todayAppointments || 0),
        pendingAppointments: Number(appointmentStats.pendingAppointments || 0),
        completedAppointments: Number(appointmentStats.completedAppointments || 0),
        activePrescriptions: Number(prescriptionStats.activePrescriptions || 0),
        pendingLabTests: Number(labStats.pendingLabTests || 0),
      },
    });
  } catch (err) {
    console.error('GET DASHBOARD STATS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          a.id,
          COALESCE(a.appointment_no, CONCAT('APT', LPAD(a.id, 6, '0'))) AS appointment_no,
          a.reason,
          a.status,
          a.created_at,
          ds.slot_date,
          TIME_FORMAT(ds.start_time, '%H:%i') AS start_time,
          TIME_FORMAT(ds.end_time, '%H:%i') AS end_time,
          p.id AS patient_id,
          pu.full_name AS patient_name,
          pu.phone AS patient_phone,
          pu.email AS patient_email,
          d.id AS doctor_id,
          du.full_name AS doctor_name,
          v.id AS visit_id,
          v.status AS visit_status,
          v.diagnosis,
          v.check_in_time,
          pv.temperature,
          pv.systolic_bp,
          pv.diastolic_bp,
          pv.pulse,
          pv.weight,
          pv.sugar_level,
          pv.notes AS vital_notes
       FROM appointments a
       LEFT JOIN doctor_slots ds ON ds.id = a.slot_id
       LEFT JOIN patients p ON p.id = a.patient_id
       LEFT JOIN users pu ON pu.id = p.user_id
       LEFT JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN users du ON du.id = d.user_id
       LEFT JOIN visits v ON v.appointment_id = a.id
       LEFT JOIN patient_vitals pv ON pv.appointment_id = a.id
       ORDER BY ds.slot_date DESC, ds.start_time DESC, a.id DESC`
    );

    return res.json({ ok: true, appointments: rows });
  } catch (err) {
    console.error('GET ALL APPOINTMENTS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllLabTests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          loi.id,
          loi.lab_order_id,
          lo.visit_id,
          p.id AS patient_id,
          pu.full_name AS patient_name,
          pu.phone AS patient_phone,
          d.id AS doctor_id,
          du.full_name AS doctor_name,
          lt.id AS lab_test_id,
          lt.name AS test_name,
          lt.type AS test_type,
          lt.price,
          lo.created_at AS requested_date,
          loi.status AS item_status,
          lo.status AS order_status,
          lr.result_text,
          lr.file_url,
          lr.completed_at,
          NULL AS lab_tech_name
       FROM lab_order_items loi
       JOIN lab_orders lo ON lo.id = loi.lab_order_id
       JOIN patients p ON p.id = lo.patient_id
       JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = lo.doctor_id
       JOIN users du ON du.id = d.user_id
       JOIN lab_tests lt ON lt.id = loi.lab_test_id
       LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
       ORDER BY lo.created_at DESC, loi.id DESC`
    );

    return res.json({ ok: true, labTests: rows });
  } catch (err) {
    console.error('GET ALL LAB TESTS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllPrescriptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          pr.id,
          pr.visit_id,
          pr.patient_id,
          pr.doctor_id,
          pr.instructions AS notes,
          pr.status,
          pr.created_at,
          pu.full_name AS patient_name,
          du.full_name AS doctor_name,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', pi.id,
              'medicine_id', pi.medicine_id,
              'medicine_name', m.name,
              'dosage', pi.dosage,
              'duration_days', pi.duration_days,
              'qty', pi.qty,
              'note', pi.note
            )
          ) AS items
       FROM prescriptions pr
       JOIN patients p ON p.id = pr.patient_id
       JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = pr.doctor_id
       JOIN users du ON du.id = d.user_id
       LEFT JOIN prescription_items pi ON pi.prescription_id = pr.id
       LEFT JOIN medicines m ON m.id = pi.medicine_id
       GROUP BY pr.id
       ORDER BY pr.created_at DESC`
    );

    const prescriptions = rows.map((row) => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
    }));

    return res.json({ ok: true, prescriptions });
  } catch (err) {
    console.error('GET ALL PRESCRIPTIONS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          ib.id,
          ib.medicine_id,
          m.name,
          NULL AS generic_name,
          m.manufacturer,
          ib.batch_no,
          ib.expiry_date,
          ib.qty_available AS stock_quantity,
          COALESCE(ib.sell_price, 0) AS unit_price,
          COALESCE(m.low_stock_threshold, 10) AS reorder_level,
          m.category
       FROM inventory_batches ib
       JOIN medicines m ON m.id = ib.medicine_id
       ORDER BY ib.expiry_date ASC, m.name ASC`
    );

    return res.json({ ok: true, inventory: rows });
  } catch (err) {
    console.error('GET INVENTORY ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createMedicine = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      unit,
      description,
      manufacturer,
      category,
      low_stock_threshold,
      batch_no,
      expiry_date,
      qty_available,
      buy_price,
      sell_price,
    } = req.body;

    if (!name || !String(name).trim()) {
      await connection.rollback();
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    if (sell_price === undefined || sell_price === null || Number(sell_price) < 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Valid sell price is required' });
    }

    const [medicineResult] = await connection.query(
      `INSERT INTO medicines (name, unit, description, low_stock_threshold, manufacturer, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        unit || 'tab',
        description || null,
        Number(low_stock_threshold || 20),
        manufacturer || null,
        category || null,
      ]
    );

    const medicineId = medicineResult.insertId;

    await connection.query(
      `INSERT INTO inventory_batches (medicine_id, batch_no, expiry_date, qty_available, buy_price, sell_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        medicineId,
        batch_no || null,
        expiry_date || null,
        Number(qty_available || 0),
        buy_price !== undefined && buy_price !== null && String(buy_price) !== '' ? Number(buy_price) : null,
        Number(sell_price),
      ]
    );

    await connection.commit();
    return res.status(201).json({
      ok: true,
      message: 'Medicine added successfully',
      medicineId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('CREATE MEDICINE ERROR:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Duplicate medicine or batch data' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.query(
      `SELECT
          i.id,
          i.total_amount,
          i.status,
          i.created_at,
          p.id AS patient_id,
          u.full_name AS patient_name
       FROM invoices i
       LEFT JOIN patients p ON p.id = i.patient_id
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY i.created_at DESC, i.id DESC`
    );

    const [payments] = await pool.query(
      `SELECT
          id,
          invoice_id,
          method,
          amount,
         paid_at
       FROM invoice_payments
       ORDER BY paid_at DESC, id DESC`
    );

    return res.json({ ok: true, invoices, payments });
  } catch (err) {
    console.error('GET INVOICES ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getInvoiceItems = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const [items] = await pool.query(
      `SELECT
          ii.id,
          ii.invoice_id,
          COALESCE(m.name, 'Unknown Item') AS medicine_name,
          COALESCE(ib.batch_no, 'N/A') AS batch_no,
          ii.qty,
          ii.unit_price,
          ii.line_total
       FROM invoice_items ii
       LEFT JOIN inventory_batches ib ON ib.id = ii.batch_id
       LEFT JOIN medicines m ON m.id = ib.medicine_id
       WHERE ii.invoice_id = ?
       ORDER BY ii.id ASC`,
      [invoiceId]
    );

    return res.json({ ok: true, items });
  } catch (err) {
    console.error('GET INVOICE ITEMS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.recordInvoicePayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { invoiceId } = req.params;
    const { method, payment_ref } = req.body;
    const allowedMethods = ['CASH', 'CARD', 'ONLINE'];

    if (!allowedMethods.includes(String(method || '').toUpperCase())) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Invalid payment method. Use CASH, CARD, or ONLINE',
      });
    }

    const [[invoice]] = await connection.query(
      `SELECT total_amount, status FROM invoices WHERE id = ? FOR UPDATE`,
      [invoiceId]
    );

    if (!invoice) {
      await connection.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      await connection.rollback();
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    await connection.query(
      `INSERT INTO invoice_payments (invoice_id, method, amount, payment_ref)
       VALUES (?, ?, ?, ?)`,
      [invoiceId, String(method).toUpperCase(), invoice.total_amount, payment_ref || null]
    );

    await connection.query(
      `UPDATE invoices SET status = 'PAID' WHERE id = ?`,
      [invoiceId]
    );

    await connection.commit();
    return res.json({ ok: true, message: 'Payment recorded successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('RECORD INVOICE PAYMENT ERROR:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'Payment reference already exists. Please use a unique reference.',
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.getLabTestCatalog = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, price, description, type FROM lab_tests ORDER BY type, name`
    );
    return res.json({ ok: true, catalog: rows });
  } catch (err) {
    console.error('GET LAB TEST CATALOG ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateLabTestCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, type } = req.body;

    if (price === undefined || isNaN(price)) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    const [result] = await pool.query(
      `UPDATE lab_tests SET name = ?, price = ?, description = ?, type = ? WHERE id = ?`,
      [name, price, description, type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    return res.json({ ok: true, message: 'Lab test updated successfully' });
  } catch (err) {
    console.error('UPDATE LAB TEST CATALOG ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createLabTest = async (req, res) => {
  try {
    const { name, price, description, type } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO lab_tests (name, price, description, type) VALUES (?, ?, ?, ?)`,
      [name, price, description, type]
    );

    return res.status(201).json({ ok: true, message: 'Lab test created successfully', id: result.insertId });
  } catch (err) {
    console.error('CREATE LAB TEST ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM lab_tests WHERE id = ?`, [id]);
    return res.json({ ok: true, message: 'Lab test deleted successfully' });
  } catch (err) {
    console.error('DELETE LAB TEST ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
