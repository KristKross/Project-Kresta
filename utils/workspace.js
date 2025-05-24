const Workspace = require('../models/Workspace');

const getWorkspace = async (req) => {
  if (!req.session?.userData?.user?._id) {
    throw new Error("User session is missing or expired");
  }

  const workspace = await Workspace.findOne({ owner: req.session.userData.user._id });
  
  if (!workspace) throw new Error("Workspace not found for this user");

  return workspace;
};

module.exports = { getWorkspace };
