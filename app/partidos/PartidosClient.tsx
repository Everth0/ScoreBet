'use client'
import { useUser } from '@/context/UserContext'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { addDoc, collection, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { abrirAnuncio } from '@/lib/directlinks'
import { onAuthStateChanged } from 'firebase/auth'

export default function PartidosClient({ categorias }: { categorias: any[] }) {
  const { userData } = useUser()
  const [tabActiva, setTabActiva] = useState(() => {
    const vivo = categorias.find(c => c.id === 'vivo')
    return vivo && vivo.partidos.length > 0 ? 'vivo' : 'hoy'
  })
  const [selectedBet, setSelectedBet] = useState<any>(null)
  const [betPoints, setBetPoints]     = useState('')
  const [msg, setMsg]                 = useState('')
  const [authUser, setAuthUser]       = useState<any>(null)
  const [showBetslip, setShowBetslip] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setAuthUser(user)
  })

  return () => unsub()
}, [])
  
  const catActual = categorias.find(c => c.id === tabActiva)

  function seleccionarApuesta(apuesta: any) {
    if (selectedBet?.matchId === apuesta?.matchId && selectedBet?.oddLabel === apuesta?.oddLabel) {
      setSelectedBet(null)
      setShowBetslip(false)
    } else {
      setSelectedBet(apuesta)
      setShowBetslip(true)
    }
  }

async function confirmar() {
  if (!authUser || !selectedBet || !betPoints) {
    setMsg('Falta información')
    return
  }

  const pts = Number(betPoints)

  if (pts < 100) {
    setMsg('Minimo 100 puntos')
    return
  }

  if (Number(betPoints) > (userData?.puntosActuales || 0)) {
    setMsg('No tienes suficientes puntos')
    return
  }

  if (selectedBet.live) {
    setMsg('⚠️ Este partido ya esta en vivo, no se puede apostar')
    return
  }

  const ganancia = Math.round(pts * selectedBet.oddVal || selectedBet.val || 1)

  const seleccionLabel =
    selectedBet.oddLabel === '1' ? `Gana ${selectedBet.home}` :
    selectedBet.oddLabel === '2' ? `Gana ${selectedBet.away}` : 'Empate'

  setConfirmando(true)
  setMsg('📺 Cargando anuncio...')
  abrirAnuncio()
  await new Promise(r => setTimeout(r, 5000))
  setMsg('⏳ Guardando apuesta...')

  try {
    await addDoc(collection(db, 'apuestas'), {
      userId: authUser.uid,
      partidoId: selectedBet.matchId,
      partido: `${selectedBet.home} vs ${selectedBet.away}`,
      liga: selectedBet.league || 'Liga',
      seleccion: `${seleccionLabel} (${selectedBet.oddLabel}) @ ${selectedBet.oddVal}`,
      cuota: selectedBet.oddVal || selectedBet.val || 1,
      puntosApostados: pts,
      gananciasPosibles: ganancia,
      estado: 'pendiente',
      fechaApuesta: serverTimestamp(),
    })

    await updateDoc(doc(db, 'users', authUser.uid), {
      puntosActuales: increment(-pts),
      totalApuestas:  increment(1),
    })

    setMsg(`✅ Apuesta guardada! Ganancia posible: ${ganancia}`)

    setTimeout(() => {
      setSelectedBet(null)
      setBetPoints('')
      setMsg('')
      setShowBetslip(false)
    }, 2000)

  } catch (e: any) {
    setMsg('Error: ' + e.message)
  }
  setConfirmando(false)
}

  const BetslipContent = () => (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {selectedBet ? (
        <div style={{padding:'18px', flex:1, overflowY:'auto'}}>
          {/* Seleccion */}
          <div style={{background:'#0F1520', borderRadius:'12px', padding:'14px', marginBottom:'16px', border:'1px solid rgba(0,255,136,0.2)'}}>
            <div style={{fontSize:'10px', color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Seleccion</div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap'}}>
              {selectedBet.homeBadge && <img src={selectedBet.homeBadge} style={{width:'20px', height:'20px', objectFit:'contain'}} alt=""/>}
              <span style={{fontSize:'13px', fontWeight:600}}>{selectedBet.home}</span>
              <span style={{fontSize:'11px', color:'#6B7280'}}>vs</span>
              <span style={{fontSize:'13px', fontWeight:600}}>{selectedBet.away}</span>
              {selectedBet.awayBadge && <img src={selectedBet.awayBadge} style={{width:'20px', height:'20px', objectFit:'contain'}} alt=""/>}
            </div>
            <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'10px'}}>
              Prediccion: <span style={{color:'#00FF88', fontWeight:700}}>
                {selectedBet.oddLabel === '1' ? `Gana ${selectedBet.home}` : selectedBet.oddLabel === '2' ? `Gana ${selectedBet.away}` : 'Empate'}
              </span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota:</span>
              <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'28px', fontWeight:700, color:'#00FF88'}}>{selectedBet.oddVal.toFixed(2)}x</span>
            </div>
          </div>

          {/* Input */}
          <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>PUNTOS A APOSTAR</label>
          <input type="number" placeholder="Minimo 100 pts" value={betPoints} onChange={e => setBetPoints(e.target.value)}
            style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'14px', color:'#F9FAFB', fontSize:'16px', fontFamily:'JetBrains Mono, monospace', outline:'none', marginBottom:'10px'}}
          />

          {/* Botones rapidos */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'14px'}}>
            {[500,1000,2000,5000].map(v => (
              <button key={v} onClick={() => setBetPoints(String(v))}
                style={{padding:'10px', borderRadius:'8px', background:'#0F1520', border:'1px solid #374151', color:'#9CA3AF', fontSize:'12px', cursor:'pointer', fontFamily:'JetBrains Mono, monospace', fontWeight:600}}>
                {v >= 1000 ? `${v/1000}K` : v}
              </button>
            ))}
          </div>

          {/* Calculo */}
          {betPoints && Number(betPoints) >= 100 && (
            <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'14px', marginBottom:'14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'6px'}}>
                <span style={{color:'#9CA3AF'}}>Apuesta</span>
                <span style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600}}>{Number(betPoints).toLocaleString()} pts</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px'}}>
                <span style={{color:'#9CA3AF'}}>Cuota</span>
                <span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:600}}>{selectedBet.oddVal.toFixed(2)}x</span>
              </div>
              <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'8px'}}/>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontSize:'14px', fontWeight:700}}>Ganancia posible</span>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>
                    {Math.round(Number(betPoints) * selectedBet.oddVal).toLocaleString()}
                  </div>
                  <div style={{fontSize:'10px', color:'#4B5563'}}>puntos</div>
                </div>
              </div>
            </div>
          )}

          {msg && (
            <div style={{marginBottom:'12px', padding:'12px', borderRadius:'8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', fontSize:'13px', color:'#00FF88', lineHeight:1.5}}>
              {msg}
            </div>
          )}

          <button onClick={confirmar} disabled={confirmando}
            style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'16px', border:'none', cursor: confirmando ? 'not-allowed' : 'pointer', fontFamily:'Inter, sans-serif', marginBottom:'10px', opacity: confirmando ? 0.7 : 1}}>
            {confirmando ? 'Procesando...' : 'Confirmar apuesta'}
          </button>
          <button onClick={() => { setSelectedBet(null); setBetPoints(''); setMsg(''); setShowBetslip(false) }}
            style={{width:'100%', padding:'12px', borderRadius:'12px', background:'transparent', color:'#6B7280', fontSize:'14px', border:'1px solid #374151', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>
            Cancelar
          </button>
        </div>
      ) : (
        <div style={{padding:'48px 20px', textAlign:'center', flex:1}}>
          <div style={{fontSize:'48px', marginBottom:'16px'}}>🎯</div>
          <div style={{fontSize:'15px', fontWeight:600, color:'#6B7280', marginBottom:'8px'}}>Sin seleccion</div>
          <div style={{fontSize:'13px', color:'#4B5563', lineHeight:1.7}}>Toca una cuota de cualquier partido para hacer tu apuesta</div>
        </div>
      )}

      {/* Equivalencia */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 18px', background:'#0F1520'}}>
        <div style={{fontSize:'10px', color:'#4B5563', textAlign:'center', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase'}}>Equivalencia de puntos</div>
        <div style={{display:'flex', justifyContent:'space-around'}}>
          {[{p:'50K',v:'$5'},{p:'100K',v:'$10'},{p:'500K',v:'$50'}].map(e => (
            <div key={e.p} style={{textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'14px', color:'#00FF88', fontWeight:700}}>{e.p}</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>= {e.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        * { box-sizing:border-box; }
        .match-card:hover { border-color:rgba(0,255,136,0.35) !important; transform:translateY(-2px); }
        .odd-btn:hover { background:rgba(0,255,136,0.12) !important; border-color:#00FF88 !important; }
        .tab-btn:hover { color:#F9FAFB !important; }

        /* Desktop: layout 2 columnas */
        .layout { display:grid; grid-template-columns:1fr 360px; gap:20px; padding:20px 24px; }
        .betslip-desktop { display:block; }
        .betslip-mobile-btn { display:none; }
        .betslip-mobile-overlay { display:none; }

        /* Mobile */
        @media(max-width:900px) {
          .layout { grid-template-columns:1fr; padding:12px 16px; }
          .betslip-desktop { display:none !important; }
          .betslip-mobile-btn { display:flex !important; }
          .betslip-mobile-overlay { display:block !important; }
        }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER + TABS */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'24px 16px 0'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'6px'}}>Apuestas deportivas</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(22px,4vw,42px)', fontWeight:700, marginBottom:'16px'}}>
            Partidos <span style={{color:'#00FF88'}}>disponibles</span>
          </h1>
          <div style={{display:'flex', gap:'2px', overflowX:'auto', paddingBottom:'1px'}}>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setTabActiva(cat.id)} className="tab-btn"
                style={{padding:'10px 14px', borderRadius:'8px 8px 0 0', border:'none', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap', fontFamily:'Inter, sans-serif',
                  background: tabActiva === cat.id ? '#0A0E1A' : 'transparent',
                  color: tabActiva === cat.id ? cat.color : '#6B7280',
                  borderBottom: tabActiva === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                }}>
                {cat.label}
                {cat.badge > 0 && (
                  <span style={{marginLeft:'5px', background: tabActiva === cat.id ? `${cat.color}25` : 'rgba(255,255,255,0.06)', color: tabActiva === cat.id ? cat.color : '#4B5563', padding:'1px 6px', borderRadius:'999px', fontSize:'10px', fontWeight:700}}>
                    {cat.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="layout">
          {/* PARTIDOS */}
          <div style={{animation:'fadeIn .25s ease'}}>
            {catActual?.partidos?.length > 0 ? (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'12px'}}>
                {catActual.partidos.map((m: any, i: number) => (
                  <MatchCard key={m.id || i} m={m} selectedBet={selectedBet} onSelect={seleccionarApuesta} />
                ))}
              </div>
            ) : (
              <div style={{padding:'60px 20px', textAlign:'center', background:'#111827', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>⚽</div>
                <div style={{fontSize:'15px', fontWeight:600, color:'#9CA3AF', marginBottom:'8px'}}>No hay partidos ahora</div>
                <div style={{fontSize:'13px', color:'#4B5563'}}>Intenta en otra categoria</div>
              </div>
            )}
          </div>

          {/* BETSLIP DESKTOP */}
          <div className="betslip-desktop" style={{position:'sticky', top:'80px', alignSelf:'start'}}>
            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{background:'#0F1520', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'8px'}}>
                <span style={{fontSize:'16px'}}>🎯</span>
                <span style={{fontFamily:'Rajdhani, sans-serif', fontSize:'17px', fontWeight:700}}>Boleto de apuesta</span>
              </div>
              <BetslipContent />
            </div>
          </div>
        </div>

        {/* BOTÓN FLOTANTE MÓVIL */}
        {selectedBet && (
          <button className="betslip-mobile-btn"
            onClick={() => setShowBetslip(true)}
            style={{position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)', zIndex:90, display:'flex', alignItems:'center', gap:'10px', padding:'14px 28px', borderRadius:'999px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,255,136,0.4)', fontFamily:'Inter, sans-serif', animation:'fadeIn .3s ease', whiteSpace:'nowrap'}}>
            🎯 Ver apuesta — {selectedBet.oddVal.toFixed(2)}x
            <span style={{background:'rgba(0,0,0,0.15)', padding:'3px 10px', borderRadius:'999px', fontSize:'13px'}}>
              {selectedBet.oddLabel === '1' ? selectedBet.home : selectedBet.oddLabel === '2' ? selectedBet.away : 'Empate'}
            </span>
          </button>
        )}

        {/* BETSLIP MÓVIL — Panel desde abajo */}
        <div className="betslip-mobile-overlay">
          {/* Overlay oscuro */}
          {showBetslip && (
            <div onClick={() => setShowBetslip(false)}
              style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:95, backdropFilter:'blur(4px)'}}
            />
          )}

          {/* Panel */}
          <div style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:96,
            background:'#111827',
            borderRadius:'20px 20px 0 0',
            border:'1px solid rgba(255,255,255,0.1)',
            maxHeight:'90vh',
            overflowY:'auto',
            transform: showBetslip ? 'translateY(0)' : 'translateY(100%)',
            transition:'transform .35s cubic-bezier(0.32, 0.72, 0, 1)',
            boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',
          }}>
            {/* Handle */}
            <div style={{padding:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{width:'40px', height:'4px', background:'#374151', borderRadius:'999px'}}/>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'0 6px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontSize:'16px'}}>🎯</span>
                  <span style={{fontFamily:'Rajdhani, sans-serif', fontSize:'17px', fontWeight:700}}>Boleto de apuesta</span>
                </div>
                <button onClick={() => setShowBetslip(false)}
                  style={{background:'#1F2937', border:'none', color:'#9CA3AF', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  ✕
                </button>
              </div>
            </div>
            <BetslipContent />
          </div>
        </div>

      </div>
    </main>
  )
}

function MatchCard({ m, selectedBet, onSelect }: { m:any, selectedBet:any, onSelect:any }) {
  const isAnySelected = selectedBet?.matchId === m.id

  return (
    <div className="match-card" style={{background:'#111827', border:`1px solid ${isAnySelected ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius:'14px', padding:'16px', transition:'all .2s', cursor:'pointer'}}>

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'6px', minWidth:0, flex:1}}>
          {m.leagueLogo && <img src={m.leagueLogo} style={{width:'16px', height:'16px', objectFit:'contain', flexShrink:0}} alt=""/>}
          <span style={{fontSize:'10px', fontWeight:600, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.league}</span>
        </div>
        <div style={{flexShrink:0, marginLeft:'8px'}}>
          {m.live
            ? <span style={{display:'flex', alignItems:'center', gap:'4px', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:'999px', padding:'3px 8px', fontSize:'10px', fontWeight:700}}>
                <span style={{width:'5px', height:'5px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1s infinite'}}/>
                {m.minuto ? `${m.minuto}'` : 'LIVE'}
              </span>
            : m.finalizado
              ? <span style={{fontSize:'10px', color:'#00FF88', fontWeight:600}}>✓ Final</span>
              : <span style={{fontSize:'11px', color:'#6B7280', fontFamily:'monospace'}}>{m.time} · {m.date}</span>
          }
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
        <div style={{textAlign:'center', flex:1}}>
          {m.homeBadge
            ? <img src={m.homeBadge} alt={m.home} style={{width:'40px', height:'40px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{width:'40px', height:'40px', background:'#1F2937', borderRadius:'50%', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>⚽</div>
          }
          <div style={{fontSize:'12px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', margin:'0 auto'}}>{m.home}</div>
        </div>

        <div style={{textAlign:'center', padding:'0 8px', minWidth:'60px'}}>
          {m.finalizado && m.scoreHome !== null
            ? <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>{m.scoreHome}–{m.scoreAway}</div>
            : m.live && m.scoreHome !== null
              ? <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#EF4444'}}>{m.scoreHome}–{m.scoreAway}</div>
              : <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'14px', color:'#4B5563', fontWeight:600}}>vs</div>
          }
          {m.jornada && <div style={{fontSize:'10px', color:'#4B5563', marginTop:'2px'}}>J{m.jornada}</div>}
        </div>

        <div style={{textAlign:'center', flex:1}}>
          {m.awayBadge
            ? <img src={m.awayBadge} alt={m.away} style={{width:'40px', height:'40px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{width:'40px', height:'40px', background:'#1F2937', borderRadius:'50%', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>⚽</div>
          }
          <div style={{fontSize:'12px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', margin:'0 auto'}}>{m.away}</div>
        </div>
      </div>

      {m.live && (
        <div style={{textAlign:'center', padding:'10px', fontSize:'12px', color:'#EF4444', fontWeight:600, background:'rgba(239,68,68,0.08)', borderRadius:'8px'}}>
          🔴 Partido en vivo - Apuestas cerradas
        </div>
      )}

      {!m.finalizado && !m.live && (
        <div style={{display:'grid', gridTemplateColumns: m.odds.length === 2 ? '1fr 1fr' : '1fr 1fr 1fr', gap:'6px'}}>
          {m.odds.map((o: any) => {
            const isSel = selectedBet?.matchId === m.id && selectedBet?.oddLabel === o.label
            return (
              <button key={o.label} className="odd-btn"
                onClick={() => onSelect(isSel ? null : {matchId:m.id, home:m.home, away:m.away, homeBadge:m.homeBadge, awayBadge:m.awayBadge, oddLabel:o.label, oddVal:o.val, live:m.live})}
                style={{background: isSel ? 'rgba(0,255,136,0.15)' : '#0F1520', border:`1px solid ${isSel ? '#00FF88' : 'rgba(255,255,255,0.06)'}`, borderRadius:'8px', padding:'10px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
                <span style={{fontSize:'9px', color: isSel ? '#00FF88' : '#6B7280', fontWeight:600, textTransform:'uppercase'}}>
                  {o.label === '1' ? 'Local' : o.label === 'X' ? 'Empate' : 'Visita'}
                </span>
                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color: isSel ? '#00FF88' : '#F9FAFB'}}>{o.val.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
