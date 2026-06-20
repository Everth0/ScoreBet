import { getEventsByLeague, getEventsPastLeague, LEAGUES, formatearPartido } from '@/lib/sportsApi'
import PartidosClient from './PartidosClient'

export const revalidate = 300

export default async function Partidos() {
  const [
    mundial,
    copaAmerica,
    eurocopa,
    amistosos,
    premier,
    laLiga,
    serieA,
    bundesliga,
    champions,
    libertadores,
    nba,
    resultados,
  ] = await Promise.all([
    getEventsByLeague(LEAGUES.mundial2026),
    getEventsByLeague(LEAGUES.copaAmerica),
    getEventsByLeague(LEAGUES.eurocopa),
    getEventsByLeague(LEAGUES.amistososInter),
    getEventsByLeague(LEAGUES.premierLeague),
    getEventsByLeague(LEAGUES.laLiga),
    getEventsByLeague(LEAGUES.serieA),
    getEventsByLeague(LEAGUES.bundesliga),
    getEventsByLeague(LEAGUES.championsLeague),
    getEventsByLeague(LEAGUES.libertadores),
    getEventsByLeague(LEAGUES.nba),
    getEventsPastLeague(LEAGUES.mundial2026),
  ])

  const categorias = [
    {
      id: 'mundial',
      label: '🏆 Mundial 2026',
      color: '#F59E0B',
      partidos: mundial.slice(0,12).map(formatearPartido),
    },
    {
      id: 'selecciones',
      label: '🌎 Selecciones',
      color: '#3B82F6',
      partidos: [
        ...copaAmerica,
        ...eurocopa,
        ...amistosos,
      ].slice(0,16).map(formatearPartido),
    },
    {
      id: 'clubes',
      label: '⚽ Clubes Europa',
      color: '#00FF88',
      partidos: [
        ...premier, ...laLiga, ...serieA,
        ...bundesliga, ...champions, ...libertadores,
      ].slice(0,16).map(formatearPartido),
    },
    {
      id: 'otros',
      label: '🏀 Otros deportes',
      color: '#8B5CF6',
      partidos: nba.slice(0,8).map(formatearPartido),
    },
  ]

  const resultadosMundial = resultados.slice(0,8).map(formatearPartido)

  return <PartidosClient categorias={categorias} resultados={resultadosMundial} />
}
