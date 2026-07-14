const BDL_BASE = 'https://api.balldontlie.io'
const BDL_KEY  = process.env.BALLDONTLIE_API_KEY || ''

async function fetchBDL(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BDL_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: BDL_KEY },
      next: { revalidate: 120 },
    })
    if (!res.ok) return { data: [] }
    return res.json()
  } catch {
    return { data: [] }
  }
}

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

export async function getPartidosNBAHoy() {
  const data = await fetchBDL('/nba/v1/games', { 'dates[]': hoyISO() })
  return data.data || []
}

function proximosDiasISO(dias: number) {
  const fechas: string[] = []
  for (let i = 0; i < dias; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    fechas.push(d.toISOString().split('T')[0])
  }
  return fechas
}

export async function getPartidosNBAProximos(dias: number = 10) {
  const fechas = proximosDiasISO(dias)
  const url = new URL(`${BDL_BASE}/nba/v1/games`)
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

// Cache simple en memoria del record de victorias/derrotas por equipo (dura el ciclo de vida del server)
let standingsCache: { data: Record<number, { wins: number; losses: number }>; ts: number } | null = null

async function getStandingsMap(): Promise<Record<number, { wins: number; losses: number }>> {
  const ahora = Date.now()
  if (standingsCache && ahora - standingsCache.ts < 1000 * 60 * 60 * 6) {
    return standingsCache.data
  }
  const season = new Date().getMonth() >= 9 ? new Date().getFullYear() : new Date().getFullYear() - 1
  const data = await fetchBDL('/nba/v1/standings', { season: String(season) })
  const map: Record<number, { wins: number; losses: number }> = {}
  for (const s of data.data || []) {
    if (s.team?.id) {
      map[s.team.id] = { wins: s.wins || 0, losses: s.losses || 0 }
    }
  }
  standingsCache = { data: map, ts: ahora }
  return map
}

function generarCuotasNBA(winPctHome: number, winPctAway: number): [number, number] {
  const diff = winPctHome - winPctAway
  const cuotaDebil = [1.95, 2.00, 2.05, 2.10][Math.floor(Math.random() * 4)]

  if (diff >= 0.30) return [1.10, cuotaDebil]
  if (diff >= 0.20) return [1.15, cuotaDebil]
  if (diff >= 0.10) return [1.20, cuotaDebil]
  if (diff >= 0.03) return [1.30, cuotaDebil]
  if (diff >= -0.03) {
    const base = [1.90, 1.95, 2.00, 2.05][Math.floor(Math.random() * 4)]
    return [base, Math.round((base + 0.20) * 100) / 100]
  }
  if (diff >= -0.10) return [cuotaDebil, 1.30]
  if (diff >= -0.20) return [cuotaDebil, 1.20]
  if (diff >= -0.30) return [cuotaDebil, 1.15]
  return [cuotaDebil, 1.10]
}

export async function formatearPartidoNBA(g: any) {
  const finalizado = g.status === 'Final'
  const vivo = !finalizado && (
    String(g.status).includes('Qtr') ||
    String(g.status).includes('Half') ||
    String(g.status).includes('OT')
  )

  const standings = await getStandingsMap()
  const homeRecord = standings[g.home_team?.id] || { wins: 0, losses: 0 }
  const awayRecord = standings[g.visitor_team?.id] || { wins: 0, losses: 0 }
  const homeTotal = homeRecord.wins + homeRecord.losses
  const awayTotal = awayRecord.wins + awayRecord.losses
  const winPctHome = homeTotal > 0 ? homeRecord.wins / homeTotal : 0.5
  const winPctAway = awayTotal > 0 ? awayRecord.wins / awayTotal : 0.5
  const [oddHome, oddAway] = generarCuotasNBA(winPctHome, winPctAway)

  return {
    id:         `nba_${g.id}`,
    league:     'NBA',
    leagueCode: 'NBA',
    home:       g.home_team?.abbreviation || g.home_team?.name || 'Local',
    homeFull:   g.home_team?.full_name || g.home_team?.name || 'Local',
    homeBadge:  '',
    away:       g.visitor_team?.abbreviation || g.visitor_team?.name || 'Visitante',
    awayFull:   g.visitor_team?.full_name || g.visitor_team?.name || 'Visitante',
    awayBadge:  '',
    scoreHome:  finalizado || vivo ? g.home_team_score : null,
    scoreAway:  finalizado || vivo ? g.visitor_team_score : null,
    minuto:     vivo ? g.status : '',
    time:       finalizado ? '' : String(g.status || ''),
    date:       g.date ? new Date(g.date).toLocaleDateString('es', { day: '2-digit', month: 'short', timeZone: 'America/La_Paz' }) : '',
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

export async function getPartidosNBAFormateados() {
  const juegos = await getPartidosNBAProximos(10)
  const formateados = await Promise.all(juegos.map(formatearPartidoNBA))
  return formateados
    .filter((p: any) => !p.finalizado)
    .sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 20)
}
