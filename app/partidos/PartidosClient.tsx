'use client'
import Navbar from '@/components/Navbar'
import { useState } from 'react'

export default function PartidosClient({ categorias }: { categorias: any[] }) {
  const [tabActiva, setTabActiva]     = useState(() => {
    const vivo = categorias.find(c => c.id === 'vivo')
    return vivo && vivo.partidos.length > 0 ? 'vivo' : 'hoy'
  })
  const [selectedBet, setSelectedBet] = useState<any>(null)
  const [betPoints, setBetPoints]     = useState('')
  const [msg, setMsg]                 = useState('')

  const catActual = categorias.find(c => c.id === tabActiva)

  function confirmar() {
    if (!betPoints || Number(betPoints) < 100) {
      setMsg('Minimo 100 puntos')
      return
    }
    const ganancia = Math.round(Number(betPoints) * selectedBet.oddVal)
    setMsg(`✅ Apuesta de ${Number(betPoints).toLocaleString()} pts registrada. Ganancia posible: ${ganancia.toLocaleString()} pts`)
    setTimeout(() => { setSelectedBet(null); setBetPoints(''); setMsg('') }, 2500)
  }

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .match-card:hover { border-color:rgba(0,255,136,0.35) !important; transform:translateY(-2px); }
        .odd-btn:hover { background:rgba(0,255,136,0.12) !important; border-color:#00FF88 !important; }
        .tab-btn:hover { color:#F9FAFB !important; }
        @media(max-width:900px){ .layout{ grid-template-columns:1fr !important; } .betslip{ display:none; } }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER + TABS */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'28px 24px 0'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'6px'}}>Apuestas deportivas</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(24px,4vw,42px)', fontWeight:700, marginBottom:'20px'}}>
            Partidos <span style={{color:'#00FF88'}}>disponibles</span>
          </h1>
          <div style={{display:'flex', gap:'2px', overflowX:'auto', paddingBottom:'1px'}}>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setTabActiva(cat.id)} className="tab-btn"
                style={{padding:'11px 16px', borderRadius:'8px 8px 0 0', border:'none', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap', fontFamily:'Inter, sans-serif',
                  background: tabActiva === cat.id ? '#0A0E1A' : 'transparent',
                  color: tabActiva === cat.id ? cat.color : '#6B7280',
                  borderBottom: tabActiva === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                }}>
                {cat.label}
                {cat.badge > 0 && (
                  <span style={{marginLeft:'6px', background: tabActiva === cat.id ? `${cat.color}25` : 'rgba(255,255,255,0.06)', color: tabActiva === cat.id ? cat.color : '#4B5563', padding:'2px 7px', borderRadius:'999px', fontSize:'10px', fontWeight:700}}>
                    {cat.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="layout" style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', padding:'20px 24px'}}>

          {/* PARTIDOS */}
          <div style={{animation:'fadeIn .25s ease'}}>
            {catActual?.partidos?.length > 0 ? (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'12px'}}>
                {catActual.partidos.map((m: any, i: number) => (
                  <MatchCard key={m.id || i} m={m} selectedBet={selectedBet} onSelect={setSelectedBet} />
                ))}
              </div>
            ) : (
              <div style={{padding:'60px 20px', textAlign:'center', background:'#111827', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:'48px', marginBottom:'16px'}}>
                  {tabActiva === 'vivo' ? '📡' : tabActiva === 'mundial' ? '🏆' : '⚽'}
                </div>
                <div style={{fontSize:'16px', fontWeight:600, color:'#9CA3AF', marginBottom:'8px'}}>
                  {tabActiva === 'vivo' ? 'No hay partidos en vivo ahora' : 'No hay partidos programados'}
                </div>
                <div style={{fontSize:'13px', color:'#4B5563'}}>
                  {tabActiva === 'vivo' ? 'Los partidos en vivo aparecerán aquí automaticamente' : 'Intenta en otra categoria o vuelve mas tarde'}
                </div>
              </div>
            )}
          </div>

          {/* BETSLIP */}
          <div className="betslip" style={{position:'sticky', top:'80px', alignSelf:'start'}}>
            <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{background:'#0F1520', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'8px'}}>
                <span style={{fontSize:'16px'}}>🎯</span>
                <span style={{fontFamily:'Rajdhani, sans-serif', fontSize:'17px', fontWeight:700}}>Boleto de apuesta</span>
              </div>

              {selectedBet ? (
                <div style={{padding:'18px', animation:'fadeIn .2s ease'}}>
                  {/* Seleccion */}
                  <div style={{background:'#0F1520', borderRadius:'12px', padding:'14px', marginBottom:'16px', border:'1px solid rgba(0,255,136,0.2)'}}>
                    <div style={{fontSize:'10px', color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px'}}>Seleccion</div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
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
                      <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'26px', fontWeight:700, color:'#00FF88'}}>{selectedBet.oddVal.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Input puntos */}
                  <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px', letterSpacing:'0.5px'}}>PUNTOS A APOSTAR</label>
                  <input type="number" placeholder="Minimo 100 pts" value={betPoints} onChange={e => setBetPoints(e.target.value)}
                    style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'12px 14px', color:'#F9FAFB', fontSize:'15px', fontFamily:'JetBrains Mono, monospace', outline:'none', marginBottom:'10px'}}
                  />
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px', marginBottom:'14px'}}>
                    {[500,1000,2000,5000].map(v => (
                      <button key={v} onClick={() => setBetPoints(String(v))}
                        style={{padding:'7px', borderRadius:'6px', background:'#0F1520', border:'1px solid #374151', color:'#9CA3AF', fontSize:'11px', cursor:'pointer', fontFamily:'JetBrains Mono, monospace', transition:'all .15s'}}>
                        {v >= 1000 ? `${v/1000}K` : v}
                      </button>
                    ))}
                  </div>

                  {betPoints && Number(betPoints) >= 100 && (
                    <div style={{background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'14px', marginBottom:'14px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px'}}>
                        <span style={{color:'#9CA3AF'}}>Apuesta</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace'}}>{Number(betPoints).toLocaleString()} pts</span>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px'}}>
                        <span style={{color:'#9CA3AF'}}>Cuota</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', color:'#00FF88'}}>{selectedBet.oddVal.toFixed(2)}x</span>
                      </div>
                      <div style={{height:'1px', background:'rgba(255,255,255,0.06)', marginBottom:'8px'}}/>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'13px', fontWeight:600}}>Ganancia posible</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700, color:'#00FF88'}}>
                          {Math.round(Number(betPoints) * selectedBet.oddVal).toLocaleString()}
                        </span>
                      </div>
                      <div style={{fontSize:'10px', color:'#4B5563', textAlign:'right', marginTop:'2px'}}>puntos</div>
                    </div>
                  )}

                  {msg && (
                    <div style={{marginBottom:'12px', padding:'12px', borderRadius:'8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', fontSize:'13px', color:'#00FF88', lineHeight:1.5}}>
                      {msg}
                    </div>
                  )}

                  <button onClick={confirmar}
                    style={{width:'100%', padding:'14px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:'8px', transition:'all .2s'}}>
                    Confirmar apuesta
                  </button>
                  <button onClick={() => { setSelectedBet(null); setBetPoints(''); setMsg('') }}
                    style={{width:'100%', padding:'9px', borderRadius:'10px', background:'transparent', color:'#6B7280', fontSize:'13px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{padding:'48px 20px', textAlign:'center'}}>
                  <div style={{fontSize:'40px', marginBottom:'14px'}}>🎯</div>
                  <div style={{fontSize:'14px', fontWeight:600, color:'#6B7280', marginBottom:'8px'}}>Sin seleccion</div>
                  <div style={{fontSize:'12px', color:'#4B5563', lineHeight:1.7}}>Toca una cuota de cualquier partido para agregar tu apuesta</div>
                </div>
              )}

              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 18px', background:'#0F1520'}}>
                <div style={{fontSize:'10px', color:'#4B5563', textAlign:'center', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase'}}>Equivalencia</div>
                <div style={{display:'flex', justifyContent:'space-around'}}>
                  {[{p:'50K',v:'$5'},{p:'100K',v:'$10'},{p:'500K',v:'$50'}].map(e => (
                    <div key={e.p} style={{textAlign:'center'}}>
                      <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'13px', color:'#00FF88', fontWeight:700}}>{e.p}</div>
                      <div style={{fontSize:'11px', color:'#6B7280'}}>= {e.v}</div>
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

function MatchCard({ m, selectedBet, onSelect }: { m:any, selectedBet:any, onSelect:any }) {
  const isAnySelected = selectedBet?.matchId === m.id

  return (
    <div className="match-card" style={{background:'#111827', border:`1px solid ${isAnySelected ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius:'14px', padding:'16px', transition:'all .2s', cursor:'pointer'}}>

      {/* Header */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'6px', minWidth:0}}>
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

      {/* Equipos */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
        <div style={{textAlign:'center', flex:1}}>
          {m.homeBadge
            ? <img src={m.homeBadge} alt={m.home} style={{width:'38px', height:'38px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{width:'38px', height:'38px', background:'#1F2937', borderRadius:'50%', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>⚽</div>
          }
          <div style={{fontSize:'12px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', margin:'0 auto'}}>{m.home}</div>
        </div>

        <div style={{textAlign:'center', padding:'0 8px', minWidth:'70px'}}>
          {m.finalizado && m.scoreHome !== null
            ? <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'24px', fontWeight:700, color:'#00FF88'}}>{m.scoreHome}–{m.scoreAway}</div>
            : m.live && m.scoreHome !== null
              ? <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'24px', fontWeight:700, color:'#EF4444'}}>{m.scoreHome}–{m.scoreAway}</div>
              : <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'16px', color:'#4B5563', fontWeight:600}}>vs</div>
          }
          {m.jornada && <div style={{fontSize:'10px', color:'#4B5563', marginTop:'2px'}}>J{m.jornada}</div>}
        </div>

        <div style={{textAlign:'center', flex:1}}>
          {m.awayBadge
            ? <img src={m.awayBadge} alt={m.away} style={{width:'38px', height:'38px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{width:'38px', height:'38px', background:'#1F2937', borderRadius:'50%', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>⚽</div>
          }
          <div style={{fontSize:'12px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', margin:'0 auto'}}>{m.away}</div>
        </div>
      </div>

      {/* Cuotas */}
      {!m.finalizado && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px'}}>
          {m.odds.map((o: any) => {
            const isSel = selectedBet?.matchId === m.id && selectedBet?.oddLabel === o.label
            return (
              <button key={o.label} className="odd-btn"
                onClick={() => onSelect(isSel ? null : {matchId:m.id, home:m.home, away:m.away, homeBadge:m.homeBadge, awayBadge:m.awayBadge, oddLabel:o.label, oddVal:o.val})}
                style={{background: isSel ? 'rgba(0,255,136,0.15)' : '#0F1520', border:`1px solid ${isSel ? '#00FF88' : 'rgba(255,255,255,0.06)'}`, borderRadius:'8px', padding:'9px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
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
