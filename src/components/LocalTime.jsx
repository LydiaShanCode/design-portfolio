import { useEffect, useState } from 'react'

const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: 'numeric',
  minute: '2-digit',
})

function formatNow() {
  const parts = timeFormat.formatToParts(new Date())
  const get = (type) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('hour')}:${get('minute')} ${get('dayPeriod').toLowerCase()}`
}

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

function LocalTime({ className = '' }) {
  const [time, setTime] = useState(formatNow)

  useEffect(() => {
    let timeoutId = 0
    const tick = () => {
      setTime(formatNow())
      timeoutId = setTimeout(tick, 60000 - (Date.now() % 60000))
    }
    timeoutId = setTimeout(tick, 60000 - (Date.now() % 60000))

    const onVisible = () => { if (!document.hidden) setTime(formatNow()) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <p className={`local-time ${className}`.trim()}>
      <ClockIcon />
      <span><span className="local-time-value">{time}</span> in New York City</span>
    </p>
  )
}

export default LocalTime
