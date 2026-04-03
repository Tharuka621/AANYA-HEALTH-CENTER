const { pool } = require('../config/db');

const parseDDMMYYYY = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split('/').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
};

const formatTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 5);
};

const isWithinDateRange = (value, filters) => {
  const targetDate = value ? new Date(value) : null;
  if (!targetDate || Number.isNaN(targetDate.getTime())) return false;

  const from = parseDDMMYYYY(filters.dateFrom);
  const to = parseDDMMYYYY(filters.dateTo);

  if (from && targetDate < from) return false;
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    if (targetDate > endOfDay) return false;
  }

  return true;
};

const normalizeReportType = (value) => String(value || '').toUpperCase();

const buildVitalsSummary = (row) => {
  const parts = [];
  if (row.systolic_bp || row.diastolic_bp) {
    parts.push(`BP: ${row.systolic_bp || '-'}${row.diastolic_bp ? `/${row.diastolic_bp}` : ''}`);
  }
  if (row.temperature) {
    parts.push(`Temp: ${row.temperature}`);
  }
  if (row.pulse) {
    parts.push(`Pulse: ${row.pulse}`);
  }
  if (row.weight) {
    parts.push(`Weight: ${row.weight}`);
  }
  if (row.sugar_level) {
    parts.push(`Sugar: ${row.sugar_level}`);
  }
  return parts.join(', ') || 'No vitals recorded';
};

const buildPatientVisitReport = async (filters) => {
  const [rows] = await pool.query(
    `SELECT
        a.id,
        a.status,
        a.reason,
        a.created_at,
        a.check_in_time,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') AS start_time,
        p.id AS patient_id,
        pu.full_name AS patient_name,
        d.id AS doctor_id,
        du.full_name AS doctor_name,
        v.id AS visit_id,
        v.status AS visit_status,
        v.diagnosis,
        pv.temperature,
        pv.systolic_bp,
        pv.diastolic_bp,
        pv.pulse,
        pv.weight,
        pv.sugar_level
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

  const mapped = rows
    .filter((row) => isWithinDateRange(row.slot_date || row.created_at, filters))
    .map((row) => ({
      visitId: String(row.visit_id || row.id),
      patientName: row.patient_name || 'Unknown Patient',
      patientId: String(row.patient_id || ''),
      doctorName: row.doctor_name || 'Unknown Doctor',
      checkInTime: formatTime(row.check_in_time || row.start_time),
      diagnosis: row.diagnosis || row.reason || 'Not recorded',
      vitalsSummary: buildVitalsSummary(row),
      status: String(row.visit_status || row.status || 'checked_in').toLowerCase(),
      date: formatDate(row.slot_date || row.created_at),
    }))
    .filter((row) => {
      const patientMatch = !filters.patientId || row.patientId === String(filters.patientId);
      const statusMatch = !filters.status || row.status === String(filters.status).toLowerCase();
      const doctorMatch = !filters.doctorId || row.doctorName.toLowerCase().includes(String(filters.doctorId).toLowerCase());
      return patientMatch && statusMatch && doctorMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      completed: mapped.filter((row) => row.status === 'completed').length,
      checkedIn: mapped.filter((row) => row.status === 'checked_in').length,
    },
  };
};

const buildLabTestReport = async (filters) => {
  const [rows] = await pool.query(
    `SELECT
        loi.id,
        loi.lab_order_id,
        lo.created_at AS requested_date,
        loi.status AS item_status,
        lr.result_text,
        lr.completed_at,
        p.id AS patient_id,
        pu.full_name AS patient_name,
        lt.name AS test_name,
        lt.type AS test_type,
        du.full_name AS doctor_name,
        NULL AS lab_tech_name
     FROM lab_order_items loi
     JOIN lab_orders lo ON lo.id = loi.lab_order_id
     JOIN patients p ON p.id = lo.patient_id
     JOIN users pu ON pu.id = p.user_id
     JOIN lab_tests lt ON lt.id = loi.lab_test_id
     JOIN doctors d ON d.id = lo.doctor_id
     JOIN users du ON du.id = d.user_id
     LEFT JOIN lab_results lr ON lr.lab_order_item_id = loi.id
     ORDER BY lo.created_at DESC, loi.id DESC`
  );

  const mapped = rows
    .filter((row) => isWithinDateRange(row.requested_date, filters))
    .map((row) => ({
      labOrderId: String(row.lab_order_id),
      patientName: row.patient_name || 'Unknown Patient',
      patientId: String(row.patient_id || ''),
      testName: row.test_name || 'Unknown Test',
      orderedDate: formatDate(row.requested_date),
      resultValue: row.result_text || 'Pending',
      resultStatus: String(row.item_status || 'pending').toLowerCase(),
      labTechName: row.lab_tech_name || undefined,
      completedDate: row.completed_at ? formatDate(row.completed_at) : undefined,
    }))
    .filter((row) => {
      const statusMatch = !filters.resultStatus || row.resultStatus === String(filters.resultStatus).toLowerCase();
      const typeMatch = !filters.testType || row.testName.toLowerCase().includes(String(filters.testType).toLowerCase());
      return statusMatch && typeMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      completed: mapped.filter((row) => row.resultStatus === 'completed').length,
      pending: mapped.filter((row) => row.resultStatus === 'pending').length,
    },
  };
};

const buildPrescriptionReport = async (filters) => {
  const [rows] = await pool.query(
    `SELECT
        pr.id,
        pr.visit_id,
        pr.patient_id,
        pr.doctor_id,
        pr.instructions,
        pr.status,
        pr.created_at,
        pu.full_name AS patient_name,
        du.full_name AS doctor_name
     FROM prescriptions pr
     JOIN patients p ON p.id = pr.patient_id
     JOIN users pu ON pu.id = p.user_id
     JOIN doctors d ON d.id = pr.doctor_id
     JOIN users du ON du.id = d.user_id
     ORDER BY pr.created_at DESC`
  );

  const [itemRows] = await pool.query(
    `SELECT
        pi.prescription_id,
        pi.medicine_id,
        pi.dosage,
        pi.duration_days,
        pi.qty,
        m.name AS medicine_name
     FROM prescription_items pi
     LEFT JOIN medicines m ON m.id = pi.medicine_id`
  );

  const itemsByPrescription = itemRows.reduce((acc, item) => {
    const key = String(item.prescription_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const mapped = rows
    .filter((row) => isWithinDateRange(row.created_at, filters))
    .flatMap((row) => {
      const items = itemsByPrescription[String(row.id)] || [];
      if (items.length === 0) {
        return [{
          prescriptionId: `RX-${row.id}`,
          patientName: row.patient_name || 'Unknown Patient',
          patientId: String(row.patient_id || ''),
          doctorName: row.doctor_name || 'Unknown Doctor',
          medicineName: 'No items',
          qty: 0,
          dosage: '-',
          durationDays: 0,
          issuedQty: 0,
          prescribedDate: formatDate(row.created_at),
        }];
      }

      return items.map((item) => ({
        prescriptionId: `RX-${row.id}`,
        patientName: row.patient_name || 'Unknown Patient',
        patientId: String(row.patient_id || ''),
        doctorName: row.doctor_name || 'Unknown Doctor',
        medicineName: item.medicine_name || 'Unknown Medicine',
        qty: Number(item.qty || 0),
        dosage: item.dosage || '-',
        durationDays: Number(item.duration_days || 0),
        issuedQty: String(row.status || '').toUpperCase() === 'ACTIVE' ? Number(item.qty || 0) : 0,
        prescribedDate: formatDate(row.created_at),
      }));
    })
    .filter((row) => {
      const medicineMatch = !filters.medicineId || row.medicineName.toLowerCase().includes(String(filters.medicineId).toLowerCase());
      const issuedMatch = !filters.issuedOnly || Number(row.issuedQty || 0) > 0;
      const doctorMatch = !filters.doctorId || row.doctorName.toLowerCase().includes(String(filters.doctorId).toLowerCase());
      return medicineMatch && issuedMatch && doctorMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      totalPrescribedQty: mapped.reduce((sum, row) => sum + row.qty, 0),
      totalIssuedQty: mapped.reduce((sum, row) => sum + Number(row.issuedQty || 0), 0),
    },
  };
};

const buildInventoryReport = async (filters) => {
  const [rows] = await pool.query(
    `SELECT
        ib.id,
        ib.medicine_id,
        m.name,
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

  const today = new Date();
  const mapped = rows
    .map((row) => {
      const expiryDate = row.expiry_date ? new Date(row.expiry_date) : null;
      const daysUntilExpiry = expiryDate && !Number.isNaN(expiryDate.getTime())
        ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : undefined;
      const quantity = Number(row.stock_quantity || 0);
      const reorderLevel = Number(row.reorder_level || 0);
      let status = 'ok';
      if (typeof daysUntilExpiry === 'number' && daysUntilExpiry <= 30) {
        status = 'expiring';
      } else if (quantity <= reorderLevel) {
        status = 'low';
      }

      return {
        medicineId: String(row.medicine_id || row.id),
        medicineName: row.name || 'Unknown Medicine',
        batchNo: row.batch_no || 'N/A',
        qtyRemaining: quantity,
        expiryDate: formatDate(row.expiry_date),
        reorderLevel,
        status,
        daysUntilExpiry,
      };
    })
    .filter((row) => {
      const lowStockMatch = !filters.lowStockOnly || row.status === 'low';
      const medicineMatch = !filters.medicineId || row.medicineName.toLowerCase().includes(String(filters.medicineId).toLowerCase());
      const expiryMatch = !filters.expiringWithinDays || (typeof row.daysUntilExpiry === 'number' && row.daysUntilExpiry <= filters.expiringWithinDays);
      return lowStockMatch && medicineMatch && expiryMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      lowStock: mapped.filter((row) => row.status === 'low').length,
      expiringSoon: mapped.filter((row) => row.status === 'expiring').length,
      totalQty: mapped.reduce((sum, row) => sum + row.qtyRemaining, 0),
    },
  };
};

const buildReportData = async (type, filters) => {
  switch (type) {
    case 'PATIENT_VISIT':
      return buildPatientVisitReport(filters);
    case 'LAB_TEST':
      return buildLabTestReport(filters);
    case 'PRESCRIPTION':
      return buildPrescriptionReport(filters);
    case 'INVENTORY':
      return buildInventoryReport(filters);
    default:
      return { data: [], summary: { totalRecords: 0 } };
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { type, title, filters } = req.body;
    const normalizedType = normalizeReportType(type);

    const allowedTypes = ['PATIENT_VISIT', 'LAB_TEST', 'PRESCRIPTION', 'INVENTORY'];
    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const reportTitle = String(title || `${normalizedType} Report`).trim();
    const generatedAt = new Date().toLocaleString('en-GB');
    const reportId = `RPT-${Date.now()}`;

    const reportResult = await buildReportData(normalizedType, filters || {});
    const preview = {
      reportId,
      type: normalizedType,
      data: reportResult.data,
      summary: reportResult.summary,
      generatedAt,
    };

    const createdDate = new Date().toLocaleDateString('en-GB');
    const [creatorRows] = await pool.query(
      `SELECT full_name FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    const createdBy = creatorRows[0]?.full_name || 'Admin';

    await pool.query(
      `INSERT INTO saved_reports
        (report_id, title, type, status, created_by, created_by_user_id, created_date, last_modified, generated_at, filters_json, preview_json)
       VALUES (?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?)` ,
      [
        reportId,
        reportTitle,
        normalizedType,
        createdBy,
        req.user.id,
        createdDate,
        createdDate,
        generatedAt,
        JSON.stringify(filters || {}),
        JSON.stringify(preview),
      ]
    );

    return res.status(201).json({ ok: true, preview });
  } catch (err) {
    console.error('GENERATE REPORT ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSavedReports = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          report_id AS id,
          title,
          type,
          status,
          created_by AS createdBy,
          created_date AS createdDate,
          last_modified AS lastModified
       FROM saved_reports
       ORDER BY created_at DESC`
    );

    return res.json({ ok: true, reports: rows });
  } catch (err) {
    console.error('GET SAVED REPORTS ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getReportPreview = async (req, res) => {
  try {
    const { reportId } = req.params;
    const [rows] = await pool.query(
      `SELECT preview_json FROM saved_reports WHERE report_id = ? LIMIT 1`,
      [reportId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json({ ok: true, preview: JSON.parse(rows[0].preview_json) });
  } catch (err) {
    console.error('GET REPORT PREVIEW ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const [result] = await pool.query(
      `DELETE FROM saved_reports WHERE report_id = ?`,
      [reportId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json({ ok: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error('DELETE REPORT ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
