const express = require("express");
const socialAuthController = require("../controllers/socialsController");

const router = express.Router();

// Social Authentication Routes
router.get("/facebook", socialAuthController.facebookLogin);
router.get("/facebook/callback", socialAuthController.facebookCallback);

module.exports = router;