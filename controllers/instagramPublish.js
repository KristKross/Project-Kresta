const axios = require('axios');
const { getSocialCredentials } = require('../utils/socialUtil');
const cloudinary = require('../config/cloudinary');

exports.createPost = async (req, res) => {
    const { caption, mediaPublicId, resourceType } = req.body;

    try {
        const signedMediaUrl = cloudinary.url(mediaPublicId, {
            sign_url: true,
            type: "authenticated",
            resource_type: resourceType
        });

        const { instagramAccountId, accessToken } = await getSocialCredentials(req);
        const mediaContainer = await axios.post(
            `https://graph.facebook.com/v22.0/${instagramAccountId}/media`,
            {
                [`${resourceType}_url`]: signedMediaUrl,
                caption,
                access_token: accessToken,
            }
        );

        if (!mediaContainer.data.id) {
            throw new Error("Failed to create Instagram media container");
        }

        const creationId = mediaContainer.data.id;

        const publishResponse = await axios.post(
            `https://graph.facebook.com/v22.0/${instagramAccountId}/media_publish`,
            {
                creation_id: creationId,
                access_token: accessToken,
            }
        );

        if (!publishResponse.data.id) {
            throw new Error("Failed to publish Instagram post");
        }

        return res.status(201).json({
            message: 'Post published successfully on Instagram',
        });

    } catch (err) {
        console.error("Error Creating Post:", err?.response?.data || err);
        res.status(500).json({ error: 'Failed to create Instagram post' });
    }
};