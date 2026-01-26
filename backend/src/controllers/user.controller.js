const { pool } = require("../config/db");

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
              r.name AS role, r.id AS role_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    );

    return res.json({
      ok: true,
      users: rows,
    });
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    console.error("Error details:", err.message);
    console.error("SQL Error code:", err.code);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message,
      code: err.code 
    });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ 
        message: "User ID and role are required" 
      });
    }

    // Validate role exists
    const [roleRows] = await pool.query(
      "SELECT id FROM roles WHERE name = ? LIMIT 1",
      [role.toUpperCase()]
    );

    if (roleRows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid role specified" 
      });
    }

    const roleId = roleRows[0].id;

    // Update user role
    const [result] = await pool.query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roleId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Get updated user info
    const [userRows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active,
              r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    return res.json({
      ok: true,
      message: "User role updated successfully",
      user: userRows[0],
    });
  } catch (err) {
    console.error("UPDATE USER ROLE ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle user active status (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (!userId || is_active === undefined) {
      return res.status(400).json({ 
        message: "User ID and status are required" 
      });
    }

    const [result] = await pool.query(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (err) {
    console.error("TOGGLE USER STATUS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
              r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ 
        message: "You cannot delete your own account" 
      });
    }

    // Check if user exists
    const [userRows] = await pool.query(
      "SELECT id, full_name FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Delete user (this will cascade delete related records if configured)
    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    return res.json({
      ok: true,
      message: `User ${userRows[0].full_name} deleted successfully`,
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      error: err.message 
    });
  }
};
