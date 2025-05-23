const axios = require('axios');
const Post = require('../models/Post');
const Social = require('../models/Social');
const { getSocialCredentials } = require('../utils/social');

exports.createScheduledPost = async (req, res) => {
  try {
    const { workspaceId, caption, imageUrl, scheduledTime } = req.body;
    const userId = req.user._id;

    // Find user's social info
    const social = await Social.findOne({ userId });
    if (!social || !social.instagramAccountId || !social.instagramAccessToken) {
      return res.status(400).json({ error: 'Instagram account not connected' });
    }

    const { instagramAccountId, accessToken } = await getSocialCredentials(req);

    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }
    );

    const creationId = containerResponse.data.id;

    // Step 2: Schedule media publish
    const publishAtUnix = Math.floor(new Date(scheduledTime).getTime() / 1000);

    const scheduleResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
        publish_at: publishAtUnix,
      }
    );

    // Step 3: Save post to DB
    const post = new Post({
      workspaceId: workspaceId || null,  // optional
      userId,
      socialId: social._id,
      caption,
      imageUrl,
      scheduledTime: new Date(scheduledTime),
      igPostId: scheduleResponse.data.id,
      status: 'scheduled',
    });

    await post.save();

    res.status(201).json({
      message: 'Post scheduled successfully on Instagram',
      post,
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: 'Failed to schedule Instagram post' });
  }
};