import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Leaf, LogOut, Send, CloudRain, Car, Users, Home, Bell, Zap,
  Sun, Wind, Thermometer, Activity, TrendingDown, Shield, BarChart2, MapPin, Mail
} from 'lucide-react';
import { VIETNAM_CITIES, VIETNAM_STATS } from '../utils/vietnamData';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar
} from 'recharts';

const NEON = '#00ff88';
const NEON2 = '#00e5ff';
const WARN = '#ff6d00';
const GOLD = '#ffb300';
const CRIT = '#ff1744';

const CITIES = VIETNAM_CITIES.map(c => c.name);

function InputField({ label, type = 'text', value, onChange, options, icon: Icon }) {
  return (
    <div>
      <label className="text-xs font-mono mb-1 flex items-center gap-1.5"
        style={{ color: '#4caf50' }}>
        {Icon && <Icon size={11} />} {label}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-xs font-mono"
          style={{ background: '#061209', border: '1px solid #00ff8822', color: '#e8f5e9', outline: 'none' }}>
          {options.map(o => <option key={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-xs font-mono"
          style={{ background: '#061209', border: '1px solid #00ff8822', color: '#e8f5e9', outline: 'none' }} />
      )}
    </div>
  );
}

function ScoreRing({ score, label, color = NEON, size = 90 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0d2e14" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fill={color}
          fontSize={size > 80 ? "18" : "14"} fontWeight="bold" fontFamily="monospace">{score}</text>
      </svg>
      <div className="text-xs font-mono mt-1 text-center" style={{ color: '#4caf50' }}>{label}</div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1); // 1=form, 2=results
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExistingCitizen, setIsExistingCitizen] = useState(false);
  const [existingData, setExistingData] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '+84 ', familyMembers: 4, city: 'Ho Chi Minh City', address: '',
    education: 'University', job: 'Office Worker',
    vehicles: 1, twoWheelers: 2, fuelType: 'Petrol',
    vehiclePurchaseYear: '2020', dailyTravelKm: 20,
    electricityUsage: 200, publicTransportDays: 2,
    solarPanel: false, energyType: 'grid',
    alertPreference: 'sms',
  });

  // Load verified citizen data from backend only. No hardcoded/local demo records.
  useEffect(() => {
    const userPhone = user?.phone || '';
    setForm(prev => ({ ...prev, phone: userPhone || prev.phone, email: user?.email || prev.email, name: user?.name || prev.name }));
    api.get('/citizen/data').then(r => {
      const record = Array.isArray(r.data) ? r.data[0] : null;
      if (record) {
        setIsExistingCitizen(true);
        setExistingData(record);
        setForm(prev => ({ ...prev, ...record, email: record.email || user?.email || prev.email, phone: record.phone || userPhone || prev.phone }));
        setStep(2);
        setMsg('✅ Welcome back! Your verified live profile was loaded from the backend database.');
      }
    }).catch(() => {
      setMsg('⚠ Backend citizen profile not loaded. Please make sure backend and MongoDB are running.');
    });
  }, [user]);

  const f = v => k => setForm(prev => ({ ...prev, [k]: v }));
  const set = k => v => setForm(prev => ({ ...prev, [k]: v }));

  // Carbon calculations
  const fuelFactor = form.fuelType === 'Electric' ? 0.02 : form.fuelType === 'Hybrid' ? 0.07 : form.fuelType === 'Diesel' ? 0.15 : form.fuelType === 'CNG' ? 0.09 : 0.12;
  const cityFactor = (VIETNAM_CITIES.find(c => c.name === form.city)?.trafficDensity || 50) / 70;
  const energyFactor = form.energyType === 'solar' || form.solarPanel ? 0.18 : form.energyType === 'mixed' ? 0.38 : 0.6;
  const vehicleEmission = (form.vehicles * form.dailyTravelKm * fuelFactor * 365 * cityFactor) / 1000;
  const twoWheelerEmission = (form.twoWheelers * form.dailyTravelKm * 0.055 * 365 * cityFactor) / 1000;
  const electricityEmission = (form.electricityUsage * 12 * energyFactor) / 1000;
  const totalCO2 = vehicleEmission + twoWheelerEmission + electricityEmission;
  const familyCO2 = totalCO2 * (form.familyMembers / 2);
  const nationalAvg = 3.6;
  const sustainabilityScore = Math.max(10, Math.round(100 - (totalCO2 / nationalAvg) * 40));
  const evSavingPotential = Math.round(vehicleEmission * 0.72 * 100) / 100;
  const solarSavingPotential = Math.round(electricityEmission * 0.65 * 100) / 100;

  const radarData = [
    { metric: 'Transport', value: Math.max(10, 100 - (vehicleEmission / nationalAvg) * 50) },
    { metric: 'Energy', value: Math.max(10, 100 - (electricityEmission / 2) * 40) },
    { metric: 'Family', value: Math.max(10, 100 - form.familyMembers * 8) },
    { metric: 'EV Ready', value: form.fuelType === 'Electric' ? 100 : form.fuelType === 'Hybrid' ? 60 : 20 },
    { metric: 'Solar', value: form.solarPanel ? 90 : form.energyType === 'solar' ? 70 : 10 },
    { metric: 'Transit', value: Math.min(100, form.publicTransportDays * 14) },
  ];

  const cityData = VIETNAM_CITIES.find(c => c.name === form.city);
  const [messageBox, setMessageBox] = useState([]);
  useEffect(() => { api.get('/citizen/notifications').then(r => setMessageBox(r.data || [])).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      let cleanPhone = String(form.phone || '').replace(/\s+/g, ' ').trim();
      if (!cleanPhone.startsWith('+84')) cleanPhone = '+84 ' + cleanPhone.replace(/^0+/, '');
      if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) throw new Error('Verified email is required. Please login/signup with email OTP first.');
      if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 9) throw new Error('Valid mobile number is required.');

      const payload = {
        ...form,
        phone: cleanPhone,
        email: form.email.trim().toLowerCase(),
        vehicleEmission: totalCO2.toFixed(2),
        co2Estimate: Number(familyCO2.toFixed(2)),
        estimatedMobilityCO2: Number(familyCO2.toFixed(2)),
        updatedAt: new Date().toISOString()
      };
      const res = await api.post('/citizen/data', payload);
      setExistingData(res.data?.data || payload);
      setIsExistingCitizen(true);
      setMsg('✅ Live citizen profile saved to backend database. Admin dashboard will update automatically.');
      setStep(2);
      api.get('/citizen/notifications').then(r => setMessageBox(r.data || [])).catch(() => {});
    } catch (err) {
      setMsg('⚠ ' + (err.response?.data?.error || err.message || 'Could not save live citizen profile.'));
    }
    setLoading(false);
  };

  const recommendations = (() => {
    const list = [];
    const cityAqiHigh = Number(cityData?.aqi || 0) > 120;
    const trafficHigh = Number(cityData?.trafficDensity || 0) > 70;
    const usesEV = form.fuelType === 'Electric';
    const evBikeCount = Number(form.twoWheelers || 0);
    const usesEVLike = usesEV || evBikeCount > 0;
    const usesHybrid = form.fuelType === 'Hybrid';
    const hasSolar = form.solarPanel || form.energyType === 'solar';

    if (!usesEVLike && form.vehicles > 0) {
      list.push({ icon: '⚡', title: 'Switch car trips to EV/Hybrid', desc: `Your current vehicle profile can save about ${evSavingPotential} tonnes CO₂/year by moving petrol/diesel car travel to EV or hybrid.`, color: NEON });
    }
    if (usesEVLike) {
      list.push({ icon: '✅', title: 'EV mobility detected', desc: `You already use ${usesEV ? 'an electric car' : `${evBikeCount} EV/bike(s)`}. FRIDAY will not suggest public transport as a default answer; it will only suggest off-peak travel when city AQI/traffic is high.`, color: NEON });
    }
    if (!hasSolar && form.electricityUsage > 120) {
      list.push({ icon: '☀', title: 'Reduce grid electricity emissions', desc: `Your monthly electricity use is ${form.electricityUsage} kWh. Rooftop solar or mixed renewable supply can save about ${solarSavingPotential} tonnes CO₂/year.`, color: GOLD });
    }
    if (hasSolar) {
      list.push({ icon: '☀', title: 'Solar profile detected', desc: 'Your home energy is already cleaner. Focus on efficient appliances and charging EV during solar production hours.', color: GOLD });
    }
    if ((cityAqiHigh || trafficHigh) && form.publicTransportDays < 3 && !usesEVLike) {
      list.push({ icon: '🚌', title: 'Use public transport during high-risk days', desc: `${form.city} currently has ${cityAqiHigh ? `AQI ${cityData?.aqi}` : `traffic density ${cityData?.trafficDensity}%`}. Use metro/bus on peak pollution days to reduce local congestion emissions.`, color: NEON2 });
    }
    if ((cityAqiHigh || trafficHigh) && usesEVLike) {
      list.push({ icon: '🚦', title: 'Avoid peak-hour EV trips', desc: `You use an EV, so emissions are low, but ${form.city} traffic/AQI is elevated. Prefer off-peak travel instead of unnecessary peak-hour trips.`, color: NEON2 });
    }
    if (form.dailyTravelKm > 15 && !usesEVLike && !usesHybrid) {
      list.push({ icon: '🚲', title: 'Short-distance mode shift', desc: `Your daily travel is ${form.dailyTravelKm} km. For trips under 5 km, cycling/walking gives the biggest personal CO₂ reduction.`, color: '#66bb6a' });
    }
    if (totalCO2 > nationalAvg) {
      list.push({ icon: '🌱', title: 'Offset remaining footprint', desc: `Your estimate is above the national average. Offset roughly ${Math.ceil(totalCO2 * 10)} trees worth of CO₂ while reducing vehicle and electricity emissions first.`, color: '#66bb6a' });
    }
    if (!list.length) {
      list.push({ icon: '🏆', title: 'No major personal risk detected', desc: 'Your EV/renewable/transport profile is already efficient. Maintain current habits and follow city alerts only when live AQI or weather risk increases.', color: NEON });
    }
    return list;
  })();

  return (
    <div className="min-h-screen" style={{ background: '#020b05', color: '#e8f5e9' }}>
      {/* Animated grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#00ff8806 1px,transparent 1px),linear-gradient(90deg,#00ff8806 1px,transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div className="relative max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00ff88,#00c853)', boxShadow: '0 0 15px #00ff8844' }}>
              <Leaf size={20} color="#020b05" />
            </div>
            <div>
              <div className="font-orbitron text-lg font-black" style={{ color: NEON }}>VietCarbon — Citizen Portal</div>
              <div className="font-mono text-xs" style={{ color: '#4caf50' }}>
                {form.phone || user?.phone || user?.username} • Vietnam Sustainability Network
              </div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono"
            style={{ background: '#0a1f0e', border: '1px solid #00ff8822', color: '#4caf50' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* National stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            ['🇻🇳 National CO₂', '179.6 Mt', WARN],
            ['⚡ Renewable Share', '28.7%', NEON],
            ['🚗 EV Vehicles', '910K', NEON2],
            ['🌱 Sustainability', '78.6/100', NEON],
          ].map(([l, v, c]) => (
            <div key={l} className="p-3 rounded-xl text-center" style={{ background: '#0a1f0e', border: `1px solid ${c}22` }}>
              <div className="font-orbitron text-base font-black" style={{ color: c }}>{v}</div>
              <div className="text-xs font-mono" style={{ color: '#4caf50', fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Existing citizen banner */}
        {isExistingCitizen && (
          <div className="mb-4 p-4 rounded-xl flex items-start gap-3" style={{ background: '#00ff8811', border: '1px solid #00ff8844' }}>
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-orbitron text-sm font-bold" style={{ color: NEON }}>Welcome Back, {existingData?.name || form.name || 'Citizen'}!</div>
              <div className="text-xs font-mono mt-1" style={{ color: '#81c784' }}>
                You are already registered as a Vietnam Citizen. Your profile has been loaded automatically from our database.
                No need to fill the form again.
              </div>
              <div className="flex gap-3 mt-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#00ff8811', color: NEON, border: '1px solid #00ff8833' }}>📱 {existingData?.phone || form.phone}</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#00e5ff11', color: '#00e5ff', border: '1px solid #00e5ff33' }}>🏙 {existingData?.city || form.city}</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#ffb30011', color: '#ffb300', border: '1px solid #ffb30033' }}>Registered: {existingData?.createdAt ? new Date(existingData.createdAt).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={submit} className="space-y-5">
            <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
              <h2 className="font-orbitron text-sm font-bold mb-4" style={{ color: NEON }}>
                👤 Personal Information
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField label="Full Name" value={form.name} onChange={set('name')} icon={Users} />
                <InputField label="Email" type="email" value={form.email} onChange={set('email')} icon={Mail} />
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider" style={{ color: '#4caf50' }}>Mobile Number</label>
                  <div className="flex items-center gap-2 mt-1 rounded-xl px-3 py-2" style={{ background: '#061209', border: '1px solid #00ff8833' }}>
                    <span className="font-mono font-bold" style={{ color: NEON }}>+84</span>
                    <input
                      value={String(form.phone || '').replace(/^\+84\s*/, '')}
                      onChange={e => set('phone')('+84 ' + e.target.value.replace(/[^0-9 ]/g, ''))}
                      placeholder="901 234 567"
                      className="flex-1 bg-transparent outline-none font-mono text-sm"
                      style={{ color: '#e8f5e9' }}
                    />
                  </div>
                </div>
                <InputField label="City" value={form.city} onChange={set('city')} icon={MapPin}
                  options={CITIES} />
                <InputField label="Family Members" type="number" value={form.familyMembers} onChange={set('familyMembers')} icon={Home} />
                <InputField label="Education Level" value={form.education} onChange={set('education')}
                  options={['Primary', 'Secondary', 'University', 'Postgraduate']} />
                <InputField label="Occupation" value={form.job} onChange={set('job')}
                  options={['Office Worker', 'Factory Worker', 'Student', 'Business Owner', 'Healthcare', 'Transportation', 'Farmer', 'Other']} />
                <InputField label="Address / District" value={form.address} onChange={set('address')} />
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
              <h2 className="font-orbitron text-sm font-bold mb-4" style={{ color: WARN }}>
                🚗 Vehicle Details
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField label="Number of Cars" type="number" value={form.vehicles} onChange={set('vehicles')} icon={Car} />
                <InputField label="Two-Wheelers (motorbikes)" type="number" value={form.twoWheelers} onChange={set('twoWheelers')} icon={Car} />
                <InputField label="Primary Fuel Type" value={form.fuelType} onChange={set('fuelType')}
                  options={['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']} />
                <InputField label="Vehicle Purchase Year" type="number" value={form.vehiclePurchaseYear} onChange={set('vehiclePurchaseYear')} />
                <InputField label="Daily Travel Distance (km)" type="number" value={form.dailyTravelKm} onChange={set('dailyTravelKm')} />
                <InputField label="Public Transport Days/Week" type="number" value={form.publicTransportDays} onChange={set('publicTransportDays')} icon={Activity} />
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
              <h2 className="font-orbitron text-sm font-bold mb-4" style={{ color: NEON }}>
                ⚡ Energy & Home
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField label="Monthly Electricity (kWh)" type="number" value={form.electricityUsage} onChange={set('electricityUsage')} icon={Zap} />
                <InputField label="Home Energy Source" value={form.energyType} onChange={set('energyType')}
                  options={[
                    { value: 'grid', label: 'Grid Electricity' },
                    { value: 'solar', label: 'Solar/Rooftop' },
                    { value: 'mixed', label: 'Mixed Renewable + Grid' },
                  ]} />
                <InputField label="Alert Preference" value={form.alertPreference} onChange={set('alertPreference')}
                  options={[
                    { value: 'sms', label: 'SMS' },
                    { value: 'email', label: 'Email' },
                    { value: 'app', label: 'App Notification' },
                  ]} />
                <div className="md:col-span-3 flex items-center gap-3">
                  <input type="checkbox" id="solar" checked={form.solarPanel}
                    onChange={e => setForm(p => ({ ...p, solarPanel: e.target.checked }))}
                    className="w-4 h-4" style={{ accentColor: NEON }} />
                  <label htmlFor="solar" className="text-xs font-mono" style={{ color: '#81c784' }}>
                    ☀ I have solar panels installed
                  </label>
                </div>
              </div>
            </div>

            {msg && (
              <div className="p-3 rounded-xl text-xs font-mono"
                style={{ background: '#00ff8811', border: '1px solid #00ff8833', color: NEON }}>{msg}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-orbitron text-sm font-black flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#00ff88,#00c853)', color: '#020b05', boxShadow: '0 0 20px #00ff8844' }}>
              {loading ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Calculating...' : 'Calculate My Carbon Footprint & Enable Alerts'}
            </button>
          </form>
        ) : (
          /* RESULTS PANEL */
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron text-lg font-black" style={{ color: NEON }}>
                🌱 Your Carbon Footprint Results
              </h2>
              <button onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-mono"
                style={{ background: '#0a1f0e', border: '1px solid #00ff8822', color: '#4caf50' }}>
                ← Edit Data
              </button>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl"
              style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
              <ScoreRing score={sustainabilityScore} label="Sustainability Score" color={sustainabilityScore > 60 ? NEON : sustainabilityScore > 40 ? GOLD : CRIT} />
              <ScoreRing score={Math.round(100 - (totalCO2 / nationalAvg) * 30)} label="Carbon Score" color={NEON2} size={90} />
              <ScoreRing score={Math.min(100, form.publicTransportDays * 14)} label="Mobility Score" color={GOLD} size={90} />
              <ScoreRing score={form.solarPanel ? 90 : form.energyType === 'solar' ? 70 : 30} label="Energy Score" color={GOLD} size={90} />
            </div>

            {/* Emission breakdown */}
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ['🚗 Vehicle CO₂', vehicleEmission.toFixed(2) + ' tonnes/yr', WARN],
                ['⚡ Electricity CO₂', electricityEmission.toFixed(2) + ' tonnes/yr', NEON2],
                ['👨‍👩‍👧 Family Total', familyCO2.toFixed(2) + ' tonnes/yr', GOLD],
              ].map(([l, v, c]) => (
                <div key={l} className="p-4 rounded-xl" style={{ background: '#061209', border: `1px solid ${c}22` }}>
                  <div className="text-sm mb-1" style={{ color: '#81c784' }}>{l}</div>
                  <div className="font-orbitron text-xl font-black" style={{ color: c }}>{v}</div>
                  <div className="text-xs font-mono mt-1" style={{ color: '#4caf50' }}>
                    vs National avg: {nationalAvg} t/capita
                  </div>
                </div>
              ))}
            </div>

            {/* Radar + City info */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
                <h3 className="font-orbitron text-xs mb-3" style={{ color: NEON }}>Sustainability Profile</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#0d2e14" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#4caf50', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#4caf50', fontSize: 8 }} domain={[0, 100]} />
                    <Radar dataKey="value" stroke={NEON} fill={NEON} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {cityData && (
                <div className="p-5 rounded-2xl space-y-2" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
                  <h3 className="font-orbitron text-xs mb-2" style={{ color: NEON }}>
                    📍 {cityData.name} — City Info
                  </h3>
                  {[
                    ['AQI (2026 Live)', `${cityData.aqi} — ${cityData.aqiLevel}`, cityData.aqi > 80 ? WARN : NEON],
                    ['City CO₂', `${cityData.emissionMT} Mt/yr`, WARN],
                    ['Flood Risk', `${cityData.floodRisk}%`, NEON2],
                    ['Climate Risk', `${cityData.climateRisk}%`, WARN],
                    ['Renewable %', `${cityData.renewablePercent}%`, NEON],
                    ['Smart City Score', `${cityData.smartCityScore}/100`, NEON],
                    ['Top CO₂ Area', cityData.topCO2Area, '#81c784'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="flex justify-between items-center p-2 rounded-lg"
                      style={{ background: '#061209', border: '1px solid #0d2e14' }}>
                      <span className="text-xs font-mono" style={{ color: '#81c784' }}>{l}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: '1px solid #00ff8822' }}>
              <h3 className="font-orbitron text-sm mb-4" style={{ color: NEON }}>
                🤖 AI Low-Carbon Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl flex items-start gap-3"
                    style={{ background: '#061209', border: `1px solid ${rec.color}22` }}>
                    <div className="text-2xl flex-shrink-0">{rec.icon}</div>
                    <div>
                      <div className="font-orbitron text-xs font-bold mb-1" style={{ color: rec.color }}>
                        {rec.title}
                      </div>
                      <div className="text-xs font-mono" style={{ color: '#c8f7d0' }}>{rec.desc}</div>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="col-span-2 p-4 text-center text-xs font-mono" style={{ color: NEON }}>
                    🏆 Excellent! You're already a low-carbon champion. Keep it up!
                  </div>
                )}
              </div>
            </div>

            {/* EV & Solar savings potential */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: `1px solid ${NEON}22` }}>
                <h3 className="font-orbitron text-xs mb-3" style={{ color: NEON }}>⚡ EV Savings Potential</h3>
                <div className="font-orbitron text-3xl font-black mb-1" style={{ color: NEON }}>{evSavingPotential} t</div>
                <div className="text-xs font-mono mb-3" style={{ color: '#4caf50' }}>CO₂ saved per year by switching to EV</div>
                <div className="h-2 rounded-full" style={{ background: '#0d2e14' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (evSavingPotential / 5) * 100)}%`, background: NEON }} />
                </div>
                <div className="mt-3 text-xs font-mono" style={{ color: '#81c784' }}>
                  Vietnam's VinFast EV incentive: 0% registration tax • 50% road tax discount
                </div>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: '#0a1f0e', border: `1px solid ${GOLD}22` }}>
                <h3 className="font-orbitron text-xs mb-3" style={{ color: GOLD }}>☀ Solar Savings Potential</h3>
                <div className="font-orbitron text-3xl font-black mb-1" style={{ color: GOLD }}>{solarSavingPotential} t</div>
                <div className="text-xs font-mono mb-3" style={{ color: '#4caf50' }}>CO₂ saved per year by installing solar</div>
                <div className="h-2 rounded-full" style={{ background: '#0d2e14' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (solarSavingPotential / 3) * 100)}%`, background: GOLD }} />
                </div>
                <div className="mt-3 text-xs font-mono" style={{ color: '#81c784' }}>
                  Government subsidy: 30% solar rooftop grant • Net metering program active
                </div>
              </div>
            </div>

            {/* Citizen message box */}
            <div className="p-4 rounded-2xl" style={{ background: '#0a1f0e', border: `1px solid ${WARN}22` }}>
              <div className="font-orbitron text-xs font-bold mb-2" style={{ color: WARN }}>📩 Citizen Message Box</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(messageBox.length ? messageBox : [{message:'No climate alert yet. Admin alerts will appear here immediately.', createdAt:new Date().toISOString()}]).map((m,i)=>(
                  <div key={i} className="p-2 rounded-lg text-xs font-mono" style={{background:'#061209',border:'1px solid #00ff8822',color:'#c8f7d0'}}>
                    <div>{m.message}</div><div style={{color:'#4caf50',fontSize:10,marginTop:3}}>{m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Today'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert status */}
            <div className="p-4 rounded-2xl flex items-center gap-4"
              style={{ background: '#0a1f0e', border: `1px solid ${NEON2}22` }}>
              <Bell size={24} style={{ color: NEON2, flexShrink: 0 }} />
              <div>
                <div className="font-orbitron text-xs font-bold" style={{ color: NEON2 }}>
                  Climate Alerts Enabled for {form.city}
                </div>
                <div className="text-xs font-mono mt-0.5" style={{ color: '#81c784' }}>
                  You will receive {form.alertPreference.toUpperCase()} alerts for: Flood • Storm • Heatwave • AQI spikes • Drought warnings
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
