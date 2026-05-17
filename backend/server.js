require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/citizen', require('./routes/citizen'));
app.use('/api/friday', require('./routes/ai')); // FRIDAY uses same AI routes
app.use('/api/traffic', require('./routes/traffic'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'VietCarbon AI — Vietnam Smart Sustainability Platform',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai: process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' ? 'configured' : 'not configured',
    email: ((process.env.SMTP_USER || process.env.GMAIL_USER) && (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)) ? 'SMTP configured' : 'mock mode',
    elevenLabs: process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID ? 'configured' : 'not configured',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`\n🌿 GreenAgentOS Backend running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI: ${process.env.GROQ_API_KEY !== 'your_groq_api_key_here' ? 'Groq connected' : 'Fallback mode'}`);
      console.log(`📧 Email: ${(process.env.SMTP_USER || process.env.GMAIL_USER) && (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD) ? 'SMTP configured' : 'Mock mode'}`);
      console.log(`🔊 ElevenLabs: ${process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID ? 'configured' : 'not configured'}\n`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('\nTo fix: Update MONGODB_URI in backend/.env');
    console.log('Get free MongoDB at: https://mongodb.com/atlas\n');
    // Still start server so frontend gets proper error messages
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB offline)`));
  });
