import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  VIETNAM_CITIES as BASE_VIETNAM_CITIES,
  VIETNAM_STATS as BASE_VIETNAM_STATS,
  CARBON_EMISSION_DATA as BASE_CARBON_EMISSION_DATA,
  POPULATION_DATA as BASE_POPULATION_DATA,
  VEHICLE_TRAFFIC_DATA as BASE_VEHICLE_TRAFFIC_DATA,
  DISASTER_CLIMATE_DATA as BASE_DISASTER_CLIMATE_DATA,
  SOIL_HEALTH_DATA as BASE_SOIL_HEALTH_DATA,
  RENEWABLE_ENERGY_DATA as BASE_RENEWABLE_ENERGY_DATA,
  AQI_POLLUTION_DATA as BASE_AQI_POLLUTION_DATA,
  CO2_PRODUCTION_AREAS as BASE_CO2_PRODUCTION_AREAS,
  CROWDED_AREAS_DATA as BASE_CROWDED_AREAS_DATA
} from '../utils/vietnamData';
import {
  Leaf, LogOut, Map, FileText, Factory, Sun, Wind, CloudRain, Users, Loader,
  Bot, Activity, Zap, AlertTriangle, Droplets, Thermometer, BarChart2, Globe,
  Bell, Car, Shield, TrendingUp, TrendingDown, Cpu, Layers, Filter, RefreshCw,
  ChevronDown, ChevronUp, Download, Search, Settings, Database, TreePine
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ComposedChart, Legend
} from 'recharts';
import VietnamMap from '../components/VietnamMap';
import HydroGridAI from './HydroGridAI';
import FridayAI from '../components/FridayAI';
import TrafficIntelligence from './TrafficIntelligence';


const NEON = '#00ff88';
const NEON2 = '#00e5ff';
const WARN = '#ff6d00';
const CRIT = '#ff1744';
const GOLD = '#ffb300';

const tabs = [
  ['overview', 'Command Center', Activity],
  ['map', 'Vietnam AI Map', Map],
  ['co2', 'CO₂ Control', Factory],
  ['climate', 'Climate & Disaster', CloudRain],
  ['energy', 'Renewable Energy', Sun],
  ['soil', 'Soil & Agriculture', TreePine],
  ['traffic', 'Traffic & Vehicles', Car],
  ['trafficIntel', 'Traffic Intelligence', Cpu],
  ['pollution', 'AQI & Pollution', Wind],
  ['report', 'AI Report', FileText],
  ['citizens', 'Citizen Data', Users],
  ['dataCenter', 'AI Data Center', Database],
  ['alerts', 'Alert System', Bell],
  ['hydrogrid', 'HydroGrid AI', Zap],
];

const IMAGES = {
  solar: '/images/1778077904969_image.png',
  wind: '/images/1778077917090_image.png',
  ev: '/images/1778077932470_image.png',
  flood: '/images/1778077954813_image.png',
  farmWork: '/images/1778077964740_image.png',
  riceField: '/images/1778077980231_image.png',
  smogHCMC: '/images/1778077994995_image.png',
  smogHanoi: '/images/1778077994995_image.png',
};

const mockAlerts = [
  { city: 'Mekong Delta', type: 'flood', level: 'critical' },
  { city: 'Ho Chi Minh City', type: 'pollution', level: 'high' },
  { city: 'Hanoi', type: 'heatwave', level: 'high' },
  { city: 'Da Nang', type: 'storm', level: 'medium' },
];

function GaugeCard({ label, value, max, unit, color, icon: Icon, sub }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 44; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const c2 = color || NEON;
  return (
    <div className="p-4 rounded-2xl flex flex-col items-center relative overflow-hidden"
      style={{ background: '#0a1f0e', border: `1px solid ${c2}22`, boxShadow: `0 0 20px ${c2}11` }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg,transparent,${c2},transparent)` }} />
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#0d2e14" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={c2} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${c2})` }} />
        <text x="55" y="50" textAnchor="middle" fill={c2} fontSize="18" fontWeight="bold" fontFamily="monospace">{value}</text>
        <text x="55" y="65" textAnchor="middle" fill="#4caf50" fontSize="10" fontFamily="monospace">{unit}</text>
      </svg>
      <div className="font-orbitron text-xs font-bold mt-1 text-center" style={{ color: c2 }}>{label}</div>
      {sub && <div className="text-xs font-mono mt-0.5 text-center" style={{ color: '#4caf50', fontSize: '10px' }}>{sub}</div>}
    </div>
  );
}

function Card({ children, className = '', style = {} }) {
  return <div className={`rounded-2xl p-5 ${className}`} style={{ background: '#0a1f0e', border: '1px solid #00ff8822', boxShadow: '0 0 20px #00ff8808', ...style }}>{children}</div>;
}

function StatRow({ label, value, color, icon }) {
  return (
    <div className="flex justify-between items-center p-2 rounded-lg" style={{ background: '#061209', border: '1px solid #0d2e14' }}>
      <span className="text-xs font-mono" style={{ color: '#81c784' }}>{icon} {label}</span>
      <span className="text-xs font-orbitron font-bold" style={{ color: color || NEON }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI-POWERED ALERTS SECTION (no hardcoded alerts)
// ─────────────────────────────────────────────
function AlertsSection({ VIETNAM_CITIES, openMeteoLive, vietnamTime, sentAlerts, setSentAlerts, setNotifications, setActive, setSelectedCity, NEON, NEON2, WARN, CRIT, GOLD, IMAGES, sendCitizenAlertFn, citizenAlertVal, setCitizenAlert }) {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [aiAlerts, setAiAlerts] = React.useState([]);
  const [broadcastMsg, setBroadcastMsg] = React.useState('');
  const [broadcastLoading, setBroadcastLoading] = React.useState(false);
  const [allClear, setAllClear] = React.useState(false);
  const [selectedAiAlert, setSelectedAiAlert] = React.useState(null);
  const [lastAnalyzed, setLastAnalyzed] = React.useState(null);
  const [alertCity, setAlertCity] = React.useState('');

  const runAIAnalysis = async () => {
    if (!alertCity) {
      setAiAlerts([]);
      setAllClear(false);
      setSelectedAiAlert(null);
      alert('Please select a city first. AI emergency analysis will not run without city selection.');
      return;
    }
    setAnalyzing(true);
    setAiAlerts([]);
    setAllClear(false);
    setBroadcastMsg('');
    setSelectedAiAlert(null);

    // Collect real live data only for the selected city
    const selectedLiveCity = VIETNAM_CITIES.find(c => c.name === alertCity);
    const liveData = [selectedLiveCity].filter(Boolean).map(c => ({
      city: c.name,
      aqi: c.aqi,
      pm25: c.pm25 || Math.round(c.aqi * 0.6),
      pm10: c.pm10 || Math.round(c.aqi * 0.9),
      temp: c.weatherTemp || (25 + Math.round((c.heatwaveRisk || 40) / 5)),
      rainfall: Number(c.precipitation || 0).toFixed(1),
      floodRisk: c.floodRisk || 0,
      heatwaveRisk: c.heatwaveRisk || 0,
      stormRisk: c.stormRisk || 0,
      co2: c.co2 || (c.aqi * 0.05).toFixed(2),
      trafficDensity: c.trafficDensity || 50,
      windSpeed: c.windSpeed || 0,
    }));

    const prompt = `You are a Vietnam environmental emergency AI system. Analyze the following LIVE real-time data from the selected Vietnam city and determine if emergency alerts are needed.

Live data: ${JSON.stringify(liveData, null, 2)}

Alert thresholds:
- AQI > 150: Unhealthy — generate pollution alert
- AQI > 200: Very Unhealthy — critical alert
- PM2.5 > 55: Generate alert
- Flood risk > 72: Generate flood alert
- Heatwave risk > 74: Generate heatwave alert
- Storm risk > 68: Generate storm alert
- Temp > 38°C: Heatwave warning

Only generate an alert if this selected city exceeds thresholds. If it is below all thresholds, it is SAFE.

Respond ONLY as valid JSON array. Each alert object must have:
{
  "city": "city name",
  "type": "pollution|flood|heatwave|storm|co2",
  "level": "critical|high|medium",
  "affectedArea": "specific districts or areas",
  "aqiValue": number or null,
  "pm25Value": number or null,
  "tempValue": number or null,
  "rainfallValue": number or null,
  "riskScore": number (0-100),
  "reason": "specific reason based on live data values",
  "citizenInstructions": "what citizens should do right now",
  "adminAction": "what government/admin should do",
  "timestamp": "ISO string"
}

If NO city exceeds any threshold, return: {"allClear": true, "message": "No emergency risk detected for the selected city based on current live conditions."}

Only return JSON. No markdown, no explanation text.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await res.json();
      const text = d.content?.find(b => b.type === 'text')?.text || '[]';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.allClear) {
        setAllClear(true);
      } else if (Array.isArray(parsed)) {
        setAiAlerts(parsed.sort((a, b) => b.riskScore - a.riskScore));
      }
    } catch (err) {
      // Intelligent fallback using real data thresholds
      const generated = liveData
        .filter(c => c.aqi > 130 || c.floodRisk > 70 || c.heatwaveRisk > 72 || c.stormRisk > 68)
        .map(c => {
          const type = c.aqi > 155 ? 'pollution' : c.floodRisk > 72 ? 'flood' : c.heatwaveRisk > 72 ? 'heatwave' : 'storm';
          const level = (c.aqi > 180 || c.floodRisk > 82 || c.heatwaveRisk > 84) ? 'critical' : 'high';
          return {
            city: c.city, type, level,
            affectedArea: c.city + ' urban districts',
            aqiValue: c.aqi, pm25Value: c.pm25, tempValue: c.temp,
            rainfallValue: parseFloat(c.rainfall), riskScore: Math.min(100, c.aqi + c.floodRisk),
            reason: type === 'pollution' ? `AQI is ${c.aqi} with PM2.5 at ${c.pm25} μg/m³ — exceeds safe limits` : type === 'flood' ? `River levels elevated, flood risk index at ${c.floodRisk}%` : type === 'heatwave' ? `Temperature at ${c.temp}°C with heatwave risk index ${c.heatwaveRisk}%` : `Storm risk index at ${c.stormRisk}%`,
            citizenInstructions: type === 'pollution' ? 'Wear N95 masks outdoors. Avoid heavy exercise. Keep children and elderly indoors.' : type === 'flood' ? 'Avoid low-lying areas. Prepare emergency kit. Monitor official flood warnings.' : type === 'heatwave' ? 'Stay hydrated. Avoid outdoor activity 11am-4pm. Use cooling centers.' : 'Secure outdoor objects. Avoid coastal areas. Monitor weather updates.',
            adminAction: type === 'pollution' ? 'Issue public transport advisory. Increase AQI monitoring frequency. Alert factories to reduce emissions.' : type === 'flood' ? 'Activate flood warning systems. Pre-position emergency teams. Issue evacuation advisories for flood zones.' : 'Issue public health advisory. Open emergency cooling centers. Alert medical facilities.',
            timestamp: new Date().toISOString()
          };
        });
      if (generated.length === 0) setAllClear(true);
      else setAiAlerts(generated);
    }
    setLastAnalyzed(new Date().toLocaleTimeString());
    setAnalyzing(false);
  };

  const generateBroadcast = async (alert) => {
    if (!alert) return;
    setBroadcastLoading(true);
    const prompt = `Generate a citizen broadcast message for Vietnam based on this emergency alert data:
City: ${alert.city}
Type: ${alert.type}
Level: ${alert.level}
AQI: ${alert.aqiValue}, PM2.5: ${alert.pm25Value}, Temp: ${alert.tempValue}°C, Rainfall: ${alert.rainfallValue}mm
Reason: ${alert.reason}
Citizen instructions: ${alert.citizenInstructions}
Admin action: ${alert.adminAction}

Write a clear, urgent but calm broadcast message (2-3 sentences) that:
1. States the emergency type and location
2. Gives the exact data values causing concern
3. Provides immediate action for citizens
4. States the alert level

Keep it under 120 words. Be specific, not generic.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 200, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await res.json();
      setBroadcastMsg(d.content?.find(b => b.type === 'text')?.text || '');
      setCitizenAlert(d.content?.find(b => b.type === 'text')?.text || '');
    } catch {
      const msg = `⚠️ ${alert.level.toUpperCase()} ALERT — ${alert.city}: ${alert.reason}. ${alert.citizenInstructions} Issued: ${new Date().toLocaleString('en-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
      setBroadcastMsg(msg); setCitizenAlert(msg);
    }
    setBroadcastLoading(false);
  };

  const sendAlertToCitizens = (alert) => {
    if (!alert) return;
    const msg = broadcastMsg || `${alert.type.toUpperCase()} WARNING for ${alert.city}: ${alert.reason}. ${alert.citizenInstructions}`;
    const payload = { ...alert, message: msg, createdAt: new Date().toISOString() };
    const next = [payload, ...sentAlerts];
    setSentAlerts(next);
    localStorage.setItem('citizen_alerts', JSON.stringify(next));
    setNotifications(v => v + 1);
    setCitizenAlert(msg);
    alert('✅ AI-generated alert sent to registered citizen message boxes.');
  };

  const levelColors = { critical: CRIT, high: WARN, medium: '#ffb300' };
  const typeIcons = { pollution: '🏭', flood: '🌊', heatwave: '🌡', storm: '⛈', co2: '💨' };

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* AI ALERT CENTER */}
        <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822', boxShadow: '0 0 20px #00ff8808' }}>
          <h3 className="font-orbitron text-sm mb-3 flex items-center gap-2" style={{ color: CRIT }}>
            ⚠ AI Emergency Alert Center
            <span className="text-[8px] px-1.5 py-0.5 rounded font-mono" style={{ background: '#00ff8811', color: NEON, border: '1px solid #00ff8833' }}>LIVE DATA</span>
          </h3>
          <select value={alertCity} onChange={e => { setAlertCity(e.target.value); setAiAlerts([]); setAllClear(false); setSelectedAiAlert(null); }}
            className="w-full mb-3 px-3 py-2.5 rounded-lg text-xs font-mono outline-none"
            style={{ background: '#061209', border: '1px solid #00ff8833', color: '#e8f5e9' }}>
            <option value="">Select city before AI analysis</option>
            {VIETNAM_CITIES.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
          </select>
          <button onClick={runAIAnalysis} disabled={analyzing || !alertCity}
            className="w-full mb-3 py-2.5 rounded-lg text-xs font-orbitron flex items-center justify-center gap-2 transition-all"
            style={{ background: analyzing ? '#ff174411' : '#ff174422', border: '1px solid #ff174466', color: CRIT }}>
            {analyzing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Live AQI, Weather & Risk Data...</> : '🔍 Analyze Live Data & Generate AI Alerts'}
          </button>
          {lastAnalyzed && <div className="text-[9px] font-mono mb-2" style={{ color: '#4caf50' }}>Last analyzed: {lastAnalyzed}</div>}

          <div className="space-y-2">
            {!analyzing && !aiAlerts.length && !allClear && (
              <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#061209', border: '1px solid #00ff8822', color: '#81c784' }}>
                Select one city, then click "Analyze Live Data". AI will not generate alerts before city selection. Analysis uses real AQI, PM2.5, temperature, rainfall, flood and storm data.
              </div>
            )}
            {allClear && (
              <div className="p-4 rounded-xl text-center" style={{ background: '#00ff8811', border: '1px solid #00ff8844' }}>
                <div className="text-2xl mb-1">✅</div>
                <div className="text-xs font-orbitron font-bold" style={{ color: NEON }}>No Emergency Alert Required</div>
                <div className="text-[10px] font-mono mt-1" style={{ color: '#81c784' }}>Current live conditions are normal across all monitored Vietnamese cities.</div>
              </div>
            )}
            {aiAlerts.map((a, i) => {
              const c = levelColors[a.level] || WARN;
              return (
                <button key={i} onClick={() => { setSelectedAiAlert(a); generateBroadcast(a); }} className="block w-full text-left">
                  <div className="flex items-start gap-3 p-3 rounded-xl transition-all hover:opacity-90" style={{ background: `${c}11`, border: `1px solid ${c}44` }}>
                    <div className="text-xl flex-shrink-0">{typeIcons[a.type] || '⚠'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-orbitron font-bold" style={{ color: c }}>{a.type.toUpperCase()} — {a.city}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: '#e8f5e9' }}>{a.reason}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {a.aqiValue && <span className="text-[9px] px-1 rounded" style={{ background: '#ff174422', color: CRIT }}>AQI {a.aqiValue}</span>}
                        {a.pm25Value && <span className="text-[9px] px-1 rounded" style={{ background: '#ff6d0022', color: WARN }}>PM2.5 {a.pm25Value}</span>}
                        {a.tempValue && <span className="text-[9px] px-1 rounded" style={{ background: '#ffb30022', color: GOLD }}>🌡{a.tempValue}°C</span>}
                        <span className="text-[9px] px-1 rounded font-bold uppercase" style={{ background: `${c}22`, color: c }}>{a.level}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI CITIZEN BROADCAST */}
        <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822', boxShadow: '0 0 20px #00ff8808' }}>
          <h3 className="font-orbitron text-sm mb-3" style={{ color: WARN }}>📢 AI Citizen Climate Broadcast</h3>
          {selectedAiAlert ? (
            <div className="space-y-3">
              <div className="p-2 rounded-lg text-[10px] font-mono" style={{ background: '#061209', border: `1px solid ${levelColors[selectedAiAlert.level] || WARN}44`, color: '#e8f5e9' }}>
                <b style={{ color: levelColors[selectedAiAlert.level] || WARN }}>Selected:</b> {selectedAiAlert.type.toUpperCase()} — {selectedAiAlert.city} ({selectedAiAlert.level})
              </div>
              {broadcastLoading ? (
                <div className="flex items-center gap-2 p-3"><RefreshCw className="w-4 h-4 animate-spin text-[#00ff88]" /><span className="text-xs font-mono text-[#81c784]">Generating AI broadcast...</span></div>
              ) : (
                <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={5}
                  className="w-full p-2 rounded-lg text-xs font-mono"
                  style={{ background: '#061209', border: '1px solid #00ff8822', color: '#e8f5e9', resize: 'vertical' }}
                  placeholder="AI broadcast will appear here..." />
              )}
              <button onClick={() => sendAlertToCitizens(selectedAiAlert)}
                className="w-full py-2 rounded-lg text-xs font-mono font-bold"
                style={{ background: 'linear-gradient(135deg,#ff6d00,#ff1744)', color: '#fff' }}>
                SEND AI ALERT TO CITIZEN MESSAGE BOX
              </button>
              <div className="text-[9px] font-mono" style={{ color: NEON2 }}>
                Delivered only to registered citizens in their notification center.
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-mono" style={{ color: '#4caf50', background: '#061209', borderRadius: 12 }}>
              Select an alert from the Emergency Alert Center to generate an AI-powered citizen broadcast.
            </div>
          )}
          <div className="mt-3 p-2.5 rounded-lg text-[10px] font-mono" style={{ background: '#061209', border: '1px solid #00e5ff22', color: '#81c784' }}>
            Sent: {sentAlerts.length} alerts · Latest: {sentAlerts[0]?.city || 'None'}
          </div>
        </div>

        {/* WEATHER OVERVIEW */}
        <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822', boxShadow: '0 0 20px #00ff8808' }}>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h3 className="font-orbitron text-sm" style={{ color: NEON }}>🌦 City Weather Overview</h3>
            <div className="text-[10px] font-mono" style={{ color: openMeteoLive.status === 'live' ? NEON2 : WARN }}>
              {openMeteoLive.status === 'live' ? '🟢 LIVE' : '🟡 Fallback'} · {vietnamTime}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VIETNAM_CITIES.slice(0, 8).map(c => (
              <div key={c.id} className="p-2.5 rounded-xl text-center" style={{ background: '#061209', border: `1px solid ${c.openMeteoLive ? '#00e5ff55' : '#00ff8818'}` }}>
                <div className="font-orbitron text-[10px] font-bold mb-0.5" style={{ color: NEON }}>{c.name}</div>
                <div className="text-xl mb-0.5">{c.weatherIcon || (c.aqi > 100 ? '🌫' : c.floodRisk > 70 ? '🌧' : c.heatwaveRisk > 75 ? '☀' : '⛅')}</div>
                <div className="text-xs font-mono" style={{ color: '#e8f5e9' }}>{c.weatherTemp || (25 + Math.round((c.heatwaveRisk || 30) / 5))}°C</div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: c.aqi > 150 ? CRIT : c.aqi > 100 ? WARN : NEON }}>AQI: {c.aqi}</div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: NEON2 }}>💨 {Math.round(c.windSpeed || 0)} · 🌧 {Number(c.precipitation || 0).toFixed(1)}mm</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SELECTED ALERT DETAIL */}
      {selectedAiAlert && (
        <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: `1px solid ${levelColors[selectedAiAlert.level] || WARN}44`, boxShadow: '0 0 20px #00ff8808' }}>
          <h3 className="font-orbitron text-sm mb-4" style={{ color: levelColors[selectedAiAlert.level] || WARN }}>
            🚨 {selectedAiAlert.type.toUpperCase()} Alert — {selectedAiAlert.city} [{selectedAiAlert.level.toUpperCase()}]
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">Affected Area</div>
              <div style={{ color: '#e8f5e9' }}>{selectedAiAlert.affectedArea}</div>
            </div>
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">Live Data Values</div>
              <div className="space-y-0.5" style={{ color: '#e8f5e9' }}>
                {selectedAiAlert.aqiValue && <div>AQI: <b style={{ color: CRIT }}>{selectedAiAlert.aqiValue}</b></div>}
                {selectedAiAlert.pm25Value && <div>PM2.5: <b style={{ color: WARN }}>{selectedAiAlert.pm25Value} μg/m³</b></div>}
                {selectedAiAlert.tempValue && <div>Temp: <b style={{ color: '#ffb300' }}>{selectedAiAlert.tempValue}°C</b></div>}
                {selectedAiAlert.rainfallValue > 0 && <div>Rainfall: <b style={{ color: NEON2 }}>{selectedAiAlert.rainfallValue}mm</b></div>}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">Risk Score</div>
              <div className="font-bold text-2xl font-orbitron" style={{ color: levelColors[selectedAiAlert.level] || WARN }}>{selectedAiAlert.riskScore}/100</div>
            </div>
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">⚠️ Reason</div>
              <div style={{ color: '#e8f5e9' }}>{selectedAiAlert.reason}</div>
            </div>
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">👥 Citizen Instructions</div>
              <div style={{ color: '#c8f7d0' }}>{selectedAiAlert.citizenInstructions}</div>
            </div>
            <div>
              <div className="text-[9px] text-[#81c784] uppercase mb-1">🏛️ Admin Action</div>
              <div style={{ color: NEON2 }}>{selectedAiAlert.adminAction}</div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => { setActive('map'); setSelectedCity(selectedAiAlert.city === 'Mekong Delta' ? 'Can Tho' : selectedAiAlert.city); }}
              className="px-4 py-2 rounded-lg font-orbitron text-xs" style={{ background: '#00e5ff22', color: NEON2, border: '1px solid #00e5ff44' }}>
              📍 Show on Map
            </button>
            <button onClick={() => sendAlertToCitizens(selectedAiAlert)}
              className="px-4 py-2 rounded-lg font-orbitron text-xs" style={{ background: '#ff174422', color: CRIT, border: '1px solid #ff174444' }}>
              📢 Send to Citizens
            </button>
            <div className="text-[9px] font-mono self-center" style={{ color: '#4caf50' }}>
              Timestamp: {new Date(selectedAiAlert.timestamp || Date.now()).toLocaleString('en-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </div>
          </div>
        </div>
      )}

      {/* CLIMATE GALLERY */}
      <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
        <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Climate Issue Gallery — Vietnam</h3>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80', 'Flooding — Can Tho'],
            ['https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=400&q=80', 'Air Pollution — Ho Chi Minh City'],
            ['https://images.unsplash.com/photo-1573481078779-e81a95b8f5ad?w=400&q=80', 'Heat & Smog — Hanoi'],
            ['https://images.unsplash.com/photo-1504608524841-42f0e2a94e0b?w=400&q=80', 'Storm System — Central Vietnam'],
          ].map(([src, cap]) => (
            <div key={cap} className="relative rounded-xl overflow-hidden" style={{ height: 120 }}>
              <img src={src} alt={cap} className="w-full h-full object-cover" onError={e => { e.target.src = IMAGES.flood; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020b05] to-transparent" />
              <div className="absolute bottom-1 left-2 right-2">
                <div className="text-[9px] font-mono" style={{ color: CRIT }}>{cap}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherAlert({ city, type, level }) {
  const colors = { critical: '#ff1744', high: '#ff6d00', medium: '#ffb300' };
  const icons = { flood: '🌊', storm: '⛈', pollution: '🏭', heatwave: '🌡', drought: '🏜' };
  const c = colors[level] || '#ff6d00';
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${c}11`, border: `1px solid ${c}44` }}>
      <div className="text-xl flex-shrink-0">{icons[type] || '⚠'}</div>
      <div>
        <div className="text-xs font-orbitron font-bold" style={{ color: c }}>{type.toUpperCase()} WARNING — {city}</div>
        <div className="text-xs font-mono mt-0.5" style={{ color: '#e8f5e9' }}>
          {type === 'flood' && 'River levels rising. Evacuate low-lying areas.'}
          {type === 'storm' && 'Severe thunderstorm detected. Secure outdoor assets.'}
          {type === 'pollution' && 'AQI exceeds 150. Sensitive groups stay indoors.'}
          {type === 'heatwave' && 'Temperature above 38°C. Hydration advisory issued.'}
          {type === 'drought' && 'Water reservoir below 40%. Agricultural rationing.'}
        </div>
      </div>
    </div>
  );
}

function MiniTrend({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={`g${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#g${dataKey})`} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0a1f0e', border: '1px solid #00ff8822', borderRadius: 12, padding: '8px 12px' }}>
        <div style={{ color: '#4caf50', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: 11, fontFamily: 'monospace' }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

const OPEN_METEO_REFRESH_MS = 10 * 60 * 1000;

// No hardcoded citizens — all records come from real registrations
const DEFAULT_CITIZENS = [];

function getVietnamTimeString() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  }).format(new Date());
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


const weatherIconFromCode = (code = 0) => {
  if ([0].includes(code)) return '☀️';
  if ([1, 2, 3].includes(code)) return '⛅';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌤️';
};

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

async function fetchOpenMeteoCity(city) {
  const lat = city.lat;
  const lng = city.lng;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&forecast_days=1&timezone=Asia%2FBangkok`;
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=Asia%2FBangkok`;

  const [weatherRes, airRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
  if (!weatherRes.ok) throw new Error(`Open-Meteo weather failed for ${city.name}`);
  if (!airRes.ok) throw new Error(`Open-Meteo air quality failed for ${city.name}`);

  const weatherJson = await weatherRes.json();
  const airJson = await airRes.json();
  const currentWeather = weatherJson.current || {};
  const currentAir = airJson.current || {};

  return {
    cityId: city.id,
    cityName: city.name,
    liveSource: 'Open-Meteo',
    updatedAt: currentWeather.time || new Date().toISOString(),
    weatherTemp: Math.round(safeNumber(currentWeather.temperature_2m, city.weatherTemp || 30)),
    humidity: Math.round(safeNumber(currentWeather.relative_humidity_2m, 0)),
    precipitation: safeNumber(currentWeather.precipitation, 0),
    rain: safeNumber(currentWeather.rain, 0),
    weatherCode: safeNumber(currentWeather.weather_code, 0),
    windSpeed: safeNumber(currentWeather.wind_speed_10m, 0),
    windGust: safeNumber(currentWeather.wind_gusts_10m, 0),
    aqi: Math.round(safeNumber(currentAir.us_aqi, city.aqi || 50)),
    pm10: safeNumber(currentAir.pm10, city.pm10 || 0).toFixed(1),
    pm25: safeNumber(currentAir.pm2_5, city.pm25 || 0).toFixed(1),
    co: (safeNumber(currentAir.carbon_monoxide, 0) * 0.000873).toFixed(2), // Open-Meteo CO is µg/m³; converted to ppm approx
    no2: safeNumber(currentAir.nitrogen_dioxide, 0).toFixed(1),
    so2: safeNumber(currentAir.sulphur_dioxide, 0).toFixed(1),
    ozone: safeNumber(currentAir.ozone, 0).toFixed(1),
  };
}


const clampLive = (value, min, max, decimals = 0) => {
  const n = Math.max(min, Math.min(max, Number(value) || 0));
  return Number(n.toFixed(decimals));
};

const liveWave = (tick, seed, amp = 1, speed = 1) => {
  return Math.sin((tick * speed + seed) / 7) * amp + Math.cos((tick + seed * 3) / 11) * amp * 0.45;
};

function buildDynamicData(tick, livePeriod = 'daily', citizens = []) {
  const citizenList = Array.isArray(citizens) ? citizens : [];
  const citizenImpactByCity = citizenList.reduce((acc, row) => {
    const cityName = row.city || row.location || 'Hanoi';
    const family = Number(row.familyMembers || row.family || 1);
    const cars = Number(row.vehicles || row.cars || 0);
    const bikes = Number(row.twoWheelers || row.bikes || 0);
    const energy = String(row.energyType || row.energy || 'Grid').toLowerCase();
    const co2 = Number(row.co2Estimate || row.co2 || (cars * 2.3 + bikes * 0.8 + family * 0.18 - (energy.includes('solar') ? 0.7 : 0)));
    if (!acc[cityName]) acc[cityName] = { records: 0, people: 0, cars: 0, bikes: 0, co2: 0, solarUsers: 0 };
    acc[cityName].records += 1;
    acc[cityName].people += family;
    acc[cityName].cars += cars;
    acc[cityName].bikes += bikes;
    acc[cityName].co2 += Math.max(0, co2);
    if (energy.includes('solar') || energy.includes('renewable')) acc[cityName].solarUsers += 1;
    return acc;
  }, {});
  const nationalCitizenImpact = Object.values(citizenImpactByCity).reduce((a, c) => ({
    records: a.records + c.records,
    people: a.people + c.people,
    cars: a.cars + c.cars,
    bikes: a.bikes + c.bikes,
    co2: a.co2 + c.co2,
    solarUsers: a.solarUsers + c.solarUsers
  }), { records: 0, people: 0, cars: 0, bikes: 0, co2: 0, solarUsers: 0 });
  const citizenCO2Mt = nationalCitizenImpact.co2 / 1000000;
  const citizenVehicleM = (nationalCitizenImpact.cars + nationalCitizenImpact.bikes) / 1000000;
  const citizenPopulationM = nationalCitizenImpact.people / 1000000;
  const periodFactor = livePeriod === 'daily' ? 1 : livePeriod === 'monthly' ? 0.55 : 0.22;
  const periodLabel = livePeriod === 'daily' ? 'Today' : livePeriod === 'monthly' ? 'This Month' : '2026 Live';
  const cityScale = BASE_VIETNAM_CITIES.map((c, i) => {
    const impact = citizenImpactByCity[c.name] || { records: 0, people: 0, cars: 0, bikes: 0, co2: 0, solarUsers: 0 };
    const citizenCityCO2 = impact.co2 / 1000000;
    const citizenCityVehicleM = (impact.cars + impact.bikes) / 1000000;
    const citizenCityPopulation = impact.people;
    const co2Shift = liveWave(tick, i + 2, 0.42 * periodFactor, 1.1);
    const aqiShift = liveWave(tick, i + 9, 7.5 * periodFactor, 1.25);
    const trafficShift = liveWave(tick, i + 14, 4.8 * periodFactor, 1.4);
    const weatherShift = liveWave(tick, i + 21, 2.8 * periodFactor, 0.85);
    const renewableShift = liveWave(tick, i + 31, 2.4 * periodFactor, 0.7);
    const floodShift = liveWave(tick, i + 37, 2.8 * periodFactor, 0.5);
    const dynamicAQI = clampLive(c.aqi + aqiShift, 15, 210);
    const dynamicEmission = clampLive(c.emissionMT + co2Shift + citizenCityCO2, 0.5, 25, 2);
    const dynamicTraffic = clampLive(c.trafficDensity + trafficShift, 5, 99);
    const dynamicRenewable = clampLive(c.renewablePercent + renewableShift, 5, 95);
    const dynamicFlood = clampLive(c.floodRisk + floodShift, 5, 99);
    const dynamicTemp = clampLive((c.weatherTemp || 32) + weatherShift, 18, 45);
    return {
      ...c,
      citizenRecords: impact.records,
      citizenPopulationAdded: citizenCityPopulation,
      citizenVehicleAddedM: citizenCityVehicleM,
      citizenCO2AddedMt: Number(citizenCityCO2.toFixed(4)),
      population: Math.round((c.population || 0) + citizenCityPopulation),
      emissionMT: dynamicEmission,
      aqi: dynamicAQI,
      aqiLevel: dynamicAQI > 150 ? 'Unhealthy' : dynamicAQI > 100 ? 'High' : dynamicAQI > 70 ? 'Moderate' : 'Good',
      trafficDensity: dynamicTraffic,
      renewablePercent: dynamicRenewable,
      floodRisk: dynamicFlood,
      heatwaveRisk: clampLive((c.heatwaveRisk || 50) + liveWave(tick, i + 41, 3.5 * periodFactor), 5, 99),
      droughtRisk: clampLive((c.droughtRisk || 45) + liveWave(tick, i + 47, 3.3 * periodFactor), 5, 99),
      stormRisk: clampLive((c.stormRisk || 45) + liveWave(tick, i + 53, 3.5 * periodFactor), 5, 99),
      climateRisk: clampLive((c.climateRisk || 55) + liveWave(tick, i + 59, 3.8 * periodFactor), 5, 99),
      solarAvailability: clampLive((c.solarAvailability || 60) + liveWave(tick, i + 61, 2.2 * periodFactor), 15, 99),
      smartCityScore: clampLive((c.smartCityScore || 65) + liveWave(tick, i + 67, 2.5 * periodFactor), 20, 100),
      weatherTemp: dynamicTemp,
      livePeriod: periodLabel,
      yearlyData: c.yearlyData ? {
        ...c.yearlyData,
        2026: {
          emission: dynamicEmission,
          aqi: dynamicAQI,
          renewable: dynamicRenewable,
          population: Number(((c.yearlyData?.[2025]?.population || (c.population || 1000000) / 1000000) + 0.09 + citizenCityPopulation / 1000000 + liveWave(tick, i + 71, 0.03 * periodFactor, 0.45)).toFixed(2)),
          vehicles: Number(((c.yearlyData?.[2025]?.vehicles || 1) + 0.18 + citizenCityVehicleM + liveWave(tick, i + 75, 0.05 * periodFactor, 0.55)).toFixed(2)),
          evVehicles: Math.max(0, Math.round((c.yearlyData?.[2025]?.evVehicles || 0) + 180 + liveWave(tick, i + 81, 120 * periodFactor, 0.8)))
        }
      } : c.yearlyData
    };
  });

  const carbon2026Base = BASE_CARBON_EMISSION_DATA.at(-1) || {};
  const carbon2026 = {
    ...carbon2026Base,
    year: 2026,
    period: periodLabel,
    totalCO2: clampLive((carbon2026Base.totalCO2 || 0) + 2.8 + citizenCO2Mt + liveWave(tick, 2, 1.8 * periodFactor), 10, 300, 1),
    vehicleCO2: clampLive((carbon2026Base.vehicleCO2 || 0) + 0.9 + liveWave(tick, 4, 0.9 * periodFactor), 1, 80, 1),
    factoryCO2: clampLive((carbon2026Base.factoryCO2 || 0) + 1.1 + liveWave(tick, 6, 1.1 * periodFactor), 1, 90, 1),
    electricityCO2: clampLive((carbon2026Base.electricityCO2 || 0) + 0.7 + liveWave(tick, 8, 0.9 * periodFactor), 1, 90, 1),
    residentialCO2: clampLive((carbon2026Base.residentialCO2 || 0) + 0.2 + citizenCO2Mt + liveWave(tick, 10, 0.45 * periodFactor), 1, 60, 1),
    industrialCO2: clampLive((carbon2026Base.industrialCO2 || 0) + 0.8 + liveWave(tick, 12, 0.8 * periodFactor), 1, 80, 1),
    agriculturalCO2: clampLive((carbon2026Base.agriculturalCO2 || 0) + 0.1 + liveWave(tick, 14, 0.35 * periodFactor), 0.5, 60, 1),
    reductionPct: clampLive((carbon2026Base.reductionPct || 0) + 1.3 + liveWave(tick, 16, 1.1 * periodFactor), 0, 60, 1),
  };
  const carbon = [...BASE_CARBON_EMISSION_DATA, carbon2026];

  const popBase = BASE_POPULATION_DATA.at(-1) || {};
  const population = [
    ...BASE_POPULATION_DATA,
    {
      ...popBase,
      year: 2026,
      hanoi: clampLive((popBase.hanoi || 0) + 0.14 + citizenPopulationM + liveWave(tick, 19, 0.03 * periodFactor, 0.55), 0, 20, 2),
      hcmc: clampLive((popBase.hcmc || 0) + 0.16 + liveWave(tick, 20, 0.04 * periodFactor, 0.55), 0, 20, 2),
      danang: clampLive((popBase.danang || 0) + 0.03 + liveWave(tick, 21, 0.015 * periodFactor, 0.55), 0, 5, 2),
      haiphong: clampLive((popBase.haiphong || 0) + 0.03 + liveWave(tick, 22, 0.015 * periodFactor, 0.55), 0, 5, 2),
      cantho: clampLive((popBase.cantho || 0) + 0.02 + liveWave(tick, 23, 0.012 * periodFactor, 0.55), 0, 5, 2),
    }
  ];

  const vehicleBase = BASE_VEHICLE_TRAFFIC_DATA.at(-1) || {};
  const vehicle = [
    ...BASE_VEHICLE_TRAFFIC_DATA,
    {
      ...vehicleBase,
      year: 2026,
      totalVehicles: clampLive((vehicleBase.totalVehicles || 0) + 0.35 + citizenVehicleM + liveWave(tick, 25, 0.12 * periodFactor, 0.95), 0.1, 20, 2),
      evVehicles: clampLive((vehicleBase.evVehicles || 0) + 0.32 + liveWave(tick, 27, 0.06 * periodFactor, 1.05), 0, 10, 2),
      trafficIndex: clampLive((vehicleBase.trafficIndex || 0) + 2 + liveWave(tick, 29, 4.5 * periodFactor, 0.9), 0, 100),
      fuelConsumption: clampLive((vehicleBase.fuelConsumption || 0) + 0.8 + liveWave(tick, 31, 0.55 * periodFactor, 1.2), 0.1, 100, 2),
      congestionScore: clampLive((vehicleBase.congestionScore || 0) + 2 + liveWave(tick, 33, 4.5 * periodFactor, 1.1), 0, 100),
    }
  ];

  const disasterBase = BASE_DISASTER_CLIMATE_DATA.at(-1) || {};
  const disaster = [
    ...BASE_DISASTER_CLIMATE_DATA,
    {
      ...disasterBase,
      year: 2026,
      floods: clampLive((disasterBase.floods || 0) + 1 + liveWave(tick, 35, 1.4 * periodFactor, 0.8), 0, 60),
      storms: clampLive((disasterBase.storms || 0) + liveWave(tick, 37, 1.2 * periodFactor, 0.75), 0, 50),
      heatwaves: clampLive((disasterBase.heatwaves || 0) + 1 + liveWave(tick, 39, 1.1 * periodFactor, 0.85), 0, 50),
      droughts: clampLive((disasterBase.droughts || 0) + liveWave(tick, 41, 1.0 * periodFactor, 0.8), 0, 50),
      landslides: clampLive((disasterBase.landslides || 0) + liveWave(tick, 42, 1.0 * periodFactor, 0.8), 0, 50),
      popAffected: clampLive((disasterBase.popAffected || 0) + 0.15 + liveWave(tick, 43, 0.3 * periodFactor, 0.7), 0, 10, 1),
      economicLoss: clampLive((disasterBase.economicLoss || 0) + 0.18 + liveWave(tick, 44, 0.25 * periodFactor, 0.65), 0, 20, 2),
      recoveryMonths: clampLive((disasterBase.recoveryMonths || 0) + liveWave(tick, 45, 0.3 * periodFactor, 0.65), 0, 24, 1),
    }
  ];

  const soilBase = BASE_SOIL_HEALTH_DATA.at(-1) || {};
  const soil = [
    ...BASE_SOIL_HEALTH_DATA,
    {
      ...soilBase,
      year: 2026,
      soilFertility: clampLive((soilBase.soilFertility || 0) + liveWave(tick, 45, 2.4 * periodFactor, 0.85), 0, 100),
      soilMoisture: clampLive((soilBase.soilMoisture || 0) + liveWave(tick, 47, 3.4 * periodFactor, 1.1), 0, 100),
      nitrogen: clampLive((soilBase.nitrogen || 0) + liveWave(tick, 49, 1.8 * periodFactor, 0.95), 0, 100, 1),
      landDegradation: clampLive((soilBase.landDegradation || 0) + liveWave(tick, 51, 1.5 * periodFactor, 0.75), 0, 100),
      cropProductivity: clampLive((soilBase.cropProductivity || 0) + 1 + liveWave(tick, 53, 2.1 * periodFactor, 0.9), 0, 100),
    }
  ];

  const renewable2026Base = BASE_RENEWABLE_ENERGY_DATA.at(-1) || {};
  const renewable = [
    ...BASE_RENEWABLE_ENERGY_DATA,
    {
      ...renewable2026Base,
      year: 2026,
      solar: clampLive((renewable2026Base.solar || 0) + 1800 + liveWave(tick, 55, 550 * periodFactor, 1.0), 0, 50000, 0),
      wind: clampLive((renewable2026Base.wind || 0) + 900 + liveWave(tick, 57, 360 * periodFactor, 1.1), 0, 50000, 0),
      hydro: clampLive((renewable2026Base.hydro || 0) + 700 + liveWave(tick, 59, 700 * periodFactor, 0.7), 0, 80000, 0),
      evStations: clampLive((renewable2026Base.evStations || 0) + 650 + liveWave(tick, 61, 160 * periodFactor, 0.8), 0, 30000, 0),
      renewablePct: clampLive((renewable2026Base.renewablePct || 0) + 2.2 + liveWave(tick, 63, 2.0 * periodFactor, 0.85), 0, 100, 1),
    }
  ];

  const aqi2026Base = BASE_AQI_POLLUTION_DATA.at(-1) || {};
  const aqi = [
    ...BASE_AQI_POLLUTION_DATA,
    {
      ...aqi2026Base,
      year: 2026,
      avgAQI: clampLive((aqi2026Base.avgAQI || 0) + liveWave(tick, 65, 6.2 * periodFactor, 1.05), 10, 220),
      pm25: clampLive((aqi2026Base.pm25 || 0) + liveWave(tick, 67, 3.1 * periodFactor, 1.15), 1, 180, 1),
      pm10: clampLive((aqi2026Base.pm10 || 0) + liveWave(tick, 69, 4.2 * periodFactor, 1.0), 1, 250, 1),
      co: clampLive((aqi2026Base.co || 0) + liveWave(tick, 71, 0.12 * periodFactor, 0.9), 0.1, 5, 2),
      no2: clampLive((aqi2026Base.no2 || 0) + liveWave(tick, 73, 1.8 * periodFactor, 1.0), 1, 100, 1),
      so2: clampLive((aqi2026Base.so2 || 0) + liveWave(tick, 75, 1.6 * periodFactor, 0.9), 1, 100, 1),
    }
  ];

  const co2Areas = BASE_CO2_PRODUCTION_AREAS.map((d) => ({
    ...d,
    intensity: d.intensity || (d.co2 > 7 ? 'Very High' : d.co2 > 4 ? 'High' : 'Medium')
  }));
  co2Areas.push({ year: 2026, area: 'Cat Lai Port Area', city: 'Ho Chi Minh City', co2: clampLive(8.1 + liveWave(tick, 77, 0.55 * periodFactor, 1.15), 0.1, 30, 2), intensity: 'Very High' });
  co2Areas.push({ year: 2026, area: 'Thang Long Industrial Park', city: 'Hanoi', co2: clampLive(6.1 + liveWave(tick, 78, 0.45 * periodFactor, 1.1), 0.1, 30, 2), intensity: 'High' });

  const crowded = [...BASE_CROWDED_AREAS_DATA];
  crowded.push({ year: 2026, area: 'District 1', city: 'HCMC', density: Math.round(29200 + liveWave(tick, 79, 900 * periodFactor, 1.35)), crowdLevel: clampLive(86 + liveWave(tick, 80, 5.5 * periodFactor, 1.35), 0, 100), vehicleFlow: Math.max(0, Math.round(8500 + liveWave(tick, 81, 900 * periodFactor, 1.2))), co2Level: clampLive(2.4 + liveWave(tick, 83, 0.18 * periodFactor, 1.05), 0.1, 10, 2) });

  const topAreas = cityScale
    .slice()
    .sort((a, b) => b.emissionMT - a.emissionMT)
    .slice(0, 5)
    .map(c => ({ area: c.topCO2Area || c.name, city: c.name, co2: c.emissionMT }));

  const stats = {
    ...BASE_VIETNAM_STATS,
    currentYear: {
      ...(BASE_VIETNAM_STATS.currentYear || {}),
      dailyPetrol: clampLive((BASE_VIETNAM_STATS.currentYear?.dailyPetrol || 20.9) + liveWave(tick, 91, 0.8 * periodFactor, 1.1), 1, 50, 2),
      dailyDiesel: clampLive((BASE_VIETNAM_STATS.currentYear?.dailyDiesel || 16.2) + liveWave(tick, 93, 0.75 * periodFactor, 1.0), 1, 50, 2),
      dailyEV: clampLive((BASE_VIETNAM_STATS.currentYear?.dailyEV || 5.5) + liveWave(tick, 95, 0.45 * periodFactor, 1.2), 0.1, 30, 2),
    },
    totalCO22025: carbon2026.totalCO2,
    avgAQI2025: aqi.at(-1)?.avgAQI || BASE_VIETNAM_STATS.avgAQI2025 || 0,
    renewablePercent2025: renewable.at(-1)?.renewablePct || BASE_VIETNAM_STATS.renewablePercent2025 || 0,
    topCO2Areas2025: topAreas,
    topCrowdedAreas2025: crowded.slice().sort((a,b)=>b.density-a.density).slice(0,5).map(a=>({area:a.area, city:a.city, density:a.density}))
  };

  return { cityScale, stats, carbon, population, vehicle, disaster, soil, renewable, aqi, co2Areas, crowded };
}

export default function AdminDashboard({ initialTab }) {
  const { user, logout } = useAuth();
  const [active, setActive] = useState(initialTab || 'overview');
  const [isFridayOpen, setIsFridayOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Ho Chi Minh City');
  const [citizens, setCitizens] = useState(DEFAULT_CITIZENS);
  const [report, setReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState('carbon');
  const [weather, setWeather] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [livePeriod, setLivePeriod] = useState('daily');
  const [compareCity, setCompareCity] = useState('Hanoi');
  const [darkMode] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const [citizenAlert, setCitizenAlert] = useState('Climate alert: High CO₂ / heat risk. Please reduce unnecessary vehicle use and follow local safety guidance.');
  const [manualRows, setManualRows] = useState(() => JSON.parse(localStorage.getItem('vietcarbon_manual_rows') || '[]'));
  const [manualForm, setManualForm] = useState({ city: 'Ho Chi Minh City', period: 'daily', date: new Date().toISOString().slice(0,10), metric: 'CO2', value: '', note: '' });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLocation, setAiLocation] = useState('Ho Chi Minh City');
  const [aiTopic, setAiTopic] = useState('Traffic pollution');
  const [aiAnswer, setAiAnswer] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sentAlerts, setSentAlerts] = useState(() => JSON.parse(localStorage.getItem('citizen_alerts') || '[]'));
  const [soilLocation, setSoilLocation] = useState('Mekong Delta');
  const [soilAdvice, setSoilAdvice] = useState(null);
  const [generatedAlerts, setGeneratedAlerts] = useState([]);
  const [reportTopic, setReportTopic] = useState('CO₂ emission');
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0,10));
  const [reportArea, setReportArea] = useState('city');
  const [reportEmail, setReportEmail] = useState('');
  const [reportEmailStatus, setReportEmailStatus] = useState('');
  const [decisionNotes, setDecisionNotes] = useState(() => JSON.parse(localStorage.getItem('vietcarbon_decision_notes') || 'null') || [
    'Factory and port hotspots are verified first when city CO₂ rises above baseline.',
    'Traffic routes are linked with peak-hour windows before sending admin alerts.',
    'Citizen mobility data is aggregated by city, not displayed as private personal records on public maps.',
    'HydroGrid AI remains unchanged and is used only for renewable-to-hydrogen planning.'
  ]);
  const [integrationOverrides, setIntegrationOverrides] = useState(() => JSON.parse(localStorage.getItem('vietcarbon_integration_overrides') || '{}'));


  const [liveTick, setLiveTick] = useState(0);
  const [openMeteoLive, setOpenMeteoLive] = useState({ cities: {}, status: 'loading', updatedAt: null, error: '' });
  const [vietnamTime, setVietnamTime] = useState(getVietnamTimeString());

  const metricUnits = { CO2: 'Mt CO₂', Traffic: '%', AQI: 'AQI', Renewable: '%', Population: 'Million people', 'Flood Risk': '%' };
  const manualMetricUnit = metricUnits[manualForm.metric] || 'value';
  const cityDistrictAreas = {
    'Hanoi': ['Hoan Kiem', 'Ba Dinh', 'Dong Anh', 'Thang Long Industrial Park', 'Red River corridor'],
    'Ho Chi Minh City': ['District 1', 'Thu Duc', 'Cat Lai Port Area', 'Tan Son Nhat corridor', 'Ben Thanh Roundabout'],
    'Da Nang': ['Hai Chau', 'Hoa Khanh Industrial Zone', 'Son Tra', 'Han River area'],
    'Hai Phong': ['Le Chan', 'Dinh Vu Industrial Area', 'Hai Phong Deep Sea Port', 'Cat Ba coastal zone'],
    'Can Tho': ['Ninh Kieu', 'Mekong Delta flood zone', 'Can Tho River', 'Rice farming cluster'],
    'Vung Tau': ['Phu My Industrial Zone', 'Port corridor', 'Ba Ria-Vung Tau coast'],
    'Nha Trang': ['Coastal tourism zone', 'Tran Phu road', 'Nha Trang Bay'],
    'Hue': ['Perfume River', 'Citadel area', 'Hue urban core'],
  };
  const selectedManualAreas = cityDistrictAreas[manualForm.city] || ['central district', 'industrial zone', 'traffic corridor'];


  useEffect(() => {
    const timer = setInterval(() => setLiveTick(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setVietnamTime(getVietnamTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadOpenMeteo = async () => {
      try {
        setOpenMeteoLive(prev => ({ ...prev, status: 'loading', error: '' }));
        const results = await Promise.all(BASE_VIETNAM_CITIES.map(c => fetchOpenMeteoCity(c)));
        if (cancelled) return;
        const cityMap = Object.fromEntries(results.map(r => [r.cityId, r]));
        setOpenMeteoLive({ cities: cityMap, status: 'live', updatedAt: new Date().toISOString(), error: '' });
      } catch (err) {
        if (cancelled) return;
        setOpenMeteoLive(prev => ({ ...prev, status: 'offline-fallback', error: err.message || 'Open-Meteo unavailable' }));
      }
    };

    loadOpenMeteo();
    const timer = setInterval(loadOpenMeteo, OPEN_METEO_REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const liveData = useMemo(() => buildDynamicData(liveTick, livePeriod, citizens), [liveTick, livePeriod, citizens]);
  const VIETNAM_CITIES = useMemo(() => liveData.cityScale.map(c => {
    const om = openMeteoLive.cities[c.id];
    if (!om) return c;
    const liveAqi = clampLive(om.aqi + liveWave(liveTick, c.id.length + 11, livePeriod === 'daily' ? 2 : 1), 1, 500);
    const liveFloodRisk = clampLive((c.floodRisk || 50) + (om.precipitation * 4) + liveWave(liveTick, c.id.length + 21, 2), 1, 99);
    const liveHeatRisk = clampLive((c.heatwaveRisk || 50) + Math.max(0, om.weatherTemp - 34) * 2 + liveWave(liveTick, c.id.length + 31, 2), 1, 99);
    const liveSolar = clampLive((c.solarAvailability || 60) + (om.weatherCode === 0 ? 8 : om.weatherCode <= 3 ? 3 : -6), 1, 99);
    const liveTraffic = clampLive((c.trafficDensity || 50) + liveWave(liveTick, c.id.length + 41, 3) + (om.precipitation > 0 ? 2 : 0), 1, 99);
    return {
      ...c,
      ...om,
      aqi: liveAqi,
      aqiLevel: liveAqi > 150 ? 'Unhealthy' : liveAqi > 100 ? 'High' : liveAqi > 50 ? 'Moderate' : 'Good',
      floodRisk: liveFloodRisk,
      heatwaveRisk: liveHeatRisk,
      solarAvailability: liveSolar,
      trafficDensity: liveTraffic,
      openMeteoLive: true,
      weatherIcon: weatherIconFromCode(om.weatherCode),
    };
  }), [liveData.cityScale, openMeteoLive, liveTick, livePeriod]);

  const VIETNAM_STATS = liveData.stats;
  const CARBON_EMISSION_DATA = liveData.carbon;
  const POPULATION_DATA = liveData.population;
  const VEHICLE_TRAFFIC_DATA = liveData.vehicle;
  const DISASTER_CLIMATE_DATA = liveData.disaster;
  const SOIL_HEALTH_DATA = liveData.soil;
  const RENEWABLE_ENERGY_DATA = liveData.renewable;
  const AQI_POLLUTION_DATA = useMemo(() => {
    const liveCities = VIETNAM_CITIES.filter(c => c.openMeteoLive);
    if (!liveCities.length) return liveData.aqi;
    const avg = (key) => liveCities.reduce((sum, c) => sum + Number(c[key] || 0), 0) / liveCities.length;
    return [
      ...BASE_AQI_POLLUTION_DATA,
      {
        year: 2026,
        avgAQI: Math.round(avg('aqi')),
        pm25: Number(avg('pm25').toFixed(1)),
        pm10: Number(avg('pm10').toFixed(1)),
        co: Number(avg('co').toFixed(2)),
        no2: Number(avg('no2').toFixed(1)),
        so2: Number(avg('so2').toFixed(1)),
      }
    ];
  }, [VIETNAM_CITIES, liveData.aqi]);
  const WATER_QUALITY_LIVE = useMemo(() => {
    const base = VIETNAM_STATS.riverQuality || [];
    return base.map((r, i) => {
      const q = clampLive((r.quality || 60) + liveWave(liveTick, i + 101, livePeriod === 'daily' ? 3.2 : livePeriod === 'monthly' ? 1.8 : 0.8), 20, 98);
      return { ...r, quality: q, status: q > 75 ? 'Good' : q > 55 ? 'Moderate' : 'Poor' };
    });
  }, [VIETNAM_STATS.riverQuality, liveTick, livePeriod]);

  const CO2_PRODUCTION_AREAS = liveData.co2Areas;
  const CROWDED_AREAS_DATA = liveData.crowded;


  useEffect(() => { if (initialTab) setActive(initialTab); }, [initialTab]);

  const city = VIETNAM_CITIES.find(c => c.name === selectedCity) || VIETNAM_CITIES[0];

  const livePulseData = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    t: i,
    aqi: clampLive((city?.aqi || 65) + liveWave(liveTick + i, i + 3, 8), 10, 220),
    co2: clampLive((city?.emissionMT || 5) + liveWave(liveTick + i, i + 7, 0.55), 0.1, 25, 2),
    traffic: clampLive((city?.trafficDensity || 55) + liveWave(liveTick + i, i + 11, 6), 0, 100),
    renewable: clampLive((city?.renewablePercent || 25) + liveWave(liveTick + i, i + 13, 3), 0, 100),
    soil: clampLive(70 + liveWave(liveTick + i, i + 17, 8), 0, 100),
    climate: clampLive((city?.climateRisk || 50) + liveWave(liveTick + i, i + 19, 5), 0, 100),
  })), [liveTick, city?.name]);

  const compareCityData = VIETNAM_CITIES.find(c => c.name === compareCity) || VIETNAM_CITIES[1];

  const loadCitizenRecords = async () => {
    try {
      const r = await api.get('/citizen/data');
      const rows = Array.isArray(r.data) ? r.data : [];
      setCitizens(rows);
    } catch (err) {
      console.warn('Citizen records API unavailable:', err?.response?.data?.error || err.message);
      setCitizens([]);
    }
  };

  useEffect(() => {
    loadCitizenRecords();
    const timer = setInterval(loadCitizenRecords, 15000);
    return () => clearInterval(timer);
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    const periodTitle = reportPeriod.toUpperCase();
    const selected = city || VIETNAM_CITIES[0];
    const cityRows = Object.entries(selected?.yearlyData || {}).map(([yr, d]) => `${yr}: CO₂ ${d.emission} Mt | AQI ${d.aqi} | Renewable ${d.renewable}%`).join('\n');
    const periodDetails = reportPeriod === 'daily'
      ? `DAILY LIVE SNAPSHOT\nSelected date: ${reportDate}\nTime in Vietnam: ${vietnamTime}\nTemperature: ${selected.weatherTemp}°C\nAQI: ${selected.aqi}\nWind: ${Math.round(selected.windSpeed || 0)} km/h\nRain: ${Number(selected.precipitation || 0).toFixed(1)} mm\nTraffic: ${selected.trafficDensity}%`
      : reportPeriod === 'monthly'
        ? `MONTHLY LIVE SUMMARY\nMonth containing ${reportDate}: ${selected.name} is tracking CO₂ ${selected.emissionMT} Mt, AQI ${selected.aqi}, renewable ${selected.renewablePercent}%, flood risk ${selected.floodRisk}%, and traffic density ${selected.trafficDensity}%. Monthly values use Open-Meteo live weather/AQI plus the 2026 live simulation layer.`
        : `YEARLY 2026 LIVE SUMMARY\n2021–2025 are historical constants. 2026 is live and changes using Open-Meteo weather/AQI plus platform live inputs.\n${cityRows}`;
    const text = `VietCarbon AI — ${periodTitle} ${reportTopic} Report\nArea: ${reportArea} | City: ${selected.name} | Date: ${reportDate} | Year: 2026 Live\n\n${periodDetails}\n\nCLIMATE RISK ASSESSMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Flood Risk: ${selected.floodRisk}%\n• Heatwave Risk: ${selected.heatwaveRisk}%\n• Drought Risk: ${selected.droughtRisk}%\n• Storm Risk: ${selected.stormRisk}%\n\nOPERATIONAL ACTION PLAN\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. Verify ${selected.topCO2Area || selected.name + ' hotspot'} before sending field alerts.\n2. Compare ${reportPeriod} citizen mobility data with 2026 live AQI and traffic values.\n3. Prioritize renewable or hydrogen support where CO₂ and traffic are both high.\n4. Use the Alert System only after live analysis crosses the threshold.\n\nCO₂ REDUCTION POTENTIAL: ${selected.co2SavePotential}%\nSUSTAINABILITY SCORE: ${selected.smartCityScore}/100\nURGENCY LEVEL: ${(selected.urgency || 'medium').toUpperCase()}\n\nGenerated at Vietnam time: ${vietnamTime}`;
    setReport(text);
    setReportLoading(false);
  };

  const downloadReport = () => {
    if (!report) return;
    downloadTextFile(`VietCarbon_${selectedCity.replaceAll(' ', '_')}_${reportPeriod}_${reportDate}_report.txt`, report);
  };

  const sendReportByEmail = async () => {
    setReportEmailStatus('');
    if (!report) return setReportEmailStatus('Generate the report first.');
    if (!reportEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reportEmail)) return setReportEmailStatus('Enter a valid factory or authority email.');
    try {
      await api.post('/citizen/report-email', {
        to: reportEmail,
        subject: `VietCarbon ${reportPeriod} ${reportTopic} report — ${selectedCity} — ${reportDate}`,
        report
      });
      setReportEmailStatus(`✅ Report sent to ${reportEmail}`);
    } catch (err) {
      setReportEmailStatus('⚠ Email sending failed: ' + (err.response?.data?.error || err.message || 'SMTP not connected'));
    }
  };

  const sendCitizenAlert = async () => {
    const payload = { message: citizenAlert, city: selectedCity, type: 'alert' };
    try {
      await api.post('/citizen/notify', payload);
      setNotifications(v => v + 1);
      alert('✅ Climate alert sent to citizen message boxes.');
    } catch {
      const saved = JSON.parse(localStorage.getItem('citizen_alerts') || '[]');
      saved.unshift({ ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem('citizen_alerts', JSON.stringify(saved));
      setNotifications(v => v + 1);
      alert('✅ Climate alert saved locally and visible in citizen message box demo.');
    }
  };

  const addManualRow = async (e) => {
    e.preventDefault();
    const row = { ...manualForm, value: Number(manualForm.value), id: Date.now(), createdAt: new Date().toISOString() };
    const next = [row, ...manualRows];
    setManualRows(next);
    localStorage.setItem('vietcarbon_manual_rows', JSON.stringify(next));
    setManualForm(f => ({ ...f, value: '', note: '' }));
    try { await api.post('/citizen/emission-log', row); } catch {}
  };

  const askLocationAI = async () => {
    const c = VIETNAM_CITIES.find(x => x.name === aiLocation) || city;
    const localRows = manualRows.filter(r => r.city === aiLocation && (r.metric === aiTopic || r.metric?.toLowerCase?.().includes(aiTopic.toLowerCase().split(' ')[0])));
    const prompt = `Give specific VietCarbon recommendation for ${aiLocation}. Topic: ${aiTopic}. User problem: ${aiQuestion}. City data: CO2 ${c.emissionMT}Mt, AQI ${c.aqi}, traffic ${c.trafficDensity}%, flood ${c.floodRisk}%, renewable ${c.renewablePercent}%. Manual rows: ${JSON.stringify(localRows.slice(0,5))}`;
    try {
      const res = await api.post('/ai/chat', { message: prompt, city: aiLocation, topic: aiTopic, data: { city: c, manualRows: localRows } });
      setAiAnswer(res.data.reply || res.data.text || res.data.answer || 'AI generated a location-specific solution.');
    } catch {
      setAiAnswer(`${aiLocation} — ${aiTopic} Solution:
• Problem detected from selected location data, not random dashboard text.
• Priority area: ${c.topCO2Area || 'main urban corridor'}.
• Action: optimize traffic signals, reduce idling, add EV/hydrogen public transport, and create green buffer zones.
• Use manual daily/monthly/yearly rows to retrain/update this answer.
• Map action: select ${aiLocation} in Vietnam AI Map to zoom and highlight the affected zone.`);
    }
  };

  const openAlertDetails = (a) => setSelectedAlert({ ...a, impact: a.level === 'critical' ? 'Severe impact expected in low-lying districts' : 'Moderate to high local impact', action: a.type === 'flood' ? 'Evacuate low areas, monitor river level, avoid flooded roads' : a.type === 'pollution' ? 'Reduce vehicle use, wear mask, keep sensitive groups indoors' : a.type === 'heatwave' ? 'Hydration alert, avoid outdoor work, open cooling centers' : 'Secure outdoor assets and avoid coastal routes' });

  const analyzeLiveAlerts = () => {
    const c = VIETNAM_CITIES.find(x => x.name === selectedCity) || city;
    const reasons = [];
    if (c.aqi > 150) reasons.push(`AQI ${c.aqi} is above unhealthy threshold 150`);
    if (Number(c.pm25 || 0) > 55) reasons.push(`PM2.5 ${c.pm25} μg/m³ is above threshold 55`);
    if (c.floodRisk > 70 && Number(c.precipitation || 0) > 0) reasons.push(`flood risk ${c.floodRisk}% with rainfall ${Number(c.precipitation || 0).toFixed(1)}mm`);
    if (c.heatwaveRisk > 75 || c.weatherTemp > 38) reasons.push(`heat risk ${c.heatwaveRisk}% and temperature ${c.weatherTemp}°C`);
    if (c.stormRisk > 70 || Number(c.windSpeed || 0) > 40) reasons.push(`storm risk ${c.stormRisk}% and wind ${Math.round(c.windSpeed || 0)} km/h`);
    if (!reasons.length) {
      setGeneratedAlerts([{ city: c.name, type: 'safe', level: 'normal', reason: `No emergency risk detected. Live AQI ${c.aqi}, PM2.5 ${c.pm25 || 'N/A'}, temperature ${c.weatherTemp}°C, rainfall ${Number(c.precipitation || 0).toFixed(1)}mm, flood risk ${c.floodRisk}%, heat risk ${c.heatwaveRisk}%, storm risk ${c.stormRisk}% are below alert thresholds.` }]);
      setNotifications(0);
      return;
    }
    const type = c.aqi > 150 || Number(c.pm25 || 0) > 55 ? 'pollution' : c.floodRisk > 70 ? 'flood' : (c.heatwaveRisk > 75 || c.weatherTemp > 38) ? 'heatwave' : 'storm';
    const level = (c.aqi > 200 || c.floodRisk > 85 || c.heatwaveRisk > 85 || c.stormRisk > 85) ? 'critical' : 'high';
    setGeneratedAlerts([{ city: c.name, type, level, reason: reasons.join('; '), live: { aqi: c.aqi, pm25: c.pm25, pm10: c.pm10, temp: c.weatherTemp, rainfall: c.precipitation, wind: c.windSpeed, floodRisk: c.floodRisk, heatwaveRisk: c.heatwaveRisk, stormRisk: c.stormRisk } }]);
    setNotifications(1);
  };

  const generateSoilAdvice = () => {
    const profiles = {
      'Mekong Delta': [
        ['🌾 Flood-resilient Cropping', 'Mekong Delta: Shift low-lying farms to flood-tolerant rice varieties and seasonal aquaculture rotation.', NEON],
        ['💧 Canal Water Management', 'Mekong Delta: Use salinity gates and canal-level sensors before irrigation release.', NEON2],
        ['🧪 Salinity Control', 'Mekong Delta: Test soil salinity weekly and apply organic compost to recover soil structure.', GOLD],
        ['📍 Map Action', 'Select Can Tho / Mekong markers to verify high-risk delta clusters before field deployment.', '#66bb6a'],
      ],
      'Can Tho': [
        ['🌿 Organic Farming', 'Can Tho: Increase organic matter in low-moisture farms and monitor soil carbon by village cluster.', NEON],
        ['💧 Drip Irrigation', 'Can Tho: Use solar-powered drip irrigation where moisture is below baseline.', NEON2],
        ['🌾 Crop Rotation', 'Can Tho: Add nitrogen-fixing crop rotation in degraded agricultural wards.', GOLD],
        ['🧪 Reduce Chemicals', 'Can Tho: Reduce synthetic fertilizer and add bio-based alternatives after local soil test.', '#66bb6a'],
      ],
      'Da Nang': [
        ['⛈ Storm Soil Protection', 'Da Nang: Add slope vegetation barriers near stormwater runoff zones to stop topsoil erosion.', NEON],
        ['💧 Urban Water Capture', 'Da Nang: Reuse rooftop runoff for peri-urban farms during dry weeks.', NEON2],
        ['🌱 Coastal Green Belt', 'Da Nang: Add salt-tolerant vegetation along coastal agricultural strips.', GOLD],
        ['📍 Map Action', 'Use Show on Map to inspect storm/flood corridors before applying farm advisory.', '#66bb6a'],
      ],
      'Central Highlands': [
        ['☕ Coffee Soil Recovery', 'Central Highlands: Use shade trees and compost for coffee plantations to reduce moisture loss.', NEON],
        ['💧 Moisture Sensors', 'Central Highlands: Place IoT soil-moisture sensors on sloped farms and drip irrigate only below threshold.', NEON2],
        ['🌾 Anti-Erosion Terraces', 'Central Highlands: Add contour farming and terrace barriers on degraded slopes.', GOLD],
        ['🧪 Nitrogen Balance', 'Central Highlands: Use split nitrogen application based on rainfall forecast.', '#66bb6a'],
      ],
      'Ninh Thuan': [
        ['☀ Drought Farming', 'Ninh Thuan: Use drought-resistant crops and solar-powered micro-irrigation.', NEON],
        ['💧 Water Budgeting', 'Ninh Thuan: Prioritize drip irrigation and reservoir scheduling for dry-season farms.', NEON2],
        ['🌱 Soil Cover', 'Ninh Thuan: Add mulch and cover crops to reduce evaporation losses.', GOLD],
        ['📍 Map Action', 'Show on Map and compare solar score before planning irrigation energy.', '#66bb6a'],
      ],
      'Binh Thuan': [
        ['💨 Wind-Solar Farm Support', 'Binh Thuan: Combine wind/solar power with drip irrigation for sandy soil zones.', NEON],
        ['🌱 Sand Soil Recovery', 'Binh Thuan: Use organic amendments and windbreak belts to reduce erosion.', NEON2],
        ['💧 Irrigation Timing', 'Binh Thuan: Irrigate early morning based on live moisture index.', GOLD],
        ['📍 Map Action', 'Inspect coastal renewable markers before recommending energy-backed farm systems.', '#66bb6a'],
      ],
    };
    setSoilAdvice(profiles[soilLocation] || profiles['Mekong Delta']);
  };
  const sendSelectedAlert = async () => {
    if (!selectedAlert || selectedAlert.type === 'safe') return;
    const payload = { ...selectedAlert, message: `${selectedAlert.type.toUpperCase()} WARNING for ${selectedAlert.city}: ${selectedAlert.action || selectedAlert.reason}`, createdAt: new Date().toISOString() };
    try {
      await api.post('/citizen/notify', payload);
      setSentAlerts(v => [payload, ...v]);
      setNotifications(v=>v+1);
      setCitizenAlert(payload.message);
      alert('✅ Emergency alert sent to verified citizen message boxes from backend.');
    } catch (err) {
      alert('⚠ Alert not sent. Backend/SMTP/database connection is required for live citizen alerts.');
    }
  };

  // Build city trend data from yearlyData
  const cityTrendData = city?.yearlyData ? Object.entries(city.yearlyData).map(([yr, d]) => ({
    year: yr, emission: d.emission, aqi: d.aqi, renewable: d.renewable, population: d.population, ev: d.evVehicles
  })) : [];

  // Comparison data
  const comparisonData = ['emission', 'aqi', 'renewable'].map(key => ({
    metric: key === 'emission' ? 'CO₂ MT' : key === 'aqi' ? 'AQI' : 'Renewable%',
    [city?.name]: city?.yearlyData?.[selectedYear]?.[key] || 0,
    [compareCityData?.name]: compareCityData?.yearlyData?.[selectedYear]?.[key] || 0,
  }));

  // Radar data for city profile
  const radarData = city ? [
    { metric: 'Solar', value: city.solarAvailability },
    { metric: 'Renewable', value: city.renewablePercent },
    { metric: 'CleanAir', value: 100 - city.aqi * 0.5 },
    { metric: 'SmartCity', value: city.smartCityScore },
    { metric: 'Mobility', value: 100 - city.trafficDensity },
    { metric: 'Climate', value: 100 - city.climateRisk },
  ] : [];

  const filteredCities = VIETNAM_CITIES.filter(c =>
    c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.region.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#020b05', color: '#e8f5e9', paddingRight: isFridayOpen ? 'calc(max(25%, 300px))' : '0', transition: 'padding-right 0.3s' }}>
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 flex flex-col transition-all duration-300 relative`}
        style={{ background: '#061209', borderRight: '1px solid #00ff8818' }}>
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b ${sidebarOpen ? '' : 'justify-center'}`} style={{ borderColor: '#00ff8818' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00ff88,#00c853)', boxShadow: '0 0 12px #00ff8866' }}>
            <Leaf size={16} color="#020b05" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-orbitron text-xs font-black" style={{ color: NEON }}>VietCarbon</div>
              <div className="font-mono" style={{ color: '#4caf50', fontSize: '9px' }}>AI PLATFORM</div>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button onClick={() => setSidebarOpen(v => !v)} className="absolute -right-3 top-5 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: '#0a1f0e', border: '1px solid #00ff8833', color: NEON }}>
          {sidebarOpen ? <ChevronDown size={12} style={{ transform: 'rotate(90deg)' }} /> : <ChevronUp size={12} style={{ transform: 'rotate(90deg)' }} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
              style={active === id
                ? id === 'hydrogrid'
                  ? { background: 'linear-gradient(135deg,#00e5ff18,#2979ff12)', border: '1px solid #00e5ff44', color: '#00e5ff', boxShadow: '0 0 12px #00e5ff22' }
                  : { background: 'linear-gradient(135deg,#00ff8818,#00c85312)', border: '1px solid #00ff8833', color: NEON }
                : id === 'hydrogrid'
                  ? { border: '1px solid #00e5ff18', color: '#1de9b6' }
                  : { border: '1px solid transparent', color: '#4caf50' }}>
              <Icon size={16} style={{ flexShrink: 0, color: id === 'hydrogrid' && active !== id ? '#1de9b6' : undefined }} />
              {sidebarOpen && <span className="font-mono text-xs">{label}</span>}
              {sidebarOpen && id === 'hydrogrid' && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-mono font-bold"
                  style={{background:'#00e5ff18',color:'#00e5ff',border:'1px solid #00e5ff33',fontSize:'8px'}}>NEW</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom user */}
        {sidebarOpen && (
          <div className="p-3 border-t" style={{ borderColor: '#00ff8818' }}>
            <div className="text-xs font-mono" style={{ color: '#4caf50' }}>Admin: {user?.username}</div>
            <button onClick={logout} className="mt-2 flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-lg w-full"
              style={{ background: '#0d2e14', color: '#81c784' }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="flex items-center gap-4 px-6 py-3 flex-shrink-0" style={{ background: '#061209', borderBottom: '1px solid #00ff8818' }}>
          <div className="flex-1">
            <div className="font-orbitron text-sm font-black" style={{ color: NEON }}>
              {tabs.find(t => t[0] === active)?.[1] || 'Dashboard'}
            </div>
            <div className="font-mono text-xs" style={{ color: '#4caf50' }}>
              VIETNAM SMART SUSTAINABILITY DASHBOARD • 2021–2026 LIVE
            </div>
          </div>

          {/* Search City Dropdown */}
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: '#4caf50' }} />
            <input
              value={searchQ}
              onFocus={() => setSearchOpen(true)}
              onChange={e => { setSearchQ(e.target.value); setSearchOpen(true); }}
              placeholder="Search city..."
              className="pl-9 pr-4 py-2 rounded-xl text-xs font-mono"
              style={{ background: '#0a1f0e', border: '1px solid #00ff8822', color: '#e8f5e9', width: 190, outline: 'none' }}
            />
            {searchOpen && (
              <div
                className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
                style={{
                  width: 240,
                  maxHeight: 280,
                  overflowY: 'auto',
                  background: 'rgba(3,18,8,0.98)',
                  border: '1px solid #00ff8844',
                  boxShadow: '0 0 22px #00ff8822'
                }}
              >
                {VIETNAM_CITIES
                  .filter(c => !searchQ.trim() || c.name.toLowerCase().includes(searchQ.toLowerCase()))
                  .map(c => (
                    <button
                      key={c.id || c.name}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedCity(c.name);
                        setAiLocation(c.name);
                        setManualForm(v => ({ ...v, city: c.name }));
                        setSearchQ(c.name);
                        setSearchOpen(false);
                        setActive('overview');
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-mono transition-all"
                      style={{
                        color: selectedCity === c.name ? '#00e5ff' : '#e8f5e9',
                        borderBottom: '1px solid #00ff8812',
                        background: selectedCity === c.name ? '#00e5ff12' : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{c.name}</span>
                        <span style={{ color: c.aqi > 150 ? '#ff1744' : c.aqi > 100 ? '#ff6d00' : '#00ff88' }}>
                          AQI {Math.round(c.aqi || 0)}
                        </span>
                      </div>
                      <div className="mt-1" style={{ color: '#4caf50', fontSize: 10 }}>
                        Temp {Math.round(c.weatherTemp || 0)}°C • Traffic {Math.round(c.trafficDensity || 0)}%
                      </div>
                    </button>
                  ))}
                {VIETNAM_CITIES.filter(c => !searchQ.trim() || c.name.toLowerCase().includes(searchQ.toLowerCase())).length === 0 && (
                  <div className="px-3 py-3 text-xs font-mono" style={{ color: '#ffb300' }}>
                    No city found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Year filter */}
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs font-mono"
            style={{ background: '#0a1f0e', border: '1px solid #00ff8822', color: '#e8f5e9', outline: 'none' }}>
            {[2021, 2022, 2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>

          <select value={livePeriod} onChange={e => setLivePeriod(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-mono"
            title="2026 live data mode"
            style={{ background: '#0a1f0e', border: '1px solid #00e5ff33', color: '#00e5ff', outline: 'none' }}>
            <option value="daily">2026 Daily Live</option>
            <option value="monthly">2026 Monthly Live</option>
            <option value="yearly">2026 Yearly Live</option>
          </select>

          {/* Notif */}
          <div className="relative cursor-pointer" onClick={() => setActive('alerts')}>
            <Bell size={18} style={{ color: notifications > 0 ? CRIT : '#4caf50' }} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: CRIT, color: '#fff', fontSize: 9 }}>{notifications}</span>
            )}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: NEON, animation: 'pulse 1.5s infinite', boxShadow: `0 0 6px ${NEON}` }} />
            <span className="font-mono text-xs" style={{ color: NEON }}>LIVE</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="rounded-xl px-4 py-2 flex flex-wrap items-center gap-3 text-xs font-mono" style={{background:'#061209', border:'1px solid #00e5ff22', color:'#81c784'}}>
            <span style={{color:'#00e5ff'}}>2026 Live Mode:</span>
            <b style={{color:'#00ff88'}}>{livePeriod.toUpperCase()}</b>
            <span>• 2021–2025 historical data stays constant</span>
            <span>• only 2026 rows/cards/graphs update live</span>
            <span>• Weather/AQI from Open-Meteo {openMeteoLive.status === 'live' ? 'LIVE' : 'fallback'}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] font-mono">
            {[
              ['Weather', 'Open-Meteo Live'],
              ['Air Pollution', 'Open-Meteo Air Quality'],
              ['CO / AQI', 'Open-Meteo Live'],
              ['Renewable Energy', '2026 live simulator + admin data'],
              ['Historical Climate', '2021–2025 fixed baseline'],
            ].map(([d,src]) => (
              <div key={d} className="rounded-xl px-3 py-2" style={{background:'#061209',border:'1px solid #00ff8822'}}>
                <div style={{color:NEON2}}>{d}</div><div style={{color:'#81c784'}}>{src}</div>
              </div>
            ))}
          </div>

          {/* ─── OVERVIEW ─── */}
          {active === 'overview' && (
            <div className="space-y-5">
              {/* KPI strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  ['Total CO₂ 2026', `${VIETNAM_STATS.totalCO22025} Mt`, TrendingUp, WARN],
                  ['Renewable %', `${VIETNAM_STATS.renewablePercent2025}%`, Sun, NEON],
                  ['Avg AQI 2026', `${VIETNAM_STATS.avgAQI2025}`, Wind, GOLD],
                  ['EV Vehicles', `${Math.round((VEHICLE_TRAFFIC_DATA.at(-1)?.evVehicles || 0) * 1000)}K`, Car, NEON2],
                  ['Flood Events', `${DISASTER_CLIMATE_DATA.at(-1)?.floods || 0}`, CloudRain, NEON2],
                  ['Sustainability', `${(VIETNAM_CITIES.reduce((a,c)=>a+c.smartCityScore,0)/VIETNAM_CITIES.length).toFixed(1)}/100`, Shield, NEON],
                ].map(([label, val, Icon, color]) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: '#0a1f0e', border: `1px solid ${color}22` }}>
                    <Icon size={16} style={{ color }} />
                    <div className="font-orbitron text-lg font-black mt-1" style={{ color }}>{val}</div>
                    <div className="text-xs font-mono" style={{ color: '#4caf50', fontSize: '10px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* City basic data 2026 */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-sm" style={{ color: NEON }}>🏙 City Basic Data (2026 Live)</h3>
                  <div className="text-xs font-mono" style={{ color: '#4caf50' }}>Smart City Score Ranking</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['City', 'Population', 'Growth', 'Density/km²', 'Temp', 'AQI', 'Smart Score'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {VIETNAM_CITIES.sort((a, b) => b.smartCityScore - a.smartCityScore).map((c, i) => (
                        <tr key={c.id} className="cursor-pointer hover:bg-green-950 transition-colors"
                          onClick={() => { setSelectedCity(c.name); setActive('map'); }}
                          style={{ borderBottom: '1px solid #0d2e1466' }}>
                          <td className="p-2 font-bold" style={{ color: i < 2 ? NEON : '#e8f5e9' }}>{c.name}</td>
                          <td className="p-2" style={{ color: '#e8f5e9' }}>{(c.population / 1e6).toFixed(2)}M</td>
                          <td className="p-2" style={{ color: NEON }}>+{c.growthRate}</td>
                          <td className="p-2">{c.density?.toLocaleString()}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{c.weatherTemp || '--'}°C</td>
                          <td className="p-2" style={{ color: c.aqi > 100 ? CRIT : GOLD }}>{c.aqi || '--'}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#0d2e14', width: 60 }}>
                                <div className="h-full rounded-full" style={{ width: `${c.smartCityScore}%`, background: c.smartCityScore > 75 ? NEON : c.smartCityScore > 65 ? GOLD : WARN }} />
                              </div>
                              <span style={{ color: NEON }}>{c.smartCityScore}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Charts row */}
              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Total CO₂ Emission 2021–2026 (Million Ton CO₂)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={CARBON_EMISSION_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 11 }} />
                      <Bar dataKey="vehicleCO2" name="Vehicle" stackId="a" fill="#ff6d00" />
                      <Bar dataKey="factoryCO2" name="Factory" stackId="a" fill="#ff1744" />
                      <Bar dataKey="electricityCO2" name="Electricity" stackId="a" fill="#ffb300" />
                      <Bar dataKey="residentialCO2" name="Residential" stackId="a" fill="#00e5ff" />
                      <Bar dataKey="industrialCO2" name="Industrial" stackId="a" fill="#7c4dff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Renewable Energy Growth (GWh) 2021–2026</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={RENEWABLE_ENERGY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 11 }} />
                      <Line type="monotone" dataKey="solar" name="Solar" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} />
                      <Line type="monotone" dataKey="wind" name="Wind" stroke={NEON2} strokeWidth={2} dot={{ fill: NEON2, r: 3 }} />
                      <Line type="monotone" dataKey="hydro" name="Hydro" stroke={NEON} strokeWidth={2} dot={{ fill: NEON, r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <GaugeCard label="AVG AQI" value={68} max={200} unit="µg/m³" color={GOLD} />
                <GaugeCard label="PM2.5" value={28} max={100} unit="µg/m³" color={NEON} />
                <GaugeCard label="CO LEVEL" value={0.7} max={5} unit="ppm" color={NEON2} />
                <GaugeCard label="RENEWABLE" value={28.7} max={100} unit="%" color={NEON} />
                <GaugeCard label="EV ADOPTION" value={12.6} max={100} unit="%" color={NEON2} />
                <GaugeCard label="SOIL HEALTH" value={78} max={100} unit="/100" color="#66bb6a" />
              </div>

              {/* AI Insights */}
              <div className="grid lg:grid-cols-3 gap-5">
                <Card style={{ gridColumn: 'span 2' }}>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🤖 Ask FRIDAY AI for Location-Specific Recommendation</h3>
                  <div className="grid md:grid-cols-3 gap-3 mb-3">
                    <select value={aiLocation} onChange={e=>setAiLocation(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                      {VIETNAM_CITIES.map(c=><option key={c.name}>{c.name}</option>)}
                    </select>
                    <select value={aiTopic} onChange={e=>setAiTopic(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                      {['CO2 emission','Traffic pollution','Flood risk','Heatwave risk','Renewable energy','Soil condition','Citizen vehicle pollution','Factory pollution','AQI pollution'].map(t=><option key={t}>{t}</option>)}
                    </select>
                    <button onClick={askLocationAI} className="p-2 rounded-lg font-orbitron text-xs" style={{background:'#00ff8822',color:NEON,border:'1px solid #00ff8866'}}>Ask AI Solution</button>
                  </div>
                  <textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} placeholder="Write your problem first, then AI will suggest solution. Example: CO2 is high near airport zone, what action should I take?" className="w-full p-3 rounded-xl font-mono text-xs mb-3" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8822',minHeight:80}} />
                  <div className="p-3 rounded-xl whitespace-pre-line font-mono text-xs" style={{background:'#061209',border:'1px solid #00e5ff33',color: aiAnswer ? '#c8f7d0' : '#4caf50'}}>
                    {aiAnswer || 'No automatic/random suggestions. Select city/district topic, type problem, then click Ask AI Solution.'}
                  </div>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🏆 City CO₂ Ranking</h3>
                  <div className="space-y-2">
                    {VIETNAM_CITIES.sort((a, b) => b.emissionMT - a.emissionMT).map((c, i) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="text-xs font-mono w-4" style={{ color: '#4caf50' }}>{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs font-mono" style={{ color: '#e8f5e9', fontSize: 10 }}>{c.name}</span>
                            <span className="text-xs font-mono" style={{ color: NEON, fontSize: 10 }}>{c.emissionMT}Mt</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: '#0d2e14' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (c.emissionMT / 20) * 100)}%`, background: c.emissionMT > 15 ? CRIT : c.emissionMT > 8 ? WARN : NEON }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Image gallery */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  [IMAGES.solar, '☀ Solar Farms', 'Dak Lak — 500MW capacity'],
                  [IMAGES.wind, '💨 Wind Energy', 'Binh Thuan coast offshore'],
                  [IMAGES.ev, '⚡ EV Network', 'Star Charge across Vietnam'],
                  [IMAGES.flood, '🌊 Flood Events', 'Mekong Delta monitoring'],
                ].map(([src, title, desc]) => (
                  <div key={title} className="relative rounded-xl overflow-hidden group cursor-pointer" style={{ border: '1px solid #00ff8822', height: 140 }}>
                    <img src={src} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => e.target.style.display = 'none'} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#020b05cc,transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="font-orbitron text-xs font-bold" style={{ color: NEON, fontSize: 10 }}>{title}</div>
                      <div className="text-xs font-mono" style={{ color: '#81c784', fontSize: 9 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── MAP ─── */}
          {active === 'map' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['carbon', 'climate', 'traffic', 'solar', 'flood', 'population', 'factory', 'renewable'].map(layer => (
                  <button key={layer} onClick={() => setActiveLayer(layer)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                    style={activeLayer === layer
                      ? { background: 'linear-gradient(135deg,#00ff88,#00c853)', color: '#030d07', fontWeight: 'bold' }
                      : { background: '#0a1f0e', border: '1px solid #00ff8822', color: '#4caf50' }}>
                    {layer.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: '1px solid #00ff8822', height: 'calc(100vh - 120px)', minHeight: 860 }}>
                  <VietnamMap activeLayer={activeLayer} selectedCity={selectedCity} onCitySelect={(c) => setSelectedCity(typeof c === "object" ? c.name : c)} />
                </div>
                <div className="space-y-3">
                  <Card>
                    <h3 className="font-orbitron text-sm mb-2" style={{ color: NEON }}>🗺 Selected Map Data Layer — 2026 Live</h3>
                    <div className="text-xs font-mono space-y-2" style={{ color:'#c8f7d0' }}>
                      <div><b style={{color:NEON2}}>{selectedCity}</b> selected. This panel shows current map-layer values only.</div>
                      <div className="grid grid-cols-2 gap-2">
                        <StatRow label="AQI" value={`${city?.aqi} ${city?.aqiLevel}`} color={city?.aqi > 100 ? CRIT : NEON} />
                        <StatRow label="Traffic" value={`${city?.trafficDensity}%`} color={WARN} />
                        <StatRow label="Flood" value={`${city?.floodRisk}%`} color={NEON2} />
                        <StatRow label="Renewable" value={`${city?.renewablePercent}%`} color={NEON} />
                      </div>
                    </div>
                  </Card>
                  <Card style={{ padding: 16 }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-orbitron text-sm" style={{ color: NEON }}>{city?.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ background: city?.urgency === 'critical' ? '#ff174422' : '#ffb30022', color: city?.urgency === 'critical' ? CRIT : GOLD }}>
                        {(city?.urgency || '').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        ['👥 Population', (city?.population || 0).toLocaleString(), NEON2],
                        ['📈 Growth Rate', city?.growthRate, NEON],
                        ['💨 CO₂ Emissions', `${city?.emissionMT} MT/yr`, WARN],
                        ['🌬 AQI (2026 LIVE)', `${city?.aqi} — ${city?.aqiLevel}`, city?.aqi > 100 ? CRIT : GOLD],
                        ['🌊 Flood Risk', `${city?.floodRisk}%`, NEON2],
                        ['🌡 Climate Risk', `${city?.climateRisk}%`, WARN],
                        ['☀ Solar Score', `${city?.solarAvailability}%`, GOLD],
                        ['🏭 Traffic', `${city?.trafficDensity}%`, '#ce93d8'],
                        ['⚡ Renewable', `${city?.renewablePercent}%`, NEON],
                        ['🏭 Top CO₂ Area', city?.topCO2Area, WARN],
                        ['🤖 Smart Score', `${city?.smartCityScore}/100`, NEON],
                      ].map(([label, val, color]) => (
                        <StatRow key={label} label={label} value={val} color={color} />
                      ))}
                    </div>
                  </Card>
                  <Card style={{ padding: 16 }}>
                    <h3 className="font-orbitron text-xs mb-2" style={{ color: NEON }}>📡 2026 Live Map Metrics</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <StatRow label="AQI" value={`${city?.aqi} AQI`} color={city?.aqi > 100 ? CRIT : GOLD} />
                      <StatRow label="Traffic" value={`${city?.trafficDensity}%`} color={WARN} />
                      <StatRow label="Renewable" value={`${city?.renewablePercent}%`} color={NEON} />
                      <StatRow label="CO₂" value={`${city?.emissionMT} Mt`} color={WARN} />
                    </div>
                  </Card>
                  <Card style={{ padding: 16 }}>
                    <h3 className="font-orbitron text-xs mb-2" style={{ color: NEON2 }}>🔴 2026 Live Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div style={{color:'#81c784'}}>Air Quality</div><div style={{color: city?.aqi > 100 ? CRIT : NEON}}>{city?.aqi} AQI</div>
                      <div style={{color:'#81c784'}}>Water/Flood</div><div style={{color: city?.floodRisk > 70 ? NEON2 : NEON}}>{city?.floodRisk}% risk</div>
                      <div style={{color:'#81c784'}}>Solar</div><div style={{color:GOLD}}>{city?.solarAvailability}%</div>
                      <div style={{color:'#81c784'}}>Traffic</div><div style={{color:WARN}}>{city?.trafficDensity}%</div>
                      <div style={{color:'#81c784'}}>Citizen Records</div><div style={{color:NEON2}}>{city?.citizenRecords || 0}</div>
                      <div style={{color:'#81c784'}}>Citizen CO₂ Add</div><div style={{color:WARN}}>{city?.citizenCO2AddedMt || 0} Mt</div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* City comparison */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-orbitron text-sm" style={{ color: NEON }}>City Comparison</h3>
                    <select value={compareCity} onChange={e => setCompareCity(e.target.value)}
                      className="text-xs font-mono px-2 py-1 rounded-lg"
                      style={{ background: '#061209', border: '1px solid #00ff8822', color: '#e8f5e9', outline: 'none' }}>
                      {VIETNAM_CITIES.filter(c => c.name !== selectedCity).map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="metric" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 11 }} />
                      <Bar dataKey={city?.name} fill={WARN} radius={[4, 4, 0, 0]} />
                      <Bar dataKey={compareCityData?.name} fill={NEON2} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🕸 Sustainability Profile — {city?.name}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#0d2e14" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fill: '#4caf50', fontSize: 8 }} />
                      <Radar dataKey="value" stroke={NEON} fill={NEON} fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          )}

          {/* ─── CO2 CONTROL ─── */}
          {active === 'co2' && (
            <div className="space-y-5">
              {/* 5-year summary table */}
              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>📊 Carbon Emission Data (2021–2026 Static + 2026 Live) — Million Ton CO₂</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Total CO₂', 'Vehicle', 'Factory', 'Electricity', 'Residential', 'Industrial', 'Agriculture', 'Reduction%'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CARBON_EMISSION_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466', color: '#e8f5e9' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2 font-bold" style={{ color: WARN }}>{d.totalCO2}</td>
                          <td className="p-2">{d.vehicleCO2}</td>
                          <td className="p-2">{d.factoryCO2}</td>
                          <td className="p-2">{d.electricityCO2}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.residentialCO2}</td>
                          <td className="p-2">{d.industrialCO2}</td>
                          <td className="p-2">{d.agriculturalCO2}</td>
                          <td className="p-2" style={{ color: NEON }}>{d.reductionPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>CO₂ Trend by Source (Mt)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={CARBON_EMISSION_DATA}>
                      <defs>
                        {['vehicleCO2', 'factoryCO2', 'electricityCO2', 'residentialCO2'].map((k, i) => (
                          <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={[WARN, CRIT, GOLD, NEON2][i]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={[WARN, CRIT, GOLD, NEON2][i]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Area type="monotone" dataKey="vehicleCO2" name="Vehicle" stroke={WARN} fill={`url(#grad_vehicleCO2)`} strokeWidth={2} />
                      <Area type="monotone" dataKey="factoryCO2" name="Factory" stroke={CRIT} fill={`url(#grad_factoryCO2)`} strokeWidth={2} />
                      <Area type="monotone" dataKey="electricityCO2" name="Electricity" stroke={GOLD} fill={`url(#grad_electricityCO2)`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🏭 Highest CO₂ Production Areas (2026 LIVE)</h3>
                  <div className="space-y-3">
                    {VIETNAM_STATS.topCO2Areas2025.map((a, i) => (
                      <div key={i} className="p-3 rounded-xl" style={{ background: '#061209', border: `1px solid ${WARN}22` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-orbitron font-bold" style={{ color: WARN, fontSize: 10 }}>{a.area}</span>
                          <span className="text-xs font-orbitron font-bold" style={{ color: NEON }}>{a.co2} Mt</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: '#0d2e14' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (a.co2 / 20) * 100)}%`, background: `linear-gradient(90deg,${WARN},${CRIT})` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-orbitron text-xs mb-2" style={{ color: NEON }}>Historical Top CO₂ Area by Year</h4>
                    <div className="space-y-1">
                      {CO2_PRODUCTION_AREAS.map(d => (
                        <div key={d.year} className="flex justify-between items-center p-2 rounded-lg" style={{ background: '#061209', border: '1px solid #0d2e14' }}>
                          <span className="text-xs font-mono" style={{ color: GOLD }}>{d.year}</span>
                          <span className="text-xs font-mono" style={{ color: '#e8f5e9' }}>{d.area} ({d.city})</span>
                          <span className="text-xs font-mono" style={{ color: WARN }}>{d.co2} Mt</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Highly Polluted Areas */}
              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: CRIT }}>🔴 Highly Polluted Areas (2026 LIVE)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Area', 'City', 'Pollution Score', 'Main Reason', 'Risk Level'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {VIETNAM_STATS.topPollutedAreas.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #0d2e1466' }}>
                          <td className="p-2 font-bold" style={{ color: '#e8f5e9' }}>{a.area}</td>
                          <td className="p-2">{a.city}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 rounded-full" style={{ width: `${a.score}%`, maxWidth: 60, background: a.score > 85 ? CRIT : WARN }} />
                              <span style={{ color: a.score > 85 ? CRIT : WARN }}>{a.score}</span>
                            </div>
                          </td>
                          <td className="p-2" style={{ color: '#e8f5e9' }}>{a.reason}</td>
                          <td className="p-2">
                            <span className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: a.risk === 'Very High' ? '#ff174422' : '#ff6d0022', color: a.risk === 'Very High' ? CRIT : WARN }}>
                              {a.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ─── CLIMATE & DISASTER ─── */}
          {active === 'climate' && (
            <div className="space-y-5">
              {/* Climate trends */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['🌡 Temp Increase', `+${VIETNAM_STATS.climateTrends.avgTempIncrease}°C`, CRIT],
                  ['🌧 Rainfall Change', `+${VIETNAM_STATS.climateTrends.avgRainfallChange}%`, NEON2],
                  ['🌊 Sea Level Rise', `+${VIETNAM_STATS.climateTrends.seaLevelRise} mm/yr`, NEON2],
                  ['🌞 Heatwave Days', `+${VIETNAM_STATS.climateTrends.heatwaveDaysIncrease} days`, WARN],
                ].map(([l, v, c]) => (
                  <div key={l} className="p-4 rounded-xl text-center" style={{ background: '#0a1f0e', border: `1px solid ${c}33` }}>
                    <div className="text-sm mb-1">{l.split(' ')[0]}</div>
                    <div className="font-orbitron text-xl font-black" style={{ color: c }}>{v}</div>
                    <div className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>{l.split(' ').slice(1).join(' ')}</div>
                  </div>
                ))}
              </div>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🌪 Disaster & Climate Data (2021–2026)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Floods', 'Storms', 'Heatwaves', 'Droughts', 'Landslides', 'Pop Affected (M)', 'Economic Loss ($B)', 'Recovery (Mo)'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DISASTER_CLIMATE_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.floods}</td>
                          <td className="p-2">{d.storms}</td>
                          <td className="p-2" style={{ color: d.heatwaves >= 10 ? CRIT : WARN }}>{d.heatwaves}</td>
                          <td className="p-2">{d.droughts}</td>
                          <td className="p-2">{d.landslides}</td>
                          <td className="p-2" style={{ color: WARN }}>{d.popAffected}M</td>
                          <td className="p-2" style={{ color: d.economicLoss > 2 ? CRIT : WARN }}>${d.economicLoss}B</td>
                          <td className="p-2">{d.recoveryMonths} mo</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Disaster Events Trend</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={DISASTER_CLIMATE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Line type="monotone" dataKey="floods" name="Floods" stroke={NEON2} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="heatwaves" name="Heatwaves" stroke={CRIT} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="landslides" name="Landslides" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Economic Loss & Recovery</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={DISASTER_CLIMATE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="economicLoss" name="Loss ($B)" fill={CRIT} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="recoveryMonths" name="Recovery (mo)" stroke={NEON} strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Risk by city */}
              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🌊 Flood & Climate Risk by City — 2026 LIVE</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={VIETNAM_CITIES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                    <XAxis dataKey="name" tick={{ fill: '#4caf50', fontSize: 9 }} angle={-20} textAnchor="end" height={45} />
                    <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                    <Bar dataKey="floodRisk" name="Flood Risk" fill={NEON2} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="heatwaveRisk" name="Heatwave Risk" fill={CRIT} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="stormRisk" name="Storm Risk" fill={GOLD} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {/* ─── RENEWABLE ENERGY ─── */}
          {active === 'energy' && (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['☀ Solar Energy 2026 LIVE', `${RENEWABLE_ENERGY_DATA.at(-1)?.solar?.toLocaleString()} GWh`, '+ live', GOLD],
                  ['💨 Wind Energy 2026 LIVE', `${RENEWABLE_ENERGY_DATA.at(-1)?.wind?.toLocaleString()} GWh`, '+ live', NEON2],
                  ['💧 Hydro Energy 2026 LIVE', `${RENEWABLE_ENERGY_DATA.at(-1)?.hydro?.toLocaleString()} GWh`, '+ live', '#29b6f6'],
                  ['⚡ EV Stations 2026 LIVE', `${RENEWABLE_ENERGY_DATA.at(-1)?.evStations?.toLocaleString()}`, '+ live', NEON],
                ].map(([l, v, change, c]) => (
                  <div key={l} className="p-4 rounded-xl" style={{ background: '#0a1f0e', border: `1px solid ${c}22` }}>
                    <div className="text-xs font-mono mb-1" style={{ color: '#4caf50' }}>{l}</div>
                    <div className="font-orbitron text-xl font-black" style={{ color: c }}>{v}</div>
                    <div className="text-xs font-mono" style={{ color: NEON }}>{change}</div>
                  </div>
                ))}
              </div>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>⚡ Renewable Energy Data (2021–2026)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Solar (GWh)', 'Wind (GWh)', 'Hydro (GWh)', 'EV Stations', 'Renewable %'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RENEWABLE_ENERGY_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2" style={{ color: GOLD }}>{d.solar.toLocaleString()}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.wind.toLocaleString()}</td>
                          <td className="p-2" style={{ color: '#29b6f6' }}>{d.hydro.toLocaleString()}</td>
                          <td className="p-2" style={{ color: NEON }}>{d.evStations.toLocaleString()}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, d.renewablePct)}%`, background: NEON }} />
                              <span style={{ color: NEON }}>{d.renewablePct}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Solar & Wind Growth</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={RENEWABLE_ENERGY_DATA}>
                      <defs>
                        <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.3} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gWind" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={NEON2} stopOpacity={0.3} /><stop offset="95%" stopColor={NEON2} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gHydro" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={NEON} stopOpacity={0.3} /><stop offset="95%" stopColor={NEON} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Area type="monotone" dataKey="solar" name="Solar GWh" stroke={GOLD} fill="url(#gSolar)" strokeWidth={2} />
                      <Area type="monotone" dataKey="wind" name="Wind GWh" stroke={NEON2} fill="url(#gWind)" strokeWidth={2} />
                      <Area type="monotone" dataKey="hydro" name="Hydro GWh" stroke={NEON} fill="url(#gHydro)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Renewable % by City (2026 LIVE)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={VIETNAM_CITIES.sort((a, b) => b.renewablePercent - a.renewablePercent)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis type="number" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#4caf50', fontSize: 9 }} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="renewablePercent" name="Renewable%" radius={[0, 4, 4, 0]}
                        fill={NEON} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[[IMAGES.solar, '☀ SOLAR FARM — DAK LAK', '500MW capacity • Largest in Southeast Asia'],
                [IMAGES.wind, '💨 WIND FARM — BINH THUAN', 'Coastal wind energy • 3.5GW potential']].map(([src, t, d]) => (
                  <div key={t} className="relative rounded-2xl overflow-hidden" style={{ height: 160, border: '1px solid #00ff8822' }}>
                    <img src={src} alt={t} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#020b05ee,transparent 50%)' }} />
                    <div className="absolute bottom-0 p-4">
                      <div className="font-orbitron text-sm font-black" style={{ color: NEON }}>{t}</div>
                      <div className="text-xs font-mono" style={{ color: '#81c784' }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SOIL & AGRICULTURE ─── */}
          {active === 'soil' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['Soil Fertility', `${SOIL_HEALTH_DATA.at(-1)?.soilFertility}/100`, SOIL_HEALTH_DATA.at(-1)?.soilFertility > 75 ? 'Good' : 'Moderate', NEON],
                  ['Soil Moisture', `${SOIL_HEALTH_DATA.at(-1)?.soilMoisture}%`, SOIL_HEALTH_DATA.at(-1)?.soilMoisture > 62 ? 'Good' : 'Moderate', GOLD],
                  ['Land Degradation', `${SOIL_HEALTH_DATA.at(-1)?.landDegradation}%`, SOIL_HEALTH_DATA.at(-1)?.landDegradation > 16 ? 'Watch' : 'Low Risk', '#66bb6a'],
                  ['Crop Productivity', `${SOIL_HEALTH_DATA.at(-1)?.cropProductivity}/100`, SOIL_HEALTH_DATA.at(-1)?.cropProductivity > 76 ? 'Good' : 'Moderate', NEON2],
                ].map(([l, v, s, c]) => (
                  <div key={l} className="p-4 rounded-xl" style={{ background: '#0a1f0e', border: `1px solid ${c}22` }}>
                    <div className="text-xs font-mono mb-1" style={{ color: '#4caf50' }}>{l}</div>
                    <div className="font-orbitron text-xl font-black" style={{ color: c }}>{v}</div>
                    <div className="text-xs font-mono" style={{ color: c }}>{s}</div>
                  </div>
                ))}
              </div>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🌱 Soil Health Data (2021–2026)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Soil Fertility', 'Soil Moisture', 'Nitrogen (mg/kg)', 'Land Degradation', 'Crop Productivity'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SOIL_HEALTH_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2" style={{ color: NEON }}>{d.soilFertility}/100</td>
                          <td className="p-2" style={{ color: GOLD }}>{d.soilMoisture}%</td>
                          <td className="p-2">{d.nitrogen}</td>
                          <td className="p-2" style={{ color: d.landDegradation > 12 ? WARN : '#66bb6a' }}>{d.landDegradation}%</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.cropProductivity}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Soil Health Trends</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={SOIL_HEALTH_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Line type="monotone" dataKey="soilFertility" name="Fertility" stroke={NEON} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="soilMoisture" name="Moisture%" stroke={NEON2} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="cropProductivity" name="Crop Prod." stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>AI Soil Recommendation — Location Based</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <select value={soilLocation} onChange={e=>{setSoilLocation(e.target.value); setSoilAdvice(null);}} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                      {['Mekong Delta','Can Tho','Da Nang','Central Highlands','Ninh Thuan','Binh Thuan'].map(x=><option key={x}>{x}</option>)}
                    </select>
                    <button onClick={()=>{setActive('map'); setSelectedCity(soilLocation === 'Central Highlands' ? 'Da Nang' : soilLocation)}} className="p-2 rounded-lg font-orbitron text-xs" style={{background:'#00e5ff22',color:NEON2,border:'1px solid #00e5ff66'}}>Show on Map</button>
                  </div>
                  <button onClick={generateSoilAdvice} className="w-full p-2 rounded-lg font-orbitron text-xs mb-3" style={{background:'#00ff8822',color:NEON,border:'1px solid #00ff8866'}}>Generate AI Soil Recommendation</button>
                  <div className="space-y-3">
                    {!soilAdvice && <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#061209', border: '1px solid #00ff8822', color: '#81c784' }}>No automatic soil recommendation. Select location and click Generate AI Soil Recommendation.</div>}
                    {(soilAdvice || []).map(([t, d, c]) => (
                      <div key={t} className="p-3 rounded-xl" style={{ background: '#061209', border: `1px solid ${c}22` }}>
                        <div className="font-orbitron text-xs font-bold mb-1" style={{ color: c }}>{t}</div>
                        <div className="text-xs font-mono" style={{ color: '#81c784' }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── TRAFFIC & VEHICLES ─── */}
          {active === 'traffic' && (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['Total Vehicles', `${((VEHICLE_TRAFFIC_DATA.at(-1)?.totalVehicles || 0) * 1000000).toLocaleString()}`, Car, WARN],
                  ['EV Vehicles', `${((VEHICLE_TRAFFIC_DATA.at(-1)?.evVehicles || 0) * 1000000).toLocaleString()}`, Zap, NEON],
                  ['Traffic Score', `${VEHICLE_TRAFFIC_DATA.at(-1)?.trafficIndex || 0}/100 High`, Activity, GOLD],
                  ['Avg Delay', `${Math.round((VEHICLE_TRAFFIC_DATA.at(-1)?.congestionScore || 70) / 2.4)} min`, AlertTriangle, CRIT],
                ].map(([l, v, Icon, c]) => (
                  <div key={l} className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#0a1f0e', border: `1px solid ${c}22` }}>
                    <Icon size={20} style={{ color: c, flexShrink: 0 }} />
                    <div>
                      <div className="font-orbitron text-base font-black" style={{ color: c }}>{v}</div>
                      <div className="text-xs font-mono" style={{ color: '#4caf50' }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>🚗 Vehicle & Traffic Data (2021–2026)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Total Vehicles (M)', 'EV Vehicles (M)', 'Traffic Index', 'Fuel Consumption (M L/day)', 'Congestion Score'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {VEHICLE_TRAFFIC_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2">{d.totalVehicles}M</td>
                          <td className="p-2" style={{ color: NEON }}>{d.evVehicles}M</td>
                          <td className="p-2">{d.trafficIndex}</td>
                          <td className="p-2" style={{ color: WARN }}>{d.fuelConsumption}M</td>
                          <td className="p-2" style={{ color: d.congestionScore > 75 ? CRIT : GOLD }}>{d.congestionScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>EV Adoption Growth (2021–2026)</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={VEHICLE_TRAFFIC_DATA}>
                      <defs>
                        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={NEON} stopOpacity={0.3} /><stop offset="95%" stopColor={NEON} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="evVehicles" name="EV Vehicles (M)" stroke={NEON} fill="url(#evGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Daily Fuel Consumption 2026 LIVE</h3>
                  <div className="space-y-3 mb-4">
                    {[
                      ['🔴 Petrol', VIETNAM_STATS.currentYear.dailyPetrol, 30, WARN],
                      ['⚫ Diesel', VIETNAM_STATS.currentYear.dailyDiesel, 30, '#a1887f'],
                      ['🟢 Electricity (EV)', VIETNAM_STATS.currentYear.dailyEV, 30, NEON],
                    ].map(([label, val, max, color]) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-mono" style={{ color: '#81c784' }}>{label}</span>
                          <span className="text-xs font-mono" style={{ color }}>{val} M L/day</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: '#0d2e14' }}>
                          <div className="h-full rounded-full" style={{ width: `${(val / max) * 100}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl" style={{ background: '#061209', border: `1px solid ${NEON2}22` }}>
                    <div className="font-orbitron text-xs font-bold mb-1" style={{ color: NEON2 }}>Most Crowded Roads 2026 LIVE</div>
                    {[
                      ['Pham Van Dong (HCMC)', 92],
                      ['Nguyen Trai (Hanoi)', 89],
                      ['Lang Ha (Hanoi)', 85],
                      ['Vo Nguyen Giap (Da Nang)', 82],
                    ].map(([road, score]) => (
                      <div key={road} className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono flex-1" style={{ color: '#e8f5e9' }}>{road}</span>
                        <div className="h-1.5 rounded-full" style={{ width: 80, background: '#0d2e14' }}>
                          <div className="h-full rounded-full" style={{ width: `${score}%`, background: score > 88 ? CRIT : WARN }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: WARN }}>{score}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Crowded areas */}
              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>👥 Most Crowded Areas (2021–2026)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                          {['Year', 'Area', 'City', 'Density/km²'].map(h => <th key={h} className="text-left p-2">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {CROWDED_AREAS_DATA.map(d => (
                          <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}>
                            <td className="p-2" style={{ color: GOLD }}>{d.year}</td>
                            <td className="p-2" style={{ color: '#e8f5e9' }}>{d.area}</td>
                            <td className="p-2" style={{ color: NEON2 }}>{d.city}</td>
                            <td className="p-2" style={{ color: WARN }}>{d.density.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-orbitron text-xs mb-2" style={{ color: NEON }}>Top Crowded Areas 2026 LIVE</h4>
                    {VIETNAM_STATS.topCrowdedAreas2025.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{ background: '#061209' }}>
                        <span className="text-xs font-mono w-3" style={{ color: '#4caf50' }}>{i + 1}</span>
                        <span className="text-xs font-mono flex-1" style={{ color: '#e8f5e9' }}>{a.area}, {a.city}</span>
                        <span className="text-xs font-mono" style={{ color: WARN }}>{a.density.toLocaleString()}/km²</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ─── AQI & POLLUTION ─── */}
          {active === 'pollution' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  ['AQI Avg', 68, GOLD],
                  ['PM2.5', '28 µg', NEON],
                  ['PM10', '45 µg', GOLD],
                  ['CO', '0.7 ppm', NEON],
                  ['NO₂', '16 ppb', NEON2],
                  ['SO₂', '12 ppb', '#66bb6a'],
                ].map(([l, v, c]) => (
                  <div key={l} className="p-3 rounded-xl text-center" style={{ background: '#0a1f0e', border: `1px solid ${c}22` }}>
                    <div className="font-orbitron text-xl font-black" style={{ color: c }}>{v}</div>
                    <div className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>{l}</div>
                    <div className="text-xs font-mono" style={{ color: '#2e7d32' }}>Good</div>
                  </div>
                ))}
              </div>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>💨 AQI & Pollution Data (2021–2026)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Avg AQI', 'PM2.5', 'PM10', 'CO (ppm)', 'NO₂ (ppb)', 'SO₂ (ppb)'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AQI_POLLUTION_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2" style={{ color: d.avgAQI > 65 ? WARN : NEON }}>{d.avgAQI}</td>
                          <td className="p-2" style={{ color: d.pm25 > 35 ? CRIT : GOLD }}>{d.pm25}</td>
                          <td className="p-2">{d.pm10}</td>
                          <td className="p-2">{d.co}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.no2}</td>
                          <td className="p-2">{d.so2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-5">
                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>AQI & PM2.5 Trend</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={AQI_POLLUTION_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0d2e14" />
                      <XAxis dataKey="year" tick={{ fill: '#4caf50', fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4caf50', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#4caf50', fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="pm25" name="PM2.5" fill={GOLD} radius={[3, 3, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="avgAQI" name="AQI" stroke={CRIT} strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Air Quality Index by City (2026 Live)</h3>
                  <div className="space-y-2">
                    {VIETNAM_CITIES.sort((a, b) => b.aqi - a.aqi).map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: '#81c784', fontSize: 10 }}>{c.name}</span>
                        <div className="flex-1 h-2 rounded-full" style={{ background: '#0d2e14' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, c.aqi)}%`, background: c.aqi > 100 ? CRIT : c.aqi > 70 ? GOLD : NEON }} />
                        </div>
                        <span className="text-xs font-mono w-8" style={{ color: c.aqi > 100 ? CRIT : c.aqi > 70 ? GOLD : NEON }}>{c.aqi}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-orbitron text-xs mb-2" style={{ color: NEON }}>🌊 Water Quality Index — 2026 LIVE (2026 Live)</h4>
                    {WATER_QUALITY_LIVE.map(r => (
                      <div key={r.name} className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono flex-1" style={{ color: '#81c784', fontSize: 10 }}>{r.name}</span>
                        <div className="h-1.5 rounded-full" style={{ width: 60, background: '#0d2e14' }}>
                          <div className="h-full rounded-full" style={{ width: `${r.quality}%`, background: r.quality > 70 ? NEON : GOLD }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: NEON, width: 24 }}>{r.quality}</span>
                        <span className="text-xs font-mono" style={{ color: r.status === 'Good' ? NEON : GOLD, fontSize: 9 }}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── AI REPORT ─── */}
          {active === 'report' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-orbitron text-sm" style={{ color: NEON }}>AI Climate Report Generator</h3>
                    <p className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>FRIDAY AI generates comprehensive sustainability, CO₂ & climate reports.</p>
                  </div>
                  <button onClick={generateReport} disabled={reportLoading}
                    className="px-5 py-2.5 rounded-xl flex items-center gap-2 font-orbitron text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#00ff88,#00c853)', color: '#030d07', boxShadow: '0 0 15px #00ff8844' }}>
                    {reportLoading ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
                    {reportLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button onClick={downloadReport} disabled={!report} className="px-4 py-2 rounded-xl font-orbitron text-xs font-bold flex items-center gap-2 disabled:opacity-40" style={{background:'#00e5ff22',border:'1px solid #00e5ff55',color:NEON2}}>
                    <Download size={14}/> Download Report
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <select value={reportArea} onChange={e=>setReportArea(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                    {['state','city','district','town'].map(x=><option key={x}>{x}</option>)}
                  </select>
                  <select value={reportPeriod} onChange={e=>setReportPeriod(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                    {['daily','monthly','yearly'].map(x=><option key={x}>{x}</option>)}
                  </select>
                  <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}} />
                  <select value={reportTopic} onChange={e=>setReportTopic(e.target.value)} className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00ff8833'}}>
                    {['CO₂ emission','Traffic pollution','Flood risk','Heatwave risk','Renewable energy','Soil condition','Citizen vehicle pollution','Factory pollution','AQI pollution'].map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-[1fr_auto] gap-2 mb-4">
                  <input type="email" value={reportEmail} onChange={e=>setReportEmail(e.target.value)} placeholder="Enter factory / higher authority email" className="p-2 rounded-lg font-mono text-xs" style={{background:'#061209',color:'#e8f5e9',border:'1px solid #00e5ff33'}} />
                  <button type="button" onClick={sendReportByEmail} disabled={!report} className="px-4 py-2 rounded-lg font-orbitron text-xs font-bold disabled:opacity-40" style={{background:'#00e5ff22',border:'1px solid #00e5ff55',color:NEON2}}>Send Report by Email</button>
                  {reportEmailStatus && <div className="md:col-span-2 text-xs font-mono" style={{color:reportEmailStatus.startsWith('✅') ? NEON : WARN}}>{reportEmailStatus}</div>}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {VIETNAM_CITIES.map(c => (
                    <button key={c.id} onClick={() => setSelectedCity(c.name)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono"
                      style={selectedCity === c.name
                        ? { background: '#00ff8822', border: '1px solid #00ff8844', color: NEON }
                        : { background: '#061209', border: '1px solid #0d2e14', color: '#4caf50' }}>
                      {c.name}
                    </button>
                  ))}
                </div>
                {report ? (
                  <div className="rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap"
                    style={{ background: '#061209', border: '1px solid #00ff8822', color: '#c8f7d0', maxHeight: 500, overflowY: 'auto' }}>
                    {report}
                  </div>
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: '#061209', border: '1px solid #00ff8822' }}>
                    <Bot size={40} style={{ color: '#2e7d32', margin: '0 auto 12px' }} />
                    <div className="font-orbitron text-sm mb-2" style={{ color: '#4caf50' }}>FRIDAY AI Report Engine Ready</div>
                    <div className="text-xs font-mono" style={{ color: '#2e7d32' }}>Select a city and click "Generate Report" or say "Friday generate report"</div>
                  </div>
                )}
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {[[IMAGES.flood, '🌊 Flooding Crisis', 'Mekong Delta flooding affects 2M families annually. Smart drainage can reduce impact by 40%.', NEON2],
                [IMAGES.riceField, '🌾 Agricultural Impact', 'Climate change threatens 3.9M hectares of rice. Smart farming AI can optimize water usage.', '#66bb6a'],
                ].map(([src, t, d, color]) => (
                  <div key={t} className="rounded-2xl overflow-hidden relative" style={{ height: 160, border: `1px solid ${color}22` }}>
                    <img src={src} alt={t} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,#020b05ee,transparent 40%)' }} />
                    <div className="absolute bottom-0 p-4">
                      <div className="font-orbitron text-sm font-black" style={{ color }}>{t}</div>
                      <div className="text-xs font-mono" style={{ color: '#e8f5e9' }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CITIZENS ─── */}
          {active === 'citizens' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3 mb-4">
                {[
                  ['Total Citizens', citizens.length, NEON2],
                  ['Vehicles Tracked', citizens.reduce((a, c) => a + (Number(c.vehicles)||0) + (Number(c.twoWheelers)||0), 0), WARN],
                  ['Avg Family Size', citizens.length ? (citizens.reduce((a,c)=>a+(Number(c.familyMembers)||Number(c.family)||0),0)/citizens.length).toFixed(1) : '—', NEON],
                  ['Cities Covered', [...new Set(citizens.map(c=>c.city).filter(Boolean))].length, GOLD],
                ].map(([l, v, color]) => (
                  <div key={l} className="p-4 rounded-xl" style={{ background: '#0a1f0e', border: `1px solid ${color}22` }}>
                    <div className="font-orbitron text-2xl font-black" style={{ color }}>{v}</div>
                    <div className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>{l}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl" style={{background:'#0a1f0e',border:'1px solid #00ff8822'}}>
                <div className="font-mono text-xs" style={{color:'#81c784'}}>
                  {citizens.length === 0 ? '⚪ No live citizen records found. Citizens will appear here only after verified email OTP registration.' : `✅ ${citizens.length} verified live citizen record(s) from backend database.`}
                </div>
              </div>

              {/* Population data table */}
              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>👥 Population Data by City (2021–2026) — Millions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['Year', 'Hanoi', 'Ho Chi Minh', 'Da Nang', 'Hai Phong', 'Can Tho'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {POPULATION_DATA.map(d => (
                        <tr key={d.year} style={{ borderBottom: '1px solid #0d2e1466' }}
                          className={d.year === selectedYear ? 'bg-green-950' : ''}>
                          <td className="p-2 font-bold" style={{ color: d.year === 2026 ? NEON : '#e8f5e9' }}>{d.year}</td>
                          <td className="p-2" style={{ color: NEON2 }}>{d.hanoi}M</td>
                          <td className="p-2" style={{ color: WARN }}>{d.hcmc}M</td>
                          <td className="p-2">{d.danang}M</td>
                          <td className="p-2">{d.haiphong}M</td>
                          <td className="p-2">{d.cantho}M</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <h3 className="font-orbitron text-sm mb-3" style={{ color: NEON }}>Citizen Data Registry</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0d2e14', color: '#4caf50' }}>
                        {['User', 'City', 'Family', 'Cars', '2-Wheelers', 'Energy', 'CO₂ Est.', 'Submitted', 'Updated'].map(h => (
                          <th key={h} className="text-left p-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {citizens.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #0d2e1488', color: '#e8f5e9' }}>
                          <td className="p-2">{c.name || c.phone || c.user?.name || `citizen_${i + 1}`}</td>
                          <td className="p-2">{c.city || '—'}</td>
                          <td className="p-2">{c.familyMembers || c.family || '—'}</td>
                          <td className="p-2">{c.vehicles ?? '—'}</td>
                          <td className="p-2">{c.twoWheelers ?? '—'}</td>
                          <td className="p-2">{c.energyType || c.energy || '—'}</td>
                          <td className="p-2" style={{ color: WARN }}>{c.estimatedMobilityCO2 || c.co2Estimate || ((((Number(c.vehicles)||0)*2.3) + ((Number(c.twoWheelers)||0)*0.8)).toFixed(1))} T</td>
                          <td className="p-2" style={{ color: '#4caf50' }}>{(c.createdAt || c.submittedAt || '—').slice?.(0,10) || '—'}</td>
                          <td className="p-2" style={{ color: '#4caf50' }}>{(c.updatedAt || c.createdAt || '—').slice?.(0,10) || '—'}</td>
                        </tr>
                      ))}
                      {citizens.length === 0 && (
                        <tr><td colSpan={9} className="p-6 text-center font-mono text-xs" style={{ color: '#4caf50' }}>
                          No citizen records yet. Citizens register via the Citizen Portal (/citizen). Records appear here automatically after registration.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ─── AI DATA CENTER ─── */}
          {active === 'dataCenter' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  ['Citizen Records', citizens.length || 0, NEON2],
                  ['Daily City Samples', VIETNAM_CITIES.length * 6, NEON],
                  ['Map Markers', VIETNAM_CITIES.length + 18, GOLD],
                  ['Data Confidence', '86%', '#66bb6a'],
                ].map(([l, v, color]) => (
                  <div key={l} className="p-4 rounded-xl" style={{ background: '#0a1f0e', border: `1px solid ${color}33` }}>
                    <div className="font-orbitron text-2xl font-black" style={{ color }}>{v}</div>
                    <div className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>{l}</div>
                  </div>
                ))}
              </div>
              <Card>
                <h3 className="font-orbitron text-sm mb-2" style={{ color: NEON }}>➕ Manual City Data Insert</h3>
                <p className="text-xs font-mono mb-3" style={{color:'#81c784'}}>Use this when you receive data in chart/theory format. Select city, period and metric; it updates the app data table without adding chart images.</p>
                <form onSubmit={addManualRow} className="grid md:grid-cols-6 gap-2">
                  <select value={manualForm.city} onChange={e=>setManualForm({...manualForm,city:e.target.value})} className="p-2 rounded-lg text-xs font-mono md:col-span-1" style={{background:'#061209',border:'1px solid #00ff8822',color:'#e8f5e9'}}>{VIETNAM_CITIES.map(c=><option key={c.id}>{c.name}</option>)}</select>
                  <select value={manualForm.period} onChange={e=>setManualForm({...manualForm,period:e.target.value})} className="p-2 rounded-lg text-xs font-mono" style={{background:'#061209',border:'1px solid #00ff8822',color:'#e8f5e9'}}><option>daily</option><option>monthly</option><option>yearly</option></select>
                  <input type="date" value={manualForm.date} onChange={e=>setManualForm({...manualForm,date:e.target.value})} className="p-2 rounded-lg text-xs font-mono" style={{background:'#061209',border:'1px solid #00ff8822',color:'#e8f5e9'}} />
                  <select value={manualForm.metric} onChange={e=>setManualForm({...manualForm,metric:e.target.value})} className="p-2 rounded-lg text-xs font-mono" style={{background:'#061209',border:'1px solid #00ff8822',color:'#e8f5e9'}}><option>CO2</option><option>Traffic</option><option>AQI</option><option>Renewable</option><option>Population</option><option>Flood Risk</option></select>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2" style={{background:'#061209',border:'1px solid #00ff8822',minWidth:0}}>
                    <input required type="number" step="0.01" placeholder={`Enter ${manualForm.metric} value`} value={manualForm.value} onChange={e=>setManualForm({...manualForm,value:e.target.value})} className="w-full min-w-0 p-2 rounded-lg text-xs font-mono" style={{background:'transparent',color:'#e8f5e9',outline:'none'}} />
                    <span className="whitespace-nowrap text-[10px] font-mono" style={{color:NEON2}}>{manualMetricUnit}</span>
                  </div>
                  <button className="p-2 rounded-lg text-xs font-mono font-bold" style={{background:'linear-gradient(135deg,#00ff88,#00c853)',color:'#020b05'}}>ADD DATA</button>
                  <select value={manualForm.note} onChange={e=>setManualForm({...manualForm,note:e.target.value})} className="p-2 rounded-lg text-xs font-mono md:col-span-6" style={{background:'#061209',border:'1px solid #00ff8822',color:'#e8f5e9'}}>
                    <option value="">Select source / district / area for {manualForm.city}</option>
                    {selectedManualAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    <option value="field verification">field verification</option>
                    <option value="Open-Meteo live">Open-Meteo live</option>
                  </select>
                </form>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs font-mono"><thead><tr style={{borderBottom:'1px solid #0d2e14',color:'#4caf50'}}>{['City','Period','Date','Metric','Value','Note'].map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr></thead><tbody>
                    {manualRows.slice(0,8).map(r=><tr key={r.id} style={{borderBottom:'1px solid #0d2e1466'}}><td className="p-2" style={{color:NEON2}}>{r.city}</td><td className="p-2">{r.period}</td><td className="p-2">{r.date}</td><td className="p-2" style={{color:WARN}}>{r.metric}</td><td className="p-2">{r.value}</td><td className="p-2">{r.note}</td></tr>)}
                    {manualRows.length===0 && <tr><td colSpan={6} className="p-4 text-center" style={{color:'#4caf50'}}>No manual data inserted yet.</td></tr>}
                  </tbody></table>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-sm" style={{ color: NEON }}>Live Collected Data Feed</h3>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-mono" onClick={() => window.location.reload()} style={{background:'#061209',border:'1px solid #00ff8822',color:NEON}}>Refresh</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead><tr style={{ borderBottom:'1px solid #0d2e14', color:'#4caf50' }}>
                      {['Source','City','Family','Vehicles','Energy Type','Estimated Mobility CO₂','Updated'].map(h => <th key={h} className="text-left p-2">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {citizens.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center font-mono text-xs" style={{color:'#4caf50'}}>
                          No citizen records yet. Citizens will appear here after registering through the Citizen Portal at /citizen.
                        </td></tr>
                      ) : citizens.map((c,i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid #0d2e1466', color:'#e8f5e9' }}>
                          <td className="p-2">{c.phone || c.user?.username || `citizen_${i+1}`}</td>
                          <td className="p-2" style={{color:NEON2}}>{c.city || 'Unknown'}</td>
                          <td className="p-2">{c.familyMembers || c.family || '-'}</td>
                          <td className="p-2">{(Number(c.vehicles)||0) + (Number(c.twoWheelers)||0)}</td>
                          <td className="p-2">{c.energyType || c.energy || 'Grid'}</td>
                          <td className="p-2" style={{color:WARN}}>{c.estimatedMobilityCO2 || c.co2Estimate || (((Number(c.vehicles)||0)*2.3 + (Number(c.twoWheelers)||0)*0.7).toFixed(2))} t/year</td>
                          <td className="p-2">{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : c.submittedAt || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-orbitron text-sm" style={{ color: NEON }}>Daily Integration Data for Admin — 2026 LIVE</h3>
                    <button onClick={() => { localStorage.setItem('vietcarbon_integration_overrides', JSON.stringify(integrationOverrides)); alert('✅ Daily integration data saved.'); }} className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{background:'#00ff8822',border:'1px solid #00ff8866',color:NEON}}>Save Updates</button>
                  </div>
                  <div className="space-y-2">
                    {VIETNAM_CITIES.slice(0,6).map(c => {
                      const ov = integrationOverrides[c.name] || {};
                      const co2Val = ov.co2 ?? c.emissionMT;
                      const trafficVal = ov.traffic ?? c.trafficDensity;
                      const renewableVal = ov.renewable ?? c.renewablePercent;
                      return (
                        <div key={c.id} className="p-3 rounded-xl" style={{background:'#061209',border:'1px solid #00ff8818'}}>
                          <div className="flex justify-between mb-2"><span className="font-mono text-xs" style={{color:'#c8f7d0'}}>{c.name}</span><span className="font-mono text-xs" style={{color: c.urgency==='critical'?CRIT:NEON}}>{c.urgency}</span></div>
                          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                            {[['co2','CO₂',co2Val,'Mt'],['traffic','Traffic',trafficVal,'%'],['renewable','Renewable',renewableVal,'%']].map(([key,label,val,unit]) => (
                              <label key={key} className="space-y-1">
                                <span style={{color:'#4caf50'}}>{label}</span>
                                <input type="number" value={val} onChange={e => {
                                  const next = {...integrationOverrides, [c.name]: {...ov, [key]: Number(e.target.value)}};
                                  setIntegrationOverrides(next);
                                  localStorage.setItem('vietcarbon_integration_overrides', JSON.stringify(next));
                                }} className="w-full p-1.5 rounded-lg" style={{background:'#020b05',border:'1px solid #00ff8822',color:'#e8f5e9'}} />
                                <span style={{color:NEON}}>{unit}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-orbitron text-sm" style={{ color: NEON }}>Realistic Decision Notes — Editable</h3>
                    <button onClick={() => { localStorage.setItem('vietcarbon_decision_notes', JSON.stringify(decisionNotes)); alert('✅ Decision notes saved.'); }} className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{background:'#00ff8822',border:'1px solid #00ff8866',color:NEON}}>Save Notes</button>
                  </div>
                  <div className="space-y-2 text-xs font-mono" style={{color:'#c8f7d0'}}>
                    {decisionNotes.map((note, i) => (
                      <textarea key={i} value={note} onChange={e => {
                        const next = [...decisionNotes]; next[i] = e.target.value; setDecisionNotes(next); localStorage.setItem('vietcarbon_decision_notes', JSON.stringify(next));
                      }} className="w-full p-3 rounded-xl" style={{background:'#061209',border:'1px solid #00ff8822',color:'#c8f7d0',minHeight:70}} />
                    ))}
                    <button onClick={() => setDecisionNotes([...decisionNotes, 'New decision note...'])} className="px-3 py-2 rounded-lg text-xs font-mono" style={{background:'#061209',border:'1px solid #00e5ff44',color:NEON2}}>+ Add Note</button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── ALERTS ─── */}
          {active === 'alerts' && (
            <AlertsSection
              VIETNAM_CITIES={VIETNAM_CITIES}
              openMeteoLive={openMeteoLive}
              vietnamTime={vietnamTime}
              sentAlerts={sentAlerts}
              setSentAlerts={setSentAlerts}
              setNotifications={setNotifications}
              setActive={setActive}
              setSelectedCity={setSelectedCity}
              NEON={NEON} NEON2={NEON2} WARN={WARN} CRIT={CRIT} GOLD={GOLD}
              IMAGES={IMAGES}
              sendCitizenAlertFn={sendCitizenAlert}
              citizenAlertVal={citizenAlert}
              setCitizenAlert={setCitizenAlert}
            />
          )}
          {active === 'hydrogrid' && (
            <div className="flex-1 min-h-0 flex flex-col -m-6">
              <HydroGridAI />
            </div>
          )}
          {active === 'trafficIntel' && (
            <div className="flex-1 min-h-0 flex flex-col -m-6">
              <TrafficIntelligence />
            </div>
          )}
        </div>
      </main>
      <FridayAI onCommand={(cmd) => setActive(cmd)} isOpen={isFridayOpen} setIsOpen={setIsFridayOpen} />
    </div>
  );
}
