const NFL_BASE = 'https://american-football.highlightly.net'
const NFL_KEY  = process.env.HIGHLIGHTLY_NFL_KEY || ''

function temporadaActual() {
  // Temporada NFL se nombra con el año en que empieza (sept-feb)
  const hoy = new Date()
  const mes = hoy.getMonth() + 1 // 1-12
  return mes >= 3 ? hoy.getFullYear() : hoy.getFullYear() - 1
}

async function fetchNFL(temporada: number) {
  try {
    const res = await fetch(`${NFL_BASE}/matches?league=NFL&season=${temporada}`, {
      headers: { 'x-rapidapi-key': NFL_KEY },
      next: { revalidate: 120 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export async function getPartidosNFLCrudos() {
  const temporada = temporadaActual()
  const [actual, siguiente] = await Promise.all([
    fetchNFL(temporada),
    fetchNFL(temporada + 1),
  ])
  return [...actual, ...siguiente]
}

function generarCuotasNFL(): [number, number] {
  const opciones: [number, number][] = [
    [1.75, 2.10],
    [1.80, 2.05],
    [1.85, 1.95],
    [1.90, 1.90],
    [1.95, 1.85],
  ]
  return opciones[Math.floor(Math.random() * opciones.length)]
}

function extraerMarcador(current: string | null | undefined): [number | null, number | null] {
  if (!current) return [null, null]
  const partes = current.split(' - ').map((s: string) => parseInt(s.trim(), 10))
  if (partes.length !== 2 || partes.some(isNaN)) return [null, null]
  return [partes[0], partes[1]]
}

export function formatearPartidoNFL(g: any) {
  const finalizado = g.state?.description === 'Finished'
  const vivo = !finalizado && g.state?.description === 'In Progress'
  const [scoreHome, scoreAway] = extraerMarcador(g.state?.score?.current)
  const [oddHome, oddAway] = generarCuotasNFL()

  return {
    id:         `nfl_${g.id}`,
    league:     'NFL',
    leagueCode: 'NFL',
    home:       g.homeTeam?.abbreviation || g.homeTeam?.name || 'Local',
    homeFull:   g.homeTeam?.displayName || g.homeTeam?.name || 'Local',
    homeBadge:  g.homeTeam?.logo || '',
    away:       g.awayTeam?.abbreviation || g.awayTeam?.name || 'Visitante',
    awayFull:   g.awayTeam?.displayName || g.awayTeam?.name || 'Visitante',
    awayBadge:  g.awayTeam?.logo || '',
    scoreHome:  finalizado || vivo ? scoreHome : null,
    scoreAway:  finalizado || vivo ? scoreAway : null,
    minuto:     vivo ? `Q${g.state?.period || ''}` : '',
    time:       g.date ? new Date(g.date).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit', timeZone:'America/La_Paz' }) : '',
    date:       g.date ? new Date(g.date).toLocaleDateString('es', { day:'2-digit', month:'short', timeZone:'America/La_Paz' }) : '',
    utcDate:    g.date || '',
    status:     finalizado ? 'FINISHED' : vivo ? 'IN_PLAY' : 'SCHEDULED',
    live:       vivo,
    finalizado,
    esSeleccion: false,
    jornada:    g.round || '',
    odds: [
      { label: '1', val: oddHome },
      { label: '2', val: oddAway },
    ],
  }
}

export async function getPartidosNFLFormateados() {
  const juegos = await getPartidosNFLCrudos()
  return juegos
    .map(formatearPartidoNFL)
    .filter((p: any) => !p.finalizado)
    .sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 20)
}
