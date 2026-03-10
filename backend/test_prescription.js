const { pool } = require('./src/config/db');

async function testPrescriptionInsertion() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const doctorId = 1;
        const visitId = 7;
        const medicines = [
            { medicine_id: 1, dosage: '1-0-1', duration_days: 5, qty: 10, note: 'Take after meals' }
        ];
        const instructions = 'Rest well';

        const [[visit]] = await connection.query(
            'SELECT patient_id FROM visits WHERE id = ? AND doctor_id = ?',
            [visitId, doctorId]
        );
        if (!visit) {
            console.log('Visit not found!');
            return;
        }

        const [prescResult] = await connection.query(
            `INSERT INTO prescriptions (visit_id, doctor_id, patient_id, instructions, status)
             VALUES (?, ?, ?, ?, 'ACTIVE')`,
            [visitId, doctorId, visit.patient_id, instructions]
        );
        const prescriptionId = prescResult.insertId;

        for (const med of medicines) {
            await connection.query(
                `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, duration_days, qty, note)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [prescriptionId, med.medicine_id, med.dosage, med.duration_days, med.qty, med.note]
            );
        }

        await connection.commit();
        console.log('Successfully inserted prescription');
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('SQL Error:', err);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

testPrescriptionInsertion();
