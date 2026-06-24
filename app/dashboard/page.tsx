'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useUser } from '@/context/UserContext'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { abrirAnuncio } from '@/lib/directlinks'

const matches = [
  { id:'wc_esp_ksa', league:'FIFA World Cup 2026', home:'Spain',   away:'Saudi Arabia', homeIcon:'🇪🇸', awayIcon:'🇸🇦', time:'12:00', odds:[{label:'1',val:1.15},{label:'X',val:4.50},{label:'2',val:2.00}] },
  { id:'wc_bel_iri', league:'FIFA World Cup 2026', home:'Belgium', away:'Iran',         homeIcon:'🇧🇪', awayIcon:'🇮🇷', time:'15:00', odds:[{label:'1',val:1.25},{label:'X',val:4.00},{label:'2',val:2.10}] },
  { id:'wc_uru_cpv', league:'FIFA World Cup 2026', home:'Uruguay', away:'Cape Verde',   homeIcon:'🇺🇾', awayIcon:'🇨🇻', time:'18:00', odds:[{label:'1',val:1.40},{label:'X',val:3.80},{label:'2',val:2.00}] },
]

const META = 50000

export default function Dashboard() {
  const router = useRouter()
  const { userData } = useUser()
  const [authUser, setAuthUser]       = useState<any>(null)
  const [betPoints, setBetPoints]     = useState('')
  const [selectedBet, setSelectedBet] = useState<any>(null)
  const [adLoading, setAdLoading]     = useState(false)
  const [adMsg, setAdMsg]             = useState('')
  const [betMsg, setBetMsg]           = useState('')
  const [showBetslip, setShowBetslip] = useState(false)
  const [betLoading, setBetLoading]   = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { router.push('/login'); return }
      setAuthUser(u)
    })
    return () => unsub()
  }, [])

  async function verAnuncio() {
    if (!authUser || !userData) return
    if ((userData.adsHoy || 0) >= 10) {
      setAdMsg('Ya viste los 10 anuncios de hoy.')
      return
    }
    setAdLoading(true)
    setAdMsg('')
    abrirAnuncio()
    await new Promise(r => setTimeout(r, 5000))
    try {
      await updateDoc(doc(db, 'users', authUser.uid), {
        puntosActuales:  increment(50),
        puntosHistorico: increment(50),
        adsHoy:          increment(1),
        ultimoAnuncio:   serverTimestamp(),
      })
      setAdMsg(`+50 puntos ganados! (${(userData.adsHoy||0)+1}/10 hoy)`)
    } catch(e: any) {
      setAdMsg('Error: ' + e.message)
    }
    setAdLoading(false)
  }

  async function confirmarApuesta() {
    if (!authUser || !userData || !selectedBet || !betPoints) return
    const pts = Number(betPoints)
    if (isNaN(pts) || pts < 100) { setBetMsg('⚠️ Minimo 100 puntos'); return }
    if (pts > (userData.puntosActuales || 0)) { setBetMsg('⚠️ No tienes suficientes puntos'); return }

    setBetLoading(true)
    setBetMsg('')

    try {
      const partido = matches.find(m => m.id === selectedBet.matchId)
      if (!partido) { setBetMsg('Error: partido no encontrado'); setBetLoading(false); return }

      const seleccionLabel =
        selectedBet.label === '1' ? `Gana ${partido.home}` :
        selectedBet.label === '2' ? `Gana ${partido.away}` : 'Empate'

      const ganancia = Math.round(pts * selectedBet.val)

      // 1. Guardar apuesta
      await addDoc(collection(db, 'apuestas'), {
        userId:            authUser.uid,
        partidoId:         partido.id,
        partido:           `${partido.home} vs ${partido.away}`,
        liga:              partido.league,
        seleccion:         `${seleccionLabel} (${selectedBet.label}) @ ${selectedBet.val}`,
        cuota:             selectedBet.val,
        puntosApostados:   pts,
        gananciasPosibles: ganancia,
        estado:            'pendiente',
        fechaApuesta:      serverTimestamp(),
      })

      // 2. Descontar puntos
      await updateDoc(doc(db, 'users', authUser.uid), {
        puntosActuales: increment(-pts),
      })

      // 3. Abrir anuncio
      abrirAnuncio()

      setSelectedBet(null)
      setBetPoints('')
      setShowBetslip(false)
      setBetMsg(`✅ Apuesta registrada! Posible ganancia: ${ganancia.toLocaleString()} pts`)
      setTimeout(() => setBetMsg(''), 5000)

    } catch(e: any) {
      setBetMsg('❌ Error: ' + e.message)
    }
    setBetLoading(false)
  }

  if (!authUser) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando...</div>
      </div>
    </main>
  )

  const pts    = userData?.puntosActuales || 0
  const adsHoy = userData?.adsHoy || 0
  const prog   = Math.min((pts/META)*100, 100)

  const partido = selectedBet ? matches.find(m => m.id === selectedBet.matchId) : null

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
      <Navbar puntosActuales={pts}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        .odd-btn:hover{background:rgba(0,255,136,0.12)!important;border-color:#00FF88!important}
        .ad-btn:hover{background:#00cc6a!important;transform:translateY(-1px)}
        .dash-grid{display:grid;grid-template-columns:1fr 360px;gap:20px}
        @media(max-width:900px){.dash-grid{grid-template-columns:1fr!important}.betslip-desk{display:none!important}.mob-btn{display:flex!important}}
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'24px 20px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', marginBottom:'16px'}}>
            <div>
              <div style={{fontSize:'11px', color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px'}}>Bienvenido</div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'24px', fontWeight:700}}>{userData?.nombre || 'Usuario'}</h1>
            </div>
            <div style={{background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'12px', padding:'10px 18px', textAlign:'center'}}>
              <div style={{fontSize:'11px', color:'#6B7280', marginBottom:'2px'}}>Saldo</div>
              <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'20px', fontWeight:700, color:'#00FF88'}}>⚡ {pts.toLocaleString()}</div>
              <div style={{fontSize:'11px', color:'#4B5563'}}>puntos</div>
            </div>
          </div>
          <div style={{maxWidth:'480px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
              <span style={{fontSize:'12px', color:'#9CA3AF'}}>Progreso al primer premio ($5)</span>
              <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'12px', color:'#00FF88'}}>{prog.toFixed(1)}%</span>
            </div>
            <div style={{background:'#1F2937', borderRadius:'999px', height:'7px', overflow:'hidden'}}>
              <div style={{height:'100%', width:`${prog}%`, background:'linear-gradient(90deg,#00FF88,#3B82F6)', borderRadius:'999px'}}/>
            </div>
            <div style={{fontSize:'11px', color:'#4B5563', marginTop:'4px'}}>
              {pts >= META ? '🎉 Puedes canjear!' : `Faltan ${(META-pts).toLocaleString()} pts`}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', padding:'14px 20px'}}>
          {[
            {label:'Puntos',    val:pts.toLocaleString(),                             icon:'⚡', color:'#00FF88'},
            {label:'Historico', val:(userData?.puntosHistorico||0).toLocaleString(),  icon:'📈', color:'#3B82F6'},
            {label:'Ads hoy',   val:`${adsHoy}/10`,                                  icon:'📺', color:'#F59E0B'},
            {label:'Referidos', val:(userData?.totalReferidos||0).toString(),         icon:'👥', color:'#8B5CF6'},
          ].map(s => (
            <div key={s.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'12px', textAlign:'center'}}>
              <div style={{fontSize:'18px', marginBottom:'5px'}}>{s.icon}</div>
              <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'15px', fontWeight:700, color:s.color}}>{s.val}</div>
              <div style={{fontSize:'10px', color:'#6B7280', marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dash-grid" style={{padding:'0 20px 40px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'18px'}}>

            {/* VER ANUNCIO */}
            <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'14px', padding:'20px'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px', flexWrap:'wrap', gap:'8px'}}>
                <div>
                  <div style={{fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'3px'}}>Ganar puntos</div>
                  <h3 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'17px', fontWeight:700}}>Ver anuncios diarios</h3>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'13px', color:adsHoy>=10?'#EF4444':'#F59E0B', fontWeight:600}}>{adsHoy}/10 hoy</div>
                  <div style={{fontSize:'11px', color:'#6B7280'}}>Reinicia medianoche</div>
                </div>
              </div>
              <div style={{background:'#1F2937', borderRadius:'999px', height:'5px', overflow:'hidden', marginBottom:'14px'}}>
                <div style={{height:'100%', width:`${(adsHoy/10)*100}%`, background:adsHoy>=10?'#EF4444':'#F59E0B', borderRadius:'999px'}}/>
              </div>
              <button onClick={verAnuncio} disabled={adLoading||adsHoy>=10} className="ad-btn"
                style={{width:'100%', padding:'14px', borderRadius:'10px', background:adsHoy>=10?'#1F2937':'#00FF88', color:adsHoy>=10?'#4B5563':'#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor:adsHoy>=10?'not-allowed':'pointer', transition:'all .2s', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                {adLoading ? '⏳ Espera 5 segundos...' : adsHoy>=10 ? '✅ Limite alcanzado' : '📺 Ver anuncio — +50 pts'}
              </button>
              {adMsg && <div style={{marginTop:'10px', padding:'10px 14px', borderRadius:'8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', fontSize:'13px', color:'#00FF88'}}>✅ {adMsg}</div>}
            </div>

            {/* ACCESOS */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <Link href="/mis-apuestas" style={{textDecoration:'none'}}>
                <div style={{background:'#111827', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'12px', padding:'14px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <span style={{fontSize:'22px'}}>🎯</span>
                  <div><div style={{fontSize:'13px', fontWeight:600, color:'#3B82F6'}}>Mis apuestas</div><div style={{fontSize:'11px', color:'#6B7280'}}>Ver historial</div></div>
                </div>
              </Link>
              <Link href="/apuestas-reales" style={{textDecoration:'none'}}>
                <div style={{background:'#111827', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'14px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <span style={{fontSize:'22px'}}>💰</span>
                  <div><div style={{fontSize:'13px', fontWeight:600, color:'#F59E0B'}}>Apuesta real</div><div style={{fontSize:'11px', color:'#6B7280'}}>Bono $200</div></div>
                </div>
              </Link>
            </div>

            {/* PARTIDOS */}
            <div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                <h3 style={{fontFamily:'Rajdhani,sans-serif', fontSize:'17px', fontWeight:700}}>Partidos destacados</h3>
                <Link href="/partidos" style={{fontSize:'13px', color:'#00FF88', textDecoration:'none'}}>Ver todos →</Link>
              </div>

              {betMsg && (
                <div style={{marginBottom:'10px', padding:'12px', borderRadius:'8px', background:betMsg.startsWith('✅')?'rgba(0,255,136,0.08)':'rgba(239,68,68,0.08)', border:`1px solid ${betMsg.startsWith('✅')?'rgba(0,255,136,0.2)':'rgba(239,68,68,0.2)'}`, fontSize:'13px', color:betMsg.startsWith('✅')?'#00FF88':'#EF4444'}}>
                  {betMsg}
                </div>
              )}

              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {matches.map(m => (
                  <div key={m.id} style={{background:'#111827', border:`1px solid ${selectedBet?.matchId===m.id?'rgba(0,255,136,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:'14px', padding:'16px'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                      <span style={{fontSize:'10px', fontWeight:600, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase'}}>{m.league}</span>
                      <span style={{fontSize:'11px', color:'#6B7280'}}>{m.time}</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
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
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'7px'}}>
                      {m.odds.map(o => {
                        const isSel = selectedBet?.matchId===m.id && selectedBet?.label===o.label
                        return (
                          <button key={o.label} className="odd-btn"
                            onClick={() => {
                              if(isSel){setSelectedBet(null);setShowBetslip(false)}
                              else{setSelectedBet({matchId:m.id,label:o.label,val:o.val});setShowBetslip(true)}
                            }}
                            style={{background:isSel?'rgba(0,255,136,0.15)':'#0F1520', border:`1px solid ${isSel?'#00FF88':'rgba(255,255,255,0.06)'}`, borderRadius:'8px', padding:'9px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
                            <span style={{fontSize:'9px', color:isSel?'#00FF88':'#6B7280', fontWeight:600}}>
                              {o.label==='1'?'Local':o.label==='X'?'Empate':'Visita'}
                            </span>
                            <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'15px', fontWeight:700, color:isSel?'#00FF88':'#F9FAFB'}}>{o.val.toFixed(2)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BETSLIP DESKTOP */}
          <div className="betslip-desk" style={{position:'sticky', top:'80px', alignSelf:'start'}}>
            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{background:'#0F1520', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'8px'}}>
                <span>🎯</span>
                <span style={{fontFamily:'Rajdhani,sans-serif', fontSize:'17px', fontWeight:700}}>Boleto de apuesta</span>
              </div>
              {selectedBet && partido ? (
                <div style={{padding:'18px'}}>
                  <div style={{background:'#0F1520', borderRadius:'12px', padding:'14px', marginBottom:'14px', border:'1px solid rgba(0,255,136,0.2)'}}>
                    <div style={{fontSize:'10px', color:'#6B7280', marginBottom:'4px', textTransform:'uppercase'}}>Seleccion</div>
                    <div style={{fontSize:'14px', fontWeight:700, marginBottom:'6px'}}>{partido.home} vs {partido.away}</div>
                    <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'10px'}}>
                      {selectedBet.label==='1'?`Gana ${partido.home}`:selectedBet.label==='2'?`Gana ${partido.away}`:'Empate'}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota:</span>
                      <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'26px', fontWeight:700, color:'#00FF88'}}>{selectedBet.val.toFixed(2)}x</span>
                    </div>
                  </div>

                  <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>PUNTOS A APOSTAR</label>
                  <input type="number" placeholder="Minimo 100 pts" value={betPoints} onChange={e=>setBetPoints(e.target.value)}
                    style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'12px', color:'#F9FAFB', fontSize:'15px', fontFamily:'JetBrains Mono,monospace', outline:'none', marginBottom:'8px'}}
                  />
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'14px'}}>
                    {[500,1000,2000,5000].map(v=>(
                      <button key={v} onClick={()=>setBetPoints(String(Math.min(v,pts)))}
                        style={{padding:'7px', borderRadius:'6px', background:'#0F1520', border:'1px solid #374151', color:'#9CA3AF', fontSize:'11px', cursor:'pointer', fontFamily:'JetBrains Mono,monospace'}}>
                        {v>=1000?`${v/1000}K`:v}
                      </button>
                    ))}
                  </div>

                  {betPoints && Number(betPoints)>=100 && (
                    <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'12px', marginBottom:'14px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'5px'}}>
                        <span style={{color:'#9CA3AF'}}>Apuesta</span>
                        <span style={{fontFamily:'JetBrains Mono,monospace'}}>{Number(betPoints).toLocaleString()} pts</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px'}}>
                        <span style={{color:'#9CA3AF'}}>Cuota</span>
                        <span style={{fontFamily:'JetBrains Mono,monospace', color:'#00FF88'}}>{selectedBet.val.toFixed(2)}x</span>
                      </div>
                      <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'8px'}}/>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'13px', fontWeight:700}}>Ganancia posible</span>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'20px', fontWeight:700, color:'#00FF88'}}>
                            {Math.round(Number(betPoints)*selectedBet.val).toLocaleString()}
                          </div>
                          <div style={{fontSize:'10px', color:'#4B5563'}}>puntos</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button onClick={confirmarApuesta} disabled={betLoading}
                    style={{width:'100%', padding:'14px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor:betLoading?'not-allowed':'pointer', fontFamily:'Inter,sans-serif', marginBottom:'8px', opacity:betLoading?0.8:1}}>
                    {betLoading ? '⏳ Guardando...' : 'Confirmar apuesta'}
                  </button>
                  <button onClick={()=>{setSelectedBet(null);setBetPoints('');setShowBetslip(false)}}
                    style={{width:'100%', padding:'9px', borderRadius:'10px', background:'transparent', color:'#6B7280', fontSize:'13px', border:'1px solid #374151', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{padding:'36px 18px', textAlign:'center'}}>
                  <div style={{fontSize:'36px', marginBottom:'10px'}}>🎯</div>
                  <div style={{fontSize:'13px', color:'#6B7280', fontWeight:500, marginBottom:'6px'}}>Sin seleccion</div>
                  <div style={{fontSize:'12px', color:'#4B5563', lineHeight:1.6}}>Toca una cuota para apostar</div>
                </div>
              )}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 18px', background:'#0F1520'}}>
                <div style={{fontSize:'10px', color:'#4B5563', textAlign:'center', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px'}}>Equivalencia</div>
                <div style={{display:'flex', justifyContent:'space-around'}}>
                  {[{p:'50K',v:'$5'},{p:'100K',v:'$10'},{p:'500K',v:'$50'}].map(e=>(
                    <div key={e.p} style={{textAlign:'center'}}>
                      <div style={{fontFamily:'JetBrains Mono,monospace', fontSize:'13px', color:'#00FF88', fontWeight:700}}>{e.p}</div>
                      <div style={{fontSize:'11px', color:'#6B7280'}}>= {e.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN FLOTANTE MÓVIL */}
        {selectedBet && (
          <button onClick={()=>setShowBetslip(true)} className="mob-btn"
            style={{position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', zIndex:90, display:'none', alignItems:'center', gap:'10px', padding:'14px 28px', borderRadius:'999px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,255,136,0.4)', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap'}}>
            🎯 Ver apuesta — {selectedBet.val.toFixed(2)}x
          </button>
        )}

        {/* BETSLIP MÓVIL */}
        {showBetslip && (
          <>
            <div onClick={()=>setShowBetslip(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:95, backdropFilter:'blur(4px)'}}/>
            <div style={{position:'fixed', bottom:0, left:0, right:0, zIndex:96, background:'#111827', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,0.1)', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 -8px 40px rgba(0,0,0,0.5)'}}>
              <div style={{padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span>🎯</span>
                  <span style={{fontFamily:'Rajdhani,sans-serif', fontSize:'17px', fontWeight:700}}>Boleto de apuesta</span>
                </div>
                <button onClick={()=>setShowBetslip(false)} style={{background:'#1F2937', border:'none', color:'#9CA3AF', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'16px'}}>✕</button>
              </div>
              {selectedBet && partido ? (
                <div style={{padding:'18px'}}>
                  <div style={{background:'#0F1520', borderRadius:'12px', padding:'14px', marginBottom:'14px', border:'1px solid rgba(0,255,136,0.2)'}}>
                    <div style={{fontSize:'14px', fontWeight:700, marginBottom:'4px'}}>{partido.home} vs {partido.away}</div>
                    <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'8px'}}>
                      {selectedBet.label==='1'?`Gana ${partido.home}`:selectedBet.label==='2'?`Gana ${partido.away}`:'Empate'}
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota:</span>
                      <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'28px', fontWeight:700, color:'#00FF88'}}>{selectedBet.val.toFixed(2)}x</span>
                    </div>
                  </div>
                  <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>PUNTOS A APOSTAR</label>
                  <input type="number" placeholder="Minimo 100 pts" value={betPoints} onChange={e=>setBetPoints(e.target.value)}
                    style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'14px', color:'#F9FAFB', fontSize:'16px', fontFamily:'JetBrains Mono,monospace', outline:'none', marginBottom:'10px'}}
                  />
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'14px'}}>
                    {[500,1000,2000,5000].map(v=>(
                      <button key={v} onClick={()=>setBetPoints(String(Math.min(v,pts)))}
                        style={{padding:'8px', borderRadius:'6px', background:'#0F1520', border:'1px solid #374151', color:'#9CA3AF', fontSize:'11px', cursor:'pointer', fontFamily:'JetBrains Mono,monospace'}}>
                        {v>=1000?`${v/1000}K`:v}
                      </button>
                    ))}
                  </div>
                  {betPoints && Number(betPoints)>=100 && (
                    <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'14px', marginBottom:'14px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'14px', fontWeight:700}}>Ganancia posible</span>
                        <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>
                          {Math.round(Number(betPoints)*selectedBet.val).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  )}
                  <button onClick={confirmarApuesta} disabled={betLoading}
                    style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'16px', border:'none', cursor:betLoading?'not-allowed':'pointer', fontFamily:'Inter,sans-serif', marginBottom:'10px', opacity:betLoading?0.8:1}}>
                    {betLoading ? '⏳ Guardando...' : 'Confirmar apuesta'}
                  </button>
                  <button onClick={()=>{setSelectedBet(null);setBetPoints('');setShowBetslip(false)}}
                    style={{width:'100%', padding:'12px', borderRadius:'12px', background:'transparent', color:'#6B7280', fontSize:'14px', border:'1px solid #374151', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{padding:'40px 18px', textAlign:'center'}}>
                  <div style={{fontSize:'13px', color:'#6B7280'}}>Selecciona una cuota primero</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
