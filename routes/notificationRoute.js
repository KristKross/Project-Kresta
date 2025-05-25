const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/get', notificationController.getNotification);
router.put('/mark-read', notificationController.markNotificationRead);

module.exports = router;
