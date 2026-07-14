'use client'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function Ranking() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<any>(null)
  const [top, setTop]           = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    async function cargar() {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('apuestasGanadasMes', 'desc'),
          limit(50)
        )
        const snap = await getDocs(q)
        setTop(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error('Error cargando ranking:', e)
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const medallas = ['🥇', '🥈', '🥉']

  const hoy = new Date()
  const nombreMes = hoy.toLocaleDateString('es', { month: 'long' })

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
      <Navbar />
      <div style={{maxWidth:'640px', margin:'0 auto', padding:'24px 16px 60px'}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <h1 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'26px', fontWeight:700, marginBottom:'6px'}}>
            🏆 Ranking de {nombreMes}
          </h1>
          <p style={{fontSize:'13px', color:'#6B7280'}}>
            Los que mas apuestas acertaron este mes. Se reinicia el dia 1 de cada mes.
          </p>
        </div>

        {loading && (
          <div style={{textAlign:'center', padding:'40px', color:'#6B7280', fontSize:'13px'}}>Cargando ranking...</div>
        )}

        {!loading && top.length === 0 && (
          <div style={{textAlign:'center', padding:'40px', color:'#6B7280', fontSize:'13px'}}>
            Todavia no hay apuestas acertadas este mes. Se el primero!
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          {top.map((u, i) => {
            const esYo = authUser?.uid === u.id
            return (
              <div key={u.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background: esYo ? 'rgba(0,255,136,0.08)' : '#111827',
                border: `1px solid ${esYo ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius:'12px', padding:'12px 16px'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <span style={{fontSize:'16px', fontWeight:700, width:'32px', textAlign:'center', color: i < 3 ? '#F59E0B' : '#6B7280'}}>
                    {medallas[i] || `#${i+1}`}
                  </span>
                  <span style={{fontSize:'14px', fontWeight: esYo ? 700 : 500}}>
                    {u.nombre || 'Usuario'}{esYo ? ' (Tu)' : ''}
                  </span>
                </div>
                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#00FF88'}}>
                  {u.apuestasGanadasMes || 0} ✓
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
