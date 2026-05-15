import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ThemeToggle from '../components/ui/ThemeToggle';

const SEV = {
  error:      { dot:'var(--error)',   badge:'badge-error',      label:'Error'      },
  warning:    { dot:'var(--warning)', badge:'badge-warning',    label:'Warning'    },
  suggestion: { dot:'var(--text-3)', badge:'badge-suggestion', label:'Suggestion' },
};

function FileBadge({ comments }) {
  const e = comments.filter(c => c.severity==='error').length;
  const w = comments.filter(c => c.severity==='warning').length;
  if (e) return <span className="badge badge-error">{e}</span>;
  if (w) return <span className="badge badge-warning">{w}</span>;
  return <span className="badge badge-done">✓</span>;
}

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review,  setReview]  = useState(null);
  const [selFile, setSelFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await client.get(`/api/reviews/${id}/`);
        setReview(r.data);
        if (r.data.files?.length) setSelFile(r.data.files[0]);
      } catch { navigate('/dashboard'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span className="spinner" style={{ width:'24px', height:'24px' }}/>
    </div>
  );
  if (!review) return null;

  const allC = review.files.flatMap(f => f.comments);
  const counts = { error: allC.filter(c=>c.severity==='error').length, warning: allC.filter(c=>c.severity==='warning').length, suggestion: allC.filter(c=>c.severity==='suggestion').length };

  const byLine = {};
  if (selFile) selFile.comments.forEach(c => { (byLine[c.line_number]??=[]).push(c); });
  const lines = selFile?.file_content.split('\n') ?? [];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:'4px', fontFamily:'JetBrains Mono,monospace' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Dashboard
          </button>
          <span style={{ color:'var(--border-2)' }}>|</span>
          <span style={{ color:'var(--text-1)', fontWeight:600, fontSize:'0.82rem', fontFamily:'JetBrains Mono,monospace' }}>{review.title}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {counts.error>0      && <span className="badge badge-error">{counts.error} err</span>}
          {counts.warning>0    && <span className="badge badge-warning">{counts.warning} warn</span>}
          {counts.suggestion>0 && <span className="badge badge-suggestion">{counts.suggestion} sug</span>}
          <ThemeToggle />
        </div>
      </nav>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        <aside style={{ width:'196px', flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', overflowY:'auto' }}>
          <div style={{ padding:'9px 13px', borderBottom:'1px solid var(--border)' }}>
            <p style={{ color:'var(--text-3)', fontSize:'0.63rem', fontFamily:'Syne,sans-serif', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Files · {review.files.length}
            </p>
          </div>
          {review.files.map(f => {
            const active = selFile?.id === f.id;
            return (
              <button key={f.id} onClick={() => setSelFile(f)} style={{ width:'100%', textAlign:'left', padding:'9px 12px', background: active ? 'var(--surface-2)' : 'transparent', borderLeft: `2px solid ${active ? 'var(--text-1)' : 'transparent'}`, border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', gap:'7px', transition:'all 0.12s' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span style={{ color: active ? 'var(--text-1)' : 'var(--text-2)', fontSize:'0.72rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'JetBrains Mono,monospace' }}>
                  {f.filename.split('/').pop()}
                </span>
                <FileBadge comments={f.comments}/>
              </button>
            );
          })}
        </aside>

        {/* Code */}
        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)' }}>
          {selFile && <>
            <div style={{ position:'sticky', top:0, zIndex:10, background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'7px 14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span style={{ color:'var(--text-2)', fontSize:'0.72rem', fontFamily:'JetBrains Mono,monospace' }}>{selFile.filename}</span>
              <span style={{ color:'var(--text-3)', fontSize:'0.68rem', marginLeft:'auto' }}>{lines.length} lines</span>
            </div>
            <div style={{ padding:'6px 0' }}>
              {lines.map((line, i) => {
                const num = i+1;
                const lc  = byLine[num]||[];
                const sev = lc[0]?.severity;
                const s   = sev ? SEV[sev] : null;
                const lineBg = sev==='error' ? 'rgba(255,107,107,0.07)' : sev==='warning' ? 'rgba(255,179,71,0.07)' : sev==='suggestion' ? 'var(--surface)' : 'transparent';
                const borderL = sev ? `2px solid ${s.dot}` : '2px solid transparent';
                const textColor = sev==='error' ? 'var(--error)' : sev==='warning' ? 'var(--warning)' : 'var(--text-1)';
                return (
                  <div key={num}>
                    <div style={{ display:'flex', minHeight:'21px', paddingRight:'12px', background: lineBg, borderLeft: borderL }}>
                      <span style={{ width:'42px', textAlign:'right', paddingRight:'14px', color:'var(--text-3)', fontSize:'0.7rem', lineHeight:'21px', flexShrink:0, userSelect:'none', fontFamily:'JetBrains Mono,monospace' }}>{num}</span>
                      <span style={{ color: textColor, fontSize:'0.76rem', lineHeight:'21px', whiteSpace:'pre', flex:1, fontFamily:'JetBrains Mono,monospace' }}>{line||' '}</span>
                      {lc.length>0 && <span style={{ flexShrink:0, fontSize:'0.63rem', fontWeight:700, background:'var(--surface-2)', border:'1px solid var(--border-2)', borderRadius:'4px', padding:'0 5px', lineHeight:'19px', margin:'1px 0', color:'var(--text-2)', fontFamily:'Syne,sans-serif' }}>{lc.length}</span>}
                    </div>
                    {lc.map((c,ci) => (
                      <div key={ci} style={{ marginLeft:'42px', padding:'5px 12px', fontSize:'0.7rem', lineHeight:'1.5', color:'var(--text-2)', borderLeft:`2px solid ${SEV[c.severity].dot}`, background:'var(--surface)', marginBottom:'1px', fontFamily:'JetBrains Mono,monospace' }}>
                        <span style={{ color: SEV[c.severity].dot, fontWeight:700 }}>[{SEV[c.severity].label}]</span>{' '}{c.comment}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>}
        </main>

        {/* Comments panel */}
        <aside style={{ width:'252px', flexShrink:0, background:'var(--surface)', borderLeft:'1px solid var(--border)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'9px 13px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ color:'var(--text-3)', fontSize:'0.63rem', fontFamily:'Syne,sans-serif', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>AI Comments</p>
            {selFile && <span style={{ color:'var(--text-3)', fontSize:'0.66rem' }}>{selFile.comments.length}</span>}
          </div>
          <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:'5px', flex:1 }}>
            {!selFile ? null : selFile.comments.length===0 ? (
              <div style={{ padding:'2rem', textAlign:'center' }}>
                <p style={{ color:'var(--success)', fontSize:'0.75rem' }}>✓ No issues found</p>
              </div>
            ) : (
              [...selFile.comments].sort((a,b)=>a.line_number-b.line_number).map(c => {
                const s = SEV[c.severity];
                return (
                  <div key={c.id} style={{ borderRadius:'8px', padding:'9px 11px', background:'var(--surface-2)', border:'1px solid var(--border)', borderLeft:`3px solid ${s.dot}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                      <span className={`badge ${s.badge}`}>{s.label}</span>
                      <span style={{ color:'var(--text-3)', fontSize:'0.66rem', fontFamily:'JetBrains Mono,monospace' }}>L{c.line_number}</span>
                    </div>
                    <p style={{ color:'var(--text-2)', fontSize:'0.7rem', lineHeight:'1.5', fontFamily:'JetBrains Mono,monospace' }}>{c.comment}</p>
                  </div>
                );
              })
            )}
          </div>
          {selFile && selFile.comments.length>0 && (
            <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', flexWrap:'wrap', gap:'5px' }}>
              {['error','warning','suggestion'].map(sev => {
                const count = selFile.comments.filter(c=>c.severity===sev).length;
                if (!count) return null;
                return <span key={sev} className={`badge badge-${sev}`}>{count} {sev}{count!==1?'s':''}</span>;
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}