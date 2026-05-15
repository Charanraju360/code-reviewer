import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Dashboard() {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { const r = await client.get('/api/reviews/'); setReviews(r.data); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('title', file.name);
    try {
      const r = await client.post('/api/reviews/', fd, { headers:{'Content-Type':'multipart/form-data'} });
      navigate(`/review/${r.data.id}`);
    } catch { alert('Upload failed. Check backend is running and OpenRouter key is valid.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this review?')) return;
    await client.delete(`/api/reviews/${id}/`);
    setReviews(reviews.filter(r => r.id !== id));
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status}`}>{status}</span>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'var(--surface-2)', border:'1px solid var(--border-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'var(--text-1)' }}>
            AI Code Reviewer
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <ThemeToggle />
          <button className="btn-ghost" onClick={() => { localStorage.clear(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2.5rem 1.5rem', width:'100%', display:'flex', flexDirection:'column', gap:'2rem' }}>

        {/* Upload section */}
        <div className="fade-up glass-strong" style={{ borderRadius:'16px', padding:'1.75rem' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--text-1)', marginBottom:'4px' }}>
            New Review
          </h2>
          <p style={{ color:'var(--text-2)', fontSize:'0.78rem', marginBottom:'1.25rem' }}>
            Upload a code file or .zip — AI reviews every file
          </p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--text-1)' : 'var(--border-2)'}`,
              borderRadius:'10px', padding:'2rem', textAlign:'center',
              background: dragOver ? 'var(--surface-2)' : 'var(--surface)',
              cursor:'pointer', transition:'all 0.15s', marginBottom:'1rem',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={dragOver ? 'var(--text-1)' : 'var(--text-3)'} strokeWidth="1.5"
              style={{ margin:'0 auto 8px', display:'block' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ color: file ? 'var(--text-1)' : 'var(--text-2)', fontSize:'0.85rem', fontWeight: file ? 600 : 400 }}>
              {file ? `${file.name}` : 'Drop file here or click to browse'}
            </p>
            <p style={{ color:'var(--text-3)', fontSize:'0.7rem', marginTop:'4px' }}>
              .py .js .ts .jsx .tsx .java .go .cpp .html .css .zip
            </p>
            <input id="fileInput" type="file" style={{ display:'none' }}
              accept=".py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.go,.rb,.php,.css,.html,.zip"
              onChange={e => setFile(e.target.files[0])} />
          </div>

          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading}
              style={{ flex:1 }}>
              {uploading
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    <span className="spinner"/>AI Analyzing...
                  </span>
                : 'Upload & Review'}
            </button>
            {file && <button className="btn-ghost" onClick={() => setFile(null)}>Clear</button>}
          </div>

          {uploading && (
            <p style={{ color:'var(--text-2)', fontSize:'0.75rem', marginTop:'0.75rem', textAlign:'center' }}>
              This may take 10–30 seconds depending on file size...
            </p>
          )}
        </div>

        {/* Past reviews */}
        <div className="fade-up delay-1">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--text-1)' }}>
              Past Reviews
            </h2>
            {reviews.length > 0 && (
              <span style={{ color:'var(--text-3)', fontSize:'0.72rem' }}>{reviews.length} total</span>
            )}
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'68px' }}/>)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass" style={{ borderRadius:'12px', padding:'3rem', textAlign:'center' }}>
              <p style={{ color:'var(--text-3)', fontSize:'0.82rem' }}>No reviews yet — upload a file above</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {reviews.map((r, i) => (
                <div key={r.id} className="glass glass-hover" onClick={() => navigate(`/review/${r.id}`)}
                  style={{ borderRadius:'12px', padding:'1rem 1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem', animationDelay:`${i*0.04}s` }}>

                  {/* File icon */}
                  <div style={{ width:'34px', height:'34px', flexShrink:0, borderRadius:'8px', background:'var(--surface-2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'var(--text-1)', fontWeight:600, fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {r.title}
                    </p>
                    <p style={{ color:'var(--text-3)', fontSize:'0.7rem', marginTop:'2px' }}>
                      {new Date(r.created_at).toLocaleString()} · {r.file_count} file{r.file_count !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Right side */}
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                    <StatusBadge status={r.status}/>
                    <button
                      onClick={e => handleDelete(e, r.id)}
                      style={{ background:'transparent', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'0.72rem', fontFamily:'JetBrains Mono,monospace', padding:'4px 8px', borderRadius:'6px', transition:'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--error)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}