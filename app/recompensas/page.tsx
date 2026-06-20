import Navbar from '@/components/Navbar'

const rewards = [
  { icon:'🛒', name:'Amazon $5',        pts:50000,  usd:5,  cat:'Compras' },
  { icon:'🛒', name:'Amazon $10',       pts:100000, usd:10, cat:'Compras' },
  { icon:'🛒', name:'Amazon $25',       pts:250000, usd:25, cat:'Compras' },
  { icon:'🛒', name:'Amazon $50',       pts:500000, usd:50, cat:'Compras' },
  { icon:'🎮', name:'Google Play $5',   pts:50000,  usd:5,  cat:'Gaming' },
  { icon:'🎮', name:'Google Play $10',  pts:100000, usd:10, cat:'Gaming' },
  { icon:'🎮', name:'Steam $10',        pts:100000, usd:10, cat:'Gaming' },
  { icon:'🎮', name:'Steam $20',        pts:200000, usd:20, cat:'Gaming' },
  { icon:'🎬', name:'Netflix 1 mes',    pts:150000, usd:15, cat:'Streaming' },
  { icon:'🎵', name:'Spotify 1 mes',    pts:110000, usd:11, cat:'Streaming' },
  { icon:'📺', name:'Disney+ 1 mes',    pts:130000, usd:13, cat:'Streaming' },
  { icon:'🍎', name:'Apple $5',         pts:50000,  usd:5,  cat:'Apple' },
  { icon:'🍎', name:'Apple $10',        pts:100000, usd:10, cat:'Apple' },
]

const USER_POINTS = 0

export default function Recompensas() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; }
        .reward-card:hover { border-color:#F59E0B !important; transform:translateY(-4px); box-shadow:0 12px 40px rgba(245,158,11,0.12) !important; }
        .btn-canjear:hover { background:#00cc6a !important; }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'40px 40px 36px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Catalogo de premios</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(32px,5vw,52px)', fontWeight:700, marginBottom:'24px'}}>
            Que puedes <span style={{color:'#00FF88'}}>ganar?</span>
          </h1>

          {/* Equivalencia y saldo */}
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:'12px', background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'12px', padding:'14px 24px'}}>
              <span style={{fontSize:'13px', color:'#9CA3AF'}}>Tu saldo</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'24px', fontWeight:700, color:'#00FF88'}}>{USER_POINTS.toLocaleString()}</span>
              <span style={{fontSize:'13px', color:'#6B7280'}}>pts</span>
            </div>
            <div style={{display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'12px', padding:'14px 24px'}}>
              <span style={{fontSize:'20px'}}>💱</span>
              <span style={{fontSize:'14px', color:'#9CA3AF'}}>Equivalencia:</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#3B82F6'}}>50,000 pts = $5 USD</span>
            </div>
          </div>
        </div>

        {/* PROGRESO hacia primer canje */}
        <div style={{padding:'32px 40px', background:'#0A0E1A', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{maxWidth:'600px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
              <span style={{fontSize:'13px', color:'#9CA3AF', fontWeight:500}}>Progreso al primer premio</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'13px', color:'#00FF88', fontWeight:600}}>{USER_POINTS.toLocaleString()} / 50,000 pts</span>
            </div>
            <div style={{background:'#1F2937', borderRadius:'999px', height:'8px', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${Math.min((USER_POINTS/50000)*100, 100)}%`, background:'linear-gradient(90deg, #00FF88, #3B82F6)', borderRadius:'999px', transition:'width .5s ease'}} />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'8px'}}>
              <span style={{fontSize:'11px', color:'#4B5563'}}>0</span>
              <span style={{fontSize:'11px', color:'#4B5563'}}>50,000 pts = $5 USD</span>
            </div>
          </div>
        </div>

        {/* COMO GANAR PUNTOS */}
        <div style={{padding:'32px 40px', background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#6B7280', marginBottom:'16px'}}>Como ganar puntos</div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {[
              { icon:'📺', label:'Ver anuncio', pts:'+50 pts', sub:'hasta 10/día' },
              { icon:'✅', label:'Acertar partido', pts:'×cuota', sub:'segun apuesta' },
              { icon:'👥', label:'Referir amigo', pts:'+300 pts', sub:'sin limite' },
              { icon:'🎁', label:'Bienvenida', pts:'+500 pts', sub:'una sola vez' },
            ].map(item => (
              <div key={item.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'12px', minWidth:'200px'}}>
                <span style={{fontSize:'24px'}}>{item.icon}</span>
                <div>
                  <div style={{fontSize:'13px', fontWeight:600}}>{item.label}</div>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'14px', color:'#00FF88', fontWeight:700}}>{item.pts}</div>
                  <div style={{fontSize:'11px', color:'#6B7280'}}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATALOGO POR CATEGORIA */}
        {['Compras', 'Gaming', 'Streaming', 'Apple'].map(cat => (
          <div key={cat} style={{padding:'40px 40px 0'}}>
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
              <div style={{width:'3px', height:'20px', background:'#00FF88', borderRadius:'2px'}} />
              <span style={{fontSize:'13px', fontWeight:700, color:'#F9FAFB', letterSpacing:'1px', textTransform:'uppercase'}}>{cat}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'14px', marginBottom:'16px'}}>
              {rewards.filter(r => r.cat === cat).map(r => {
                const canRedeem = USER_POINTS >= r.pts
                return (
                  <div key={r.name} className="reward-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center', cursor:'pointer', transition:'all .2s', opacity: canRedeem ? 1 : 0.7}}>
                    <div style={{fontSize:'40px'}}>{r.icon}</div>
                    <div style={{fontSize:'15px', fontWeight:700}}>{r.name}</div>
                    <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'13px', color:'#F59E0B', fontWeight:600, background:'rgba(245,158,11,.08)', padding:'4px 12px', borderRadius:'999px'}}>
                      {r.pts.toLocaleString()} pts
                    </div>
                    <div style={{fontSize:'11px', color:'#6B7280'}}>
                      = ${r.usd} USD
                    </div>
                    {/* Barra de progreso mini */}
                    <div style={{width:'100%', background:'#1F2937', borderRadius:'999px', height:'4px'}}>
                      <div style={{height:'100%', width:`${Math.min((USER_POINTS/r.pts)*100,100)}%`, background: canRedeem ? '#00FF88' : '#3B82F6', borderRadius:'999px'}} />
                    </div>
                    <button className="btn-canjear" style={{width:'100%', padding:'11px', borderRadius:'8px', background: canRedeem ? '#00FF88' : '#1F2937', color: canRedeem ? '#0A0E1A' : '#4B5563', border: canRedeem ? 'none' : '1px solid #374151', fontSize:'13px', fontWeight:700, cursor: canRedeem ? 'pointer' : 'not-allowed', transition:'all .2s', fontFamily:'Inter, sans-serif'}}>
                      {canRedeem ? '🎉 Canjear ahora' : `Faltan ${(r.pts - USER_POINTS).toLocaleString()} pts`}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{height:'60px'}} />
      </div>
    </main>
  )
}
