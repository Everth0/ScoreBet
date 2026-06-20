'use client'
import Navbar from '@/components/Navbar'
import { useState } from 'react'

const sports = ['Todos', 'Futbol', 'Baloncesto', 'Tenis']

export default function PartidosClient({ proximos, recientes }: { proximos: any[], recientes: any[] }) {
  const [filtro, setFiltro] = useState('Todos')
  const [selectedBet, setSelectedBet] = useState<any>(null)
  const [betPoints, setBetPoints]     = useState('')

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .match-card:hover { border-color:rgba(0,255,136,0.3) !important; transform:translateY(-2px); }
        .odd-btn:hover { background:rgba(0,255,136,0.12) !important; border-color:#00FF88 !important; }
        .filter-btn:hover { border-color:#00FF88 !important; color:#00FF88 !important; }
        @media(max-width:768px){ .partidos-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'36px 24px 28px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>En vivo y proximos</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'20px'}}>
            Partidos <span style={{color:'#00FF88'}}>disponibles</span>
          </h1>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            {sports.map(s => (
              <button key={s} onClick={() => setFiltro(s)} className="filter-btn"
                style={{padding:'8px 20px', borderRadius:'999px', border:`1px solid ${filtro === s ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)'}`, background: filtro === s ? 'rgba(0,255,136,0.1)' : 'transparent', color: filtro === s ? '#00FF88' : '#9CA3AF', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all .15s', fontFamily:'Inter, sans-serif'}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="partidos-grid" style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', padding:'24px'}}>

          {/* PARTIDOS */}
          <div>
            {/* Proximos */}
            <div style={{fontSize:'12px', fontWeight:700, color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{width:'20px', height:'1px', background:'#374151', display:'inline-block'}}/>
              Proximos partidos
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'14px', marginBottom:'36px'}}>
              {proximos.length > 0 ? proximos.map((m, i) => (
                <MatchCard key={i} m={m} selectedBet={selectedBet} onSelect={setSelectedBet} />
              )) : (
                <div style={{gridColumn:'1/-1', padding:'40px', textAlign:'center', color:'#6B7280', background:'#111827', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontSize:'32px', marginBottom:'12px'}}>⚽</div>
                  <div style={{fontSize:'14px'}}>Cargando partidos en tiempo real...</div>
                </div>
              )}
            </div>

            {/* Recientes */}
            {recientes.length > 0 && (
              <>
                <div style={{fontSize:'12px', fontWeight:700, color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{width:'20px', height:'1px', background:'#374151', display:'inline-block'}}/>
                  Resultados recientes
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'14px'}}>
                  {recientes.map((m, i) => (
                    <MatchCard key={i} m={m} selectedBet={selectedBet} onSelect={setSelectedBet} resultado />
                  ))}
                </div>
              </>
            )}
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
                    <div style={{fontSize:'11px', color:'#6B7280', marginBottom:'3px'}}>Partido</div>
                    <div style={{fontSize:'13px', fontWeight:600}}>{selectedBet.home} vs {selectedBet.away}</div>
                    <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'2px'}}>Resultado: <span style={{color:'#00FF88', fontWeight:700}}>{selectedBet.oddLabel}</span></div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'8px'}}>
                      <span style={{fontSize:'12px', color:'#9CA3AF'}}>Cuota:</span>
                      <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>{selectedBet.oddVal.toFixed(2)}x</span>
                    </div>
                  </div>

                  <label style={{fontSize:'11px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>PUNTOS A APOSTAR</label>
                  <input type="number" placeholder="Min: 100 pts" value={betPoints} onChange={e => setBetPoints(e.target.value)}
                    style={{width:'100%', background:'#0F1520', border:'1px solid #374151', borderRadius:'8px', padding:'12px 14px', color:'#F9FAFB', fontSize:'14px', fontFamily:'JetBrains Mono, monospace', outline:'none', marginBottom:'10px'}}
                  />
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'6px', marginBottom:'14px'}}>
                    {[500,1000,2000,5000].map(v => (
                      <button key={v} onClick={() => setBetPoints(String(v))}
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
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'12px', color:'#00FF88'}}>{selectedBet.oddVal.toFixed(2)}x</span>
                      </div>
                      <div style={{height:'1px', background:'rgba(255,255,255,0.06)', margin:'6px 0'}}/>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span style={{fontSize:'13px', fontWeight:600}}>Ganancia posible</span>
                        <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#00FF88'}}>
                          {Math.round(Number(betPoints) * selectedBet.oddVal).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  )}

                  <button style={{width:'100%', padding:'13px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:'8px'}}>
                    Confirmar apuesta
                  </button>
                  <button onClick={() => { setSelectedBet(null); setBetPoints('') }}
                    style={{width:'100%', padding:'9px', borderRadius:'10px', background:'transparent', color:'#6B7280', fontSize:'13px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{padding:'36px 18px', textAlign:'center'}}>
                  <div style={{fontSize:'32px', marginBottom:'10px'}}>🎯</div>
                  <div style={{fontSize:'13px', color:'#6B7280', marginBottom:'6px', fontWeight:500}}>Sin seleccion</div>
                  <div style={{fontSize:'12px', color:'#4B5563', lineHeight:1.6}}>Toca una cuota para apostar</div>
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

function MatchCard({ m, selectedBet, onSelect, resultado }: { m:any, selectedBet:any, onSelect:any, resultado?:boolean }) {
  return (
    <div className="match-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'18px', transition:'all .2s', cursor:'pointer', opacity: resultado ? 0.75 : 1}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
        <span style={{fontSize:'10px', fontWeight:600, color:'#6B7280', letterSpacing:'1.5px', textTransform:'uppercase'}}>{m.league}</span>
        {m.live
          ? <span style={{display:'flex', alignItems:'center', gap:'4px', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:'999px', padding:'3px 10px', fontSize:'10px', fontWeight:700}}>
              <span style={{width:'5px', height:'5px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1.2s infinite'}}/>LIVE
            </span>
          : <span style={{fontSize:'11px', color: resultado ? '#00FF88' : '#6B7280', fontFamily:'monospace'}}>{resultado ? 'Finalizado' : m.time}</span>
        }
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px'}}>
        <div style={{textAlign:'center', flex:1}}>
          {m.homeIcon?.startsWith('http')
            ? <img src={m.homeIcon} alt={m.home} style={{width:'36px', height:'36px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{fontSize:'24px', marginBottom:'6px'}}>{m.homeIcon || '⚽'}</div>
          }
          <div style={{fontSize:'12px', fontWeight:600}}>{m.home}</div>
        </div>
        <div style={{textAlign:'center', padding:'0 12px'}}>
          {resultado && m.scoreHome !== null
            ? <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88'}}>{m.scoreHome} – {m.scoreAway}</div>
            : <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'18px', fontWeight:700, color:'#6B7280'}}>vs</div>
          }
          <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px', fontFamily:'monospace'}}>{m.date}</div>
        </div>
        <div style={{textAlign:'center', flex:1}}>
          {m.awayIcon?.startsWith('http')
            ? <img src={m.awayIcon} alt={m.away} style={{width:'36px', height:'36px', objectFit:'contain', marginBottom:'6px'}}/>
            : <div style={{fontSize:'24px', marginBottom:'6px'}}>{m.awayIcon || '⚽'}</div>
          }
          <div style={{fontSize:'12px', fontWeight:600}}>{m.away}</div>
        </div>
      </div>
      {!resultado && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
          {m.odds.map((o: any) => {
            const isSelected = selectedBet?.matchId === m.id && selectedBet?.oddLabel === o.label
            return (
              <button key={o.label} className="odd-btn"
                onClick={() => onSelect(isSelected ? null : {matchId:m.id, home:m.home, away:m.away, oddLabel:o.label, oddVal:o.val})}
                style={{background: isSelected ? 'rgba(0,255,136,0.15)' : '#0F1520', border:`1px solid ${isSelected ? '#00FF88' : 'rgba(255,255,255,0.06)'}`, borderRadius:'8px', padding:'10px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
                <span style={{fontSize:'10px', color: isSelected ? '#00FF88' : '#6B7280', fontWeight:600}}>{o.label}</span>
                <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color: isSelected ? '#00FF88' : '#F9FAFB'}}>{o.val.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
