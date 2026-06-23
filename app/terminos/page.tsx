import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Terminos() {
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
      `}</style>

      <div style={{paddingTop:'64px', maxWidth:'800px', margin:'0 auto', padding:'80px 24px'}}>

        {/* Header */}
        <div style={{marginBottom:'40px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'12px'}}>Legal</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'12px'}}>
            Terminos de uso
          </h1>
          <p style={{fontSize:'13px', color:'#6B7280'}}>
            Ultima actualizacion: Junio 2025 · Efectivo desde: Junio 2025
          </p>
          <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'14px 18px', marginTop:'20px', fontSize:'13px', color:'#9CA3AF', lineHeight:1.7}}>
            Por favor lee estos terminos detenidamente antes de usar ScoreBet. Al acceder o usar nuestra plataforma, aceptas estar vinculado por estos terminos.
          </div>
        </div>

        <h2>1. Aceptacion de los terminos</h2>
        <p>Al registrarte o usar ScoreBet ("la Plataforma", "nosotros", "nuestro"), aceptas estos Terminos de Uso en su totalidad. Si no estas de acuerdo con alguna parte de estos terminos, no debes usar la plataforma.</p>

        <h2>2. Descripcion del servicio</h2>
        <p>ScoreBet es una plataforma de entretenimiento y prediccion deportiva donde los usuarios pueden:</p>
        <ul>
          <li>Predecir resultados de partidos deportivos usando puntos virtuales</li>
          <li>Ganar puntos viendo anuncios publicitarios</li>
          <li>Acumular puntos y canjearlos por tarjetas de regalo digitales</li>
          <li>Invitar amigos a traves del programa de referidos</li>
        </ul>
        <p><strong style={{color:'#F9FAFB'}}>ScoreBet NO es una casa de apuestas.</strong> No se usa dinero real en ninguna transaccion dentro de la plataforma. Los puntos son moneda virtual sin valor monetario directo.</p>

        <h2>3. Elegibilidad</h2>
        <p>Para usar ScoreBet debes:</p>
        <ul>
          <li>Tener al menos 13 anos de edad</li>
          <li>Proporcionar informacion veridica al registrarte</li>
          <li>Tener una cuenta de correo electronico valida</li>
          <li>No haber sido previamente baneado de la plataforma</li>
        </ul>

        <h2>4. Cuentas de usuario</h2>
        <p>Cada usuario puede tener una sola cuenta. Esta prohibido:</p>
        <ul>
          <li>Crear multiples cuentas para obtener mas puntos</li>
          <li>Compartir cuentas con otras personas</li>
          <li>Usar bots, scripts o herramientas automatizadas</li>
          <li>Usar VPN para evadir restricciones</li>
          <li>Vender, transferir o comprar cuentas</li>
        </ul>
        <p>El incumplimiento puede resultar en la suspension permanente de la cuenta y perdida de todos los puntos acumulados.</p>

        <h2>5. Sistema de puntos</h2>
        <p>Los puntos de ScoreBet son moneda virtual con las siguientes caracteristicas:</p>
        <ul>
          <li>No tienen valor monetario legal</li>
          <li>No pueden ser transferidos entre usuarios</li>
          <li>No pueden ser convertidos a dinero en efectivo</li>
          <li>Pueden perderse si la cuenta es suspendida por fraude</li>
          <li>ScoreBet se reserva el derecho de ajustar el valor de canje en cualquier momento</li>
        </ul>

        <h2>6. Canje de recompensas</h2>
        <p>Para canjear puntos por tarjetas de regalo debes cumplir todos estos requisitos:</p>
        <ul>
          <li>Tener tu email verificado</li>
          <li>Cuenta con minimo 30 dias de antiguedad</li>
          <li>Haber visto al menos 50 anuncios</li>
          <li>Haber realizado al menos 10 apuestas con puntos</li>
          <li>Saldo suficiente de puntos para el premio elegido</li>
        </ul>
        <p>ScoreBet se reserva el derecho de rechazar solicitudes de canje si detecta actividad sospechosa o fraudulenta.</p>

        <h2>7. Conducta del usuario</h2>
        <p>Esta prohibido:</p>
        <ul>
          <li>Usar lenguaje ofensivo o acosador</li>
          <li>Intentar hackear o comprometer la seguridad de la plataforma</li>
          <li>Publicar contenido ilegal o inapropiado</li>
          <li>Realizar actividades fraudulentas</li>
          <li>Usar emuladores para simular visitas a anuncios</li>
        </ul>

        <h2>8. Publicidad</h2>
        <p>ScoreBet muestra anuncios de terceros como parte de su modelo de monetizacion. Al ver anuncios, los usuarios ganan puntos. ScoreBet no es responsable del contenido de los anuncios de terceros.</p>

        <h2>9. Limitacion de responsabilidad</h2>
        <p>ScoreBet no garantiza la disponibilidad continua del servicio. No somos responsables por perdidas de puntos causadas por problemas tecnicos, mantenimiento o causas de fuerza mayor.</p>

        <h2>10. Modificaciones</h2>
        <p>ScoreBet puede modificar estos terminos en cualquier momento. Los cambios se notificaran por email o dentro de la plataforma. El uso continuado de la plataforma constituye aceptacion de los nuevos terminos.</p>

        <h2>11. Contacto</h2>
        <p>Para consultas sobre estos terminos contactanos en: <a href="mailto:soporte@scorebet.space">soporte@scorebet.space</a></p>

        {/* Navegacion legal */}
        <div style={{marginTop:'48px', padding:'20px', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px'}}>
          <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600}}>Otros documentos legales</div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {[
              { label:'Privacidad',        href:'/privacidad' },
              { label:'Politica de puntos', href:'/politica-puntos' },
              { label:'Cookies',           href:'/cookies' },
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
