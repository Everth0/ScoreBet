'use client'
import { useEffect, useState } from 'react'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner]         = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    const descartada = localStorage.getItem('pwa-descartada')
    if (descartada) return

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalar() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }

  function descartar() {
    setShowBanner(false)
    localStorage.setItem('pwa-descartada', 'true')
  }

  if (!showBanner) return null

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform:translateY(20px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
      `}</style>
      <div style={{
        position:'fixed', bottom:'80px', left:'16px', right:'16px',
        zIndex:200, background:'#111827',
        border:'1px solid rgba(0,255,136,0.25)',
        borderRadius:'16px', padding:'16px',
        boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
        display:'flex', alignItems:'center', gap:'14px',
        animation:'slideUp .3s ease',
        fontFamily:'Inter, sans-serif',
      }}>
        <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'linear-gradient(135deg,#00FF88,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:700, color:'#0A0E1A', flexShrink:0}}>
          S
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:'14px', fontWeight:700, color:'#F9FAFB', marginBottom:'2px'}}>Instalar ScoreBet</div>
          <div style={{fontSize:'12px', color:'#9CA3AF'}}>Agrega la app a tu pantalla de inicio</div>
        </div>
        <div style={{display:'flex', gap:'8px', flexShrink:0}}>
          <button onClick={descartar} style={{padding:'8px 12px', borderRadius:'8px', background:'transparent', border:'1px solid #374151', color:'#6B7280', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
            Ahora no
          </button>
          <button onClick={instalar} style={{padding:'8px 16px', borderRadius:'8px', background:'#00FF88', border:'none', color:'#0A0E1A', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
            Instalar
          </button>
        </div>
      </div>
    </>
  )
}
