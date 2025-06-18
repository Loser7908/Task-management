const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, adminOnly } = require('../middleware/auth');
const { sendTaskUpdateNotification } = require('../utils/emailService');
const User = require('../models/User');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email')
      .populate('lastUpdatedBy', 'email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Create new task (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      createdBy: req.user._id,
      assignedTo
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error creating task' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only allow users to update status
    if (req.user.role === 'user') {
      const { status } = req.body;
      task.status = status;
      task.lastUpdatedBy = req.user._id;

      // Send notification to admin
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        await sendTaskUpdateNotification(
          admin.email,
          task.title,
          req.user.email
        );
      }
    } else {
      // Admin can update all fields
      const { title, description, status, dueDate, assignedTo } = req.body;
      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.dueDate = dueDate || task.dueDate;
      task.assignedTo = assignedTo || task.assignedTo;
      task.lastUpdatedBy = req.user._id;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete task (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

module.exports = router; 