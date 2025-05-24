const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/upload', uploadController.uploadMiddleware, uploadController.uploadImageToCloudinary);
router.post('/delete/:imageId', uploadController.deleteImageFromCloudinary);

module.exports = router;
