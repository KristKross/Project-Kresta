const Workspace = require('../models/Workspace');

const getWorkspace = async (req) => {
  if (!req.session?.userData?.user?._id) {
    throw new Error("User session is missing or expired");
  }

  const workspace = await Workspace.findOne({
    $or: [
      { owner: req.session.userData.user._id },
      { members: req.session.userData.user._id }
    ]
  });
  
  return workspace || null;
};

module.exports = { getWorkspace };
