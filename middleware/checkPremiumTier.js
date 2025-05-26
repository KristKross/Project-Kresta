const Premium = require("../models/Premium");
const Workspace = require("../models/Workspace");

module.exports = async function (req, res, next) {
    try {
        const userId = req.session?.userData?.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        // Check if user is already a workspace member
        const workspace = await Workspace.findOne({ members: userId });

        if (workspace) {
            return next();
        }

        // Check premium tier
        const premiumInfo = await Premium.findOne({ userId });
        const tier = premiumInfo?.tier || "free";

        if (tier !== "pro" && tier !== "business") {
            const isApiRequest =
                req.originalUrl.startsWith('/api') ||
                req.xhr ||
                req.headers.accept?.includes('application/json');

            if (isApiRequest) {
                return res.status(403).json({ success: false, message: "Pro or Business plan required" });
            } else {
                return res.redirect("/403");
            }
        }

        next();
    } catch (err) {
        console.error("Premium check error:", err);
        return req.originalUrl.startsWith('/api')
            ? res.status(500).json({ success: false, message: "Internal server error" })
            : res.redirect('/home');
    }
};
