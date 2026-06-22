'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import {
  collection, query, where,
  getDocs, orderBy, limit
} from 'firebase/firestore'

export default function MisApuestas() {
  const router = useRouter()
  const [apuestas, setApuestas] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todas')
  const [error, setError]       = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/login'); return }
      try {
        // Sin orderBy para evitar error de indice
        const q = query(
          collection(db, 'apuestas'),
          where('userId', '==', user.uid),
          limit(50)
        )
        const snap = await getDocs(q)
        const bets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Ordenar en el cliente
        bets.sort((a: any, b: any) => {
          const ta = a.fechaApuesta?.toMillis?.() || 0
          const tb = b.fechaApuesta?.toMillis?.() || 0
          return tb - ta
        })
        setApuestas(bets)
      } catch (e: any) {
        setError('Error al cargar apuestas: ' + e.message)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtradas = filtro === 'todas'
    ? apuestas
    : apuestas.filter(a => a.estado === filtro)

  const stats = {
    total:      apuestas.length,
    ganadas:    apuestas.filter(a => a.estado === 'ganada').length,
    perdidas:   apuestas.filter(a => a.estado === 'perdida').length,
    pendientes: apuestas.filter(a => a.estado === 'pendiente').length,
    ptsGanados:  apuestas.filter(a => a.estado === 'ganada').reduce((s, a: any) => s + (a.gananciasPosibles||0), 0),
    ptsPerdidos: apuestas.filter(a => a.estado === 'perdida').reduce((s, a: any) => s + (a.puntosApostados||0), 0),
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando apuestas...</div>
      </div>
    </main>
  )

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{paddingTop:'64px'}}>
        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Historial</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(24px,4vw,40px)', fontWeight:700, marginBottom:'24px'}}>
            Mis <span style={{color:'#00FF88'}}>apuestas</span>
          </h1>

          {/* Stats */}
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            {[
              { label:'Total',      val:stats.total,                           color:'#9CA3AF' },
              { label:'Ganadas',    val:stats.ganadas,                         color:'#00FF88' },
              { label:'Perdidas',   val:stats.perdidas,                        color:'#EF4444' },
              { label:'Pendientes', val:stats.pendientes,                      color:'#F59E0B' },
              { label:'Pts ganados', val:stats.ptsGanados.toLocaleString(),    color:'#00FF88' },
              { label:'Pts perdidos',val:stats.ptsPerdidos.toLocaleString(),   color:'#EF4444' },
            ].map(s => (
              <div key={s.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'12px 14px', textAlign:'center', minWidth:'80px'}}>
                <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'18px', fontWeight:700, color:s.color}}>{s.val}</div>
                <div style={{fontSize:'10px', color:'#6B7280', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FILTROS */}
        <div style={{padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {['todas','pendiente','ganada','perdida'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{padding:'7px 18px', borderRadius:'999px', border:`1px solid ${filtro === f ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'}`, background: filtro === f ? 'rgba(0,255,136,0.1)' : 'transparent', color: filtro === f ? '#00FF88' : '#9CA3AF', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all .15s', fontFamily:'Inter, sans-serif', textTransform:'capitalize'}}>
              {f}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div style={{margin:'16px 24px', padding:'12px', borderRadius:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:'13px', color:'#EF4444'}}>
            {error}
          </div>
        )}

        {/* LISTA */}
        <div style={{padding:'20px 24px', animation:'fadeIn .3s ease'}}>
          {filtradas.length === 0 ? (
            <div style={{textAlign:'center', padding:'60px 20px', background:'#111827', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{fontSize:'48px', marginBottom:'16px'}}>🎯</div>
              <div style={{fontSize:'16px', fontWeight:600, color:'#9CA3AF', marginBottom:'8px'}}>
                {apuestas.length === 0 ? 'Aun no has hecho apuestas' : 'No hay apuestas en esta categoria'}
              </div>
              <div style={{fontSize:'13px', color:'#4B5563', marginBottom:'20px'}}>
                {apuestas.length === 0 ? 'Ve a partidos y haz tu primera apuesta' : 'Prueba con otro filtro'}
              </div>
              {apuestas.length === 0 && (
                <a href="/partidos" style={{display:'inline-block', padding:'12px 28px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', textDecoration:'none'}}>
                  Ver partidos →
                </a>
              )}
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'10px', maxWidth:'800px', margin:'0 auto'}}>
              {filtradas.map((a: any) => (
                <div key={a.id} style={{background:'#111827', border:`1px solid ${a.estado === 'ganada' ? 'rgba(0,255,136,0.2)' : a.estado === 'perdida' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius:'14px', padding:'18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px'}}>
                  <div style={{flex:1, minWidth:'180px'}}>
                    <div style={{fontSize:'10px', color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px'}}>{a.liga || 'Liga'}</div>
                    <div style={{fontSize:'14px', fontWeight:700, marginBottom:'4px'}}>{a.partido}</div>
                    <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'4px'}}>
                      Seleccion: <span style={{color:'#F9FAFB', fontWeight:600}}>{a.seleccion}</span>
                    </div>
                    <div style={{fontSize:'11px', color:'#6B7280'}}>
                      Cuota: <span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88'}}>{a.cuota}x</span>
                      {a.fechaApuesta?.toDate && (
                        <span style={{marginLeft:'10px'}}>
                          {a.fechaApuesta.toDate().toLocaleDateString('es')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'13px', color:'#9CA3AF', marginBottom:'4px'}}>
                      Apostado: <span style={{color:'#F9FAFB'}}>{(a.puntosApostados||0).toLocaleString()} pts</span>
                    </div>
                    <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'16px', fontWeight:700, color: a.estado === 'ganada' ? '#00FF88' : a.estado === 'perdida' ? '#EF4444' : '#F59E0B', marginBottom:'8px'}}>
                      {a.estado === 'ganada'
                        ? `+${(a.gananciasPosibles||0).toLocaleString()}`
                        : a.estado === 'perdida'
                          ? `-${(a.puntosApostados||0).toLocaleString()}`
                          : `~${(a.gananciasPosibles||0).toLocaleString()}`
                      } pts
                    </div>
                    <span style={{display:'inline-block', padding:'4px 12px', borderRadius:'999px', fontSize:'11px', fontWeight:700,
                      background: a.estado === 'ganada' ? 'rgba(0,255,136,0.12)' : a.estado === 'perdida' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                      color:      a.estado === 'ganada' ? '#00FF88' : a.estado === 'perdida' ? '#EF4444' : '#F59E0B',
                      border:     `1px solid ${a.estado === 'ganada' ? 'rgba(0,255,136,0.3)' : a.estado === 'perdida' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    }}>
                      {a.estado === 'ganada' ? '✅ Ganada' : a.estado === 'perdida' ? '❌ Perdida' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
