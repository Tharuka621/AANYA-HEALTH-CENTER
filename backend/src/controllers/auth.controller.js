const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    // get user by email
    const [rows] = await pool.query(
  `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active,
          r.name AS role
   FROM users u
   JOIN roles r ON r.id = u.role_id
   WHERE u.email = ? LIMIT 1`,
  [email]
);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    // compare password with hash
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      ok: true,
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.signup = async (req, res) => {
  let connection;
  
  try {
    const { full_name, email, phone, password, nic, allergies } = req.body;

    // Validate required fields
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        ok: false,
        message: "Full name, email, phone, and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid email format",
      });
    }

    // Validate password length (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Get database connection for transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if email already exists
    const [emailCheck] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    
    if (emailCheck.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        ok: false,
        message: "Email already exists",
      });
    }

    // Check if phone already exists
    const [phoneCheck] = await connection.query(
      "SELECT id FROM users WHERE phone = ? LIMIT 1",
      [phone]
    );
    
    if (phoneCheck.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        ok: false,
        message: "Phone already exists",
      });
    }

    // Get PATIENT role_id
    const [roleRows] = await connection.query(
      "SELECT id FROM roles WHERE name = 'PATIENT' LIMIT 1"
    );
    
    if (roleRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(500).json({
        ok: false,
        message: "Patient role not found in database",
      });
    }

    const patientRoleId = roleRows[0].id;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      [full_name, email, phone, password_hash, patientRoleId]
    );

    const userId = userResult.insertId;

    // Insert into patients table
    const [patientResult] = await connection.query(
      `INSERT INTO patients (user_id, nic, created_at)
       VALUES (?, ?, NOW())`,
      [userId, nic || null]
    );

    const patientId = patientResult.insertId;

    // Handle allergies (can be array or comma-separated string)
    if (allergies) {
      let allergyList = [];
      
      if (Array.isArray(allergies)) {
        allergyList = allergies.filter(a => a && a.trim().length > 0);
      } else if (typeof allergies === 'string' && allergies.trim().length > 0) {
        allergyList = allergies.split(',').map(a => a.trim()).filter(a => a.length > 0);
      }
      
      // Insert allergies (ignore duplicates with INSERT IGNORE)
      for (const allergy of allergyList) {
        await connection.query(
          `INSERT IGNORE INTO patient_allergies (patient_id, allergy_name, created_at)
           VALUES (?, ?, NOW())`,
          [patientId, allergy]
        );
      }
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role: "PATIENT" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(201).json({
      ok: true,
      message: "Signup successful ✅",
      token,
      user: {
        id: userId,
        full_name,
        email,
        role: "PATIENT",
      },
    });

  } catch (err) {
    // Rollback on any error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error during signup",
    });
  }
};
