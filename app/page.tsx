import Navbar from '@/components/Navbar'
import Link from 'next/link'

const matches = [
  { league: 'UEFA Champions League', home: 'Man City', away: 'R. Madrid', homeIcon: '🔵', awayIcon: '⚪', score: '2 – 1', time: "67'", live: true, odds: ['1.85','3.40','4.20'] },
  { league: 'NBA Playoffs', home: 'Lakers', away: 'Celtics', homeIcon: '💛', awayIcon: '🟢', score: '98 – 102', time: 'Q4 3:12', live: true, odds: ['2.10','1.90','1.75'] },
  { league: 'La Liga', home: 'Barcelona', away: 'Atletico', homeIcon: '🔴', awayIcon: '🔵', score: 'vs', time: 'Hoy 20:00', live: false, odds: ['1.60','3.80','5.50'] },
  { league: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeIcon: '🔴', awayIcon: '🔵', score: '1 – 1', time: "88'", live: true, odds: ['2.50','3.20','2.80'] },
]

export default function Home() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0A0E1A}
        ::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}
        .match-card:hover{border-color:rgba(0,255,136,0.3) !important; transform:translateY(-3px);}
        .odd-btn:hover{background:rgba(0,255,136,0.1) !important; border-color:#00FF88 !important;}
        .btn-green:hover{background:#00cc6a !important; transform:translateY(-2px);}
        .step-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#00FF88,transparent);}
        .ver-todos:hover{background:rgba(0,255,136,0.08) !important; border-color:rgba(0,255,136,0.3) !important; color:#00FF88 !important;}
      `}</style>

      {/* TICKER */}
      <div style={{marginTop:'64px', background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'10px 0', overflow:'hidden'}}>
        <div style={{display:'flex', gap:'48px', animation:'ticker 30s linear infinite', whiteSpace:'nowrap', width:'max-content'}}>
          {[...Array(3)].flatMap((_, i) => matches.map((m, j) => (
            <span key={i+'-'+j} style={{fontSize:'12px', fontFamily:'monospace', color:'#9CA3AF', display:'inline-flex', alignItems:'center', gap:'10px'}}>
              <span style={{color:'#F9FAFB', fontWeight:600}}>{m.homeIcon} {m.home} vs {m.awayIcon} {m.away}</span>
              <span style={{color: m.live ? '#00FF88' : '#6B7280'}}>{m.score}</span>
              {m.live && <span style={{color:'#EF4444', fontSize:'10px', fontWeight:700}}>LIVE</span>}
            </span>
          )))}
        </div>
      </div>

      {/* HERO */}
      <section style={{position:'relative', padding:'100px 40px 80px', overflow:'hidden', minHeight:'90vh', display:'flex', alignItems:'center'}}>
        <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,136,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.04) 1px,transparent 1px)', backgroundSize:'52px 52px'}} />
        <div style={{position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'700px', height:'500px', background:'radial-gradient(ellipse, rgba(0,255,136,.12) 0%, transparent 65%)', pointerEvents:'none'}} />
        <div style={{position:'relative', maxWidth:'800px'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(0,255,136,.08)', border:'1px solid rgba(0,255,136,.25)', color:'#00FF88', borderRadius:'999px', padding:'6px 16px', fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'32px'}}>
            <span style={{width:'6px', height:'6px', background:'#00FF88', borderRadius:'50%', animation:'pulse 2s infinite'}} />
            100% Gratis - Sin dinero real
          </div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(52px, 9vw, 96px)', fontWeight:700, lineHeight:1.0, letterSpacing:'-2px', marginBottom:'24px'}}>
            Apuesta.<br/>Acumula.<br/>
            <span style={{color:'#00FF88'}}>Gana premios.</span>
          </h1>
          <p style={{fontSize:'18px', color:'#9CA3AF', maxWidth:'500px', lineHeight:1.75, marginBottom:'40px'}}>
            Predice resultados deportivos, gana puntos y canjealos por tarjetas de regalo reales. Sin riesgo, sin deposito, 100% gratis.
          </p>
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <Link href="/login" className="btn-green" style={{display:'inline-block', padding:'16px 36px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'16px', textDecoration:'none', transition:'all .2s'}}>
              Crear cuenta gratis
            </Link>
            <Link href="/partidos" style={{display:'inline-block', padding:'16px 36px', borderRadius:'10px', border:'1px solid #374151', color:'#F9FAFB', fontWeight:500, fontSize:'16px', textDecoration:'none'}}>
              Ver partidos en vivo
            </Link>
          </div>
          <div style={{display:'flex', gap:'48px', marginTop:'64px', flexWrap:'wrap'}}>
            {[
              {num:'48K',   label:'Usuarios activos'},
              {num:'$320K', label:'En premios entregados'},
              {num:'12+',   label:'Deportes disponibles'},
              {num:'$0',    label:'Costo de registro'},
            ].map(s => (
              <div key={s.label}>
                <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'32px', fontWeight:600, color:'#00FF88'}}>{s.num}</div>
                <div style={{fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'1.5px', marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTIDOSS - PREVIEW */}
      <section style={{padding:'80px 40px', background:'#0F1520'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'40px', flexWrap:'wrap', gap:'16px'}}>
          <div>
            <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>En vivo ahora</div>
            <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700}}>
              Partidos <span style={{color:'#00FF88'}}>disponibles</span>
            </h2>
          </div>
          <Link href="/partidos" className="ver-todos" style={{padding:'12px 28px', borderRadius:'10px', border:'1px solid #374151', color:'#9CA3AF', fontSize:'14px', fontWeight:500, textDecoration:'none', transition:'all .2s'}}>
            Ver todos los partidos →
          </Link>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px'}}>
          {matches.map((m, i) => (
            <div key={i} className="match-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px', transition:'all .2s', cursor:'pointer'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
                <span style={{fontSize:'10px', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'#6B7280'}}>{m.league}</span>
                {m.live
                  ? <span style={{display:'flex', alignItems:'center', gap:'5px', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:'999px', padding:'3px 10px', fontSize:'10px', fontWeight:700}}>
                      <span style={{width:'5px', height:'5px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1.2s infinite'}}/>LIVE
                    </span>
                  : <span style={{fontSize:'11px', color:'#6B7280', fontFamily:'monospace'}}>{m.time}</span>
                }
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
                <div style={{textAlign:'center', flex:1}}>
                  <div style={{fontSize:'26px', marginBottom:'6px'}}>{m.homeIcon}</div>
                  <div style={{fontSize:'13px', fontWeight:600}}>{m.home}</div>
                </div>
                <div style={{textAlign:'center', padding:'0 12px'}}>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700}}>{m.score}</div>
                  {m.live && <div style={{fontSize:'11px', color:'#00FF88', fontFamily:'monospace', marginTop:'2px'}}>{m.time}</div>}
                </div>
                <div style={{textAlign:'center', flex:1}}>
                  <div style={{fontSize:'26px', marginBottom:'6px'}}>{m.awayIcon}</div>
                  <div style={{fontSize:'13px', fontWeight:600}}>{m.away}</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                {['1','X','2'].map((label, j) => (
                  <button key={j} className="odd-btn" style={{background:'#0F1520', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'10px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
                    <span style={{fontSize:'10px', color:'#6B7280', fontWeight:600}}>{label}</span>
                    <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#00FF88'}}>{m.odds[j]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center', marginTop:'36px'}}>
          <Link href="/partidos" style={{display:'inline-block', padding:'14px 40px', borderRadius:'10px', border:'1px solid rgba(0,255,136,0.25)', color:'#00FF88', fontSize:'14px', fontWeight:600, textDecoration:'none', background:'rgba(0,255,136,0.05)'}}>
            Ver todos los partidos →
          </Link>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{padding:'80px 40px', background:'#0A0E1A'}}>
        <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>El proceso</div>
        <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:700, marginBottom:'48px'}}>
          Ganar es <span style={{color:'#00FF88'}}>asi de simple</span>
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'20px'}}>
          {[
            {num:'01', icon:'🆓', title:'Registrate gratis',   desc:'Crea tu cuenta en 30 segundos. Sin tarjeta. Recibes 500 puntos de bienvenida.'},
            {num:'02', icon:'📺', title:'Gana puntos',         desc:'Mira anuncios cortos, predice resultados y completa desafios diarios.'},
            {num:'03', icon:'⚽', title:'Apuesta tus puntos',  desc:'Elige un partido y multiplica tu saldo si aciertas el resultado.'},
            {num:'04', icon:'🎁', title:'Canjea premios',      desc:'Acumula puntos y canjealos por tarjetas de regalo reales.'},
          ].map(s => (
            <div key={s.num} className="step-card" style={{position:'relative', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'28px 24px', overflow:'hidden'}}>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'48px', fontWeight:700, color:'rgba(0,255,136,0.08)', lineHeight:1, marginBottom:'16px'}}>{s.num}</div>
              <div style={{fontSize:'32px', marginBottom:'12px'}}>{s.icon}</div>
              <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'8px'}}>{s.title}</div>
              <div style={{fontSize:'13px', color:'#9CA3AF', lineHeight:1.7}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'100px 40px', textAlign:'center', position:'relative', overflow:'hidden', background:'#0F1520'}}>
        <div style={{position:'absolute', bottom:'-60px', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse, rgba(0,255,136,.08) 0%, transparent 70%)', pointerEvents:'none'}} />
        <div style={{position:'relative'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'16px'}}>Empieza hoy</div>
          <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(36px,6vw,64px)', fontWeight:700, lineHeight:1.1, marginBottom:'16px'}}>
            Tu primer premio<br/><span style={{color:'#00FF88'}}>esta a un registro</span>
          </h2>
          <p style={{color:'#9CA3AF', fontSize:'17px', marginBottom:'40px'}}>Unete a miles de usuarios que ya ganan premios reales cada semana.</p>
          <Link href="/login" className="btn-green" style={{display:'inline-block', padding:'18px 48px', borderRadius:'12px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'17px', textDecoration:'none', transition:'all .2s'}}>
            Comenzar gratis
          </Link>
          <p style={{fontSize:'12px', color:'#4B5563', marginTop:'16px'}}>Sin tarjeta · Sin deposito · 500 puntos de bienvenida</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0A0E1A', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'60px 40px 32px'}}>
        <div style={{background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.15)', borderRadius:'10px', padding:'14px 18px', fontSize:'11px', color:'#6B7280', marginBottom:'48px', lineHeight:1.7}}>
          ScoreBet es una plataforma de entretenimiento con puntos virtuales. No implica dinero real ni apuestas reales. Solo mayores de 13 anos.
        </div>
       <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'40px', marginBottom:'40px'}}>
          <div>
            <div style={{fontFamily:'Rajdhani, sans-serif', fontWeight:700, fontSize:'22px', letterSpacing:'1px', marginBottom:'12px'}}>
              SCORE<span style={{color:'#00FF88'}}>BET</span>
            </div>
            <p style={{fontSize:'13px', color:'#6B7280', lineHeight:1.7}}>
              La plataforma de predicciones deportivas donde ganar es gratis.
            </p>
          </div>
        
          {[
            {
              title: 'Plataforma',
              links: [
                { label: 'Partidos en vivo', href: '/partidos' },
                { label: 'Mis apuestas', href: '/mis-apuestas' },
                { label: 'Recompensas', href: '/recompensas' },
                { label: 'Referidos', href: '/referidos' },
              ],
            },
            {
             title: 'Empresa',
              links: [
                { label: 'Sobre nosotros', href: '/sobre-nosotros' },
                { label: 'Blog',           href: '/sobre-nosotros' },
                { label: 'Afiliados',      href: '/apuestas-reales' },
                { label: 'Contacto',       href: '/contacto' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Terminos de uso', href: '/terminos' },
                { label: 'Privacidad', href: '/privacidad' },
                { label: 'Politica de puntos', href: '/politica-puntos' },
                { label: 'Cookies', href: '/cookies' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#F9FAFB',
                  marginBottom: '16px',
                }}
              >
                {col.title}
              </div>

              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#6B7280',
                    textDecoration: 'none',
                    marginBottom: '10px',
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}
