const { pool } = require("../config/db");

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token

    // Get patient_id from patients table using user_id
    const [patientRows] = await pool.query(
      "SELECT id FROM patients WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Patient profile not found"
      });
    }

    const patientId = patientRows[0].id;

    // Get prescriptions for this patient with their items
    const [prescriptionsRows] = await pool.query(
      `SELECT 
        p.id,
        p.visit_id,
        p.doctor_id,
        p.patient_id,
        p.instructions as notes,
        p.created_at,
        u.full_name as doctor_name,
        'ACTIVE' as status,
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
        ) as items
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       WHERE p.patient_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [patientId]
    );

    // Format the items properly
    const prescriptions = prescriptionsRows.map(p => ({
      ...p,
      items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items
    }));

    return res.json({
      ok: true,
      prescriptions
    });
  } catch (err) {
    console.error("Get prescriptions error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
};

exports.getPrescriptionItems = async (req, res) => {
  try {
    const { id } = req.params;

    // Get prescription items with medicine names
    const [items] = await pool.query(
      `SELECT 
        pi.id,
        pi.prescription_id,
        pi.medicine_id,
        pi.dosage,
        pi.duration_days,
        pi.qty,
        pi.note,
        m.name as medicine_name
       FROM prescription_items pi
       LEFT JOIN medicines m ON m.id = pi.medicine_id
       WHERE pi.prescription_id = ?
       ORDER BY pi.id`,
      [id]
    );

    return res.json({
      ok: true,
      items
    });
  } catch (err) {
    console.error("Get prescription items error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error"
    });
  }
};
