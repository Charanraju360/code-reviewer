import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/api/auth/login/', form);
      localStorage.setItem('access_token',  res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center px-4">

      {/* Decorative orbs */}
      <div style={{
        position:'fixed', top:'-10%', left:'-5%', width:'500px', height:'500px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0
      }}/>
      <div style={{
        position:'fixed', bottom:'-10%', right:'-5%', width:'400px', height:'400px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0
      }}/>

      <div className="relative z-10 w-full max-w-sm animate-fade-up">

        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="glass glow-accent rounded-2xl p-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(79,142,247,0.1)"/>
              <path d="M8 12l6-4 6 4v8l-6 4-6-4v-8z" stroke="#4f8ef7" strokeWidth="1.5" fill="none"/>
              <path d="M14 16l2 2 4-4" stroke="#4f8ef7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8" style={{boxShadow:'0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'}}>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{fontFamily:'Syne,sans-serif', color:'var(--text-1)', letterSpacing:'-0.02em'}}>
              AI Code Reviewer
            </h1>
            <p style={{color:'var(--text-2)', fontSize:'0.8rem'}}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div>
              <label style={{display:'block', color:'var(--text-2)', fontSize:'0.72rem', fontFamily:'Syne,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>
                Username
              </label>
              <input
                className="input-glass"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label style={{display:'block', color:'var(--text-2)', fontSize:'0.72rem', fontFamily:'Syne,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>
                Password
              </label>
              <input
                className="input-glass"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', padding:'10px 14px'}}>
                <p style={{color:'#fca5a5', fontSize:'0.8rem'}}>{error}</p>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'0.5rem', width:'100%'}}>
              {loading ? (
                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                  <span style={{width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{margin:'1.5rem 0'}}/>

          <p style={{textAlign:'center', color:'var(--text-2)', fontSize:'0.8rem'}}>
            No account?{' '}
            <Link to="/register" style={{color:'var(--accent)', textDecoration:'none', fontWeight:600}}>
              Register
            </Link>
          </p>
        </div>

        <p style={{textAlign:'center', color:'var(--text-3)', fontSize:'0.7rem', marginTop:'1.5rem'}}>
          AI-powered · Built with Django + React
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}