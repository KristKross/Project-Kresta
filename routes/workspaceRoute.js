const express = require('express');
const workspaceController = require('../controllers/workspaceController');

const router = express.Router();

// Create workspace
router.post('/', workspaceController.createWorkspace);

// Read selected workspace via session
router.get('/my', workspaceController.getMyWorkspace);

router.post('/invite', workspaceController.inviteMember);
router.delete('/invite', workspaceController.removeInvite);

router.post('/accept', workspaceController.acceptInvite);
router.post('/decline', workspaceController.declineInvite);

module.exports = router;