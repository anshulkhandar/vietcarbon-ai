const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Task, User } = require('../models');
const { auth, managerOnly } = require('../middleware/auth');
const { sendTaskEmail } = require('../utils/email');
const router = express.Router();

function generatePasskey() {
  return uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase();
}

// Get all tasks (manager)
router.get('/', auth, managerOnly, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email username')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my tasks (employee)
router.get('/my', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (manager)
router.post('/', auth, managerOnly, async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo, city, expectedOutput, aiAnalysis } = req.body;
    if (!title || !assignedTo) return res.status(400).json({ error: 'Title and assignee required' });

    const passkey = generatePasskey();

    // Calculate CO2 target from AI analysis or defaults
    const co2Target = aiAnalysis?.co2Target || Math.round(Math.random() * 5 + 2);
    const ecoReason = aiAnalysis?.ecoReason || aiAnalysis?.recommendation ||
      'This task directly supports Vietnam\'s carbon neutrality target by reducing emissions in high-risk zones.';

    const task = await Task.create({
      title, description, priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : undefined,
      assignedTo, assignedBy: req.user._id,
      city, passkey, co2Target, ecoReason,
      aiAnalysis, expectedOutput,
    });

    const populated = await task.populate('assignedTo', 'name email');

    // Send task email
    try {
      await sendTaskEmail({
        to: populated.assignedTo.email,
        name: populated.assignedTo.name,
        taskTitle: title, description,
        passkey, deadline, co2Target, city,
      });
    } catch (emailErr) {
      console.error('Task email error:', emailErr.message);
    }

    res.status(201).json({ task: populated, message: 'Task assigned. Email sent with passkey.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start task with passkey
router.post('/:id/start', auth, async (req, res) => {
  try {
    const { passkey } = req.body;
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.status === 'completed') return res.status(400).json({ error: 'Task already completed' });
    if (task.passkey !== passkey) return res.status(400).json({ error: 'Invalid passkey' });

    task.status = 'in_progress';
    task.progress = 5;
    await task.save();

    res.json({ message: 'Task started successfully', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.progress = progress;
    if (progress >= 100) {
      task.status = 'completed';
      task.completedAt = new Date();
      task.co2Saved = task.co2Target || 0;

      // Update employee eco score
      await User.findByIdAndUpdate(req.user._id, { $inc: { ecoScore: 5, co2Saved: task.co2Saved } });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, managerOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
