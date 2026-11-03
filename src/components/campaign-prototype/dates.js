const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const pad = (value) => String(value).padStart(2, '0')

export function parseDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function formatDate(input, style = 'long') {
  const date = typeof input === 'string' ? parseDate(input) : input
  if (style === 'iso') return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (style === 'short') return `${MONTHS_LONG[date.getMonth()]} ${date.getDate()}`
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatTime(value) {
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const twelve = hours % 12 === 0 ? 12 : hours % 12
  return `${twelve}:${pad(minutes)}${suffix}`.replace(/(\d)(AM|PM)$/, '$1 $2')
}

export function formatDuration(days) {
  if (days % 7 === 0) {
    const weeks = days / 7
    return weeks === 1 ? '1 week' : `${weeks} weeks`
  }
  return `${days} days`
}
