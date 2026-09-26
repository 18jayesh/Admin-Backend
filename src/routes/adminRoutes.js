const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

// Step 1: Register Admin
router.post("/register", registerAdmin);

// Step 2: Login Admin
router.post("/login", loginAdmin);

module.exports = router;
