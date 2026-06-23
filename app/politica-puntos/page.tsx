import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PoliticaPuntos() {
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
            Politica de puntos
          </h1>
          <p style={{fontSize:'13px', color:'#6B7280'}}>Ultima actualizacion: Junio 2025</p>
          <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'14px 18px', marginTop:'20px', fontSize:'13px', color:'#9CA3AF', lineHeight:1.7}}>
            Esta politica describe como funcionan los puntos en ScoreBet, como se ganan, como se usan y cuales son las reglas de canje.
          </div>
        </div>

        <h2>1. Que son los puntos ScoreBet</h2>
        <p>Los puntos ScoreBet son una moneda virtual exclusiva de la plataforma. <strong style={{color:'#F9FAFB'}}>No tienen valor monetario legal</strong> y no pueden ser convertidos directamente a dinero en efectivo. Sin embargo, pueden canjearse por tarjetas de regalo digitales segun las condiciones descritas en esta politica.</p>

        <h2>2. Equivalencia oficial</h2>
        <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', flexWrap:'wrap'}}>
            {[
              { pts:'50,000',  usd:'$5' },
              { pts:'100,000', usd:'$10' },
              { pts:'250,000', usd:'$25' },
              { pts:'500,000', usd:'$50' },
            ].map(e => (
              <div key={e.pts} style={{textAlign:'center', padding:'16px 24px', background:'#0F1520', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:'#00FF88'}}>{e.pts}</div>
                <div style={{fontSize:'12px', color:'#6B7280', margin:'4px 0'}}>puntos</div>
                <div style={{fontSize:'24px', fontWeight:700, color:'#F59E0B'}}>{e.usd} USD</div>
              </div>
            ))}
          </div>
          <p style={{textAlign:'center', marginTop:'16px', marginBottom:0, fontSize:'12px', color:'#6B7280'}}>
            ScoreBet se reserva el derecho de modificar esta equivalencia con previo aviso de 30 dias.
          </p>
        </div>

        <h2>3. Como ganar puntos</h2>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'16px'}}>
          <table>
            <thead>
              <tr>
                <th>Accion</th>
                <th>Puntos</th>
                <th>Limite</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Registro inicial',          '+500 pts',  'Una sola vez'],
                ['Ver anuncio de video',       '+50 pts',   '10 veces por dia'],
                ['Acertar resultado (cuota x)', 'Puntos × cuota', 'Sin limite'],
                ['Referir un amigo',           '+300 pts',  'Sin limite'],
                ['Bonus referido (amigo)',      '+300 pts',  'Una vez por referido'],
              ].map(([accion, pts, limite]) => (
                <tr key={accion}>
                  <td style={{color:'#F9FAFB', fontWeight:500}}>{accion}</td>
                  <td><span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:700}}>{pts}</span></td>
                  <td style={{color:'#6B7280', fontSize:'12px'}}>{limite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>4. Como se pierden puntos</h2>
        <ul>
          <li>Al realizar apuestas con puntos (se descuentan al apostar)</li>
          <li>Al canjear recompensas exitosamente</li>
          <li>Si la cuenta es suspendida por actividad fraudulenta</li>
          <li>Si se detectan clics fraudulentos en anuncios</li>
        </ul>

        <h2>5. Sistema de apuestas con puntos</h2>
        <p>Las apuestas funcionan igual que en casas de apuestas reales pero con puntos virtuales:</p>
        <ul>
          <li>Seleccionas un partido y una prediccion (local, empate, visita)</li>
          <li>Eliges cuantos puntos apostar (minimo 100 pts)</li>
          <li>Si aciertas, recibes: <strong style={{color:'#00FF88'}}>puntos apostados × cuota</strong></li>
          <li>Si fallas, pierdes los puntos apostados</li>
        </ul>
        <div style={{background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'10px', padding:'14px 18px', marginBottom:'16px'}}>
          <p style={{marginBottom:0, fontSize:'13px'}}>
            <strong style={{color:'#3B82F6'}}>Ejemplo:</strong> Apuestas 1,000 pts a que España gana con cuota 1.85.<br/>
            Si España gana → recibes <strong style={{color:'#00FF88'}}>1,850 pts</strong><br/>
            Si España no gana → pierdes <strong style={{color:'#EF4444'}}>1,000 pts</strong>
          </p>
        </div>

        <h2>6. Catalogo de recompensas</h2>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'16px'}}>
          <table>
            <thead>
              <tr>
                <th>Premio</th>
                <th>Puntos requeridos</th>
                <th>Valor USD</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Amazon $5',        '50,000',  '$5'],
                ['Amazon $10',       '100,000', '$10'],
                ['Amazon $25',       '250,000', '$25'],
                ['Google Play $5',   '50,000',  '$5'],
                ['Google Play $10',  '100,000', '$10'],
                ['Steam $10',        '100,000', '$10'],
                ['Netflix 1 mes',    '150,000', '$15'],
                ['Spotify 1 mes',    '110,000', '$11'],
                ['Apple $5',         '50,000',  '$5'],
                ['Apple $10',        '100,000', '$10'],
              ].map(([premio, pts, usd]) => (
                <tr key={premio}>
                  <td style={{color:'#F9FAFB', fontWeight:500}}>{premio}</td>
                  <td><span style={{fontFamily:'JetBrains Mono, monospace', color:'#F59E0B', fontWeight:600}}>{pts}</span></td>
                  <td><span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:700}}>{usd}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>7. Requisitos para canjear</h2>
        <p>Para poder realizar un canje debes cumplir todos estos requisitos:</p>
        <ul>
          <li>✅ Email verificado</li>
          <li>✅ Cuenta con minimo 30 dias de antiguedad</li>
          <li>✅ Haber visto al menos 50 anuncios</li>
          <li>✅ Haber realizado al menos 10 apuestas</li>
          <li>✅ Saldo suficiente de puntos</li>
          <li>✅ No tener VPN activa al momento del canje</li>
          <li>✅ No acceder desde emulador</li>
        </ul>

        <h2>8. Proceso de canje</h2>
        <ul>
          <li>Solicitas el canje desde la seccion Recompensas</li>
          <li>ScoreBet verifica que cumples todos los requisitos</li>
          <li>Tu solicitud queda en estado "pendiente"</li>
          <li>El equipo de ScoreBet la revisa en 24-48 horas habiles</li>
          <li>Si se aprueba, recibes tu tarjeta de regalo por email</li>
          <li>Tus puntos se descuentan al momento de la aprobacion</li>
        </ul>

        <h2>9. Rechazo de canjes</h2>
        <p>ScoreBet puede rechazar una solicitud de canje si:</p>
        <ul>
          <li>Se detecta actividad fraudulenta en la cuenta</li>
          <li>Los puntos fueron obtenidos mediante clics fraudulentos en anuncios</li>
          <li>La cuenta tiene multiples dispositivos registrados</li>
          <li>Se detecta uso de VPN o emuladores</li>
          <li>La informacion de la cuenta es incorrecta o incompleta</li>
        </ul>

        <h2>10. Vencimiento de puntos</h2>
        <p>Los puntos no tienen fecha de vencimiento mientras la cuenta este activa. Sin embargo:</p>
        <ul>
          <li>Los puntos se pierden si la cuenta es eliminada o baneada</li>
          <li>Cuentas inactivas por mas de 12 meses pueden tener sus puntos reiniciados</li>
          <li>ScoreBet notificara por email antes de cualquier vencimiento</li>
        </ul>

        <h2>11. Modificaciones</h2>
        <p>ScoreBet puede modificar el valor de los puntos, el catalogo de recompensas o los requisitos de canje con un aviso previo de 30 dias por email.</p>

        <h2>12. Contacto</h2>
        <p>Para dudas sobre tu saldo o canjes: <a href="mailto:soporte@scorebet.space">soporte@scorebet.space</a></p>

        <div style={{marginTop:'48px', padding:'20px', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px'}}>
          <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600}}>Otros documentos legales</div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {[
              { label:'Terminos de uso', href:'/terminos' },
              { label:'Privacidad',      href:'/privacidad' },
              { label:'Cookies',         href:'/cookies' },
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
