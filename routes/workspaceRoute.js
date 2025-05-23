const express = require('express');
const workspaceController = require('../controllers/workspaceController');

const router = express.Router();

// Create workspace
router.post('/', workspaceController.createWorkspace);

// Read selected workspace via session
router.get('/my', workspaceController.getMyWorkspace);

// Read specific workspace
router.get('/:id', workspaceController.getWorkspaceInfo);

module.exports = router;