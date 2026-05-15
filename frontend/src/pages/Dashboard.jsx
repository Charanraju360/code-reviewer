import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const STATUS_STYLE = {
  done:    { bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.3)',  color:'#6ee7b7'  },
  pending: { bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)',  color:'#fcd34d'  },
  failed:  { bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)', color:'#fca5a5'  },
};

export default function Dashboard() {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/api/reviews/');
        setReviews(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file',  file);
    formData.append('title', file.name);
    try {
      const res = await client.post('/api/reviews/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/review/${res.data.id}`);
    } catch {
      alert('Upload failed. Check backend is running and OpenRouter API key is valid.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this review?')) return;
    await client.delete(`/api/reviews/${id}/`);
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="bg-mesh min-h-screen flex flex-col">

      {/* Orbs */}
      <div style={{position:'fixed',top:0,left:0,width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'fixed',bottom:0,right:0,width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      {/* Navbar */}
      <nav className="glass" style={{position:'sticky',top:0,zIndex:50,borderLeft:'none',borderRight:'none',borderTop:'none',padding:'0 2rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'rgba(79,142,247,0.15)',border:'1px solid rgba(79,142,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'var(--text-1)',letterSpacing:'-0.01em'}}>
            AI Code Reviewer
          </span>
        </div>
        <button className="btn-ghost" onClick={() => { localStorage.clear(); navigate('/login'); }}>
          Sign out
        </button>
      </nav>

      <div style={{maxWidth:'860px',margin:'0 auto',padding:'2.5rem 1.5rem',width:'100%',position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:'2rem'}}>

        {/* Upload card */}
        <div className="animate-fade-up glass-strong rounded-2xl p-6" style={{boxShadow:'0 20px 40px rgba(0,0,0,0.3)'}}>
          <div style={{marginBottom:'1.25rem'}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'var(--text-1)',marginBottom:'4px'}}>New Review</h2>
            <p style={{color:'var(--text-2)',fontSize:'0.78rem'}}>Upload a code file or .zip folder — AI reviews every file instantly</p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--glass-border)'}`,
              borderRadius:'12px',
              padding:'2rem',
              textAlign:'center',
              background: dragOver ? 'rgba(79,142,247,0.05)' : 'rgba(255,255,255,0.02)',
              transition:'all 0.2s ease',
              marginBottom:'1rem',
              cursor:'pointer',
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.5" style={{margin:'0 auto 8px'}}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{color: file ? 'var(--text-1)' : 'var(--text-2)', fontSize:'0.85rem', fontWeight: file ? 600 : 400}}>
              {file ? `📄 ${file.name}` : 'Drop file here or click to browse'}
            </p>
            <p style={{color:'var(--text-3)', fontSize:'0.72rem', marginTop:'4px'}}>
              .py .js .ts .jsx .tsx .java .go .cpp .zip
            </p>
            <input
              id="fileInput"
              type="file"
              style={{display:'none'}}
              accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.go,.rb,.php,.css,.html,.zip"
              onChange={e => setFile(e.target.files[0])}
            />
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{flex:1}}
            >
              {uploading ? (
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <span style={{width:'14px',height:'14px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>
                  AI Analyzing...
                </span>
              ) : 'Upload & Review'}
            </button>
            {file && (
              <button className="btn-ghost" onClick={() => setFile(null)}>Clear</button>
            )}
          </div>

          {uploading && (
            <div style={{marginTop:'1rem',padding:'10px 14px',background:'rgba(79,142,247,0.08)',border:'1px solid rgba(79,142,247,0.2)',borderRadius:'8px'}}>
              <p style={{color:'#93c5fd',fontSize:'0.78rem'}}>⚡ AI is reviewing your code — this takes 10–30 seconds...</p>
            </div>
          )}
        </div>

        {/* Past reviews */}
        <div className="animate-fade-up animate-delay-2">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'var(--text-1)'}}>Past Reviews</h2>
            {reviews.length > 0 && (
              <span style={{color:'var(--text-3)',fontSize:'0.75rem'}}>{reviews.length} total</span>
            )}
          </div>

          {loading ? (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-glass" style={{height:'72px'}}/>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass rounded-xl" style={{padding:'3rem',textAlign:'center'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'var(--glass-bg)',border:'1px solid var(--glass-border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{color:'var(--text-3)',fontSize:'0.85rem'}}>No reviews yet — upload your first file above</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {reviews.map((r, i) => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                return (
                  <div
                    key={r.id}
                    className="glass glass-hover rounded-xl"
                    onClick={() => navigate(`/review/${r.id}`)}
                    style={{padding:'1rem 1.25rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'1rem',animationDelay:`${i * 0.05}s`}}
                  >
                    {/* Icon */}
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--glass-border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:'var(--text-1)',fontWeight:600,fontSize:'0.875rem',marginBottom:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.title}</p>
                      <p style={{color:'var(--text-3)',fontSize:'0.72rem'}}>
                        {new Date(r.created_at).toLocaleString()} · {r.file_count} file{r.file_count !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Status */}
                    <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                      <span style={{background:st.bg,border:`1px solid ${st.border}`,color:st.color,padding:'2px 10px',borderRadius:'20px',fontSize:'0.7rem',fontFamily:'Syne,sans-serif',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                        {r.status}
                      </span>
                      <button
                        onClick={e => handleDelete(e, r.id)}
                        style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',color:'#fca5a5',borderRadius:'8px',padding:'4px 10px',fontSize:'0.72rem',cursor:'pointer',transition:'all 0.15s'}}
                        onMouseEnter={e => e.target.style.background='rgba(248,113,113,0.2)'}
                        onMouseLeave={e => e.target.style.background='rgba(248,113,113,0.08)'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}