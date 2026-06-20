const BASE = 'https://www.thesportsdb.com/api/v1/json/3'

async function fetchEvents(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const data = await res.json()
    return data.events || []
  } catch { return [] }
}

export async function getEventsByLeague(leagueId: string) {
  return fetchEvents(`${BASE}/eventsnextleague.php?id=${leagueId}`)
}

export async function getEventsPastLeague(leagueId: string) {
  return fetchEvents(`${BASE}/eventspastleague.php?id=${leagueId}`)
}

export async function getLiveEvents() {
  return fetchEvents(`${BASE}/liveevents.php`)
}

// ═══════════════════════════════════════
// LIGAS Y TORNEOS
// ═══════════════════════════════════════
export const LEAGUES = {
  // 🌍 Selecciones — Mundiales
  mundial2026:       '4967',   // FIFA World Cup 2026
  mundialQualEuropa: '4480',   // UEFA World Cup Qualifiers
  mundialQualConca:  '4346',   // CONCACAF Qualifiers
  mundialQualSud:    '4415',   // CONMEBOL Qualifiers

  // 🌎 Selecciones — Copas continentales
  copaAmerica:       '4415',   // Copa America
  eurocopa:          '4480',   // UEFA Euro
  goldCup:           '4346',   // Gold Cup CONCACAF
  africaCup:         '4452',   // Africa Cup of Nations
  asianCup:          '4454',   // AFC Asian Cup

  // 📅 Selecciones — Fecha FIFA / Amistosos
  amistososInter:    '4399',   // International Friendlies

  // ⚽ Clubes — Europa
  premierLeague:     '4328',
  laLiga:            '4335',
  serieA:            '4332',
  bundesliga:        '4331',
  ligue1:            '4334',
  championsLeague:   '4480',
  europaLeague:      '4481',

  // 🌎 Clubes — Sudamérica
  libertadores:      '4415',
  sudamericana:      '4416',

  // 🏀 Otros deportes
  nba:               '4387',
  nfl:               '4391',
}

export function generarCuotas(evento: any) {
  const seed = (evento.idEvent || '123').slice(-4)
  const n = parseInt(seed) / 9999
  const local  = parseFloat((1.40 + n * 3.0).toFixed(2))
  const empate = parseFloat((2.80 + n * 1.8).toFixed(2))
  const visita = parseFloat((1.40 + (1-n) * 3.0).toFixed(2))
  return [local, empate, visita]
}

export function formatearPartido(evento: any) {
  const cuotas = generarCuotas(evento)
  const scoreHome = evento.intHomeScore
  const scoreAway = evento.intAwayScore
  const tieneScore = scoreHome !== null && scoreHome !== undefined && scoreHome !== ''

  return {
    id:        evento.idEvent,
    league:    evento.strLeague || 'Internacional',
    leagueBadge: evento.strLeagueBadge || '',
    home:      evento.strHomeTeam || 'Local',
    away:      evento.strAwayTeam || 'Visitante',
    homeBadge: evento.strHomeTeamBadge || '',
    awayBadge: evento.strAwayTeamBadge || '',
    scoreHome: tieneScore ? scoreHome : null,
    scoreAway: tieneScore ? scoreAway : null,
    time:      evento.strTime     || '00:00',
    date:      evento.dateEvent   || '',
    venue:     evento.strVenue    || '',
    country:   evento.strCountry  || '',
    live:      evento.strProgress ? true : false,
    progress:  evento.strProgress || '',
    status:    evento.strStatus   || '',
    odds: [
      { label:'1', val: cuotas[0] },
      { label:'X', val: cuotas[1] },
      { label:'2', val: cuotas[2] },
    ],
  }
}
