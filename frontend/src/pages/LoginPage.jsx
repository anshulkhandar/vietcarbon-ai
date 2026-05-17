import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, Users, Smartphone, Mail, KeyRound, Lock, Loader, Eye, EyeOff } from 'lucide-react';

const HERO_IMAGES = ['/images/1778077904969_image.png','/images/1778077917090_image.png','/images/1778077932470_image.png','/images/1778077954813_image.png','/images/1778077994995_image.png'];

export default function LoginPage() {
  const [mode, setMode] = useState('admin');
  const [citizenMode, setCitizenMode] = useState('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [phone, setPhone] = useState('+84 ');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const { login, citizenPasswordLogin, requestCitizenOtp, verifyCitizenOtp } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => { const t = setInterval(() => setImgIdx(i => (i + 1) % HERO_IMAGES.length), 4000); return () => clearInterval(t); }, []);

  const cleanPhone = () => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('84')) return '+84 ' + digits.slice(2);
    return '+84 ' + digits.replace(/^0+/, '');
  };

  const validateCitizenBase = () => {
    if (!cleanPhone() || cleanPhone().replace(/\D/g, '').length < 9) throw new Error('Valid mobile number is required.');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Valid Gmail/email is required.');
  };

  const resetCitizenFlow = (m) => { setCitizenMode(m); setOtpSent(false); setOtp(''); setError(''); setSuccess(''); };

  const adminSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try { await login(username, password); navigate('/admin'); }
    catch (err) { setError(err.response?.data?.error || 'Use admin / admin123'); }
    finally { setLoading(false); }
  };

  const citizenSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      validateCitizenBase();
      const base = { email: email.trim().toLowerCase(), phone: cleanPhone() };

      if (citizenMode === 'login') {
        if (!citizenPassword) throw new Error('Password is required for citizen login.');
        await citizenPasswordLogin({ ...base, password: citizenPassword });
        navigate('/citizen');
        return;
      }

      if (!otpSent) {
        if (citizenMode === 'signup') {
          if (!citizenName.trim()) throw new Error('Full name is required for signup.');
          if (!newPassword || newPassword.length < 6) throw new Error('Create a password with minimum 6 characters.');
          await requestCitizenOtp({ ...base, mode: 'signup', password: newPassword, profile: { name: citizenName.trim() } });
          setSuccess(`Signup OTP sent to ${email}. Verify OTP to create your citizen profile.`);
        } else {
          if (!newPassword || newPassword.length < 6) throw new Error('Enter a new password with minimum 6 characters.');
          await requestCitizenOtp({ ...base, mode: 'forgot', password: newPassword });
          setSuccess(`Password reset OTP sent to ${email}.`);
        }
        setOtpSent(true);
        return;
      }

      if (!otp || otp.length < 4) throw new Error('Enter the OTP sent to your email.');
      await verifyCitizenOtp({ ...base, otp, mode: citizenMode === 'forgot' ? 'forgot' : 'signup', password: newPassword, profile: { name: citizenName.trim() } });
      if (citizenMode === 'forgot') {
        setSuccess('Password changed successfully. Now login with mobile + Gmail + password.');
        resetCitizenFlow('login');
      } else {
        navigate('/citizen');
      }
    } catch (err) { setError(err.response?.data?.error || err.message || 'Citizen action failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{background:'#020b05'}}>
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-10 overflow-hidden">
        {HERO_IMAGES.map((src, i) => <img key={src} src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000" style={{opacity:i===imgIdx?1:0}} onError={e=>e.currentTarget.style.display='none'}/>) }
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#020b05ee 0%,#020b0588 40%,transparent 70%)'}}/>
        <div className="relative z-10"><h2 className="font-orbitron text-3xl font-black mb-2" style={{color:'#00ff88'}}>Vietnam Green Future</h2><p className="text-sm font-mono" style={{color:'#81c784'}}>Real-time sustainability command center powered by FRIDAY AI.</p></div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative overflow-hidden" style={{background:'#061209'}}>
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'linear-gradient(#00ff8808 1px,transparent 1px),linear-gradient(90deg,#00ff8808 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
        <div className="w-full max-w-md relative z-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-4" style={{background:'#00ff8811',border:'1px solid #00ff8822'}}><div className="w-2 h-2 rounded-full animate-pulse" style={{background:'#00ff88'}}/><span className="text-xs font-mono" style={{color:'#00ff88'}}>GOVERNMENT DIGITAL PORTAL — SECURE ACCESS</span></div>
          <div className="flex items-center gap-4 mb-6"><div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:'#00ff8811',border:'2px solid #00ff8844'}}><Leaf size={36} style={{color:'#00ff88'}}/></div><div><h1 className="font-orbitron text-2xl font-black" style={{color:'#00ff88'}}>GreenAgentOS</h1><p className="text-xs font-mono" style={{color:'#4caf50'}}>Vietnam Sustainability Command Center</p></div></div>
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-xl" style={{background:'#0a1f0e',border:'1px solid #00ff8822'}}><button onClick={()=>setMode('admin')} className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-bold" style={mode==='admin'?{background:'#00ff88',color:'#030d07'}:{color:'#4caf50'}}><Shield size={15}/> Admin</button><button onClick={()=>setMode('citizen')} className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-bold" style={mode==='citizen'?{background:'#00ff88',color:'#030d07'}:{color:'#4caf50'}}><Users size={15}/> Citizen</button></div>
          {error && <div className="mb-3 p-3 rounded-xl text-xs font-mono" style={{background:'#ff174411',border:'1px solid #ff174444',color:'#ff8a80'}}>{error}</div>}
          {success && <div className="mb-3 p-3 rounded-xl text-xs font-mono" style={{background:'#00ff8811',border:'1px solid #00ff8844',color:'#00ff88'}}>{success}</div>}

          {mode === 'admin' ? (
            <form onSubmit={adminSubmit} className="space-y-4"><input value={username} onChange={e=>setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="Admin username"/><div className="relative"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="Password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-3 text-[#4caf50]">{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div><button disabled={loading} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-orbitron text-sm font-bold" style={{background:'#00ff88',color:'#030d07'}}>{loading?<Loader size={16} className="animate-spin"/>:'LOGIN AS ADMIN'}</button></form>
          ) : (
            <form onSubmit={citizenSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{background:'#0a1f0e',border:'1px solid #00ff8822'}}>{['login','signup','forgot'].map(m=><button type="button" key={m} onClick={()=>resetCitizenFlow(m)} className="py-2 rounded-lg text-xs font-mono font-bold" style={citizenMode===m?{background:'#00ff88',color:'#020b05'}:{color:'#4caf50'}}>{m==='forgot'?'Forgot':m[0].toUpperCase()+m.slice(1)}</button>)}</div>
              <div><label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>Mobile Number</label><div className="relative"><Smartphone size={16} className="absolute left-3 top-3.5" style={{color:'#4caf50'}}/><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="+84 901 234 567" required/></div></div>
              <div><label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>Gmail / Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-3.5" style={{color:'#4caf50'}}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="citizen@gmail.com" required/></div></div>
              {citizenMode === 'login' && <div><label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>Password</label><div className="relative"><Lock size={16} className="absolute left-3 top-3.5" style={{color:'#4caf50'}}/><input type="password" value={citizenPassword} onChange={e=>setCitizenPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="Citizen password" required/></div></div>}
              {citizenMode !== 'login' && <div><label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>{citizenMode==='signup'?'Create Password':'New Password'}</label><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="Minimum 6 characters" required/></div>}
              {citizenMode === 'signup' && !otpSent && (
                <div>
                  <label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>Full Name</label>
                  <input
                    value={citizenName}
                    onChange={e=>setCitizenName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none"
                    style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}}
                    placeholder="Full name"
                    required
                  />
                  <p className="mt-2 text-[10px] font-mono" style={{color:'#81c784'}}>City, vehicles, family members and electricity details are not asked during signup. After OTP verification, open Citizen Dashboard → Edit Profile. That saved profile updates Admin → Citizen Data live.</p>
                </div>
              )}
              {otpSent && <div><label className="block text-xs font-mono mb-1.5 uppercase tracking-widest" style={{color:'#2e7d32'}}>Enter Email OTP</label><div className="relative"><KeyRound size={16} className="absolute left-3 top-3.5" style={{color:'#4caf50'}}/><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} maxLength={6} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono outline-none tracking-[6px]" style={{background:'#0a1f0e',border:'1px solid #00ff8833',color:'#e8f5e9'}} placeholder="123456" required/></div></div>}
              <p className="text-xs font-mono" style={{color:'#81c784'}}>{citizenMode==='login'?'Citizen login goes only to citizen profile/dashboard, never admin dashboard.':'OTP is required for signup/forgot password before data changes.'}</p>
              <button disabled={loading} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-orbitron text-sm font-bold" style={{background:'#00ff88',color:'#030d07'}}>{loading?<><Loader size={16} className="animate-spin"/> Please wait...</>:otpSent?<><KeyRound size={16}/> VERIFY OTP</>:citizenMode==='login'?'LOGIN AS CITIZEN':<><Mail size={16}/> SEND EMAIL OTP</>}</button>
            </form>
          )}
          <div className="mt-6 pt-4 text-center text-xs font-mono" style={{borderTop:'1px solid #0d2e14',color:'#4caf50'}}>Admin demo: <span style={{color:'#00ff88'}}>admin</span> / <span style={{color:'#00ff88'}}>admin123</span></div>
        </div>
      </div>
    </div>
  );
}
