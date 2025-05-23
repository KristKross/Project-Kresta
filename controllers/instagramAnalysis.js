const axios = require("axios");
const { getSocialCredentials } = require("../utils/social");

// Get Instagram Business Account Analytics
exports.getInstagramAccountAnalytics = async (req, res) => {
    try {
        const { instagramAccountId, accessToken } = await getSocialCredentials(req);

        if (!instagramAccountId || !accessToken) {
            return res.status(400).json({
            error: "Missing required parameters: instagramAccountId and accessToken.",
        });
    }

    const response = await axios.get(
        `https://graph.facebook.com/v22.0/${instagramAccountId}/insights`,
        {
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
        console.error("Error fetching Instagram account analytics:", error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to retrieve Instagram account analytics.",
        });
    }
};