import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Wind, Sun, Droplets, Cpu, TrendingUp, Activity, AlertTriangle,
  Settings, BarChart2, Car, Truck, Train, Navigation, ChevronRight,
  Battery, Gauge, Thermometer, CloudRain, Eye, Play, Pause, RefreshCw,
  CheckCircle, XCircle, ArrowRight, Globe
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

// ── Theme colors ─────────────────────────────────────────────────────────────
const C = {
  cyan:   '#00e5ff',
  green:  '#00ff88',
  blue:   '#2979ff',
  purple: '#7c4dff',
  orange: '#ff6d00',
  red:    '#ff1744',
  gold:   '#ffb300',
  teal:   '#1de9b6',
};

// ── Mock data generators ──────────────────────────────────────────────────────
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

function genEnergyHistory(n = 24) {
  return Array.from({ length: n }, (_, i) => ({
    time: `${String(i).padStart(2,'0')}:00`,
    solar: Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 480 + rand(-40, 40)),
    wind: rand(80, 320),
    tidal: rand(60, 120),
    demand: rand(400, 700),
    hydrogen: rand(30, 80),
  }));
}

function genWeeklyData() {
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({
    day: d,
    renewable: randInt(320, 680),
    hydrogen: randInt(40, 120),
    co2Saved: randInt(80, 200),
    efficiency: randInt(72, 95),
  }));
}

const VIETNAM_HYDRO_REGIONS = [
  { name:'Ninh Thuận', solar: 94, wind: 88, tidal: 72, h2Score: 91, lat:11.67, lng:108.86 },
  { name:'Bình Thuận', solar: 91, wind: 82, tidal: 68, h2Score: 87, lat:11.09, lng:107.91 },
  { name:'Hải Phòng', solar: 68, wind: 74, tidal: 88, h2Score: 82, lat:20.86, lng:106.68 },
  { name:'Đà Nẵng', solar: 85, wind: 76, tidal: 80, h2Score: 85, lat:16.05, lng:108.21 },
  { name:'Quảng Ninh', solar: 62, wind: 79, tidal: 91, h2Score: 80, lat:21.09, lng:107.29 },
];

const AI_LOGS = [
  { time:'00:02', msg:'Excess wind energy detected — rerouting 180 kWh to electrolysis unit 3', type:'route' },
  { time:'00:15', msg:'Solar efficiency dropping 8% — pre-loading hydrogen storage to 87%', type:'store' },
  { time:'00:31', msg:'Grid demand spike predicted at 08:00 — activating reserve H₂ cells', type:'predict' },
  { time:'00:44', msg:'Tidal unit 2 output optimal — syncing with main grid', type:'sync' },
  { time:'01:02', msg:'Hydrogen vehicle fleet refuel complete — 34 buses, 128 taxis', type:'mobility' },
  { time:'01:18', msg:'Cloud cover forecast 40% tomorrow — increasing storage target to 91%', type:'weather' },
  { time:'01:35', msg:'CO₂ reduction milestone: 12,400 kg saved today', type:'carbon' },
  { time:'01:52', msg:'Wind turbine array efficiency at 94.2% — peak performance mode', type:'optimize' },
];

const VEHICLES = [
  { type:'Hydrogen Buses', icon:'🚌', count:34, co2Saved:8.4, fuelSave:62, range:380 },
  { type:'Hydrogen Trucks', icon:'🚛', count:18, co2Saved:14.2, fuelSave:58, range:520 },
  { type:'Hydrogen Trains', icon:'🚆', count:6, co2Saved:22.1, fuelSave:71, range:800 },
  { type:'Hydrogen Taxis', icon:'🚕', count:128, co2Saved:3.2, fuelSave:55, range:320 },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function GlassCard({ children, className='', glow=C.cyan, style={} }) {
  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden ${className}`}
      style={{
        background:'rgba(0,20,30,0.7)',
        border:`1px solid ${glow}22`,
        boxShadow:`0 0 24px ${glow}0d, inset 0 1px 0 ${glow}18`,
        backdropFilter:'blur(12px)',
        ...style
      }}>
      <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{background:`linear-gradient(90deg,transparent,${glow}66,transparent)`}}/>
      {children}
    </div>
  );
}

function NeonBadge({ label, color=C.cyan }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold"
      style={{background:`${color}18`,border:`1px solid ${color}44`,color}}>
      {label}
    </span>
  );
}

function AnimCounter({ value, unit='', color=C.cyan, decimals=0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = parseFloat(value);
    const step = end / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(t); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return (
    <span className="font-orbitron font-black text-2xl" style={{color}}>
      {display.toFixed(decimals)}<span className="text-sm ml-1 opacity-70">{unit}</span>
    </span>
  );
}

function EnergyFlowDiagram() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p+1)%100), 50);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { id:'solar', label:'Solar', icon:'☀️', x:80, y:60, color:C.gold },
    { id:'wind', label:'Wind', icon:'💨', x:80, y:160, color:C.cyan },
    { id:'tidal', label:'Tidal', icon:'🌊', x:80, y:260, color:C.blue },
    { id:'grid', label:'AI Grid', icon:'⚡', x:240, y:160, color:C.green },
    { id:'electro', label:'Electrolysis', icon:'⚗️', x:400, y:160, color:C.purple },
    { id:'tank', label:'H₂ Tank', icon:'🔵', x:540, y:160, color:C.teal },
    { id:'vehicle', label:'Mobility', icon:'🚌', x:680, y:160, color:C.orange },
  ];

  const edges = [
    { from:[80,60], to:[240,160], color:C.gold },
    { from:[80,160], to:[240,160], color:C.cyan },
    { from:[80,260], to:[240,160], color:C.blue },
    { from:[240,160], to:[400,160], color:C.green },
    { from:[400,160], to:[540,160], color:C.purple },
    { from:[540,160], to:[680,160], color:C.teal },
  ];

  return (
    <div className="relative w-full overflow-x-auto" style={{minHeight:320}}>
      <svg width="780" height="320" viewBox="0 0 780 320" className="mx-auto">
        <defs>
          {edges.map((e,i) => (
            <linearGradient key={i} id={`edgeGrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={e.color} stopOpacity="0.1"/>
              <stop offset={`${pulse}%`} stopColor={e.color} stopOpacity="0.9"/>
              <stop offset="100%" stopColor={e.color} stopOpacity="0.1"/>
            </linearGradient>
          ))}
        </defs>
        {/* Edge lines */}
        {edges.map((e,i) => (
          <g key={i}>
            <line x1={e.from[0]+30} y1={e.from[1]+20} x2={e.to[0]+30} y2={e.to[1]+20}
              stroke={`url(#edgeGrad${i})`} strokeWidth="3" strokeLinecap="round"/>
            {/* Animated pulse dot */}
            <circle r="4" fill={e.color} style={{filter:`drop-shadow(0 0 6px ${e.color})`}}>
              <animateMotion dur={`${1.5+i*0.3}s`} repeatCount="indefinite" path={`M${e.from[0]+30},${e.from[1]+20} L${e.to[0]+30},${e.to[1]+20}`}/>
            </circle>
          </g>
        ))}
        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <rect x="0" y="0" width="60" height="40" rx="10"
              fill="rgba(0,20,30,0.8)" stroke={n.color} strokeWidth="1.5"
              style={{filter:`drop-shadow(0 0 8px ${n.color}44)`}}/>
            <text x="30" y="14" textAnchor="middle" fontSize="14">{n.icon}</text>
            <text x="30" y="32" textAnchor="middle" fill={n.color} fontSize="9"
              fontFamily="monospace" fontWeight="bold">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function HydrogenTank({ level=72 }) {
  const [anim, setAnim] = useState(level);
  useEffect(() => {
    const t = setInterval(() => setAnim(v => v + (Math.random()-0.5) * 0.4), 2000);
    return () => clearInterval(t);
  }, [level]);
  const h = Math.min(100, Math.max(0, anim));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-40 rounded-2xl overflow-hidden"
        style={{border:`2px solid ${C.cyan}44`,background:'rgba(0,20,30,0.9)'}}>
        <div className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
          style={{
            height:`${h}%`,
            background:`linear-gradient(180deg,${C.cyan}88,${C.blue}cc)`,
            boxShadow:`0 -4px 20px ${C.cyan}66`
          }}/>
        {/* Bubbles */}
        {[20,45,70].map(x => (
          <div key={x} className="absolute w-1.5 h-1.5 rounded-full opacity-60"
            style={{
              left:`${x}%`, bottom:`${h}%`,
              background:C.cyan,
              animation:`float${x} 2s infinite`,
              animationDelay:`${x/100}s`
            }}/>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-orbitron text-lg font-black" style={{color:C.cyan,textShadow:`0 0 10px ${C.cyan}`}}>
            {h.toFixed(0)}%
          </span>
        </div>
        {/* H2 label */}
        <div className="absolute top-2 left-0 right-0 text-center font-mono text-xs font-bold"
          style={{color:C.teal}}>H₂</div>
      </div>
      <div className="text-xs font-mono text-center" style={{color:'#4caf50'}}>Storage Tank</div>
    </div>
  );
}

const CustomTT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'rgba(0,20,30,0.95)',border:`1px solid ${C.cyan}33`,borderRadius:12,padding:'8px 12px'}}>
      <div style={{color:C.cyan,fontSize:11,fontFamily:'monospace',marginBottom:4}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color||p.stroke,fontSize:11,fontFamily:'monospace'}}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
      ))}
    </div>
  );
};

// ── HydroGrid pages ────────────────────────────────────────────────────────────
function OverviewDashboard() {
  const [live, setLive] = useState({
    totalRenewable: 1284, solar: 487, wind: 312, tidal: 98,
    h2Produced: 8.4, h2Storage: 72, co2Saved: 12.4,
    vehicles: 186, gridEff: 94.2, carbonScore: 78
  });
  const [energyHistory] = useState(() => genEnergyHistory(24));
  const [weeklyData] = useState(() => genWeeklyData());

  useEffect(() => {
    const t = setInterval(() => {
      setLive(v => ({
        totalRenewable: +(v.totalRenewable + rand(-20,20)).toFixed(0),
        solar: +(v.solar + rand(-15,15)).toFixed(0),
        wind: +(v.wind + rand(-12,12)).toFixed(0),
        tidal: +(v.tidal + rand(-5,5)).toFixed(0),
        h2Produced: +(v.h2Produced + rand(-0.2,0.3)).toFixed(1),
        h2Storage: Math.min(100, Math.max(0, v.h2Storage + rand(-0.3,0.4))),
        co2Saved: +(v.co2Saved + rand(0,0.05)).toFixed(1),
        vehicles: v.vehicles, gridEff: +(v.gridEff + rand(-0.5,0.5)).toFixed(1),
        carbonScore: Math.min(100, +(v.carbonScore + rand(-0.2,0.3)).toFixed(1)),
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    { label:'Total Renewable', value:live.totalRenewable, unit:'kWh', color:C.green, icon:'⚡' },
    { label:'Solar Output', value:live.solar, unit:'kWh', color:C.gold, icon:'☀️' },
    { label:'Wind Output', value:live.wind, unit:'kWh', color:C.cyan, icon:'💨' },
    { label:'Tidal Output', value:live.tidal, unit:'kWh', color:C.blue, icon:'🌊' },
    { label:'H₂ Produced', value:live.h2Produced, unit:'kg', color:C.teal, icon:'⚗️' },
    { label:'H₂ Storage', value:live.h2Storage.toFixed(0), unit:'%', color:C.purple, icon:'🔵' },
    { label:'CO₂ Saved', value:live.co2Saved, unit:'t', color:C.green, icon:'🌿' },
    { label:'Grid Efficiency', value:live.gridEff, unit:'%', color:C.cyan, icon:'📡' },
    { label:'Vehicles Served', value:live.vehicles, unit:'units', color:C.orange, icon:'🚌' },
    { label:'Carbon Score', value:live.carbonScore.toFixed(0), unit:'/100', color:C.teal, icon:'🏆' },
  ];

  return (
    <div className="space-y-6">
      {/* Vietnam Energy Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{height:160}}>
        <div className="absolute inset-0 grid grid-cols-5 gap-0">
          {['/images/1778077904969_image.png','/images/1778077917090_image.png','/images/1778077932470_image.png','/images/1778077575754_image.png','/images/1778077743896_image.png'].map((src,i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={src} alt="Vietnam" className="w-full h-full object-cover opacity-40" style={{filter:'saturate(1.2) hue-rotate(40deg)'}}/>
            </div>
          ))}
        </div>
        <div className="absolute inset-0" style={{background:'linear-gradient(90deg,rgba(0,10,20,0.9) 0%,rgba(0,20,30,0.5) 50%,rgba(0,10,20,0.9) 100%)'}}/>
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="font-orbitron text-2xl font-black" style={{color:C.cyan,textShadow:`0 0 18px ${C.cyan}`}}>HydroGrid AI — Vietnam</div>
          <div className="font-mono text-sm mt-1" style={{color:C.teal}}>Hydrogen Energy & Renewable Intelligence Operating System</div>
          <div className="flex items-center gap-4 mt-3">
            <NeonBadge label="SOLAR ☀️ NINH THUẬN" color={C.gold}/>
            <NeonBadge label="WIND 💨 COASTAL" color={C.cyan}/>
            <NeonBadge label="TIDAL 🌊 HẢI PHÒNG" color={C.blue}/>
            <NeonBadge label="H₂ ⚗️ ACTIVE" color={C.teal}/>
          </div>
        </div>
      </div>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map(k => (
          <GlassCard key={k.label} glow={k.color} className="flex flex-col items-center gap-1 py-4">
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="font-orbitron text-xl font-black" style={{color:k.color}}>
              {k.value}{k.unit && <span className="text-xs ml-0.5 opacity-60">{k.unit}</span>}
            </div>
            <div className="text-xs font-mono text-center" style={{color:'#4caf50'}}>{k.label}</div>
            {/* Mini pulse bar */}
            <div className="w-full h-1 rounded-full mt-1 overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
              <div className="h-full rounded-full" style={{
                width:`${Math.random()*40+50}%`,
                background:`linear-gradient(90deg,${k.color}88,${k.color})`,
                boxShadow:`0 0 6px ${k.color}`,
                animation:'pulseWidth 2s ease-in-out infinite'
              }}/>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Energy Flow */}
      <GlassCard glow={C.cyan}>
        <div className="font-orbitron text-sm font-bold mb-4" style={{color:C.cyan}}>
          ⚡ LIVE ENERGY FLOW — AI-OPTIMIZED ROUTING
        </div>
        <EnergyFlowDiagram />
      </GlassCard>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard glow={C.green}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.green}}>24H ENERGY GENERATION</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={energyHistory}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.gold} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.cyan} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#00ff8808"/>
              <XAxis dataKey="time" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <Tooltip content={<CustomTT/>}/>
              <Area type="monotone" dataKey="solar" stroke={C.gold} fill="url(#solarGrad)" strokeWidth={2} name="Solar kWh"/>
              <Area type="monotone" dataKey="wind" stroke={C.cyan} fill="url(#windGrad)" strokeWidth={2} name="Wind kWh"/>
              <Area type="monotone" dataKey="tidal" stroke={C.blue} fill={`${C.blue}22`} strokeWidth={2} name="Tidal kWh"/>
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard glow={C.purple}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.purple}}>WEEKLY PERFORMANCE</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#7c4dff08"/>
              <XAxis dataKey="day" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <Tooltip content={<CustomTT/>}/>
              <Bar dataKey="renewable" fill={C.green} name="Renewable kWh" radius={[4,4,0,0]}/>
              <Bar dataKey="hydrogen" fill={C.cyan} name="H₂ Prod kg" radius={[4,4,0,0]}/>
              <Bar dataKey="co2Saved" fill={C.teal} name="CO₂ Saved kg" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Region suitability */}
      <GlassCard glow={C.teal}>
        <div className="font-orbitron text-xs font-bold mb-4" style={{color:C.teal}}>🗺 VIETNAM HYDROGEN SUITABILITY — TOP REGIONS</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {VIETNAM_HYDRO_REGIONS.map(r => (
            <div key={r.name} className="rounded-xl p-3 space-y-2"
              style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${C.teal}22`}}>
              <div className="font-orbitron text-xs font-bold" style={{color:C.teal}}>{r.name}</div>
              {[['Solar',r.solar,C.gold],['Wind',r.wind,C.cyan],['Tidal',r.tidal,C.blue],['H₂ Score',r.h2Score,C.green]].map(([l,v,c]) => (
                <div key={l}>
                  <div className="flex justify-between text-xs font-mono mb-0.5">
                    <span style={{color:'#4caf50'}}>{l}</span>
                    <span style={{color:c}}>{v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{width:`${v}%`,background:`linear-gradient(90deg,${c}88,${c})`,boxShadow:`0 0 4px ${c}`}}/>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function RenewableMonitor() {
  const [mode, setMode] = useState('sunny');
  const [live, setLive] = useState({ solar:487, wind:312, tidal:98, util:84 });
  const modes = { sunny:{solar:487,wind:180,tidal:98}, rainy:{solar:120,wind:280,tidal:120}, cloudy:{solar:210,wind:250,tidal:105} };

  useEffect(() => {
    const base = modes[mode];
    setLive({ solar:base.solar+randInt(-30,30), wind:base.wind+randInt(-30,30), tidal:base.tidal+randInt(-10,10), util:randInt(72,95) });
    const t = setInterval(() => setLive(v => ({
      solar: Math.max(0, v.solar + rand(-20,20)),
      wind: Math.max(0, v.wind + rand(-15,15)),
      tidal: Math.max(0, v.tidal + rand(-8,8)),
      util: Math.min(100, Math.max(60, v.util + rand(-2,2))),
    })), 1800);
    return () => clearInterval(t);
  }, [mode]);

  const hourly = Array.from({length:12},(_,i)=>({
    hour:`${i*2}:00`,
    solar: Math.max(0,Math.sin((i-3)*Math.PI/6)*(modes[mode].solar||0)+rand(-30,30)),
    wind: modes[mode].wind + rand(-40,40),
    tidal: modes[mode].tidal + rand(-15,15),
  }));

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <GlassCard glow={C.gold}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="font-orbitron text-sm font-bold" style={{color:C.gold}}>🌤 SIMULATION MODE</div>
          {['sunny','cloudy','rainy'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-xl text-xs font-orbitron font-bold uppercase transition-all"
              style={mode===m
                ? {background:`${C.gold}22`,border:`1px solid ${C.gold}`,color:C.gold,boxShadow:`0 0 12px ${C.gold}44`}
                : {background:'rgba(0,20,30,0.6)',border:`1px solid ${C.gold}22`,color:'#4caf50'}}>
              {m==='sunny'?'☀️':m==='cloudy'?'🌥':'🌧'} {m}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Live meters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label:'Solar Panels', val:live.solar.toFixed(0), unit:'kWh', color:C.gold, icon:'☀️', max:600, detail:'24 panel arrays · Ninh Thuận' },
          { label:'Wind Turbines', val:live.wind.toFixed(0), unit:'kWh', color:C.cyan, icon:'💨', max:400, detail:'18 turbines · Coastal Zone' },
          { label:'Tidal Energy', val:live.tidal.toFixed(0), unit:'kWh', color:C.blue, icon:'🌊', max:160, detail:'8 tidal units · Hải Phòng' },
          { label:'Utilization', val:live.util.toFixed(1), unit:'%', color:C.green, icon:'📊', max:100, detail:'Overall grid utilization' },
        ].map(s => (
          <GlassCard key={s.label} glow={s.color}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="font-orbitron text-xl font-black" style={{color:s.color}}>{s.val}<span className="text-sm ml-1 opacity-60">{s.unit}</span></div>
            <div className="font-orbitron text-xs font-bold mt-1" style={{color:s.color}}>{s.label}</div>
            <div className="text-xs font-mono mt-0.5" style={{color:'#4caf50'}}>{s.detail}</div>
            <div className="h-2 rounded-full overflow-hidden mt-3" style={{background:'rgba(255,255,255,0.06)'}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{width:`${(parseFloat(s.val)/s.max)*100}%`,background:`linear-gradient(90deg,${s.color}88,${s.color})`,boxShadow:`0 0 8px ${s.color}`}}/>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Chart */}
      <GlassCard glow={C.cyan}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.cyan}}>12H RENEWABLE GENERATION — {mode.toUpperCase()} CONDITIONS</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={hourly}>
            <defs>
              <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={0.5}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient>
              <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.cyan} stopOpacity={0.5}/><stop offset="95%" stopColor={C.cyan} stopOpacity={0}/></linearGradient>
              <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.5}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00e5ff06"/>
            <XAxis dataKey="hour" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Legend formatter={v=><span style={{color:'#81c784',fontSize:10}}>{v}</span>}/>
            <Area type="monotone" dataKey="solar" stroke={C.gold} fill="url(#sg2)" strokeWidth={2} name="Solar kWh"/>
            <Area type="monotone" dataKey="wind" stroke={C.cyan} fill="url(#wg2)" strokeWidth={2} name="Wind kWh"/>
            <Area type="monotone" dataKey="tidal" stroke={C.blue} fill="url(#tg2)" strokeWidth={2} name="Tidal kWh"/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function WeatherPrediction() {
  const [showWeatherAI, setShowWeatherAI] = useState(false);
  const forecast = [
    { day:'Today', icon:'☀️', temp:33, wind:14, cloud:15, rain:5, solarEff:94, windEff:72 },
    { day:'Tomorrow', icon:'🌥', temp:31, wind:19, cloud:45, rain:22, solarEff:74, windEff:84 },
    { day:'Wed', icon:'🌧', temp:28, wind:22, cloud:80, rain:72, solarEff:38, windEff:91 },
    { day:'Thu', icon:'⛈', temp:26, wind:31, cloud:95, rain:88, solarEff:18, windEff:96 },
    { day:'Fri', icon:'🌤', temp:30, wind:16, cloud:30, rain:15, solarEff:86, windEff:78 },
    { day:'Sat', icon:'☀️', temp:34, wind:12, cloud:10, rain:3, solarEff:97, windEff:68 },
    { day:'Sun', icon:'☀️', temp:35, wind:10, cloud:8, rain:2, solarEff:98, windEff:62 },
  ];

  const aiRecs = [
    { icon:'⚡', msg:'High wind tonight — optimize turbine routing for peak output', color:C.cyan },
    { icon:'☁️', msg:'Cloudy Wednesday — increase hydrogen storage target to 90% by Tuesday', color:C.gold },
    { icon:'🌧', msg:'Storm Thursday — activate grid protection protocols and backup H₂ reserve', color:C.orange },
    { icon:'☀️', msg:'Excellent solar weekend — schedule electrolysis maintenance Sunday morning', color:C.green },
    { icon:'📉', msg:'Solar efficiency drops 56% on Wednesday — pre-charge battery banks now', color:C.red },
  ];

  return (
    <div className="space-y-5">
      {/* 7-day forecast */}
      <GlassCard glow={C.cyan}>
        <div className="font-orbitron text-sm font-bold mb-4" style={{color:C.cyan}}>🌤 7-DAY AI WEATHER FORECAST — NINH THUẬN ENERGY ZONE</div>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((d,i) => (
            <div key={d.day} className="flex flex-col items-center gap-1 p-2 rounded-xl"
              style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${i===0?C.cyan:'rgba(0,229,255,0.1)'}`}}>
              <div className="text-xs font-orbitron font-bold" style={{color:i===0?C.cyan:'#4caf50'}}>{d.day}</div>
              <div className="text-2xl">{d.icon}</div>
              <div className="text-sm font-orbitron font-black" style={{color:'#e8f5e9'}}>{d.temp}°C</div>
              <div className="text-xs font-mono" style={{color:C.cyan}}>{d.wind}km/h</div>
              <div className="text-xs font-mono" style={{color:'#4caf50'}}>{d.rain}% 🌧</div>
              <div className="w-full">
                <div className="text-xs font-mono mb-0.5 text-center" style={{color:C.gold,fontSize:'9px'}}>☀{d.solarEff}%</div>
                <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                  <div style={{width:`${d.solarEff}%`,height:'100%',background:`linear-gradient(90deg,${C.gold}88,${C.gold})`}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI recommendations */}
      <GlassCard glow={C.green}>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="font-orbitron text-sm font-bold" style={{color:C.green}}>🤖 FRIDAY AI WEATHER RECOMMENDATIONS</div>
          <button onClick={() => setShowWeatherAI(v => !v)} className="px-3 py-1.5 rounded-xl text-xs font-orbitron" style={{background:`${C.green}18`,border:`1px solid ${C.green}44`,color:C.green}}>
            {showWeatherAI ? 'Hide' : 'Generate'}
          </button>
        </div>
        {!showWeatherAI ? (
          <div className="p-3 rounded-xl text-xs font-mono" style={{color:'#81c784',background:'rgba(0,20,30,0.6)',border:`1px solid ${C.green}22`}}>AI is idle. Ask FRIDAY or click Generate to create recommendations from current weather data.</div>
        ) : <div className="space-y-3">
          {aiRecs.map((r,i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
              style={{background:`${r.color}0a`,border:`1px solid ${r.color}33`}}>
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div>
                <div className="text-xs font-mono" style={{color:r.color}}>{r.msg}</div>
              </div>
              <NeonBadge label="AI" color={r.color}/>
            </div>
          ))}
        </div>}
      </GlassCard>

      {/* Solar/Wind efficiency forecast chart */}
      <GlassCard glow={C.gold}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.gold}}>SOLAR & WIND EFFICIENCY FORECAST</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffb30006"/>
            <XAxis dataKey="day" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false} domain={[0,100]}/>
            <Tooltip content={<CustomTT/>}/>
            <Line type="monotone" dataKey="solarEff" stroke={C.gold} strokeWidth={2} dot={{fill:C.gold,r:3}} name="Solar Eff %"/>
            <Line type="monotone" dataKey="windEff" stroke={C.cyan} strokeWidth={2} dot={{fill:C.cyan,r:3}} name="Wind Eff %"/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function HydrogenProduction() {
  const [active, setActive] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [stats, setStats] = useState({ rate:8.4, water:126, energy:340, efficiency:87.3, tank:72 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setStats(v => {
        const newTank = Math.min(100, v.tank + (autoMode ? rand(0.1,0.3) : rand(0,0.15)));
        const leakWarning = Math.random() > 0.985;
        if (leakWarning) setAlerts(a => [{ time:new Date().toLocaleTimeString(), msg:'Minor pressure variance detected in Line B — auto-correcting', color:C.orange },...a.slice(0,4)]);
        return {
          rate: Math.max(0, v.rate + rand(-0.3,0.4)),
          water: Math.max(0, v.water + rand(-5,8)),
          energy: Math.max(0, v.energy + rand(-15,20)),
          efficiency: Math.min(99, Math.max(75, v.efficiency + rand(-0.5,0.5))),
          tank: newTank,
        };
      });
    }, 1500);
    return () => clearInterval(t);
  }, [active, autoMode]);

  const history = Array.from({length:20},(_,i)=>({
    t:i, rate:rand(6,12), energy:rand(280,420), efficiency:rand(82,96)
  }));

  return (
    <div className="space-y-5">
      {/* Controls */}
      <GlassCard glow={C.teal}>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="font-orbitron text-sm font-bold" style={{color:C.teal}}>⚗️ ELECTROLYSIS CONTROL PANEL</div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono" style={{color:'#4caf50'}}>Electrolysis Unit</span>
            <button onClick={() => setActive(v=>!v)}
              className="w-14 h-7 rounded-full relative transition-all"
              style={{background:active?`linear-gradient(90deg,${C.teal},${C.cyan})`:'rgba(0,20,30,0.8)',border:`1px solid ${active?C.teal:C.red}44`,boxShadow:active?`0 0 12px ${C.teal}44`:'none'}}>
              <div className="absolute top-0.5 w-6 h-6 rounded-full transition-all"
                style={{background:'white',left:active?'calc(100% - 1.75rem)':'0.125rem',boxShadow:`0 0 6px ${active?C.teal:C.red}`}}/>
            </button>
            <NeonBadge label={active?'ACTIVE':'OFFLINE'} color={active?C.teal:C.red}/>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono" style={{color:'#4caf50'}}>AI Auto Mode</span>
            <button onClick={() => setAutoMode(v=>!v)}
              className="w-14 h-7 rounded-full relative transition-all"
              style={{background:autoMode?`linear-gradient(90deg,${C.green},${C.teal})`:'rgba(0,20,30,0.8)',border:`1px solid ${autoMode?C.green:'#4caf5044'}`,boxShadow:autoMode?`0 0 12px ${C.green}44`:'none'}}>
              <div className="absolute top-0.5 w-6 h-6 rounded-full transition-all"
                style={{background:'white',left:autoMode?'calc(100% - 1.75rem)':'0.125rem'}}/>
            </button>
            <NeonBadge label={autoMode?'AI AUTO':'MANUAL'} color={autoMode?C.green:C.gold}/>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="space-y-3">
          {[
            { label:'H₂ Production Rate', val:`${stats.rate.toFixed(1)} kg/h`, color:C.teal, icon:'⚗️' },
            { label:'Water Consumption', val:`${stats.water.toFixed(0)} L/h`, color:C.blue, icon:'💧' },
            { label:'Energy Input', val:`${stats.energy.toFixed(0)} kWh`, color:C.gold, icon:'⚡' },
            { label:'Production Efficiency', val:`${stats.efficiency.toFixed(1)}%`, color:C.green, icon:'📈' },
          ].map(s => (
            <GlassCard key={s.label} glow={s.color} className="py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <div className="font-orbitron text-lg font-black" style={{color:s.color}}>{s.val}</div>
                  <div className="text-xs font-mono" style={{color:'#4caf50'}}>{s.label}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tank visualization */}
        <GlassCard glow={C.cyan} className="flex flex-col items-center justify-center">
          <div className="font-orbitron text-xs font-bold mb-4 text-center" style={{color:C.cyan}}>HYDROGEN STORAGE TANK</div>
          <HydrogenTank level={stats.tank}/>
          <div className="mt-4 grid grid-cols-2 gap-2 w-full">
            <div className="text-center p-2 rounded-xl" style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${C.cyan}22`}}>
              <div className="text-xs font-mono" style={{color:'#4caf50'}}>Pressure</div>
              <div className="font-orbitron text-sm font-bold" style={{color:C.cyan}}>350 bar</div>
            </div>
            <div className="text-center p-2 rounded-xl" style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${C.cyan}22`}}>
              <div className="text-xs font-mono" style={{color:'#4caf50'}}>Temp</div>
              <div className="font-orbitron text-sm font-bold" style={{color:C.gold}}>-253°C</div>
            </div>
          </div>
        </GlassCard>

        {/* Alerts */}
        <GlassCard glow={C.orange}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.orange}}>⚠️ SAFETY ALERTS</div>
          <div className="space-y-2">
            {alerts.length === 0 && (
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{background:`${C.green}0a`,border:`1px solid ${C.green}33`}}>
                <CheckCircle size={14} color={C.green}/>
                <span className="text-xs font-mono" style={{color:C.green}}>All systems nominal — no alerts</span>
              </div>
            )}
            {alerts.map((a,i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl" style={{background:`${a.color}0a`,border:`1px solid ${a.color}33`}}>
                <AlertTriangle size={12} color={a.color} className="flex-shrink-0 mt-0.5"/>
                <div>
                  <div className="text-xs font-mono" style={{color:a.color}}>{a.msg}</div>
                  <div className="text-xs font-mono mt-0.5" style={{color:'#4caf50',fontSize:'10px'}}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="font-orbitron text-xs font-bold mb-2" style={{color:C.teal}}>AI OPTIMIZATION</div>
            <div className="text-xs font-mono p-2 rounded-xl" style={{background:`${C.teal}0a`,border:`1px solid ${C.teal}22`,color:C.teal}}>
              {autoMode ? '✅ AI is optimizing production based on renewable surplus and weather forecast' : '⚠️ Manual mode active — AI optimization paused'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Production chart */}
      <GlassCard glow={C.green}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.green}}>LIVE PRODUCTION METRICS</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff8806"/>
            <XAxis dataKey="t" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Line type="monotone" dataKey="rate" stroke={C.teal} strokeWidth={2} dot={false} name="H₂ Rate kg/h"/>
            <Line type="monotone" dataKey="efficiency" stroke={C.green} strokeWidth={2} dot={false} name="Efficiency %"/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function LowCarbonMobility() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const monthlyData = Array.from({length:12},(_,i)=>({
    month:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    buses: randInt(20,50), trucks: randInt(10,30), trains: randInt(3,10), taxis: randInt(80,180),
    co2Saved: randInt(5000,20000),
  }));

  const compData = [
    { name:'Diesel Bus', co2:120, cost:100, range:380 },
    { name:'H₂ Bus', co2:0, cost:68, range:380 },
    { name:'Diesel Truck', co2:220, cost:100, range:520 },
    { name:'H₂ Truck', co2:0, cost:72, range:520 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {VEHICLES.map(v => (
          <GlassCard key={v.type} glow={C.orange}
            className="cursor-pointer transition-all hover:scale-105"
            style={selectedVehicle===v.type?{border:`1px solid ${C.orange}`,boxShadow:`0 0 20px ${C.orange}33`}:{}}
            onClick={() => setSelectedVehicle(selectedVehicle===v.type?null:v.type)}>
            <div className="text-4xl mb-3 text-center">{v.icon}</div>
            <div className="font-orbitron text-sm font-bold text-center" style={{color:C.orange}}>{v.type}</div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span style={{color:'#4caf50'}}>Units Active</span>
                <span style={{color:C.orange}}>{v.count}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span style={{color:'#4caf50'}}>CO₂ Saved/day</span>
                <span style={{color:C.green}}>{v.co2Saved}t</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span style={{color:'#4caf50'}}>Fuel Savings</span>
                <span style={{color:C.cyan}}>{v.fuelSave}%</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span style={{color:'#4caf50'}}>Range</span>
                <span style={{color:C.gold}}>{v.range}km</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Emission comparison */}
      <GlassCard glow={C.green}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.green}}>H₂ vs DIESEL EMISSIONS COMPARISON (CO₂ g/km)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={compData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff8806"/>
            <XAxis dataKey="name" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Bar dataKey="co2" fill={C.red} name="CO₂ g/km" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Monthly deployment */}
      <GlassCard glow={C.cyan}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.cyan}}>MONTHLY H₂ VEHICLE DEPLOYMENT — 2025</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00e5ff06"/>
            <XAxis dataKey="month" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Bar dataKey="buses" stackId="a" fill={C.orange} name="Buses"/>
            <Bar dataKey="trucks" stackId="a" fill={C.gold} name="Trucks"/>
            <Bar dataKey="trains" stackId="a" fill={C.teal} name="Trains"/>
            <Bar dataKey="taxis" stackId="a" fill={C.cyan} name="Taxis" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function AIEnergyOptimization() {
  const [logs, setLogs] = useState([]);
  const [showDecisionLog, setShowDecisionLog] = useState(false);
  const [score, setScore] = useState(91.4);
  const [routing, setRouting] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setScore(v => Math.min(99, Math.max(80, v + rand(-0.5,0.7))));
      const newLogs = [
        'Excess solar detected — redirecting 240kWh to electrolysis unit 1',
        'Grid frequency optimized — delta 0.02Hz from nominal',
        'H₂ storage nearing 90% — reducing production rate by 12%',
        'Wind variability spike — activating load balancing protocol',
        'Tidal output stable — assigning to municipal grid sector B',
        'AI routing efficiency improved to 94.8% — all paths optimized',
        'Demand forecast updated — preparing for morning peak (07:30)',
      ];
      if (showDecisionLog && Math.random() > 0.7) {
        const msg = newLogs[randInt(0, newLogs.length)];
        setLogs(prev => [{ time:new Date().toLocaleTimeString(), msg, type:'ai' }, ...prev.slice(0,9)]);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [showDecisionLog]);

  const radarData = [
    { metric:'Solar Opt', value:88 },
    { metric:'Wind Opt', value:92 },
    { metric:'H₂ Prod', value:87 },
    { metric:'Grid Bal', value:94 },
    { metric:'Mobility', value:79 },
    { metric:'Storage', value:91 },
  ];

  const routingData = Array.from({length:24},(_,i)=>({
    hour:`${String(i).padStart(2,'0')}:00`,
    efficiency: rand(82,98),
    co2Saved: rand(40,120),
    hProd: rand(5,15),
  }));

  return (
    <div className="space-y-5">
      {/* Score + Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glow={C.green} className="flex flex-col items-center justify-center py-6">
          <div className="text-4xl mb-2">🤖</div>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.green}}>AI OPTIMIZATION SCORE</div>
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#0d2e14" strokeWidth="8"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke={C.green} strokeWidth="8"
                strokeDasharray={`${(score/100)*314} 314`} strokeDashoffset="78.5"
                strokeLinecap="round" style={{filter:`drop-shadow(0 0 8px ${C.green})`}}/>
              <text x="60" y="65" textAnchor="middle" fill={C.green} fontSize="20" fontWeight="900" fontFamily="monospace">{score.toFixed(0)}%</text>
            </svg>
          </div>
          <NeonBadge label="OPTIMAL" color={C.green}/>
        </GlassCard>

        <GlassCard glow={C.purple}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.purple}}>AI CAPABILITY RADAR</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={`${C.purple}33`}/>
              <PolarAngleAxis dataKey="metric" tick={{fill:'#4caf50',fontSize:9}}/>
              <PolarRadiusAxis domain={[0,100]} tick={false}/>
              <Radar dataKey="value" stroke={C.purple} fill={`${C.purple}22`} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard glow={C.cyan}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.cyan}}>ROUTING STATUS</div>
          <div className="space-y-3">
            {[
              {label:'Solar → Grid', status:true, val:'487 kWh'},
              {label:'Wind → Electrolysis', status:true, val:'180 kWh'},
              {label:'Tidal → Grid', status:true, val:'98 kWh'},
              {label:'H₂ → Mobility', status:routing, val:'8.4 kg/h'},
              {label:'Grid Balancing', status:true, val:'94.2%'},
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between p-2 rounded-xl"
                style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${r.status?C.green:C.red}22`}}>
                <div className="flex items-center gap-2">
                  {r.status ? <CheckCircle size={12} color={C.green}/> : <XCircle size={12} color={C.red}/>}
                  <span className="text-xs font-mono" style={{color:'#4caf50'}}>{r.label}</span>
                </div>
                <span className="text-xs font-orbitron font-bold" style={{color:r.status?C.cyan:C.red}}>{r.val}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Live AI log */}
      <GlassCard glow={C.green}>
        <div className="flex items-center justify-between mb-3 gap-3">
          <div className="font-orbitron text-xs font-bold" style={{color:C.green}}>🤖 FRIDAY AI DECISION LOG — USER CONTROLLED</div>
          <button onClick={() => { setShowDecisionLog(true); setLogs(prev => prev.length ? prev : [{ time:new Date().toLocaleTimeString(), msg:'User requested HydroGrid analysis log. Monitoring live routing data now.', type:'user' }]); }} className="px-3 py-1.5 rounded-xl text-xs font-orbitron" style={{background:`${C.green}18`,border:`1px solid ${C.green}44`,color:C.green}}>Start Log</button>
        </div>
        {!showDecisionLog ? (
          <div className="p-3 rounded-xl text-xs font-mono" style={{color:'#81c784',background:'rgba(0,20,30,0.6)',border:`1px solid ${C.green}22`}}>Decision log is idle. It will not output fake hardcoded events until you press Start Log or ask FRIDAY.</div>
        ) : <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.map((l,i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-xl transition-all"
              style={{background:`${C.green}06`,border:`1px solid ${C.green}18`,opacity:1-i*0.07}}>
              <span className="text-xs font-mono flex-shrink-0" style={{color:C.teal}}>{l.time}</span>
              <ArrowRight size={10} color={C.green} className="flex-shrink-0 mt-0.5"/>
              <span className="text-xs font-mono" style={{color:'#e8f5e9'}}>{l.msg}</span>
            </div>
          ))}
        </div>}
      </GlassCard>

      {/* Efficiency chart */}
      <GlassCard glow={C.cyan}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.cyan}}>24H AI ROUTING EFFICIENCY</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={routingData}>
            <defs>
              <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00e5ff06"/>
            <XAxis dataKey="hour" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Area type="monotone" dataKey="efficiency" stroke={C.cyan} fill="url(#effGrad)" strokeWidth={2} name="Efficiency %"/>
            <Line type="monotone" dataKey="co2Saved" stroke={C.green} strokeWidth={1.5} dot={false} name="CO₂ Saved kg"/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function EnergyAnalytics() {
  const monthly = Array.from({length:12},(_,i)=>({
    month:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    solar: randInt(8000,18000), wind: randInt(5000,12000), tidal: randInt(2000,5000),
    h2Produced: randInt(500,1500), co2Reduced: randInt(2000,8000),
  }));

  const pieData = [
    { name:'Solar', value:45, color:C.gold },
    { name:'Wind', value:32, color:C.cyan },
    { name:'Tidal', value:12, color:C.blue },
    { name:'Hydro', value:11, color:C.teal },
  ];

  const trendData = Array.from({length:24},(_,i)=>({
    month:`M${i+1}`, co2:200-i*5+rand(-10,10), renewable:20+i*2+rand(-3,3), h2:i*50+rand(-20,20)
  }));

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Energy Generated', val:'142,840 MWh', color:C.gold, icon:'⚡' },
          { label:'H₂ Produced This Year', val:'8,420 kg', color:C.teal, icon:'⚗️' },
          { label:'CO₂ Reduced', val:'48,200 t', color:C.green, icon:'🌿' },
          { label:'Carbon Neutrality', val:'78%', color:C.cyan, icon:'🏆' },
        ].map(k => (
          <GlassCard key={k.label} glow={k.color} className="text-center py-4">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="font-orbitron text-lg font-black" style={{color:k.color}}>{k.val}</div>
            <div className="text-xs font-mono mt-1" style={{color:'#4caf50'}}>{k.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly bar */}
        <GlassCard glow={C.gold}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.gold}}>MONTHLY RENEWABLE GENERATION 2025</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffb30006"/>
              <XAxis dataKey="month" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
              <Tooltip content={<CustomTT/>}/>
              <Bar dataKey="solar" stackId="a" fill={C.gold} name="Solar kWh"/>
              <Bar dataKey="wind" stackId="a" fill={C.cyan} name="Wind kWh"/>
              <Bar dataKey="tidal" stackId="a" fill={C.blue} name="Tidal kWh" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pie chart */}
        <GlassCard glow={C.cyan}>
          <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.cyan}}>ENERGY MIX BREAKDOWN</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" strokeWidth={0}>
                  {pieData.map((e,i) => (
                    <Cell key={i} fill={e.color} style={{filter:`drop-shadow(0 0 6px ${e.color}44)`}}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTT/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{background:d.color,boxShadow:`0 0 6px ${d.color}`}}/>
                  <span className="text-xs font-mono" style={{color:'#4caf50'}}>{d.name}</span>
                  <span className="text-xs font-orbitron font-bold ml-auto" style={{color:d.color}}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Long-term trend */}
      <GlassCard glow={C.green}>
        <div className="font-orbitron text-xs font-bold mb-3" style={{color:C.green}}>24-MONTH CO₂ REDUCTION TREND</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff8806"/>
            <XAxis dataKey="month" tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <YAxis tick={{fill:'#4caf50',fontSize:9}} tickLine={false}/>
            <Tooltip content={<CustomTT/>}/>
            <Line type="monotone" dataKey="co2" stroke={C.red} strokeWidth={2} dot={false} name="CO₂ Mt"/>
            <Line type="monotone" dataKey="renewable" stroke={C.green} strokeWidth={2} dot={false} name="Renewable %"/>
            <Line type="monotone" dataKey="h2" stroke={C.teal} strokeWidth={2} dot={false} name="H₂ kg×10"/>
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function HydroSettings() {
  const [settings, setSettings] = useState({
    aiMode: true, sensorSim: true, solar: true, wind: true, tidal: true,
    notifications: true, autoOptimize: true, darkMode: true,
    solarThreshold: 75, windThreshold: 60, storageTarget: 85, h2Alert: 20,
  });

  const toggle = k => setSettings(v => ({...v,[k]:!v[k]}));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard glow={C.cyan}>
          <div className="font-orbitron text-xs font-bold mb-4" style={{color:C.cyan}}>⚙️ SYSTEM TOGGLES</div>
          <div className="space-y-3">
            {[
              {key:'aiMode',label:'FRIDAY AI Auto-Optimization',color:C.green},
              {key:'sensorSim',label:'Sensor Simulation Mode',color:C.cyan},
              {key:'solar',label:'Solar Energy Source',color:C.gold},
              {key:'wind',label:'Wind Energy Source',color:C.blue},
              {key:'tidal',label:'Tidal Energy Source',color:C.teal},
              {key:'notifications',label:'Smart Alerts & Notifications',color:C.orange},
              {key:'autoOptimize',label:'Auto Grid Balancing',color:C.purple},
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between p-3 rounded-xl"
                style={{background:'rgba(0,20,30,0.6)',border:`1px solid ${s.color}18`}}>
                <span className="text-xs font-mono" style={{color:'#4caf50'}}>{s.label}</span>
                <button onClick={()=>toggle(s.key)}
                  className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
                  style={{background:settings[s.key]?`linear-gradient(90deg,${s.color}88,${s.color})`:'rgba(0,20,30,0.8)',border:`1px solid ${settings[s.key]?s.color:'rgba(255,255,255,0.1)'}`}}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                    style={{background:'white',left:settings[s.key]?'calc(100% - 1.375rem)':'0.125rem'}}/>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard glow={C.purple}>
          <div className="font-orbitron text-xs font-bold mb-4" style={{color:C.purple}}>🎛️ ENERGY THRESHOLDS</div>
          <div className="space-y-5">
            {[
              {key:'solarThreshold',label:'Solar Efficiency Threshold',unit:'%',color:C.gold,min:50,max:100},
              {key:'windThreshold',label:'Wind Min Utilization',unit:'%',color:C.cyan,min:30,max:90},
              {key:'storageTarget',label:'H₂ Storage Target',unit:'%',color:C.teal,min:60,max:100},
              {key:'h2Alert',label:'H₂ Low-Level Alert',unit:'%',color:C.red,min:5,max:40},
            ].map(s => (
              <div key={s.key}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono" style={{color:'#4caf50'}}>{s.label}</span>
                  <span className="text-xs font-orbitron font-bold" style={{color:s.color}}>{settings[s.key]}{s.unit}</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={settings[s.key]}
                  onChange={e=>setSettings(v=>({...v,[s.key]:+e.target.value}))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{accentColor:s.color,background:`linear-gradient(90deg,${s.color} ${(settings[s.key]-s.min)/(s.max-s.min)*100}%,rgba(0,20,30,0.8) 0)`}}/>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Main HydroGrid module ─────────────────────────────────────────────────────
const HYDRO_TABS = [
  { id:'overview', label:'Overview', icon:'⚡' },
  { id:'renewable', label:'Renewable Monitor', icon:'☀️' },
  { id:'weather', label:'Weather AI', icon:'🌤' },
  { id:'hydrogen', label:'H₂ Production', icon:'⚗️' },
  { id:'mobility', label:'Low-Carbon Mobility', icon:'🚌' },
  { id:'ai', label:'AI Optimization', icon:'🤖' },
  { id:'analytics', label:'Analytics', icon:'📊' },
  { id:'settings', label:'Settings', icon:'⚙️' },
];

export default function HydroGridAI({ initialSubTab }) {
  const [subTab, setSubTab] = useState(initialSubTab || 'overview');

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const pages = {
    overview: <OverviewDashboard/>,
    renewable: <RenewableMonitor/>,
    weather: <WeatherPrediction/>,
    hydrogen: <HydrogenProduction/>,
    mobility: <LowCarbonMobility/>,
    ai: <AIEnergyOptimization/>,
    analytics: <EnergyAnalytics/>,
    settings: <HydroSettings/>,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* HydroGrid Header */}
      <div className="flex-shrink-0 px-6 py-4" style={{borderBottom:`1px solid ${C.cyan}18`,background:'rgba(0,10,20,0.4)'}}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:`linear-gradient(135deg,${C.cyan},${C.blue})`,boxShadow:`0 0 16px ${C.cyan}66`}}>
              <Zap size={18} color="#020b05"/>
            </div>
            <div>
              <div className="font-orbitron text-sm font-black" style={{color:C.cyan}}>HydroGrid AI</div>
              <div className="font-mono text-xs" style={{color:C.teal,fontSize:'10px'}}>HYDROGEN ENERGY OPERATING SYSTEM</div>
            </div>
          </div>
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
            {HYDRO_TABS.map(t => (
              <button key={t.id} onClick={() => setSubTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-mono transition-all flex-shrink-0"
                style={subTab===t.id
                  ? {background:`${C.cyan}18`,border:`1px solid ${C.cyan}44`,color:C.cyan,boxShadow:`0 0 10px ${C.cyan}22`}
                  : {border:'1px solid transparent',color:'#4caf50'}}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <style>{`
          @keyframes pulseWidth { 0%,100%{opacity:0.7} 50%{opacity:1} }
          @keyframes float20 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes float45 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes float70 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
        {pages[subTab] || <OverviewDashboard/>}
      </div>
    </div>
  );
}
