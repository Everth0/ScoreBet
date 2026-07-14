'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { useUser } from '@/context/UserContext'

const links = [
  { label:'Inicio',          href:'/',                special:false },
  { label:'Partidos',        href:'/partidos',        special:false },
  { label:'Mis Apuestas',    href:'/mis-apuestas',    special:false },
  { label:'🏆 Ranking',      href:'/ranking',         special:false },
  { label:'Recompensas',     href:'/recompensas',     special:false },
  { label:'Referidos',       href:'/referidos',       special:false },
  { label:'💰 Apuesta Real', href:'/apuestas-reales', special:true  },
]

export default function Navbar({ puntosActuales }: { puntosActuales?: number }) {
  const [open, setOpen] = useState(false)
  const pathname        = usePathname()
  const router          = useRouter()
  const { user }        = useAuth()
  const { userData }    = useUser()

  const pts = userData?.puntosActuales ?? puntosActuales ?? 0

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  return (
    <>
      <nav style={{position:'fixed', top:0, left:0, right:0, zIndex:100, height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', background:'rgba(10,14,26,0.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)'}}>

        <Link href="/" style={{textDecoration:'none', flexShrink:0}}>
          <span style={{fontFamily:'Rajdhani, sans-serif', fontWeight:700, fontSize:'20px', letterSpacing:'1px', color:'#F9FAFB'}}>
            SCORE<span style={{color:'#00FF88'}}>BET</span>
          </span>
        </Link>

        <div style={{display:'flex', alignItems:'center', gap:'2px', overflowX:'auto', flex:1, margin:'0 12px'}} className="nav-links">
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link key={l.href} href={l.href} style={{textDecoration:'none', padding:'6px 10px', borderRadius:'8px', fontSize:'12px', fontWeight: active || l.special ? 600 : 400, color: l.special ? '#F59E0B' : active ? '#00FF88' : '#9CA3AF', background: l.special ? 'rgba(245,158,11,0.08)' : active ? 'rgba(0,255,136,0.08)' : 'transparent', border: l.special ? '1px solid rgba(245,158,11,0.25)' : active ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent', transition:'all .15s', whiteSpace:'nowrap'}}>
                {l.label}
              </Link>
            )
          })}
        </div>

        <div style={{display:'flex', alignItems:'center', gap:'8px', flexShrink:0}}>
          {user ? (
            <>
              <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'5px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'8px', padding:'6px 12px', textDecoration:'none'}}>
                <span style={{fontSize:'13px'}}>⚡</span>
                <span style={{fontFamily:'monospace', fontSize:'14px', fontWeight:700, color:'#00FF88'}}>{pts.toLocaleString()}</span>
                <span style={{fontSize:'11px', color:'#6B7280'}}>pts</span>
              </Link>
              {/* Avatar con link al perfil */}
              <Link href="/perfil" style={{width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#00FF88,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#0A0E1A', textDecoration:'none', flexShrink:0}}>
                {(userData?.nombre || user?.email || 'U')[0].toUpperCase()}
              </Link>
              <button onClick={handleLogout} style={{padding:'6px 12px', borderRadius:'8px', border:'1px solid #374151', color:'#9CA3AF', fontSize:'12px', cursor:'pointer', background:'transparent', fontFamily:'Inter, sans-serif'}}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{padding:'6px 12px', borderRadius:'8px', border:'1px solid #374151', color:'#F9FAFB', fontSize:'12px', fontWeight:500, textDecoration:'none'}}>
                Entrar
              </Link>
              <Link href="/login" style={{padding:'6px 12px', borderRadius:'8px', background:'#00FF88', color:'#0A0E1A', fontSize:'12px', fontWeight:700, textDecoration:'none'}}>
                Registrarse
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="hamburger" style={{display:'none', background:'none', border:'none', color:'#F9FAFB', fontSize:'22px', cursor:'pointer'}}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{position:'fixed', top:'64px', left:0, right:0, zIndex:99, background:'#111827', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'4px'}}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{padding:'12px 16px', borderRadius:'8px', fontSize:'14px', color: l.special ? '#F59E0B' : '#9CA3AF', textDecoration:'none', fontWeight: l.special ? 600 : 400}}>
              {l.label}
            </Link>
          ))}
          <Link href="/perfil" onClick={() => setOpen(false)}
            style={{padding:'12px 16px', borderRadius:'8px', fontSize:'14px', color:'#9CA3AF', textDecoration:'none'}}>
            👤 Mi perfil
          </Link>
          {!user ? (
            <div style={{display:'flex', gap:'10px', marginTop:'8px', paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,0.07)'}}>
              <Link href="/login" onClick={() => setOpen(false)} style={{flex:1, padding:'12px', textAlign:'center', borderRadius:'8px', border:'1px solid #374151', color:'#F9FAFB', fontSize:'14px', textDecoration:'none'}}>Entrar</Link>
              <Link href="/login" onClick={() => setOpen(false)} style={{flex:1, padding:'12px', textAlign:'center', borderRadius:'8px', background:'#00FF88', color:'#0A0E1A', fontSize:'14px', fontWeight:700, textDecoration:'none'}}>Registrarse</Link>
            </div>
          ) : (
            <button onClick={handleLogout} style={{marginTop:'8px', padding:'12px', borderRadius:'8px', background:'transparent', border:'1px solid #374151', color:'#9CA3AF', fontSize:'14px', cursor:'pointer', fontFamily:'Inter, sans-serif'}}>
              Cerrar sesion
            </button>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .hamburger{ display:block !important; }
          .nav-links{ display:none !important; }
        }
      `}</style>
    </>
  )
}
