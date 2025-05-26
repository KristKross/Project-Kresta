const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Register, Login, Logout
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// User Details
router.get("/user", authController.getUser);

// User Update
router.patch("/update", authController.updateUser);
router.patch("/update-password", authController.updatePassword);

// Delete Account
router.delete("/delete", authController.deleteAccount);

// Profile Picture
router.get('/profile-picture/:folderName/:publicId', authController.getProfilePicture);

// Update Pricing
router.patch('/update-pricing', authController.updatePricing);

module.exports = router;