'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { generarHuellaDispositivo, contarCuentasPorDispositivo, registrarDispositivo } from '@/lib/antifraud'

type RefValidacion = {
  codigo: string
  valido: boolean
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}

function getAuthErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code
    return typeof code === 'string' ? code : ''
  }
  return ''
}

async function validarReferido(codigo: string): Promise<boolean> {
  const normalizado = codigo.trim().toUpperCase().slice(0, 8)
  if (normalizado.length !== 8) return false

  try {
    const res = await fetch(`/api/validar-referido?codigo=${encodeURIComponent(normalizado)}`)
    const data = (await res.json()) as { valido?: boolean }
    return Boolean(data.valido)
  } catch {
    return false
  }
}

async function crearPerfilEnServidor(
  user: User,
  nombre: string,
  email: string,
  codigoRef: string
) {
  const token = await user.getIdToken()
  const res = await fetch('/api/crear-perfil', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre, email, codigoRef }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'No se pudo crear el perfil')
  }
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const refDesdeURL  = searchParams.get('ref')?.toUpperCase().slice(0, 8) || ''

  const [mode, setMode]         = useState<'login'|'register'>('register')
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [referido, setReferido] = useState(refDesdeURL)
  const [validacionRef, setValidacionRef] = useState<RefValidacion | null>(null)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  const refValido = referido.length === 8 && validacionRef?.codigo === referido
    ? validacionRef.valido
    : null

  // Validar codigo mientras escribe
  useEffect(() => {
    if (referido.length !== 8) return

    const timer = setTimeout(async () => {
      const valido = await validarReferido(referido)
      setValidacionRef({ codigo: referido, valido })
    }, 600)

    return () => clearTimeout(timer)
  }, [referido])

  async function handleEmail() {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!nombre.trim()) { setError('Por favor ingresa tu nombre'); setLoading(false); return }

        if (referido && referido.length !== 8) {
          setError('El codigo de referido debe tener 8 caracteres.')
          setLoading(false)
          return
        }

        // Validar codigo si fue ingresado
        if (referido && refValido === false) {
          setError('El codigo de referido no existe. Dejalo vacio si no tienes uno.')
          setLoading(false)
          return
        }

        const huella = generarHuellaDispositivo()
        const cuentasExistentes = await contarCuentasPorDispositivo(huella)
        if (cuentasExistentes >= 3) {
          setError('Ya se alcanzo el limite de 3 cuentas permitidas desde este dispositivo.')
          setLoading(false)
          return
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: nombre })
        await sendEmailVerification(cred.user)
        await crearPerfilEnServidor(cred.user, nombre, email, referido)
        await registrarDispositivo(cred.user.uid, huella)
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        await crearPerfilEnServidor(cred.user, cred.user.displayName || '', cred.user.email || email, '')
      }
      router.push('/dashboard')
    } catch(e: unknown) {
      const msgs: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya esta registrado',
        'auth/invalid-email':        'Email invalido',
        'auth/weak-password':        'La contrasena debe tener al menos 6 caracteres',
        'auth/user-not-found':       'Usuario no encontrado',
        'auth/wrong-password':       'Contrasena incorrecta',
        'auth/invalid-credential':   'Email o contrasena incorrectos',
      }
      const code = getAuthErrorCode(e)
      setError(msgs[code] || 'Error: ' + getErrorMessage(e))
    }
    setLoading(false)
  }


  async function handleResetPassword() {
    setError('')
    setResetMsg('')
    if (!email.trim()) {
      setError('Escribe tu email arriba primero para poder recuperar tu contrasena')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetMsg('Te enviamos un correo para restablecer tu contrasena. Revisa tu bandeja de entrada (y spam).')
    } catch (e: unknown) {
      const code = getAuthErrorCode(e)
      if (code === 'auth/user-not-found') {
        setError('No existe una cuenta con ese email')
      } else if (code === 'auth/invalid-email') {
        setError('Email invalido')
      } else {
        setError('No se pudo enviar el correo: ' + getErrorMessage(e))
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const esNuevo = getAdditionalUserInfo(cred)?.isNewUser

      if (esNuevo) {
        const huella = generarHuellaDispositivo()
        const cuentasExistentes = await contarCuentasPorDispositivo(huella)
        if (cuentasExistentes >= 3) {
          setError('Ya se alcanzo el limite de 3 cuentas permitidas desde este dispositivo.')
          try { await cred.user.delete() } catch {}
          setLoading(false)
          return
        }
        await registrarDispositivo(cred.user.uid, huella)
      }

      await crearPerfilEnServidor(
        cred.user,
        cred.user.displayName || '',
        cred.user.email || '',
        referido
      )
      router.push('/dashboard')
    } catch {
      setError('Error al iniciar con Google. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const puntosBonus  = referido && refValido ? 800 : 500

  return (
    <main style={{background:'#0A0E1A', minHeight:'100vh', color:'#F9FAFB', fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        .input-field { width:100%; background:#0F1520; border:1px solid #374151; border-radius:10px; padding:13px 16px; color:#F9FAFB; font-size:14px; transition:all .2s; font-family:Inter,sans-serif; outline:none; }
        .input-field:focus { border-color:#00FF88; box-shadow:0 0 0 3px rgba(0,255,136,0.08); }
        .btn-google:hover { background:#1F2937 !important; }
        .btn-submit:hover { background:#00cc6a !important; transform:translateY(-1px); }
      `}</style>

      {/* NAVBAR */}
      <nav style={{height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,14,26,0.97)'}}>
        <Link href="/" style={{textDecoration:'none', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'22px', color:'#F9FAFB', letterSpacing:'1px'}}>
          SCORE<span style={{color:'#00FF88'}}>BET</span>
        </Link>
        <Link href="/" style={{fontSize:'13px', color:'#9CA3AF', textDecoration:'none'}}>← Volver</Link>
      </nav>

      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative'}}>
        <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,136,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.03) 1px,transparent 1px)', backgroundSize:'48px 48px'}}/>
        <div style={{position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', background:'radial-gradient(ellipse, rgba(0,255,136,.08) 0%, transparent 70%)', pointerEvents:'none'}}/>

        <div style={{position:'relative', width:'100%', maxWidth:'440px', animation:'fadeIn .4s ease'}}>

          {/* Banner referido detectado desde URL */}
          {refDesdeURL && (
            <div style={{marginBottom:'16px', padding:'14px 18px', borderRadius:'12px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', display:'flex', alignItems:'center', gap:'12px'}}>
              <span style={{fontSize:'24px'}}>🎁</span>
              <div>
                <div style={{fontSize:'14px', fontWeight:700, color:'#00FF88', marginBottom:'2px'}}>Invitacion detectada</div>
                <div style={{fontSize:'12px', color:'#9CA3AF'}}>
                  Codigo: <span style={{fontFamily:'JetBrains Mono,monospace', color:'#00FF88', fontWeight:700}}>{refDesdeURL.toUpperCase()}</span>
                  {refValido === true  && <span style={{color:'#00FF88', marginLeft:'8px'}}>✅ Valido</span>}
                  {refValido === false && <span style={{color:'#EF4444', marginLeft:'8px'}}>❌ Invalido</span>}
                </div>
              </div>
            </div>
          )}

          <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'36px 32px', boxShadow:'0 24px 80px rgba(0,0,0,0.4)'}}>

            {/* Logo */}
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <div style={{fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'28px', letterSpacing:'1px', marginBottom:'6px'}}>
                SCORE<span style={{color:'#00FF88'}}>BET</span>
              </div>
              <p style={{fontSize:'14px', color:'#9CA3AF'}}>
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
              </p>
            </div>

            {/* Tabs */}
            <div style={{display:'flex', background:'#0F1520', borderRadius:'10px', padding:'4px', marginBottom:'24px'}}>
              {(['login','register'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all .2s', background:mode===m?'#1F2937':'transparent', color:mode===m?'#F9FAFB':'#6B7280', fontFamily:'Inter,sans-serif'}}>
                  {m === 'login' ? 'Iniciar sesion' : 'Registrarse'}
                </button>
              ))}
            </div>

            {/* Google */}
            <button onClick={handleGoogle} className="btn-google" disabled={loading}
              style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'13px', borderRadius:'10px', background:'#0F1520', border:'1px solid #374151', color:'#F9FAFB', fontSize:'14px', fontWeight:500, cursor:'pointer', marginBottom:'20px', transition:'all .2s', fontFamily:'Inter,sans-serif', opacity:loading?0.7:1}}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.8 29.3 5 24 5 13 5 4 14 4 24s9 19 20 19 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.8 29.3 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 43c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 34.3 26.8 35 24 35c-5.2 0-9.6-3.3-11.3-8H6.4C9.8 38.4 16.4 43 24 43z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l6.2 5.2C41.5 35.3 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              Continuar con Google
            </button>

            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
              <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.07)'}}/>
              <span style={{fontSize:'12px', color:'#4B5563'}}>o con email</span>
              <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.07)'}}/>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>

              {mode === 'register' && (
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>NOMBRE</label>
                  <input className="input-field" type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)}/>
                </div>
              )}

              <div>
                <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>EMAIL</label>
                <input className="input-field" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
              </div>

              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF'}}>CONTRASENA</label>
                  {mode === 'login' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); handleResetPassword(); }} style={{fontSize:'12px', color:'#6B7280', textDecoration:'none', cursor:'pointer'}}>Olvidaste tu contrasena?</a>
                  )}
                </div>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>
                    CODIGO REFERIDO
                    {refDesdeURL
                      ? <span style={{color:'#00FF88', marginLeft:'8px', fontSize:'11px', fontWeight:400}}>✅ Autocompletado</span>
                      : <span style={{color:'#4B5563', fontWeight:400, marginLeft:'4px'}}>(opcional)</span>
                    }
                  </label>
                  <div style={{position:'relative'}}>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Ej: ABC12345"
                      value={referido}
                      onChange={e => setReferido(e.target.value.toUpperCase().slice(0,8))}
                      style={{
                        fontFamily:'JetBrains Mono,monospace',
                        letterSpacing:'2px',
                        borderColor: referido.length === 8
                          ? refValido === true  ? '#00FF88'
                          : refValido === false ? '#EF4444'
                          : '#374151'
                          : '#374151',
                        paddingRight: '36px',
                      }}
                    />
                    {referido.length === 8 && (
                      <span style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'16px'}}>
                        {refValido === true ? '✅' : refValido === false ? '❌' : '⏳'}
                      </span>
                    )}
                  </div>
                  {referido.length === 8 && refValido === false && (
                    <p style={{fontSize:'11px', color:'#EF4444', marginTop:'5px'}}>❌ Codigo no encontrado. Verifica que sea correcto.</p>
                  )}
                  {referido.length === 8 && refValido === true && (
                    <p style={{fontSize:'11px', color:'#00FF88', marginTop:'5px'}}>✅ Codigo valido — Tu y tu referido reciben +300 pts</p>
                  )}
                  {!referido && (
                    <p style={{fontSize:'11px', color:'#6B7280', marginTop:'5px'}}>Si alguien te invito ingresa su codigo aqui</p>
                  )}
                </div>
              )}

              {error && (
                <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', color:'#EF4444'}}>
                  ⚠️ {error}
                </div>
              )}

              {resetMsg && (
                <div style={{background:'rgba(0,255,136,0.1)', border:'1px solid rgba(0,255,136,0.3)', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', color:'#00FF88'}}>
                  ✅ {resetMsg}
                </div>
              )}

              <button onClick={handleEmail} disabled={loading} className="btn-submit"
                style={{width:'100%', padding:'14px', borderRadius:'10px', background:'#00FF88', color:'#0A0E1A', fontWeight:700, fontSize:'15px', border:'none', cursor:loading?'not-allowed':'pointer', transition:'all .2s', fontFamily:'Inter,sans-serif', opacity:loading?0.8:1}}>
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta gratis'}
              </button>
            </div>

            {mode === 'register' && (
              <div style={{marginTop:'16px', background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={{fontSize:'20px'}}>🎁</span>
                <div>
                  <div style={{fontSize:'13px', fontWeight:600, color:'#00FF88'}}>
                    {puntosBonus.toLocaleString()} puntos de bienvenida
                    {referido && refValido && <span style={{fontSize:'11px', color:'#9CA3AF', marginLeft:'6px'}}>(500 + 300 bonus)</span>}
                  </div>
                  <div style={{fontSize:'11px', color:'#6B7280'}}>Se acreditan al crear tu cuenta</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <main style={{background:'#0A0E1A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#F9FAFB', fontFamily:'Inter,sans-serif'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'Rajdhani,sans-serif', fontSize:'28px', fontWeight:700}}>SCORE<span style={{color:'#00FF88'}}>BET</span></div>
          <div style={{fontSize:'14px', color:'#6B7280', marginTop:'8px'}}>Cargando...</div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
