const axios = require('axios');
const Post = require('../models/Post');
const Social = require('../models/Social');
const { getSocialCredentials } = require('../utils/social');
const { getWorkspace } = require('../utils/workspace');


exports.createPost = async (req, res) => {
  const { title, caption, scheduled, scheduledTime, imageUrl } = req.body;

  try {
    const workspace = await getWorkspace(req);
    const userId = req.session.userData.user._id;

    // Find user's social info
    const social = await Social.findOne({ userId });
    if (!social || !social.instagramAccountId || !social.instagramAccessToken) {
      throw new Error('Instagram account not connected');
    }

    // Create container first
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

    // Schedule or publish immediately
    let publishAtUnix = null;
    if (scheduled === 'posted') {
      publishAtUnix = Math.floor(Date.now() / 1000);
    } else if (scheduledTime) {
      publishAtUnix = Math.floor(new Date(scheduledTime).getTime() / 1000);
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

      igPostId = publishResponse.data.id;

      if (scheduled === 'posted') {
        return res.status(201).json({
          message: 'Post published immediately on Instagram',
        });
      }
    }

    // Create post in database
    const post = new Post({
      title,
      workspaceId: workspace._id,
      userId,
      socialId: social._id,
      caption,
      imageUrl: imageUrl,
      scheduledTime: scheduledTime instanceof Date ? scheduledTime : new Date(scheduledTime),
      igPostId: igPostId,
    });

    await post.save();

    return res.status(201).json({
      message: 'Post scheduled successfully on Instagram',
      post,
      imageUrl: imageUrl,
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: 'Failed to create Instagram post' });
  }
};