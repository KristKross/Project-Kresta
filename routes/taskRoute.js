const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Create a task
router.post('/', taskController.createTask);

// Get all tasks in a workspace
router.get('/workspace/:workspaceId', taskController.getWorkspaceTasks);

// Get a single task by ID
router.get('/:taskId', taskController.getTask);

module.exports = router;
