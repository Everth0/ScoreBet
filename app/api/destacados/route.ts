import { NextResponse } from 'next/server'
import { getPartidosHoy, getPartidosSemana, formatearPartidoFD } from '@/lib/footballApi'

export const revalidate = 300

export async function GET() {
  try {
    const hoy = await getPartidosHoy()
    let formateados = hoy.map(formatearPartidoFD).filter(Boolean)

    // Si hay pocos partidos hoy, completar con los de la semana
    if (formateados.length < 3) {
      const semana = await getPartidosSemana()
      const extra = semana.map(formatearPartidoFD).filter(Boolean)
      const idsExistentes = new Set(formateados.map((p: any) => p.id))
      for (const p of extra) {
        if (!idsExistentes.has(p.id)) formateados.push(p)
      }
    }

    // Solo partidos que no hayan terminado, ordenados por fecha
    const destacados = formateados
      .filter((p: any) => !p.finalizado)
      .sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
      .slice(0, 6)

    return NextResponse.json({ destacados })
  } catch (e: any) {
    return NextResponse.json({ destacados: [], error: e.message }, { status: 500 })
  }
}
