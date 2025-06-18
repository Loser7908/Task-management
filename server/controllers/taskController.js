// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskUpdateEmail } = require('../utils/mailer');

exports.getTasks = async (req, res) => {
  const tasks = await Task.find().populate('createdBy', 'email');
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  // Check if the user has the 'admin' role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only admins can create tasks.' });
  }

  const { title, description, dueDate, assignedTo } = req.body;

  try {
    const task = new Task({
      title,
      description,
      dueDate,
      assignedTo,
      createdBy: req.user.userId,
      status: 'todo'
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Task creation failed', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, dueDate } = req.body;

  try {
    // Check if the user has the 'user' role
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Only users can update tasks.' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, status, dueDate, lastUpdatedBy: req.user.userId },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notify admin via email
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await sendTaskUpdateEmail(admin.email, task);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Task update failed', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete tasks.' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Task deletion failed', error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};
exports.getTasksByUser = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.userId }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user tasks', error: err.message });
  }
};
exports.getTasksByStatus = async (req, res) => {
  const { status } = req.query;
  try {
    const tasks = await Task.find({ status }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by status', error: err.message });
  }
};
exports.getTasksByDueDate = async (req, res) => {
  const { dueDate } = req.query;
  try {
    const tasks = await Task.find({ dueDate: new Date(dueDate) }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by due date', error: err.message });
  }
};
exports.getTasksByTitle = async (req, res) => {
  const { title } = req.query;
  try {
    const tasks = await Task.find({ title: new RegExp(title, 'i') }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by title', error: err.message });
  }
};
exports.getTasksByDescription = async (req, res) => {
  const { description } = req.query;
  try {
    const tasks = await Task.find({ description: new RegExp(description, 'i') }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by description', error: err.message });
  }
};
exports.getTasksByCreatedBy = async (req, res) => {
  const { userId } = req.query;
  try {
    const tasks = await Task.find({ createdBy: userId }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by creator', error: err.message });
  }
};
exports.getTasksByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const tasks = await Task.find({
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate('createdBy', 'email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by date range', error: err.message });
  }
};
exports.getTasksByPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'email')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const totalTasks = await Task.countDocuments();
    res.json({
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching paginated tasks', error: err.message });
  }
};
