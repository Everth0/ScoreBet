'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useState } from 'react'

export default function Contacto() {
  const [nombre, setNombre]   = useState('')
  const [email, setEmail]     = useState('')
  const [asunto, setAsunto]   = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [error, setError]       = useState('')

  async function enviarMensaje() {
    if (!nombre || !email || !asunto || !mensaje) {
      setError('Por favor completa todos los campos')
      return
    }
    setEnviando(true)
    setError('')
    // Simular envio por ahora
    await new Promise(r => setTimeout(r, 1500))
    setEnviado(true)
    setEnviando(false)
    setNombre('')
    setEmail('')
    setAsunto('')
    setMensaje('')
  }

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing:border-box; }
        .input-field { width:100%; background:#0F1520; border:1px solid #374151; border-radius:10px; padding:13px 16px; color:#F9FAFB; font-size:14px; font-family:Inter,sans-serif; outline:none; transition:border-color .2s; }
        .input-field:focus { border-color:#00FF88; }
        .input-field::placeholder { color:#4B5563; }
        .btn-send:hover { background:#00cc6a !important; transform:translateY(-1px); }
        .contact-card:hover { border-color:rgba(0,255,136,0.2) !important; transform:translateY(-2px); }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'48px 24px', textAlign:'center', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:'-60px', left:'50%', transform:'translateX(-50%)', width:'400px', height:'300px', background:'radial-gradient(ellipse,rgba(0,255,136,0.08) 0%,transparent 70%)', pointerEvents:'none'}}/>
          <div style={{position:'relative'}}>
            <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'12px'}}>Empresa</div>
            <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,52px)', fontWeight:700, marginBottom:'16px'}}>
              Contacta con <span style={{color:'#00FF88'}}>nosotros</span>
            </h1>
            <p style={{fontSize:'16px', color:'#9CA3AF', maxWidth:'480px', margin:'0 auto', lineHeight:1.8}}>
              Estamos aqui para ayudarte. Respondemos todas las consultas en menos de 48 horas habiles.
            </p>
          </div>
        </div>

        <div style={{maxWidth:'1000px', margin:'0 auto', padding:'48px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px'}}>

          {/* FORMULARIO */}
          <div>
            <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'24px', fontWeight:700, marginBottom:'24px'}}>
              Enviar mensaje
            </h2>

            {enviado ? (
              <div style={{background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'16px', padding:'32px', textAlign:'center', animation:'fadeIn .3s ease'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
                <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'22px', fontWeight:700, color:'#00FF88', marginBottom:'8px'}}>
                  Mensaje enviado
                </div>
                <p style={{fontSize:'14px', color:'#9CA3AF', marginBottom:'20px'}}>
                  Gracias por contactarnos. Te responderemos en menos de 48 horas habiles al email que nos proporcionaste.
                </p>
                <button onClick={() => setEnviado(false)}
                  style={{padding:'10px 24px', borderRadius:'8px', background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.25)', color:'#00FF88', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>NOMBRE COMPLETO</label>
                  <input className="input-field" type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>EMAIL</label>
                  <input className="input-field" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>ASUNTO</label>
                  <select className="input-field" value={asunto} onChange={e => setAsunto(e.target.value)}
                    style={{background:'#0F1520', border:'1px solid #374151', borderRadius:'10px', padding:'13px 16px', color: asunto ? '#F9FAFB' : '#4B5563', fontSize:'14px', fontFamily:'Inter,sans-serif', outline:'none', width:'100%', cursor:'pointer'}}>
                    <option value="" disabled>Selecciona un asunto</option>
                    <option value="soporte">Soporte tecnico</option>
                    <option value="puntos">Problema con mis puntos</option>
                    <option value="canje">Problema con un canje</option>
                    <option value="cuenta">Problema con mi cuenta</option>
                    <option value="fraude">Reportar fraude</option>
                    <option value="afiliados">Programa de afiliados</option>
                    <option value="prensa">Prensa y medios</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>MENSAJE</label>
                  <textarea className="input-field" placeholder="Describe tu consulta con el mayor detalle posible..." value={mensaje} onChange={e => setMensaje(e.target.value)} rows={5}
                    style={{resize:'vertical', minHeight:'120px'}} />
                </div>

                {error && (
                  <div style={{padding:'12px 14px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:'13px', color:'#EF4444'}}>
                    ⚠️ {error}
                  </div>
                )}

                <button onClick={enviarMensaje} disabled={enviando} className="btn-send"
                  style={{width:'100%', padding:'14px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor: enviando ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif', transition:'all .2s', opacity: enviando ? 0.8 : 1}}>
                  {enviando ? '⏳ Enviando...' : '📨 Enviar mensaje'}
                </button>

                <p style={{fontSize:'12px', color:'#4B5563', textAlign:'center'}}>
                  Respondemos en menos de 48 horas habiles
                </p>
              </div>
            )}
          </div>

          {/* INFO DE CONTACTO */}
          <div>
            <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'24px', fontWeight:700, marginBottom:'24px'}}>
              Otras formas de contacto
            </h2>

            <div style={{display:'flex', flexDirection:'column', gap:'14px', marginBottom:'32px'}}>
              {[
                {
                  icon:'📧',
                  titulo:'Soporte general',
                  desc:'Para consultas generales y ayuda con tu cuenta',
                  valor:'soporte@scorebet.space',
                  link:'mailto:soporte@scorebet.space',
                  color:'#00FF88',
                },
                {
                  icon:'🔒',
                  titulo:'Privacidad y datos',
                  desc:'Para ejercer tus derechos de privacidad',
                  valor:'privacidad@scorebet.space',
                  link:'mailto:privacidad@scorebet.space',
                  color:'#3B82F6',
                },
                {
                  icon:'🤝',
                  titulo:'Afiliados y negocios',
                  desc:'Para propuestas de colaboracion y afiliados',
                  valor:'afiliados@scorebet.space',
                  link:'mailto:afiliados@scorebet.space',
                  color:'#F59E0B',
                },
                {
                  icon:'📰',
                  titulo:'Prensa y medios',
                  desc:'Para periodistas y solicitudes de prensa',
                  valor:'prensa@scorebet.space',
                  link:'mailto:prensa@scorebet.space',
                  color:'#8B5CF6',
                },
              ].map(c => (
                <a key={c.titulo} href={c.link} className="contact-card"
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', textDecoration:'none', transition:'all .2s'}}>
                  <div style={{width:'44px', height:'44px', borderRadius:'10px', background:`${c.color}15`, border:`1px solid ${c.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0}}>
                    {c.icon}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:'14px', fontWeight:600, color:'#F9FAFB', marginBottom:'2px'}}>{c.titulo}</div>
                    <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'4px'}}>{c.desc}</div>
                    <div style={{fontSize:'13px', color:c.color, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.valor}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Tiempo de respuesta */}
            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'20px', marginBottom:'20px'}}>
              <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'16px', fontWeight:700, marginBottom:'14px'}}>⏱️ Tiempos de respuesta</div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {[
                  { tipo:'Soporte tecnico',   tiempo:'24-48 horas', color:'#00FF88' },
                  { tipo:'Problemas de canje', tiempo:'24-48 horas', color:'#F59E0B' },
                  { tipo:'Privacidad',         tiempo:'72 horas',    color:'#3B82F6' },
                  { tipo:'Afiliados',          tiempo:'48-72 horas', color:'#8B5CF6' },
                ].map(t => (
                  <div key={t.tipo} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{fontSize:'13px', color:'#9CA3AF'}}>{t.tipo}</span>
                    <span style={{fontSize:'12px', fontWeight:600, color:t.color, background:`${t.color}10`, padding:'3px 10px', borderRadius:'999px'}}>{t.tiempo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ rapido */}
            <div style={{background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.12)', borderRadius:'12px', padding:'20px'}}>
              <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'16px', fontWeight:700, marginBottom:'12px', color:'#00FF88'}}>💡 Antes de contactarnos</div>
              <p style={{fontSize:'13px', color:'#9CA3AF', marginBottom:'12px', lineHeight:1.6}}>
                Revisa nuestras paginas de ayuda, puede que ya tengas respuesta:
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                {[
                  { label:'Terminos de uso',    href:'/terminos' },
                  { label:'Politica de puntos', href:'/politica-puntos' },
                  { label:'Privacidad',         href:'/privacidad' },
                  { label:'Sobre nosotros',     href:'/sobre-nosotros' },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    style={{fontSize:'13px', color:'#00FF88', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px'}}>
                    → {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RESPONSIVE */}
        <style>{`
          @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @media(max-width:768px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      </div>
    </main>
  )
}
