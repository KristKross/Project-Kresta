const axios = require("axios");
const { getSocialCredentials } = require("../utils/socialUtil");

exports.getInstagramAccountAnalytics = async (req, res) => {
    try {
        const { instagramAccountId, accessToken } = await getSocialCredentials(req);

        if (!instagramAccountId || !accessToken) {
            return res.status(400).json({
                error: "Missing required parameters: instagramAccountId and accessToken.",
            });
        }

        const response = await axios.get(
            `https://graph.facebook.com/v22.0/${instagramAccountId}/insights`, {
                params: {
                    metric: "accounts_engaged,follows_and_unfollows,comments,likes,reach,replies,shares,total_interactions,views",
                    metric_type: "total_value",
                    period: "day",
                    access_token: accessToken,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        if (error.status === 403) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({
            error: "Failed to retrieve Instagram account analytics.",
        });
    }
};