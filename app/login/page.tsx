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
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode]         = useState<'login'|'register'>('register')
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [referido, setReferido] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Leer codigo de referido de la URL automaticamente
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferido(ref.toUpperCase())
      setMode('register')
    }
  }, [searchParams])

  async function buscarUidPorCodigo(codigo: string): Promise<string | null> {
    try {
      // El codigo de referido es los primeros 8 caracteres del UID en mayusculas
      const { collection, getDocs } = await import('firebase/firestore')
      const snap = await getDocs(collection(db, 'users'))
      for (const docSnap of snap.docs) {
        const uid = docSnap.id
        if (uid.slice(0, 8).toUpperCase() === codigo.toUpperCase()) {
          return uid
        }
      }
      return null
    } catch { return null }
  }

  async function crearPerfilUsuario(uid: string, nombre: string, email: string, codigoReferido = '') {
    const ref  = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      let referidoPorUid = ''

      // Buscar UID del referidor por su codigo
      if (codigoReferido) {
        const uidReferidor = await buscarUidPorCodigo(codigoReferido)
        if (uidReferidor) {
          referidoPorUid = uidReferidor
          // Dar bonus al referidor
          await updateDoc(doc(db, 'users', uidReferidor), {
            puntosActuales:  increment(300),
            puntosHistorico: increment(300),
            totalReferidos:  increment(1),
          })
        }
      }

      // Crear perfil del nuevo usuario
      await setDoc(ref, {
        uid,
        nombre,
        email,
        puntosActuales:  codigoReferido && referidoPorUid ? 800 : 500, // 500 bienvenida + 300 bonus referido
        puntosHistorico: codigoReferido && referidoPorUid ? 800 : 500,
        adsHoy:          0,
        referidoPor:     referidoPorUid || '',
        codigoReferido:  codigoReferido || '',
        totalReferidos:  0,
        totalApuestas:   0,
        fechaRegistro:   serverTimestamp(),
      })
    }
  }

  async function handleEmail() {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!nombre.trim()) { setError('Por favor ingresa tu nombre'); setLoading(false); return }
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName: nombre })
        await sendEmailVerification(cred.user)
        await crearPerfilUsuario(cred.user.uid, nombre, email, referido)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/dashboard')
    } catch(e: any) {
      const msgs: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya esta registrado',
        'auth/invalid-email':        'Email invalido',
        'auth/weak-password':        'La contrasena debe tener al menos 6 caracteres',
        'auth/user-not-found':       'Usuario no encontrado',
        'auth/wrong-password':       'Contrasena incorrecta',
        'auth/invalid-credential':   'Email o contrasena incorrectos',
      }
      setError(msgs[e.code] || 'Ocurrio un error. Intenta de nuevo.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await crearPerfilUsuario(cred.user.uid, cred.user.displayName || '', cred.user.email || '', referido)
      router.push('/dashboard')
    } catch {
      setError('Error al iniciar con Google.')
    }
    setLoading(false)
  }

  const refDesdeURL = searchParams.get('ref')

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

      <nav style={{height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(10,14,26,0.97)'}}>
        <Link href="/" style={{textDecoration:'none', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'22px', color:'#F9FAFB', letterSpacing:'1px'}}>
          SCORE<span style={{color:'#00FF88'}}>BET</span>
        </Link>
        <Link href="/" style={{fontSize:'13px', color:'#9CA3AF', textDecoration:'none'}}>← Volver al inicio</Link>
      </nav>

      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative'}}>
        <div style={{position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,136,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,.03) 1px,transparent 1px)', backgroundSize:'48px 48px'}}/>
        <div style={{position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'300px', background:'radial-gradient(ellipse, rgba(0,255,136,.08) 0%, transparent 70%)', pointerEvents:'none'}}/>

        <div style={{position:'relative', width:'100%', maxWidth:'440px', animation:'fadeIn .4s ease'}}>

          {/* Banner referido detectado */}
          {refDesdeURL && (
            <div style={{marginBottom:'16px', padding:'14px 18px', borderRadius:'12px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.25)', display:'flex', alignItems:'center', gap:'12px'}}>
              <span style={{fontSize:'24px'}}>🎁</span>
              <div>
                <div style={{fontSize:'14px', fontWeight:700, color:'#00FF88', marginBottom:'2px'}}>Invitacion detectada!</div>
                <div style={{fontSize:'12px', color:'#9CA3AF'}}>Codigo: <span style={{fontFamily:'JetBrains Mono,monospace', color:'#00FF88', fontWeight:700}}>{refDesdeURL.toUpperCase()}</span> — Recibes +300 pts extra</div>
              </div>
            </div>
          )}

          <div style={{background:'#111827', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'40px 36px', boxShadow:'0 24px 80px rgba(0,0,0,0.4)'}}>

            <div style={{textAlign:'center', marginBottom:'28px'}}>
              <div style={{fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'28px', letterSpacing:'1px', marginBottom:'8px'}}>
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
                <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>CONTRASENA</label>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{fontSize:'12px', fontWeight:600, color:'#9CA3AF', display:'block', marginBottom:'6px'}}>
                    CODIGO REFERIDO
                    {refDesdeURL && <span style={{color:'#00FF88', marginLeft:'8px', fontSize:'11px'}}>✅ Detectado automaticamente</span>}
                    {!refDesdeURL && <span style={{color:'#4B5563', fontWeight:400, marginLeft:'4px'}}>(opcional)</span>}
                  </label>
                  <input className="input-field" type="text" placeholder="Ej: ABC12345"
                    value={referido}
                    onChange={e => setReferido(e.target.value.toUpperCase())}
                    style={{background: referido ? 'rgba(0,255,136,0.05)' : '#0F1520', borderColor: referido ? 'rgba(0,255,136,0.3)' : '#374151'}}
                  />
                  {referido && (
                    <p style={{fontSize:'11px', color:'#00FF88', marginTop:'6px'}}>
                      ⚡ Tu y tu referido reciben +300 puntos extra
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'12px 14px', fontSize:'13px', color:'#EF4444'}}>
                  ⚠️ {error}
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
                    {referido ? '800 puntos de bienvenida (500 + 300 bonus)' : '500 puntos de bienvenida'}
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
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
