const axios = require('axios');
const Post = require('../models/Post');
const Social = require('../models/Social');
const { getSocialCredentials } = require('../utils/social');
const { getWorkspace } = require('../utils/workspace');

const cloudinary = require('../config/cloudinary');

exports.createPost = async (req, res) => {
    const { title, caption, scheduled, scheduledTime, mediaPublicId, resourceType } = req.body;

    try {
        const workspace = await getWorkspace(req);
        
        const userId = req.session.userData.user._id;

        const social = await Social.findOne({ userId });
        if (!social || !social.instagramAccountId || !social.instagramAccessToken) {
            throw new Error('Instagram account not connected');
        }

        const signedMediaUrl = cloudinary.url(mediaPublicId, {
            sign_url: true,
            type: "authenticated",
            resource_type: resourceType
        });

        const { instagramAccountId, accessToken } = await getSocialCredentials(req);
        const mediaContainer = await axios.post(
            `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
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

        let publishAtUnix = Math.floor(Date.now() / 1000);
        if (scheduledTime) {
            const scheduledDate = new Date(scheduledTime);
            if (!isNaN(scheduledDate.getTime())) {
                publishAtUnix = Math.floor(scheduledDate.getTime() / 1000);
            }
        }

        let igPostId = null;
        if (publishAtUnix) {
            const publishResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
                {
                    creation_id: creationId,
                    access_token: accessToken,
                    publish_at: publishAtUnix,
                }
            );

            if (!publishResponse.data.id) {
                throw new Error("Failed to publish Instagram post");
            }

            igPostId = publishResponse.data.id;

            if (scheduled === 'posted') {
                return res.status(201).json({
                    message: 'Post published immediately on Instagram',
                });
            }
        }

        const post = new Post({
            title,
            workspace: workspace ? workspace._id : null,
            userId,
            socialId: social._id,
            caption,
            mediaPublicId,
            resourceType,
            scheduledTime: publishAtUnix,
            igPostId: igPostId,
        });

        await post.save();

        return res.status(201).json({
            message: 'Post scheduled successfully on Instagram',
        });

    } catch (err) {
        console.error("Error Creating Post:", err?.response?.data || err);
        res.status(500).json({ error: 'Failed to create Instagram post' });
    }
};