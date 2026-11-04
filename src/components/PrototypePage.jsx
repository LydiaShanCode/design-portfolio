import { Suspense, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PROTOTYPES } from '../data/prototypes'

export default function PrototypePage() {
  const { id } = useParams()
  const prototype = PROTOTYPES[id]

  useEffect(() => {
    if (!prototype) return undefined
    const previousTitle = document.title
    document.title = `${prototype.title} — Lydia Shan`
    return () => {
      document.title = previousTitle
    }
  }, [prototype])

  if (!prototype) return <Navigate to="/" replace />
  const { Component } = prototype

  return (
    <main className="prototype-page" aria-label={`${prototype.title} prototype`}>
      <Suspense fallback={null}>
        <Component fluid />
      </Suspense>
    </main>
  )
}
