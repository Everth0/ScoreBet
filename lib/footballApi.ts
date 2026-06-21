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

export const COMPS = {
  mundial:    'WC',
  champions:  'CL',
  premier:    'PL',
  laLiga:     'PD',
  serieA:     'SA',
  bundesliga: 'BL1',
  ligue1:     'FL1',
  eurocopa:   'EC',
  brasileirao:'BSA',
  eredivisie: 'DED',
  portugal:   'PPL',
}

export async function getPartidosHoy() {
  const hoy = new Date().toISOString().split('T')[0]
  const data = await fetchFD(`/matches?date=${hoy}`)
  return data?.matches || []
}

export async function getPartidosSemana() {
  const hoy = new Date()
  const fin  = new Date()
  fin.setDate(fin.getDate() + 7)
  const desde = hoy.toISOString().split('T')[0]
  const hasta = fin.toISOString().split('T')[0]
  const data  = await fetchFD(`/matches?dateFrom=${desde}&dateTo=${hasta}`)
  return data?.matches || []
}

export async function getPartidosCompeticion(codigo: string) {
  const data = await fetchFD(`/competitions/${codigo}/matches?status=SCHEDULED&limit=20`)
  return data?.matches || []
}

export async function getPartidosEnVivo() {
  const data = await fetchFD(`/matches?status=IN_PLAY`)
  return data?.matches || []
}

export async function getResultados() {
  const data = await fetchFD(`/matches?status=FINISHED&limit=20`)
  return data?.matches || []
}

const RANKING_FIFA: Record<string, number> = {
  'Argentina':      1,
  'France':         2,
  'England':        3,
  'Belgium':        4,
  'Brazil':         5,
  'Portugal':       6,
  'Netherlands':    7,
  'Spain':          8,
  'Germany':        9,
  'Croatia':        10,
  'Italy':          11,
  'Morocco':        12,
  'Japan':          13,
  'United States':  14,
  'Senegal':        15,
  'Uruguay':        16,
  'Denmark':        17,
  'Mexico':         18,
  'Switzerland':    19,
  'Colombia':       20,
  'Ecuador':        21,
  'Australia':      22,
  'South Korea':    23,
  'Tunisia':        24,
  'Poland':         25,
  'Serbia':         26,
  'Chile':          27,
  'Hungary':        28,
  'Turkey':         29,
  'Ukraine':        30,
  'Sweden':         31,
  'Austria':        32,
  'Peru':           33,
  'Czech Republic': 34,
  'Cameroon':       35,
  'Canada':         36,
  'Costa Rica':     37,
  'Ghana':          38,
  'Iran':           39,
  'Qatar':          40,
  'Saudi Arabia':   55,
  'Cape Verde':     65,
  'Bolivia':        80,
  'Panama':         70,
  'Honduras':       75,
  'Jamaica':        72,
  'Cuba':           90,
}

function getRanking(equipo: string): number {
  for (const [nombre, rank] of Object.entries(RANKING_FIFA)) {
    if (equipo.toLowerCase().includes(nombre.toLowerCase()) ||
        nombre.toLowerCase().includes(equipo.toLowerCase())) {
      return rank
    }
  }
  return 50
}

// Cuotas fijas segun diferencia de ranking
// El equipo debil siempre tiene cuota 2.00 o 2.10
// El favorito tiene cuota baja segun nivel
export function generarCuotasRealistas(partido: any) {
  const homeTeam = partido.homeTeam?.name || partido.homeTeam?.shortName || ''
  const awayTeam = partido.awayTeam?.name || partido.awayTeam?.shortName || ''

  const rankHome = getRanking(homeTeam)
  const rankAway = getRanking(awayTeam)
  const diff = rankAway - rankHome

  // Cuota del debil siempre es 2.00 o 2.10
  const cuotaDebil = [2.00, 2.10][Math.floor(Math.random() * 2)]

  let local: number
  let empate: number
  let visita: number

  if (diff >= 40) {
    // Local muy superior — España vs Cabo Verde
    local  = 1.15
    empate = 4.50
    visita = cuotaDebil        // 2.00 o 2.10
  } else if (diff >= 25) {
    // Local superior — Brazil vs Bolivia
    local  = 1.25
    empate = 4.00
    visita = cuotaDebil        // 2.00 o 2.10
  } else if (diff >= 15) {
    // Local favorito — France vs Morocco
    local  = 1.40
    empate = 3.60
    visita = cuotaDebil        // 2.00 o 2.10
  } else if (diff >= 5) {
    // Ligera ventaja local
    local  = 1.65
    empate = 3.20
    visita = cuotaDebil        // 2.00 o 2.10
  } else if (diff >= -5) {
    // Muy parejo — Argentina vs France
    local  = cuotaDebil        // 2.00 o 2.10
    empate = 3.10
    visita = cuotaDebil        // 2.00 o 2.10
  } else if (diff >= -15) {
    // Visita ligero favorito
    local  = cuotaDebil        // 2.00 o 2.10
    empate = 3.20
    visita = 1.65
  } else if (diff >= -25) {
    // Visita favorita
    local  = cuotaDebil        // 2.00 o 2.10
    empate = 4.00
    visita = 1.25
  } else {
    // Visita muy superior
    local  = cuotaDebil        // 2.00 o 2.10
    empate = 4.50
    visita = 1.15
  }

  return [local, empate, visita]
}

export function formatearPartidoFD(p: any) {
  if (!p) return null
  const cuotas       = generarCuotasRealistas(p)
  const esVivo       = p.status === 'IN_PLAY' || p.status === 'PAUSED'
  const esFinalizado = p.status === 'FINISHED'

  const esSeleccion = (
    p.competition?.code === 'WC' ||
    p.competition?.code === 'EC' ||
    p.competition?.name?.includes('World Cup') ||
    p.competition?.name?.includes('European Championship') ||
    p.competition?.name?.includes('Nations League') ||
    p.competition?.name?.includes('Copa America') ||
    p.competition?.type === 'CUP'
  )

  return {
    id:          String(p.id),
    league:      p.competition?.name || 'Liga',
    leagueCode:  p.competition?.code || '',
    leagueLogo:  p.competition?.emblem || '',
    home:        p.homeTeam?.shortName || p.homeTeam?.name || 'Local',
    homeFull:    p.homeTeam?.name || 'Local',
    homeBadge:   p.homeTeam?.crest || '',
    away:        p.awayTeam?.shortName || p.awayTeam?.name || 'Visitante',
    awayFull:    p.awayTeam?.name || 'Visitante',
    awayBadge:   p.awayTeam?.crest || '',
    scoreHome:   esFinalizado || esVivo ? p.score?.fullTime?.home : null,
    scoreAway:   esFinalizado || esVivo ? p.score?.fullTime?.away : null,
    minuto:      p.minute || '',
    time:        p.utcDate ? new Date(p.utcDate).toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit', timeZone:'America/La_Paz'}) : '',
    date:        p.utcDate ? new Date(p.utcDate).toLocaleDateString('es', {day:'2-digit', month:'short', timeZone:'America/La_Paz'}) : '',
    utcDate:     p.utcDate || '',
    status:      p.status || '',
    live:        esVivo,
    finalizado:  esFinalizado,
    esSeleccion,
    jornada:     p.matchday || '',
    odds: [
      { label:'1', val: cuotas[0] },
      { label:'X', val: cuotas[1] },
      { label:'2', val: cuotas[2] },
    ],
  }
}
