const axios = require('axios');
const Post = require('../models/Post');
const Social = require('../models/Social');
const { getSocialCredentials } = require('../utils/social');
const { getWorkspace } = require('../utils/workspace');

exports.createPost = async (req, res) => {
  try {
    let { title, caption, scheduled, scheduledTime, status, imageUrl } = req.body;
    
    const workspace = await getWorkspace(req);
    const userId = req.session.userData.user._id;

    // Find user's social info
    const social = await Social.findOne({ userId });
    if (!social || !social.instagramAccountId || !social.instagramAccessToken) {
      return res.status(400).json({ error: 'Instagram account not connected' });
    }

    if (scheduled === false) {
      scheduledTime = new Date();
    }

    console.log('Using Cloudinary Image URL:', imageUrl);

    const { instagramAccountId, accessToken } = await getSocialCredentials(req);
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }
    );

    const creationId = containerResponse.data.id;
    let igPostId = null;

    let publishAtUnix = scheduled === 'posted'
      ? Math.floor(Date.now() / 1000)
      : scheduledTime
        ? Math.floor(new Date(scheduledTime).getTime() / 1000)
        : null;

    if (publishAtUnix) {
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken,
          publish_at: publishAtUnix,
        }
      );

      igPostId = publishResponse.data.id;
    }

    const post = new Post({
      title,
      workspaceId: workspace._id,
      userId,
      socialId: social._id,
      caption,
      imageUrl: imageUrl,
      scheduledTime: scheduledTime instanceof Date ? scheduledTime : new Date(scheduledTime),
      igPostId: null,
      status,
    });

    await post.save();

    res.status(201).json({
      message: scheduled === 'posted'
        ? 'Post published immediately on Instagram'
        : 'Post scheduled successfully on Instagram',
      post,
      imageUrl: imageUrl,
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: 'Failed to create Instagram post' });
  }
};