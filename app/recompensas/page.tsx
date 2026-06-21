'use client'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import {
  verificacionCompleta,
  generarHuellaDispositivo,
  verificarDispositivo,
} from '@/lib/antifraud'

const rewards = [
  { icon:'🛒', name:'Amazon $5',        pts:50000,  usd:5,  cat:'Compras' },
  { icon:'🛒', name:'Amazon $10',       pts:100000, usd:10, cat:'Compras' },
  { icon:'🛒', name:'Amazon $25',       pts:250000, usd:25, cat:'Compras' },
  { icon:'🎮', name:'Google Play $5',   pts:50000,  usd:5,  cat:'Gaming' },
  { icon:'🎮', name:'Google Play $10',  pts:100000, usd:10, cat:'Gaming' },
  { icon:'🎮', name:'Steam $10',        pts:100000, usd:10, cat:'Gaming' },
  { icon:'🎬', name:'Netflix 1 mes',    pts:150000, usd:15, cat:'Streaming' },
  { icon:'🎵', name:'Spotify 1 mes',    pts:110000, usd:11, cat:'Streaming' },
  { icon:'🍎', name:'Apple $5',         pts:50000,  usd:5,  cat:'Apple' },
  { icon:'🍎', name:'Apple $10',        pts:100000, usd:10, cat:'Apple' },
]

export default function Recompensas() {
  const router  = useRouter()
  const [user, setUser]         = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [canjeando, setCanjeando]   = useState<string | null>(null)
  const [mensaje, setMensaje]       = useState<{tipo:'ok'|'error', texto:string} | null>(null)
  const META = 50000

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists()) setUserData({ uid: u.uid, ...snap.data() })
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function intentarCanjear(reward: any) {
    if (!user || !userData) return
    if (canjeando) return
    if (userData.puntosActuales < reward.pts) {
      setMensaje({ tipo:'error', texto:'No tienes suficientes puntos para este premio' })
      return
    }

    setCanjeando(reward.name)
    setMensaje(null)

    try {
      // Verificar dispositivo
      const huella = generarHuellaDispositivo()
      const dispositivo = await verificarDispositivo(user.uid, huella)
      if (!dispositivo.permitido) {
        setMensaje({ tipo:'error', texto: dispositivo.razon || 'Dispositivo no permitido' })
        setCanjeando(null)
        return
      }

      // Verificacion completa
      const verificacion = await verificacionCompleta(user, userData)
      if (!verificacion.permitido) {
        setMensaje({ tipo:'error', texto: verificacion.razon || 'No cumples los requisitos' })
        setCanjeando(null)
        return
      }

      // Registrar solicitud de canje
      await addDoc(collection(db, 'canjes'), {
        userId:    user.uid,
        email:     user.email,
        nombre:    userData.nombre,
        premio:    reward.name,
        puntos:    reward.pts,
        valorUSD:  reward.usd,
        estado:    'pendiente',
        huella,
        fechaSolicitud: serverTimestamp(),
      })

      setMensaje({
        tipo: 'ok',
        texto: `✅ Solicitud de ${reward.name} enviada. Recibirás tu premio en 24-48 horas por email.`
      })
    } catch (e) {
      setMensaje({ tipo:'error', texto:'Error al procesar. Intenta de nuevo.' })
    }
    setCanjeando(null)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700, color:'#F9FAFB'}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando...</div>
      </div>
    </main>
  )

  const pts = userData?.puntosActuales || 0
  const progreso = Math.min((pts / META) * 100, 100)

  // Calcular dias de cuenta
  const diasCuenta = userData?.fechaRegistro
    ? Math.floor((Date.now() - userData.fechaRegistro.toMillis()) / 86400000)
    : 0

  // Requisitos para canjear
  const requisitos = [
    { label:'Email verificado', ok: user?.emailVerified, valor: user?.emailVerified ? 'Verificado ✓' : 'Pendiente' },
    { label:'Antiguedad cuenta', ok: diasCuenta >= 30, valor: `${diasCuenta}/30 dias` },
    { label:'Anuncios vistos', ok: Math.floor((userData?.puntosHistorico||0)/50) >= 50, valor: `${Math.floor((userData?.puntosHistorico||0)/50)}/50` },
    { label:'Apuestas realizadas', ok: (userData?.totalApuestas||0) >= 10, valor: `${userData?.totalApuestas||0}/10` },
  ]
  const puedeCanjelar = requisitos.every(r => r.ok)

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar puntosActuales={pts} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; }
        .reward-card:hover { border-color:#F59E0B !important; transform:translateY(-3px); }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Catalogo de premios</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'20px'}}>
            Que puedes <span style={{color:'#00FF88'}}>ganar?</span>
          </h1>

          {/* Saldo y equivalencia */}
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'24px'}}>
            <div style={{background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', gap:'10px'}}>
              <span style={{fontSize:'13px', color:'#9CA3AF'}}>Tu saldo</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>{pts.toLocaleString()}</span>
              <span style={{fontSize:'13px', color:'#6B7280'}}>pts</span>
            </div>
            <div style={{background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'16px'}}>💱</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'14px', fontWeight:700, color:'#3B82F6'}}>50,000 pts = $5 USD</span>
            </div>
          </div>

          {/* Barra progreso */}
          <div style={{maxWidth:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
              <span style={{fontSize:'12px', color:'#9CA3AF'}}>Progreso al primer premio</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#00FF88'}}>{progreso.toFixed(1)}%</span>
            </div>
            <div style={{background:'#1F2937', borderRadius:'999px', height:'8px', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${progreso}%`, background:'linear-gradient(90deg,#00FF88,#3B82F6)', borderRadius:'999px'}}/>
            </div>
          </div>
        </div>

        {/* REQUISITOS PARA CANJEAR */}
        <div style={{padding:'24px', background:'#0A0E1A', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{fontSize:'12px', fontWeight:700, color:'#9CA3AF', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'14px'}}>
            Requisitos para canjear
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'10px'}}>
            {requisitos.map(r => (
              <div key={r.label} style={{background:'#111827', border:`1px solid ${r.ok ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius:'10px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontSize:'18px'}}>{r.ok ? '✅' : '⏳'}</span>
                <div>
                  <div style={{fontSize:'12px', fontWeight:600, color: r.ok ? '#00FF88' : '#9CA3AF'}}>{r.label}</div>
                  <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>{r.valor}</div>
                </div>
              </div>
            ))}
          </div>

          {!user?.emailVerified && (
            <div style={{marginTop:'12px', padding:'12px 16px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'10px', fontSize:'13px', color:'#F59E0B'}}>
              ⚠️ Revisa tu correo y verifica tu email para poder canjear premios
            </div>
          )}
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div style={{margin:'16px 24px', padding:'14px 18px', borderRadius:'10px', background: mensaje.tipo === 'ok' ? 'rgba(0,255,136,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${mensaje.tipo === 'ok' ? 'rgba(0,255,136,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize:'14px', color: mensaje.tipo === 'ok' ? '#00FF88' : '#EF4444', lineHeight:1.6}}>
            {mensaje.texto}
          </div>
        )}

        {/* CATALOGO */}
        {['Compras','Gaming','Streaming','Apple'].map(cat => (
          <div key={cat} style={{padding:'24px 24px 0'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
              <div style={{width:'3px', height:'20px', background:'#00FF88', borderRadius:'2px'}}/>
              <span style={{fontSize:'13px', fontWeight:700, color:'#F9FAFB', letterSpacing:'1px', textTransform:'uppercase'}}>{cat}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:'12px', marginBottom:'8px'}}>
              {rewards.filter(r => r.cat === cat).map(r => {
                const tienePuntos   = pts >= r.pts
                const puedeEsteBtn  = puedeCanjelar && tienePuntos
                const estaProcesando = canjeando === r.name

                return (
                  <div key={r.name} className="reward-card"
                    style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center', transition:'all .2s', opacity: tienePuntos ? 1 : 0.6}}>
                    <div style={{fontSize:'38px'}}>{r.icon}</div>
                    <div style={{fontSize:'14px', fontWeight:700}}>{r.name}</div>
                    <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#F59E0B', fontWeight:600, background:'rgba(245,158,11,.08)', padding:'4px 10px', borderRadius:'999px'}}>
                      {r.pts.toLocaleString()} pts
                    </div>
                    <div style={{fontSize:'11px', color:'#6B7280'}}>= ${r.usd} USD</div>

                    {/* Barra progreso mini */}
                    <div style={{width:'100%', background:'#1F2937', borderRadius:'999px', height:'4px'}}>
                      <div style={{height:'100%', width:`${Math.min((pts/r.pts)*100,100)}%`, background: tienePuntos ? '#00FF88' : '#3B82F6', borderRadius:'999px'}}/>
                    </div>

                    <button onClick={() => intentarCanjear(r)} disabled={!puedeEsteBtn || estaProcesando}
                      style={{width:'100%', padding:'11px', borderRadius:'8px', background: puedeEsteBtn ? '#00FF88' : '#1F2937', color: puedeEsteBtn ? '#0A0E1A' : '#4B5563', border: puedeEsteBtn ? 'none' : '1px solid #374151', fontSize:'13px', fontWeight:700, cursor: puedeEsteBtn ? 'pointer' : 'not-allowed', transition:'all .2s', fontFamily:'Inter, sans-serif'}}>
                      {estaProcesando
                        ? '⏳ Procesando...'
                        : !tienePuntos
                          ? `Faltan ${(r.pts-pts).toLocaleString()} pts`
                          : !puedeCanjelar
                            ? '🔒 Requisitos pendientes'
                            : '🎉 Canjear ahora'
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{height:'60px'}}/>
      </div>
    </main>
  )
}
