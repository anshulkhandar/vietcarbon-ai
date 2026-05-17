const express = require('express');
const { User } = require('../models');
const { auth, managerOnly } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');
const router = express.Router();

function generateUsername(name) {
  const base = name.toLowerCase().replace(/\s+/g, '').substring(0, 8);
  return base + Math.floor(100 + Math.random() * 900);
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Get all employees (manager)
router.get('/', auth, managerOnly, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my profile (employee)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add employee (manager)
router.post('/', auth, managerOnly, async (req, res) => {
  try {
    const { name, email, department, skills, experience } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const username = generateUsername(name);
    const password = generatePassword();

    const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const employee = await User.create({
      name, email, username, password,
      role: 'employee', department: department || 'Sustainability',
      skills: skillsArr, experience,
      ecoScore: 70,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail({ to: email, name, username, password });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(201).json({
      employee: { _id: employee._id, name: employee.name, email: employee.email, department: employee.department },
      generatedUsername: username,
      generatedPassword: password,
      message: 'Employee added. Welcome email sent.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update eco score
router.patch('/:id/eco-score', auth, async (req, res) => {
  try {
    const { ecoScore } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { ecoScore }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
