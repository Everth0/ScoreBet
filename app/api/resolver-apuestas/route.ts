import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const FD_BASE   = 'https://api.football-data.org/v4'
const FD_TOKEN  = process.env.FOOTBALL_DATA_TOKEN || ''
const FD_HEADERS = { 'X-Auth-Token': FD_TOKEN }

const BDL_BASE = 'https://api.balldontlie.io'
const BDL_KEY  = process.env.BALLDONTLIE_API_KEY || ''

type PartidoResuelto = {
  id: string
  tipo: 'futbol' | 'mlb' | 'nba'
  scoreHome: number | null
  scoreAway: number | null
}

function fechasRango(diasAtras: number): string[] {
  const fechas: string[] = []
  for (let i = 0; i <= diasAtras; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    fechas.push(d.toISOString().split('T')[0])
  }
  return fechas
}

// ---------- FUTBOL ----------
async function getFinalizadosFutbol(): Promise<PartidoResuelto[]> {
  try {
    const hoy = new Date()
    const hace5dias = new Date()
    hace5dias.setDate(hoy.getDate() - 5)
    const dateFrom = hace5dias.toISOString().split('T')[0]
    const dateTo   = hoy.toISOString().split('T')[0]
    const res  = await fetch(`${FD_BASE}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100`, { headers: FD_HEADERS })
    const data = await res.json()
    if (data.errorCode || !data.matches) {
      return []
    }
    return data.matches.map((p: any) => ({
      id: String(p.id),
      tipo: 'futbol' as const,
      scoreHome: p.score?.fullTime?.home ?? null,
      scoreAway: p.score?.fullTime?.away ?? null,
    }))
  } catch { return [] }
}

// ---------- MLB ----------
async function getFinalizadosMLB(): Promise<PartidoResuelto[]> {
  try {
    const fechas = fechasRango(5)
    const url = new URL(`${BDL_BASE}/mlb/v1/games`)
    fechas.forEach(f => url.searchParams.append('dates[]', f))
    const res = await fetch(url.toString(), { headers: { Authorization: BDL_KEY } })
    if (!res.ok) return []
    const data = await res.json()
    const juegos = data.data || []
    return juegos
      .filter((g: any) => g.status === 'STATUS_FINAL')
      .map((g: any) => ({
        id: `mlb_${g.id}`,
        tipo: 'mlb' as const,
        scoreHome: g.home_team_data?.runs ?? null,
        scoreAway: g.away_team_data?.runs ?? null,
      }))
  } catch { return [] }
}

// ---------- NBA ----------
async function getFinalizadosNBA(): Promise<PartidoResuelto[]> {
  try {
    const fechas = fechasRango(5)
    const url = new URL(`${BDL_BASE}/nba/v1/games`)
    fechas.forEach(f => url.searchParams.append('dates[]', f))
    const res = await fetch(url.toString(), { headers: { Authorization: BDL_KEY } })
    if (!res.ok) return []
    const data = await res.json()
    const juegos = data.data || []
    return juegos
      .filter((g: any) => g.status === 'Final')
      .map((g: any) => ({
        id: `nba_${g.id}`,
        tipo: 'nba' as const,
        scoreHome: g.home_team_score ?? null,
        scoreAway: g.visitor_team_score ?? null,
      }))
  } catch { return [] }
}

function determinarResultado(p: PartidoResuelto): '1' | 'X' | '2' | null {
  if (p.scoreHome === null || p.scoreAway === null) return null
  if (p.scoreHome > p.scoreAway) return '1'
  if (p.scoreHome === p.scoreAway) return p.tipo === 'futbol' ? 'X' : null // MLB/NBA no tienen empate
  return '2'
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (authHeader !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const db = getFirestore()

    const [futbol, mlb, nba] = await Promise.all([
      getFinalizadosFutbol(),
      getFinalizadosMLB(),
      getFinalizadosNBA(),
    ])
    const partidos = [...futbol, ...mlb, ...nba]
    console.log(`Partidos finalizados: futbol=${futbol.length} mlb=${mlb.length} nba=${nba.length}`)

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

      const partido = partidos.find((p) => p.id === String(apuesta.partidoId))

      if (!partido) continue

      const resultadoReal = determinarResultado(partido)
      if (!resultadoReal) continue

      const seleccionUsuario = apuesta.seleccion?.match(/\(([1X2])\)/)?.[1]
      if (!seleccionUsuario) continue

      const gano = seleccionUsuario === resultadoReal

      if (gano) {
        const userRef = db.collection('users').doc(apuesta.userId)
        batch.update(userRef, {
          puntosActuales:     FieldValue.increment(apuesta.gananciasPosibles),
          puntosHistorico:    FieldValue.increment(apuesta.gananciasPosibles),
          totalApuestas:      FieldValue.increment(1),
          apuestasGanadas:    FieldValue.increment(1),
          apuestasGanadasMes: FieldValue.increment(1),
        })
        batch.update(apuestaDoc.ref, {
          estado:          'ganada',
          resultadoReal,
          fechaResolucion: Timestamp.now(),
        })
        resueltasGanadas++
      } else {
        batch.update(apuestaDoc.ref, {
          estado:          'perdida',
          resultadoReal,
          fechaResolucion: Timestamp.now(),
        })
        batch.update(db.collection('users').doc(apuesta.userId), {
          totalApuestas: FieldValue.increment(1),
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
