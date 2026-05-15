import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/api/auth/register/', form);
      navigate('/login');
    } catch {
      setError('Registration failed. Username may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center px-4">

      <div style={{
        position:'fixed', top:'-10%', right:'-5%', width:'500px', height:'500px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0
      }}/>
      <div style={{
        position:'fixed', bottom:'-10%', left:'-5%', width:'400px', height:'400px',
        borderRadius:'50%', background:'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0
      }}/>

      <div className="relative z-10 w-full max-w-sm animate-fade-up">

        <div className="flex justify-center mb-8">
          <div className="glass glow-gold rounded-2xl p-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(201,168,76,0.1)"/>
              <circle cx="16" cy="12" r="4" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
              <path d="M8 24c0-4 3.6-7 8-7s8 3 8 7" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M22 10l1.5 1.5L26 9" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-8" style={{boxShadow:'0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'}}>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{fontFamily:'Syne,sans-serif', color:'var(--text-1)', letterSpacing:'-0.02em'}}>
              Create Account
            </h1>
            <p style={{color:'var(--text-2)', fontSize:'0.8rem'}}>Start reviewing code with AI</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {[
              {label:'Username', key:'username', type:'text',     placeholder:'your_username'},
              {label:'Email',    key:'email',    type:'email',    placeholder:'you@email.com (optional)'},
              {label:'Password', key:'password', type:'password', placeholder:'min 6 characters'},
            ].map(({label, key, type, placeholder}) => (
              <div key={key}>
                <label style={{display:'block', color:'var(--text-2)', fontSize:'0.72rem', fontFamily:'Syne,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>
                  {label}
                </label>
                <input
                  className="input-glass"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  required={key !== 'email'}
                />
              </div>
            ))}

            {error && (
              <div style={{background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', padding:'10px 14px'}}>
                <p style={{color:'#fca5a5', fontSize:'0.8rem'}}>{error}</p>
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'0.5rem', width:'100%', background:'linear-gradient(135deg, #c9a84c 0%, #a8873a 100%)', boxShadow:'0 4px 15px rgba(201,168,76,0.3)'}}>
              {loading ? (
                <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                  <span style={{width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="divider" style={{margin:'1.5rem 0'}}/>

          <p style={{textAlign:'center', color:'var(--text-2)', fontSize:'0.8rem'}}>
            Have an account?{' '}
            <Link to="/login" style={{color:'var(--accent)', textDecoration:'none', fontWeight:600}}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}