import { useEffect, useState } from 'react'

export interface Profile {
  name: string
  nickname: string
  job: string
  description: string
  contacts: { email: string; linkedin: string; address: string }
}

export interface Project {
  id: number
  name: string
  company: string
  year: string
  role: string[]
  image: string
  logo?: string // file in public/assets/logo, shown as the app icon
  gallery?: { src: string; caption: string; url?: string }[] // screenshots in public/assets/shots
  impact?: {
    purpose: string // why the app exists
    saving: { value: string; label: string; estimate?: boolean } // work cut by the app; estimate = not measured
    changes: { before: string; after: string }[] // what changed once it was in use
  }
  desc: string
  link: string
  stack?: string[]
  status?: string
  metrics?: { value: string; label: string }[]
}

export interface Work {
  id: number
  name: string
  role: string[]
  startDate: string
  endDate: string | null
  highlights?: string
  projects?: number[] // ids from projects.json; when set, replaces the automatic match by client and year
}

export interface Social {
  name: string
  url: string
  icon: string
}

// Roles left off the landing page: the portfolio focuses on engineering.
const HIDDEN_ROLES = ['Project Manager']
export const engineeringRoles = (roles: string[]) => roles.filter((r) => !HIDDEN_ROLES.includes(r))

export function useJson<T>(path: string): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    let alive = true
    fetch(path)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch((e) => console.error(`Failed to load ${path}`, e))
    return () => {
      alive = false
    }
  }, [path])
  return data
}

// work.json mixes English and Indonesian month names ("Januari", "Desember").
const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, mei: 4, jun: 5, jul: 6,
  aug: 7, agu: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11, des: 11,
}

export function parseMonth(s: string | null): Date | null {
  if (!s) return null
  const [m, y] = s.trim().split(/\s+/)
  const month = MONTHS[m.slice(0, 3).toLowerCase()]
  if (month === undefined || !y) return null
  return new Date(Number(y), month, 1)
}

export function shortMonth(d: Date | null) {
  return d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'
}

export function duration(start: Date | null, end: Date | null) {
  if (!start) return ''
  const e = end ?? new Date()
  const months = Math.max(1, (e.getFullYear() - start.getFullYear()) * 12 + e.getMonth() - start.getMonth() + (end ? 1 : 0))
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}
