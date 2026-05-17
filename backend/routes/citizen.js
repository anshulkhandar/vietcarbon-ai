const express = require('express');
const { auth } = require('../middleware/auth');
const { CitizenData, Notification, EmissionLog } = require('../models');
const { sendReportEmail } = require('../utils/email');
const router = express.Router();

// POST /citizen/notify — manager sends alert to registered citizens only
router.post('/notify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const query = req.body.city ? { city: req.body.city } : {};
    const rows = await CitizenData.find(query).populate('user', '_id');
    const docs = rows.filter(r => r.user).map(r => ({
      user: r.user._id,
      message: req.body.message,
      type: req.body.type || 'alert',
      city: req.body.city || 'All Vietnam',
      createdAt: new Date()
    }));
    if (docs.length) await Notification.insertMany(docs);
    res.json({ message: `Alert delivered to ${docs.length} registered citizens`, count: docs.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /citizen/notifications — citizen gets their own notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const rows = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /citizen/emission-log
router.post('/emission-log', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const saved = await EmissionLog.create({
      city: req.body.city,
      value: req.body.value,
      type: `${req.body.period || 'daily'}:${req.body.metric || 'CO2'}`,
      source: req.body.note || 'manual admin insert'
    });
    res.json(saved);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /citizen/data — register or update citizen profile (upsert on phone)
router.post('/data', auth, async (req, res) => {
  try {
    const phone = req.body.phone || req.user.phone || req.user.username;
    const email = req.body.email || req.user.email;
    const vehicles = Number(req.body.vehicles || 0);
    const twoWheelers = Number(req.body.twoWheelers || 0);
    const familyMembers = Number(req.body.familyMembers || 0);
    const dailyKm = Number(req.body.dailyTravelKm || 20);
    const fuelFactor = req.body.fuelType === 'Electric' ? 0.02 : req.body.fuelType === 'Hybrid' ? 0.07 : req.body.fuelType === 'Diesel' ? 0.15 : req.body.fuelType === 'CNG' ? 0.09 : 0.12;
    const energyFactor = req.body.energyType === 'solar' || req.body.solarPanel ? 0.18 : req.body.energyType === 'mixed' ? 0.38 : 0.6;
    const estimatedMobilityCO2 = Number(((vehicles * dailyKm * fuelFactor * 365 / 1000) + (twoWheelers * dailyKm * 0.055 * 365 / 1000) + (Number(req.body.electricityUsage || 0) * 12 * energyFactor / 1000) + (familyMembers * 0.18)).toFixed(2));

    // Upsert — if phone already exists, update rather than error
    const saved = await CitizenData.findOneAndUpdate(
      { phone },
      { ...req.body, user: req.user._id, phone, email, name: req.body.name || req.user.name, estimatedMobilityCO2, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Send welcome notification to this citizen
    const existing = await Notification.findOne({ user: req.user._id, type: 'registration' });
    if (!existing) {
      await Notification.create({
        user: req.user._id,
        message: `🎉 You are successfully registered as a Vietnam Citizen in GreenAgentOS. Your carbon footprint profile for ${req.body.city || 'Vietnam'} is now active. You will receive real-time climate alerts, AQI warnings, and environmental updates directly in this notification center.`,
        type: 'registration',
        city: req.body.city || 'Vietnam',
        createdAt: new Date()
      });
    }

    res.json({
      message: `Profile saved. Estimated household mobility CO₂: ${estimatedMobilityCO2} t/year.`,
      data: saved,
      isNew: !existing
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /citizen/data — manager gets all citizens; citizen gets own record
router.get('/data', auth, async (req, res) => {
  try {
    if (req.user.role === 'manager' || req.user.role === 'admin') {
      const rows = await CitizenData.find()
        .populate('user', 'username phone name')
        .sort({ updatedAt: -1 })
        .limit(200);
      return res.json(rows);
    }
    // Citizen: return only their own record
    const phone = req.user.phone || req.user.username;
    const record = await CitizenData.findOne({
      $or: [{ phone }, { user: req.user._id }]
    }).populate('user', 'username phone name');
    res.json(record ? [record] : []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /citizen/all — manager only
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const rows = await CitizenData.find()
      .populate('user', 'username phone name')
      .sort({ updatedAt: -1 })
      .limit(200);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// POST /citizen/report-email — admin sends generated report to a factory or authority email
router.post('/report-email', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { to, subject, report } = req.body;
    if (!to || !report) return res.status(400).json({ error: 'Recipient email and report body are required' });
    const result = await sendReportEmail({ to, subject, report });
    res.json({ message: `Report sent to ${to}`, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// No delete route: citizen records are preserved after verified OTP registration.

module.exports = router;
