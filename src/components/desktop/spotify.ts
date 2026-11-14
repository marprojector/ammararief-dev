import { useEffect, useState } from 'react'
import { t } from './i18n'

export interface Track {
  id: string
  name: string
  artists: string[]
  album: string
  image: string | null
  thumb: string | null
  url: string | null
  durationMs: number
  progressMs?: number
  playedAt?: string | null
}

export interface SpotifyState {
  isPlaying: boolean
  now: Track | null
  recent: Track[]
}

export type SpotifyResult = { status: 'loading' } | { status: 'error' } | { status: 'ok'; data: SpotifyState }

const ENDPOINT = '/api/spotify.php'
const FRESH_MS = 20_000

// Menu bar and the Spotify window share one request instead of each polling on its own.
let last: { at: number; result: SpotifyResult } | null = null
let inflight: Promise<SpotifyResult> | null = null

function load(force = false): Promise<SpotifyResult> {
  if (!force && last && Date.now() - last.at < FRESH_MS) return Promise.resolve(last.result)
  inflight ??= fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    .then(async (r) => {
      if (!r.ok) throw new Error(String(r.status))
      const data = (await r.json()) as SpotifyState
      return { status: 'ok', data } as SpotifyResult
    })
    .catch(() => ({ status: 'error' }) as SpotifyResult)
    .then((result) => {
      last = { at: Date.now(), result }
      inflight = null
      return result
    })
  return inflight
}

export function useSpotify(pollMs = 60_000) {
  const [result, setResult] = useState<SpotifyResult>(() => last?.result ?? { status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    load(tick > 0).then((r) => alive && setResult(r))
    const t = setInterval(() => document.visibilityState === 'visible' && load().then((r) => alive && setResult(r)), pollMs)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [pollMs, tick])

  return { result, retry: () => setTick((t) => t + 1) }
}

export const artists = (t: Track) => t.artists.join(', ')

export function ago(iso?: string | null) {
  if (!iso) return ''
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return t('just now')
  const m = Math.floor(s / 60)
  if (m < 60) return t('{n} min ago', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t(h > 1 ? '{n} hrs ago' : '{n} hr ago', { n: h })
  const d = Math.floor(h / 24)
  return d === 1 ? t('yesterday') : t('{n} days ago', { n: d })
}

export const mmss = (ms: number) => {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
