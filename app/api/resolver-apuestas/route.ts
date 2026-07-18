import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const BASE    = 'https://api.football-data.org/v4'
const TOKEN   = process.env.FOOTBALL_DATA_TOKEN || ''
const HEADERS = { 'X-Auth-Token': TOKEN }

async function getPartidosFinalizados() {
  try {
    const hoy = new Date()
    const hace5dias = new Date()
    hace5dias.setDate(hoy.getDate() - 5)
    const dateFrom = hace5dias.toISOString().split('T')[0]
    const dateTo   = hoy.toISOString().split('T')[0]
    const res  = await fetch(`${BASE}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100`, { headers: HEADERS })
    const data = await res.json()
    if (data.errorCode || !data.matches) {
      console.log('DEBUG error football-data:', JSON.stringify(data))
      return []
    }
    return data.matches
  } catch (e) { console.log('DEBUG fetch error:', e); return [] }
}

function determinarResultado(partido: any): '1' | 'X' | '2' | null {
  const home = partido.score?.fullTime?.home
  const away = partido.score?.fullTime?.away
  if (home === null || away === null) return null
  if (home > away)  return '1'
  if (home === away) return 'X'
  return '2'
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  console.log('DEBUG authHeader:', JSON.stringify(authHeader))
  console.log('DEBUG expected:', JSON.stringify(expected))
  console.log('DEBUG match:', authHeader === expected)
  if (authHeader !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const db = getFirestore()

    // Obtener partidos finalizados de la API
    const partidos = await getPartidosFinalizados()
    console.log(`Partidos finalizados encontrados: ${partidos.length}`)

    // Obtener apuestas pendientes
    const apuestasSnap = await db
      .collection('apuestas')
      .where('estado', '==', 'pendiente')
      .get()

    console.log(`Apuestas pendientes: ${apuestasSnap.size}`)

    let resueltasGanadas  = 0
    let resueltasPerdidas = 0
    const batch = db.batch()

    for (const apuestaDoc of apuestasSnap.docs) {
      const apuesta = apuestaDoc.data()

      // Buscar el partido correspondiente
      const partido = partidos.find((p: any) =>
        String(p.id) === String(apuesta.partidoId)
      )

      if (!partido) continue

      const resultadoReal = determinarResultado(partido)
      if (!resultadoReal) continue

      // Extraer la seleccion del usuario (1, X o 2)
      const seleccionUsuario = apuesta.seleccion?.match(/\(([1X2])\)/)?.[1]
      if (!seleccionUsuario) continue

      const gano = seleccionUsuario === resultadoReal

      if (gano) {
        // Dar puntos al usuario
        const userRef = db.collection('users').doc(apuesta.userId)
        batch.update(userRef, {
          puntosActuales:     require('firebase-admin/firestore').FieldValue.increment(apuesta.gananciasPosibles),
          puntosHistorico:    require('firebase-admin/firestore').FieldValue.increment(apuesta.gananciasPosibles),
          totalApuestas:      require('firebase-admin/firestore').FieldValue.increment(1),
          apuestasGanadas:    require('firebase-admin/firestore').FieldValue.increment(1),
          apuestasGanadasMes: require('firebase-admin/firestore').FieldValue.increment(1),
        })
        batch.update(apuestaDoc.ref, {
          estado:          'ganada',
          resultadoReal,
          fechaResolucion: require('firebase-admin/firestore').Timestamp.now(),
        })
        resueltasGanadas++
      } else {
        batch.update(apuestaDoc.ref, {
          estado:          'perdida',
          resultadoReal,
          fechaResolucion: require('firebase-admin/firestore').Timestamp.now(),
        })
        batch.update(db.collection('users').doc(apuesta.userId), {
          totalApuestas: require('firebase-admin/firestore').FieldValue.increment(1),
        })
        resueltasPerdidas++
      }
    }

    await batch.commit()

    return NextResponse.json({
      ok:               true,
      resueltasGanadas,
      resueltasPerdidas,
      fecha:            new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error resolviendo apuestas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
