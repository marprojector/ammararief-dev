import type { CSSProperties } from 'react'
import type { Profile, Project, Social, Work } from './model'
import { monthShort, t } from './i18n'

export type { Profile, Project, Social, Work }
export { engineeringRoles, parseMonth, useJson } from './model'
import { parseMonth as parseMonthLocal } from './model'

export interface StackItem {
  name: string
  kind: string
  level: number | null
  experience: string | null
  keywords: string[]
  match?: string[]
}

export interface StackCategory {
  id: string
  name: string
  items: StackItem[]
}

export interface StackData {
  categories: StackCategory[]
}

export interface DesktopData {
  profile: Profile
  socials: Social[]
  projects: Project[]
  work: Work[]
  stack: StackData
}

export type Theme = 'auto' | 'light' | 'dark'

export type AppId = 'about' | 'projects' | 'experience' | 'stack' | 'notes' | 'spotify' | 'terminal' | 'contact'

export const APPS: Record<AppId, { title: string; dock: string; w: number; h: number; cls?: string }> = {
  about: { title: 'About This Engineer', dock: 'About', w: 880, h: 620, cls: 'win-settings' },
  projects: { title: 'Projects', dock: 'Projects', w: 1080, h: 690, cls: 'win-store' },
  experience: { title: 'Experience', dock: 'Experience', w: 620, h: 620 },
  stack: { title: 'Tech Stack', dock: 'Tech Stack', w: 940, h: 620, cls: 'win-stack' },
  notes: { title: 'Notes', dock: 'Notes', w: 1000, h: 640, cls: 'win-notes' },
  spotify: { title: 'Spotify', dock: 'Spotify', w: 720, h: 600, cls: 'win-spotify' },
  terminal: { title: 'adi — zsh', dock: 'Terminal', w: 680, h: 460, cls: 'term' },
  contact: { title: 'New Message', dock: 'Contact', w: 560, h: 470 },
}
export const ORDER: AppId[] = ['about', 'projects', 'experience', 'stack', 'notes', 'spotify', 'terminal', 'contact']

// Which apps appear (dock, menu bar, home grid, deep links, terminal). Set VITE_SHOW_<APP>=true|false at build time.
// Unset or empty uses the default below. Spotify stays off until the Spotify app works (it needs a Premium owner).
const flag = (v: string | undefined, fallback: boolean) => (v === undefined || v.trim() === '' ? fallback : /^(1|true|yes|on)$/i.test(v.trim()))
const env = import.meta.env
export const ENABLED: Record<AppId, boolean> = {
  about: flag(env.VITE_SHOW_ABOUT, true),
  projects: flag(env.VITE_SHOW_PROJECTS, true),
  experience: flag(env.VITE_SHOW_EXPERIENCE, true),
  stack: flag(env.VITE_SHOW_STACK, true),
  notes: flag(env.VITE_SHOW_NOTES, true),
  spotify: flag(env.VITE_SHOW_SPOTIFY, false),
  terminal: flag(env.VITE_SHOW_TERMINAL, true),
  contact: flag(env.VITE_SHOW_CONTACT, true),
}
export const VISIBLE: AppId[] = ORDER.filter((id) => ENABLED[id])

// Selected projects for the Discover slider, in display order. Ids refer to public/data/projects.json.
export const FEATURED: { id: number; tag: string }[] = [
  { id: 1, tag: 'Free, keyless coding models routed to every coding harness through one local endpoint.' },
  { id: 3, tag: 'Terminal-native agent orchestration: one CLI plus a native desktop GUI, written in Rust.' },
  { id: 2, tag: 'Boarding-house management: rooms, tenants, bills, finances and WhatsApp notifications.' },
  { id: 6, tag: 'Academic assistant that reaches Edlink data through a Telegram bot, one tenant per customer.' },
  { id: 4, tag: 'Document workspace that turns long files into answers, summaries and structured output.' },
  { id: 5, tag: 'Local information hub for Makassar, built as a fast, mobile-first web app.' },
]

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtMY = (d: Date) => `${monthShort(d.getMonth())} ${d.getFullYear()}`
export const span = (a: Date, b: Date) => {
  const m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1
  const y = Math.floor(m / 12)
  const r = m % 12
  const [yr, mo] = t('yr') === 'yr' ? ['yr', 'mo'] : ['thn', 'bln']
  return [y && `${y} ${yr}`, r && `${r} ${mo}`].filter(Boolean).join(' ') || `1 ${mo}`
}

export const hasLink = (p: Project) => !!p.link && p.link !== '#'
export const href = (p: Project) => (p.link.startsWith('http') ? p.link : `https://${p.link}`)
export const host = (p: Project) => {
  try {
    return new URL(href(p)).hostname
  } catch {
    return ''
  }
}
export const org = (p: Project) => (p.company.trim() === '-' ? t('Independent project') : p.company.trim())

// Screenshots: a 960px webp copy lives in /assets/webp; the original is the fallback.
export const shotSrc = (p: Project) => (p.image ? `/assets/webp/${p.image.replace(/\.[^.]+$/, '')}.webp` : '')
export const shotFallback = (p: Project) => (p.image ? `/assets/${p.image}` : '')
export const galleryPath = (src: string) => `/assets/shots/${src}`
// What represents a project visually: its screenshot, else the first gallery image, else nothing (icon art).
export const coverSrc = (p: Project) => shotSrc(p) || (p.gallery?.[0] ? galleryPath(p.gallery[0].src) : '')

const PAL: [string, string][] = [
  ['#2f5fb3', '#6aa8ff'], ['#6b3fb0', '#b48cff'], ['#b4533c', '#ffb07a'], ['#1f7a64', '#6fe0b9'],
  ['#a3612a', '#ffcf7a'], ['#3640a6', '#8fa0ff'], ['#8a3a6e', '#ff8fc4'], ['#2a6f9e', '#7fd6ff'],
]
export const hues = (p: Project) => {
  const [a, b] = PAL[p.id % PAL.length]
  return { '--h1': a, '--h2': b } as CSSProperties
}

export const initials = (n: string) => {
  const w = n.replace(/\(.*?\)/g, '').split(/[\s-]+/).filter((x) => /^[A-Za-z0-9]/.test(x))
  if (!w.length) return '?'
  if (w.length > 1 && w[0].length < 6) return (w[0][0] + w[1][0]).toUpperCase()
  return w[0].slice(0, w[0] === w[0].toUpperCase() && w[0].length <= 5 ? 2 : 1).toUpperCase()
}

// How many projects list this technology in their stack (projects.json "stack").
export const projectsUsing = (t: StackItem, projects: Project[]) => {
  const names = [t.name, ...(t.match ?? [])].map((n) => n.toLowerCase())
  return projects.filter((p) => p.stack?.some((s) => names.includes(s.toLowerCase())))
}

// Projects done in a role: listed explicitly in work.json ("projects"), otherwise the projects whose client is
// the employer (spelling differences like "Bapppeda" ignored) and whose year falls inside the role's dates.
const sameOrg = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(.)\1+/g, '$1')
export function projectsForWork(w: Work, projects: Project[]): Project[] {
  const list = w.projects
    ? w.projects.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p)
    : projects.filter((p) => {
        const from = parseMonthLocal(w.startDate)?.getFullYear() ?? 0
        const to = parseMonthLocal(w.endDate)?.getFullYear() ?? 9999
        return sameOrg(p.company) === sameOrg(w.name) && Number(p.year) >= from && Number(p.year) <= to
      })
  return [...list].sort((a, b) => Number(b.year) - Number(a.year) || b.id - a.id)
}

export const statusOf = (p: Project): [string, string, string] =>
  p.status ? [t('In testing'), p.status, 'warn'] : hasLink(p) ? [t('Live'), host(p), 'ok'] : [t('Internal'), t('No public link'), '']

export const TZ = 'Asia/Makassar' // Makassar, WITA (UTC+8)
export const isMobile = () => window.matchMedia('(max-width: 760px)').matches
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
