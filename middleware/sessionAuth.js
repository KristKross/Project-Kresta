module.exports = (req, res, next) => {
    if (req.session.userData && req.session.userData.user) {
        return next();
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
};