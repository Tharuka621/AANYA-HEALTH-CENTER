const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");

// TEST route
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "auth route working ✅" });
});

// REAL LOGIN route
router.post("/login", login);

module.exports = router;
