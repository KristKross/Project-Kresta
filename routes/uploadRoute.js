const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/upload-media', uploadController.uploadMiddleware, uploadController.uploadMediaToCloudinary);
router.get('/post-media/:folderName/:publicId/:resourceType', uploadController.getPostMedia)
router.delete('/delete-media/:folderName/:publicId/:resourceType', uploadController.deleteMediaFromCloudinary);

module.exports = router;
