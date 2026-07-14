'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

function AuthActionContent() {
  const params = useSearchParams()
  const router = useRouter()
  const mode    = params.get('mode')
  const oobCode = params.get('oobCode')

  const [estado, setEstado] = useState<'cargando'|'ok'|'error'|'form-password'>('cargando')
  const [mensaje, setMensaje] = useState('')
  const [emailRecuperado, setEmailRecuperado] = useState('')
  const [nuevaPass, setNuevaPass] = useState('')
  const [confirmarPass, setConfirmarPass] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!mode || !oobCode) {
      setEstado('error')
      setMensaje('Enlace invalido o incompleto.')
      return
    }

    async function procesar() {
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode!)
          setEstado('ok')
          setMensaje('Tu correo electronico fue verificado correctamente.')
          setTimeout(() => router.push('/dashboard'), 3000)
        } else if (mode === 'resetPassword') {
          const email = await verifyPasswordResetCode(auth, oobCode!)
          setEmailRecuperado(email)
          setEstado('form-password')
        } else if (mode === 'recoverEmail') {
          const info = await checkActionCode(auth, oobCode!)
          await applyActionCode(auth, oobCode!)
          setEstado('ok')
          setMensaje(`Se revirtio el cambio de correo. Tu correo es nuevamente: ${info.data.email}`)
        } else {
          setEstado('error')
          setMensaje('Tipo de accion no reconocida.')
        }
      } catch (e: any) {
        setEstado('error')
        const code = e?.code || ''
        if (code === 'auth/expired-action-code') {
          setMensaje('Este enlace ya expiro. Solicita uno nuevo.')
        } else if (code === 'auth/invalid-action-code') {
          setMensaje('Este enlace ya fue usado o no es valido.')
        } else {
          setMensaje('Ocurrio un error al procesar el enlace.')
        }
      }
    }
    procesar()
  }, [mode, oobCode])

  async function enviarNuevaPassword() {
    if (nuevaPass.length < 6) {
      setMensaje('La contrasena debe tener al menos 6 caracteres')
      return
    }
    if (nuevaPass !== confirmarPass) {
      setMensaje('Las contrasenas no coinciden')
      return
    }
    setEnviando(true)
    setMensaje('')
    try {
      await confirmPasswordReset(auth, oobCode!, nuevaPass)
      setEstado('ok')
      setMensaje('Tu contrasena fue actualizada correctamente. Ya puedes iniciar sesion.')
      setTimeout(() => router.push('/login'), 3000)
    } catch (e: any) {
      const code = e?.code || ''
      if (code === 'auth/weak-password') {
        setMensaje('La contrasena es muy debil')
      } else {
        setMensaje('No se pudo actualizar la contrasena. Intenta de nuevo.')
      }
    }
    setEnviando(false)
  }

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={{maxWidth:'420px', width:'100%', background:'#111827', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'32px 24px', textAlign:'center'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif', fontSize:'24px', fontWeight:700, marginBottom:'20px'}}>
          SCORE<span style={{color:'#00FF88'}}>BET</span>
        </div>

        {estado === 'cargando' && (
          <p style={{color:'#9CA3AF', fontSize:'14px'}}>Procesando tu solicitud...</p>
        )}

        {estado === 'ok' && (
          <>
            <div style={{fontSize:'40px', marginBottom:'12px'}}>✅</div>
            <p style={{color:'#00FF88', fontSize:'14px', lineHeight:1.5}}>{mensaje}</p>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{fontSize:'40px', marginBottom:'12px'}}>⚠️</div>
            <p style={{color:'#EF4444', fontSize:'14px', marginBottom:'20px', lineHeight:1.5}}>{mensaje}</p>
            <Link href="/login" style={{color:'#00FF88', fontSize:'13px', textDecoration:'none'}}>Volver al inicio de sesion</Link>
          </>
        )}

        {estado === 'form-password' && (
          <>
            <p style={{color:'#9CA3AF', fontSize:'13px', marginBottom:'18px'}}>
              Nueva contrasena para <strong style={{color:'#F9FAFB'}}>{emailRecuperado}</strong>
            </p>
            <input
              type="password"
              placeholder="Nueva contrasena"
              value={nuevaPass}
              onChange={e => setNuevaPass(e.target.value)}
              className="input-field"
              style={{width:'100%', marginBottom:'10px', padding:'12px', borderRadius:'8px', background:'#0F1520', border:'1px solid rgba(255,255,255,0.08)', color:'#F9FAFB'}}
            />
            <input
              type="password"
              placeholder="Confirmar contrasena"
              value={confirmarPass}
              onChange={e => setConfirmarPass(e.target.value)}
              className="input-field"
              style={{width:'100%', marginBottom:'14px', padding:'12px', borderRadius:'8px', background:'#0F1520', border:'1px solid rgba(255,255,255,0.08)', color:'#F9FAFB'}}
            />
            {mensaje && (
              <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#EF4444', marginBottom:'14px'}}>
                ⚠️ {mensaje}
              </div>
            )}
            <button
              onClick={enviarNuevaPassword}
              disabled={enviando}
              style={{width:'100%', padding:'14px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.8 : 1}}>
              {enviando ? 'Guardando...' : 'Guardar nueva contrasena'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={<div style={{background:'#0A0E1A', minHeight:'100vh'}} />}>
      <AuthActionContent />
    </Suspense>
  )
}
