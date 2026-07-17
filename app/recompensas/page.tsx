'use client'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, Timestamp, increment, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import {
  verificacionCompleta,
  generarHuellaDispositivo,
  verificarDispositivo,
} from '@/lib/antifraud'

const rewards = [
  { icon:'💲', name:'USDT $5',         pts:50000,  usd:5,  cat:'Crypto', comision:5 },
  { icon:'💲', name:'USDT $10',        pts:100000, usd:10, cat:'Crypto', comision:5 },
  { icon:'💲', name:'USDT $25',        pts:250000, usd:25, cat:'Crypto', comision:5 },
  { icon:'💲', name:'USDT $50',        pts:500000, usd:50, cat:'Crypto', comision:5 },
  { icon:'🛒', name:'Amazon $5',        pts:50000,  usd:5,  cat:'Compras', comision:0 },
  { icon:'🛒', name:'Amazon $10',       pts:100000, usd:10, cat:'Compras', comision:0 },
  { icon:'🛒', name:'Amazon $25',       pts:250000, usd:25, cat:'Compras', comision:0 },
  { icon:'🎮', name:'Google Play $5',   pts:50000,  usd:5,  cat:'Gaming', comision:0 },
  { icon:'🎮', name:'Google Play $10',  pts:100000, usd:10, cat:'Gaming', comision:0 },
  { icon:'🎮', name:'Steam $10',        pts:100000, usd:10, cat:'Gaming', comision:0 },
  { icon:'🎬', name:'Netflix 1 mes',    pts:150000, usd:15, cat:'Streaming', comision:0 },
  { icon:'🎵', name:'Spotify 1 mes',    pts:110000, usd:11, cat:'Streaming', comision:0 },
  { icon:'🍎', name:'Apple $5',         pts:50000,  usd:5,  cat:'Apple', comision:0 },
  { icon:'🍎', name:'Apple $10',        pts:100000, usd:10, cat:'Apple', comision:0 },
]

const META = 50000

export default function Recompensas() {
  const router  = useRouter()
  const [user, setUser]             = useState<any>(null)
  const [userData, setUserData]     = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [canjeando, setCanjeando]   = useState<string|null>(null)
  const [mensaje, setMensaje]       = useState<{tipo:'ok'|'error', texto:string}|null>(null)
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [selectedCrypto, setSelectedCrypto]   = useState<any>(null)
  const [walletAddress, setWalletAddress]     = useState('')
  const [network, setNetwork]                 = useState('TRC20')
  const [historial, setHistorial]             = useState<any[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { router.push('/login'); return }
      setUser(u)
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists()) {
        const data = snap.data()
        if (!data.fechaRegistro && u.metadata?.creationTime) {
          const fechaBackfill = Timestamp.fromDate(new Date(u.metadata.creationTime))
          try {
            await updateDoc(doc(db, 'users', u.uid), { fechaRegistro: fechaBackfill })
            data.fechaRegistro = fechaBackfill
          } catch (e) {
            console.error('No se pudo rellenar fechaRegistro:', e)
          }
        }
        setUserData({ uid: u.uid, ...data })
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'canjes'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lista.sort((a: any, b: any) => {
        const ta = a.fechaSolicitud?.toMillis?.() || 0
        const tb = b.fechaSolicitud?.toMillis?.() || 0
        return tb - ta
      })
      setHistorial(lista)
    }, (error) => {
      console.error('Error cargando historial de canjes:', error)
    })
    return () => unsub()
  }, [user])

  async function intentarCanjear(reward: any) {
    if (!user || !userData) return
    if (canjeando) return
    if (userData.puntosActuales < reward.pts) {
      setMensaje({ tipo:'error', texto:'No tienes suficientes puntos para este premio' })
      return
    }

    // Si es crypto abrir modal
    if (reward.cat === 'Crypto') {
      setSelectedCrypto(reward)
      setShowCryptoModal(true)
      return
    }

    procesarCanje(reward, null, null)
  }

  async function procesarCanje(reward: any, wallet: string|null, red: string|null) {
    setCanjeando(reward.name)
    setMensaje(null)
    try {
      const huella = generarHuellaDispositivo()
      const dispositivo = await verificarDispositivo(user.uid, huella)
      if (!dispositivo.permitido) {
        setMensaje({ tipo:'error', texto: dispositivo.razon || 'Dispositivo no permitido' })
        setCanjeando(null)
        return
      }

      const verificacion = await verificacionCompleta(user, userData)
      if (!verificacion.permitido) {
        setMensaje({ tipo:'error', texto: verificacion.razon || 'No cumples los requisitos' })
        setCanjeando(null)
        return
      }

      // Calcular comision para crypto
      const comisionPct  = reward.comision || 0
      const comisionUSD  = parseFloat((reward.usd * comisionPct / 100).toFixed(2))
      const montoFinal   = parseFloat((reward.usd - comisionUSD).toFixed(2))

      await addDoc(collection(db, 'canjes'), {
        userId:        user.uid,
        email:         user.email,
        nombre:        userData.nombre,
        premio:        reward.name,
        puntos:        reward.pts,
        valorUSD:      reward.usd,
        tipo:          wallet ? 'crypto' : 'giftcard',
        walletAddress: wallet || null,
        redCrypto:     red || null,
        comisionPct:   comisionPct,
        comisionUSD:   comisionUSD,
        montoFinal:    montoFinal,
        estado:        'pendiente',
        huella,
        fechaSolicitud: serverTimestamp(),
      })

      // Descontar los puntos del usuario al momento de solicitar el canje
      await updateDoc(doc(db, 'users', user.uid), {
        puntosActuales: increment(-reward.pts),
      })

      setShowCryptoModal(false)
      setWalletAddress('')
      setMensaje({
        tipo: 'ok',
        texto: wallet
          ? `✅ Solicitud de ${reward.name} enviada. Recibirás $${montoFinal} USDT (despues de ${comisionPct}% comision) en tu wallet en 24-48 horas.`
          : `✅ Solicitud de ${reward.name} enviada. Recibirás tu premio por email en 24-48 horas.`
      })
    } catch(e: any) {
      setMensaje({ tipo:'error', texto:'Error al procesar: ' + e.message })
    }
    setCanjeando(null)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando...</div>
      </div>
    </main>
  )

  const pts      = userData?.puntosActuales || 0
  const progreso = Math.min((pts/META)*100, 100)

  const fechaRegistroMs = userData?.fechaRegistro?.toMillis?.()
    ?? (user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : null)

  const diasCuenta = fechaRegistroMs
    ? Math.floor((Date.now() - fechaRegistroMs) / 86400000)
    : 0

  const requisitos = [
    { label:'Email verificado',   ok: user?.emailVerified,                                 valor: user?.emailVerified ? 'Verificado ✓' : 'Pendiente' },
    { label:'Antiguedad 30 dias', ok: diasCuenta >= 30,                                    valor: `${diasCuenta}/30 dias` },
    { label:'50 anuncios vistos', ok: Math.floor((userData?.puntosHistorico||0)/50) >= 50, valor: `${Math.floor((userData?.puntosHistorico||0)/50)}/50` },
    { label:'10 apuestas hechas', ok: (userData?.totalApuestas||0) >= 10,                  valor: `${userData?.totalApuestas||0}/10` },
  ]
  const puedeCanjelar = requisitos.every(r => r.ok)

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
      <Navbar puntosActuales={pts}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; }
        .reward-card:hover { border-color:#F59E0B !important; transform:translateY(-3px); }
        .crypto-card:hover { border-color:#00FF88 !important; transform:translateY(-3px); }
        .input-field:focus { border-color:#00FF88 !important; outline:none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Catalogo de premios</div>
          <h1 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'20px'}}>
            Que puedes <span style={{color:'#00FF88'}}>ganar?</span>
          </h1>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px'}}>
            <div style={{background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'12px', padding:'12px 20px', display:'flex', alignItems:'center', gap:'10px'}}>
              <span style={{fontSize:'13px', color:'#9CA3AF'}}>Tu saldo</span>
              <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>{pts.toLocaleString()}</span>
              <span style={{fontSize:'13px', color:'#6B7280'}}>pts</span>
            </div>
            <div style={{background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'12px', padding:'12px 20px', display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'16px'}}>💱</span>
              <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'14px', fontWeight:700, color:'#3B82F6'}}>50,000 pts = $5 USD</span>
            </div>
          </div>
          <div style={{maxWidth:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
              <span style={{fontSize:'12px', color:'#9CA3AF'}}>Progreso al primer premio</span>
              <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#00FF88'}}>{progreso.toFixed(1)}%</span>
            </div>
            <div style={{background:'#1F2937', borderRadius:'999px', height:'8px', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${progreso}%`, background:'linear-gradient(90deg,#00FF88,#3B82F6)', borderRadius:'999px'}}/>
            </div>
          </div>
        </div>

        {/* REQUISITOS */}
        <div style={{padding:'20px 24px', background:'#0A0E1A', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{fontSize:'12px', fontWeight:700, color:'#9CA3AF', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px'}}>Requisitos para canjear</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'10px'}}>
            {requisitos.map(r => (
              <div key={r.label} style={{background:'#111827', border:`1px solid ${r.ok?'rgba(0,255,136,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:'10px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontSize:'16px'}}>{r.ok?'✅':'⏳'}</span>
                <div>
                  <div style={{fontSize:'12px', fontWeight:600, color:r.ok?'#00FF88':'#9CA3AF'}}>{r.label}</div>
                  <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>{r.valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div style={{margin:'16px 24px', padding:'14px 18px', borderRadius:'10px', background:mensaje.tipo==='ok'?'rgba(0,255,136,0.08)':'rgba(239,68,68,0.08)', border:`1px solid ${mensaje.tipo==='ok'?'rgba(0,255,136,0.25)':'rgba(239,68,68,0.25)'}`, fontSize:'14px', color:mensaje.tipo==='ok'?'#00FF88':'#EF4444', lineHeight:1.6}}>
            {mensaje.texto}
          </div>
        )}

        {/* CRYPTO USDT - DESTACADO */}
        <div style={{padding:'28px 24px 0'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
            <div style={{width:'3px', height:'20px', background:'#00FF88', borderRadius:'2px'}}/>
            <span style={{fontSize:'13px', fontWeight:700, color:'#F9FAFB', letterSpacing:'1px', textTransform:'uppercase'}}>💲 Retiro en Crypto (USDT)</span>
            <span style={{background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.25)', color:'#00FF88', padding:'2px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:700}}>NUEVO</span>
          </div>

          {/* Info comision */}
          <div style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px'}}>
            <span style={{fontSize:'20px'}}>⚠️</span>
            <div>
              <div style={{fontSize:'13px', fontWeight:600, color:'#F59E0B', marginBottom:'2px'}}>Comision de retiro: 5%</div>
              <div style={{fontSize:'12px', color:'#9CA3AF'}}>Ejemplo: Si retiras $10 USDT, recibes $9.50 USDT despues de la comision del 5%</div>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginBottom:'16px'}}>
            {rewards.filter(r => r.cat === 'Crypto').map(r => {
              const tienePuntos  = pts >= r.pts
              const comisionUSD  = parseFloat((r.usd * r.comision / 100).toFixed(2))
              const montoFinal   = r.usd - comisionUSD
              return (
                <div key={r.name} className="crypto-card" style={{background:'#111827', border:'1px solid rgba(0,255,136,0.12)', borderRadius:'14px', padding:'20px 16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center', cursor:'pointer', transition:'all .2s', opacity:tienePuntos?1:0.6}}>
                  <div style={{fontSize:'36px'}}>💲</div>
                  <div style={{fontSize:'15px', fontWeight:700}}>{r.name}</div>
                  <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#F59E0B', fontWeight:600, background:'rgba(245,158,11,.08)', padding:'4px 10px', borderRadius:'999px'}}>
                    {r.pts.toLocaleString()} pts
                  </div>
                  <div style={{fontSize:'11px', color:'#6B7280'}}>= ${r.usd} USD</div>
                  <div style={{width:'100%', background:'#0F1520', borderRadius:'8px', padding:'8px', fontSize:'11px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                      <span style={{color:'#6B7280'}}>Bruto</span>
                      <span style={{color:'#F9FAFB', fontFamily:'JetBrains Mono,monospace'}}>${r.usd}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                      <span style={{color:'#EF4444'}}>Comision 5%</span>
                      <span style={{color:'#EF4444', fontFamily:'JetBrains Mono,monospace'}}>-${comisionUSD}</span>
                    </div>
                    <div style={{height:'1px', background:'rgba(255,255,255,0.06)', margin:'4px 0'}}/>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color:'#00FF88', fontWeight:700}}>Recibes</span>
                      <span style={{color:'#00FF88', fontFamily:'JetBrains Mono,monospace', fontWeight:700}}>${montoFinal} USDT</span>
                    </div>
                  </div>
                  <div style={{width:'100%', background:'#1F2937', borderRadius:'999px', height:'4px'}}>
                    <div style={{height:'100%', width:`${Math.min((pts/r.pts)*100,100)}%`, background:tienePuntos?'#00FF88':'#3B82F6', borderRadius:'999px'}}/>
                  </div>
                  <button onClick={() => intentarCanjear(r)} disabled={!puedeCanjelar||!tienePuntos||canjeando===r.name}
                    style={{width:'100%', padding:'11px', borderRadius:'8px', background:tienePuntos&&puedeCanjelar?'#00FF88':'#1F2937', color:tienePuntos&&puedeCanjelar?'#0A0E1A':'#4B5563', border:tienePuntos&&puedeCanjelar?'none':'1px solid #374151', fontSize:'13px', fontWeight:700, cursor:tienePuntos&&puedeCanjelar?'pointer':'not-allowed', transition:'all .2s', fontFamily:'Inter,sans-serif'}}>
                    {canjeando===r.name ? '⏳ Procesando...' : !tienePuntos ? `Faltan ${(r.pts-pts).toLocaleString()} pts` : !puedeCanjelar ? '🔒 Requisitos pendientes' : '💲 Retirar USDT'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* OTRAS CATEGORIAS */}
        {['Compras','Gaming','Streaming','Apple'].map(cat => (
          <div key={cat} style={{padding:'24px 24px 0'}}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
              <div style={{width:'3px', height:'20px', background:'#00FF88', borderRadius:'2px'}}/>
              <span style={{fontSize:'13px', fontWeight:700, color:'#F9FAFB', letterSpacing:'1px', textTransform:'uppercase'}}>{cat}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'12px', marginBottom:'8px'}}>
              {rewards.filter(r => r.cat === cat).map(r => {
                const tienePuntos  = pts >= r.pts
                const puedeEsteBtn = puedeCanjelar && tienePuntos
                return (
                  <div key={r.name} className="reward-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center', transition:'all .2s', opacity:tienePuntos?1:0.6}}>
                    <div style={{fontSize:'36px'}}>{r.icon}</div>
                    <div style={{fontSize:'14px', fontWeight:700}}>{r.name}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#F59E0B', fontWeight:600, background:'rgba(245,158,11,.08)', padding:'4px 10px', borderRadius:'999px'}}>
                      {r.pts.toLocaleString()} pts
                    </div>
                    <div style={{fontSize:'11px', color:'#6B7280'}}>= ${r.usd} USD</div>
                    <div style={{width:'100%', background:'#1F2937', borderRadius:'999px', height:'4px'}}>
                      <div style={{height:'100%', width:`${Math.min((pts/r.pts)*100,100)}%`, background:tienePuntos?'#00FF88':'#3B82F6', borderRadius:'999px'}}/>
                    </div>
                    <button onClick={() => intentarCanjear(r)} disabled={!puedeEsteBtn||canjeando===r.name}
                      style={{width:'100%', padding:'11px', borderRadius:'8px', background:puedeEsteBtn?'#00FF88':'#1F2937', color:puedeEsteBtn?'#0A0E1A':'#4B5563', border:puedeEsteBtn?'none':'1px solid #374151', fontSize:'13px', fontWeight:700, cursor:puedeEsteBtn?'pointer':'not-allowed', transition:'all .2s', fontFamily:'Inter,sans-serif'}}>
                      {canjeando===r.name ? '⏳...' : !tienePuntos ? `Faltan ${(r.pts-pts).toLocaleString()} pts` : !puedeCanjelar ? '🔒 Requisitos' : '🎉 Canjear'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* HISTORIAL DE CANJES */}
        {historial.length > 0 && (
          <div style={{marginTop:'40px'}}>
            <h3 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'16px'}}>
              📜 Historial de retiros
            </h3>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {historial.map(h => {
                const esAprobado = h.estado === 'aprobado'
                const esRechazado = h.estado === 'rechazado'
                const colorEstado = esAprobado ? '#00FF88' : esRechazado ? '#EF4444' : '#F59E0B'
                const textoEstado = esAprobado ? '✅ Pagado' : esRechazado ? '❌ Rechazado' : '⏳ Pendiente'
                return (
                  <div key={h.id} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
                    <div>
                      <div style={{fontSize:'14px', fontWeight:600}}>{h.premio}</div>
                      <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>
                        {h.puntos?.toLocaleString()} pts · ${h.montoFinal ?? h.valorUSD} USD
                        {h.fechaSolicitud?.toDate && ` · ${h.fechaSolicitud.toDate().toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' })}`}
                      </div>
                    </div>
                    <div style={{fontSize:'12px', fontWeight:700, color:colorEstado, background:`${colorEstado}1A`, border:`1px solid ${colorEstado}4D`, borderRadius:'999px', padding:'5px 12px'}}>
                      {textoEstado}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{height:'60px'}}/>
      </div>

      {/* MODAL CRYPTO */}
      {showCryptoModal && selectedCrypto && (
        <>
          <div onClick={() => setShowCryptoModal(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, backdropFilter:'blur(4px)'}}/>
          <div style={{position:'fixed', bottom:0, left:0, right:0, zIndex:201, background:'#111827', borderRadius:'20px 20px 0 0', padding:'24px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 -8px 40px rgba(0,0,0,0.5)', animation:'slideUp .3s ease'}}>

            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'22px', fontWeight:700}}>💲 Retirar {selectedCrypto.name}</h3>
              <button onClick={() => setShowCryptoModal(false)} style={{background:'#1F2937', border:'none', color:'#9CA3AF', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'16px'}}>✕</button>
            </div>

            {/* Resumen */}
            <div style={{background:'#0F1520', borderRadius:'12px', padding:'16px', marginBottom:'20px', border:'1px solid rgba(0,255,136,0.15)'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px'}}>
                <span style={{color:'#9CA3AF'}}>Monto bruto</span>
                <span style={{fontFamily:'JetBrains Mono,monospace', color:'#F9FAFB', fontWeight:600}}>${selectedCrypto.usd} USDT</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px'}}>
                <span style={{color:'#EF4444'}}>Comision (5%)</span>
                <span style={{fontFamily:'JetBrains Mono,monospace', color:'#EF4444'}}>-${(selectedCrypto.usd * 0.05).toFixed(2)} USDT</span>
              </div>
              <div style={{height:'1px', background:'rgba(255,255,255,0.06)', margin:'8px 0'}}/>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'15px'}}>
                <span style={{fontWeight:700}}>Recibes</span>
                <span style={{fontFamily:'JetBrains Mono,monospace', color:'#00FF88', fontWeight:700, fontSize:'18px'}}>${(selectedCrypto.usd * 0.95).toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Red */}
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'8px', letterSpacing:'0.5px'}}>RED BLOCKCHAIN</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                {['TRC20','ERC20','BEP20'].map(net => (
                  <button key={net} onClick={() => setNetwork(net)}
                    style={{padding:'10px', borderRadius:'8px', border:`1px solid ${network===net?'#00FF88':'rgba(255,255,255,0.1)'}`, background:network===net?'rgba(0,255,136,0.1)':'transparent', color:network===net?'#00FF88':'#9CA3AF', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'JetBrains Mono,monospace'}}>
                    {net}
                  </button>
                ))}
              </div>
              <div style={{marginTop:'8px', fontSize:'11px', color:'#6B7280'}}>
                {network === 'TRC20' && '⚡ Red Tron — comisiones mas bajas recomendada'}
                {network === 'ERC20' && '⚠️ Red Ethereum — comisiones altas de gas'}
                {network === 'BEP20' && '✅ Red Binance Smart Chain — buenas comisiones'}
              </div>
            </div>

            {/* Wallet */}
            <div style={{marginBottom:'20px'}}>
              <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'8px', letterSpacing:'0.5px'}}>DIRECCION DE WALLET ({network})</label>
              <input
                className="input-field"
                type="text"
                placeholder={network === 'TRC20' ? 'T...' : network === 'ERC20' ? '0x...' : '0x...'}
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
                style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'10px', padding:'14px 16px', color:'#F9FAFB', fontSize:'14px', fontFamily:'JetBrains Mono,monospace', outline:'none', transition:'border-color .2s'}}
              />
              {walletAddress && walletAddress.length < 20 && (
                <div style={{marginTop:'6px', fontSize:'12px', color:'#EF4444'}}>⚠️ La direccion parece muy corta. Verifica que sea correcta.</div>
              )}
            </div>

            {/* Aviso */}
            <div style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', fontSize:'12px', color:'#EF4444', lineHeight:1.7}}>
              ⚠️ <strong>Importante:</strong> Verifica que la direccion y la red sean correctas. Las transacciones crypto son irreversibles. ScoreBet no se hace responsable por fondos enviados a direcciones incorrectas.
            </div>

            <button
              onClick={() => {
                if (!walletAddress || walletAddress.length < 20) {
                  setMensaje({ tipo:'error', texto:'Por favor ingresa una direccion de wallet valida' })
                  setShowCryptoModal(false)
                  return
                }
                procesarCanje(selectedCrypto, walletAddress, network)
              }}
              disabled={!walletAddress || walletAddress.length < 20 || canjeando === selectedCrypto.name}
              style={{width:'100%', padding:'16px', borderRadius:'12px', background: walletAddress.length >= 20 ? '#00FF88' : '#1F2937', color: walletAddress.length >= 20 ? '#0A0E1A' : '#4B5563', fontWeight:700, fontSize:'16px', border:'none', cursor: walletAddress.length >= 20 ? 'pointer' : 'not-allowed', fontFamily:'Inter,sans-serif', marginBottom:'10px', transition:'all .2s'}}>
              {canjeando === selectedCrypto.name ? '⏳ Procesando...' : `Confirmar retiro de $${(selectedCrypto.usd * 0.95).toFixed(2)} USDT`}
            </button>
            <button onClick={() => setShowCryptoModal(false)}
              style={{width:'100%', padding:'12px', borderRadius:'12px', background:'transparent', color:'#6B7280', fontSize:'14px', border:'1px solid #374151', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </main>
  )
}
