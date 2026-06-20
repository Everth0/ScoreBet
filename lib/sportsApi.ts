const BASE = 'https://www.thesportsdb.com/api/v1/json/3'

export async function getLiveEvents() {
  try {
    const res = await fetch(`${BASE}/liveevents.php`, { next: { revalidate: 60 } })
    const data = await res.json()
    return data.events || []
  } catch { return [] }
}

export async function getEventsByLeague(leagueId: string) {
  try {
    const res = await fetch(`${BASE}/eventsnextleague.php?id=${leagueId}`, { next: { revalidate: 300 } })
    const data = await res.json()
    return data.events || []
  } catch { return [] }
}

export async function getEventsPastLeague(leagueId: string) {
  try {
    const res = await fetch(`${BASE}/eventspastleague.php?id=${leagueId}`, { next: { revalidate: 300 } })
    const data = await res.json()
    return data.events || []
  } catch { return [] }
}

// Ligas principales
export const LEAGUES = {
  premierLeague:    '4328',
  laLiga:           '4335',
  serieA:           '4332',
  bundesliga:       '4331',
  championsLeague:  '4480',
  libertadores:     '4415',
  nba:              '4387',
  nfl:              '4391',
}

export function generarCuotas(evento: any) {
  const seed = (evento.idEvent || '123').slice(-3)
  const n = parseInt(seed) / 999
  const local   = parseFloat((1.5 + n * 2.5).toFixed(2))
  const empate  = parseFloat((2.8 + n * 1.5).toFixed(2))
  const visita  = parseFloat((1.5 + (1 - n) * 2.5).toFixed(2))
  return [local, empate, visita]
}

export function formatearPartido(evento: any) {
  const cuotas = generarCuotas(evento)
  return {
    id:        evento.idEvent,
    league:    evento.strLeague || 'Liga',
    home:      evento.strHomeTeam || 'Local',
    away:      evento.strAwayTeam || 'Visitante',
    homeIcon:  evento.strHomeTeamBadge || '⚽',
    awayIcon:  evento.strAwayTeamBadge || '⚽',
    scoreHome: evento.intHomeScore,
    scoreAway: evento.intAwayScore,
    time:      evento.strTime || evento.dateEvent || '',
    date:      evento.dateEvent || '',
    live:      evento.strProgress ? true : false,
    progress:  evento.strProgress || '',
    status:    evento.strStatus || '',
    odds:      [
      { label:'1', val: cuotas[0] },
      { label:'X', val: cuotas[1] },
      { label:'2', val: cuotas[2] },
    ],
  }
}
