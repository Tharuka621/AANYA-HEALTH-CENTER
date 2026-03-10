const { pool } = require("../config/db");

exports.getPatientLabOrders = async (req, res) => {
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

        // Get lab orders and associated tests for this patient
        const [labOrders] = await pool.query(
            `SELECT 
        lo.id,
        lo.created_at,
        lo.status,
        GROUP_CONCAT(lt.name SEPARATOR ', ') as test_names
      FROM lab_orders lo
      LEFT JOIN lab_order_items loi ON loi.lab_order_id = lo.id
      LEFT JOIN lab_tests lt ON lt.id = loi.lab_test_id
      WHERE lo.patient_id = ?
      GROUP BY lo.id
      ORDER BY lo.created_at DESC`,
            [patientId]
        );

        return res.json({
            ok: true,
            labOrders
        });
    } catch (err) {
        console.error("Get lab orders error:", err);
        return res.status(500).json({
            ok: false,
            message: "Internal server error"
        });
    }
};
