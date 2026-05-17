import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { StatCard, RiskBar, ProgressBar, StatusBadge, SectionHeader, LoadingSpinner } from '../components/shared';
import {
  Leaf, LogOut, ClipboardList, Award, Activity, Zap, CheckCircle,
  AlertTriangle, Clock, Key, Send, Loader, X, TrendingUp, Star,
  Globe, Sun, Wind, Droplets, ChevronRight, Check, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

const NEON = '#00ff88';

function PasskeyModal({ task, onClose, onUnlocked }) {
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`/tasks/${task._id}/start`, { passkey });
      onUnlocked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid passkey');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6 max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#00ff8811', border: '1px solid #00ff8833' }}>
            <Key size={24} style={{ color: NEON }} />
          </div>
          <h3 className="font-orbitron font-bold mb-1" style={{ color: NEON }}>ENTER TASK PASSKEY</h3>
          <p className="text-xs font-mono" style={{ color: '#4caf50' }}>Check your email for the task passkey</p>
        </div>
        {error && <div className="mb-3 p-2 rounded text-xs font-mono" style={{ background: '#ff174411', color: '#ff1744' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input value={passkey} onChange={e => setPasskey(e.target.value)}
            className="input-dark w-full px-4 py-3 rounded-lg text-center text-lg tracking-widest font-orbitron"
            placeholder="••••••••" required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 rounded-lg text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
              {loading ? <><Loader size={12} className="animate-spin" /> Verifying...</> : <><Check size={12} /> Start Task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPasskey, setShowPasskey] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState({});
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes, profileRes] = await Promise.all([
        api.get('/tasks/my'),
        api.get('/employees/profile'),
      ]);
      setTasks(taskRes.data || []);
      setProfile(profileRes.data);
    } catch { } finally { setLoading(false); }
  };

  const updateProgress = async (taskId, newProgress) => {
    setUpdatingTask(taskId);
    try {
      await api.patch(`/tasks/${taskId}/progress`, { progress: newProgress });
      loadData();
    } catch { } finally { setUpdatingTask(null); }
  };

  const ecoScore = profile?.ecoScore || 75;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCO2Saved = tasks.reduce((s, t) => s + (t.co2Saved || 0), 0);

  const scoreHistory = [
    { day: 'Mon', score: 68 }, { day: 'Tue', score: 72 }, { day: 'Wed', score: 70 },
    { day: 'Thu', score: 75 }, { day: 'Fri', score: 78 }, { day: 'Sat', score: 74 },
    { day: 'Sun', score: ecoScore }
  ];

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#061209', borderBottom: '1px solid #0d2e14' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00ff8822, #00c85322)', border: '1px solid #00ff8833' }}>
            <Leaf size={18} style={{ color: NEON }} />
          </div>
          <div>
            <div className="font-orbitron text-sm font-black" style={{ color: NEON }}>GreenAgentOS</div>
            <div className="text-xs font-mono" style={{ color: '#2e7d32' }}>EMPLOYEE PORTAL</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-orbitron text-sm font-bold" style={{ color: NEON }}>{ecoScore}</div>
            <div className="text-xs font-mono" style={{ color: '#4caf50', fontSize: '10px' }}>ECO SCORE</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#00ff8808', border: '1px solid #00ff8811' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #00ff88, #00c853)', color: '#030d07' }}>
              {user?.name?.[0]}
            </div>
            <div>
              <div className="text-xs font-mono font-bold" style={{ color: '#e8f5e9' }}>{user?.name}</div>
              <div className="text-xs font-mono" style={{ color: '#4caf50', fontSize: '10px' }}>EMPLOYEE</div>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Eco Score" value={ecoScore} subtitle="Your sustainability score" icon={Star} color={NEON} />
          <StatCard title="Active Tasks" value={tasks.filter(t => t.status !== 'completed').length} icon={ClipboardList} color="#00e5ff" />
          <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="#00ff88" />
          <StatCard title="CO₂ Saved" value={`${totalCO2Saved.toFixed(1)}MT`} icon={Globe} color="#ffb300" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[['tasks', 'My Tasks', ClipboardList], ['analytics', 'Analytics', Activity], ['badges', 'Badges', Award]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${activeTab === id ? 'neon-border text-neon' : ''}`}
              style={{
                background: activeTab === id ? '#00ff8811' : '#061209',
                border: `1px solid ${activeTab === id ? '#00ff8833' : '#0d2e14'}`,
                color: activeTab === id ? NEON : '#4caf50'
              }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {loading ? <LoadingSpinner text="Loading your tasks..." /> :
              tasks.length === 0 ? (
                <div className="card p-12 text-center">
                  <ClipboardList size={40} className="mx-auto mb-4" style={{ color: '#2e7d32' }} />
                  <p className="font-orbitron text-sm mb-2" style={{ color: '#4caf50' }}>No Tasks Assigned Yet</p>
                  <p className="text-xs font-mono" style={{ color: '#2e7d32' }}>Your manager will assign sustainability tasks here.</p>
                </div>
              ) : tasks.map(task => (
                <div key={task._id} className="card p-5" style={{ border: `1px solid ${task.status === 'completed' ? '#00ff8822' : task.status === 'overdue' ? '#ff174422' : '#0d2e14'}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-mono font-bold text-sm" style={{ color: '#e8f5e9' }}>{task.title}</h3>
                        <StatusBadge status={task.status} />
                        <span className="badge" style={{
                          background: task.priority === 'critical' ? '#ff174411' : task.priority === 'high' ? '#ff6d0011' : '#ffb30011',
                          color: task.priority === 'critical' ? '#ff1744' : task.priority === 'high' ? '#ff6d00' : '#ffb300',
                          border: '1px solid transparent', fontSize: '10px', padding: '2px 8px'
                        }}>{task.priority?.toUpperCase()}</span>
                        {task.city && <span className="badge badge-neon">{task.city}</span>}
                      </div>

                      {task.description && (
                        <p className="text-xs font-mono mb-3" style={{ color: '#81c784' }}>{task.description}</p>
                      )}

                      {/* Why eco-friendly */}
                      {task.ecoReason && (
                        <div className="p-2.5 rounded-lg mb-3 text-xs font-mono" style={{ background: '#00ff8808', border: '1px solid #00ff8811' }}>
                          <span style={{ color: NEON }}>🌱 Why eco-friendly: </span>
                          <span style={{ color: '#81c784' }}>{task.ecoReason}</span>
                        </div>
                      )}

                      {/* CO2 target */}
                      {task.co2Target && (
                        <p className="text-xs font-mono mb-2" style={{ color: '#4caf50' }}>
                          Target: Reduce <strong style={{ color: NEON }}>{task.co2Target}MT</strong> CO₂
                          {task.co2Saved > 0 && <span style={{ color: '#ffb300' }}> • Achieved: {task.co2Saved}MT</span>}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span style={{ color: '#4caf50' }}>Progress</span>
                          <span style={{ color: NEON }}>{task.progress || 0}%</span>
                        </div>
                        <ProgressBar value={task.progress || 0} />
                      </div>

                      {/* Progress update */}
                      {task.status === 'in_progress' && (
                        <div className="flex gap-2 mt-3">
                          {[25, 50, 75, 100].map(p => (
                            <button key={p} onClick={() => updateProgress(task._id, p)}
                              disabled={updatingTask === task._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                              style={{
                                background: (task.progress || 0) >= p ? '#00ff8822' : '#061209',
                                border: `1px solid ${(task.progress || 0) >= p ? '#00ff8844' : '#0d2e14'}`,
                                color: (task.progress || 0) >= p ? NEON : '#4caf50'
                              }}>
                              {p}%
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right space-y-2">
                      {task.deadline && (
                        <div className="text-xs font-mono" style={{ color: '#4caf50' }}>
                          <Clock size={11} className="inline mr-1" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}

                      {task.status === 'pending' && (
                        <button onClick={() => setShowPasskey(task)}
                          className="btn-primary px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
                          <Key size={12} /> Start Task
                        </button>
                      )}

                      {task.status === 'completed' && (
                        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: NEON }}>
                          <CheckCircle size={14} /> Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <SectionHeader title="Weekly Eco Score" icon={TrendingUp} />
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={scoreHistory}>
                    <Area type="monotone" dataKey="score" stroke={NEON} fill="#00ff8811" strokeWidth={2} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#4caf50' }} />
                    <Tooltip contentStyle={{ background: '#0a1f0e', border: '1px solid #00ff8822', fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-4">
                <SectionHeader title="Task Status Breakdown" icon={Activity} />
                <div className="space-y-3 mt-2">
                  {[
                    ['Completed', tasks.filter(t => t.status === 'completed').length, NEON],
                    ['In Progress', tasks.filter(t => t.status === 'in_progress').length, '#00e5ff'],
                    ['Pending', tasks.filter(t => t.status === 'pending').length, '#ffb300'],
                    ['Overdue', tasks.filter(t => t.status === 'overdue').length, '#ff1744'],
                  ].map(([label, count, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span style={{ color: '#4caf50' }}>{label}</span>
                        <span style={{ color }}>{count}</span>
                      </div>
                      <ProgressBar value={tasks.length ? (count / tasks.length) * 100 : 0} color={color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vietnam awareness */}
            <div className="card p-4">
              <SectionHeader title="Vietnam Sustainability Context" icon={Globe} />
              <div className="grid grid-cols-4 gap-3 mt-2">
                {[
                  ['🌊 Mekong Delta', 'Flood Risk: 96%', '#29b6f6'],
                  ['🏙 HCMC', 'CO₂: 18.4MT/yr', '#ff6d00'],
                  ['☀️ Nha Trang', 'Solar: 88%', '#ffb300'],
                  ['🌱 Vietnam', 'Renewable: 28.5%', NEON],
                ].map(([title, value, color]) => (
                  <div key={title} className="text-center p-3 rounded-xl" style={{ background: '#061209', border: '1px solid #0d2e14' }}>
                    <div className="text-xs font-mono font-bold mb-1" style={{ color }}>{title}</div>
                    <div className="text-xs font-mono" style={{ color: '#81c784' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BADGES */}
        {activeTab === 'badges' && (
          <div className="card p-6">
            <SectionHeader title="Sustainability Badges" icon={Award} />
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: '🌱', name: 'Green Starter', desc: 'Complete first eco task', earned: completedCount >= 1, color: NEON },
                { icon: '☀️', name: 'Solar Champion', desc: 'Implement solar scheduling', earned: false, color: '#ffb300' },
                { icon: '🚴', name: 'Low Carbon Hero', desc: 'Save 5MT CO₂', earned: totalCO2Saved >= 5, color: '#00e5ff' },
                { icon: '🌊', name: 'Climate Guardian', desc: 'Complete climate prep task', earned: false, color: '#7e57c2' },
                { icon: '🏆', name: 'Eco Excellence', desc: 'Score above 90', earned: ecoScore >= 90, color: '#ff6d00' },
                { icon: '🤝', name: 'Team Player', desc: '5 tasks completed', earned: completedCount >= 5, color: NEON },
                { icon: '🌿', name: 'Vietnam Green', desc: 'Contribute to national target', earned: totalCO2Saved >= 1, color: '#4caf50' },
                { icon: '⚡', name: 'Energy Saver', desc: 'Energy efficiency task done', earned: false, color: '#ffee58' },
              ].map(badge => (
                <div key={badge.name} className="text-center p-4 rounded-xl transition-all"
                  style={{ background: badge.earned ? `${badge.color}11` : '#061209', border: `1px solid ${badge.earned ? badge.color + '33' : '#0d2e14'}`, opacity: badge.earned ? 1 : 0.5 }}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="font-mono text-xs font-bold mb-1" style={{ color: badge.earned ? badge.color : '#4caf50' }}>{badge.name}</div>
                  <div className="text-xs font-mono" style={{ color: '#4caf50', fontSize: '10px' }}>{badge.desc}</div>
                  {badge.earned && <div className="mt-2 text-xs font-mono" style={{ color: NEON }}>✓ EARNED</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Passkey modal */}
      {showPasskey && <PasskeyModal task={showPasskey} onClose={() => setShowPasskey(null)} onUnlocked={loadData} />}
    </div>
  );
}
