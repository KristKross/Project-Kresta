const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
        .populate('owner', 'email username profilePicture')
        .populate('members', 'email username profilePicture')
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

    if (workspace.members.includes(userToInvite._id)) {
      return res.status(400).json({ success: false, message: "User is already in the workspace" });
    }

    if (workspace.pendingInvites.includes(userToInvite._id)) {
      return res.status(400).json({ success: false, message: "User has already been invited" });
    }

    workspace.pendingInvites.push(userToInvite._id);
    await workspace.save();

    await Notification.create({
      user: userToInvite._id,
      type: "invite",
      message: `You have been invited to join ${workspace.name}.`,
      workspaceId: workspace._id
    });
    res.json({ success: true, message: "Invitation sent. Awaiting acceptance.", user: userToInvite });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ success: false, message: "Error inviting user" });
  }
};

// @route DELETE /api/workspace/invite
exports.removeInvite = async (req, res) => {
  try {
    const { email } = req.body;

    const workspace = await Workspace.findOne({
      $or: [
        { owner: req.session.userData.user._id },
        { members: req.session.userData.user._id }
      ]
    });

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (workspace.owner.toString() !== req.session.userData.user._id) {
      return res.status(403).json({ success: false, message: "Only the workspace owner can remove members" });
    }

    const userToRemove = await User.findOne({ email });

    if (!userToRemove) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const inviteIndex = workspace.pendingInvites.indexOf(userToRemove._id);
    if (inviteIndex === -1) {
        return res.status(404).json({ success: false, message: "Invite not found" });
    }

    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    await Notification.findOneAndDelete({ user: userToRemove._id });

    res.json({ success: true, message: "Invite removed successfully" });
  } catch (error) {
      console.error("Error removing invite:", error);
      res.status(500).json({ success: false,  message: "Error removing invite" });
  }
};

// @route POST /api/workspace/accept
exports.acceptInvite = async (req, res) => {
  try {
    const userId = req.session?.userData?.user?._id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { workspaceId } = req.body;
    console.log('workspaceId:', workspaceId);

    let workspace;

    if (workspaceId) {
        workspace = await Workspace.findById(workspaceId);
    } else {
        workspace = await Workspace.findOne({ pendingInvites: userId });
    }

    if (!workspace) {
        return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const inviteIndex = workspace.pendingInvites.indexOf(userId);
    if (inviteIndex === -1) {
        return res.status(404).json({ success: false, message: "Invite not found" });
    }

    workspace.members.push(userId);
    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    // Mark notification as read and remove it
    await Notification.findOneAndDelete({ 
        user: userId, 
        type: 'invite',
        workspaceId: workspace._id 
    });

    res.json({ success: true, message: "Invite accepted successfully" });
  } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ success: false, message: "Error accepting invite" });
  }
};

// @route POST /api/workspace/decline
exports.declineInvite = async (req, res) => {
  try {
    const userId = req.session?.userData?.user?._id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { workspaceId } = req.body;
    
    let workspace;
    
    if (workspaceId) {
        workspace = await Workspace.findById(workspaceId);
    } else {
        workspace = await Workspace.findOne({ pendingInvites: userId });
    }

    if (!workspace) {
        return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const inviteIndex = workspace.pendingInvites.indexOf(userId);
    if (inviteIndex === -1) {
        return res.status(404).json({ success: false, message: "Invite not found" });
    }

    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    await Notification.findOneAndDelete({ 
        user: userId, 
        type: 'invite',
        workspaceId: workspace._id 
    });

      res.json({ success: true, message: "Invite declined successfully" });
  } catch (error) {
      console.error("Error declining invite:", error);
      res.status(500).json({ success: false, message: "Error declining invite" });
  }
};

// @route DELETE /api/workspace/remove
exports.removeMember = async (req, res) => {
    try {
        const userId = req.session?.userData?.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { workspaceId, email } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Workspace not found" });
        }

        const userToRemove = await User.findOne({ email });
        if (!userToRemove) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const memberIndex = workspace.members.indexOf(userToRemove._id);
        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: "User is not a member of the workspace" });
        }

        workspace.members.splice(memberIndex, 1);
        await workspace.save();

        res.json({ success: true, message: "User removed from workspace successfully" });
    } catch (error) {
        console.error("Error removing user from workspace:", error);
        res.status(500).json({ success: false, message: "Error removing user from workspace" });
    }
};
