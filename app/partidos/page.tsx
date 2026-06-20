import Navbar from '@/components/Navbar'
import Link from 'next/link'

const sports = ['Todos', 'Futbol', 'Baloncesto', 'Tenis', 'Beisbol', 'F1']

const matches = [
  { league: 'UEFA Champions League', home: 'Man City', away: 'R. Madrid', homeIcon: '🔵', awayIcon: '⚪', score: '2 – 1', time: "67'", live: true, odds: ['1.85','3.40','4.20'], sport: 'Futbol' },
  { league: 'NBA Playoffs', home: 'Lakers', away: 'Celtics', homeIcon: '💛', awayIcon: '🟢', score: '98 – 102', time: 'Q4 3:12', live: true, odds: ['2.10','1.90','1.75'], sport: 'Baloncesto' },
  { league: 'La Liga', home: 'Barcelona', away: 'Atletico', homeIcon: '🔴', awayIcon: '🔵', score: 'vs', time: 'Hoy 20:00', live: false, odds: ['1.60','3.80','5.50'], sport: 'Futbol' },
  { league: 'Serie A', home: 'Juventus', away: 'Inter', homeIcon: '⚫', awayIcon: '🔵', score: 'vs', time: 'Manana 18:30', live: false, odds: ['2.30','3.10','3.00'], sport: 'Futbol' },
  { league: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeIcon: '🔴', awayIcon: '🔵', score: '1 – 1', time: "88'", live: true, odds: ['2.50','3.20','2.80'], sport: 'Futbol' },
  { league: 'Copa Libertadores', home: 'Flamengo', away: 'River', homeIcon: '🔴', awayIcon: '⚪', score: 'vs', time: 'Hoy 21:00', live: false, odds: ['2.10','3.00','3.40'], sport: 'Futbol' },
  { league: 'Wimbledon', home: 'Alcaraz', away: 'Djokovic', homeIcon: '🇪🇸', awayIcon: '🇷🇸', score: '6-4 3-2', time: 'Set 2', live: true, odds: ['1.75','0.00','2.10'], sport: 'Tenis' },
  { league: 'MLB', home: 'Yankees', away: 'Red Sox', homeIcon: '⚾', awayIcon: '🔴', score: 'vs', time: 'Hoy 19:05', live: false, odds: ['1.90','0.00','1.95'], sport: 'Beisbol' },
]

export default function Partidos() {
  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { box-sizing:border-box; }
        .match-card:hover { border-color:rgba(0,255,136,0.35) !important; transform:translateY(-2px); }
        .odd-btn:hover { background:rgba(0,255,136,0.1) !important; border-color:#00FF88 !important; }
        .filter-btn:hover { border-color:#00FF88 !important; color:#00FF88 !important; }
      `}</style>

      <div style={{paddingTop:'64px'}}>
        {/* Header */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'40px 40px 32px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>En vivo y proximos</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(32px,5vw,52px)', fontWeight:700, marginBottom:'24px'}}>
            Partidos <span style={{color:'#00FF88'}}>disponibles</span>
          </h1>
          {/* Filtros */}
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            {sports.map(s => (
              <button key={s} className="filter-btn" style={{padding:'8px 20px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.1)', background: s === 'Todos' ? 'rgba(0,255,136,0.1)' : 'transparent', color: s === 'Todos' ? '#00FF88' : '#9CA3AF', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all .15s', borderColor: s === 'Todos' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Live ahora */}
        <div style={{padding:'32px 40px 0'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px'}}>
            <span style={{width:'6px', height:'6px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1s infinite', display:'inline-block'}}/>
            <span style={{fontSize:'12px', fontWeight:700, color:'#EF4444', letterSpacing:'2px', textTransform:'uppercase'}}>En vivo ahora</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px', marginBottom:'40px'}}>
            {matches.filter(m => m.live).map((m, i) => (
              <MatchCard key={i} m={m} />
            ))}
          </div>
        </div>

        {/* Proximos */}
        <div style={{padding:'0 40px 60px'}}>
          <div style={{fontSize:'12px', fontWeight:700, color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'20px'}}>Proximos partidos</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px'}}>
            {matches.filter(m => !m.live).map((m, i) => (
              <MatchCard key={i} m={m} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function MatchCard({ m }: { m: any }) {
  return (
    <div className="match-card" style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px', transition:'all .2s', cursor:'pointer'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <span style={{fontSize:'10px', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'#6B7280'}}>{m.league}</span>
        {m.live
          ? <span style={{display:'flex', alignItems:'center', gap:'5px', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', color:'#EF4444', borderRadius:'999px', padding:'3px 10px', fontSize:'10px', fontWeight:700}}>
              <span style={{width:'5px', height:'5px', background:'#EF4444', borderRadius:'50%', animation:'pulse 1.2s infinite'}}/>LIVE
            </span>
          : <span style={{fontSize:'11px', color:'#6B7280', fontFamily:'monospace'}}>{m.time}</span>
        }
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <div style={{textAlign:'center', flex:1}}>
          <div style={{fontSize:'26px', marginBottom:'6px'}}>{m.homeIcon}</div>
          <div style={{fontSize:'13px', fontWeight:600}}>{m.home}</div>
        </div>
        <div style={{textAlign:'center', padding:'0 12px'}}>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'20px', fontWeight:700}}>{m.score}</div>
          {m.live && <div style={{fontSize:'11px', color:'#00FF88', fontFamily:'monospace', marginTop:'2px'}}>{m.time}</div>}
        </div>
        <div style={{textAlign:'center', flex:1}}>
          <div style={{fontSize:'26px', marginBottom:'6px'}}>{m.awayIcon}</div>
          <div style={{fontSize:'13px', fontWeight:600}}>{m.away}</div>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
        {['1','X','2'].map((label, j) => (
          <button key={j} className="odd-btn" style={{background:'#0F1520', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'10px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', cursor:'pointer', transition:'all .15s', width:'100%'}}>
            <span style={{fontSize:'10px', color:'#6B7280', fontWeight:600}}>{label}</span>
            <span style={{fontFamily:'JetBrains Mono, monospace', fontSize:'15px', fontWeight:700, color:'#00FF88'}}>{m.odds[j]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
