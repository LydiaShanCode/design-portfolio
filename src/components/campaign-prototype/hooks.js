import { useEffect } from 'react'

export function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return undefined
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ref, active, onDismiss])
}

export function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onEscape()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [active, onEscape])
}
