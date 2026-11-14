import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { reduced } from './data'

// A single-stroke, hand-drawn "hello", written out over the wallpaper on every page load.
const HELLO =
  'M18 150 C 48 142, 74 112, 88 76 C 106 44, 102 12, 80 14 C 56 16, 58 70, 64 108 C 68 140, 68 162, 68 172 ' +
  'C 72 142, 92 116, 114 116 C 136 116, 140 138, 138 152 C 136 166, 142 174, 158 172 C 184 168, 210 150, 208 130 ' +
  'C 208 108, 174 106, 172 136 C 170 162, 192 176, 216 172 C 242 168, 262 132, 270 92 C 280 52, 280 12, 258 14 ' +
  'C 234 16, 236 70, 240 110 C 244 150, 250 172, 270 172 C 296 172, 314 132, 322 92 C 332 52, 332 12, 310 14 ' +
  'C 286 16, 288 70, 292 110 C 296 150, 302 172, 322 172 C 338 172, 346 160, 352 148 C 358 126, 378 114, 398 116 ' +
  'C 422 118, 430 146, 416 164 C 402 180, 374 176, 372 154 C 370 132, 392 122, 418 124 C 440 126, 458 126, 476 112'

const DRAW_MS = 2400
const HOLD_MS = 450
const FADE_MS = 700

// First visit in a browser session: the full writing. Later reloads in the same session: a quick version.
const SEEN_KEY = 'yl-hello-seen'
const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}
const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* storage unavailable: every load gets the full version */
  }
}

// Once per page load: coming back from /blog inside the app does not replay it, a reload does.
let played = false

type Phase = 'draw' | 'hold' | 'out' | 'done'

export default function Welcome({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<Phase>(() => (played ? 'done' : 'draw'))
  const [quick] = useState(seenThisSession)
  const path = useRef<SVGPathElement>(null)
  const anim = useRef<Animation | null>(null)

  useLayoutEffect(() => {
    if (phase !== 'draw' || !path.current) return
    played = true
    markSeen()
    const p = path.current
    const len = p.getTotalLength()
    p.style.strokeDasharray = `${len}`
    if (reduced()) {
      p.style.strokeDashoffset = '0'
      setPhase('hold')
      return
    }
    const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: quick ? 650 : DRAW_MS, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' })
    anim.current = a
    a.onfinish = () => setPhase('hold')
    return () => a.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Leave once the word is written and the desktop behind it has its data.
  useEffect(() => {
    if (phase === 'hold' && ready) {
      const id = setTimeout(() => setPhase('out'), quick ? 120 : HOLD_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'out') {
      const id = setTimeout(() => setPhase('done'), quick ? 450 : FADE_MS)
      return () => clearTimeout(id)
    }
  }, [phase, ready, quick])

  // Any click or key skips ahead.
  const skip = () => {
    if (phase === 'draw') anim.current?.finish()
    else if (phase === 'hold' && ready) setPhase('out')
  }
  useEffect(() => {
    if (phase === 'done') return
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  })

  if (phase === 'done') return null
  return (
    <div className={`welcome${phase === 'out' ? ' out' : ''}${quick ? ' quick' : ''}`} onClick={skip} role="img" aria-label="hello">
      <svg viewBox="0 0 520 220" aria-hidden="true">
        <path ref={path} d={HELLO} />
      </svg>
    </div>
  )
}
