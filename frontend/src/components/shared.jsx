import React from 'react';
import { Loader, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, subtitle, icon: Icon, color = '#00ff88', trend, trendDir }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#4caf50' }}>{title}</p>
          <p className="font-orbitron text-2xl font-bold" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs font-mono mt-1" style={{ color: '#2e7d32' }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}11`, border: `1px solid ${color}33` }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trendDir === 'up' ? <TrendingUp size={12} style={{ color: '#ff1744' }} /> : <TrendingDown size={12} style={{ color: '#00ff88' }} />}
          <span className="text-xs font-mono" style={{ color: trendDir === 'up' ? '#ff1744' : '#00ff88' }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

export function EmissionBadge({ level }) {
  const map = {
    critical: { color: '#ff1744', bg: '#ff174411', border: '#ff174433', label: 'CRITICAL' },
    high: { color: '#ff6d00', bg: '#ff6d0011', border: '#ff6d0033', label: 'HIGH' },
    medium: { color: '#ffb300', bg: '#ffb30011', border: '#ffb30033', label: 'MEDIUM' },
    low: { color: '#00ff88', bg: '#00ff8811', border: '#00ff8833', label: 'LOW' },
  };
  const m = map[level] || map.medium;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold"
      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}>
      {m.label}
    </span>
  );
}

export function RiskBar({ value, label }) {
  const color = value >= 80 ? '#ff1744' : value >= 60 ? '#ff6d00' : value >= 40 ? '#ffb300' : '#00ff88';
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span style={{ color: '#4caf50' }}>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#0d2e14' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}66` }} />
      </div>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader size={24} className="animate-spin mx-auto mb-3" style={{ color: '#00ff88' }} />
        <p className="text-xs font-mono" style={{ color: '#4caf50' }}>{text}</p>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00ff8811', border: '1px solid #00ff8833' }}>
          <Icon size={16} style={{ color: '#00ff88' }} />
        </div>
      )}
      <div>
        <h2 className="font-orbitron text-sm font-bold" style={{ color: '#00ff88' }}>{title}</h2>
        {subtitle && <p className="text-xs font-mono" style={{ color: '#4caf50' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    high: { color: '#ff1744', bg: '#ff174411' },
    medium: { color: '#ffb300', bg: '#ffb30011' },
    low: { color: '#00ff88', bg: '#00ff8811' },
    critical: { color: '#ff1744', bg: '#ff174411' },
  };
  const m = map[priority?.toLowerCase()] || map.medium;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono"
      style={{ background: m.bg, color: m.color }}>
      {priority?.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: { color: '#ffb300', label: 'PENDING' },
    in_progress: { color: '#00e5ff', label: 'IN PROGRESS' },
    completed: { color: '#00ff88', label: 'DONE' },
    overdue: { color: '#ff1744', label: 'OVERDUE' },
  };
  const m = map[status] || { color: '#4caf50', label: status?.toUpperCase() };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono"
      style={{ background: `${m.color}11`, border: `1px solid ${m.color}33`, color: m.color }}>
      {m.label}
    </span>
  );
}

export function ProgressBar({ value, color = '#00ff88' }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0d2e14' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, value || 0)}%`, background: color, boxShadow: `0 0 6px ${color}55` }} />
    </div>
  );
}

export function EmptyState({ message, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={32} className="mb-3" style={{ color: '#2e7d32' }} />}
      <p className="text-sm font-mono" style={{ color: '#2e7d32' }}>{message}</p>
    </div>
  );
}
