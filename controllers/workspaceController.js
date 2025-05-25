const Workspace = require('../models/Workspace');
const User = require('../models/User');

// @route   POST /api/workspace
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const ownerId = req.session.userData.user._id;

    const existing = await Workspace.findOne({
      name,
      $or: [{ owner: ownerId }, { members: ownerId }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already part of a workspace with that name."
      });
    }

    const workspace = new Workspace({ name, owner: ownerId });

    await workspace.save();
    res.status(201).json({ success: true, workspace });

  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error creating workspace:", error);
    res.status(500).json({ success: false, message: "Error creating workspace" });
  }
};

// @route GET /api/workspace/my
exports.getMyWorkspace = async (req, res) => {
    try {
        const userId = req.session.userData.user._id;

        const workspace = await Workspace.findOne({
            $or: [
                { owner: userId },
                { members: userId }
            ]
        })
        .populate('owner', 'email username')
        .populate('members', 'email username')
        .populate('pendingInvites', 'email username profilePicture');

        res.json({ 
            success: true,
            workspace,
        });
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ success: false, message: "Error fetching workspace" });
    }
};

// @route POST /api/workspace/invite
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const ownerId = req.session?.userData?.user?._id;

    if (!ownerId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const workspace = await Workspace.findOne({ owner: ownerId });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email === req.session.userData.user.email) {
      return res.status(400).json({ success: false, message: "You cannot invite yourself" });
    }

    const existingWorkspace = await Workspace.findOne({
      $or: [
        { owner: userToInvite._id },
        { members: userToInvite._id }
      ]
    });

    if (existingWorkspace) {
      return res.status(400).json({ success: false, message: "User is already a member of another workspace" });
    }

    if (workspace.members.includes(userToInvite._id)) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    if (workspace.pendingInvites.includes(userToInvite._id)) {
      return res.status(400).json({ success: false, message: "User has already been invited" });
    }

    workspace.pendingInvites.push(userToInvite._id);
    await workspace.save();

    res.json({ success: true, user: userToInvite, message: "Invitation sent. Awaiting acceptance." });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ success: false, message: "Error inviting user" });
  }
};

// @route DELETE /api/workspace/invite
exports.removeInvite = async (req, res) => {
    try {
        const ownerId = req.session?.userData?.user?._id;
        if (!ownerId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { email } = req.body;
        const userToRemove = await User.findOne({ email });

        if (!userToRemove) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const workspace = await Workspace.findOne({ owner: ownerId });

        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace not found" });
        }

        const inviteIndex = workspace.pendingInvites.indexOf(userToRemove._id);
        if (inviteIndex === -1) {
            return res.status(404).json({ success: false, message: "Invite not found" });
        }

        workspace.pendingInvites.splice(inviteIndex, 1);
        await workspace.save();

        res.json({ success: true, message: "Invite removed successfully" });
    } catch (error) {
        console.error("Error removing invite:", error);
        res.status(500).json({ success: false, message: "Error removing invite" });
    }
};

