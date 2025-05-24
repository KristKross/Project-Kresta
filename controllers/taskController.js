const Task = require('../models/Task');
const { getWorkspace } = require('../utils/workspace');

// Create Task
const User = require('../models/User'); // import User model

exports.createTask = async (req, res) => {
    try {
        const { title, priority, status, dueDate, details, assigneeName } = req.body;

        const workspace = await getWorkspace(req);

        // Find the user by email (assigneeName)
        const user = await User.findOne({ email: assigneeName });
        if (!user) {
            return res.status(400).json({ error: 'Assignee not found' });
        }

        const task = new Task({
            title,
            priority,
            status,
            dueDate,
            details,
            assignedTo: user._id,   // use ObjectId
            owner: req.session.userData.user._id,
            workspace: workspace._id,
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
};


// Get all tasks in a workspace
exports.getAllTasks = async (req, res) => {
    const workspace = await getWorkspace(req);

    try {
        const tasks = await Task.find({ workspace: workspace._id })
            .populate('assignedTo', 'username');
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

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
