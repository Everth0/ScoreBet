import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
const BDL_HEADERS = { Authorization: BDL_KEY }

const HIGHLIGHTLY_BASE = 'https://american-football.highlightly.net'
const HIGHLIGHTLY_KEY  = process.env.HIGHLIGHTLY_NFL_KEY || ''

const MAX_FUTBOL_LOOKUPS_POR_RUN = 8
const MAX_BDL_LOOKUPS_POR_RUN    = 15

type Tipo = 'futbol' | 'mlb' | 'nba' | 'nfl'

type PartidoResuelto = {
  id: string
  tipo: Tipo
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

async function getPartidoIndividual(tipo: Tipo, idCrudo: string): Promise<PartidoIndividual> {
  try {
    if (tipo === 'futbol') {
      const res = await fetch(`${FD_BASE}/matches/${idCrudo}`, { headers: FD_HEADERS })
      if (!res.ok) return { status: null, scoreHome: null, scoreAway: null }
      const data = await res.json()
      return {
        status: data.status ?? null,
        scoreHome: data.score?.fullTime?.home ?? null,
        scoreAway: data.score?.fullTime?.away ?? null,
      }
    }
    if (tipo === 'mlb') {
      const res = await fetch(`${BDL_BASE}/mlb/v1/games/${idCrudo}`, { headers: BDL_HEADERS })
      if (!res.ok) {
        const cuerpo = await res.text().catch(() => '')
        console.log(`BDL mlb/${idCrudo} respondio ${res.status}: ${cuerpo.slice(0,200)}`)
        return { status: null, scoreHome: null, scoreAway: null }
      }
      const json = await res.json()
      const g = json.data ?? json
      return {
        status: g.status ?? null,
        scoreHome: g.home_team_data?.runs ?? null,
        scoreAway: g.away_team_data?.runs ?? null,
      }
    }
    if (tipo === 'nba') {
      const res = await fetch(`${BDL_BASE}/nba/v1/games/${idCrudo}`, { headers: BDL_HEADERS })
      if (!res.ok) {
        const cuerpo = await res.text().catch(() => '')
        console.log(`BDL nba/${idCrudo} respondio ${res.status}: ${cuerpo.slice(0,200)}`)
        return { status: null, scoreHome: null, scoreAway: null }
      }
      const json = await res.json()
      const g = json.data ?? json
      return {
        status: g.status ?? null,
        scoreHome: g.home_team_score ?? null,
        scoreAway: g.visitor_team_score ?? null,
      }
    }
    return { status: null, scoreHome: null, scoreAway: null }
  } catch {
    return { status: null, scoreHome: null, scoreAway: null }
  }
}

function esFinal(tipo: Tipo, status: string | null): boolean {
  if (!status) return false
  if (tipo === 'futbol') return status === 'FINISHED'
  if (tipo === 'mlb') return status === 'STATUS_FINAL'
  if (tipo === 'nba') return status === 'Final'
  return false
}

function esAplazadoOCancelado(tipo: Tipo, status: string | null): boolean {
  if (!status) return false
  const s = status.toUpperCase()
  if (tipo === 'futbol') return ['POSTPONED', 'SUSPENDED', 'CANCELLED'].includes(s)
  // balldontlie no confirma nomenclatura exacta para pospuestos, se detecta por texto generico
  return s.includes('POSTPON') || s.includes('CANCEL') || s.includes('SUSPEND')
}

// ---------- FUTBOL (bulk) ----------
async function getFinalizadosFutbol(): Promise<PartidoResuelto[]> {
  try {
    const hoy = new Date()
    const hace5dias = new Date()
    hace5dias.setDate(hoy.getDate() - 5)
    const dateFrom = hace5dias.toISOString().split('T')[0]
    const dateTo   = hoy.toISOString().split('T')[0]
    const res  = await fetch(`${FD_BASE}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}&limit=100`, { headers: FD_HEADERS })
    const data = await res.json()
    if (data.errorCode || !data.matches) return []
    return data.matches.map((p: any) => ({
      id: String(p.id),
      tipo: 'futbol' as const,
      scoreHome: p.score?.fullTime?.home ?? null,
      scoreAway: p.score?.fullTime?.away ?? null,
    }))
  } catch { return [] }
}

// ---------- MLB (bulk) ----------
async function getFinalizadosMLB(): Promise<PartidoResuelto[]> {
  try {
    const fechas = fechasRango(5)
    const url = new URL(`${BDL_BASE}/mlb/v1/games`)
    fechas.forEach(f => url.searchParams.append('dates[]', f))
    const res = await fetch(url.toString(), { headers: BDL_HEADERS })
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

// ---------- NBA (bulk) ----------
async function getFinalizadosNBA(): Promise<PartidoResuelto[]> {
  try {
    const fechas = fechasRango(5)
    const url = new URL(`${BDL_BASE}/nba/v1/games`)
    fechas.forEach(f => url.searchParams.append('dates[]', f))
    const res = await fetch(url.toString(), { headers: BDL_HEADERS })
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

// ---------- NFL (bulk) ----------
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
        return { id: `nfl_${g.id}`, tipo: 'nfl' as const, scoreHome, scoreAway }
      })
  } catch { return [] }
}

function determinarResultado(tipo: Tipo, scoreHome: number | null, scoreAway: number | null): '1' | 'X' | '2' | null {
  if (scoreHome === null || scoreAway === null) return null
  if (scoreHome > scoreAway) return '1'
  if (scoreHome === scoreAway) return tipo === 'futbol' ? 'X' : null
  return '2'
}

function idCrudo(tipo: Tipo, partidoId: string): string {
  if (tipo === 'futbol') return partidoId
  return partidoId.replace(/^(mlb|nba|nfl)_/, '')
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (authHeader !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const db = getFirestore()

    const [futbolBulk, mlbBulk, nbaBulk, nfl] = await Promise.all([
      getFinalizadosFutbol(),
      getFinalizadosMLB(),
      getFinalizadosNBA(),
      getFinalizadosNFL(),
    ])
    const bulkPorTipo: Record<Tipo, PartidoResuelto[]> = {
      futbol: futbolBulk, mlb: mlbBulk, nba: nbaBulk, nfl,
    }
    console.log(`Bulk: futbol=${futbolBulk.length} mlb=${mlbBulk.length} nba=${nbaBulk.length} nfl=${nfl.length}`)

    const apuestasSnap = await db.collection('apuestas').where('estado', '==', 'pendiente').get()
    console.log(`Apuestas pendientes: ${apuestasSnap.size}`)

    // Agrupar por partido unico (tipo + id) para minimizar llamadas
    const grupos = new Map<string, { tipo: Tipo; partidoId: string; docs: any[] }>()
    for (const doc of apuestasSnap.docs) {
      const partidoId = String(doc.data().partidoId)
      const tipo: Tipo = partidoId.startsWith('mlb_') ? 'mlb' : partidoId.startsWith('nba_') ? 'nba' : partidoId.startsWith('nfl_') ? 'nfl' : 'futbol'
      const key = `${tipo}:${partidoId}`
      const g = grupos.get(key) || { tipo, partidoId, docs: [] }
      g.docs.push(doc)
      grupos.set(key, g)
    }

    // Separar los que ya se encuentran en el bulk vs los que necesitan consulta individual
    const pendientesIndividual: { tipo: Tipo; partidoId: string; docs: any[] }[] = []
    const resueltosPorBulk: { grupo: typeof grupos extends Map<any, infer V> ? V : never; partido: PartidoResuelto }[] = []

    for (const g of grupos.values()) {
      const encontrado = bulkPorTipo[g.tipo].find(p => p.id === g.partidoId)
      if (encontrado) {
        resueltosPorBulk.push({ grupo: g, partido: encontrado })
      } else if (g.tipo === 'nfl') {
        console.log(`SKIP partido ${g.partidoId}: no encontrado en NFL (sin consulta individual disponible)`)
      } else {
        pendientesIndividual.push(g)
      }
    }

    let futbolLookups = 0
    let bdlLookups = 0
    const resultadosIndividual = new Map<string, PartidoIndividual>()

    for (const g of pendientesIndividual) {
      const key = `${g.tipo}:${g.partidoId}`
      if (g.tipo === 'futbol') {
        if (futbolLookups >= MAX_FUTBOL_LOOKUPS_POR_RUN) continue
        futbolLookups++
      } else {
        if (bdlLookups >= MAX_BDL_LOOKUPS_POR_RUN) continue
        bdlLookups++
      }
      const info = await getPartidoIndividual(g.tipo, idCrudo(g.tipo, g.partidoId))
      resultadosIndividual.set(key, info)
    }

    let resueltasGanadas  = 0
    let resueltasPerdidas = 0
    let marcadasAplazadas = 0
    const batch = db.batch()

    function procesarApuesta(apuestaDoc: any, tipo: Tipo, scoreHome: number | null, scoreAway: number | null) {
      const apuesta = apuestaDoc.data()
      const resultadoReal = determinarResultado(tipo, scoreHome, scoreAway)
      if (!resultadoReal) {
        console.log(`SKIP apuesta ${apuestaDoc.id}: resultado nulo (scoreHome=${scoreHome}, scoreAway=${scoreAway})`)
        return
      }
      const seleccionUsuario = apuesta.seleccion?.match(/\(([1X2])\)/)?.[1]
      if (!seleccionUsuario) {
        console.log(`SKIP apuesta ${apuestaDoc.id}: no se pudo extraer selección de "${apuesta.seleccion}"`)
        return
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
        batch.update(apuestaDoc.ref, { estado: 'ganada', resultadoReal, fechaResolucion: Timestamp.now() })
        resueltasGanadas++
      } else {
        batch.update(apuestaDoc.ref, { estado: 'perdida', resultadoReal, fechaResolucion: Timestamp.now() })
        batch.update(db.collection('users').doc(apuesta.userId), { totalApuestas: FieldValue.increment(1) })
        resueltasPerdidas++
      }
    }

    for (const { grupo, partido } of resueltosPorBulk) {
      for (const doc of grupo.docs) procesarApuesta(doc, grupo.tipo, partido.scoreHome, partido.scoreAway)
    }

    for (const g of pendientesIndividual) {
      const key = `${g.tipo}:${g.partidoId}`
      const info = resultadosIndividual.get(key)
      if (!info) {
        console.log(`ESPERA partido ${g.partidoId} (${g.tipo}): se consultara en la proxima corrida`)
        continue
      }
      if (esAplazadoOCancelado(g.tipo, info.status)) {
        for (const doc of g.docs) {
          if (!doc.data().partidoAplazado) {
            batch.update(doc.ref, { partidoAplazado: true, estadoPartido: info.status })
            marcadasAplazadas++
          }
        }
        console.log(`APLAZADO partido ${g.partidoId} (status=${info.status}), afecta a ${g.docs.length} apuesta(s)`)
        continue
      }
      if (!esFinal(g.tipo, info.status)) {
        console.log(`SKIP partido ${g.partidoId}: aun no termina (status=${info.status}), afecta a ${g.docs.length} apuesta(s)`)
        continue
      }
      for (const doc of g.docs) procesarApuesta(doc, g.tipo, info.scoreHome, info.scoreAway)
    }

    await batch.commit()

    return NextResponse.json({
      ok: true,
      resueltasGanadas,
      resueltasPerdidas,
      marcadasAplazadas,
      fecha: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error resolviendo apuestas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
