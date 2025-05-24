const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Create a task
router.post('/', taskController.createTask);

// Get all tasks
router.get('/get', taskController.getAllTasks);

// Get a single task by ID
router.get('/:taskId', taskController.getTask);

// Delete a task
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
