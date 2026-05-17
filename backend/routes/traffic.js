const express = require('express');
const router = express.Router();
const axios = require('axios');

// ── Gemini Reasoning Cache ──
// Stores last AI reasoning per city, only regenerates when severity fingerprint changes
const _reasoningCache = {};

// ── Carbon Estimation Engine ──
// Pure deterministic: no random variance. Tied directly to speed ratio + zone type.
function calculateCarbon(speedRatio, baseCarbon = 2) {
  let multiplier = 1.0;
  if (speedRatio < 0.3) multiplier = 4.5;
  else if (speedRatio < 0.5) multiplier = 3.0;
  else if (speedRatio < 0.7) multiplier = 2.0;
  else if (speedRatio < 0.9) multiplier = 1.5;

  const rawCarbon = Math.max(0.5, baseCarbon * multiplier);
  return parseFloat(rawCarbon.toFixed(1));
}

// ── Severity Classification ──
function getSeverityLevel(speedRatio) {
  if (speedRatio < 0.25) return { color: 'purple', label: 'Critical' };
  if (speedRatio < 0.45) return { color: 'red', label: 'Severe' };
  if (speedRatio < 0.65) return { color: 'orange', label: 'Congested' };
  if (speedRatio < 0.85) return { color: 'yellow', label: 'Moderate' };
  return { color: 'green', label: 'Free Flow' };
}

// ── TomTom Reverse Geocoding ──
async function reverseGeocode(lat, lng, apiKey) {
  try {
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${apiKey}&radius=100`;
    const res = await axios.get(url, { timeout: 3000 });
    if (res.data && res.data.addresses && res.data.addresses[0]) {
      const addr = res.data.addresses[0].address;
      // Build a real corridor name from actual road metadata
      const streetName = addr.streetName || addr.street || '';
      const district = addr.municipalitySubdivision || addr.countrySubdivision || '';
      const municipality = addr.municipality || '';
      
      if (streetName && district) return `${streetName}, ${district}`;
      if (streetName) return streetName;
      if (district && municipality) return `${district}, ${municipality}`;
      return district || municipality || null;
    }
  } catch (err) {
    // Geocoding is optional enrichment — don't block pipeline
  }
  return null;
}

// ── Main Analysis Endpoint ──
router.post('/analyze', async (req, res) => {
  try {
    const { hotspots, cityName } = req.body;

    if (!hotspots || !Array.isArray(hotspots)) {
      return res.status(400).json({ error: 'Valid hotspots array required' });
    }

    const TOMTOM_KEY = process.env.TOMTOM_API_KEY;

    // 1. Fetch live traffic data + reverse geocoding in parallel
    const analyzedHotspots = await Promise.all(hotspots.map(async (hs) => {
      let currentSpeed = null;
      let freeFlowSpeed = null;
      let confidence = null;
      let roadClosure = false;
      let frc = null;
      let corridorName = null;
      let tomtomAvailable = false;

      if (TOMTOM_KEY) {
        // Traffic Flow + Reverse Geocode in parallel
        const [flowResult, geoResult] = await Promise.allSettled([
          axios.get(
            `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_KEY}&point=${hs.lat},${hs.lng}`,
            { timeout: 5000 }
          ),
          reverseGeocode(hs.lat, hs.lng, TOMTOM_KEY)
        ]);

        if (flowResult.status === 'fulfilled' && flowResult.value.data?.flowSegmentData) {
          const fsd = flowResult.value.data.flowSegmentData;
          currentSpeed = fsd.currentSpeed;
          freeFlowSpeed = fsd.freeFlowSpeed;
          confidence = fsd.confidence;
          roadClosure = fsd.roadClosure || false;
          frc = fsd.frc;
          tomtomAvailable = true;
        }

        if (geoResult.status === 'fulfilled' && geoResult.value) {
          corridorName = geoResult.value;
        }
      }

      // If TomTom failed, mark as unavailable — don't fabricate
      if (!tomtomAvailable) {
        return {
          ...hs,
          corridorName: corridorName || hs.name,
          severity: 'yellow',
          severityLabel: 'Data Unavailable',
          carbonRaw: null,
          carbon: '—',
          currentSpeed: null,
          freeFlowSpeed: null,
          speedRatio: null,
          efficiency: null,
          confidence: null,
          roadClosure: false,
          frc: null,
          cause: 'Traffic telemetry temporarily unavailable.',
          action: 'Waiting for TomTom API reconnection.',
          aiSource: 'unavailable',
          lastUpdated: new Date().toISOString()
        };
      }

      freeFlowSpeed = Math.max(1, freeFlowSpeed);
      const ratio = Math.min(1.0, currentSpeed / freeFlowSpeed);
      const efficiency = Math.round(ratio * 100);
      const { color, label } = getSeverityLevel(ratio);

      // Carbon base depends on zone classification
      const baseCarbonMap = { industrial: 4, logistics: 3.5, transit: 2.5, commercial: 2, tech: 2, tourism: 1.5, residential: 1.5, government: 1 };
      const base = baseCarbonMap[hs.type] || 2;
      const carbonRaw = calculateCarbon(ratio, base);

      return {
        ...hs,
        corridorName: corridorName || hs.name,
        severity: color,
        severityLabel: label,
        carbonRaw,
        carbon: `${carbonRaw} t/h`,
        currentSpeed,
        freeFlowSpeed,
        speedRatio: ratio,
        efficiency,
        confidence,
        roadClosure,
        frc,
        cause: null,  // Will be filled by Gemini
        action: null,
        aiSource: 'pending',
        lastUpdated: new Date().toISOString()
      };
    }));

    // 2. Build severity fingerprint for cache comparison
    const fingerprint = analyzedHotspots
      .map(h => `${h.id}:${h.severityLabel}:${h.currentSpeed}`)
      .join('|');

    // 3. Check reasoning cache — only call Gemini if conditions changed
    const cachedEntry = _reasoningCache[cityName];
    const cacheValid = cachedEntry
      && cachedEntry.fingerprint === fingerprint
      && (Date.now() - cachedEntry.timestamp) < 180000; // 3-minute TTL

    if (cacheValid) {
      // Apply cached reasoning
      analyzedHotspots.forEach(hs => {
        const cached = cachedEntry.insights.find(i => i.id == hs.id);
        if (cached && hs.aiSource === 'pending') {
          hs.cause = cached.cause;
          hs.action = cached.action;
          hs.aiSource = 'gemini-cached';
        }
      });
      console.log(`[GEMINI] Cache hit for ${cityName} — skipping API call.`);
    } else {
      // 4. Generate fresh AI reasoning via Google Gemini
      const GEMINI_KEY = process.env.GOOGLE_API_KEY;
      if (GEMINI_KEY) {
        const pendingHotspots = analyzedHotspots.filter(h => h.aiSource === 'pending');

        if (pendingHotspots.length > 0) {
          const timeOfDay = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh'
          });

          const promptData = pendingHotspots.map(h =>
            `- id:${h.id} "${h.corridorName}" (${h.type}): speed ${h.currentSpeed}/${h.freeFlowSpeed} km/h, efficiency ${h.efficiency}%, severity "${h.severityLabel}", carbon ${h.carbon}${h.roadClosure ? ', ROAD CLOSED' : ''}`
          ).join('\n');

          const instruction = `You are a senior urban traffic operations analyst for VietCarbon, a Vietnamese environmental intelligence platform.
Current local time in Vietnam: ${timeOfDay}. City: ${cityName}.

Below is REAL live traffic telemetry from TomTom for active monitoring zones. Analyze each zone and provide:
- "cause": A single concise sentence explaining the most probable reason for the current traffic condition based on the data, time of day, zone type, and local context. Do NOT invent incidents. Reason only from what the data implies.
- "action": A single concise operational mitigation recommendation appropriate to the severity.

Respond ONLY as a raw JSON array: [{"id": <number>, "cause": "...", "action": "..."}]
No markdown. No backticks. No explanation text outside the JSON.`;

          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`,
              {
                contents: [{
                  parts: [{ text: `${instruction}\n\nLive telemetry:\n${promptData}` }]
                }]
              },
              { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            );

            if (response.data?.candidates?.[0]) {
              let rawText = response.data.candidates[0].content.parts[0].text;
              rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
              
              // Handle both array and object-wrapped responses
              let aiInsights;
              const parsed = JSON.parse(rawText);
              aiInsights = Array.isArray(parsed) ? parsed : (parsed.hotspots || parsed.data || parsed.results || [parsed]);

              analyzedHotspots.forEach(hs => {
                const insight = aiInsights.find(i => i.id == hs.id);
                if (insight && hs.aiSource === 'pending') {
                  hs.cause = insight.cause;
                  hs.action = insight.action;
                  hs.aiSource = 'gemini-live';
                }
              });

              // Update cache
              _reasoningCache[cityName] = {
                fingerprint,
                timestamp: Date.now(),
                insights: aiInsights
              };

              console.log(`[GEMINI] Live reasoning generated for ${cityName} (${pendingHotspots.length} zones).`);
            }
          } catch (err) {
            console.error('[GEMINI] Reasoning generation failed:', err.message);
          }
        }
      }
    }

    // 5. Mark any still-pending hotspots as AI-unavailable (honest labeling)
    analyzedHotspots.forEach(hs => {
      if (hs.aiSource === 'pending') {
        hs.cause = 'AI reasoning temporarily unavailable.';
        hs.action = 'Gemini API did not respond. Retry on next refresh.';
        hs.aiSource = 'unavailable';
      }
    });

    res.json(analyzedHotspots);

  } catch (error) {
    console.error('Traffic API Error:', error);
    res.status(500).json({ error: 'Failed to process live traffic intelligence' });
  }
});

module.exports = router;
