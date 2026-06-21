import { db } from './firebase'
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
  serverTimestamp, increment
} from 'firebase/firestore'
import { sendEmailVerification, User } from 'firebase/auth'

// ═══════════════════════════════════════
// 1. VERIFICAR EMAIL
// ═══════════════════════════════════════
export async function verificarEmail(user: User) {
  if (!user.emailVerified) {
    await sendEmailVerification(user)
    return false
  }
  return true
}

// ═══════════════════════════════════════
// 2. HUELLA DIGITAL DEL DISPOSITIVO
// ═══════════════════════════════════════
export function generarHuellaDispositivo(): string {
  const nav = window.navigator
  const screen = window.screen
  const datos = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency,
    screen.width,
    screen.height,
    screen.colorDepth,
    nav.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.cookieEnabled,
    typeof window.localStorage,
  ].join('|')

  // Hash simple
  let hash = 0
  for (let i = 0; i < datos.length; i++) {
    const char = datos.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// ═══════════════════════════════════════
// 3. VERIFICAR SI DISPOSITIVO YA EXISTE
// ═══════════════════════════════════════
export async function verificarDispositivo(
  userId: string,
  huella: string
): Promise<{ permitido: boolean; razon?: string }> {
  try {
    // Buscar si esta huella ya está registrada por otro usuario
    const q = query(
      collection(db, 'dispositivos'),
      where('huella', '==', huella)
    )
    const snap = await getDocs(q)

    if (!snap.empty) {
      const dispositivo = snap.docs[0].data()
      if (dispositivo.userId !== userId) {
        return {
          permitido: false,
          razon: 'Este dispositivo ya tiene una cuenta registrada'
        }
      }
    }

    // Registrar dispositivo
    await setDoc(doc(db, 'dispositivos', `${userId}_${huella}`), {
      userId,
      huella,
      ultimaVez: serverTimestamp(),
    }, { merge: true })

    return { permitido: true }
  } catch {
    return { permitido: true } // Si falla no bloqueamos
  }
}

// ═══════════════════════════════════════
// 4. DETECTAR VPN / PROXY
// ═══════════════════════════════════════
export async function detectarVPN(): Promise<boolean> {
  try {
    const res = await fetch('https://vpnapi.io/api/?key=free')
    if (!res.ok) return false
    const data = await res.json()
    return data.security?.vpn || data.security?.proxy || data.security?.tor || false
  } catch {
    return false
  }
}

// ═══════════════════════════════════════
// 5. DETECTAR EMULADOR
// ═══════════════════════════════════════
export function detectarEmulador(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  const señalesEmulador = [
    'android sdk',
    'sdk_gphone',
    'emulator',
    'genymotion',
    'bluestacks',
    'nox',
    'memu',
    'ldplayer',
  ]
  return señalesEmulador.some(s => ua.includes(s))
}

// ═══════════════════════════════════════
// 6. DETECTAR CLICS FRAUDULENTOS EN ADS
// ═══════════════════════════════════════
export async function verificarClicAnuncio(userId: string): Promise<{
  permitido: boolean
  razon?: string
}> {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { permitido: false, razon: 'Usuario no encontrado' }

  const data = snap.data()
  const ahora = Date.now()

  // Verificar tiempo entre clics (minimo 3 minutos entre anuncios)
  const ultimoClic = data.ultimoAnuncio?.toMillis() || 0
  const minutosPasados = (ahora - ultimoClic) / 1000 / 60

  if (minutosPasados < 3) {
    return {
      permitido: false,
      razon: `Espera ${Math.ceil(3 - minutosPasados)} minutos antes del siguiente anuncio`
    }
  }

  // Verificar limite diario
  if ((data.adsHoy || 0) >= 10) {
    return {
      permitido: false,
      razon: 'Limite diario de 10 anuncios alcanzado'
    }
  }

  // Verificar clics sospechosos (mas de 20 en una hora)
  const clicsUltimaHora = data.clicsUltimaHora || 0
  const inicioHora = data.inicioConteoHora?.toMillis() || 0

  if (ahora - inicioHora < 3600000 && clicsUltimaHora >= 20) {
    return {
      permitido: false,
      razon: 'Actividad sospechosa detectada. Cuenta suspendida temporalmente.'
    }
  }

  return { permitido: true }
}

// ═══════════════════════════════════════
// 7. ANTIGÜEDAD MÍNIMA 30 DÍAS
// ═══════════════════════════════════════
export function verificarAntiguedad(fechaRegistro: any): {
  permitido: boolean
  diasRestantes?: number
} {
  if (!fechaRegistro) return { permitido: false, diasRestantes: 30 }

  const registro = fechaRegistro.toMillis
    ? fechaRegistro.toMillis()
    : new Date(fechaRegistro).getTime()

  const diasTranscurridos = (Date.now() - registro) / 1000 / 60 / 60 / 24
  const diasRestantes = Math.ceil(30 - diasTranscurridos)

  if (diasTranscurridos < 30) {
    return { permitido: false, diasRestantes }
  }
  return { permitido: true }
}

// ═══════════════════════════════════════
// 8. ACTIVIDAD MÍNIMA ANTES DE CANJEAR
// ═══════════════════════════════════════
export function verificarActividad(userData: any): {
  permitido: boolean
  razon?: string
  progreso?: any
} {
  const requisitos = {
    anunciosVistos:    { minimo: 50,   actual: userData.puntosHistorico > 0 ? Math.floor(userData.puntosHistorico / 50) : 0, label: 'Anuncios vistos' },
    apuestasRealizadas:{ minimo: 10,   actual: userData.totalApuestas || 0, label: 'Apuestas realizadas' },
    diasActivo:        { minimo: 30,   actual: Math.floor((Date.now() - (userData.fechaRegistro?.toMillis?.() || Date.now())) / 86400000), label: 'Dias activo' },
    puntosMinimos:     { minimo: 50000, actual: userData.puntosActuales || 0, label: 'Puntos acumulados' },
  }

  const faltantes = Object.entries(requisitos)
    .filter(([_, v]) => v.actual < v.minimo)
    .map(([_, v]) => `${v.label}: ${v.actual}/${v.minimo}`)

  if (faltantes.length > 0) {
    return {
      permitido: false,
      razon: `Requisitos pendientes:\n${faltantes.join('\n')}`,
      progreso: requisitos,
    }
  }

  return { permitido: true, progreso: requisitos }
}

// ═══════════════════════════════════════
// 9. VERIFICACIÓN COMPLETA AL CANJEAR
// ═══════════════════════════════════════
export async function verificacionCompleta(
  user: User,
  userData: any
): Promise<{ permitido: boolean; razon?: string }> {

  // 1. Email verificado
  if (!user.emailVerified) {
    return {
      permitido: false,
      razon: 'Debes verificar tu correo electronico antes de canjear'
    }
  }

  // 2. Antiguedad 30 dias
  const antiguedad = verificarAntiguedad(userData.fechaRegistro)
  if (!antiguedad.permitido) {
    return {
      permitido: false,
      razon: `Tu cuenta debe tener al menos 30 dias. Faltan ${antiguedad.diasRestantes} dias.`
    }
  }

  // 3. Actividad minima
  const actividad = verificarActividad(userData)
  if (!actividad.permitido) {
    return { permitido: false, razon: actividad.razon }
  }

  // 4. VPN
  const tieneVPN = await detectarVPN()
  if (tieneVPN) {
    return {
      permitido: false,
      razon: 'No se permiten canjes con VPN o Proxy activo'
    }
  }

  // 5. Emulador
  if (detectarEmulador()) {
    return {
      permitido: false,
      razon: 'No se permiten canjes desde emuladores'
    }
  }

  return { permitido: true }
}
