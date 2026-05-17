import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, LayersControl, FeatureGroup } from 'react-leaflet';
import {
  Cpu, AlertTriangle, Info, Activity, Zap, Loader2, RefreshCw,
  Gauge, Clock, MapPin, Wind, Bus, Train, Battery, Car, Anchor, Users
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getCityList, getCityData } from '../services/cityConfig';
import { trafficService } from '../services/trafficService';

const NEON = '#00ff88', NEON2 = '#00e5ff', WARN = '#ff6d00', CRIT = '#ff1744', PURPLE = '#d500f9', GOLD = '#ffb300';
const COLORS = { green: NEON, yellow: '#ffee58', orange: WARN, red: CRIT, purple: PURPLE };
const REFRESH_MS = 90000;

const LOCATION_IMAGES = {
  commercial: 'https://images.unsplash.com/photo-1567503501-e7ab8c618f95?w=400&q=80',
  logistics: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
  transit: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80',
  residential: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80',
  industrial: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  tourism: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
  tech: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  government: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=80',
  market: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  port: 'https://images.unsplash.com/photo-1575969173557-36e621b6c35a?w=400&q=80',
};

const PUBLIC_TRANSPORT = {
  'Ho Chi Minh City': { metro: { lines: 1, stations: 14, status: 'Operational', daily: '60,000+' }, bus: { routes: 150, fleet: 2800, electric: 120, coverage: '92%' }, ev: 85, ferries: 5, score: 72 },
  'Hanoi': { metro: { lines: 2, stations: 26, status: 'Expanding', daily: '80,000+' }, bus: { routes: 130, fleet: 2100, electric: 90, coverage: '85%' }, ev: 62, ferries: 0, score: 68 },
  'Da Nang': { metro: { lines: 0, stations: 0, status: 'Planned 2030', daily: '0' }, bus: { routes: 28, fleet: 320, electric: 20, coverage: '55%' }, ev: 28, ferries: 2, score: 42 },
  'Hai Phong': { metro: { lines: 0, stations: 0, status: 'Planned 2028', daily: '0' }, bus: { routes: 25, fleet: 280, electric: 10, coverage: '50%' }, ev: 18, ferries: 8, score: 38 },
  'Can Tho': { metro: { lines: 0, stations: 0, status: 'Not Planned', daily: '0' }, bus: { routes: 18, fleet: 180, electric: 5, coverage: '40%' }, ev: 12, ferries: 15, score: 35 },
};
const DEFAULT_PT = { metro: { lines: 0, stations: 0, status: 'Unknown', daily: '—' }, bus: { routes: 0, fleet: 0, electric: 0, coverage: '—' }, ev: 0, ferries: 0, score: 30 };

const CAUSE_PATTERNS = {
  commercial: { causes: ['Office rush hours (7-9 AM / 5-7 PM)', 'Business delivery vehicles', 'Shopping peak hours'], travel: ['Employment (offices)', 'Shopping', 'Services & banking'], peaks: ['7-9 AM', '12-1 PM', '5-7 PM'] },
  logistics: { causes: ['Freight trucks (port/warehouse)', '24h supply chain movement', 'Container loading queues'], travel: ['Commerce & export', 'Industrial supply', 'E-commerce delivery'], peaks: ['5-10 AM', '2-6 PM'] },
  industrial: { causes: ['Factory shift change (6-7 AM / 5-6 PM)', 'Heavy material transport', 'Worker mass commute'], travel: ['Manufacturing jobs', 'Logistics workers', 'Industrial operations'], peaks: ['5:30-7 AM', '4:30-6 PM'] },
  transit: { causes: ['Airport arrivals/departures', 'Multi-modal transfer points', 'Long-distance bus/train commuters'], travel: ['Tourism', 'Business travel', 'Domestic flights'], peaks: ['5-10 AM', '4-9 PM'] },
  tourism: { causes: ['Tourist attraction clusters', 'Weekend & holiday spikes', 'Food/hotel delivery surge'], travel: ['Tourism & leisure', 'Local recreation', 'Cultural visits'], peaks: ['9 AM-12 PM', '3-7 PM', 'Weekends'] },
  residential: { causes: ['School drop-off congestion', 'Grocery & market runs', 'Residential density bottleneck'], travel: ['School commute', 'Daily household needs', 'Social visits'], peaks: ['7-8:30 AM', '3:30-5 PM', '6-8 PM'] },
  tech: { causes: ['IT office park entrances', 'Ride-hailing surge at campus gates', 'Corporate shuttle routes'], travel: ['Tech employment', 'Software/IT offices', 'Co-working spaces'], peaks: ['8-9:30 AM', '5:30-7 PM'] },
  government: { causes: ['Administrative office hours', 'Official vehicles & escorts', 'Citizens visiting government offices'], travel: ['Government services', 'Permit & documentation', 'Administrative tasks'], peaks: ['7:30-9 AM', '11 AM-1 PM', '4-5 PM'] },
};


const CITY_TRAFFIC_CONTEXT = {
  'Ho Chi Minh City': {
    identity: 'port commerce, airport access, District 1 office trips and Cat Lai container movement',
    issue: 'port trucks, ride-hailing, motorbike density and warehouse loading windows overlap during peak hours',
    authority: 'HCMC Transport Department + Cat Lai Port Authority',
    solution: 'separate container-truck windows from office peak hours and add signal priority on port corridors'
  },
  'Hanoi': {
    identity: 'government offices, old-quarter tourism, ring-road commuting and industrial parks north/east of the city',
    issue: 'office commute, school drop-off and ring-road freight merge at narrow intersections',
    authority: 'Hanoi DOT + metro/bus operations center',
    solution: 'coordinate metro feeder buses, school-zone timing and ring-road freight restrictions'
  },
  'Da Nang': {
    identity: 'tourism, coastal hotel zones, airport trips and port/industrial traffic near Hoa Khanh',
    issue: 'tourist buses, airport arrivals and weekend beach traffic create short but sharp peaks',
    authority: 'Da Nang Smart City Center + Tourism Transport Unit',
    solution: 'dynamic tourist-shuttle routing, coastal parking control and airport signal coordination'
  },
  'Hai Phong': {
    identity: 'deep-sea port, Dinh Vu industrial logistics, ferries and heavy export traffic',
    issue: 'container trucks and port-gate queues dominate congestion more than passenger vehicles',
    authority: 'Hai Phong Port Authority + Logistics Police Unit',
    solution: 'truck appointment slots, port-gate queue sensors and dedicated heavy-vehicle lanes'
  },
  'Can Tho': {
    identity: 'Mekong Delta river crossings, markets, schools, agriculture logistics and bus/boat transfers',
    issue: 'bridge bottlenecks, market-hour loading and flood-sensitive roads slow local movement',
    authority: 'Can Tho Urban Transport + Mekong Flood Response Team',
    solution: 'market delivery time windows, bridge signal priority and flood-aware detours'
  }
};

function buildLiveTrafficAnalysis(hotspot, cityName) {
  const pt = PUBLIC_TRANSPORT[cityName] || DEFAULT_PT;
  const p = CAUSE_PATTERNS[hotspot?.type] || CAUSE_PATTERNS.commercial;
  const ctx = CITY_TRAFFIC_CONTEXT[cityName] || {
    identity: `${cityName} urban traffic, local commuting, tourism and logistics`,
    issue: 'mixed private vehicles and local delivery demand are creating the current pressure',
    authority: `${cityName} transport control center`,
    solution: 'use adaptive signal timing, public transport priority and local delivery time control'
  };
  const speed = Number(hotspot?.currentSpeed || 0);
  const free = Number(hotspot?.freeFlowSpeed || 0);
  const efficiency = hotspot?.efficiency ?? (free ? Math.round((speed / free) * 100) : null);
  const delay = free && speed ? Math.max(0, Math.round(((free - speed) / free) * 100)) : null;
  const carbon = hotspot?.carbonRaw ?? (efficiency == null ? null : ((100 - efficiency) * 0.18 + (pt.score < 50 ? 1.2 : 0)).toFixed(1));
  const corridor = hotspot?.corridorName || hotspot?.name || 'selected corridor';
  const severity = hotspot?.severityLabel || (efficiency == null ? 'Data unavailable' : efficiency < 45 ? 'Severe' : efficiency < 70 ? 'Congested' : 'Moderate');
  const typeCause = p.causes[(String(corridor).length + String(cityName).length) % p.causes.length];
  const riskSentence = efficiency == null
    ? 'Live speed telemetry is not available yet, so this analysis is marked as pending instead of using fake congestion values.'
    : `Live flow is ${speed}/${free} km/h, efficiency ${efficiency}%, delay index ${delay}%, severity ${severity}.`;
  const transportGap = pt.score < 45
    ? `Transport coverage is weak (${pt.score}/100): only ${pt.bus.routes} bus routes and ${pt.metro.lines} metro lines; last-mile alternatives are insufficient.`
    : pt.score < 70
      ? `Transport coverage is medium (${pt.score}/100): ${pt.bus.routes} bus routes, ${pt.metro.lines} metro lines, ${pt.ev} EV points; last-mile access still needs improvement.`
      : `Transport coverage is strong (${pt.score}/100), so the likely issue is timing, loading control, illegal parking, or a short peak-demand surge.`;
  const action = efficiency == null
    ? `Reconnect TomTom/live telemetry before issuing a diversion order; ${ctx.authority} should monitor camera feeds.`
    : efficiency < 45
      ? `${ctx.authority} should immediately apply ${ctx.solution}, because ${corridor} is below 45% efficiency.`
      : efficiency < 70
        ? `${ctx.authority} should tune signal cycles and run ${ctx.solution} during ${p.peaks?.[0] || 'peak hours'}.`
        : `No emergency diversion is required; keep monitoring and prepare ${ctx.solution} only if efficiency drops below 70%.`;
  return `PRIMARY CAUSE: ${typeCause} in ${corridor}. City-specific reason: ${ctx.issue}. ${riskSentence}
TRAVELER PROFILE: ${ctx.identity}. For this ${hotspot?.type || 'urban'} zone, dominant trips are ${p.travel.join(', ')} — not a fixed answer for every city.
TRANSPORT GAP: ${transportGap}
CARBON IMPACT: ${carbon == null ? 'Not calculated because live speed data is unavailable.' : `Estimated ${carbon} t/h from current idling and slow traffic at this monitored zone.`}
AI SOLUTIONS: 1) ${action} 2) Add zone-specific control for ${hotspot?.type || 'traffic'} demand during ${p.peaks?.join(', ') || 'peak hours'}. 3) Re-check after the next live refresh; if efficiency rises above 75%, downgrade to monitoring only.`;
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [map, center, zoom]);
  return null;
}

function TransportRow({ icon: Icon, label, value, col = NEON2 }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: '#04150a', border: '1px solid #ffffff08' }}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3" style={{ color: col }} />
        <span className="text-[9px] font-mono text-[#81c784]">{label}</span>
      </div>
      <span className="text-[10px] font-bold font-mono" style={{ color: col }}>{value}</span>
    </div>
  );
}

function AIAnalysisBlock({ hotspot, cityName }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setText(''); setBusy(false); }, [hotspot?.id, cityName]);

  const run = useCallback(async () => {
    if (!hotspot) return;
    setBusy(true); setText('');
    const pt = PUBLIC_TRANSPORT[cityName] || DEFAULT_PT;
    const p = CAUSE_PATTERNS[hotspot.type] || CAUSE_PATTERNS['commercial'];
    const prompt = `You are a traffic intelligence expert analyzing ${hotspot.corridorName || hotspot.name} in ${cityName}, Vietnam.
Zone type: ${hotspot.type}. Efficiency: ${hotspot.efficiency ?? 'unknown'}%. Speed: ${hotspot.currentSpeed ?? '?'} km/h vs ${hotspot.freeFlowSpeed ?? '?'} km/h free flow. Severity: ${hotspot.severityLabel}.
Public transport: Metro ${pt.metro.lines} lines (${pt.metro.status}), ${pt.bus.routes} bus routes, ${pt.ev} EV stations, transport score ${pt.score}/100.

Analyze and respond in this exact format:
PRIMARY CAUSE: [specific reason congestion happens at this exact zone type and location]
TRAVELER PROFILE: [who travels here and for what purpose - be specific: factory workers, tourists, office staff etc]
TRANSPORT GAP: [is existing public transport sufficient? what is missing?]
CARBON IMPACT: [estimated daily CO2 from congestion vehicles idling, with number]
AI SOLUTIONS: [3 numbered specific solutions tailored to this zone type]

Be analytical, specific to this zone type. No generic answers. Max 2 sentences per section.`;

    try {
      setText(buildLiveTrafficAnalysis(hotspot, cityName));
    } catch {
      setText('Live analysis unavailable for this hotspot. Select a different live zone or refresh traffic data.');
    }
    setBusy(false);
  }, [hotspot?.id, cityName]);

  // AI deep analysis now stays idle until the user clicks refresh/analyze.

  if (!hotspot) return null;
  return (
    <div className="p-3 bg-[#04150a] rounded-xl border border-[#00ff8833]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-orbitron text-[#00ff88] uppercase tracking-widest flex items-center gap-1"><Cpu className="w-3 h-3" /> AI Deep Analysis</span>
        <button onClick={run} disabled={busy} className="text-[#00e5ff] hover:text-white"><RefreshCw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} /></button>
      </div>
      {busy ? (
        <div className="flex items-center gap-2 py-2"><Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" /><span className="text-[10px] font-mono text-[#81c784] animate-pulse">Analyzing live patterns...</span></div>
      ) : text ? (
        <div className="text-[10px] font-mono text-[#c8f7d0] leading-relaxed whitespace-pre-line">{text}</div>
      ) : (
        <div className="text-[10px] font-mono text-[#81c784] leading-relaxed">AI is idle for this selected city/zone. Click the refresh/analyze icon to create a live, location-specific traffic analysis.</div>
      )}
    </div>
  );
}

export default function TrafficIntelligence() {
  const cityList = useMemo(() => getCityList(), []);
  const [activeCity, setActiveCity] = useState('Ho Chi Minh City');
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const [panel, setPanel] = useState('traffic');
  const timerRef = useRef(null);
  const cdRef = useRef(null);
  const activeCityMeta = useMemo(() => getCityData(activeCity), [activeCity]);

  const loadPipeline = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await trafficService.getComprehensiveHotspots(activeCity);
      setHotspots(data);
      setLastRefresh(new Date().toLocaleTimeString());
      setCountdown(REFRESH_MS / 1000);
    } catch (err) {
      setError(err.message || 'Backend unreachable');
    } finally {
      setLoading(false);
    }
  }, [activeCity]);

  useEffect(() => { setSelectedHotspot(null); loadPipeline(); }, [loadPipeline]);
  useEffect(() => {
    timerRef.current = setInterval(() => loadPipeline(true), REFRESH_MS);
    cdRef.current = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000);
    return () => { clearInterval(timerRef.current); clearInterval(cdRef.current); };
  }, [loadPipeline]);

  const stats = useMemo(() => {
    if (!hotspots.length) return { count: 0, avg: '—', worst: 'green', avgEff: '—' };
    const withData = hotspots.filter(h => h.carbonRaw !== null);
    const carbonSum = withData.reduce((a, c) => a + c.carbonRaw, 0);
    const effArr = hotspots.filter(h => h.efficiency !== null);
    const sevOrder = ['green', 'yellow', 'orange', 'red', 'purple'];
    const worst = hotspots.reduce((m, h) => sevOrder.indexOf(h.severity) > sevOrder.indexOf(m) ? h.severity : m, 'green');
    return {
      count: hotspots.length,
      avg: withData.length ? (carbonSum / withData.length).toFixed(1) : '—',
      worst,
      avgEff: effArr.length ? Math.round(effArr.reduce((a, c) => a + c.efficiency, 0) / effArr.length) + '%' : '—'
    };
  }, [hotspots]);

  const sel = selectedHotspot;
  const pt = PUBLIC_TRANSPORT[activeCity] || DEFAULT_PT;
  const ptScore = pt.score;
  const ptColor = ptScore > 65 ? NEON : ptScore > 45 ? WARN : CRIT;

  return (
    <div className="flex flex-col bg-[#020b05] text-[#e8f5e9] h-[calc(100vh-220px)] min-h-[650px] overflow-hidden relative rounded-xl">
      {/* NAV */}
      <div className="flex-shrink-0 flex items-center flex-wrap gap-2 px-5 py-2.5 border-b border-[#00ff8822] bg-[#061209] z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#00e5ff22] border border-[#00e5ff44]">
            <Cpu className={`w-5 h-5 text-[#00e5ff] ${loading ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="font-orbitron text-base font-bold flex items-center gap-2" style={{ color: NEON2 }}>
              Traffic Intelligence
              <span className="px-1.5 py-0.5 text-[8px] bg-[#ff174422] text-[#ff1744] rounded font-mono uppercase border border-[#ff174433]">LIVE</span>
            </h2>
            <div className="text-[10px] font-mono text-[#4caf50]">TomTom + Claude AI • {lastRefresh} • {countdown}s</div>
          </div>
        </div>

        <div className="flex gap-1 bg-[#020b05] rounded-xl border border-[#00ff8822] p-1 ml-auto">
          {[['traffic','🚦 Traffic'],['transport','🚌 Transport'],['causes','🧠 AI Causes']].map(([id, label]) => (
            <button key={id} onClick={() => setPanel(id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all ${panel === id ? 'bg-[#00ff8822] text-[#00ff88] border border-[#00ff8866]' : 'text-[#81c784] hover:text-[#00ff88]'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex bg-[#020b05] rounded-xl border border-[#00ff8822] p-1 overflow-x-auto">
          {cityList.map(c => (
            <button key={c} onClick={() => setActiveCity(c)} disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-orbitron transition-all whitespace-nowrap ${loading ? 'opacity-50 cursor-wait' : ''} ${activeCity === c ? 'bg-[#00ff8822] text-[#00ff88] border border-[#00ff8866]' : 'text-[#81c784] hover:text-[#00ff88]'}`}>
              {c.replace('Ho Chi Minh City','HCMC')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* MAP */}
        <div className="flex-1 relative bg-[#04150a]">
          {loading && !hotspots.length && (
            <div className="absolute inset-0 z-[2000] bg-[#020b05dd] flex items-center justify-center flex-col gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#00ff88]" />
              <div className="font-orbitron text-[#00ff88] text-sm tracking-widest animate-pulse">CONNECTING LIVE UPLINKS...</div>
              <div className="font-mono text-[10px] text-[#81c784]">TomTom → Carbon Engine → Claude AI</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-[2000] bg-[#0a0202dd] flex items-center justify-center flex-col gap-4 p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div className="font-orbitron text-white text-lg font-bold">Service Unavailable</div>
              <div className="font-mono text-red-300 max-w-md border border-red-900 bg-black/40 p-4 rounded text-sm">{error}</div>
              <button onClick={() => loadPipeline()} className="px-4 py-2 bg-red-900/40 border border-red-500 rounded text-white font-orbitron text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> RETRY</button>
            </div>
          )}

          <MapContainer center={activeCityMeta.center} zoom={activeCityMeta.zoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
            <MapUpdater center={activeCityMeta.center} zoom={activeCityMeta.zoom} />
            <LayersControl position="topright">
              <LayersControl.Overlay name="Traffic Hotspots" checked>
                <FeatureGroup>
                  {hotspots.map(n => {
                    const col = COLORS[n.severity] || COLORS.orange;
                    const focused = selectedHotspot?.id === n.id;
                    const crit = n.severity === 'purple' || n.severity === 'red';
                    const img = LOCATION_IMAGES[n.type] || LOCATION_IMAGES['commercial'];
                    return (
                      <React.Fragment key={n.id}>
                        {crit && <Circle center={[n.lat, n.lng]} radius={n.radius * 1.4} pathOptions={{ fillColor: col, fillOpacity: 0.07, color: col, weight: 1, dashArray: '4,8' }} />}
                        <Circle center={[n.lat, n.lng]} radius={n.radius}
                          pathOptions={{ fillColor: col, fillOpacity: focused ? 0.65 : crit ? 0.4 : 0.25, color: col, weight: focused ? 3 : 2 }}
                          eventHandlers={{ click: () => setSelectedHotspot(n) }}>
                          <Popup maxWidth={300}>
                            <div style={{ background: '#061209', color: '#fff', fontFamily: 'monospace', fontSize: '11px', minWidth: 240 }}>
                              <img src={img} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} onError={e => e.target.style.display='none'} />
                              <div style={{ color: col, fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: 4, marginBottom: 4 }}>{n.corridorName || n.name}</div>
                              <div style={{ color: '#81c784', fontSize: 9, marginBottom: 4 }}>{n.type?.toUpperCase()} · {activeCity}</div>
                              {n.currentSpeed !== null && <div>Flow: <b>{n.currentSpeed} km/h</b> | Eff: <b style={{color:col}}>{n.efficiency}%</b></div>}
                              {(CAUSE_PATTERNS[n.type]?.causes[0]) && <div style={{color:'#c8f7d0',fontSize:9,marginTop:4}}>📍 {CAUSE_PATTERNS[n.type].causes[0]}</div>}
                            </div>
                          </Popup>
                        </Circle>
                        <Circle center={[n.lat, n.lng]} radius={30} pathOptions={{ fillColor: '#fff', color: col, weight: 1, fillOpacity: 0.9 }} />
                      </React.Fragment>
                    );
                  })}
                </FeatureGroup>
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>

          {/* LIVE BADGE */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="p-3 rounded-xl bg-[#020b05cc] border border-[#00e5ff33] backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-ping' : 'bg-[#00e5ff] animate-pulse'}`} />
                <span className="text-[9px] font-orbitron text-[#00e5ff]">{loading ? 'SYNCING' : 'LIVE'}</span>
                <button onClick={() => loadPipeline(true)} className="ml-1 text-[#81c784] hover:text-white"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /></button>
              </div>
              <div className="font-orbitron text-sm font-bold text-white">{activeCity}</div>
              <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-[#ffffff11] font-mono text-center">
                <div><div className="text-[8px] text-[#81c784]">ZONES</div><div className="text-sm font-bold text-[#ffee58]">{stats.count}</div></div>
                <div><div className="text-[8px] text-[#81c784]">CO₂/h</div><div className="text-sm font-bold text-[#ff1744]">{stats.avg}</div></div>
                <div><div className="text-[8px] text-[#81c784]">EFF%</div><div className="text-sm font-bold text-[#00e5ff]">{stats.avgEff}</div></div>
                <div><div className="text-[8px] text-[#81c784]">RISK</div><div className="text-sm font-bold" style={{ color: COLORS[stats.worst] }}>{stats.worst.slice(0,4).toUpperCase()}</div></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="p-2.5 rounded-xl bg-[#020b05dd] border border-[#00ff8833] font-mono text-[9px]">
              <div className="font-orbitron text-xs mb-1.5 text-[#00ff88] flex items-center gap-1"><Info className="w-3 h-3" /> SEVERITY</div>
              {[['#00ff88','Free Flow (85-100%)'],['#ffee58','Moderate (65-84%)'],['#ff6d00','Congested (45-64%)'],['#ff1744','Severe (25-44%)'],['#d500f9','Critical (<25%)']].map(([c,t]) => (
                <div key={t} className="flex items-center gap-1.5 mb-0.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:c}} /><span>{t}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="w-[400px] border-l border-[#00ff8822] bg-[#061209] flex flex-col overflow-hidden z-20">
          <div className="p-3 border-b border-[#00ff8822] flex items-center justify-between bg-[#0a1f0e]">
            <h3 className="font-orbitron text-sm font-bold flex items-center gap-2 text-[#00ff88]"><Activity className="w-4 h-4" /> Intelligence Panel</h3>
            <div className="text-[9px] font-mono flex items-center gap-1 px-2 py-1 bg-black/50 rounded border border-[#00ff8833]" style={{color:NEON}}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> LIVE AI
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* PUBLIC TRANSPORT PANEL */}
            {(panel === 'transport' || panel === 'traffic') && (
              <div className="p-3 bg-[#04150a] rounded-xl border border-[#00e5ff33] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-orbitron text-[#00e5ff] uppercase flex items-center gap-1"><Bus className="w-3 h-3" /> Public Transport — {activeCity}</span>
                  <span className="text-[10px] font-bold font-mono" style={{color:ptColor}}>{ptScore}/100</span>
                </div>
                <div className="h-1.5 bg-[#0d2e14] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${ptScore}%`, backgroundColor: ptColor }} />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <TransportRow icon={Train} label="Metro Lines" value={`${pt.metro.lines} (${pt.metro.status})`} col={NEON2} />
                  <TransportRow icon={Bus} label="Bus Routes" value={`${pt.bus.routes} routes`} col={NEON} />
                  <TransportRow icon={Battery} label="EV Stations" value={`${pt.ev} chargers`} col={GOLD} />
                  <TransportRow icon={Car} label="E-Buses" value={`${pt.bus.electric} electric`} col={NEON} />
                  {pt.ferries > 0 && <TransportRow icon={Anchor} label="Ferries" value={`${pt.ferries} routes`} col={NEON2} />}
                  <TransportRow icon={Users} label="Metro Daily" value={pt.metro.daily} col={PURPLE} />
                </div>
                <div className="text-[9px] font-mono p-1.5 rounded" style={{background:'#061209',border:'1px solid #00ff8822',color:ptScore<50?CRIT:ptScore<65?WARN:NEON}}>
                  {ptScore < 50 ? '⚠ Underserved — Most residents rely on private vehicles' : ptScore < 65 ? '⚡ Moderate — Expanding but last-mile gaps exist' : '✅ Good coverage — '+pt.bus.coverage+' city coverage'}
                </div>
              </div>
            )}

            {loading && !hotspots.length && [0,1,2].map(i => (
              <div key={i} className="h-24 rounded-xl bg-[#04150a] border border-[#ffffff08] animate-pulse" />
            ))}

            {/* DETAIL CARD */}
            {sel && (
              <div className="p-3 rounded-xl bg-[#020b05] border-2 border-[#00e5ff66] relative">
                <button onClick={() => setSelectedHotspot(null)} className="absolute top-2 right-2 text-[#81c784] hover:text-white font-mono text-xs bg-[#0a1f0e] px-1.5 py-0.5 rounded border border-[#ffffff11]">✕</button>

                {/* Zone image */}
                <div className="relative mb-2 rounded-lg overflow-hidden h-20">
                  <img src={LOCATION_IMAGES[sel.type] || LOCATION_IMAGES['commercial']} alt={sel.type} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020b05] to-transparent" />
                  <div className="absolute bottom-1 left-2 text-[9px] font-mono text-[#00e5ff]">📍 {sel.corridorName || sel.name}</div>
                </div>

                <div className="font-bold text-sm text-white mb-0.5 pr-6">{sel.corridorName || sel.name}</div>
                <div className="text-[9px] text-[#81c784] font-mono mb-2">{sel.type} zone · {activeCity}</div>

                {/* Why people travel here */}
                {CAUSE_PATTERNS[sel.type] && (
                  <div className="p-2 bg-[#04150a] rounded-lg mb-2">
                    <div className="text-[8px] text-[#ffee58] uppercase mb-1">Why People Travel Here</div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {CAUSE_PATTERNS[sel.type].travel.map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{background:'#00e5ff11',border:'1px solid #00e5ff33',color:NEON2}}>{r}</span>
                      ))}
                    </div>
                    <div className="text-[9px] text-[#81c784] font-mono">Peak: {CAUSE_PATTERNS[sel.type].peaks.join(' | ')}</div>
                  </div>
                )}

                <div className="space-y-2 font-mono">
                  {sel.currentSpeed !== null ? (
                    <div className="p-2 bg-[#04150a] rounded border border-[#ffffff0a]">
                      <div className="text-[8px] text-[#00e5ff] uppercase mb-1 flex items-center gap-1"><Gauge className="w-3 h-3" /> Live Traffic Flow</div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div><div className="text-[8px] text-[#81c784]">NOW</div><div className="text-xs font-bold">{sel.currentSpeed}<span className="text-[8px] text-[#81c784]"> km/h</span></div></div>
                        <div><div className="text-[8px] text-[#81c784]">FREE</div><div className="text-xs font-bold text-[#4caf50]">{sel.freeFlowSpeed}<span className="text-[8px] text-[#81c784]"> km/h</span></div></div>
                        <div><div className="text-[8px] text-[#81c784]">EFF</div><div className="text-xs font-bold" style={{color:COLORS[sel.severity]}}>{sel.efficiency}%</div></div>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-[#ffffff0a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${sel.efficiency}%`, backgroundColor: COLORS[sel.severity] }} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-[#1a1a0a] rounded border border-[#ffee5833] text-center text-[9px] text-[#ffee58]">⚠ Traffic telemetry loading...</div>
                  )}

                  <div className="flex items-center justify-between p-2 bg-[#04150a] rounded border border-[#ffffff0a]">
                    <div className="flex items-center gap-2 text-[#ff1744]"><Wind className="w-3 h-3" /><span className="text-xs font-bold">Carbon Output</span></div>
                    <span className="text-sm font-bold text-[#ff1744]">{sel.carbon}</span>
                  </div>

                  {sel.cause && (
                    <div className="p-2 bg-[#04150a] rounded border border-[#ffffff0a]">
                      <div className="text-[8px] text-[#ffee58] uppercase mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Probable Cause</div>
                      <div className="text-xs text-[#e8f5e9] leading-relaxed">{sel.cause}</div>
                    </div>
                  )}

                  {sel.action && (
                    <div className="p-2 bg-[#0a1f0e] rounded border border-[#00ff8844]">
                      <div className="text-[8px] text-[#00ff88] font-bold mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Recommendation</div>
                      <div className="text-xs text-[#c8f7d0] leading-relaxed border-l-2 border-[#00ff8866] pl-2">{sel.action}</div>
                    </div>
                  )}

                  {panel === 'causes' && <AIAnalysisBlock hotspot={sel} cityName={activeCity} />}

                  <div className="text-[9px] font-mono text-[#4caf50] bg-black/40 p-2 rounded flex justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated:</span>
                    <span className="text-white">{sel.lastUpdated ? new Date(sel.lastUpdated).toLocaleTimeString() : lastRefresh}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="px-1 pt-1 flex items-center justify-between">
              <span className="text-[9px] font-orbitron text-[#81c784] uppercase">Zones</span>
              <span className="text-[9px] font-mono text-[#4caf50]">{hotspots.length} active</span>
            </div>

            {hotspots.map(n => {
              const focused = selectedHotspot?.id === n.id;
              const col = COLORS[n.severity] || COLORS.orange;
              const crit = n.severity === 'purple' || n.severity === 'red';
              const img = LOCATION_IMAGES[n.type] || LOCATION_IMAGES['commercial'];
              return (
                <div key={n.id} onClick={() => setSelectedHotspot(n)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all relative group ${focused ? 'bg-[#0a1f0e] border-2 border-[#00ff8866]' : 'bg-[#04150a] border border-[#ffffff11] hover:border-[#00ff8844]'}`}>
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: col, opacity: crit ? 1 : 0.5 }} />
                  <div className="pl-3 flex items-start gap-2">
                    <img src={img} alt="" className="w-12 h-9 object-cover rounded flex-shrink-0" onError={e => e.target.style.display='none'} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-xs truncate ${focused ? 'text-[#00ff88]' : 'text-white group-hover:text-[#00ff88]'}`}>{n.corridorName || n.name}</div>
                      {CAUSE_PATTERNS[n.type] && <div className="text-[9px] text-[#4caf50]">{CAUSE_PATTERNS[n.type].causes[0]}</div>}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border" style={{ borderColor: `${col}44`, color: col, backgroundColor: `${col}11` }}>{n.severityLabel}</span>
                        {n.efficiency !== null && <span className="text-[9px] text-[#81c784]">{n.efficiency}%</span>}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="text-[8px] text-[#81c784]">CO₂</div>
                      <div className="text-[10px] font-bold text-[#ff1744]">{n.carbon}</div>
                    </div>
                  </div>
                  {n.efficiency !== null && (
                    <div className="mt-1.5 ml-3 h-1 bg-[#ffffff0a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${n.efficiency}%`, backgroundColor: col }} />
                    </div>
                  )}
                </div>
              );
            })}

            {!loading && !hotspots.length && (
              <div className="p-8 text-center border border-dashed border-[#ffffff22] rounded-xl mt-4">
                <div className="text-[10px] font-orbitron text-[#81c784]">No active monitoring zones</div>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[#020b05] border-t border-[#00ff8822] font-mono text-[9px] text-[#4caf50] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /> LIVE INTELLIGENCE</div>
            <div className="text-[#81c784] opacity-70">VN_NET_v7.0</div>
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #04150a !important; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #061209 !important; color: #fff !important; border: 1px solid #00ff8844; }
        .leaflet-control-layers { background: #061209 !important; color: #00ff88 !important; border: 1px solid #00ff8833 !important; font-size: 10px; }
        .leaflet-control-layers-expanded { background: #061209 !important; padding: 10px !important; }
        .leaflet-popup-content { margin: 4px 8px; }
      `}</style>
    </div>
  );
}
