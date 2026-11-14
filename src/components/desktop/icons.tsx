import { useId, type ReactNode } from 'react'
import { MON } from './data'
import { GH_PATH } from './ui'

// App icons drawn on the macOS icon grid (squircle, top sheen, hairline edge). Original artwork, not Apple's.
const SQ = 'M50 4C86 4 96 14 96 50S86 96 50 96 4 86 4 50 14 4 50 4Z'

function Squircle({ from, to, children }: { from: string; to: string; children: ReactNode }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <path d={SQ} />
        </clipPath>
      </defs>
      <g transform="translate(50 50) scale(.9) translate(-50 -50)">
        <path d={SQ} fill={`url(#g${id})`} />
        <g clipPath={`url(#c${id})`}>{children}</g>
        <path d={SQ} fill={`url(#s${id})`} />
        <path d={SQ} fill="none" stroke="rgba(0,0,0,.14)" strokeWidth=".7" />
      </g>
    </svg>
  )
}

// Icon images from public/assets/icons (192px copies in /dock for the dock and home grid).
const IMAGES: Record<string, string> = {
  about: 'system',
  projects: 'appstore',
  experience: 'calendar',
  stack: 'activity',
  notes: 'notes',
  terminal: 'terminal',
  contact: 'mail',
}

export function AppIcon({ id }: { id: string }) {
  if (IMAGES[id]) return <img className="app-img" src={`/assets/icons/dock/${IMAGES[id]}.webp`} alt="" draggable={false} />
  const now = new Date()
  switch (id) {
    case 'about':
      return (
        <Squircle from="#c79a6b" to="#7b5434">
          <rect x="0" y="0" width="16" height="100" fill="rgba(0,0,0,.18)" />
          <rect x="26" y="20" width="56" height="62" rx="6" fill="#fbf6ef" />
          <circle cx="54" cy="44" r="10" fill="#9b7656" />
          <path d="M36 72c2-10 9-14 18-14s16 4 18 14Z" fill="#9b7656" />
        </Squircle>
      )
    case 'projects':
      return (
        <Squircle from="#25c7ff" to="#0a5fe8">
          <g fill="#fff">
            <rect x="24" y="24" width="23" height="23" rx="6" />
            <rect x="53" y="24" width="23" height="23" rx="6" opacity=".72" />
            <rect x="24" y="53" width="23" height="23" rx="6" opacity=".72" />
            <rect x="53" y="53" width="23" height="23" rx="6" opacity=".45" />
          </g>
        </Squircle>
      )
    case 'experience':
      return (
        <Squircle from="#ffffff" to="#ecebe8">
          <rect x="0" y="0" width="100" height="31" fill="#f0473c" />
          <text x="50" y="23" textAnchor="middle" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="700" fill="#fff" letterSpacing="1.5">
            {MON[now.getMonth()].toUpperCase()}
          </text>
          <text x="50" y="78" textAnchor="middle" fontFamily="Geist, sans-serif" fontSize="42" fontWeight="500" fill="#1d1b22">
            {now.getDate()}
          </text>
        </Squircle>
      )
    case 'terminal':
      return (
        <Squircle from="#4a4852" to="#18171d">
          <rect x="14" y="16" width="72" height="68" rx="7" fill="#0e0d12" stroke="rgba(255,255,255,.14)" />
          <path d="M26 38 39 49 26 60" fill="none" stroke="#e8e6ec" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M45 61h20" stroke="#e8e6ec" strokeWidth="5.5" strokeLinecap="round" />
        </Squircle>
      )
    case 'contact':
      return (
        <Squircle from="#5ecbff" to="#1a6ff0">
          <rect x="18" y="29" width="64" height="44" rx="5" fill="#fff" />
          <path d="M19 31 50 54 81 31" fill="none" stroke="#9cc6f6" strokeWidth="3.5" strokeLinejoin="round" />
        </Squircle>
      )
    case 'spotify':
      return (
        <Squircle from="#232323" to="#0c0c0c">
          <circle cx="50" cy="50" r="29" fill="#1ed760" />
          <g fill="none" stroke="#0c0c0c" strokeLinecap="round">
            <path d="M33 41c11-4 25-3 35 3" strokeWidth="5" />
            <path d="M35 51c9-3 20-2 28 3" strokeWidth="4.2" />
            <path d="M37 60c7-2 15-1 21 2" strokeWidth="3.6" />
          </g>
        </Squircle>
      )
    case 'github':
      return (
        <Squircle from="#3d3b45" to="#141318">
          <path transform="translate(22 22) scale(3.5)" fill="#fff" d={GH_PATH} />
        </Squircle>
      )
    default:
      return null
  }
}
