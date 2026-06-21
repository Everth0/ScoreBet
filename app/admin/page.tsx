'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, getDocs, doc, getDoc,
  updateDoc, query, orderBy, limit,
  where, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading]     = useState(true)
  const [isAdmin, setIsAdmin]     = useState(false)
  const [tab, setTab]             = useState('canjes')
  const [usuarios, setUsuarios]   = useState<any[]>([])
  const [canjes, setCanjes]       = useState<any[]>([])
  const [stats, setStats]         = useState<any>(null)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [msg, setMsg]             = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/login'); return }
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (!snap.exists() || !snap.data().isAdmin) {
        router.push('/')
        return
      }
      setIsAdmin(true)
      await cargarDatos()
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function cargarDatos() {
    // Cargar canjes
    const canjesSnap = await getDocs(
      query(collection(db, 'canjes'), orderBy('fechaSolicitud', 'desc'), limit(50))
    )
    setCanjes(canjesSnap.docs.map(d => ({ id: d.id, ...d.data() })))

    // Cargar usuarios
    const usersSnap = await getDocs(
      query(collection(db, 'users'), orderBy('fechaRegistro', 'desc'), limit(100))
    )
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setUsuarios(users)

    // Calcular stats
    const totalPuntos     = users.reduce((a, u) => a + (u.puntosActuales || 0), 0)
    const totalHistorico  = users.reduce((a, u) => a + (u.puntosHistorico || 0), 0)
    const totalReferidos  = users.reduce((a, u) => a + (u.totalReferidos || 0), 0)
    setStats({
      totalUsuarios:  users.length,
      totalPuntos,
      totalHistorico,
      totalReferidos,
      canjesPendientes: canjesSnap.docs.filter(d => d.data().estado === 'pendiente').length,
      canjesAprobados:  canjesSnap.docs.filter(d => d.data().estado === 'aprobado').length,
    })
  }

  async function aprobarCanje(canjeId: string, userId: string, puntos: number) {
    setProcesando(canjeId)
    try {
      // Descontar puntos al usuario
      await updateDoc(doc(db, 'users', userId), {
        puntosActuales: (usuarios.find(u => u.id === userId)?.puntosActuales || 0) - puntos
      })
      // Actualizar estado del canje
      await updateDoc(doc(db, 'canjes', canjeId), {
        estado:         'aprobado',
        fechaAprobado:  serverTimestamp(),
      })
      setMsg('✅ Canje aprobado correctamente')
      await cargarDatos()
    } catch {
      setMsg('❌ Error al aprobar canje')
    }
    setProcesando(null)
    setTimeout(() => setMsg(''), 3000)
  }

  async function rechazarCanje(canjeId: string, razon: string) {
    setProcesando(canjeId)
    try {
      await updateDoc(doc(db, 'canjes', canjeId), {
        estado:         'rechazado',
        razonRechazo:   razon,
        fechaRechazo:   serverTimestamp(),
      })
      setMsg('❌ Canje rechazado')
      await cargarDatos()
    } catch {
      setMsg('Error al rechazar')
    }
    setProcesando(null)
    setTimeout(() => setMsg(''), 3000)
  }

  async function banearUsuario(userId: string) {
    if (!confirm('¿Seguro que quieres banear este usuario?')) return
    await updateDoc(doc(db, 'users', userId), { banned: true })
    setMsg('Usuario baneado')
    await cargarDatos()
    setTimeout(() => setMsg(''), 3000)
  }

  async function desbanearUsuario(userId: string) {
    await updateDoc(doc(db, 'users', userId), { banned: false })
    setMsg('Usuario desbaneado')
    await cargarDatos()
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando panel admin...</div>
      </div>
    </main>
  )

  if (!isAdmin) return null

  const tabs = [
    { id:'canjes',   label:'🎁 Canjes',   badge: stats?.canjesPendientes },
    { id:'usuarios', label:'👥 Usuarios',  badge: stats?.totalUsuarios },
    { id:'stats',    label:'📊 Stats',     badge: null },
  ]

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing:border-box; }
        table { width:100%; border-collapse:collapse; }
        th { text-align:left; padding:10px 12px; font-size:11px; color:#6B7280; font-weight:600; letter-spacing:1px; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,0.06); }
        td { padding:12px; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        tr:hover td { background:rgba(255,255,255,0.02); }
        .btn { padding:7px 14px; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; border:none; font-family:Inter,sans-serif; transition:all .15s; }
        .btn-green { background:#00FF88; color:#0A0E1A; }
        .btn-red { background:rgba(239,68,68,0.15); color:#EF4444; border:1px solid rgba(239,68,68,0.3); }
        .btn-gray { background:#1F2937; color:#9CA3AF; }
        .btn:hover { opacity:0.85; transform:translateY(-1px); }
        .badge { padding:3px 8px; border-radius:999px; font-size:10px; font-weight:700; }
      `}</style>

      {/* NAVBAR ADMIN */}
      <nav style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{fontFamily:'Rajdhani, sans-serif', fontWeight:700, fontSize:'20px'}}>SCORE<span style={{color:'#00FF88'}}>BET</span></span>
          <span style={{background:'rgba(239,68,68,0.15)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.3)', padding:'3px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:700}}>ADMIN</span>
        </div>
        <div style={{display:'flex', gap:'4px'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{padding:'7px 16px', borderRadius:'8px', border:'none', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif', background: tab === t.id ? 'rgba(0,255,136,0.1)' : 'transparent', color: tab === t.id ? '#00FF88' : '#6B7280', position:'relative'}}>
              {t.label}
              {t.badge > 0 && (
                <span style={{position:'absolute', top:'2px', right:'2px', background:'#EF4444', color:'#fff', borderRadius:'999px', fontSize:'9px', fontWeight:700, padding:'1px 5px'}}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => router.push('/')} className="btn btn-gray">← Salir</button>
      </nav>

      <div style={{padding:'24px', maxWidth:'1200px', margin:'0 auto'}}>

        {/* MENSAJE */}
        {msg && (
          <div style={{marginBottom:'16px', padding:'12px 16px', borderRadius:'10px', background: msg.startsWith('✅') ? 'rgba(0,255,136,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${msg.startsWith('✅') ? 'rgba(0,255,136,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize:'14px', color: msg.startsWith('✅') ? '#00FF88' : '#EF4444'}}>
            {msg}
          </div>
        )}

        {/* ══════════════ STATS ══════════════ */}
        {tab === 'stats' && stats && (
          <div>
            <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'24px', fontWeight:700, marginBottom:'20px'}}>Estadisticas generales</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px', marginBottom:'32px'}}>
              {[
                { label:'Total usuarios',       val:stats.totalUsuarios,                    icon:'👥', color:'#3B82F6' },
                { label:'Canjes pendientes',    val:stats.canjesPendientes,                 icon:'⏳', color:'#F59E0B' },
                { label:'Canjes aprobados',     val:stats.canjesAprobados,                  icon:'✅', color:'#00FF88' },
                { label:'Puntos en circulacion',val:stats.totalPuntos.toLocaleString(),     icon:'⚡', color:'#00FF88' },
                { label:'Puntos historicos',    val:stats.totalHistorico.toLocaleString(),  icon:'📈', color:'#8B5CF6' },
                { label:'Total referidos',      val:stats.totalReferidos,                   icon:'🔗', color:'#EC4899' },
              ].map(s => (
                <div key={s.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'18px'}}>
                  <div style={{fontSize:'24px', marginBottom:'8px'}}>{s.icon}</div>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:s.color}}>{s.val}</div>
                  <div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Valor en USD de puntos en circulacion */}
            <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'14px', padding:'20px'}}>
              <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'16px'}}>Responsabilidad financiera</h3>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px'}}>
                {[
                  { label:'Puntos en circulacion', val:stats.totalPuntos.toLocaleString(), color:'#F9FAFB' },
                  { label:'Equivalente en USD', val:`$${((stats.totalPuntos/50000)*5).toFixed(2)}`, color:'#F59E0B' },
                  { label:'Puntos historicos generados', val:stats.totalHistorico.toLocaleString(), color:'#9CA3AF' },
                ].map(i => (
                  <div key={i.label} style={{textAlign:'center'}}>
                    <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:i.color}}>{i.val}</div>
                    <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{i.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ CANJES ══════════════ */}
        {tab === 'canjes' && (
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'24px', fontWeight:700}}>Solicitudes de canje</h2>
              <button onClick={cargarDatos} className="btn btn-gray">🔄 Actualizar</button>
            </div>

            {canjes.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', color:'#6B7280', background:'#111827', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:'40px', marginBottom:'12px'}}>🎁</div>
                <div>No hay solicitudes de canje aun</div>
              </div>
            ) : (
              <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', overflow:'hidden', overflowX:'auto'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Premio</th>
                      <th>Puntos</th>
                      <th>USD</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canjes.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{fontWeight:600, fontSize:'13px'}}>{c.nombre || 'Sin nombre'}</div>
                          <div style={{fontSize:'11px', color:'#6B7280'}}>{c.email}</div>
                        </td>
                        <td>
                          <span style={{fontWeight:600}}>{c.premio}</span>
                        </td>
                        <td>
                          <span style={{fontFamily:'JetBrains Mono, monospace', color:'#F59E0B', fontWeight:600}}>
                            {(c.puntos||0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:700}}>
                            ${c.valorUSD}
                          </span>
                        </td>
                        <td style={{color:'#6B7280', fontSize:'12px'}}>
                          {c.fechaSolicitud?.toDate?.()?.toLocaleDateString('es') || 'N/A'}
                        </td>
                        <td>
                          <span className="badge" style={{
                            background: c.estado === 'pendiente' ? 'rgba(245,158,11,0.15)' : c.estado === 'aprobado' ? 'rgba(0,255,136,0.15)' : 'rgba(239,68,68,0.15)',
                            color:      c.estado === 'pendiente' ? '#F59E0B' : c.estado === 'aprobado' ? '#00FF88' : '#EF4444',
                            border:     `1px solid ${c.estado === 'pendiente' ? 'rgba(245,158,11,0.3)' : c.estado === 'aprobado' ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }}>
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          {c.estado === 'pendiente' && (
                            <div style={{display:'flex', gap:'6px'}}>
                              <button
                                onClick={() => aprobarCanje(c.id, c.userId, c.puntos)}
                                disabled={procesando === c.id}
                                className="btn btn-green">
                                {procesando === c.id ? '⏳' : '✅ Aprobar'}
                              </button>
                              <button
                                onClick={() => rechazarCanje(c.id, 'Rechazado por administrador')}
                                disabled={procesando === c.id}
                                className="btn btn-red">
                                ❌ Rechazar
                              </button>
                            </div>
                          )}
                          {c.estado !== 'pendiente' && (
                            <span style={{fontSize:'12px', color:'#4B5563'}}>Procesado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ USUARIOS ══════════════ */}
        {tab === 'usuarios' && (
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <h2 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'24px', fontWeight:700}}>Usuarios registrados</h2>
              <button onClick={cargarDatos} className="btn btn-gray">🔄 Actualizar</button>
            </div>

            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', overflow:'hidden', overflowX:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Puntos actuales</th>
                    <th>Pts historicos</th>
                    <th>Ads hoy</th>
                    <th>Referidos</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{opacity: u.banned ? 0.5 : 1}}>
                      <td>
                        <div style={{fontWeight:600, fontSize:'13px'}}>{u.nombre || 'Sin nombre'}</div>
                        <div style={{fontSize:'11px', color:'#6B7280'}}>{u.email}</div>
                      </td>
                      <td>
                        <span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:700}}>
                          {(u.puntosActuales||0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{fontFamily:'JetBrains Mono, monospace', color:'#9CA3AF'}}>
                          {(u.puntosHistorico||0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{fontFamily:'JetBrains Mono, monospace', color: (u.adsHoy||0) >= 10 ? '#EF4444' : '#F59E0B'}}>
                          {u.adsHoy||0}/10
                        </span>
                      </td>
                      <td>
                        <span style={{color:'#8B5CF6', fontWeight:600}}>{u.totalReferidos||0}</span>
                      </td>
                      <td style={{color:'#6B7280', fontSize:'12px'}}>
                        {u.fechaRegistro?.toDate?.()?.toLocaleDateString('es') || 'N/A'}
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: u.banned ? 'rgba(239,68,68,0.15)' : u.isAdmin ? 'rgba(0,255,136,0.15)' : 'rgba(59,130,246,0.15)',
                          color:      u.banned ? '#EF4444' : u.isAdmin ? '#00FF88' : '#3B82F6',
                          border:     `1px solid ${u.banned ? 'rgba(239,68,68,0.3)' : u.isAdmin ? 'rgba(0,255,136,0.3)' : 'rgba(59,130,246,0.3)'}`,
                        }}>
                          {u.banned ? 'Baneado' : u.isAdmin ? 'Admin' : 'Activo'}
                        </span>
                      </td>
                      <td>
                        {!u.isAdmin && (
                          u.banned
                            ? <button onClick={() => desbanearUsuario(u.id)} className="btn btn-green" style={{fontSize:'11px'}}>Desbanear</button>
                            : <button onClick={() => banearUsuario(u.id)} className="btn btn-red" style={{fontSize:'11px'}}>Banear</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
