const axios = require("axios");
const { getSocialCredentials } = require("../utils/social");

// Get Instagram Business Account Metadata
exports.getInstagramMetadata = async (req, res) => {
    try {
        const { instagramAccountId, accessToken } = await getSocialCredentials(req);

        if (!instagramAccountId) {
        return res.status(400).json({ error: "Instagram Business Account ID not found." });
        }

        // Fetch Instagram metadata
        const response = await axios.get(`https://graph.facebook.com/v22.0/${instagramAccountId}`, {
        params: {
            fields: "name,username,profile_picture_url,followers_count,media_count",
            access_token: accessToken,
        }
        });

        res.json(response.data);
    } catch (error) {

        console.error("Instagram Metadata Error:", error.response?.data || error.message);
        res.status(500).send("Error retrieving Instagram account metadata");
    }
};

// Get User's Instagram Posts
exports.getInstagramPosts = async (req, res) => {
    try {
        const { instagramAccountId, accessToken } = await getSocialCredentials(req);

        const response = await axios.get(`https://graph.facebook.com/v22.0/${instagramAccountId}/media`, {
        params: {
            fields: "id,caption,media_url,permalink,timestamp",
            access_token: accessToken,
        }
        });
        res.json(response.data);

    } catch (error) {
        console.error("Instagram Posts Fetch Error:", error.response?.data || error.message);
        res.status(500).send("Error fetching Instagram posts");
    }
};

// Get Comments for a Post
exports.getInstagramComments = async (req, res) => {
    try {
        const { accessToken } = await getSocialCredentials(req);
        const { post_id } = req.params;

        const response = await axios.get(`https://graph.facebook.com/v22.0/${post_id}/comments`, {
        params: {
            fields: "id,text,username",
            access_token: accessToken,
        }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Instagram Comments Fetch Error:", error.response?.data || error.message);
        res.status(500).send("Error fetching comments");
    }
};

// Reply to a Comment
exports.replyToComment = async (req, res) => {
    try {
        const { accessToken } = await getSocialCredentials(req);
        const { comment_id, message } = req.body;

        const response = await axios.post(`https://graph.facebook.com/v22.0/${comment_id}/replies`, {
        params: {
            message,
            access_token: accessToken,
        },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Instagram Reply Error:", error.response?.data || error.message);
        res.status(500).send("Error replying to comment");
    }
};
