'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export default function Referidos() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [copiado, setCopiado]   = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/login'); return }
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setUserData({ uid: user.uid, ...snap.data() })
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function copiarCodigo() {
    if (!userData) return
    navigator.clipboard.writeText(userData.uid.slice(0, 8).toUpperCase())
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function copiarLink() {
    if (!userData) return
    const link = `${APP_URL}/login?ref=${userData.uid.slice(0,8).toUpperCase()}`
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani, sans-serif', fontSize:'28px', fontWeight:700, color:'#F9FAFB'}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
        <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando...</div>
      </div>
    </main>
  )

  const codigo = userData?.codigoReferido || userData?.uid?.slice(0,8).toUpperCase() || 'XXXXXXXX'
  const totalReferidos = userData?.totalReferidos || 0
  const ptsReferidos = totalReferidos * 300

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter, sans-serif'}}>
      <Navbar puntosActuales={userData?.puntosActuales} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        * { box-sizing:border-box; }
        .copy-btn:hover { background:#00cc6a !important; transform:translateY(-1px); }
        .share-btn:hover { background:#1F2937 !important; border-color:#4B5563 !important; }
        .step-ref::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#00FF88,transparent); }
      `}</style>

      <div style={{paddingTop:'64px'}}>

        {/* HEADER */}
        <div style={{background:'#0F1520', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'36px 24px'}}>
          <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'#00FF88', marginBottom:'8px'}}>Programa de referidos</div>
          <h1 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'clamp(28px,5vw,48px)', fontWeight:700, marginBottom:'8px'}}>
            Invita amigos y <span style={{color:'#00FF88'}}>gana puntos</span>
          </h1>
          <p style={{fontSize:'15px', color:'#9CA3AF', maxWidth:'500px'}}>
            Por cada amigo que se registre con tu codigo, tu y el reciben <span style={{color:'#00FF88', fontWeight:600}}>300 puntos</span> extra automaticamente.
          </p>
        </div>

        <div style={{padding:'32px 24px', display:'flex', flexDirection:'column', gap:'24px', maxWidth:'800px', margin:'0 auto', animation:'fadeIn .4s ease'}}>

          {/* TU CODIGO */}
          <div style={{background:'#111827', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'16px', padding:'28px', textAlign:'center'}}>
            <div style={{fontSize:'12px', color:'#6B7280', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'16px'}}>Tu codigo de referido</div>
            <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'clamp(28px,6vw,48px)', fontWeight:700, color:'#00FF88', letterSpacing:'8px', marginBottom:'24px', background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'12px', padding:'16px'}}>
              {codigo}
            </div>
            <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
              <button onClick={copiarCodigo} className="copy-btn" style={{padding:'12px 28px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', transition:'all .2s', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', gap:'8px'}}>
                {copiado ? '✅ Copiado!' : '📋 Copiar codigo'}
              </button>
              <button onClick={copiarLink} className="share-btn" style={{padding:'12px 28px', borderRadius:'10px', background:'transparent', color:'#F9FAFB', fontWeight:500, fontSize:'14px', border:'1px solid #374151', cursor:'pointer', transition:'all .2s', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', gap:'8px'}}>
                🔗 Copiar link
              </button>
            </div>
          </div>

          {/* STATS */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px'}}>
            {[
              { icon:'👥', label:'Amigos referidos',    val:totalReferidos.toString(),          color:'#3B82F6' },
              { icon:'⚡', label:'Puntos ganados',       val:ptsReferidos.toLocaleString(),      color:'#00FF88' },
              { icon:'💰', label:'Valor en premios',     val:`$${((ptsReferidos/50000)*5).toFixed(2)}`, color:'#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px', textAlign:'center'}}>
                <div style={{fontSize:'28px', marginBottom:'10px'}}>{s.icon}</div>
                <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'24px', fontWeight:700, color:s.color}}>{s.val}</div>
                <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* COMO FUNCIONA */}
          <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'20px'}}>Como funciona</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
              {[
                { num:'01', title:'Comparte tu codigo', desc:'Envia tu codigo o link a tus amigos por WhatsApp, Instagram o cualquier red social.' },
                { num:'02', title:'Tu amigo se registra', desc:'Tu amigo crea su cuenta en ScoreBet e ingresa tu codigo de referido al registrarse.' },
                { num:'03', title:'Ambos ganan puntos', desc:'Tu recibes 300 puntos y tu amigo tambien recibe 300 puntos extra al completar el registro.' },
                { num:'04', title:'Sin limite de referidos', desc:'Puedes referir a todos los amigos que quieras. Cada uno te da 300 puntos adicionales.' },
              ].map(s => (
                <div key={s.num} className="step-ref" style={{position:'relative', display:'flex', gap:'16px', alignItems:'flex-start', background:'#0F1520', borderRadius:'12px', padding:'16px', overflow:'hidden'}}>
                  <div style={{fontFamily:'JetBrains Mono, monospace', fontSize:'22px', fontWeight:700, color:'#00FF88', minWidth:'36px'}}>{s.num}</div>
                  <div>
                    <div style={{fontSize:'14px', fontWeight:600, marginBottom:'4px'}}>{s.title}</div>
                    <div style={{fontSize:'13px', color:'#9CA3AF', lineHeight:1.6}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPARTIR EN REDES */}
          <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'16px'}}>Compartir en redes</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              {[
                {
    icon: '💬',
    name: 'WhatsApp',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.08)',
    border: 'rgba(37,211,102,0.2)',
    url: `https://wa.me/?text=${encodeURIComponent(`Únete a ScoreBet y gana premios reales apostando puntos gratis. Usa mi código: ${codigo} 🎁 ${APP_URL}/login?ref=${codigo}`)}`
  },
  {
    icon: '📘',
    name: 'Facebook',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.08)',
    border: 'rgba(24,119,242,0.2)',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${APP_URL}/login?ref=${codigo}`)}`
  },
  {
    icon: '🐦',
    name: 'Twitter/X',
    color: '#1DA1F2',
    bg: 'rgba(29,161,242,0.08)',
    border: 'rgba(29,161,242,0.2)',
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Gana premios reales en ScoreBet sin gastar dinero. Usa mi código: ${codigo}`)}&url=${encodeURIComponent(`${APP_URL}/login?ref=${codigo}`)}`
  },
  {
    icon: '📸',
    name: 'Copiar mensaje',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.08)',
    border: 'rgba(225,48,108,0.2)',
    url: null
  },
              ].map(r => (
                <button key={r.name}
                  onClick={() => r.url ? window.open(r.url, '_blank') : navigator.clipboard.writeText(`Únete a ScoreBet y gana premios reales. Usa mi código: ${codigo} 👉 ${APP_URL}/login?ref=${codigo}`)}
                  style={{padding:'14px', borderRadius:'12px', background:r.bg, border:`1px solid ${r.border}`, color:r.color, fontWeight:600, fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s', fontFamily:'Inter, sans-serif'}}>
                  <span style={{fontSize:'20px'}}>{r.icon}</span>
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* TABLA DE GANANCIAS */}
          <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
            <h3 style={{fontFamily:'Rajdhani, sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'16px'}}>Cuanto puedes ganar</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    {['Referidos','Puntos ganados','Valor en premios'].map(h => (
                      <th key={h} style={{padding:'10px 12px', textAlign:'left', color:'#6B7280', fontWeight:600, fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [1,   300,   0.03],
                    [5,   1500,  0.15],
                    [10,  3000,  0.30],
                    [50,  15000, 1.50],
                    [100, 30000, 3.00],
                    [500, 150000, 15.00],
                  ].map(([refs, pts, usd]) => (
                    <tr key={refs} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'12px', fontFamily:'JetBrains Mono, monospace', color:'#F9FAFB', fontWeight:600}}>{refs} amigos</td>
                      <td style={{padding:'12px', fontFamily:'JetBrains Mono, monospace', color:'#00FF88', fontWeight:700}}>{Number(pts).toLocaleString()} pts</td>
                      <td style={{padding:'12px', fontFamily:'JetBrains Mono, monospace', color:'#F59E0B', fontWeight:600}}>${usd} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
