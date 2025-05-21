const Social = require("../models/Social");
const { decryptToken } = require("../utils/encryption");

const getSocialCredentials = async (req) => {
  if (!req.session?.userData?.user?._id) {
    throw new Error("User session is missing or expired");
  }

  const user = await Social.findOne({ userId: req.session.userData.user._id });

  if (!user) throw new Error("User not found");

  return { 
    pageId: user.pageId, 
    accessToken: decryptToken(user.instagramAccessToken),
    instagramAccountId: user.instagramAccountId
  };
};

module.exports = { getSocialCredentials };