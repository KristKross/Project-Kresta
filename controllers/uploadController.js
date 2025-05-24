const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('imageFile');

// @route POST /api/upload-image
exports.uploadMediaToCloudinary = async (req, res) => {
    console.log('Received file:', req.file);
    console.log('Resource type:', req.body.resourceType);
    
    try {
        const { resourceType } = req.body;

        if (!req.file || !resourceType) {
            return res.status(400).json({ error: "File and resource type are required" });
        }

        const folder = resourceType === "video" ? "post_videos" : "post_images";

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder, type: "authenticated", resource_type: resourceType },
              (error, result) => (error ? reject(error) : resolve(result))
            );
            uploadStream.end(req.file.buffer);
        });

        if (!uploadResult?.public_id) {
            return res.status(500).json({ error: "Cloudinary upload failed" });
        }

        res.status(201).json({
            success: true,
            message: "Media uploaded successfully",
            publicId: uploadResult.public_id,
            resourceType: resourceType,
        });

    } catch (error) {
        console.error("Error uploading media:", error);
        res.status(500).json({ error: "Failed to upload media" });
    }
};


// @route GET /api/profile-picture/:publicId
exports.getProfilePicture = async (req, res) => {
    try {
        const { publicId } = req.params;
        if (!publicId) return res.status(400).json({ error: "Image ID required" });

        const signedUrl = cloudinary.url(publicId, { sign_url: true, type: "authenticated" });

        res.json({ success: true, imageUrl: signedUrl });

    } catch (error) {
        console.error("Error retrieving profile picture:", error);
        res.status(500).json({ error: "Error retrieving profile picture" });
    }
};

// @route GET /api/post-media/:publicId
exports.getPostMedia = async (req, res) => {
    try {
        const { publicId, resourceType } = req.params;
        if (!publicId || !resourceType) return res.status(400).json({ error: "Media ID and resource type required" });

        const signedUrl = cloudinary.url(publicId, { sign_url: true, type: "authenticated", resource_type: resourceType });

        res.json({ success: true, mediaUrl: signedUrl });

    } catch (error) {
        console.error("Error retrieving media:", error);
        res.status(500).json({ error: "Error retrieving media" });
    }
};
