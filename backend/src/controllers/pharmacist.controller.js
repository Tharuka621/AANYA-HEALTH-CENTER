const { pool } = require('../config/db');

// GET /api/pharmacist/prescriptions/pending
exports.getPendingPrescriptions = async (req, res) => {
    try {
        const [prescriptions] = await pool.query(
            `SELECT
        p.id,
        CONCAT('PRX-', YEAR(p.created_at), '-', LPAD(p.id, 4, '0')) as prescriptionId,
        p.visit_id,
        p.instructions,
        p.status,
        p.created_at as issued_date,
        u_patient.full_name as patient,
        u_doctor.full_name as doctor
      FROM prescriptions p
      INNER JOIN patients pat ON p.patient_id = pat.id
      INNER JOIN users u_patient ON pat.user_id = u_patient.id
      INNER JOIN doctors d ON p.doctor_id = d.id
      INNER JOIN users u_doctor ON d.user_id = u_doctor.id
      WHERE p.status = 'ACTIVE'
      ORDER BY p.created_at ASC`
        );

        // Fetch medicines for each prescription
        for (let p of prescriptions) {
            const [medicines] = await pool.query(
                `SELECT 
          m.id as medicine_id,
          m.name,
          m.unit,
          pi.dosage,
          pi.qty as quantity
         FROM prescription_items pi
         INNER JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = ?`,
                [p.id]
            );
            p.medicines = medicines;
        }

        res.json(prescriptions);
    } catch (err) {
        console.error('getPendingPrescriptions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/pharmacist/inventory
exports.getInventory = async (req, res) => {
    try {
        const [batches] = await pool.query(
            `SELECT 
        ib.id,
        ib.medicine_id,
        m.name as medicine_name,
        m.unit as dosage,
        ib.batch_no,
        ib.expiry_date,
        ib.qty_available,
        ib.sell_price
       FROM inventory_batches ib
       INNER JOIN medicines m ON ib.medicine_id = m.id
       WHERE ib.qty_available > 0
       ORDER BY ib.expiry_date ASC`
        );
        res.json(batches);
    } catch (err) {
        console.error('getInventory error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/pharmacist/prescriptions/:id/dispense
exports.dispensePrescription = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { deductionPlans } = req.body;
        const dispensedBy = req.user.id; // pharmacist user id from JWT

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Update prescription status
        const [prescResult] = await connection.query(
            `UPDATE prescriptions SET status = 'DISPENSED' WHERE id = ? AND status = 'ACTIVE'`,
            [id]
        );

        if (prescResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Prescription not found or already dispensed' });
        }

        // 2. Fetch prescription details (patient_id, visit_id)
        const [[prescription]] = await connection.query(
            `SELECT patient_id, visit_id FROM prescriptions WHERE id = ?`,
            [id]
        );

        // 3. Fetch prescription_items to map medicine_id -> prescription_item_id
        const [prescItems] = await connection.query(
            `SELECT pi.id as prescription_item_id, pi.medicine_id
             FROM prescription_items pi
             WHERE pi.prescription_id = ?`,
            [id]
        );

        const medToPrescItemId = new Map();
        prescItems.forEach(item => {
            medToPrescItemId.set(String(item.medicine_id), item.prescription_item_id);
        });

        // 4. Process each batch: deduct inventory, record dispense_items, build invoice items
        let totalAmount = 0;
        const invoiceItems = [];

        for (const plan of deductionPlans) {
            for (const batch of plan.batches) {
                const medicineId = String(batch.medicine_id || '');

                // Deduct from inventory_batches
                const [deductResult] = await connection.query(
                    `UPDATE inventory_batches SET qty_available = qty_available - ?
                     WHERE id = ? AND qty_available >= ?`,
                    [batch.qty_to_deduct, batch.batch_id, batch.qty_to_deduct]
                );

                if (deductResult.affectedRows === 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        message: `Insufficient stock for batch ${batch.batch_no || batch.batch_id}`
                    });
                }

                const lineTotal = batch.qty_to_deduct * batch.unit_price;
                totalAmount += lineTotal;

                invoiceItems.push({
                    batch_id: batch.batch_id,
                    qty: batch.qty_to_deduct,
                    unit_price: batch.unit_price,
                    line_total: lineTotal,
                    medicine_name: plan.medicine_name,
                    dosage: plan.dosage,
                    batch_no: batch.batch_no || 'N/A'
                });

                // Insert into dispense_items: id, prescription_item_id, batch_id, qty_dispensed, dispensed_by, dispensed_at
                const prescItemId = medToPrescItemId.get(medicineId);
                if (prescItemId) {
                    await connection.query(
                        `INSERT INTO dispense_items (prescription_item_id, batch_id, qty_dispensed, dispensed_by, dispensed_at)
                         VALUES (?, ?, ?, ?, NOW())`,
                        [prescItemId, batch.batch_id, batch.qty_to_deduct, dispensedBy]
                    );
                }
            }
        }

        // 5. Create Invoice (in the bills table as per schema)
        const [invoiceResult] = await connection.query(
            `INSERT INTO bills (patient_id, bill_date, total_amount, payment_status, notes) VALUES (?, NOW(), ?, 'pending', 'Pharmacy Bill')`,
            [prescription.patient_id, totalAmount]
        );
        const invoiceId = invoiceResult.insertId;

        // 6. Insert Invoice Items (into bill_items table)
        for (const item of invoiceItems) {
            await connection.query(
                `INSERT INTO bill_items (bill_id, item_type, item_id, description, quantity, unit_price, total_price)
                 VALUES (?, 'PHARMACY', ?, ?, ?, ?, ?)`,
                [invoiceId, item.batch_id, item.medicine_name, item.qty, item.unit_price, item.line_total]
            );
        }

        await connection.commit();

        res.json({
            message: 'Prescription dispensed successfully',
            invoice: {
                id: invoiceId,
                display_id: `INV-${String(invoiceId).padStart(6, '0')}`,
                patient_id: prescription.patient_id,
                visit_id: prescription.visit_id,
                total_amount: totalAmount,
                status: 'UNPAID',
                created_at: new Date().toISOString(),
                items: invoiceItems
            }
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('dispensePrescription error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};

// GET /api/pharmacist/invoices
exports.getInvoices = async (req, res) => {
    try {
        const [invoices] = await pool.query(
            `SELECT 
        i.id,
            CONCAT('INV-', LPAD(i.id, 6, '0')) as display_id,
            i.patient_id,
            i.visit_id,
            i.total_amount,
            i.status,
            i.created_at,
            u.full_name as patient_name
       FROM invoices i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY i.created_at DESC`
        );
        res.json(invoices);
    } catch (err) {
        console.error('getInvoices error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/pharmacist/invoices/:id/pay
exports.recordPayment = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { method, payment_ref } = req.body;

        const allowedMethods = ['CASH', 'CARD', 'ONLINE'];
        if (!allowedMethods.includes(String(method || '').toUpperCase())) {
            return res.status(400).json({
                message: 'Invalid payment method. Use CASH, CARD, or ONLINE'
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check invoice
        const [[invoice]] = await connection.query(
            `SELECT total_amount, status FROM invoices WHERE id = ? FOR UPDATE`,
            [id]
        );

        if (!invoice) {
            await connection.rollback();
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.status === 'PAID') {
            await connection.rollback();
            return res.status(400).json({ message: 'Invoice already paid' });
        }

        // Insert payment
        await connection.query(
            `INSERT INTO invoice_payments(invoice_id, method, amount, payment_ref) VALUES(?, ?, ?, ?)`,
            [id, String(method).toUpperCase(), invoice.total_amount, payment_ref || null]
        );

        // Update invoice status
        await connection.query(
            `UPDATE invoices SET status = 'PAID' WHERE id = ?`,
            [id]
        );

        await connection.commit();
        res.json({ message: 'Payment recorded successfully' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('recordPayment error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Payment reference already exists. Please use a unique reference.'
            });
        }
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};
