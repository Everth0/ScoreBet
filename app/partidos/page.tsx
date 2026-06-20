import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { getEventsByLeague, getEventsPastLeague, LEAGUES, formatearPartido } from '@/lib/sportsApi'
import PartidosClient from './PartidosClient'

export const revalidate = 300

export default async function Partidos() {
  const [
    premierNext, laLigaNext, serieANext,
    bundesNext,  champNext,  liberNext,
    premierPast,
  ] = await Promise.all([
    getEventsByLeague(LEAGUES.premierLeague),
    getEventsByLeague(LEAGUES.laLiga),
    getEventsByLeague(LEAGUES.serieA),
    getEventsByLeague(LEAGUES.bundesliga),
    getEventsByLeague(LEAGUES.championsLeague),
    getEventsByLeague(LEAGUES.libertadores),
    getEventsPastLeague(LEAGUES.premierLeague),
  ])

  const proximos = [
    ...premierNext, ...laLigaNext, ...serieANext,
    ...bundesNext,  ...champNext,  ...liberNext,
  ].slice(0, 20).map(formatearPartido)

  const recientes = premierPast.slice(0, 6).map(formatearPartido)

  return <PartidosClient proximos={proximos} recientes={recientes} />
}
