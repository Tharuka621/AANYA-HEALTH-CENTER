const express = require("express");
const router = express.Router();

const { login, signup } = require("../controllers/auth.controller");

// TEST route
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "auth route working ✅" });
});

// AUTH routes
router.post("/login", login);
router.post("/signup", signup);

module.exports = router;
