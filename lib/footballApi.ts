const BASE    = 'https://api.football-data.org/v4'
const TOKEN   = process.env.FOOTBALL_DATA_TOKEN || ''
const HEADERS = { 'X-Auth-Token': TOKEN }

async function fetchFD(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: HEADERS,
      next: { revalidate: 120 },
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// Codigos de competicion disponibles en plan free
export const COMPS = {
  mundial:    'WC',    // FIFA World Cup
  champions:  'CL',   // UEFA Champions League
  premier:    'PL',   // Premier League
  laLiga:     'PD',   // Primera Division
  serieA:     'SA',   // Serie A
  bundesliga: 'BL1',  // Bundesliga
  ligue1:     'FL1',  // Ligue 1
  eurocopa:   'EC',   // European Championship
  brasileirao:'BSA',  // Brasileirao
  eredivisie: 'DED',  // Eredivisie
  portugal:   'PPL',  // Primeira Liga
}

// Partidos de hoy de todas las competiciones
export async function getPartidosHoy() {
  const hoy = new Date().toISOString().split('T')[0]
  const data = await fetchFD(`/matches?date=${hoy}`)
  return data?.matches || []
}

// Partidos de esta semana
export async function getPartidosSemana() {
  const hoy    = new Date()
  const fin    = new Date()
  fin.setDate(fin.getDate() + 7)
  const desde  = hoy.toISOString().split('T')[0]
  const hasta  = fin.toISOString().split('T')[0]
  const data   = await fetchFD(`/matches?dateFrom=${desde}&dateTo=${hasta}`)
  return data?.matches || []
}

// Partidos de una competicion especifica
export async function getPartidosCompeticion(codigo: string) {
  const data = await fetchFD(`/competitions/${codigo}/matches?status=SCHEDULED&limit=20`)
  return data?.matches || []
}

// Partidos en vivo
export async function getPartidosEnVivo() {
  const data = await fetchFD(`/matches?status=IN_PLAY`)
  return data?.matches || []
}

// Partidos recientes (resultados)
export async function getResultados() {
  const data = await fetchFD(`/matches?status=FINISHED&limit=20`)
  return data?.matches || []
}

// Standings de una competicion
export async function getStandings(codigo: string) {
  const data = await fetchFD(`/competitions/${codigo}/standings`)
  return data?.standings || []
}

export function generarCuotas(partido: any) {
  const seed = parseInt((partido.id || 1000).toString().slice(-4)) / 9999
  const homeRank = partido.homeTeam?.position || 5
  const awayRank = partido.awayTeam?.position || 5
  const diff = (awayRank - homeRank) / 20

  const local  = Math.max(1.15, parseFloat((1.50 + diff + seed * 0.5).toFixed(2)))
  const empate = Math.max(2.60, parseFloat((3.10 + seed * 0.8).toFixed(2)))
  const visita = Math.max(1.15, parseFloat((1.50 - diff + (1-seed) * 0.5).toFixed(2)))

  return [local, empate, visita]
}

export function formatearPartidoFD(p: any) {
  if (!p) return null
  const cuotas = generarCuotas(p)
  const esVivo = p.status === 'IN_PLAY' || p.status === 'PAUSED'
  const esFinalizado = p.status === 'FINISHED'

  // Detectar si es seleccion nacional
  const esSeleccion = (
    p.competition?.code === 'WC'  ||
    p.competition?.code === 'EC'  ||
    p.competition?.name?.includes('World Cup') ||
    p.competition?.name?.includes('European Championship') ||
    p.competition?.name?.includes('Nations League') ||
    p.competition?.name?.includes('Copa America') ||
    p.competition?.type === 'CUP' && p.area?.code !== p.homeTeam?.area?.code
  )

  return {
    id:           String(p.id),
    league:       p.competition?.name || 'Liga',
    leagueCode:   p.competition?.code || '',
    leagueFlag:   p.area?.flag || '',
    leagueLogo:   p.competition?.emblem || '',
    home:         p.homeTeam?.shortName || p.homeTeam?.name || 'Local',
    homeFull:     p.homeTeam?.name || 'Local',
    homeBadge:    p.homeTeam?.crest || '',
    away:         p.awayTeam?.shortName || p.awayTeam?.name || 'Visitante',
    awayFull:     p.awayTeam?.name || 'Visitante',
    awayBadge:    p.awayTeam?.crest || '',
    scoreHome:    esFinalizado || esVivo ? p.score?.fullTime?.home : null,
    scoreAway:    esFinalizado || esVivo ? p.score?.fullTime?.away : null,
    scoreHT:      p.score?.halfTime,
    minuto:       p.minute || '',
    time:         p.utcDate ? new Date(p.utcDate).toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit', timeZone:'America/La_Paz'}) : '',
    date:         p.utcDate ? new Date(p.utcDate).toLocaleDateString('es', {day:'2-digit', month:'short', timeZone:'America/La_Paz'}) : '',
    utcDate:      p.utcDate || '',
    status:       p.status || '',
    live:         esVivo,
    finalizado:   esFinalizado,
    esSeleccion,
    venue:        p.venue || '',
    jornada:      p.matchday || '',
    odds: [
      { label:'1', val: cuotas[0] },
      { label:'X', val: cuotas[1] },
      { label:'2', val: cuotas[2] },
    ],
  }
}
