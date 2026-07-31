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

const HIGHLIGHTLY_BASE = 'https://american-football.highlightly.net'
const HIGHLIGHTLY_KEY  = process.env.HIGHLIGHTLY_NFL_KEY || ''

type PartidoResuelto = {
  id: string
  tipo: 'futbol' | 'mlb' | 'nba' | 'nfl'
  scoreHome: number | null
  scoreAway: number | null
}

type PartidoIndividual = {
  status: string | null
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

// Consulta individual y directa por ID (evita el limite/paginacion de la lista masiva)
async function getPartidoFutbolIndividual(id: string): Promise<PartidoIndividual> {
  try {
    const res = await fetch(`${FD_BASE}/matches/${id}`, { headers: FD_HEADERS })
    if (!res.ok) return { status: null, scoreHome: null, scoreAway: null }
    const data = await res.json()
    return {
      status: data.status ?? null,
      scoreHome: data.score?.fullTime?.home ?? null,
      scoreAway: data.score?.fullTime?.away ?? null,
    }
  } catch {
    return { status: null, scoreHome: null, scoreAway: null }
  }
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

// ---------- NFL ----------
async function getFinalizadosNFL(): Promise<PartidoResuelto[]> {
  try {
    const hoy = new Date()
    const mes = hoy.getMonth() + 1
    const temporada = mes >= 3 ? hoy.getFullYear() : hoy.getFullYear() - 1
    const res = await fetch(`${HIGHLIGHTLY_BASE}/matches?league=NFL&season=${temporada}`, {
      headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY },
    })
    if (!res.ok) return []
    const data = await res.json()
    const juegos = data.data || []
    return juegos
      .filter((g: any) => g.state?.description === 'Finished')
      .map((g: any) => {
        const partes = String(g.state?.score?.current || '').split(' - ').map((s: string) => parseInt(s.trim(), 10))
        const [scoreHome, scoreAway] = partes.length === 2 && !partes.some(isNaN) ? partes : [null, null]
        return {
          id: `nfl_${g.id}`,
          tipo: 'nfl' as const,
          scoreHome,
          scoreAway,
        }
      })
  } catch { return [] }
}

function determinarResultado(tipo: PartidoResuelto['tipo'], scoreHome: number | null, scoreAway: number | null): '1' | 'X' | '2' | null {
  if (scoreHome === null || scoreAway === null) return null
  if (scoreHome > scoreAway) return '1'
  if (scoreHome === scoreAway) return tipo === 'futbol' ? 'X' : null
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

    const [mlb, nba, nfl] = await Promise.all([
      getFinalizadosMLB(),
      getFinalizadosNBA(),
      getFinalizadosNFL(),
    ])
    const partidosNoFutbol = [...mlb, ...nba, ...nfl]
    console.log(`Partidos finalizados: mlb=${mlb.length} nba=${nba.length} nfl=${nfl.length} (futbol se consulta individualmente)`)

    const apuestasSnap = await db
      .collection('apuestas')
      .where('estado', '==', 'pendiente')
      .get()

    console.log(`Apuestas pendientes: ${apuestasSnap.size}`)

    let resueltasGanadas  = 0
    let resueltasPerdidas = 0
    let marcadasAplazadas = 0
    const batch = db.batch()

    for (const apuestaDoc of apuestasSnap.docs) {
      const apuesta = apuestaDoc.data()
      const partidoId = String(apuesta.partidoId)
      const esFutbol = !partidoId.match(/^(mlb|nba|nfl)_/)

      let tipo: PartidoResuelto['tipo']
      let scoreHome: number | null = null
      let scoreAway: number | null = null

      if (esFutbol) {
        tipo = 'futbol'
        const individual = await getPartidoFutbolIndividual(partidoId)
        if (individual.status === 'POSTPONED' || individual.status === 'SUSPENDED' || individual.status === 'CANCELLED') {
          if (!apuesta.partidoAplazado) {
            batch.update(apuestaDoc.ref, { partidoAplazado: true, estadoPartido: individual.status })
            marcadasAplazadas++
            console.log(`APLAZADO apuesta ${apuestaDoc.id}: partido ${partidoId} status=${individual.status}`)
          }
          continue
        }
        if (individual.status !== 'FINISHED') {
          console.log(`SKIP apuesta ${apuestaDoc.id}: partido ${partidoId} aun no termina (status=${individual.status})`)
          continue
        }
        scoreHome = individual.scoreHome
        scoreAway = individual.scoreAway
      } else {
        const partido = partidosNoFutbol.find((p) => p.id === partidoId)
        if (!partido) {
          console.log(`SKIP apuesta ${apuestaDoc.id}: no se encontró partido con partidoId=${partidoId}`)
          continue
        }
        tipo = partido.tipo
        scoreHome = partido.scoreHome
        scoreAway = partido.scoreAway
      }

      const resultadoReal = determinarResultado(tipo, scoreHome, scoreAway)
      if (!resultadoReal) {
        console.log(`SKIP apuesta ${apuestaDoc.id}: resultado nulo para partido ${partidoId} (scoreHome=${scoreHome}, scoreAway=${scoreAway})`)
        continue
      }

      const seleccionUsuario = apuesta.seleccion?.match(/\(([1X2])\)/)?.[1]
      if (!seleccionUsuario) {
        console.log(`SKIP apuesta ${apuestaDoc.id}: no se pudo extraer selección de "${apuesta.seleccion}"`)
        continue
      }

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
      marcadasAplazadas,
      fecha:            new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error resolviendo apuestas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
