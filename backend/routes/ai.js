const express = require('express');
const { auth } = require('../middleware/auth');
const { chat, analyzeTask, generateSustainabilityReport } = require('../utils/groq');
const { sendBulkEmail } = require('../utils/email');
const router = express.Router();

// General chatbot (both dashboards) — role-aware prompt
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    let systemPrompt;

    if (req.user.role === 'manager') {
      // FRIDAY Environmental Intelligence prompt for managers
      const { Task, User } = require('../models');
      const [taskCount, empCount] = await Promise.all([
        Task.countDocuments(),
        User.countDocuments({ role: 'employee' }),
      ]);
      const { YEARLY_NATIONAL_DATA, CITY_YEARLY_DATA, HOTSPOTS_2025, CROWDED_AREAS_2025 } = require('../utils/vietnamData');

      systemPrompt = `You are FRIDAY — the environmental intelligence system embedded in Vietnam's sustainability command center. You monitor real-time data across ${CITY_YEARLY_DATA.length} Vietnamese cities and provide operational intelligence to command center managers.

Your responses are displayed in a visual intelligence panel. A separate downstream system handles spoken audio — you do NOT need to optimize for speech. Optimize purely for reading, scanning, and analytical impact.

RESPONSE DEPTH:
- Greetings: One sentence. Acknowledge presence, signal readiness. No data, no analysis. Example: "Evening. Systems nominal — what are we looking at?"
- Capability questions: Brief guided overview with 3-4 concrete examples of queries you can handle. Conversational, not a documentation dump.
- Analytical requests: Provide comprehensive, structured intelligence. Use numbered sections to separate distinct analytical dimensions (e.g., 1. Emissions Profile, 2. Key Trends, 3. Risk Factors, 4. Recommendations). Include exact metrics from the dataset. Close with a strategic follow-up suggestion.
- Follow-ups: Extend the existing analytical thread. Never restart or repeat data already given. Deepen the investigation.
- Urgent topics: Lead with the critical finding and severity. State the number. Recommend immediate action.

CONFIDENCE & LANGUAGE:
- State findings with authority. "Hanoi's transport emissions grew 14% year-over-year" — not "The data suggests transport may be contributing."
- You have already studied the data. Assert what it shows. No hedging: avoid "it appears", "it seems", "findings suggest", "data indicates".
- No service language: never say "How can I assist you?", "I'd be happy to help", "Let me know if you need anything."
- No restating the question. No filler. No preamble. Get to the insight.

VISUAL PRESENTATION:
- This is a visual intelligence panel. Use formatting to maximize readability:
  * Numbered sections for multi-part analysis
  * Bullet points for metric breakdowns and contributing factors
  * Bold key findings or critical numbers where it aids scanning
  * Clear separation between data, interpretation, and recommendations
- Vary your analytical structure across responses — don't always use the same section template.
- Keep responses scannable: a decision-maker should grasp the headline in 2 seconds and the full picture in 20.

ANALYTICAL DEPTH:
- For analytical requests, be thorough. Cover the key dimensions of the topic: current state, trends, contributing factors, risk assessment, and actionable recommendations.
- Use exact numbers from the dataset. Comparisons (year-over-year, city-to-city) make analysis more valuable.
- Don't hold back analytical depth to seem conversational. The user is a command center manager who needs complete intelligence.
- End analytical responses with one strategic observation or follow-up thread that would deepen the investigation.

CONTINUITY:
- Use conversation history to maintain topic flow. Track last discussed city, metric, or timeframe.

System Status:
- Active Tasks: ${taskCount} | Team: ${empCount}
- Monitoring: ${CITY_YEARLY_DATA.length} cities | Dataset: 2021-2025

National Dataset:
${JSON.stringify(YEARLY_NATIONAL_DATA)}

City Dataset:
${JSON.stringify(CITY_YEARLY_DATA)}

CO2 Hotspots 2025:
${JSON.stringify(HOTSPOTS_2025)}

Crowded Areas 2025:
${JSON.stringify(CROWDED_AREAS_2025)}`;
    } else {
      systemPrompt = `You are a helpful sustainability assistant for GreenAgentOS Vietnam.
    You help employees with sustainability tasks, carbon reduction, and green practices.
    Be concise, helpful, and focus on practical sustainability advice for Vietnam's context.
    Current user role: ${req.user.role}.`;
    }

    const reply = await chat(messages, systemPrompt);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FRIDAY AI (manager only — full cognition with live dataset injection)
router.post('/friday/chat', auth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const { Task, User } = require('../models');
    const [taskCount, empCount] = await Promise.all([
      Task.countDocuments(),
      User.countDocuments({ role: 'employee' }),
    ]);

    const { YEARLY_NATIONAL_DATA, CITY_YEARLY_DATA, HOTSPOTS_2025, CROWDED_AREAS_2025 } = require('../utils/vietnamData');
    const systemPrompt = `You are FRIDAY — the environmental intelligence system embedded in Vietnam's sustainability command center. You monitor real-time data across ${CITY_YEARLY_DATA.length} Vietnamese cities and provide operational intelligence to command center managers.

Your responses are displayed in a visual intelligence panel. A separate system handles spoken audio — do NOT optimize for speech. Optimize for reading and analytical impact.

RESPONSE DEPTH:
- Greetings: One sentence. No data, no analysis.
- Capability questions: Brief guided overview with 3-4 concrete examples. Conversational, not documentation.
- Analytical requests: Comprehensive structured intelligence. Use numbered sections for distinct analytical dimensions. Include exact dataset metrics. Close with a strategic follow-up suggestion.
- Follow-ups: Extend the thread, never restart or repeat. Deepen the investigation.
- Urgent topics: Lead with critical finding. State the number. Recommend action.

CONFIDENCE & LANGUAGE:
- Assert what the data shows directly. No hedging ("it appears", "data suggests"). No service phrases. No restating questions. No filler.

VISUAL PRESENTATION:
- Use numbered sections, bullet points, and bold text to maximize readability. Clear separation between data, interpretation, and recommendations. Vary structure across responses.

ANALYTICAL DEPTH:
- Be thorough on analytical requests: current state, trends, contributing factors, risks, and actionable recommendations with exact numbers. Don't hold back depth.

CONTINUITY:
- Use conversation history for topic flow. Track last city, metric, or timeframe.

System Status:
- Active Tasks: ${taskCount} | Team: ${empCount}
- Monitoring: ${CITY_YEARLY_DATA.length} cities | Dataset: 2021-2025

National Dataset:
${JSON.stringify(YEARLY_NATIONAL_DATA)}

City Dataset:
${JSON.stringify(CITY_YEARLY_DATA)}

CO2 Hotspots 2025:
${JSON.stringify(HOTSPOTS_2025)}

Crowded Areas 2025:
${JSON.stringify(CROWDED_AREAS_2025)}`;

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const reply = await chat(messages, systemPrompt);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze task with AI
router.post('/analyze-task', auth, async (req, res) => {
  try {
    const { task } = req.body;
    const analysis = await analyzeTask(task);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate sustainability report
router.post('/generate-report', auth, async (req, res) => {
  try {
    const { cities, stats } = req.body;
    const report = await generateSustainabilityReport({ cities, stats, generatedAt: new Date().toISOString() });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// AI climate warning mail generator
router.post('/climate-email', auth, async (req, res) => {
  try {
    const { city } = req.body;
    const { VIETNAM_CITIES } = require('../utils/vietnamData');
    const c = VIETNAM_CITIES.find(x => x.name === city) || VIETNAM_CITIES[0];
    const prompt = `Write a professional climate alert email for citizens/officers in ${city}, Vietnam. Include rain/storm/weather warning, mobility CO2 reduction, renewable energy advice, and emergency preparation. City data: ${JSON.stringify(c)}. Keep it concise and action-oriented.`;
    const body = await chat([{ role: 'user', content: prompt }], 'You are GreenAgentOS AI climate communication officer.');
    res.json({
      subject: `GreenAgentOS Climate Advisory for ${city}`,
      body
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Send bulk email
router.post('/send-email', auth, async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;
    if (!recipients?.length || !subject || !body) {
      return res.status(400).json({ error: 'Recipients, subject, and body required' });
    }
    const result = await sendBulkEmail({ recipients, subject, body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FRIDAY TTS proxy — Dual-Response Architecture
// Short responses: speak directly. Long analytical responses: generate a spoken executive briefing first.
// Priority: ElevenLabs -> Chatterbox -> Browser Web Speech fallback.
router.post('/speak', auth, async (req, res) => {
  const rawText = String(req.body?.text || '').trim();
  if (!rawText) return res.status(400).json({ audioUrl: null, error: 'Text is required' });

  // Determine what text to send to TTS
  let spokenText = rawText;

  // Short responses (greetings, confirmations, brief answers): speak directly.
  // Long analytical responses: generate a spoken executive briefing first.
  if (spokenText.length > 200) {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const briefing = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Convert the following analytical response into a natural spoken executive briefing optimized for voice playback.

Requirements:

* Briefly cover all major analytical topics discussed in the response, not just the strongest single finding
* Preserve the overall analytical picture while compressing excessive detail, repetitive explanations, and raw metrics
* Mention important causes, trends, risks, impacts, and recommendations if they are part of the original response
* Preserve broad topic coverage so the listener understands the complete operational situation
* Sound like a confident strategic analyst speaking naturally during a live briefing
* Use smooth conversational flow with clean sentence transitions
* Avoid robotic summarization, vague conclusions, or overly generic statements
* Do not read numbered lists, bullet points, markdown formatting, tables, or dense metric blocks aloud
* Keep the speech concise but still information-rich and analytically meaningful
* Target approximately 500–700 characters
* Preserve useful follow-up guidance naturally if relevant
* End naturally without abrupt cutoffs
* Do not add greetings, introductions, or sign-offs

The spoken output should feel like:
a compressed executive overview that intelligently covers the major discussion points while remaining natural and conversational for TTS playback.`
          },
          { role: 'user', content: spokenText }
        ],
        max_tokens: 250,
        temperature: 0.5,
      });
      const briefingText = briefing.choices[0]?.message?.content;
      if (briefingText && briefingText.length > 10) {
        spokenText = briefingText;
      }
    } catch (briefErr) {
      // Briefing generation failed — fall back to truncated original
      console.error('TTS briefing generation failed:', briefErr.message);
      spokenText = spokenText.substring(0, 450);
    }
  }

  // Clean and cap the final spoken text
  spokenText = spokenText.replace(/[\r\n]+/g, ' ').substring(0, 700);

  // 1) ElevenLabs premium / advanced voice
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

    if (elevenKey && !elevenKey.includes('your_') && voiceId && !voiceId.includes('your_')) {
      const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: spokenText,
          model_id: modelId,
          voice_settings: {
            stability: Number(process.env.ELEVENLABS_STABILITY || 0.45),
            similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY_BOOST || 0.85),
            style: Number(process.env.ELEVENLABS_STYLE || 0.35),
            use_speaker_boost: true
          }
        })
      });

      if (elevenRes.ok) {
        const buffer = await elevenRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return res.json({ audioUrl: `data:audio/mpeg;base64,${base64}`, provider: 'elevenlabs' });
      }

      console.warn('ElevenLabs TTS failed:', elevenRes.status, await elevenRes.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('ElevenLabs fallback active:', err.message);
  }

  // 2) Chatterbox local free/open-source fallback
  try {
    const ttsUrl = process.env.CHATTERBOX_TTS_URL;
    if (ttsUrl && !ttsUrl.includes('your_')) {
      const response = await fetch(`${ttsUrl.replace(/\/$/, '')}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: spokenText,
          voice: process.env.CHATTERBOX_VOICE || 'female',
          exaggeration: Number(process.env.CHATTERBOX_EXAGGERATION || 0.65),
          cfg_weight: Number(process.env.CHATTERBOX_CFG_WEIGHT || 0.5)
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'audio/wav';
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return res.json({ audioUrl: `data:${contentType};base64,${base64}`, provider: 'chatterbox' });
      }
    }
  } catch (err) {
    console.warn('Chatterbox fallback active:', err.message);
  }

  // 3) Frontend will use browser voice fallback
  res.json({ audioUrl: null, provider: 'browser', message: 'ElevenLabs/Chatterbox not configured. Browser voice fallback will be used.' });
});

// API key status helper — does NOT expose secret values
router.get('/api-key-status', auth, async (req, res) => {
  const mask = (v) => v && !String(v).includes('your_') ? 'configured' : 'missing';
  res.json({
    groq: mask(process.env.GROQ_API_KEY),
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    assemblyAI: mask(process.env.ASSEMBLYAI_API_KEY),
    elevenLabs: process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID ? 'configured' : 'missing',
    elevenLabsModel: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
    chatterboxTTS: process.env.CHATTERBOX_TTS_URL ? 'configured/local fallback' : 'missing',
    mongodb: mask(process.env.MONGODB_URI),
    gmail: process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'configured' : 'missing',
    note: 'Secret keys are hidden for safety. Add them in backend/.env.'
  });
});

// Vietnam city data API
router.get('/vietnam-data', auth, async (req, res) => {
  const { VIETNAM_CITIES, VIETNAM_STATS } = require('../utils/vietnamData');
  res.json({ cities: VIETNAM_CITIES, stats: VIETNAM_STATS });
});

module.exports = router;
