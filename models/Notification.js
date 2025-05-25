const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["invite", "task", "post", "analytics"], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
});

module.exports = mongoose.model("Notification", NotificationSchema);
