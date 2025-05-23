const Workspace = require('../models/Workspace');

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

        res.json({ 
            success: true,
            workspace,
        });
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ success: false, message: "Error fetching workspace" });
    }
};