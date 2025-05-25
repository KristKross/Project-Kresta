const Premium = require("../models/Premium");

module.exports = async function (req, res, next) {
    try {
        const userId = req.session?.userData?.user?._id;

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
                return res.redirect("/home");
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
