const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/upload-media', uploadController.uploadMiddleware, uploadController.uploadMediaToCloudinary);
router.get('/profile-picture/:publicId', uploadController.getProfilePicture);
router.get('/post-media/:publicId', uploadController.getPostMedia)

module.exports = router;
