import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const DesignVersionContext = createContext(null)

// Reserved selection id for the overarching version; tweak surfaces must not use it.
export const MAJOR_ID = 'major'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function isDevDefault() {
  try {
    const env = globalThis.process?.env
    return !!env && env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

function parseSelections(raw) {
  const out = {}
  raw?.split(',').forEach((pair) => {
    const [id, key] = pair.split(':')
    if (id && key) out[id] = key
  })
  return out
}

function serializeSelections(selections) {
  return Object.entries(selections)
    .map(([id, key]) => `${id}:${key}`)
    .join(',')
}

// Builds pathname + query + hash, keeping ":" and "," in `v` unencoded so links stay readable.
function buildPath(v, extra = {}) {
  const url = new URL(window.location.href)
  url.searchParams.delete('v')
  Object.entries(extra).forEach(([k, val]) => url.searchParams.set(k, val))
  const rest = url.searchParams.toString()
  const search = [rest, v && `v=${v}`].filter(Boolean).join('&')
  return `${url.pathname}${search ? `?${search}` : ''}${url.hash}`
}

function normalize(versions) {
  return versions.map((v) =>
    typeof v === 'string' ? { key: v, label: v } : { key: v.key, label: v.label ?? v.key, note: v.note },
  )
}

function sameSelections(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function inScope(scope, majorKey) {
  return !scope || scope === 'global' || scope.includes(majorKey)
}

/**
 * `enabled` is the base switch (pass the framework's dev flag); `?versions=1` in the URL also enables it.
 * `storageKey` overrides the per-project localStorage namespace (defaults to `location.host`).
 * `majors` lists overarching versions (`{ key, label, name, ... }`).
 * `defaults` is the shipped mix (from `designDefaults.json`); production uses it when the switcher is hidden.
 */
export function DesignVersionProvider({
  children,
  enabled: enabledProp,
  storageKey,
  majors = [],
  defaults: defaultsProp = {},
}) {
  const [optIn, setOptIn] = useState(false)
  const [ready, setReady] = useState(false)
  const [selections, setSelections] = useState({})
  const [surfaces, setSurfaces] = useState([])
  const [defaults, setDefaults] = useState(defaultsProp)
  const registry = useRef(new Map())
  const defaultsRef = useRef(defaults)
  defaultsRef.current = defaults
  const enabled = (enabledProp ?? isDevDefault()) || optIn

  useEffect(() => {
    setDefaults(defaultsProp)
  }, [defaultsProp])

  const getStorageKey = useCallback(
    () => `dv:${storageKey ?? window.location.host}`,
    [storageKey],
  )

  useIsoLayoutEffect(() => {
    setOptIn(new URLSearchParams(window.location.search).get('versions') === '1')
  }, [])

  useIsoLayoutEffect(() => {
    if (!enabled || ready) return
    const fromUrl = new URLSearchParams(window.location.search).get('v')
    let initial = {}
    if (fromUrl !== null) {
      initial = parseSelections(fromUrl)
    } else {
      try {
        initial = JSON.parse(window.localStorage.getItem(getStorageKey()) ?? '{}')
      } catch {
        initial = {}
      }
    }
    setSelections(initial)
    setReady(true)
  }, [enabled, ready, getStorageKey])

  useEffect(() => {
    if (!enabled || !ready) return
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(selections))
    } catch {
      // Storage can be unavailable (private mode, sandboxed iframes); the URL still carries state.
    }
    const next = buildPath(serializeSelections(selections))
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== current) window.history.replaceState(window.history.state, '', next)
  }, [enabled, ready, selections, getStorageKey])

  const syncSurfaces = useCallback(() => {
    setSurfaces(Array.from(registry.current.values(), (entry) => entry.surface))
  }, [])

  const register = useCallback(
    (surface) => {
      const existing = registry.current.get(surface.id)
      if (existing) {
        existing.count += 1
        existing.surface = surface
      } else {
        registry.current.set(surface.id, { surface, count: 1 })
      }
      syncSurfaces()
      return () => {
        const entry = registry.current.get(surface.id)
        if (!entry) return
        entry.count -= 1
        if (entry.count <= 0) registry.current.delete(surface.id)
        syncSurfaces()
      }
    },
    [syncSurfaces],
  )

  const setVersion = useCallback((id, key) => {
    const shipped = defaultsRef.current[id]
    const fallback = registry.current.get(id)?.surface.defaultKey
    setSelections((prev) => {
      const next = { ...prev }
      if (key === (shipped ?? fallback)) delete next[id]
      else next[id] = key
      return next
    })
  }, [])

  const shippedMajor = majors.some((m) => m.key === defaults[MAJOR_ID]) ? defaults[MAJOR_ID] : majors[0]?.key
  const activeMajor = majors.some((m) => m.key === selections[MAJOR_ID])
    ? selections[MAJOR_ID]
    : shippedMajor

  // Switching majors keeps every tweak selection, so out-of-scope tweaks come back as they were.
  const setMajor = useCallback((key) => {
    const baseline = defaultsRef.current[MAJOR_ID]
    const first = majors[0]?.key
    setSelections((prev) => {
      const next = { ...prev }
      if (key === (majors.some((m) => m.key === baseline) ? baseline : first)) delete next[MAJOR_ID]
      else next[MAJOR_ID] = key
      return next
    })
  }, [majors])

  const reset = useCallback(() => setSelections({}), [])

  const shareUrl = useCallback(
    () => `${window.location.origin}${buildPath(serializeSelections(selections), { versions: '1' })}`,
    [selections],
  )

  const snapshot = useCallback(() => {
    const next = {}
    if (activeMajor) next[MAJOR_ID] = activeMajor
    for (const { surface } of registry.current.values()) {
      const selected = selections[surface.id]
      const shipped = defaults[surface.id]
      const key = surface.versions.some((v) => v.key === selected)
        ? selected
        : surface.versions.some((v) => v.key === shipped)
          ? shipped
          : surface.defaultKey
      if (key) next[surface.id] = key
    }
    return next
  }, [activeMajor, selections, defaults])

  const currentIsDefault = useMemo(() => sameSelections(snapshot(), defaults), [snapshot, defaults])

  // Writes src/data/designDefaults.json via the Vite dev endpoint so the next
  // production build ships this mix. Falls back to a download if the endpoint is gone.
  const saveAsDefault = useCallback(async () => {
    const next = snapshot()
    let mode = 'saved'
    try {
      const res = await fetch('/__design-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      if (!res.ok) throw new Error('write failed')
    } catch {
      const blob = new Blob([`${JSON.stringify(next, null, 2)}\n`], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'designDefaults.json'
      a.click()
      URL.revokeObjectURL(url)
      mode = 'downloaded'
    }
    setDefaults(next)
    setSelections((prev) => {
      const pruned = { ...prev }
      for (const [id, key] of Object.entries(next)) {
        if (pruned[id] === key) delete pruned[id]
      }
      return pruned
    })
    return mode
  }, [snapshot])

  const value = useMemo(
    () => ({
      enabled,
      surfaces,
      selections,
      setVersion,
      reset,
      shareUrl,
      register,
      majors,
      activeMajor,
      setMajor,
      defaults,
      currentIsDefault,
      saveAsDefault,
    }),
    [
      enabled,
      surfaces,
      selections,
      setVersion,
      reset,
      shareUrl,
      register,
      majors,
      activeMajor,
      setMajor,
      defaults,
      currentIsDefault,
      saveAsDefault,
    ],
  )

  return <DesignVersionContext.Provider value={value}>{children}</DesignVersionContext.Provider>
}

export function useDesignVersionContext() {
  return useContext(DesignVersionContext)
}

/** Active overarching version key. Without a provider, or when disabled, returns the default (first) major. */
export function useMajorVersion() {
  return useContext(DesignVersionContext)?.activeMajor
}

/**
 * Registers a switchable surface (a micro tweak) and returns its active version key.
 * Without a provider, or when disabled (production without opt-in), returns the default.
 * Options: `default` key, `label` (display name in the menu, defaults to the id), and
 * `scope`: `'global'` (default) or an array of major keys the tweak applies to. Outside its
 * scope the tweak is hidden from the menu and returns its default.
 */
export function useDesignVersion(id, versions, options = {}) {
  const ctx = useContext(DesignVersionContext)
  const defs = normalize(versions)
  const signature = JSON.stringify(defs)
  const scopeSignature = JSON.stringify(options.scope ?? 'global')
  const fallback = options.default ?? defs[0]?.key
  const shipped = ctx?.defaults?.[id]
  const baseline = shipped && defs.some((d) => d.key === shipped) ? shipped : fallback
  const enabled = !!ctx?.enabled
  const register = ctx?.register

  useIsoLayoutEffect(() => {
    if (!enabled || !register) return
    return register({
      id,
      label: options.label ?? id,
      versions: JSON.parse(signature),
      defaultKey: fallback,
      scope: JSON.parse(scopeSignature),
    })
  }, [enabled, register, id, signature, scopeSignature, fallback, options.label])

  if (!ctx || !inScope(options.scope, ctx.activeMajor)) return fallback
  if (!enabled) return baseline
  const selected = ctx.selections[id]
  return defs.some((d) => d.key === selected) ? selected : baseline
}

/** Convenience wrapper over `useDesignVersion` for whole-subtree swaps. Use string keys like "v1", not "1". */
export function DesignVersion({ id, versions, notes, label, default: def }) {
  const defs = Object.keys(versions).map((key) => ({ key, note: notes?.[key] }))
  const active = useDesignVersion(id, defs, { default: def, label })
  return <>{versions[active]}</>
}
