const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const checkPremiumTier = require('../middleware/checkPremiumTier');

const router = express.Router();

// Create workspace
router.post('/', checkPremiumTier, workspaceController.createWorkspace);

// Read selected workspace via session
router.get('/my', checkPremiumTier, workspaceController.getMyWorkspace);

router.post('/invite', checkPremiumTier, workspaceController.inviteMember);
router.delete('/invite', checkPremiumTier, workspaceController.removeInvite);

router.post('/accept', workspaceController.acceptInvite);
router.post('/decline', workspaceController.declineInvite);

router.delete('/remove', checkPremiumTier, workspaceController.removeMember);

module.exports = router;