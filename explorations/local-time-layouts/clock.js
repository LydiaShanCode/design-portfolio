// Shared live-clock behaviour for every version. Brooklyn time comes from Intl, never the visitor's clock.
// Add ?at=23:10 to any page to freeze the time (useful for checking night/morning copy).
const TIME_ZONE = 'America/New_York'
const fixedAt = new URLSearchParams(location.search).get('at')

const CLOCK_SVG = `
  <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9.25" />
    <line class="clock-hand clock-hand--hour" x1="12" y1="12" x2="12" y2="8.75" />
    <line class="clock-hand clock-hand--minute" x1="12" y1="12" x2="12" y2="5.25" />
  </svg>`

const STATUS_BY_HOUR = [
  [0, 'probably asleep'],
  [7, 'probably on coffee number one'],
  [10, 'probably deep in Figma'],
  [12, 'probably finding lunch'],
  [13, 'probably designing and tinkering'],
  [18, 'probably making something for fun'],
  [22, 'still up, but shouldn’t be'],
]

function brooklynNow() {
  if (fixedAt) {
    const [h, m] = fixedAt.split(':').map(Number)
    return { hour: h || 0, minute: m || 0, second: 0 }
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type) => Number(parts.find((p) => p.type === type).value)
  return { hour: get('hour'), minute: get('minute'), second: get('second') }
}

function formatTime({ hour, minute }) {
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`
}

function statusFor(hour) {
  return STATUS_BY_HOUR.reduce((status, [from, copy]) => (hour >= from ? copy : status), '')
}

function offsetFromVisitor() {
  const label = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(new Date()).find((p) => p.type === 'timeZoneName').value
  const [, sign, hh, mm] = label.match(/GMT([+-])(\d{2}):?(\d{2})?/) ?? [null, '+', '0', '0']
  const brooklynMinutes = (sign === '-' ? -1 : 1) * (Number(hh) * 60 + Number(mm ?? 0))
  const diffHours = (brooklynMinutes + new Date().getTimezoneOffset()) / 60
  if (diffHours === 0) return 'same time as you'
  const n = Math.abs(diffHours)
  return `${n} ${n === 1 ? 'hr' : 'hrs'} ${diffHours > 0 ? 'ahead of' : 'behind'} you`
}

// Hands only ever rotate forward, so 11:59 → 12:00 doesn't spin backwards a full turn.
const handAngles = new WeakMap()
function rotateForward(hand, target) {
  const last = handAngles.get(hand) ?? 0
  const next = last + ((((target - last) % 360) + 360) % 360)
  handAngles.set(hand, next)
  hand.style.transform = `rotate(${next}deg)`
}

function render() {
  const now = brooklynNow()
  document.querySelectorAll('[data-clock-time]').forEach((el) => { el.textContent = formatTime(now) })
  document.querySelectorAll('[data-clock-status]').forEach((el) => { el.textContent = statusFor(now.hour) })
  document.querySelectorAll('[data-clock-offset]').forEach((el) => { el.textContent = offsetFromVisitor() })
  document.querySelectorAll('.clock-hand--hour').forEach((el) => rotateForward(el, (now.hour % 12) * 30 + now.minute * 0.5))
  document.querySelectorAll('.clock-hand--minute').forEach((el) => rotateForward(el, now.minute * 6))
  return now
}

function scheduleNextMinute(now) {
  if (fixedAt) return
  setTimeout(() => scheduleNextMinute(render()), (60 - now.second) * 1000 + 50)
}

document.querySelectorAll('[data-clock-icon]').forEach((el) => { el.innerHTML = CLOCK_SVG })
// Hands start at 12:00 and sweep into place on load.
requestAnimationFrame(() => requestAnimationFrame(() => scheduleNextMinute(render())))
document.addEventListener('visibilitychange', () => { if (!document.hidden) render() })

const FOOTER_LINKS = `
  <a class="footer-link" href="#" aria-label="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></a>
  <a class="footer-link" href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="3" /><path d="M7 11v6M7 7v.01M11 17v-4a2 2 0 1 1 4 0v4M11 11v6" /></svg></a>
  <a class="footer-link" href="#" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
  <a class="footer-link" href="#" aria-label="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg></a>`
document.querySelectorAll('[data-footer-links]').forEach((el) => { el.innerHTML = FOOTER_LINKS })

const KOI = `      .-~~~-.
  .-~       ~-.  ><(((º>
 (   ~~~~~~~   )
  '-._______.-'`
document.querySelectorAll('[data-koi]').forEach((el) => { el.textContent = KOI })
