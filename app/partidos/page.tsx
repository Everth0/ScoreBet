import {
  getEventosHoy,
  getEventosHoyDeporte,
  getEventsByLeague,
  getEventsPastLeague,
  LEAGUES,
  formatearPartido,
} from '@/lib/sportsApi'
import PartidosClient from './PartidosClient'

export const revalidate = 120

export default async function Partidos() {
  const [
    hoyFutbol,
    hoyBasket,
    proxPremier,
    proxLaLiga,
    proxSerieA,
    proxBundes,
    proxChampions,
    proxLibertadores,
    proxAmistosos,
    proxCopaAm,
    recientes,
  ] = await Promise.all([
    getEventosHoy(),
    getEventosHoyDeporte('Basketball'),
    getEventsByLeague(LEAGUES.premierLeague),
    getEventsByLeague(LEAGUES.laLiga),
    getEventsByLeague(LEAGUES.serieA),
    getEventsByLeague(LEAGUES.bundesliga),
    getEventsByLeague(LEAGUES.championsLeague),
    getEventsByLeague(LEAGUES.libertadores),
    getEventsByLeague(LEAGUES.amistosos),
    getEventsByLeague(LEAGUES.copaAmerica),
    getEventsPastLeague(LEAGUES.premierLeague),
  ])

  // Partidos de hoy — separar selecciones de clubes
  const todosHoy = hoyFutbol
    .map(formatearPartido)
    .filter(Boolean)

  const seleccionesHoy = todosHoy.filter((p: any) => p.esSeleccion)
  const clubesHoy      = todosHoy.filter((p: any) => !p.esSeleccion)

  // Proximos partidos de selecciones
  const seleccionesProx = [
    ...proxAmistosos,
    ...proxCopaAm,
  ].map(formatearPartido).filter(Boolean).slice(0, 16)

  // Proximos de clubes
  const clubesProx = [
    ...proxPremier, ...proxLaLiga, ...proxSerieA,
    ...proxBundes,  ...proxChampions, ...proxLibertadores,
  ].map(formatearPartido).filter(Boolean).slice(0, 20)

  // Basket de hoy
  const basketHoy = hoyBasket
    .map(formatearPartido)
    .filter(Boolean)
    .slice(0, 10)

  const categorias = [
    {
      id: 'hoy',
      label: '📅 Hoy',
      color: '#EF4444',
      partidos: todosHoy.slice(0, 20),
      badge: todosHoy.length,
    },
    {
      id: 'selecciones',
      label: '🌍 Selecciones',
      color: '#F59E0B',
      partidos: [...seleccionesHoy, ...seleccionesProx].slice(0, 20),
      badge: seleccionesHoy.length + seleccionesProx.length,
    },
    {
      id: 'clubes',
      label: '⚽ Clubes',
      color: '#00FF88',
      partidos: [...clubesHoy, ...clubesProx].slice(0, 20),
      badge: clubesHoy.length + clubesProx.length,
    },
    {
      id: 'basket',
      label: '🏀 Basket',
      color: '#8B5CF6',
      partidos: basketHoy,
      badge: basketHoy.length,
    },
  ]

  const resultadosRecientes = recientes
    .map(formatearPartido)
    .filter(Boolean)
    .slice(0, 8)

  return <PartidosClient categorias={categorias} resultados={resultadosRecientes} />
}
