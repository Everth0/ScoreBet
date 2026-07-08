'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const casas = [
  {
    nombre:   '1xBet',
    logo:     '🎰',
    color:    '#1a56db',
    bg:       'rgba(26,86,219,0.08)',
    border:   'rgba(26,86,219,0.25)',
    bono:     'Bono de bienvenida 100% hasta $100',
    features: ['Mas de 1,000 deportes', 'Casino en vivo', 'App movil', 'Retiro rapido'],
    badge:    '⭐ MAS POPULAR',
    badgeColor: '#F59E0B',
    url:      'https://refpa5747689.top/L?tag=d_5747689m_184991c_&site=5747689&ad=184991',
    rating:   4.8,
  },
  {
    nombre:   'Betsson',
    logo:     '🏆',
    color:    '#00a651',
    bg:       'rgba(0,166,81,0.08)',
    border:   'rgba(0,166,81,0.25)',
    bono:     'Bono de bienvenida hasta $200',
    features: ['Cuotas competitivas', 'Streaming en vivo', 'Cash out', 'Soporte 24/7'],
    badge:    '💎 PREMIUM',
    badgeColor: '#8B5CF6',
    url:      'https://betsson.com',
    rating:   4.7,
  },
  {
    nombre:   'Bet365',
    logo:     '⚽',
    color:    '#027b5b',
    bg:       'rgba(2,123,91,0.08)',
    border:   'rgba(2,123,91,0.25)',
    bono:     'Hasta $30 en apuestas gratis',
    features: ['Lider mundial', 'In-Play superior', 'Estadisticas avanzadas', 'Streaming gratis'],
    badge:    '🌍 LIDER MUNDIAL',
    badgeColor: '#00FF88',
    url:      'https://bet365.com',
    rating:   4.9,
  },
  {
    nombre:   'Codere',
    logo:     '🎯',
    color:    '#e30613',
    bg:       'rgba(227,6,19,0.08)',
    border:   'rgba(227,6,19,0.25)',
    bono:     'Bono de bienvenida hasta $150',
    features: ['Perfecto para LATAM', 'Futbol sudamericano', 'Pagos en local', 'Soporte espanol'],
    badge:    '🌎 MEJOR LATAM',
    badgeColor: '#3B82F6',
    url:      'https://codere.com',
    rating:   4.6,
  },
]

export default function ApuestasReales() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .casa-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.3) !important; }
        .btn-jugar:hover { opacity:0.9 !important; transform:translateY(-1px); }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'linear-gradient(135deg, #0F1520 0%, #0A0E1A 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'40px 24px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:'-60px', right:'-60px', width:'300px', height:'300px', background:'radial-gradient(ellipse, rgba(0,255,136,.06) 0%, transparent 70%)', pointerEvents:'none'}}/>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Apuestas con dinero real</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'12px'}}>
            Lleva tus apuestas <span style={{color:'#00FF88'}}>al siguiente nivel</span>
          </h1>
          <p style={{fontSize:'15px', color:'#9CA3AF', maxWidth:'560px', lineHeight:1.7, marginBottom:'20px'}}>
            Ya dominaste las apuestas con puntos en ScoreBet. Ahora prueba suerte con dinero real en las mejores casas de apuestas del mundo.
          </p>
          <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'10px', padding:'10px 16px', fontSize:'12px', color:'#F59E0B'}}>
            ⚠️ Apuesta con responsabilidad. Solo mayores de 18 anos.
          </div>
        </div>

        {/* BANNER 1XBET */}
        <div style={{padding:'24px 24px 0'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#6B7280', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'20px', height:'1px', background:'#374151', display:'inline-block'}}/>
            Oferta destacada
          </div>
          <div style={{borderRadius:'14px', overflow:'hidden', border:'1px solid rgba(26,86,219,0.3)', background:'#111827'}}>
            <iframe
              scrolling="no"
              frameBorder="0"
              style={{padding:'0px', margin:'0px', border:'0px', borderStyle:'none', display:'block'}}
              width="100%"
              height="250"
              src="https://refbanners.com/I?tag=d_5747689m_184991c_&site=5747689&ad=184991"
            />
          </div>
        </div>

        {/* BENEFICIOS */}
        <div style={{padding:'24px', background:'#0F1520', margin:'24px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center'}}>
            {[
              {icon:'💰', title:'Gana dinero real',    desc:'Convierte tu conocimiento en ganancias'},
              {icon:'🎁', title:'Bonos de bienvenida', desc:'Hasta $200 gratis al registrarte'},
              {icon:'📱', title:'Apps moviles',        desc:'Apuesta desde tu Android'},
              {icon:'⚡', title:'Retiros rapidos',     desc:'Cobra en menos de 24 horas'},
            ].map(item => (
              <div key={item.title} style={{textAlign:'center', maxWidth:'140px'}}>
                <div style={{fontSize:'28px', marginBottom:'8px'}}>{item.icon}</div>
                <div style={{fontSize:'13px', fontWeight:700, marginBottom:'4px'}}>{item.title}</div>
                <div style={{fontSize:'12px', color:'#6B7280', lineHeight:1.5}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CASAS RECOMENDADAS */}
        <div style={{padding:'0 24px', animation:'fadeIn .4s ease'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'#6B7280', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'20px', height:'1px', background:'#374151', display:'inline-block'}}/>
            Casas recomendadas
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'16px', maxWidth:'800px', margin:'0 auto'}}>
            {casas.map((casa, i) => (
              <div key={i} className="casa-card" style={{background:'#111827', border:`1px solid ${casa.border}`, borderRadius:'16px', padding:'24px', transition:'all .25s', position:'relative', overflow:'hidden'}}>
                <div style={{position:'absolute', top:'16px', right:'16px', background:`${casa.badgeColor}15`, border:`1px solid ${casa.badgeColor}40`, color:casa.badgeColor, borderRadius:'999px', padding:'4px 12px', fontSize:'10px', fontWeight:700}}>
                  {casa.badge}
                </div>
                <div style={{display:'flex', alignItems:'flex-start', gap:'16px', flexWrap:'wrap'}}>
                  <div style={{width:'56px', height:'56px', borderRadius:'12px', background:casa.bg, border:`1px solid ${casa.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', flexShrink:0}}>
                    {casa.logo}
                  </div>
                  <div style={{flex:1, minWidth:'200px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px'}}>
                      <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'22px', fontWeight:700, color:casa.color}}>{casa.nombre}</h3>
                      <div style={{display:'flex', gap:'2px'}}>
                        {Array.from({length:5}).map((_,j) => (
                          <span key={j} style={{fontSize:'12px', color:j < Math.floor(casa.rating)?'#F59E0B':'#374151'}}>★</span>
                        ))}
                        <span style={{fontSize:'12px', color:'#6B7280', marginLeft:'4px'}}>{casa.rating}</span>
                      </div>
                    </div>
                    <div style={{display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'8px', padding:'6px 12px', marginBottom:'14px'}}>
                      <span style={{fontSize:'14px'}}>🎁</span>
                      <span style={{fontSize:'13px', fontWeight:600, color:'#00FF88'}}>{casa.bono}</span>
                    </div>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px'}}>
                      {casa.features.map(f => (
                        <span key={f} style={{fontSize:'12px', color:'#9CA3AF', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', padding:'4px 10px'}}>
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                    <a href={casa.url} target="_blank" rel="noopener noreferrer" className="btn-jugar"
                      style={{display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', borderRadius:'10px', background:casa.color, color:'#fff', fontWeight:700, fontSize:'14px', textDecoration:'none', transition:'all .2s'}}>
                      Ir a {casa.nombre} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISCLAIMER */}
        <div style={{padding:'24px', margin:'24px', background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'12px', maxWidth:'800px', marginLeft:'auto', marginRight:'auto'}}>
          <div style={{fontSize:'12px', color:'#6B7280', lineHeight:1.8}}>
            <strong style={{color:'#9CA3AF'}}>Aviso legal:</strong> ScoreBet actua como afiliado de estas casas de apuestas. Al registrarte a traves de nuestros enlaces podemos recibir una comision. Las apuestas con dinero real implican riesgo de perdida. Juega con responsabilidad. Solo disponible para mayores de 18 anos.
          </div>
        </div>

        <div style={{height:'40px'}}/>
      </div>
    </main>
  )
}
