import {
  getPartidosHoy,
  getPartidosSemana,
  getPartidosEnVivo,
  getResultados,
  getPartidosCompeticion,
  COMPS,
  formatearPartidoFD,
} from '@/lib/footballApi'
import { getPartidosNBAFormateados } from '@/lib/nbaApi'
import { getPartidosMLBFormateados } from '@/lib/mlbApi'
import PartidosClient from './PartidosClient'

export const revalidate = 120

export default async function Partidos() {
  const [
    hoy,
    semana,
    enVivo,
    resultados,
    mundial,
    partidosNBA,
    partidosMLB,
  ] = await Promise.all([
    getPartidosHoy(),
    getPartidosSemana(),
    getPartidosEnVivo(),
    getResultados(),
    getPartidosCompeticion(COMPS.mundial),
    getPartidosNBAFormateados(),
    getPartidosMLBFormateados(),
  ])

  const formatear = (arr: any[]) =>
    arr.map(formatearPartidoFD).filter(Boolean)

  const partidosHoy     = formatear(hoy)
  const partidosVivos   = formatear(enVivo)
  const partidosSemana  = formatear(semana)
  const partidosMundial = formatear(mundial)
  const partidosResult  = formatear(resultados)

  // Todos los partidos de futbol juntos (selecciones + clubes), sin duplicados
  const idsVistos = new Set<string>()
  const partidosFutbol = [...partidosHoy, ...partidosSemana, ...partidosMundial].filter((p: any) => {
    if (idsVistos.has(p.id)) return false
    idsVistos.add(p.id)
    return true
  }).slice(0, 40)

  const categorias = [
    {
      id:      'vivo',
      label:   '🔴 En Vivo',
      color:   '#EF4444',
      partidos: partidosVivos,
      badge:   partidosVivos.length,
    },
    {
      id:      'hoy',
      label:   '📅 Hoy',
      color:   '#F59E0B',
      partidos: partidosHoy,
      badge:   partidosHoy.length,
    },
    {
      id:      'futbol',
      label:   '⚽ Futbol',
      color:   '#00FF88',
      partidos: partidosFutbol,
      badge:   partidosFutbol.length,
    },
    {
      id:      'nba',
      label:   '🏀 NBA',
      color:   '#F59E0B',
      partidos: partidosNBA,
      badge:   partidosNBA.length,
    },
    {
      id:      'mlb',
      label:   '⚾ MLB',
      color:   '#F59E0B',
      partidos: partidosMLB,
      badge:   partidosMLB.length,
    },
    {
      id:      'resultados',
      label:   '✅ Resultados',
      color:   '#6B7280',
      partidos: partidosResult,
      badge:   partidosResult.length,
    },
  ]

  return <PartidosClient categorias={categorias} />
}
