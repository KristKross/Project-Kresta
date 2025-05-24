const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('imageFile');

// @route POST /api/upload
exports.uploadImageToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ 
        folder: "user_pictures",
        type: "authenticated",
        resource_type: 'image' 
      },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageUrl: uploadResult.secure_url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// @route DELETE /api/delete/:imageId
exports.deleteImageFromCloudinary = async (req, res) => {
  try {
    const { imageId } = req.params;
    if (!imageId) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const result = await cloudinary.uploader.destroy(imageId);

    if (result.result !== 'ok') {
      return res.status(500).json({ error: 'Failed to delete image' });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
    console.log(`Image ${imageId} deleted successfully from Cloudinary.`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the image' });
  }
};
