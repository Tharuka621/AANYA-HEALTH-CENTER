const { pool } = require('./src/config/db');

async function run() {
    try {
        const [result] = await pool.query(
            `INSERT INTO prescriptions (visit_id, doctor_id, patient_id, instructions, status)
       VALUES (7, 1, 9, 'Take immediately', 'ACTIVE')`
        );
        console.log('Inserted prescription:', result.insertId);

        await pool.query(
            `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, duration_days, qty)
       VALUES (?, 1, '250mg', 3, 6)`,
            [result.insertId]
        );
        console.log('Inserted prescription item');

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
