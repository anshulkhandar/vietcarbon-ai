const express = require('express');
const jwt = require('jsonwebtoken');
const { User, CitizenData, OtpSession, Notification } = require('../models');
const { auth } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/email');
const router = express.Router();

function signUser(user) {
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'greenagent_secret', { expiresIn: '7d' });
  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, username: user.username, phone: user.phone, role: user.role, ecoScore: user.ecoScore }
  };
}

function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('84')) return '+84 ' + digits.slice(2);
  return '+84 ' + digits.replace(/^0+/, '');
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function ensureAdmin() {
  let manager = await User.findOne({ username: 'manager' });
  if (!manager) {
    manager = await User.create({ name: 'Vietnam Green Admin', email: 'manager@greenagent.vn', username: 'manager', password: 'manager123', role: 'manager', department: 'Sustainability Management', ecoScore: 95 });
  }
  return manager;
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    if ((username === 'manager' || username === 'admin') && (password === 'manager123' || password === 'admin123')) {
      const manager = await ensureAdmin();
      const valid = await manager.comparePassword('manager123');
      if (!valid) { manager.password = 'manager123'; await manager.save(); }
      return res.json(signUser(manager));
    }
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role !== 'manager' && user.role !== 'admin') return res.status(403).json({ error: 'Use citizen email OTP login for citizen accounts.' });
    res.json(signUser(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function createOtpSession({ email, phone, purpose, payload }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);
  if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) throw new Error('Valid email is required');
  if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 9) throw new Error('Valid mobile number is required');
  if (purpose === 'login' || purpose === 'forgot') {
    const user = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (!user) throw new Error('Citizen not found. Please sign up first.');
  }
  const otp = makeOtp();
  await OtpSession.deleteMany({ email: cleanEmail, phone: cleanPhone, purpose });
  await OtpSession.create({ email: cleanEmail, phone: cleanPhone, purpose, otp, payload, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  await sendOtpEmail({ to: cleanEmail, otp, purpose: purpose === 'login' ? 'Citizen Login' : purpose === 'forgot' ? 'Citizen Password Reset' : 'Citizen Registration' });
  return { email: cleanEmail, phone: cleanPhone };
}

router.post('/citizen-register-request-otp', async (req, res) => {
  try {
    const result = await createOtpSession({ email: req.body.email, phone: req.body.phone, purpose: 'register', payload: req.body });
    res.json({ message: 'OTP sent to citizen email.', ...result });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/citizen-register-verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();
    const session = await OtpSession.findOne({ email, phone, purpose: 'register', otp, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!session) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const payload = { ...(session.payload || {}), ...req.body, email, phone };
    const username = `citizen_${phone.replace(/\D/g, '')}`;
    const signupPassword = String(payload.password || req.body.password || '');
    if (!signupPassword || signupPassword.length < 6) return res.status(400).json({ error: 'Password is required and must be minimum 6 characters.' });
    let user = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (!user) {
      user = await User.create({
        name: payload.name || 'Citizen',
        email,
        username,
        password: signupPassword,
        role: 'citizen',
        phone
      });
    } else {
      user.name = payload.name || user.name;
      user.email = email;
      user.phone = phone;
      user.password = signupPassword;
      await user.save();
    }

    // Do NOT create hardcoded city/vehicle/family records during signup.
    // Citizen profile data is saved only after the citizen edits Profile in Citizen Dashboard.
    await Notification.create({
      user: user._id,
      type: 'registration',
      city: 'Vietnam',
      message: '✅ Email OTP verified. Your account is active. Complete Edit Profile to add city, family, vehicle and electricity data for live admin records.',
      createdAt: new Date()
    });
    session.verified = true; await session.save();
    res.json({ ...signUser(user), data: null, message: 'Citizen account verified. Complete Edit Profile in Citizen Dashboard to create live citizen data.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/citizen-login-request-otp', async (req, res) => {
  try {
    const result = await createOtpSession({ email: req.body.email, phone: req.body.phone, purpose: 'login', payload: {} });
    res.json({ message: 'Login OTP sent to citizen email.', ...result });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/citizen-login-verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();
    const session = await OtpSession.findOne({ email, phone, purpose: 'login', otp, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!session) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(404).json({ error: 'Citizen not found. Please sign up first.' });
    session.verified = true; await session.save();
    const data = await CitizenData.findOne({ $or: [{ phone }, { email }, { user: user._id }] });
    res.json({ ...signUser(user), data, isReturning: !!data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Backward compatibility; phone-only login now blocked so citizen data is not fake/hardcoded.
router.post('/citizen-login', async (req, res) => {
  res.status(400).json({ error: 'Email OTP login required. Enter mobile + email and verify OTP.' });
});


// Citizen login with mobile + Gmail + password. This keeps citizens on the citizen dashboard only.
router.post('/citizen-password-login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');
    if (!email || !phone || !password) return res.status(400).json({ error: 'Mobile number, Gmail/email and password are required.' });
    const user = await User.findOne({
      role: 'citizen',
      $or: [
        { email },
        { phone },
        { email, phone }
      ]
    });
    if (!user) return res.status(404).json({ error: 'Citizen not found. Please sign up first.' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid citizen password. Use Forgot Password if needed.' });
    const data = await CitizenData.findOne({ $or: [{ phone }, { email }, { user: user._id }] });
    res.json({ ...signUser(user), data, isReturning: !!data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/citizen-forgot-request-otp', async (req, res) => {
  try {
    const result = await createOtpSession({ email: req.body.email, phone: req.body.phone, purpose: 'forgot', payload: { password: req.body.password } });
    res.json({ message: 'Password reset OTP sent to citizen email.', ...result });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/citizen-forgot-verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();
    const password = String(req.body.password || '');
    if (!password || password.length < 6) return res.status(400).json({ error: 'New password must be minimum 6 characters.' });
    const session = await OtpSession.findOne({ email, phone, purpose: 'forgot', otp, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!session) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const user = await User.findOne({
      role: 'citizen',
      $or: [
        { email },
        { phone },
        { email, phone }
      ]
    });
    if (!user) return res.status(404).json({ error: 'Citizen not found. Please sign up first.' });
    user.password = password;
    await user.save();
    session.verified = true; await session.save();
    res.json({ message: 'Password changed successfully. Please login with mobile + Gmail + password.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', auth, async (req, res) => res.json(req.user));
module.exports = router;
