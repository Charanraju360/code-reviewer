import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Login() {
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await client.post('/api/auth/login/', form);
      localStorage.setItem('access_token',  res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch { setError('Invalid username or password.'); }
    finally  { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>
          AI Code Reviewer
        </span>
        <ThemeToggle />
      </div>

      {/* Center card */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:'380px' }}>

          {/* Icon */}
          <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="1.8">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.03em', marginBottom:'6px' }}>
            Sign in
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.82rem', marginBottom:'2rem' }}>
            Enter your credentials to continue
          </p>

          <div className="glass-strong" style={{ borderRadius:'14px', padding:'1.75rem' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              <div>
                <label className="field-label">Username</label>
                <input className="input-glass" placeholder="your_username"
                  value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
              </div>

              <div>
                <label className="field-label">Password</label>
                <input className="input-glass" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>

              {error && (
                <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:'8px', padding:'10px 12px' }}>
                  <p style={{ color:'var(--error)', fontSize:'0.78rem' }}>{error}</p>
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:'0.25rem' }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}><span className="spinner"/>Signing in...</span>
                  : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="divider" style={{ margin:'1.5rem 0' }}/>

          <p style={{ textAlign:'center', color:'var(--text-2)', fontSize:'0.8rem' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--text-1)', fontWeight:700, textDecoration:'underline', textUnderlineOffset:'3px' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}