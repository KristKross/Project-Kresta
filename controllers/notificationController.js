const Notification = require('../models/Notification');

// @route GET /api/notifications/get
exports.getNotification = async (req, res) => {
  try {
    const userId = req.session?.userData?.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const notifications = await Notification.find({ user: userId })
      .populate('workspaceId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// @route PUT /api/notifications/mark-read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    await Notification.findByIdAndUpdate(notificationId, { read: true });

    res.json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Error updating notification status" });
  }
};