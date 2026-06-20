'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const matches = [
  { id:1, league:'UEFA Champions League', home:'Man City', away:'R. Madrid', homeIcon:'🔵', awayIcon:'⚪', time:"67'", live:true, odds:[{label:'1',val:1.85},{label:'X',val:3.40},{label:'2',val:4.20}] },
  { id:2, league:'NBA Playoffs', home:'Lakers', away:'Celtics', homeIcon:'💛', awayIcon:'🟢', time:'Q4 3:12', live:true, odds:[{label:'1',val:2.10},{label:'X',val:1.90},{label:'2',val:1.75}] },
  { id:3, league:'La Liga', home:'Barcelona', away:'Atletico', homeIcon:'🔴', awayIcon:'🔵', time:'Hoy 20:00', live:false, odds:[{label:'1',val:1.60},{label:'X',val:3.80},{label:'2',val:5.50}] },
]

const META = 50000

export default function Dashboard() {
  const router = useRouter()

  const [userData, setUserData]       = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [betPoints, setBetPoints]     = useState('')
  const [selectedBet, setSelectedBet] = useState<{matchLabel:string, label:string, val:number} | null>(null)
  const [adLoading, setAdLoading]     = useState(false)
  const [adMsg, setAdMsg]             = useState('')
  const [betMsg, setBetMsg]           = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/login'); return }
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setUserData({ uid: user.uid, ...snap.data() })
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function verAnuncio() {
    if (!userData) return
    if (userData.adsHoy >= 10) {
      setAdMsg('Ya viste los 10 anuncios de hoy. Vuelve mañana.')
      return
    }
    setAdLoading(true)
    setAdMsg('')
    // Simula duración del anuncio (30 segundos en prod, 3 seg en dev)
    await new Promise(r => setTimeout(r, 3000))
    const ref = doc(db, 'users', userData.uid)
    await updateDoc(ref, {
      puntosActuales:  increment(50),
      puntosHistorico: increment(50),
      adsHoy:          increment(1),
    })
    setUserData((prev: any) => ({
      ...prev,
      puntosActuales:  prev.puntosActuales + 50,
      puntosHistorico: prev.puntosHistorico + 50,
      adsHoy:          prev.adsHoy + 1,
    }))
    setAdLoading(false)
    setAdMsg(`+50 puntos ganados! (${userData.adsHoy + 1}/10 hoy)`)
  }

  async function confirmarApuesta() {
    if (!userData || !selectedBet || !betPoints) return
    const pts = Number(betPoints)
    if (pts <= 0) { setBetMsg('Ingresa una cantidad valida.'); return }
    if (pts > userData.puntosActuales) { setBetMsg('No tienes suficientes puntos.'); return }
    if (pts < 100) { setBetMsg('La apuesta minima es 100 puntos.'); return }

    const ganancia = Math.round(pts * selectedBet.val)
    const ref = doc(db, 'users', userData.uid)
    await updateDoc(ref, {
      puntosActuales: increment(-pts),
    })
    setUserData((prev: any) => ({
      ...prev,
      puntosActuales: prev.puntosActuales - pts,
    }))
    setSelectedBet(null)
    setBetPoints('')
    setBetMsg(`Apuesta registrada! Si ganas recibes ${ganancia.toLocaleString()} pts.`)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700, color:'#F9FAFB', marginBottom:'8px'}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280'}}>Cargando tu cuenta...</div>
      </div>
    </main>
  )

  const pts = userData?.puntosActuales || 0
  const adsHoy = userData?.adsHoy || 0
  const progreso = Math.min((pts / META) * 100, 100)

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar puntosActuales={pts} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .odd-btn:hover { background:rgba(0,255,136,0.12) !important; border-color:#00FF88 !important; }
        .ad-btn:hover { background:#00cc6a !important; transform:translateY(-1px); }
        .stat-card:hover { border-color:rgba(0,255,136,0.2) !important; }
        @media(max-width:768px){ .dashboard-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'28px 24px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'20px'}}>
            <div>
              <div style={{fontSize:'11px', color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px'}}>Bienvenido</div>
              <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'26px', fontWeight:700}}>{userData?.nombre || 'Usuario'}</h1>
            </div>
            <div style={{background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'12px', padding:'12px 20px', textAlign:'center'}}>
              <div style={{fontSize:'11px', color:'#6B7280', marginBottom:'2px'}}>Saldo actual</div>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>⚡ {pts.toLocaleString()}</div>
              <div style={{fontSize:'11px', color:'#4B5563'}}>puntos</div>
            </div>
          </div>

          {/* Barra progreso */}
          <div style={{maxWidth:'500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
              <span style={{fontSize:'12px', color:'#9CA3AF'}}>Progreso al primer premio ($5)</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#00FF88'}}>{progreso.toFixed(1)}%</span>
            </div>
            <div style={{background:'#1F2937', borderRadius:'999px', height:'8px', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${progreso}%`, background:'linear-gradient(90deg,#00FF88,#3B82F6)', borderRadius:'999px', transition:'width .5s'}} />
            </div>
            <div style={{fontSize:'11px', color:'#4B5563', marginTop:'5px'}}>
              {pts >= META ? '🎉 Puedes canjear tu primer premio!' : `Faltan ${(META - pts).toLocaleString()} pts para Amazon $5`}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'12px', padding:'20px 24px', background:'#0A0E1A'}}>
          {[
            { label:'Puntos actuales', val:pts.toLocaleString(),            icon:'⚡', color:'#00FF88' },
            { label:'Puntos totales',  val:(userData?.puntosHistorico||0).toLocaleString(), icon:'📈', color:'#3B82F6' },
            { label:'Anuncios hoy',    val:`${adsHoy} / 10`,               icon:'📺', color:'#F59E0B' },
            { label:'Referidos',       val:(userData?.totalReferidos||0).toString(), icon:'👥', color:'#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px', transition:'all .2s'}}>
              <div style={{fontSize:'22px', marginBottom:'8px'}}>{s.icon}</div>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:s.color}}>{s.val}</div>
              <div style={{fontSize:'11px', color:'#6B7280', marginTop:'3px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid" style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', padding:'0 24px 40px'}}>

          {/* COLUMNA IZQUIERDA */}
          <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>

            {/* VER ANUNCIO */}
            <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'14px', padding:'22px'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'10px'}}>
                <div>
                  <div style={{fontSize:'11px', color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px'}}>Ganar puntos</div>
                  <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700}}>Ver anuncios</h3>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'13px', color: adsHoy >= 10 ? '#EF4444' : '#F59E0B', fontWeight:600}}>{adsHoy} / 10 hoy</div>
                  <div style={{fontSize:'11px', color:'#6B7280'}}>Reinicia a medianoche</div>
                </div>
              </div>

              {/* Barra ads */}
              <div style={{background:'#1F2937', borderRadius:'999px', height:'6px', overflow:'hidden', marginBottom:'16px'}}>
                <div style={{height:'100%', width:`${(adsHoy/10)*100}%`, background: adsHoy >= 10 ? '#EF4444' : '#F59E0B', borderRadius:'999px', transition:'width .3s'}} />
              </div>

              <button onClick={verAnuncio} disabled={adLoading || adsHoy >= 10} className="ad-btn"
                style={{padding:'14px 24px', borderRadius:'10px', background: adsHoy >= 10 ? '#1F2937' : '#00FF88', color: adsHoy >= 10 ? '#4B5563' : '#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor: adsHoy >= 10 ? 'not-allowed' : 'pointer', transition:'all .2s', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', gap:'8px', opacity: adLoading ? 0.8 : 1}}>
                {adLoading ? '⏳ Viendo anuncio...' : adsHoy >= 10 ? '✅ Limite diario alcanzado' : '📺 Ver anuncio — +50 pts'}
              </button>

              {adMsg && (
                <div style={{marginTop:'12px', padding:'10px 14px', borderRadius:'8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', fontSize:'13px', color:'#00FF88', animation:'fadeIn .3s ease'}}>
                  ✅ {adMsg}
                </div>
              )}
            </div>

            {/* PARTIDOS */}
            <div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
                <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'18px', fontWeight:700}}>Partidos para apostar</h3>
                <Link href="/partidos" style={{fontSize:'13px', color:'#00FF88', textDecoration:'none'}}>Ver todos →</Link>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {matches.map(m => (
                  <div key={m.id} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'18px'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                      <span style={{fontSize:'10px', fontWeight:600, color:'#6B7280', letterSpacing:'1.5px', textTransform:'uppercase'}}>{m.league}</span>
                      {m.live
                        ? <span style={{display:'flex', alignItems:'center', gap:'4px', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:'999px', padding:'3px 10px', fontSize:'10px', fontWeight:700}}>
                            <span style={{width:'5px', height:'5px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1.2s infinite'}}/>LIVE {m.time}
                          </span>
                        : <span style={{fontSize:'11px', color:'#6B7280', fontFamily:'monospace'}}>{m.time}</span>
                      }
                    </div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{fontSize:'20px'}}>{m.homeIcon}</span>
                        <span style={{fontSize:'13px', fontWeight:600}}>{m.home}</span>
                      </div>
                      <span style={{fontSize:'11px', color:'#6B7280'}}>vs</span>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{fontSize:'13px', fontWeight:600}}>{m.away}</span>
                        <span style={{fontSize:'20px'}}>{m.awayIcon}</span>
                      </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                      {m.odds.map(o => {
                        const isSelected = selectedBet?.matchLabel === `${m.home} vs ${m.away}` && selectedBet?.label === o.label
                        return (
                          <button key={o.label} className="odd-btn"
                            onClick={() => setSelectedBet(isSelected ? null : {matchLabel:`${m.home} vs ${m.away}`, label:o.label, val:o.val})}
                            style={{background: isSelected ? 'rgba(0,255,136,0.15)' : '#0F1520', border:`1px solid ${isSelected ? '#00FF88' : 'rgba(255,255,255,0.06)'}`, borderRadius:'8px', padding:'10px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
                            <span style={{fontSize:'10px', color: isSelected ? '#00FF88' : '#6B7280', fontWeight:600}}>{o.label}</span>
                            <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color: isSelected ? '#00FF88' : '#F9FAFB'}}>{o.val.toFixed(2)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BETSLIP */}
          <div style={{position:'sticky', top:'80px', alignSelf:'start'}}>
            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{background:'#0F1520', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'17px', fontWeight:700}}>🎯 Boleto de apuesta</div>
              </div>

              {selectedBet ? (
                <div style={{padding:'18px', animation:'fadeIn .2s ease'}}>
                  <div style={{background:'#0F1520', borderRadius:'10px', padding:'12px', marginBottom:'14px', border:'1px solid rgba(0,255,136,0.15)'}}>
                    <div style={{fontSize:'11px', color:'#6B7280', marginBottom:'3px'}}>Seleccion</div>
                    <div style={{fontSize:'13px', fontWeight:600}}>{selectedBet.matchLabel}</div>
                    <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'2px'}}>Resultado: <span style={{color:'#00FF88', fontWeight:700}}>{selectedBet.label}</span></div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'8px'}}>
                      <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota:</span>
                      <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:'#00FF88'}}>{selectedBet.val.toFixed(2)}x</span>
                    </div>
                  </div>

                  <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>PUNTOS A APOSTAR</label>
                  <input
                    type="number"
                    placeholder="Min: 100 pts"
                    value={betPoints}
                    onChange={e => setBetPoints(e.target.value)}
                    style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'12px 14px', color:'#F9FAFB', fontSize:'14px', fontFamily:'JetBrains Mono, monospace', outline:'none', marginBottom:'10px'}}
                  />

                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'6px', marginBottom:'14px'}}>
                    {[500,1000,2000,5000].map(v => (
                      <button key={v} onClick={() => setBetPoints(String(Math.min(v, pts)))}
                        style={{padding:'7px', borderRadius:'6px', background:'#0F1520', border:'1px solid #374151', color:'#9CA3AF', fontSize:'11px', cursor:'pointer', fontFamily:'JetBrains Mono, monospace'}}>
                        {v >= 1000 ? `${v/1000}K` : v}
                      </button>
                    ))}
                  </div>

                  {betPoints && Number(betPoints) > 0 && (
                    <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'12px', marginBottom:'14px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                        <span style={{fontSize:'12px', color:'#9CA3AF'}}>Apuesta</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px'}}>{Number(betPoints).toLocaleString()} pts</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                        <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#00FF88'}}>{selectedBet.val.toFixed(2)}x</span>
                      </div>
                      <div style={{height:'1px', background:'rgba(255,255,255,0.06)', margin:'6px 0'}} />
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span style={{fontSize:'13px', fontWeight:600}}>Ganancia posible</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#00FF88'}}>
                          {Math.round(Number(betPoints) * selectedBet.val).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  )}

                  {betMsg && (
                    <div style={{marginBottom:'12px', padding:'10px', borderRadius:'8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', fontSize:'12px', color:'#00FF88'}}>
                      {betMsg}
                    </div>
                  )}

                  <button onClick={confirmarApuesta}
                    style={{width:'100%', padding:'13px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:'8px'}}>
                    Confirmar apuesta
                  </button>
                  <button onClick={() => { setSelectedBet(null); setBetPoints(''); setBetMsg('') }}
                    style={{width:'100%', padding:'9px', borderRadius:'10px', background:'transparent', color:'#6B7280', fontSize:'13px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{padding:'36px 18px', textAlign:'center', color:'#4B5563'}}>
                  <div style={{fontSize:'32px', marginBottom:'10px'}}>🎯</div>
                  <div style={{fontSize:'13px', fontWeight:500, color:'#6B7280', marginBottom:'6px'}}>Sin seleccion</div>
                  <div style={{fontSize:'12px', lineHeight:1.6}}>Toca una cuota de los partidos para apostar</div>
                </div>
              )}

              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 18px', background:'#0F1520'}}>
                <div style={{fontSize:'11px', color:'#4B5563', textAlign:'center', marginBottom:'6px'}}>Equivalencia</div>
                <div style={{display:'flex', justifyContent:'space-around', fontSize:'11px'}}>
                  {[{p:'50K',v:'$5'},{p:'100K',v:'$10'},{p:'500K',v:'$50'}].map(e => (
                    <div key={e.p} style={{textAlign:'center'}}>
                      <div style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:600}}>{e.p}</div>
                      <div style={{color:'#6B7280'}}>= {e.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
