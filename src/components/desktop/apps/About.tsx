import { useEffect, useState, type ReactNode } from 'react'
import DOMPurify from 'dompurify'
import { useDesktop } from '../context'
import { ENABLED as on, TZ, engineeringRoles, fmtMY, hasLink, parseMonth, projectsForWork, type Theme } from '../data'
import { UI } from '../ui'
import { locale, t, tn } from '../i18n'
import { useInnerBack } from '../nav'

// "About This Engineer", laid out like System Settings: a sidebar of panes, each a hero card plus grouped rows.

type Pane = 'profile' | 'location' | 'work' | 'experience' | 'projects' | 'contact' | 'appearance'

const g = (d: ReactNode) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)
const GLYPH: Record<Pane, ReactNode> = {
  profile: g(<><circle cx="8" cy="5.6" r="2.6" /><path d="M3 13.6c.8-2.6 2.7-3.8 5-3.8s4.2 1.2 5 3.8" /></>),
  location: g(<><path d="M8 14.4s4.6-4.2 4.6-7.8a4.6 4.6 0 0 0-9.2 0c0 3.6 4.6 7.8 4.6 7.8Z" /><circle cx="8" cy="6.6" r="1.6" /></>),
  work: g(<path d="M5.6 4.2 2 8l3.6 3.8M10.4 4.2 14 8l-3.6 3.8" />),
  experience: g(<><rect x="2" y="5" width="12" height="8.6" rx="1.6" /><path d="M5.8 5V3.6c0-.6.4-1 1-1h2.4c.6 0 1 .4 1 1V5M2 9h12" /></>),
  projects: g(<><rect x="2.4" y="2.4" width="4.6" height="4.6" rx="1.2" /><rect x="9" y="2.4" width="4.6" height="4.6" rx="1.2" /><rect x="2.4" y="9" width="4.6" height="4.6" rx="1.2" /><rect x="9" y="9" width="4.6" height="4.6" rx="1.2" /></>),
  contact: g(<><rect x="2" y="3.6" width="12" height="9" rx="1.6" /><path d="m2.6 4.6 5.4 4 5.4-4" /></>),
  appearance: g(<><circle cx="8" cy="8" r="5.8" /><path d="M8 2.2v11.6A5.8 5.8 0 0 0 8 2.2Z" fill="currentColor" /></>),
}
const TINT: Record<Pane, string> = {
  profile: '#8e8e93',
  location: '#2f7cf6',
  work: '#5e5ce6',
  experience: '#f08c2a',
  projects: '#2f7cf6',
  contact: '#30a8f2',
  appearance: '#1c1c1e',
}
const LABEL: Record<Pane, string> = {
  profile: 'Profile',
  location: 'Location',
  work: 'How I Work',
  experience: 'Experience',
  projects: 'Projects',
  contact: 'Contact',
  appearance: 'Appearance',
}
const GROUPS: Pane[][] = [['location', 'work'], ['experience', 'projects'], ['contact'], ['appearance']]
const SAFE = { ALLOWED_TAGS: ['b', 'strong', 'em', 'i'] }

const Icon = ({ pane, size = 26 }: { pane: Pane; size?: number }) => (
  <span className="ss-ic" style={{ background: TINT[pane], width: size, height: size }}>
    {GLYPH[pane]}
  </span>
)

function Row({ label, sub, value, onClick, href }: { label: ReactNode; sub?: ReactNode; value?: ReactNode; onClick?: () => void; href?: string }) {
  const body = (
    <>
      {sub !== undefined ? (
        <span className="ss-l two">
          <span>{label}</span>
          <small>{sub}</small>
        </span>
      ) : (
        <span className="ss-l">{label}</span>
      )}
      {value !== undefined && <span className="ss-v">{value}</span>}
      {(onClick || href) && <span className="ss-chev">{href ? UI.ext : UI.fwd}</span>}
    </>
  )
  if (href)
    return (
      <a className="ss-row link" href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    )
  if (onClick)
    return (
      <button className="ss-row link" onClick={onClick}>
        {body}
      </button>
    )
  return <div className="ss-row">{body}</div>
}

const Card = ({ children }: { children: ReactNode }) => <div className="ss-card">{children}</div>

function Hero({ pane, title, children, avatar }: { pane: Pane; title: string; children?: ReactNode; avatar?: string }) {
  return (
    <div className="ss-hero">
      {avatar ? <span className="ss-avatar big">{avatar}</span> : <Icon pane={pane} size={64} />}
      <h1>{title}</h1>
      {children && <div className="ss-desc">{children}</div>}
    </div>
  )
}

const clockText = () => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', weekday: 'long', timeZone: TZ }).format(new Date())
function useClock(lang: string) {
  const [now, setNow] = useState(clockText)
  useEffect(() => {
    setNow(clockText())
    const id = setInterval(() => setNow(clockText()), 15000)
    return () => clearInterval(id)
  }, [lang])
  return now
}

export default function About() {
  const { data, open, theme, setTheme, lang, openProject } = useDesktop()
  const { profile, projects, work, stack, socials } = data
  const [hist, setHist] = useState<{ list: Pane[]; i: number }>({ list: ['profile'], i: 0 })
  const [q, setQ] = useState('')
  const [reading, setReading] = useState(false) // narrow windows: sidebar or pane
  const [copied, setCopied] = useState(false)
  const clock = useClock(lang)
  useInnerBack(reading, t('Settings'), () => setReading(false))

  const pane = hist.list[hist.i]
  const go = (p: Pane) => {
    setReading(true)
    if (p === pane) return
    setHist((h) => ({ list: [...h.list.slice(0, h.i + 1), p], i: h.i + 1 }))
  }

  const initials = profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
  const firstYear = Math.min(...projects.map((p) => Number(p.year)))
  const jobs = work
    .map((w) => ({ ...w, s: parseMonth(w.startDate), e: parseMonth(w.endDate) }))
    .sort((a, b) => (b.s?.getTime() ?? 0) - (a.s?.getTime() ?? 0))
  const current = jobs.filter((w) => !w.e)
  const earliest = jobs[jobs.length - 1]?.s
  const roleOf = (r: string[]) => engineeringRoles(r)[0] ?? r[0]
  const live = projects.filter(hasLink).length
  const [city, country = ''] = profile.contacts.address.split(',').map((s) => s.trim())

  // Roles across projects, counted from projects.json.
  const roleCounts = new Map<string, number>()
  projects.forEach((p) => engineeringRoles(p.role).forEach((r) => roleCounts.set(r, (roleCounts.get(r) ?? 0) + 1)))
  const roles = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])
  const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => Number(b) - Number(a))

  const qq = q.trim().toLowerCase()
  const match = (p: Pane) => !qq || t(LABEL[p]).toLowerCase().includes(qq) || LABEL[p].toLowerCase().includes(qq)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.contacts.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard refused: the address stays selectable in the row */
    }
  }

  let body: ReactNode
  switch (pane) {
    case 'profile':
      body = (
        <>
          <Hero pane="profile" title={profile.name} avatar={initials}>
            <p className="ss-sub">
              {profile.job} · @{profile.nickname}
            </p>
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.description, SAFE) }} />
          </Hero>
          <Card>
            <Row label={t('Name')} value={profile.name} />
            <Row label={t('Role')} value={profile.job} />
            <Row label={t('Building since')} value={firstYear} />
            <Row label={t('Projects')} value={t('{n} built, {m} public', { n: projects.length, m: live })} onClick={() => go('projects')} />
          </Card>
          {current.length > 0 && (
            <>
              <h2 className="ss-h">{t('Currently')}</h2>
              <Card>
                {current.map((w) => (
                  <Row key={w.id} label={w.name} value={roleOf(w.role)} />
                ))}
              </Card>
            </>
          )}
        </>
      )
      break
    case 'location':
      body = (
        <>
          <Hero pane="location" title={t('Location')}>
            <p>{t('Based in {addr}. Local time follows WITA (UTC+8).', { addr: profile.contacts.address })}</p>
          </Hero>
          <Card>
            <Row label={t('City')} value={city} />
            {country && <Row label={t('Country')} value={country} />}
            <Row label={t('Time zone')} value="WITA (UTC+8)" />
            <Row label={t('Local time')} value={clock} />
          </Card>
          <Card>
            <Row label={t('Open in Maps')} href={`https://maps.google.com/?q=${encodeURIComponent(profile.contacts.address)}`} />
          </Card>
        </>
      )
      break
    case 'work':
      body = (
        <>
          <Hero pane="work" title={t('How I Work')}>
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.description, SAFE) }} />
          </Hero>
          <h2 className="ss-h">{t('Roles on my projects')}</h2>
          <Card>
            {roles.map(([r, n]) => (
              <Row key={r} label={r} value={tn(n, '{n} project', '{n} projects')} />
            ))}
          </Card>
          <h2 className="ss-h">{t('Across the stack')}</h2>
          <Card>
            {stack.categories.map((c) => {
              const top = [...c.items].sort((a, b) => (b.level ?? -1) - (a.level ?? -1)).slice(0, 3)
              return <Row key={c.id} label={c.name} value={top.map((x) => x.name).join(', ')} onClick={on.stack ? () => open('stack') : undefined} />
            })}
          </Card>
        </>
      )
      break
    case 'experience':
      body = (
        <>
          <Hero pane="experience" title={t('Experience')}>
            <p>{t('{n} roles since {d}, {c} of them current.', { n: jobs.length, d: earliest ? fmtMY(earliest) : '—', c: current.length })}</p>
          </Hero>
          <Card>
            {jobs.map((w) => {
              const done = projectsForWork(w, projects)
              return (
                <Row
                  key={w.id}
                  label={w.name}
                  sub={`${roleOf(w.role)} · ${w.s ? fmtMY(w.s) : '?'} – ${w.e ? fmtMY(w.e) : t('Present')}`}
                  value={done.length ? tn(done.length, '{n} project', '{n} projects') : undefined}
                  onClick={done.length && on.projects ? () => openProject(done[0].id) : undefined}
                />
              )
            })}
          </Card>
          {on.experience && (
            <Card>
              <Row label={t('Open timeline')} onClick={() => open('experience')} />
            </Card>
          )}
        </>
      )
      break
    case 'projects':
      body = (
        <>
          <Hero pane="projects" title={t('Projects')}>
            <p>{t('{n} projects since {y}, {m} with a public website.', { n: projects.length, y: firstYear, m: live })}</p>
          </Hero>
          <Card>
            {years.map((y) => {
              const n = projects.filter((p) => p.year === y).length
              return <Row key={y} label={y} value={tn(n, '{n} project', '{n} projects')} />
            })}
          </Card>
          {on.projects && (
            <Card>
              <Row label={t('Browse projects')} onClick={() => open('projects')} />
            </Card>
          )}
        </>
      )
      break
    case 'contact':
      body = (
        <>
          <Hero pane="contact" title={t('Contact')}>
            <p>{t('Email reaches me directly. Socials are below.')}</p>
          </Hero>
          <Card>
            <div className="ss-row">
              <span className="ss-l">Email</span>
              <span className="ss-v sel">{profile.contacts.email}</span>
              <button className="ss-mini" onClick={copy}>
                {t(copied ? 'Copied' : 'Copy')}
              </button>
            </div>
            {socials.map((s) => (
              <Row key={s.name} label={s.name} value={s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} href={s.url} />
            ))}
          </Card>
          {on.contact && (
            <Card>
              <Row label={t('Write a message')} onClick={() => open('contact')} />
            </Card>
          )}
        </>
      )
      break
    case 'appearance': {
      const opts: { id: Theme; label: string }[] = [
        { id: 'auto', label: t('Auto') },
        { id: 'light', label: t('Light') },
        { id: 'dark', label: t('Dark') },
      ]
      body = (
        <>
          <Hero pane="appearance" title={t('Appearance')}>
            <p>{t('Choose how this desktop looks. Auto follows your device.')}</p>
          </Hero>
          <Card>
            <div className="ss-appear" role="radiogroup" aria-label={t('Appearance')}>
              {opts.map((o) => (
                <button key={o.id} role="radio" aria-checked={theme === o.id} className={`ss-th ${o.id}`} onClick={() => setTheme(o.id)}>
                  <span className="pv" />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </>
      )
      break
    }
  }

  return (
    <div className={`ss${reading ? ' reading' : ''}`}>
      <aside className="ss-side" data-drag>
        <label className="st-search ss-search">
          {UI.search}
          <input type="search" placeholder={t('Search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('Search settings')} autoComplete="off" />
        </label>
        <nav className="ss-nav" aria-label={t('Settings')}>
          {(match('profile') || profile.name.toLowerCase().includes(qq)) && (
            <button className="ss-me" aria-current={pane === 'profile'} onClick={() => go('profile')}>
              <span className="ss-avatar">{initials}</span>
              <span>
                <b>{profile.name}</b>
                <small>{t('Profile')}</small>
              </span>
            </button>
          )}
          {GROUPS.map((grp, i) => {
            const items = grp.filter(match)
            return items.length ? (
              <div className="ss-group" key={i}>
                {items.map((p) => (
                  <button key={p} aria-current={pane === p} onClick={() => go(p)}>
                    <Icon pane={p} />
                    {t(LABEL[p])}
                  </button>
                ))}
              </div>
            ) : null
          })}
        </nav>
      </aside>
      <section className="ss-main scroll" aria-label={t(LABEL[pane])}>
        <div className="ss-top" data-drag>
          <button className="ss-back-sm" onClick={() => setReading(false)} aria-label={t('All settings')}>
            {UI.back}
          </button>
          <div className="ss-hist">
            <button aria-label={t('Back')} disabled={hist.i === 0} onClick={() => setHist((h) => ({ ...h, i: h.i - 1 }))}>
              {UI.back}
            </button>
            <button aria-label={t('Forward')} disabled={hist.i >= hist.list.length - 1} onClick={() => setHist((h) => ({ ...h, i: h.i + 1 }))}>
              {UI.fwd}
            </button>
          </div>
          <span className="ss-ttl">{t(LABEL[pane])}</span>
        </div>
        <div className="ss-body">{body}</div>
      </section>
    </div>
  )
}
