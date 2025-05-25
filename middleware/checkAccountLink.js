const Social = require("../models/Social");

module.exports = async (req, res, next) => {
    try {
        const sessionUser = req.session?.userData?.user;

        if (!sessionUser) {
            return res.redirect("/401");
        }

        const social = await Social.findOne({ userId: sessionUser._id });

        console.log("social:", social);

        if (!social || !social.instagramAccountId) {
            return res.redirect("/api/social/facebook");
        }

        next();
    } catch (error) {
        console.error("Error checking if account is linked:", error);
        res.status(500).json({ success: false, message: "Error checking if account is linked" });
    }
};
