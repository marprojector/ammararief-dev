import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { APPS, ENABLED as on, TZ, VISIBLE, isMobile, reduced, type AppId, type DesktopData, type Theme } from './data'
import { AppIcon } from './icons'
import { UI } from './ui'
import { DesktopCtx } from './context'
import Window, { type WinControls, type WinState } from './Window'
import About from './apps/About'
import Projects from './apps/Projects'
import Experience from './apps/Experience'
import Terminal from './apps/Terminal'
import Contact from './apps/Contact'
import Notes from './apps/Notes'
import Spotify from './apps/Spotify'
import Stack from './apps/Stack'
import { artists, useSpotify } from './spotify'
import { locale, localize, setCurrentLang, t, type DataOverlay, type Lang } from './i18n'
import './desktop.css'

const THEMES: Theme[] = ['auto', 'light', 'dark']
const THEME_KEY = 'yl-theme'
const readTheme = (): Theme => {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

const LANG_KEY = 'yl-lang'
// Saved choice first; otherwise Indonesian browsers start in Indonesian, everyone else in English.
const readLang = (): Lang => {
  try {
    const l = localStorage.getItem(LANG_KEY)
    if (l === 'en' || l === 'id') return l
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
}
const LANGS: { id: Lang; name: string; short: string }[] = [
  { id: 'en', name: 'English', short: 'EN' },
  { id: 'id', name: 'Bahasa Indonesia', short: 'ID' },
]

const DOCK_H = 92
// Phones: the iOS dock holds four apps; the rest sit on the home screen grid.
const MOBILE_DOCK: AppId[] = ['projects', 'notes', 'terminal', 'contact']
const iosTime = () => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date())

function useMobile() {
  const [m, setM] = useState(isMobile)
  useEffect(() => {
    const q = window.matchMedia('(max-width: 760px)')
    const on = () => setM(q.matches)
    q.addEventListener('change', on)
    return () => q.removeEventListener('change', on)
  }, [])
  return m
}

// The icon a window opens from and closes into: whichever copy (dock or home grid) is on screen.
const iconFor = (id: AppId) =>
  [...document.querySelectorAll<HTMLElement>(`.mac [data-app="${id}"]`)].find((e) => !e.closest('.win') && e.getBoundingClientRect().width > 0) ?? null
const clockText = () =>
  new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date()).replaceAll(',', '')

const APP_VIEWS: Record<AppId, () => ReactElement> = {
  about: () => <About />,
  projects: () => <Projects />,
  experience: () => <Experience />,
  stack: () => <Stack />,
  notes: () => <Notes />,
  spotify: () => <Spotify />,
  terminal: () => <Terminal />,
  contact: () => <Contact />,
}

export default function Desktop({ data: source, overlay }: { data: DesktopData; overlay?: DataOverlay | null }) {
  const deskRef = useRef<HTMLElement>(null)
  const dockRef = useRef<HTMLElement>(null)
  const zRef = useRef(10)
  const cascade = useRef(0)
  const ctrl = useRef(new Map<AppId, WinControls>())
  const [wins, setWins] = useState<WinState[]>([])
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [lang, setLang] = useState<Lang>(readLang)
  setCurrentLang(lang) // before any child renders, so every t() call this render uses it
  const data = useMemo(() => localize(source, overlay ?? null, lang), [source, overlay, lang])
  const [menu, setMenu] = useState<null | 'sys' | 'lang'>(null)
  const menuOpen = menu !== null
  const setMenuOpen = (o: boolean) => setMenu(o ? 'sys' : null)
  const [clock, setClock] = useState(clockText)
  const mobile = useMobile()
  const [projectFocus, setProjectFocus] = useState<{ id: number; n: number } | null>(null)
  const [toast, setToast] = useState('')

  const top = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]

  const open = useCallback((id: AppId, opts: { x?: number; y?: number; w?: number; h?: number; silent?: boolean } = {}) => {
    setMenuOpen(false)
    if (!on[id]) return
    setWins((ws) => {
      const z = ++zRef.current
      const ex = ws.find((w) => w.id === id)
      if (ex) return ws.map((w) => (w.id === id ? { ...w, min: false, z, silent: false } : w))
      const desk = deskRef.current
      const dw = desk?.clientWidth ?? 1200
      const dh = (desk?.clientHeight ?? 800) - DOCK_H
      const app = APPS[id]
      const w = Math.min(opts.w ?? app.w, dw - 32)
      const h = Math.min(opts.h ?? app.h, dh - 24)
      const c = cascade.current++ % 5
      const x = opts.x ?? Math.max(16, Math.min(dw - w - 16, Math.round((dw - w) / 2 + c * 26 - 40)))
      const y = opts.y ?? Math.max(12, Math.min(dh - h - 8, Math.round((dh - h) / 2.6 + c * 22)))
      return [...ws, { id, x, y, w, h, z, min: false, max: false, silent: opts.silent }]
    })
    if (!opts.silent && !reduced()) {
      const d = dockRef.current?.querySelector<HTMLElement>(`[data-app="${id}"]`)
      if (d) {
        d.classList.remove('bounce')
        void d.offsetWidth
        d.classList.add('bounce')
      }
    }
  }, [])

  const openProject = useCallback(
    (id: number) => {
      open('projects')
      setProjectFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }))
    },
    [open],
  )

  const patch = (id: AppId, p: Partial<WinState>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)))
  const remove = (id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id))
  const focus = (id: AppId) => {
    if (top?.id !== id) patch(id, { z: ++zRef.current })
  }

  // First paint: a working desktop, not an empty wallpaper.
  useLayoutEffect(() => {
    if (isMobile()) return
    const desk = deskRef.current
    if (!desk) return
    const dw = desk.clientWidth
    const dh = desk.clientHeight - DOCK_H
    if (dw >= 1180 && on.about && on.projects) {
      const bw = Math.min(APPS.projects.w, Math.round(dw * 0.6))
      const bh = Math.min(APPS.projects.h, dh - 30)
      // Projects first, then the profile, so the profile starts in front and active.
      open('projects', { silent: true, w: bw, h: bh, x: dw - bw - 108, y: Math.max(14, Math.round((dh - bh) / 2.4)) })
      open('about', { silent: true, w: Math.min(720, Math.round(dw * 0.5)), x: Math.max(24, Math.round(dw * 0.035)), y: Math.max(16, Math.round(dh * 0.09)) })
    } else {
      const first = on.projects ? 'projects' : VISIBLE[0]
      if (first) open(first, { silent: true, x: 16, y: 12 })
    }
  }, [open])

  // Deep links: /#notes, /#projects … open that app on load.
  useEffect(() => {
    const id = window.location.hash.slice(1) as AppId
    if (id in APPS) open(id)
  }, [open])

  useEffect(() => {
    setClock(clockText())
    const id = setInterval(() => setClock(clockText()), 15000)
    return () => clearInterval(id)
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* storage unavailable: language still applies for this visit */
    }
  }, [lang])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
  }, [theme])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 1600)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => !(e.target as HTMLElement).closest('.menu, #logoBtn, #langBtn') && setMenu(null)
    const key = (e: KeyboardEvent) => {
      const menu = document.querySelector<HTMLElement>('.mac .menu')
      if (e.key === 'Escape') setMenu(null)
      if (menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const bs = [...menu.querySelectorAll<HTMLElement>('button, a')]
        const i = bs.indexOf(document.activeElement as HTMLElement)
        bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length]?.focus()
        e.preventDefault()
      }
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', key)
    document.querySelector<HTMLElement>('.mac .menu button')?.focus()
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', key)
    }
  }, [menuOpen])

  const chooseLang = (l: Lang) => {
    setMenu(null)
    setLang(l)
    setCurrentLang(l)
    setToast(t('Language: {name}', { name: LANGS.find((x) => x.id === l)!.name }))
  }

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % 3]
    setTheme(next)
    setToast(t('Appearance: {mode}', { mode: t(next === 'auto' ? 'match system' : next) }))
  }

  const dockClick = (id: AppId) => {
    const w = wins.find((x) => x.id === id)
    if (w && !w.min && top?.id === id && !isMobile()) ctrl.current.get(id)?.minimize()
    else open(id)
  }

  // Dock magnification follows the pointer, like the real thing.
  const magnify = (e: RPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reduced() || isMobile()) return
    e.currentTarget.querySelectorAll<HTMLElement>('.dock-item').forEach((it) => {
      const r = it.getBoundingClientRect()
      const d = Math.abs(e.clientX - (r.left + r.width / 2))
      const s = 1 + 0.42 * Math.max(0, 1 - d / 120) ** 1.6
      it.style.transform = `scale(${s.toFixed(3)})`
      it.style.margin = `0 ${((s - 1) * 22).toFixed(1)}px`
    })
  }
  const unmagnify = (e: RPointerEvent<HTMLElement>) =>
    e.currentTarget.querySelectorAll<HTMLElement>('.dock-item').forEach((it) => {
      it.style.transform = ''
      it.style.margin = ''
    })

  const { profile, socials } = data
  const github = socials.find((s) => s.name === 'GitHub')?.url
  const running = new Set(wins.map((w) => w.id))
  const check = (on: boolean) => <span className="check">{on ? '✓' : ''}</span>

  return (
    <DesktopCtx.Provider value={{ data, open, theme, setTheme, lang, setLang: chooseLang, openProject, projectFocus }}>
      <div className={`mac${mobile && top ? ' app-open' : ''}`} data-theme={theme === 'auto' ? undefined : theme}>
        <div className="os">
          <Wallpaper />

          <header className="menubar">
            <span className="mb-ios-time" aria-hidden="true">{iosTime()}</span>
            <button className="mb-btn mb-logo" id="logoBtn" aria-haspopup="menu" aria-expanded={menu === 'sys'} aria-label={t('System menu')} onClick={() => setMenu((m) => (m === 'sys' ? null : 'sys'))}>
              {UI.logo}
            </button>
            <span className="mb-btn mb-app">{t(top ? APPS[top.id].dock : 'Desktop')}</span>
            <nav className="mb-nav" aria-label={t('Applications')}>
              {on.projects && <button className="mb-btn" onClick={() => open('projects')}>{t('Projects')}</button>}
              {on.experience && <button className="mb-btn" onClick={() => open('experience')}>{t('Experience')}</button>}
              {on.stack && <button className="mb-btn" onClick={() => open('stack')}>{t('Skills')}</button>}
              {on.terminal && <button className="mb-btn" onClick={() => open('terminal')}>{t('Terminal')}</button>}
              {on.contact && <button className="mb-btn" onClick={() => open('contact')}>{t('Contact')}</button>}
              {on.notes && <button className="mb-btn" onClick={() => open('notes')}>{t('Blog')}</button>}
            </nav>
            <div className="mb-right">
              {github && (
                <a className="mb-btn mb-hide" href={github} target="_blank" rel="noopener noreferrer" aria-label={t('GitHub profile')} style={{ color: 'inherit' }}>
                  {UI.gh}
                </a>
              )}
              {on.spotify && <NowPlaying onOpen={() => open('spotify')} />}
              <span className="mb-langwrap">
                <button className="mb-btn mb-lang" id="langBtn" aria-haspopup="menu" aria-expanded={menu === 'lang'} aria-label={t('Change language')} onClick={() => setMenu((m) => (m === 'lang' ? null : 'lang'))}>
                  <span>{LANGS.find((x) => x.id === lang)!.short}</span>
                </button>
                {menu === 'lang' && (
                  <div className="menu menu-right" role="menu">
                    {LANGS.map((l) => (
                      <button key={l.id} role="menuitem" lang={l.id} onClick={() => chooseLang(l.id)}>
                        <span>
                          {check(lang === l.id)}
                          {l.name}
                        </span>
                        <span className="kbd">{l.short}</span>
                      </button>
                    ))}
                  </div>
                )}
              </span>
              <button className="mb-btn" aria-label={t('Change appearance')} onClick={cycleTheme}>
                {UI.theme}
              </button>
              <span className="mb-btn mb-hide" aria-hidden="true">{UI.wifi}</span>
              <span className="mb-btn mb-clock" title={t('Local time in Gorontalo')}>
                {clock} <span className="mb-tz">WITA</span>
              </span>
            </div>
            {menu === 'sys' && (
              <div className="menu" role="menu" style={{ left: 6 }}>
                {on.about && (
                  <>
                    <button role="menuitem" onClick={() => open('about')}>{t('About {name}', { name: profile.name })}</button>
                    <hr />
                  </>
                )}
                {on.projects && (
                  <button role="menuitem" onClick={() => open('projects')}>
                    {t('Projects')}<span className="kbd">{data.projects.length}</span>
                  </button>
                )}
                {on.experience && <button role="menuitem" onClick={() => open('experience')}>{t('Experience')}</button>}
                {on.stack && <button role="menuitem" onClick={() => open('stack')}>{t('Tech Stack')}</button>}
                {on.terminal && <button role="menuitem" onClick={() => open('terminal')}>{t('Terminal')}</button>}
                {on.contact && <button role="menuitem" onClick={() => open('contact')}>{t('Contact')}</button>}
                {on.notes && <button role="menuitem" onClick={() => open('notes')}>{t('Blog in Notes')}</button>}
                {on.spotify && <button role="menuitem" onClick={() => open('spotify')}>Spotify</button>}
                <Link role="menuitem" to="/blog">{t('Blog page')}</Link>
                <hr />
                {THEMES.map((th) => (
                  <button key={th} role="menuitem" onClick={() => { setTheme(th); setMenuOpen(false) }}>
                    <span>{check(theme === th)}{t(th === 'auto' ? 'Match system appearance' : th === 'light' ? 'Light' : 'Dark')}</span>
                  </button>
                ))}
                <hr />
                <button role="menuitem" onClick={() => { setMenuOpen(false); ctrl.current.forEach((c) => c.close()) }}>{t('Close all windows')}</button>
              </div>
            )}
          </header>

          <main className="desk" ref={deskRef}>
            <div className="desk-icons">
              {on.about && (
              <button className="desk-icon" onClick={() => open('about')} aria-label={t('Open README')}>
                <svg viewBox="0 0 52 52" aria-hidden="true">
                  <path d="M10 4h22l12 12v30a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#fbfaf7" />
                  <path d="M32 4v10a2 2 0 0 0 2 2h10" fill="#e3ded6" />
                  <g fill="#9a95a2">
                    <rect x="14" y="22" width="20" height="2.4" rx="1.2" />
                    <rect x="14" y="28" width="24" height="2.4" rx="1.2" />
                    <rect x="14" y="34" width="16" height="2.4" rx="1.2" />
                  </g>
                  <text x="14" y="17" fontFamily="Geist Mono, monospace" fontSize="7" fontWeight="600" fill="#0b63ce">MD</text>
                </svg>
                <span>README.md</span>
              </button>
              )}
              {on.projects && (
              <button className="desk-icon" onClick={() => open('projects')} aria-label={t('Open projects')}>
                <svg viewBox="0 0 52 52" aria-hidden="true">
                  <path d="M4 12a3 3 0 0 1 3-3h12l4 4h22a3 3 0 0 1 3 3v4H4v-8Z" fill="#5aa0e6" />
                  <path d="M4 18h44v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V18Z" fill="#7bb8f2" />
                  <path d="M4 18h44v2H4z" fill="#a6d0f8" />
                </svg>
                <span>{t('Projects')}</span>
              </button>
              )}
            </div>

            <section className="home" aria-label={t('Home')}>
              <button className="widget" onClick={() => open('about')} disabled={!on.about}>
                <span className="w-avatar">{profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                <span className="w-text">
                  <b>{profile.name}</b>
                  <span>{profile.job}</span>
                  <small>
                    {profile.contacts.address.split(',')[0]} · {iosTime()} WITA
                  </small>
                </span>
              </button>
              <div className="apps">
                {VISIBLE.filter((id) => !MOBILE_DOCK.includes(id)).map((id) => (
                  <button key={id} data-app={id} onClick={() => open(id)}>
                    <AppIcon id={id} />
                    <span>{t(APPS[id].dock)}</span>
                  </button>
                ))}
                {github && (
                  <a href={github} target="_blank" rel="noopener noreferrer">
                    <AppIcon id="github" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </section>

            <div>
              {wins.map((w) => (
                <Window
                  key={w.id}
                  win={w}
                  active={top?.id === w.id}
                  deskRef={deskRef}
                  dockItem={iconFor}
                  onFocus={() => focus(w.id)}
                  onClose={() => remove(w.id)}
                  onMinimize={() => patch(w.id, { min: true })}
                  onToggleMax={() => patch(w.id, { max: !w.max })}
                  onGeometry={(g) => patch(w.id, g)}
                  controls={(id, c) => (c ? ctrl.current.set(id, c) : ctrl.current.delete(id))}
                >
                  {APP_VIEWS[w.id]()}
                </Window>
              ))}
            </div>

            <div className="dock-wrap">
              <nav className="dock" aria-label="Dock" ref={dockRef} onPointerMove={magnify} onPointerLeave={unmagnify}>
                {VISIBLE.map((id) => (
                  <button key={id} className={`dock-item${running.has(id) ? ' running' : ''}${MOBILE_DOCK.includes(id) ? '' : ' desk-only'}`} data-app={id} aria-label={t('Open {app}', { app: t(APPS[id].dock) })} onClick={() => dockClick(id)}>
                    <AppIcon id={id} />
                    <span className="dot" />
                    <span className="tip">{t(APPS[id].dock)}</span>
                  </button>
                ))}
                {github && (
                  <>
                    <span className="dock-sep" aria-hidden="true" />
                    <a className="dock-item dock-ext" href={github} target="_blank" rel="noopener noreferrer" aria-label={t('GitHub (opens in a new tab)')}>
                      <AppIcon id="github" />
                      <span className="tip">GitHub ↗</span>
                    </a>
                  </>
                )}
              </nav>
            </div>
          </main>

          {toast && (
            <div className="toast" role="status">
              {toast}
            </div>
          )}
        </div>
      </div>
    </DesktopCtx.Provider>
  )
}

// Menu bar status item: shows the song only while it is actually playing.
function NowPlaying({ onOpen }: { onOpen: () => void }) {
  const { result } = useSpotify(60_000)
  if (result.status !== 'ok' || !result.data.now || !result.data.isPlaying) return null
  const song = result.data.now
  return (
    <button className="mb-btn mb-hide mb-np" onClick={onOpen} title={t('Listening now on Spotify')}>
      <span className="eq" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="mb-np-t">
        {song.name} — {artists(song)}
      </span>
    </button>
  )
}

// Wallpaper image: public/assets/background/background.webp
function Wallpaper() {
  return <div className="wall" aria-hidden="true" />
}
