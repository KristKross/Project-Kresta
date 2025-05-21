const express = require("express");
const instagramContentController = require("../controllers/instagramContent");
const instagramAnalysisController = require("../controllers/instagramAnalysis");

const router = express.Router();

// Content-related routes
router.get("/metadata", instagramContentController.getInstagramMetadata);
router.get("/posts", instagramContentController.getInstagramPosts);
router.get("/comments/:post_id", instagramContentController.getInstagramComments);
router.post("/reply/:comment_id", instagramContentController.replyToComment);

// Analysis-related routes
router.get("/analytics/account", instagramAnalysisController.getInstagramAccountAnalytics);
router.get("/analytics/post/:post_id", instagramAnalysisController.getInstagramPostAnalytics);

module.exports = router;
