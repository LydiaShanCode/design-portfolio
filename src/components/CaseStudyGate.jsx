import { useState, useEffect } from 'react'

const CORRECT_PASSWORD = 'design is awesome'

function sessionKey(slug) {
  return `case-study-unlocked-${slug}`
}

function CaseStudyGate({ slug, onUnlock, children }) {
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(sessionKey(slug)) === '1') {
      setAlreadyUnlocked(true)
      onUnlock?.()
    }
  }, [slug, onUnlock])

  if (alreadyUnlocked) {
    return children
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (value === CORRECT_PASSWORD) {
      sessionStorage.setItem(sessionKey(slug), '1')
      setAlreadyUnlocked(true)
      onUnlock?.()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="case-study-gate">
      <form className="case-study-gate-form" onSubmit={handleSubmit} noValidate>
        <span className="case-study-gate-label">Password required</span>
        <p className="case-study-gate-hint">
          This case study is under NDA. Enter the password to read the full writeup.
        </p>
        <div className={`case-study-gate-row ${shake ? 'case-study-gate-row--shake' : ''}`}>
          <input
            type="password"
            className={`case-study-gate-input ${error ? 'case-study-gate-input--error' : ''}`}
            placeholder="Enter password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            autoComplete="current-password"
            aria-label="Case study password"
          />
          <button type="submit" className="case-study-gate-submit" data-hoverable>
            Unlock
          </button>
        </div>
        {error && (
          <span className="case-study-gate-error" role="alert">
            Incorrect password. Try again.
          </span>
        )}
      </form>
    </div>
  )
}

export default CaseStudyGate
