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
  ] = await Promise.all([
    getPartidosHoy(),
    getPartidosSemana(),
    getPartidosEnVivo(),
    getResultados(),
    getPartidosCompeticion(COMPS.mundial),
    getPartidosNBAFormateados(),
  ])

  const formatear = (arr: any[]) =>
    arr.map(formatearPartidoFD).filter(Boolean)

  const partidosHoy     = formatear(hoy)
  const partidosVivos   = formatear(enVivo)
  const partidosSemana  = formatear(semana)
  const partidosMundial = formatear(mundial)
  const partidosResult  = formatear(resultados)

  const seleccionesHoy  = partidosHoy.filter((p: any) => p.esSeleccion)
  const clubesHoy       = partidosHoy.filter((p: any) => !p.esSeleccion)
  const seleccionesSem  = partidosSemana.filter((p: any) => p.esSeleccion)

  const categorias = [
    {
      id:      'nba',
      label:   '🏀 NBA',
      color:   '#F59E0B',
      partidos: partidosNBA,
      badge:   partidosNBA.length,
    },
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
      id:      'mundial',
      label:   '🏆 Mundial 2026',
      color:   '#F59E0B',
      partidos: [...partidosMundial, ...seleccionesSem].slice(0, 20),
      badge:   partidosMundial.length,
    },
    {
      id:      'selecciones',
      label:   '🌍 Selecciones',
      color:   '#3B82F6',
      partidos: [...seleccionesHoy, ...seleccionesSem].slice(0, 20),
      badge:   seleccionesHoy.length + seleccionesSem.length,
    },
    {
      id:      'clubes',
      label:   '⚽ Clubes',
      color:   '#00FF88',
      partidos: clubesHoy,
      badge:   clubesHoy.length,
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
