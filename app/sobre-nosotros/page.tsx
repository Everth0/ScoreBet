import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SobreNosotros() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        h2 { font-family:Rajdhani,sans-serif; font-size:22px; font-weight:700; color:#00FF88; margin:32px 0 12px; }
        p  { font-size:14px; color:#9CA3AF; line-height:1.8; margin-bottom:12px; }
        a  { color:#00FF88; }
      `}</style>

      <div style={{paddingTop:'64px', maxWidth:'800px', margin:'0 auto', padding:'80px 24px'}}>

        {/* HEADER */}
        <div style={{marginBottom:'48px', textAlign:'center'}}>
          <div style={{width:'80px', height:'80px', borderRadius:'20px', background:'linear-gradient(135deg,#00FF88,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', fontWeight:900, color:'#0A0E1A', margin:'0 auto 24px'}}>
            S
          </div>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'12px'}}>Empresa</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:700, marginBottom:'16px'}}>
            Sobre <span style={{color:'#00FF88'}}>nosotros</span>
          </h1>
          <p style={{fontSize:'16px', color:'#9CA3AF', maxWidth:'500px', margin:'0 auto', lineHeight:1.8}}>
            Somos un equipo apasionado por el deporte y la tecnologia, creando la mejor experiencia de predicciones deportivas gratuita del mundo.
          </p>
        </div>

        {/* MISION */}
        <div style={{background:'linear-gradient(135deg,rgba(0,255,136,0.06),rgba(59,130,246,0.06))', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'16px', padding:'28px', marginBottom:'24px'}}>
          <h2 style={{marginTop:0}}>🎯 Nuestra mision</h2>
          <p style={{marginBottom:0}}>
            Democratizar la experiencia de las apuestas deportivas eliminando el riesgo financiero. Queremos que cualquier persona en el mundo pueda disfrutar de la emocion de predecir resultados deportivos y ser recompensada por ello, sin necesidad de arriesgar dinero real.
          </p>
        </div>

        {/* VISION */}
        <div style={{background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'16px', padding:'28px', marginBottom:'24px'}}>
          <h2 style={{marginTop:0, color:'#3B82F6'}}>🌟 Nuestra vision</h2>
          <p style={{marginBottom:0}}>
            Convertirnos en la plataforma de predicciones deportivas mas grande de Latinoamerica, conectando a millones de fanáticos del deporte con premios reales de manera 100% gratuita y transparente.
          </p>
        </div>

        {/* HISTORIA */}
        <h2>📖 Nuestra historia</h2>
        <p>
          ScoreBet nacio en 2025 con una idea simple pero poderosa: los fanáticos del deporte tienen un conocimiento valioso sobre sus equipos y competencias favoritas. Ese conocimiento merece ser recompensado.
        </p>
        <p>
          Vimos que las casas de apuestas tradicionales requerian dinero real, creando una barrera para millones de personas. Decidimos crear una alternativa donde cualquiera pudiera participar gratis, ganar puntos y canjearlos por premios reales.
        </p>
        <p>
          Hoy ScoreBet ofrece partidos en vivo del Mundial 2026, Champions League, Premier League, Copa America y mas de 12 deportes, con un sistema de puntos transparente y premios reales.
        </p>

        {/* VALORES */}
        <h2>💎 Nuestros valores</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px', marginBottom:'24px'}}>
          {[
            { icon:'🔒', title:'Transparencia',  desc:'Somos claros sobre como funcionan los puntos y los canjes. Sin letra pequena.' },
            { icon:'🆓', title:'Accesibilidad',   desc:'Creemos que el entretenimiento deportivo debe ser gratis para todos.' },
            { icon:'🛡️', title:'Seguridad',       desc:'Protegemos tus datos y prevenimos el fraude para una experiencia justa.' },
            { icon:'🏆', title:'Excelencia',      desc:'Buscamos constantemente mejorar la experiencia de nuestros usuarios.' },
            { icon:'🌎', title:'Comunidad',       desc:'Construimos una comunidad de fanáticos del deporte apasionados.' },
            { icon:'⚡', title:'Innovacion',      desc:'Usamos tecnologia de punta para ofrecerte la mejor experiencia.' },
          ].map(v => (
            <div key={v.title} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px'}}>
              <div style={{fontSize:'28px', marginBottom:'10px'}}>{v.icon}</div>
              <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'8px', color:'#F9FAFB'}}>{v.title}</div>
              <p style={{fontSize:'13px', marginBottom:0, lineHeight:1.6}}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* STATS */}
        <h2>📊 ScoreBet en numeros</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'14px', marginBottom:'32px'}}>
          {[
            { num:'48K+',   label:'Usuarios registrados' },
            { num:'12+',    label:'Deportes disponibles' },
            { num:'$320K',  label:'En premios entregados' },
            { num:'100%',   label:'Gratis para siempre' },
            { num:'24/7',   label:'Partidos disponibles' },
            { num:'2025',   label:'Ano de fundacion' },
          ].map(s => (
            <div key={s.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'18px', textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'24px', fontWeight:700, color:'#00FF88', marginBottom:'6px'}}>{s.num}</div>
              <div style={{fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TECNOLOGIA */}
        <h2>⚙️ Nuestra tecnologia</h2>
        <p>ScoreBet esta construido con las mejores tecnologias modernas:</p>
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'24px'}}>
          {[
            { label:'Next.js 16',     color:'#F9FAFB', bg:'rgba(255,255,255,0.05)' },
            { label:'Firebase',       color:'#F59E0B', bg:'rgba(245,158,11,0.08)' },
            { label:'TypeScript',     color:'#3B82F6', bg:'rgba(59,130,246,0.08)' },
            { label:'Vercel',         color:'#F9FAFB', bg:'rgba(255,255,255,0.05)' },
            { label:'API Football',   color:'#00FF88', bg:'rgba(0,255,136,0.08)' },
            { label:'Tailwind CSS',   color:'#06B6D4', bg:'rgba(6,182,212,0.08)' },
          ].map(t => (
            <span key={t.label} style={{padding:'6px 14px', borderRadius:'999px', background:t.bg, color:t.color, fontSize:'13px', fontWeight:600, border:`1px solid ${t.bg.replace('0.08','0.25')}`}}>
              {t.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'16px', padding:'28px', textAlign:'center', marginTop:'32px'}}>
          <h2 style={{marginTop:0}}>Unete a ScoreBet hoy</h2>
          <p style={{maxWidth:'400px', margin:'0 auto 20px'}}>
            Comienza gratis, gana puntos prediciendo resultados deportivos y canjealos por premios reales.
          </p>
          <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
            <Link href="/login" style={{padding:'12px 28px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', textDecoration:'none'}}>
              Crear cuenta gratis
            </Link>
            <Link href="/contacto" style={{padding:'12px 28px', borderRadius:'10px', border:'1px solid #374151', color:'#F9FAFB', fontSize:'14px', textDecoration:'none'}}>
              Contactanos
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
