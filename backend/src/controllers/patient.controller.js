const { pool } = require('../config/db');

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
          u.id AS user_id,
          u.full_name,
          u.email,
          u.phone,
          p.id AS patient_id,
          p.nic,
          p.dob,
          p.gender,
          p.address,
          p.emergency_contact_name,
          p.emergency_contact_phone,
          p.created_at
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = rows[0];

    if (!profile.patient_id) {
      const [insertResult] = await pool.query(
        'INSERT INTO patients (user_id, created_at) VALUES (?, NOW())',
        [userId]
      );
      profile.patient_id = insertResult.insertId;
    }

    const [allergyRows] = await pool.query(
      `SELECT allergy_name
       FROM patient_allergies
       WHERE patient_id = ?
       ORDER BY allergy_name ASC`,
      [profile.patient_id]
    );

    return res.json({
      ok: true,
      profile: {
        user_id: profile.user_id,
        patient_id: profile.patient_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        nic: profile.nic,
        dob: profile.dob,
        gender: profile.gender,
        address: profile.address,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        created_at: profile.created_at,
        allergies: allergyRows.map((row) => row.allergy_name),
      },
    });
  } catch (err) {
    console.error('GET MY PROFILE ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      full_name,
      phone,
      nic,
      dob,
      gender,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      allergies,
    } = req.body;

    if (!full_name || !String(full_name).trim()) {
      await connection.rollback();
      return res.status(400).json({ message: 'Full name is required' });
    }

    await connection.query(
      `UPDATE users
       SET full_name = ?, phone = ?
       WHERE id = ?`,
      [String(full_name).trim(), phone || null, userId]
    );

    const [patientRows] = await connection.query(
      'SELECT id FROM patients WHERE user_id = ? LIMIT 1',
      [userId]
    );

    let patientId;
    if (!patientRows.length) {
      const [insertResult] = await connection.query(
        `INSERT INTO patients
         (user_id, nic, dob, gender, address, emergency_contact_name, emergency_contact_phone, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          nic || null,
          dob || null,
          gender || null,
          address || null,
          emergency_contact_name || null,
          emergency_contact_phone || null,
        ]
      );
      patientId = insertResult.insertId;
    } else {
      patientId = patientRows[0].id;
      await connection.query(
        `UPDATE patients
         SET nic = ?,
             dob = ?,
             gender = ?,
             address = ?,
             emergency_contact_name = ?,
             emergency_contact_phone = ?
         WHERE id = ?`,
        [
          nic || null,
          dob || null,
          gender || null,
          address || null,
          emergency_contact_name || null,
          emergency_contact_phone || null,
          patientId,
        ]
      );
    }

    const allergyList = Array.isArray(allergies)
      ? allergies.map((a) => String(a).trim()).filter(Boolean)
      : [];

    await connection.query(
      'DELETE FROM patient_allergies WHERE patient_id = ?',
      [patientId]
    );

    for (const allergyName of allergyList) {
      await connection.query(
        'INSERT INTO patient_allergies (patient_id, allergy_name) VALUES (?, ?)',
        [patientId, allergyName]
      );
    }

    await connection.commit();
    return res.json({ ok: true, message: 'Profile updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('UPDATE MY PROFILE ERROR:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};
