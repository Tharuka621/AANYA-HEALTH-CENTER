const { pool } = require("../config/db");
const path = require('path');
const { sendLabReportReadyEmail } = require('../config/email');


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
        loi.id,
        lt.name as test_name,
        lt.type as test_type,
        lo.created_at as requested_date,
        lr.completed_at as completed_date,
        loi.status,
        du.full_name as doctor,
        lr.result_text as notes,
        lr.file_url as result_url,
        lr.id as result_id
      FROM lab_order_items loi
      JOIN lab_orders lo ON loi.lab_order_id = lo.id
      JOIN lab_tests lt ON lt.id = loi.lab_test_id
      JOIN doctors d ON lo.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
      WHERE lo.patient_id = ?
      ORDER BY lo.created_at DESC`,
            [patientId]
        );

        // Map statuses to frontend expected statuses
        const formattedOrders = labOrders.map(order => ({
            id: order.id.toString(),
            test_name: order.test_name,
            test_type: order.test_type,
            requested_date: order.requested_date,
            completed_date: order.status === 'DONE' ? order.completed_date : null,
            status: order.status === 'DONE' ? 'completed' : order.status === 'PENDING' ? 'in_progress' : 'in_progress',
            doctor: `Dr. ${order.doctor}`,
            notes: order.notes || (order.status === 'DONE' ? 'Report available' : 'Test in progress'),
            result_url: order.result_url || null,
            values: null // Values could be parsed from result_text if formatted as JSON, but we'll leave as null for now
        }));

        return res.json({
            success: true,
            data: formattedOrders
        });
    } catch (err) {
        console.error("Get lab orders error:", err);
        return res.status(500).json({
            ok: false,
            message: "Internal server error"
        });
    }
};

exports.getPendingLabOrders = async (req, res) => {
    try {
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
            WHERE loi.status = 'PENDING' AND lo.status IN('ORDERED', 'IN_PROGRESS')
            ORDER BY lo.created_at ASC
            `;
        const [items] = await pool.query(query);

        return res.json({
            ok: true,
            items
        });
    } catch (err) {
        console.error("Get pending lab orders error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
};

exports.getCompletedLabOrders = async (req, res) => {
    try {
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
            loi.status as item_status,
            lr.result_text,
            lr.file_url,
            lr.completed_at
            FROM lab_order_items loi
            JOIN lab_orders lo ON loi.lab_order_id = lo.id
            JOIN patients p ON lo.patient_id = p.id
            JOIN users pu ON p.user_id = pu.id
            JOIN doctors d ON lo.doctor_id = d.id
            JOIN users du ON d.user_id = du.id
            JOIN lab_tests lt ON loi.lab_test_id = lt.id
            LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
            WHERE loi.status = 'DONE'
            ORDER BY lr.completed_at DESC, lo.created_at DESC
            `;
        const [items] = await pool.query(query);

        return res.json({
            ok: true,
            items
        });
    } catch (err) {
        console.error("Get completed lab orders error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ORDERED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ ok: false, message: "Invalid status" });
        }

        await pool.query("UPDATE lab_orders SET status = ? WHERE id = ?", [status, id]);

        return res.json({ ok: true, message: "Order status updated successfully" });
    } catch (err) {
        console.error("Update order status error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }
};

exports.addLabResult = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { itemId } = req.params;
        const { resultText } = req.body;

        // fileUrl from uploaded PDF (via multer) or from body if no file sent
        let fileUrl = null;
        if (req.file) {
            // Store relative URL that can be served by /uploads static route
            fileUrl = `/uploads/lab-reports/${req.file.filename}`;
        } else if (req.body.fileUrl) {
            fileUrl = req.body.fileUrl;
        }

        // 1. Insert into lab_results
        await conn.query(
            "INSERT INTO lab_results (lab_order_item_id, result_text, file_url, completed_at) VALUES (?, ?, ?, NOW())",
            [itemId, resultText, fileUrl]
        );

        // 2. Update lab_order_items status to DONE
        await conn.query(
            "UPDATE lab_order_items SET status = 'DONE' WHERE id = ?",
            [itemId]
        );

        // 3. Check if all items for the parent order are DONE
        const [itemRows] = await conn.query(
            "SELECT lab_order_id FROM lab_order_items WHERE id = ?",
            [itemId]
        );

        let labOrderId = null;
        if (itemRows.length > 0) {
            labOrderId = itemRows[0].lab_order_id;

            const [pendingItems] = await conn.query(
                "SELECT id FROM lab_order_items WHERE lab_order_id = ? AND status = 'PENDING'",
                [labOrderId]
            );

            // If no pending items left, update order status to COMPLETED
            if (pendingItems.length === 0) {
                await conn.query(
                    "UPDATE lab_orders SET status = 'COMPLETED' WHERE id = ?",
                    [labOrderId]
                );
            }
        }

        await conn.commit();

        // 4. Send notification email to patient (after commit, non-blocking)
        if (labOrderId) {
            try {
                const [notifRows] = await pool.query(
                    `SELECT pu.email, pu.full_name, lt.name as test_name
                     FROM lab_orders lo
                     JOIN patients p ON lo.patient_id = p.id
                     JOIN users pu ON p.user_id = pu.id
                     JOIN lab_order_items loi ON loi.lab_order_id = lo.id
                     JOIN lab_tests lt ON lt.id = loi.lab_test_id
                     WHERE loi.id = ?
                     LIMIT 1`,
                    [itemId]
                );
                if (notifRows.length > 0) {
                    const { email, full_name, test_name } = notifRows[0];
                    // Fire-and-forget — don't await to keep response fast
                    sendLabReportReadyEmail(email, full_name, test_name).catch(err =>
                        console.error('Lab report email failed:', err)
                    );
                }
            } catch (emailErr) {
                console.error('Failed to look up patient for lab email:', emailErr);
            }
        }

        return res.json({ ok: true, message: "Lab result added successfully", fileUrl });
    } catch (err) {
        await conn.rollback();
        console.error("Add lab result error:", err);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    } finally {
        conn.release();
    }
};
