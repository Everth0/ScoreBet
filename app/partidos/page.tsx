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
import { getPartidosNFLFormateados } from '@/lib/nflApi'
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
    partidosNFL,
  ] = await Promise.all([
    getPartidosHoy(),
    getPartidosSemana(),
    getPartidosEnVivo(),
    getResultados(),
    getPartidosCompeticion(COMPS.mundial),
    getPartidosNBAFormateados(),
    getPartidosMLBFormateados(),
    getPartidosNFLFormateados(),
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

  // Ayuda para saber si un partido de cualquier disciplina es de HOY (zona horaria Bolivia)
  function esHoyBolivia(utcDate: string) {
    if (!utcDate) return false
    const fechaPartido = new Date(utcDate).toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' })
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' })
    return fechaPartido === hoy
  }

  // EN VIVO: combina partidos en vivo de TODAS las disciplinas
  const partidosVivosTodos = [
    ...partidosVivos,
    ...partidosNBA.filter((p: any) => p.live),
    ...partidosMLB.filter((p: any) => p.live),
  ]

  // HOY: combina partidos de hoy de TODAS las disciplinas (incluye los que ya estan en vivo)
  const partidosHoyTodos = [
    ...partidosHoy,
    ...partidosNBA.filter((p: any) => esHoyBolivia(p.utcDate)),
    ...partidosMLB.filter((p: any) => esHoyBolivia(p.utcDate)),
  ]

  const categorias = [
    {
      id:      'vivo',
      label:   '🔴 En Vivo',
      color:   '#EF4444',
      partidos: partidosVivosTodos,
      badge:   partidosVivosTodos.length,
    },
    {
      id:      'hoy',
      label:   '📅 Hoy',
      color:   '#F59E0B',
      partidos: partidosHoyTodos,
      badge:   partidosHoyTodos.length,
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
      id:      'nfl',
      label:   '🏈 NFL',
      color:   '#F59E0B',
      partidos: partidosNFL,
      badge:   partidosNFL.length,
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
