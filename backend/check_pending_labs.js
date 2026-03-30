require('dotenv').config();
const { pool } = require('./src/config/db');

async function checkPendingLabs() {
    const query = `
    SELECT 
        loi.id,
        lo.id as lab_order_id,
        lo.visit_id as appointment_no,
        pu.full_name as patient_name,
        pu.phone as patient_phone,
        lt.name as test_name,
        lt.type as test_type,
        du.full_name as doctor_name,
        lo.created_at as requested_date,
        lo.status as order_status,
        loi.status as item_status
    FROM lab_order_items loi
    JOIN lab_orders lo ON loi.lab_order_id = lo.id
    JOIN patients p ON lo.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON lo.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    JOIN lab_tests lt ON loi.lab_test_id = lt.id
    WHERE loi.status = 'PENDING' AND lo.status IN ('ORDERED', 'IN_PROGRESS')
    ORDER BY lo.created_at ASC
  `;
    try {
        const [rows] = await pool.query(query);
        console.log("Found rows:", rows.length);
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
checkPendingLabs();
