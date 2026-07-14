const BDL_BASE = 'https://api.balldontlie.io'
const BDL_KEY  = process.env.BALLDONTLIE_API_KEY || ''

function proximosDiasISO(dias: number) {
  const fechas: string[] = []
  for (let i = 0; i < dias; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    fechas.push(d.toISOString().split('T')[0])
  }
  return fechas
}

export async function getPartidosMLBProximos(dias: number = 10) {
  const fechas = proximosDiasISO(dias)
  const url = new URL(`${BDL_BASE}/mlb/v1/games`)
  fechas.forEach(f => url.searchParams.append('dates[]', f))
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: BDL_KEY },
      next: { revalidate: 120 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

// Cuotas simuladas con ligera ventaja de local (tipico en MLB real), sin depender de records
function generarCuotasMLB(): [number, number] {
  const opciones: [number, number][] = [
    [1.75, 2.10],
    [1.80, 2.05],
    [1.85, 1.95],
    [1.90, 1.90],
    [1.95, 1.85],
  ]
  return opciones[Math.floor(Math.random() * opciones.length)]
}

export function formatearPartidoMLB(g: any) {
  const finalizado = g.status === 'STATUS_FINAL'
  const vivo = !finalizado && g.status !== 'STATUS_SCHEDULED'

  const [oddHome, oddAway] = generarCuotasMLB()

  return {
    id:         `mlb_${g.id}`,
    league:     'MLB',
    leagueCode: 'MLB',
    home:       g.home_team?.abbreviation || g.home_team?.short_display_name || 'Local',
    homeFull:   g.home_team?.display_name || 'Local',
    homeBadge:  '',
    away:       g.away_team?.abbreviation || g.away_team?.short_display_name || 'Visitante',
    awayFull:   g.away_team?.display_name || 'Visitante',
    awayBadge:  '',
    scoreHome:  finalizado || vivo ? g.home_team_data?.runs ?? null : null,
    scoreAway:  finalizado || vivo ? g.away_team_data?.runs ?? null : null,
    minuto:     vivo ? `Inning ${g.period || ''}` : '',
    time:       finalizado ? '' : (g.date ? new Date(g.date).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit', timeZone:'America/La_Paz' }) : ''),
    date:       g.date ? new Date(g.date).toLocaleDateString('es', { day:'2-digit', month:'short', timeZone:'America/La_Paz' }) : '',
    utcDate:    g.date || '',
    status:     finalizado ? 'FINISHED' : vivo ? 'IN_PLAY' : 'SCHEDULED',
    live:       vivo,
    finalizado,
    esSeleccion: false,
    jornada:    '',
    odds: [
      { label: '1', val: oddHome },
      { label: '2', val: oddAway },
    ],
  }
}

export async function getPartidosMLBFormateados() {
  const juegos = await getPartidosMLBProximos(10)
  return juegos
    .map(formatearPartidoMLB)
    .filter((p: any) => !p.finalizado)
    .sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 20)
}
