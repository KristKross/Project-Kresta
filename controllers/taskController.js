const Task = require('../models/Task');

// Create Task
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({ ...req.body, owner: req.user._id });
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all tasks in a workspace
exports.getWorkspaceTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ workspace: req.params.workspaceId });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a specific task
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};