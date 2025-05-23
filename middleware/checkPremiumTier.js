const Premium = require("../models/Premium");

module.exports = async function (req, res, next) {
    const userId = req.session?.userData?.user?._id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const premiumInfo = await Premium.findOne({ userId });
    const tier = premiumInfo?.tier || "free";

    if (tier !== "pro" && tier !== "business") {
        return res.status(403).json({ success: false, message: "Pro or Business plan required" });
    }

    next();
};