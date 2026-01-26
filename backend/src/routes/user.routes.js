const express = require("express");
const router = express.Router();

const { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus,
  getUserById,
  deleteUser 
} = require("../controllers/user.controller");

const { authenticate, isAdmin } = require("../middlewares/auth.middleware");

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", toggleUserStatus);
router.delete("/users/:userId", deleteUser);

module.exports = router;
