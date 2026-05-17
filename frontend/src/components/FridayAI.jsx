import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../utils/api';

// All recognized commands with natural language aliases
const COMMAND_MAP = [
  { cmd: 'overview',     aliases: ['dashboard', 'overview', 'home', 'command center', 'command', 'main', 'start', 'go home'] },
  { cmd: 'map',          aliases: ['map', 'vietnam map', 'vietnam', 'show map', 'open map', 'city map', 'hanoi', 'ho chi minh', 'da nang', 'hcmc', 'saigon', 'can tho', 'hai phong'] },
  { cmd: 'co2',          aliases: ['co2', 'co₂', 'carbon', 'emission', 'emissions', 'carbon control', 'greenhouse', 'pollution control'] },
  { cmd: 'climate',      aliases: ['climate', 'disaster', 'weather', 'flood', 'storm', 'heatwave', 'climate disaster'] },
  { cmd: 'energy',       aliases: ['energy', 'renewable', 'solar', 'wind', 'power', 'electricity', 'renewable energy'] },
  { cmd: 'soil',         aliases: ['soil', 'agriculture', 'farming', 'farm', 'crop', 'rice', 'mekong', 'soil agriculture'] },
  { cmd: 'traffic',      aliases: ['traffic', 'vehicles', 'cars', 'roads', 'congestion', 'transport'] },
  { cmd: 'trafficIntel', aliases: ['traffic intelligence', 'traffic intel', 'smart traffic', 'intelligent traffic', 'traffic ai'] },
  { cmd: 'pollution',    aliases: ['pollution', 'aqi', 'air quality', 'smog', 'air', 'pm2.5', 'air pollution'] },
  { cmd: 'report',       aliases: ['report', 'reports', 'generate report', 'ai report', 'show report', 'create report'] },
  { cmd: 'citizens',     aliases: ['citizen', 'citizens', 'people', 'citizen data', 'residents', 'public data'] },
  { cmd: 'dataCenter',   aliases: ['data center', 'data', 'database', 'ai data', 'server', 'servers'] },
  { cmd: 'alerts',       aliases: ['alert', 'alerts', 'warning', 'warnings', 'alert system', 'notifications', 'emergency'] },
  { cmd: 'hydrogrid',    aliases: ['hydro', 'hydrogrid', 'water grid', 'hydro grid', 'water', 'grid', 'hydrogrid ai'] },
];

function matchCommand(text) {
  const lower = text.toLowerCase().trim();
  for (const { cmd, aliases } of COMMAND_MAP) {
    for (const alias of aliases) {
      if (lower.includes(alias)) return cmd;
    }
  }
  return null;
}

export default function FridayAI({ onCommand, isOpen, setIsOpen }) {
  const [state, setState] = useState('idle');
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [cmdFeedback, setCmdFeedback] = useState(null);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const greetedRef = useRef(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  useEffect(() => { return () => { stopAudio(); }; }, [stopAudio]);

  const speak = useCallback(async (text) => {
    if (!text) return;
    stopAudio();
    setState('speaking');
    try {
      const res = await api.post('/friday/speak', { text });
      const audioUrl = res.data?.audioUrl;
      if (!audioUrl) { setState('idle'); return; }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => { audioRef.current = null; setState('idle'); };
      audio.onerror = () => { audioRef.current = null; setState('idle'); };
      audio.play().catch(() => { audioRef.current = null; setState('idle'); });
    } catch {
      setState('idle');
    }
  }, [stopAudio]);

  const executeCommand = useCallback(async (text) => {
    if (!text.trim()) return;
    setState('processing');
    setHistory(prev => [...prev, { role: 'user', content: text }]);

    // Detect and execute navigation command immediately
    const matched = matchCommand(text);
    if (matched && onCommand) {
      onCommand(matched);
      const tabLabel = COMMAND_MAP.find(x => x.cmd === matched);
      setCmdFeedback({ cmd: matched, label: tabLabel?.aliases[0] || matched });
      setTimeout(() => setCmdFeedback(null), 2500);
    }

    let fullReply = '';
    try {
      const res = await api.post('/friday/chat', { message: text, history: history.slice(-10) });
      fullReply = res.data?.reply || res.data?.message || 'Command executed.';
    } catch {
      // Build a smart offline reply
      if (matched) {
        const names = { overview:'Command Center', map:'Vietnam AI Map', co2:'CO₂ Control', climate:'Climate & Disaster', energy:'Renewable Energy', soil:'Soil & Agriculture', traffic:'Traffic & Vehicles', trafficIntel:'Traffic Intelligence', pollution:'AQI & Pollution', report:'AI Report', citizens:'Citizen Data', dataCenter:'AI Data Center', alerts:'Alert System', hydrogrid:'HydroGrid AI' };
        fullReply = `Navigating to ${names[matched] || matched}. Backend offline — live AI analysis unavailable. Displaying cached data.`;
      } else {
        fullReply = 'FRIDAY backend is not reachable. Navigation commands still work. Please start the backend on port 5000 for full AI responses.';
      }
    }

    setHistory(prev => [...prev, { role: 'assistant', content: fullReply }]);
    speak(fullReply);
  }, [onCommand, speak, history]);

  const startListening = useCallback(() => {
    if (state === 'speaking') { stopAudio(); setState('idle'); return; }
    if (state === 'listening') { recognitionRef.current?.abort(); setState('idle'); return; }
    if (state === 'processing') return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const r = 'Speech recognition not supported in this browser. Please use Chrome or Edge, or type your command below.';
      setHistory(prev => [...prev, { role: 'assistant', content: r }]);
      speak(r);
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onstart = () => setState('listening');
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      executeCommand(t);
    };
    rec.onerror = (e) => {
      console.warn('Speech error:', e.error);
      if (e.error === 'no-speech') {
        setState('idle');
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: `Mic error: ${e.error}. Try typing your command instead.` }]);
        setState('idle');
      }
    };
    rec.onend = () => { if (state === 'listening') setState('idle'); };
    rec.start();
    recognitionRef.current = rec;
  }, [state, executeCommand, speak, stopAudio]);

  const handleTextSubmit = useCallback(() => {
    const t = textInput.trim();
    if (!t) return;
    setTextInput('');
    executeCommand(t);
  }, [textInput, executeCommand]);

  useEffect(() => {
    const g = 'FRIDAY online. Environmental monitoring active across all Vietnamese city nodes. Awaiting command.';
    setHistory([{ role: 'assistant', content: g }]);
  }, []);

  const colors = {
    idle:       { main: '#00ff88', glow: '#00ff8888', bg: 'linear-gradient(135deg,#00ff88,#00c853)', label: 'TAP TO SPEAK' },
    listening:  { main: '#00e5ff', glow: '#00e5ff88', bg: 'linear-gradient(135deg,#00e5ff,#0091ea)', label: '🎤 LISTENING...' },
    processing: { main: '#ff9800', glow: '#ff980088', bg: 'linear-gradient(135deg,#ff9800,#e65100)', label: '⚡ PROCESSING...' },
    speaking:   { main: '#b388ff', glow: '#b388ff88', bg: 'linear-gradient(135deg,#7c4dff,#651fff)', label: '🔊 SPEAKING...' },
  };
  const c = colors[state];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 select-none">
        <button
          onClick={() => {
            setIsOpen(true);
            if (!greetedRef.current) {
              greetedRef.current = true;
              const g = 'FRIDAY online. Environmental monitoring active across all Vietnamese city nodes. Awaiting command.';
              speak(g);
            }
          }}
          className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          style={{ background: c.bg, boxShadow: `0 0 20px ${c.glow},0 0 40px ${c.glow}55`, border: `2px solid ${c.main}55` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 1 0 10 10c0-2-.57-3.86-1.56-5.44C18.7 3.94 15.47 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" fill="#030d07"/>
            <path d="M9 9v6h2l3 3V6L11 9H9z" fill="#030d07"/>
          </svg>
        </button>
        <span style={{ color: c.main, fontSize: '8px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.05em', textShadow: `0 0 8px ${c.main}` }}>FRIDAY</span>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[25%] min-w-[300px] z-50 flex flex-col select-none border-l shadow-2xl"
      style={{ background: '#020b05', borderColor: '#00ff8833', boxShadow: '-10px 0 30px #00ff8811' }}>

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#00ff8833', background: '#04150a' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: c.main, boxShadow: `0 0 6px ${c.main}`, animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: c.main, fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>FRIDAY AI</span>
          <span style={{ color: '#2e7d32', fontSize: '9px', fontFamily: 'monospace', marginLeft: 4 }}>v2.0</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-[#81c784] hover:text-[#00ff88] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Command feedback banner */}
      {cmdFeedback && (
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
          style={{ background: '#00ff8815', borderBottom: '1px solid #00ff8833', animation: 'fadeIn 0.2s ease' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ color: '#00ff88', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            NAVIGATING → {cmdFeedback.label.toUpperCase()}
          </span>
        </div>
      )}

      {/* Chat history */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#00ff8822 transparent' }}>
        {history.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'assistant' && (
              <span style={{ color: '#2e7d32', fontSize: '8px', fontFamily: 'monospace', marginBottom: 3 }}>FRIDAY</span>
            )}
            <div className={`max-w-[90%] p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none'}`}
              style={{
                background: msg.role === 'user' ? '#0a1f0e' : '#061209',
                border: `1px solid ${msg.role === 'user' ? '#00ff8822' : c.main + '44'}`,
                color: msg.role === 'user' ? '#81c784' : '#c8f7d0',
                boxShadow: msg.role === 'assistant' ? `0 0 20px ${c.glow}22` : 'none'
              }}>
              {msg.content}
            </div>
          </div>
        ))}
        {state === 'processing' && (
          <div className="flex flex-col items-start">
            <div className="max-w-[90%] p-3 rounded-2xl rounded-tl-none text-xs font-mono flex items-center gap-2"
              style={{ background: '#061209', border: `1px solid ${c.main}44`, color: '#c8f7d0' }}>
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
              <span style={{ color: '#4caf50', marginLeft: 4 }}>Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="p-4 border-t flex flex-col items-center gap-3 flex-shrink-0" style={{ borderColor: '#00ff8833', background: '#04150a' }}>
        {/* Voice button */}
        <div className="relative flex items-center justify-center">
          {state === 'listening' && [0, 1, 2].map(i => (
            <div key={i} className="absolute rounded-full pointer-events-none"
              style={{ width: `${80 + i * 20}px`, height: `${80 + i * 20}px`, border: `2px solid ${c.glow}`, animation: `ping ${1 + i * 0.3}s ease-out infinite`, animationDelay: `${i * 0.25}s` }} />
          ))}
          <button onClick={startListening}
            className="relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: c.bg, boxShadow: `0 0 20px ${c.glow},0 0 40px ${c.glow}55`, border: `2px solid ${c.main}55` }}>
            {state === 'idle' && (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="11" rx="3" fill="#030d07"/>
                <path d="M5 11a7 7 0 0 0 14 0" stroke="#030d07" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="18" x2="12" y2="22" stroke="#030d07" strokeWidth="2" strokeLinecap="round"/>
                <line x1="9" y1="22" x2="15" y2="22" stroke="#030d07" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {state === 'listening' && (
              <div className="flex items-end gap-0.5 h-6">
                {[3, 6, 9, 6, 3].map((h, i) => (
                  <div key={i} className="w-1 rounded-full" style={{ height: `${h}px`, background: '#030d07', animation: `waveBar 0.6s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
            {state === 'processing' && (
              <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid #030d0755', borderTopColor: '#030d07' }} />
            )}
            {state === 'speaking' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#030d07"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#030d07" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#030d07" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ color: c.main, background: `${c.main}11`, border: `1px solid ${c.main}33`, fontSize: '10px', letterSpacing: '0.1em' }}>
          {c.label}
        </div>

        {/* Text input fallback */}
        <div className="w-full flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Type a command..."
            className="flex-1 px-3 py-2 rounded-lg text-xs font-mono outline-none transition-all"
            style={{
              background: '#061209',
              border: `1px solid ${state === 'idle' ? '#00ff8833' : c.main + '55'}`,
              color: '#c8f7d0',
              '::placeholder': { color: '#2e7d32' }
            }}
          />
          <button onClick={handleTextSubmit}
            className="px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: `${c.main}22`, color: c.main, border: `1px solid ${c.main}44` }}>
            ▶
          </button>
        </div>

        <div style={{ color: '#2e7d32', fontSize: '9px', fontFamily: 'monospace', textAlign: 'center', lineHeight: '1.6' }}>
          "Open map" • "Show CO2" • "Analyze Hanoi"<br />"Traffic intel" • "Generate report" • "Alerts"
        </div>
      </div>
    </div>
  );
}
