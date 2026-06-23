import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Cookies() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        h2 { font-family:Rajdhani,sans-serif; font-size:22px; font-weight:700; color:#00FF88; margin:32px 0 12px; }
        h3 { font-size:16px; font-weight:600; color:#F9FAFB; margin:20px 0 8px; }
        p  { font-size:14px; color:#9CA3AF; line-height:1.8; margin-bottom:12px; }
        ul { padding-left:20px; margin-bottom:12px; }
        li { font-size:14px; color:#9CA3AF; line-height:1.8; margin-bottom:6px; }
        a  { color:#00FF88; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        th { text-align:left; padding:10px 12px; font-size:12px; color:#6B7280; font-weight:600; border-bottom:1px solid rgba(255,255,255,0.06); }
        td { padding:10px 12px; font-size:13px; color:#9CA3AF; border-bottom:1px solid rgba(255,255,255,0.04); }
      `}</style>

      <div style={{paddingTop:'64px', maxWidth:'800px', margin:'0 auto', padding:'80px 24px'}}>

        <div style={{marginBottom:'40px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'12px'}}>Legal</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'12px'}}>
            Politica de cookies
          </h1>
          <p style={{fontSize:'13px', color:'#6B7280'}}>Ultima actualizacion: Junio 2025</p>
          <div style={{background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:'10px', padding:'14px 18px', marginTop:'20px', fontSize:'13px', color:'#9CA3AF', lineHeight:1.7}}>
            Esta politica explica que son las cookies, cuales usamos en ScoreBet y como puedes controlarlas.
          </div>
        </div>

        <h2>1. Que son las cookies</h2>
        <p>Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para recordar tus preferencias, mantener tu sesion activa y mejorar tu experiencia de usuario.</p>
        <p>ScoreBet usa cookies propias y de terceros para funcionar correctamente y ofrecerte la mejor experiencia posible.</p>

        <h2>2. Tipos de cookies que usamos</h2>

        <h3>🔒 Cookies esenciales (siempre activas)</h3>
        <p>Son necesarias para el funcionamiento basico de la plataforma. Sin ellas, ScoreBet no puede funcionar.</p>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px'}}>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Proposito</th>
                <th>Duracion</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['firebase:authUser',   'Mantener sesion iniciada',        'Hasta cerrar sesion'],
                ['__session',          'Token de autenticacion Firebase',   'Session'],
                ['pwa-descartada',     'Recordar si cerraste el banner PWA','1 año'],
              ].map(([cookie, prop, dur]) => (
                <tr key={cookie}>
                  <td style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#3B82F6'}}>{cookie}</td>
                  <td>{prop}</td>
                  <td style={{color:'#6B7280', fontSize:'12px'}}>{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>📊 Cookies de rendimiento</h3>
        <p>Nos ayudan a entender como los usuarios interactuan con ScoreBet para mejorar la plataforma.</p>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px'}}>
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Proposito</th>
                <th>Duracion</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['_ga',    'Google Analytics - identificar usuarios', '2 años'],
                ['_gid',   'Google Analytics - distinguir usuarios',  '24 horas'],
                ['_gat',   'Google Analytics - limitar solicitudes',  '1 minuto'],
              ].map(([cookie, prop, dur]) => (
                <tr key={cookie}>
                  <td style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#F59E0B'}}>{cookie}</td>
                  <td>{prop}</td>
                  <td style={{color:'#6B7280', fontSize:'12px'}}>{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>📢 Cookies de publicidad</h3>
        <p>Usadas por nuestras redes publicitarias para mostrar anuncios relevantes y medir su efectividad.</p>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px'}}>
          <table>
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Proposito</th>
                <th>Mas info</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Monetag',  'Red publicitaria - anuncios personalizados', 'monetag.com/privacy'],
                ['Google',   'Firebase y servicios Google',                'policies.google.com'],
              ].map(([prov, prop, info]) => (
                <tr key={prov}>
                  <td style={{color:'#F9FAFB', fontWeight:600}}>{prov}</td>
                  <td>{prop}</td>
                  <td><a href={`https://${info}`} target="_blank" rel="noopener noreferrer" style={{fontSize:'12px'}}>{info}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>3. Como controlar las cookies</h2>
        <p>Puedes controlar y eliminar las cookies de varias formas:</p>

        <h3>Desde tu navegador</h3>
        <ul>
          <li><strong style={{color:'#F9FAFB'}}>Chrome Android:</strong> Ajustes → Privacidad y seguridad → Cookies</li>
          <li><strong style={{color:'#F9FAFB'}}>Firefox:</strong> Menu → Ajustes → Privacidad → Cookies</li>
          <li><strong style={{color:'#F9FAFB'}}>Safari:</strong> Ajustes → Safari → Privacidad</li>
        </ul>

        <div style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'14px 18px', marginBottom:'16px'}}>
          <p style={{marginBottom:0, fontSize:'13px', color:'#EF4444'}}>
            ⚠️ Si bloqueas las cookies esenciales, ScoreBet puede no funcionar correctamente y es posible que no puedas iniciar sesion.
          </p>
        </div>

        <h2>4. Cookies de terceros</h2>
        <p>Algunos servicios de terceros que usamos pueden instalar sus propias cookies. No tenemos control sobre estas cookies. Te recomendamos revisar las politicas de privacidad de:</p>
        <ul>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Firebase</a></li>
          <li><a href="https://monetag.com/privacy" target="_blank" rel="noopener noreferrer">Monetag</a></li>
          <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel</a></li>
        </ul>

        <h2>5. Consentimiento</h2>
        <p>Al usar ScoreBet por primera vez, aceptas el uso de cookies segun esta politica. Puedes retirar tu consentimiento en cualquier momento eliminando las cookies desde la configuracion de tu navegador.</p>

        <h2>6. Actualizaciones</h2>
        <p>Podemos actualizar esta politica cuando agreguemos nuevos servicios o cambiemos los existentes. La fecha de la ultima actualizacion siempre estara visible al inicio de este documento.</p>

        <h2>7. Contacto</h2>
        <p>Para preguntas sobre cookies: <a href="mailto:privacidad@scorebet.space">privacidad@scorebet.space</a></p>

        <div style={{marginTop:'48px', padding:'20px', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px'}}>
          <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600}}>Otros documentos legales</div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {[
              { label:'Terminos de uso',    href:'/terminos' },
              { label:'Privacidad',         href:'/privacidad' },
              { label:'Politica de puntos', href:'/politica-puntos' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{padding:'8px 16px', borderRadius:'8px', background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', color:'#00FF88', fontSize:'13px', textDecoration:'none', fontWeight:500}}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
