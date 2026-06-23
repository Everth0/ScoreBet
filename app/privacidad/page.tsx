import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Privacidad() {
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
            Politica de privacidad
          </h1>
          <p style={{fontSize:'13px', color:'#6B7280'}}>
            Ultima actualizacion: Junio 2025
          </p>
          <div style={{background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'10px', padding:'14px 18px', marginTop:'20px', fontSize:'13px', color:'#9CA3AF', lineHeight:1.7}}>
            En ScoreBet nos tomamos muy en serio tu privacidad. Esta politica explica que datos recopilamos, como los usamos y cuales son tus derechos.
          </div>
        </div>

        <h2>1. Que datos recopilamos</h2>
        <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', marginBottom:'16px'}}>
          <table>
            <thead>
              <tr>
                <th>Dato</th>
                <th>Por que lo recopilamos</th>
                <th>Base legal</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Nombre',           'Personalizar tu experiencia',           'Consentimiento'],
                ['Email',            'Autenticacion y comunicacion',          'Contrato'],
                ['UID de Firebase',  'Identificar tu cuenta',                 'Contrato'],
                ['Puntos y apuestas','Gestionar tu saldo y actividad',        'Contrato'],
                ['Dispositivo',      'Prevenir fraude y multiples cuentas',   'Interes legitimo'],
                ['IP aproximada',    'Detectar VPN y ubicacion general',      'Interes legitimo'],
                ['Referido por',     'Gestionar programa de referidos',       'Contrato'],
              ].map(([dato, por, base]) => (
                <tr key={dato}>
                  <td style={{fontWeight:600, color:'#F9FAFB'}}>{dato}</td>
                  <td>{por}</td>
                  <td><span style={{background:'rgba(0,255,136,0.08)', color:'#00FF88', padding:'2px 8px', borderRadius:'999px', fontSize:'11px', fontWeight:600}}>{base}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>2. Como usamos tus datos</h2>
        <p>Usamos tu informacion para:</p>
        <ul>
          <li>Gestionar tu cuenta y saldo de puntos</li>
          <li>Procesar solicitudes de canje de recompensas</li>
          <li>Prevenir fraude y multiples cuentas</li>
          <li>Enviarte notificaciones importantes sobre tu cuenta</li>
          <li>Mejorar nuestros servicios y experiencia de usuario</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>

        <h2>3. Con quien compartimos tus datos</h2>
        <p>ScoreBet <strong style={{color:'#F9FAFB'}}>NO vende</strong> tus datos personales. Compartimos informacion limitada con:</p>
        <ul>
          <li><strong style={{color:'#F9FAFB'}}>Firebase (Google):</strong> Para autenticacion y base de datos</li>
          <li><strong style={{color:'#F9FAFB'}}>Vercel:</strong> Para hosting de la plataforma</li>
          <li><strong style={{color:'#F9FAFB'}}>Monetag:</strong> Redes publicitarias (datos anonimizados)</li>
          <li><strong style={{color:'#F9FAFB'}}>Proveedores de tarjetas regalo:</strong> Solo email para entrega de premios</li>
        </ul>

        <h2>4. Cookies y tecnologias similares</h2>
        <p>Usamos cookies para:</p>
        <ul>
          <li>Mantener tu sesion iniciada</li>
          <li>Recordar tus preferencias</li>
          <li>Analizar el uso de la plataforma</li>
          <li>Mostrar publicidad relevante</li>
        </ul>
        <p>Puedes gestionar las cookies desde la configuracion de tu navegador. Ver nuestra <Link href="/cookies">Politica de Cookies</Link> completa.</p>

        <h2>5. Seguridad de tus datos</h2>
        <p>Protegemos tus datos mediante:</p>
        <ul>
          <li>Encriptacion SSL/TLS en todas las comunicaciones</li>
          <li>Autenticacion segura via Firebase</li>
          <li>Reglas de seguridad en Firestore</li>
          <li>Acceso restringido solo a administradores autorizados</li>
          <li>Monitoreo continuo de actividad sospechosa</li>
        </ul>

        <h2>6. Retencion de datos</h2>
        <p>Guardamos tus datos mientras tu cuenta este activa. Si eliminas tu cuenta:</p>
        <ul>
          <li>Tus datos personales se eliminan en 30 dias</li>
          <li>El historial de canjes se retiene 1 ano por obligaciones legales</li>
          <li>Los datos anonimizados pueden retenerse indefinidamente</li>
        </ul>

        <h2>7. Tus derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li><strong style={{color:'#F9FAFB'}}>Acceso:</strong> Solicitar una copia de tus datos</li>
          <li><strong style={{color:'#F9FAFB'}}>Rectificacion:</strong> Corregir datos incorrectos</li>
          <li><strong style={{color:'#F9FAFB'}}>Eliminacion:</strong> Solicitar borrado de tu cuenta y datos</li>
          <li><strong style={{color:'#F9FAFB'}}>Portabilidad:</strong> Recibir tus datos en formato exportable</li>
          <li><strong style={{color:'#F9FAFB'}}>Oposicion:</strong> Oponerte al procesamiento de tus datos</li>
        </ul>
        <p>Para ejercer estos derechos contactanos en: <a href="mailto:privacidad@scorebet.space">privacidad@scorebet.space</a></p>

        <h2>8. Menores de edad</h2>
        <p>ScoreBet no esta dirigido a menores de 13 anos. Si detectamos que un menor ha creado una cuenta, la eliminaremos inmediatamente junto con todos sus datos.</p>

        <h2>9. Cambios en esta politica</h2>
        <p>Podemos actualizar esta politica periodicamente. Te notificaremos por email ante cambios significativos. La fecha de la ultima actualizacion siempre estara visible al inicio de este documento.</p>

        <h2>10. Contacto</h2>
        <p>Para consultas sobre privacidad: <a href="mailto:privacidad@scorebet.space">privacidad@scorebet.space</a></p>

        <div style={{marginTop:'48px', padding:'20px', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px'}}>
          <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:600}}>Otros documentos legales</div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {[
              { label:'Terminos de uso',    href:'/terminos' },
              { label:'Politica de puntos', href:'/politica-puntos' },
              { label:'Cookies',            href:'/cookies' },
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
