export type HolidaySpan = {
  name: string
  start: string
  end: string
}

/** 法定节假日区间（含调休放假日起止，按国务院安排整理，跨年自动续接） */
export const CN_HOLIDAY_SPANS: HolidaySpan[] = [
  { name: '元旦', start: '2025-01-01', end: '2025-01-01' },
  { name: '春节', start: '2025-01-28', end: '2025-02-04' },
  { name: '清明', start: '2025-04-04', end: '2025-04-06' },
  { name: '劳动节', start: '2025-05-01', end: '2025-05-05' },
  { name: '端午', start: '2025-05-31', end: '2025-06-02' },
  { name: '国庆中秋', start: '2025-10-01', end: '2025-10-08' },
  { name: '元旦', start: '2026-01-01', end: '2026-01-03' },
  { name: '春节', start: '2026-02-15', end: '2026-02-23' },
  { name: '清明', start: '2026-04-04', end: '2026-04-06' },
  { name: '劳动节', start: '2026-05-01', end: '2026-05-05' },
  { name: '端午', start: '2026-06-19', end: '2026-06-21' },
  { name: '中秋', start: '2026-09-25', end: '2026-09-27' },
  { name: '国庆', start: '2026-10-01', end: '2026-10-07' },
  { name: '元旦', start: '2027-01-01', end: '2027-01-03' },
  { name: '春节', start: '2027-02-06', end: '2027-02-14' },
  { name: '清明', start: '2027-04-04', end: '2027-04-06' },
  { name: '劳动节', start: '2027-05-01', end: '2027-05-05' },
  { name: '端午', start: '2027-06-09', end: '2027-06-11' },
  { name: '中秋', start: '2027-09-15', end: '2027-09-17' },
  { name: '国庆', start: '2027-10-01', end: '2027-10-07' },
]

export type HolidayCountdown =
  | { kind: 'ongoing'; name: string; endsAt: Date }
  | { kind: 'upcoming'; name: string; startsAt: Date }
  | { kind: 'unknown' }

function parseLocalDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function holidayCountdown(now = new Date()): HolidayCountdown {
  const t = now.getTime()
  for (const span of CN_HOLIDAY_SPANS) {
    const start = parseLocalDate(span.start)
    const end = endOfDay(parseLocalDate(span.end))
    if (t >= start.getTime() && t <= end.getTime()) {
      return { kind: 'ongoing', name: span.name, endsAt: end }
    }
    if (start.getTime() > t) {
      return { kind: 'upcoming', name: span.name, startsAt: start }
    }
  }
  return { kind: 'unknown' }
}

export function formatHolidayRemaining(now: Date, state: HolidayCountdown) {
  if (state.kind === 'unknown') return { headline: '节假日', detail: '暂无日历数据' }
  const target = state.kind === 'ongoing' ? state.endsAt : state.startsAt
  const ms = Math.max(0, target.getTime() - now.getTime())
  const totalHours = Math.floor(ms / 3_600_000)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  if (state.kind === 'ongoing') {
    return {
      headline: `${state.name}假期中`,
      detail: days > 0 ? `还剩 ${days} 天 ${hours} 时` : `${hours} 时 ${minutes} 分后收假`,
    }
  }
  return {
    headline: `距${state.name}`,
    detail: days > 0 ? `${days} 天 ${hours} 时 ${minutes} 分` : `${hours} 时 ${minutes} 分`,
  }
}
