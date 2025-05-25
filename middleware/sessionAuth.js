module.exports = (req, res, next) => {
    if (!req.session.userData || !req.session.userData.user) {
        const isApiRequest =
            req.originalUrl.startsWith('/api') ||
            req.xhr ||
            req.headers.accept?.includes('application/json');

        if (isApiRequest) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            return res.redirect("/login");
        }
    }
    next();
};
