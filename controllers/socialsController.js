const Social = require("../models/Social");
const { encryptToken } = require("../utils/encryption");
const axios = require("axios");

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Step 1: Redirect User to Facebook Login
// @route GET /api/auth/facebook
exports.facebookLogin = (req, res) => {
    const facebookAuthUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=pages_show_list,business_management,email`;
    res.redirect(facebookAuthUrl);
};

// Step 2: Handle Callback & Exchange Code for Tokens
exports.facebookCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange Code for Short-Lived Token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v17.0/oauth/access_token`, {
        params: {
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            redirect_uri: REDIRECT_URI,
            code,
        },
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // Exchange Short-Lived Token for Long-Lived Token
    const longLivedTokenResponse = await axios.get(`https://graph.facebook.com/v17.0/oauth/access_token`, {
        params: {
            grant_type: "fb_exchange_token",
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        },
    });

    const longLivedToken = longLivedTokenResponse.data.access_token;

    // Encrypt Token Before Storing
    const encryptedLongLivedToken = encryptToken(longLivedToken);

    // Fetch Facebook Page ID
    const pagesResponse = await axios.get(`https://graph.facebook.com/v17.0/me/accounts?access_token=${longLivedToken}`);
    const pageId = pagesResponse.data.data[0]?.id;

    // Fetch Instagram Business Account ID
    const instagramResponse = await axios.get(`https://graph.facebook.com/v17.0/${pageId}?fields=instagram_business_account&access_token=${longLivedToken}`);
    const instagramAccountId = instagramResponse.data.instagram_business_account?.id;

    // Store Encrypted User Data in MongoDB
    await Social.findOneAndUpdate(
      { userId: req.session.userData.user._id },
      { pageId, instagramAccountId, instagramAccessToken: encryptedLongLivedToken },
      { upsert: true, new: true }
    );

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error completing OAuth flow");
  }
};