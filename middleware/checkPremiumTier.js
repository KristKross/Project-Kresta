const Premium = require("../models/Premium");

module.exports = async function (req, res, next) {
    const userId = req.session?.userData?.user?._id;

    const premiumInfo = await Premium.findOne({ userId });
    const tier = premiumInfo?.tier || "free";

    if (tier !== "pro" && tier !== "business") {
        return res.redirect('/pricing');
    }

    next();
};