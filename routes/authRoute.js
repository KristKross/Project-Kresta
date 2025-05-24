const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// User Authentication Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", authController.getUser);
router.patch("/update", authController.updateUser);

module.exports = router;