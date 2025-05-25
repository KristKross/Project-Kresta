const Premium = require("../models/Premium");
const Workspace = require("../models/Workspace");

module.exports = async function (req, res, next) {
    try {
        const userId = req.session?.userData?.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        const workspace = await Workspace.findOne({ members: userId });

        if (workspace) {
            return next();
        }

        const premiumInfo = await Premium.findOne({ userId });
        const tier = premiumInfo?.tier || "free";

        if (tier !== "creator" && tier !== "business") {
            const isApiRequest =
                req.originalUrl.startsWith('/api') ||
                req.xhr ||
                req.headers.accept?.includes('application/json');
                
            // Determine which feature is being accessed to customize the error message
            let errorMessage = "Creator or Business plan required";
            
            if (req.originalUrl.includes('workspace')) {
                errorMessage = "Workspace collaboration features require a Creator or Business plan";
            } else if (req.originalUrl.includes('task')) {
                errorMessage = "Task management features require a Creator or Business plan";
            }

            if (isApiRequest) {
                return res.status(403).json({ success: false, message: errorMessage });
            } else {
                return res.redirect("/pricing.html");
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
