const express = require("express");
const router = express.Router();

const { login, signup, forgotPassword, verifyOTP, resetPassword, verifyEmail, resendVerificationEmail, logout } = require("../controllers/auth.controller");

// TEST route
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "auth route working ✅" });
});

// AUTH routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

module.exports = router;
