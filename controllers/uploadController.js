const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('imageFile');

// @route POST /api/upload-media
exports.uploadMediaToCloudinary = async (req, res) => {
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

// @route GET /api/post-media/:folderName/:publicId/:resourceType
exports.getPostMedia = async (req, res) => {
    try {
        const { folderName, publicId, resourceType } = req.params;
        const path = `${folderName}/${publicId}`;

        if (!publicId || !resourceType) return res.status(400).json({ error: "Media ID and resource type required" });

        const signedUrl = cloudinary.url(path, {
          sign_url: true,
          type: "authenticated",
          resource_type: resourceType
        });

        res.json({ success: true, mediaUrl: signedUrl });

    } catch (error) {
        console.error("Error retrieving media:", error);
        res.status(500).json({ error: "Error retrieving media" });
    }
};

// @route DELETE /api/delete-media/:folderName/:publicId/:resourceType
exports.deleteMediaFromCloudinary = async (req, res) => {
    try {
        const { folderName, publicId, resourceType } = req.params;

        if (!folderName || !publicId || !resourceType) {
            return res.status(400).json({ error: "Folder name, public ID, and resource type are required" });
        }

        const fullPublicId = `${folderName}/${publicId}`;

        console.log("Attempting to delete:", fullPublicId);

        const result = await cloudinary.uploader.destroy(fullPublicId, {
            sign_url: true,
            type: "authenticated",
            resource_type: resourceType
        });

        if (result.result !== "ok") {
            return res.status(500).json({ error: "Failed to delete media" }); 
        }

        res.status(200).json({ success: true, message: "Media deleted successfully" });

    } catch (error) {
        console.error("Error deleting media:", error);
        res.status(500).json({ error: "Error deleting media" });
    }
};
