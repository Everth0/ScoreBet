'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, updateProfile, sendEmailVerification } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function Perfil() {
  const router = useRouter()
  const [user, setUser]         = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre]     = useState('')
  const [msg, setMsg]           = useState<{tipo:'ok'|'error', texto:string} | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists()) {
        const data = snap.data()
        setUserData({ uid: u.uid, ...data })
        setNombre(data.nombre || '')
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function guardarPerfil() {
    if (!user || !nombre.trim()) return
    setGuardando(true)
    try {
      await updateProfile(user, { displayName: nombre })
      await updateDoc(doc(db, 'users', user.uid), { nombre })
      setUserData((prev: any) => ({ ...prev, nombre }))
      setEditando(false)
      setMsg({ tipo:'ok', texto:'Perfil actualizado correctamente' })
    } catch {
      setMsg({ tipo:'error', texto:'Error al actualizar perfil' })
    }
    setGuardando(false)
    setTimeout(() => setMsg(null), 3000)
  }

  async function reenviarVerificacion() {
    if (!user) return
    setEnviandoEmail(true)
    try {
      await sendEmailVerification(user)
      setMsg({ tipo:'ok', texto:'Email de verificacion enviado. Revisa tu correo.' })
    } catch {
      setMsg({ tipo:'error', texto:'Error al enviar email. Intenta mas tarde.' })
    }
    setEnviandoEmail(false)
    setTimeout(() => setMsg(null), 4000)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando perfil...</div>
      </div>
    </main>
  )

  const pts          = userData?.puntosActuales || 0
  const ptsHistorico = userData?.puntosHistorico || 0
  const diasCuenta   = userData?.fechaRegistro
    ? Math.floor((Date.now() - userData.fechaRegistro.toMillis()) / 86400000)
    : 0
  const META         = 50000
  const progreso     = Math.min((pts / META) * 100, 100)
  const codigo       = userData?.codigoReferido || ''
  const linkReferido = `https://www.scorebet.space/login?ref=${codigo}`

  // Requisitos para canjear
  const requisitos = [
    { label:'Email verificado',    ok: user?.emailVerified,                                          valor: user?.emailVerified ? 'Verificado ✓' : 'Pendiente' },
    { label:'Antiguedad 30 dias',  ok: diasCuenta >= 30,                                             valor: `${diasCuenta}/30 dias` },
    { label:'50 anuncios vistos',  ok: Math.floor(ptsHistorico/50) >= 50,                           valor: `${Math.floor(ptsHistorico/50)}/50` },
    { label:'10 apuestas hechas',  ok: (userData?.totalApuestas||0) >= 10,                          valor: `${userData?.totalApuestas||0}/10` },
  ]

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar puntosActuales={pts} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .input-field:focus { border-color:#00FF88 !important; outline:none; }
        .btn-edit:hover { background:#00cc6a !important; transform:translateY(-1px); }
        .card:hover { border-color:rgba(0,255,136,0.15) !important; }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>

            {/* Avatar */}
            <div style={{width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#00FF88,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700, color:'#0A0E1A', flexShrink:0}}>
              {(userData?.nombre || user?.email || 'U')[0].toUpperCase()}
            </div>

            <div style={{flex:1}}>
              {editando ? (
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                  <input
                    className="input-field"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    style={{background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'10px 14px', color:'#F9FAFB', fontSize:'16px', fontFamily:'Inter,sans-serif', transition:'border-color .2s', minWidth:'200px'}}
                  />
                  <button onClick={guardarPerfil} disabled={guardando}
                    className="btn-edit"
                    style={{padding:'10px 20px', borderRadius:'8px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all .2s'}}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(false)}
                    style={{padding:'10px 16px', borderRadius:'8px', background:'transparent', color:'#6B7280', fontSize:'14px', border:'1px solid #374151', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                  <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700}}>
                    {userData?.nombre || 'Sin nombre'}
                  </h1>
                  <button onClick={() => setEditando(true)}
                    style={{padding:'6px 14px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9CA3AF', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    ✏️ Editar
                  </button>
                </div>
              )}
              <div style={{fontSize:'14px', color:'#6B7280', marginTop:'4px'}}>{user?.email}</div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'8px', flexWrap:'wrap'}}>
                {user?.emailVerified
                  ? <span style={{fontSize:'12px', color:'#00FF88', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', padding:'3px 10px', borderRadius:'999px'}}>✅ Email verificado</span>
                  : <span style={{fontSize:'12px', color:'#F59E0B', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', padding:'3px 10px', borderRadius:'999px'}}>⚠️ Email no verificado</span>
                }
                <span style={{fontSize:'12px', color:'#6B7280', background:'rgba(255,255,255,0.04)', padding:'3px 10px', borderRadius:'999px'}}>
                  Miembro desde hace {diasCuenta} dias
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MENSAJE */}
        {msg && (
          <div style={{margin:'16px 24px', padding:'12px 16px', borderRadius:'10px', background: msg.tipo === 'ok' ? 'rgba(0,255,136,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${msg.tipo === 'ok' ? 'rgba(0,255,136,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize:'14px', color: msg.tipo === 'ok' ? '#00FF88' : '#EF4444'}}>
            {msg.texto}
          </div>
        )}

        <div style={{padding:'24px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px', maxWidth:'1000px', margin:'0 auto', animation:'fadeIn .3s ease'}}>

          {/* ESTADISTICAS */}
          <div className="card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'22px', transition:'all .2s'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'18px', color:'#00FF88'}}>⚡ Mis puntos</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px'}}>
              {[
                { label:'Puntos actuales',  val:pts.toLocaleString(),           color:'#00FF88' },
                { label:'Puntos historicos', val:ptsHistorico.toLocaleString(), color:'#3B82F6' },
                { label:'Ads vistos total',  val:Math.floor(ptsHistorico/50).toLocaleString(), color:'#F59E0B' },
                { label:'Referidos',         val:(userData?.totalReferidos||0).toString(), color:'#8B5CF6' },
              ].map(s => (
                <div key={s.label} style={{background:'#0F1520', borderRadius:'10px', padding:'14px', textAlign:'center'}}>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:s.color}}>{s.val}</div>
                  <div style={{fontSize:'11px', color:'#6B7280', marginTop:'3px'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Barra progreso */}
            <div style={{marginBottom:'8px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px'}}>
                <span style={{color:'#9CA3AF'}}>Progreso al primer canje</span>
                <span style={{color:'#00FF88', fontFamily:'JetBrains Mono, monospace'}}>{progreso.toFixed(1)}%</span>
              </div>
              <div style={{background:'#1F2937', borderRadius:'999px', height:'8px', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${progreso}%`, background:'linear-gradient(90deg,#00FF88,#3B82F6)', borderRadius:'999px', transition:'width .5s'}}/>
              </div>
              <div style={{fontSize:'11px', color:'#4B5563', marginTop:'5px'}}>
                {pts >= META ? '🎉 Puedes canjear!' : `Faltan ${(META-pts).toLocaleString()} pts para $5`}
              </div>
            </div>

            <Link href="/recompensas" style={{display:'block', textAlign:'center', padding:'11px', borderRadius:'10px', background: pts >= META ? '#00FF88' : '#1F2937', color: pts >= META ? '#0A0E1A' : '#4B5563', fontWeight:700, fontSize:'13px', textDecoration:'none', marginTop:'12px', border: pts >= META ? 'none' : '1px solid #374151'}}>
              {pts >= META ? '🎁 Canjear premio ahora' : 'Ver recompensas'}
            </Link>
          </div>

          {/* CODIGO REFERIDO */}
          <div className="card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'22px', transition:'all .2s'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'18px', color:'#8B5CF6'}}>🔗 Mi codigo referido</h3>
            <div style={{background:'#0F1520', border:'1px solid rgba(139,92,246,0.2)', borderRadius:'12px', padding:'16px', textAlign:'center', marginBottom:'16px'}}>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'28px', fontWeight:700, color:'#8B5CF6', letterSpacing:'6px'}}>{codigo}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(codigo); setMsg({tipo:'ok', texto:'Codigo copiado!'}) }}
              style={{width:'100%', padding:'11px', borderRadius:'10px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', color:'#8B5CF6', fontWeight:600, fontSize:'13px', cursor:'pointer', marginBottom:'10px', fontFamily:'Inter,sans-serif'}}>
              📋 Copiar codigo
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`Unete a ScoreBet y gana premios reales gratis! Usa mi codigo: ${codigo} 👉 ${linkReferido}`); setMsg({tipo:'ok', texto:'Link copiado!'}) }}
              style={{width:'100%', padding:'11px', borderRadius:'10px', background:'transparent', border:'1px solid #374151', color:'#9CA3AF', fontWeight:500, fontSize:'13px', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
              🔗 Copiar link de invitacion
            </button>
            <div style={{marginTop:'14px', padding:'12px', background:'rgba(139,92,246,0.05)', borderRadius:'10px', fontSize:'12px', color:'#6B7280', textAlign:'center'}}>
              Cada amigo que uses tu codigo te da <span style={{color:'#8B5CF6', fontWeight:600}}>+300 pts</span>
            </div>
          </div>

          {/* VERIFICACION EMAIL */}
          {!user?.emailVerified && (
            <div className="card" style={{background:'#111827', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'16px', padding:'22px', transition:'all .2s'}}>
              <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'12px', color:'#F59E0B'}}>⚠️ Verificar email</h3>
              <p style={{fontSize:'13px', color:'#9CA3AF', lineHeight:1.7, marginBottom:'16px'}}>
                Necesitas verificar tu correo electronico para poder canjear premios. Revisa tu bandeja de entrada.
              </p>
              <button onClick={reenviarVerificacion} disabled={enviandoEmail}
                style={{width:'100%', padding:'12px', borderRadius:'10px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#F59E0B', fontWeight:600, fontSize:'14px', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                {enviandoEmail ? 'Enviando...' : '📧 Reenviar email de verificacion'}
              </button>
            </div>
          )}

          {/* REQUISITOS PARA CANJEAR */}
          <div className="card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'22px', transition:'all .2s'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'18px', color:'#F59E0B'}}>🎁 Requisitos para canjear</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {requisitos.map(r => (
                <div key={r.label} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#0F1520', borderRadius:'10px', border:`1px solid ${r.ok ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)'}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'16px'}}>{r.ok ? '✅' : '⏳'}</span>
                    <span style={{fontSize:'13px', fontWeight:500, color: r.ok ? '#00FF88' : '#9CA3AF'}}>{r.label}</span>
                  </div>
                  <span style={{fontSize:'12px', fontFamily:'JetBrains Mono, monospace', color: r.ok ? '#00FF88' : '#6B7280'}}>{r.valor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ACCESOS RAPIDOS */}
          <div className="card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'22px', transition:'all .2s'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'18px'}}>🔗 Accesos rapidos</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {[
                { href:'/dashboard',      icon:'⚡', label:'Dashboard',          color:'#00FF88' },
                { href:'/partidos',       icon:'⚽', label:'Partidos',           color:'#3B82F6' },
                { href:'/mis-apuestas',   icon:'🎯', label:'Mis apuestas',       color:'#F59E0B' },
                { href:'/recompensas',    icon:'🎁', label:'Recompensas',        color:'#F59E0B' },
                { href:'/referidos',      icon:'👥', label:'Referidos',          color:'#8B5CF6' },
                { href:'/apuestas-reales',icon:'💰', label:'Apuesta con dinero', color:'#F59E0B' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  style={{display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'#0F1520', borderRadius:'10px', textDecoration:'none', border:'1px solid rgba(255,255,255,0.04)', transition:'all .15s'}}>
                  <span style={{fontSize:'18px'}}>{item.icon}</span>
                  <span style={{fontSize:'13px', fontWeight:500, color:'#9CA3AF'}}>{item.label}</span>
                  <span style={{marginLeft:'auto', color:'#4B5563', fontSize:'14px'}}>→</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
