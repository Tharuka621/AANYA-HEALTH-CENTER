const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { sendOTPEmail, sendVerificationEmail } = require("../config/email");


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
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Full name, email, and password are required",
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

    // Insert into users table - default role is PATIENT
    const [userResult] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [full_name, email, password_hash, patientRoleId]
    );

    const userId = userResult.insertId;

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await connection.query(
      "INSERT INTO email_verification_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Commit transaction
    await connection.commit();
    connection.release();

    // Send verification email
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail signup if email fails
    }

    return res.status(201).json({
      ok: true,
      message: "Signup successful! Please check your email to verify your account.",
      requiresVerification: true,
      email: email,
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

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const [users] = await pool.query(
      "SELECT id, full_name FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No account found with this email address",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing unused OTPs for this email
    await pool.query(
      "DELETE FROM password_reset_otps WHERE email = ? AND is_used = FALSE",
      [email]
    );

    // Store OTP in database
    await pool.query(
      "INSERT INTO password_reset_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    return res.json({
      ok: true,
      message: "OTP has been sent to your email address",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: err.message === 'Failed to send OTP email' 
        ? "Failed to send OTP email. Please check your email configuration."
        : "Internal server error",
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        ok: false,
        message: "Email and OTP are required",
      });
    }

    // Find valid OTP
    const [otps] = await pool.query(
      `SELECT id FROM password_reset_otps 
       WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.json({
      ok: true,
      message: "OTP verified successfully",
      otpId: otps[0].id,
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Reset password with verified OTP
exports.resetPassword = async (req, res) => {
  let connection;
  
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Get database connection for transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify OTP is valid and not used
    const [otps] = await connection.query(
      `SELECT id FROM password_reset_otps 
       WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (otps.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        ok: false,
        message: "Invalid or expired OTP",
      });
    }

    const otpId = otps[0].id;

    // Check if user exists
    const [users] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await connection.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [password_hash, email]
    );

    // Mark OTP as used
    await connection.query(
      "UPDATE password_reset_otps SET is_used = TRUE WHERE id = ?",
      [otpId]
    );

    // Commit transaction
    await connection.commit();
    connection.release();

    return res.json({
      ok: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  let connection;
  
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        ok: false,
        message: "Email and OTP are required",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify OTP is valid and not used
    const [otps] = await connection.query(
      `SELECT id FROM email_verification_otps 
       WHERE email = ? AND otp = ? AND is_used = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [email, otp]
    );

    if (otps.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        ok: false,
        message: "Invalid or expired OTP",
      });
    }

    const otpId = otps[0].id;

    // Check if user exists
    const [users] = await connection.query(
      "SELECT id, full_name, role_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Get role name
    const [roles] = await connection.query(
      "SELECT name FROM roles WHERE id = ? LIMIT 1",
      [user.role_id]
    );

    const roleName = roles.length > 0 ? roles[0].name : "PATIENT";

    // Mark email as verified
    await connection.query(
      "UPDATE users SET is_email_verified = TRUE WHERE email = ?",
      [email]
    );

    // Mark OTP as used
    await connection.query(
      "UPDATE email_verification_otps SET is_used = TRUE WHERE id = ?",
      [otpId]
    );

    // Commit transaction
    await connection.commit();
    connection.release();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: roleName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      ok: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: email,
        role: roleName,
      },
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const [users] = await pool.query(
      "SELECT is_email_verified FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    if (users[0].is_email_verified) {
      return res.status(400).json({
        ok: false,
        message: "Email already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old unused OTPs
    await pool.query(
      "DELETE FROM email_verification_otps WHERE email = ? AND is_used = FALSE",
      [email]
    );

    // Store new OTP
    await pool.query(
      "INSERT INTO email_verification_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Send verification email
    await sendVerificationEmail(email, otp);

    return res.json({
      ok: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    console.error("RESEND VERIFICATION EMAIL ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};
