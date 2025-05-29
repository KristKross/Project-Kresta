const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Contact form submission
router.post('/', contactController.sendContactMessage);

module.exports = router;
