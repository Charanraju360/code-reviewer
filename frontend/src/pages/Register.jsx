import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Register() {
  const [form,    setForm]    = useState({ username:'', email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await client.post('/api/auth/register/', form);
      navigate('/login');
    } catch { setError('Registration failed. Username may already be taken.'); }
    finally  { setLoading(false); }
  };

  const fields = [
    { label:'Username', key:'username', type:'text',     placeholder:'your_username',          required:true  },
    { label:'Email',    key:'email',    type:'email',    placeholder:'you@email.com (optional)',required:false },
    { label:'Password', key:'password', type:'password', placeholder:'min 6 characters',        required:true  },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>
          AI Code Reviewer
        </span>
        <ThemeToggle />
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:'380px' }}>

          <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.03em', marginBottom:'6px' }}>
            Create account
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:'0.82rem', marginBottom:'2rem' }}>
            Start reviewing code with AI today
          </p>

          <div className="glass-strong" style={{ borderRadius:'14px', padding:'1.75rem' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {fields.map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="field-label">{label}</label>
                  <input className="input-glass" type={type} placeholder={placeholder}
                    value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                    required={required} />
                </div>
              ))}

              {error && (
                <div style={{ background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', borderRadius:'8px', padding:'10px 12px' }}>
                  <p style={{ color:'var(--error)', fontSize:'0.78rem' }}>{error}</p>
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:'0.25rem' }}>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}><span className="spinner"/>Creating account...</span>
                  : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="divider" style={{ margin:'1.5rem 0' }}/>

          <p style={{ textAlign:'center', color:'var(--text-2)', fontSize:'0.8rem' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color:'var(--text-1)', fontWeight:700, textDecoration:'underline', textUnderlineOffset:'3px' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}