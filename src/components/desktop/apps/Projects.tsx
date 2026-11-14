import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react'
import { useDesktop } from '../context'
import { FEATURED, coverSrc, engineeringRoles, galleryPath, hasLink, host, href, hues, initials, org, reduced, shotFallback, statusOf, type Project } from '../data'
import { UI } from '../ui'
import { t, tn } from '../i18n'
import { useInnerBack } from '../nav'

// How many projects the Discover list shows; the year pages and search still reach all of them.
const RECENT_LIMIT = 10

type View = { k: 'discover' } | { k: 'year'; y: string } | { k: 'search'; q: string } | { k: 'app'; id: number; from: View }

const rolesOf = (p: Project) => {
  const r = engineeringRoles(p.role)
  return r.length ? r : p.role
}

// webp copy first, original file if the copy is missing.
const fallback = (p: Project) => (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget
  const orig = shotFallback(p)
  if (orig && !img.src.endsWith(orig)) img.src = orig
}

// The project's own logo on a white tile when public/assets/logo has one, its initials otherwise.
function AppIcon({ p, size }: { p: Project; size?: number }) {
  const style = { ...hues(p), ...(size ? ({ '--s': `${size}px` } as CSSProperties) : {}) }
  return p.logo ? (
    <span className="ai has-logo" style={style} aria-hidden="true">
      <img src={`/assets/logo/${encodeURIComponent(p.logo)}`} alt="" loading="lazy" draggable={false} />
    </span>
  ) : (
    <span className="ai" style={style} aria-hidden="true">
      {initials(p.name)}
    </span>
  )
}

function Art({ p }: { p: Project }) {
  const src = coverSrc(p)
  return src ? (
    <img src={src} onError={fallback(p)} alt={t('Screenshot of {name}', { name: p.name })} loading="lazy" />
  ) : (
    <div className="pv-art" style={hues(p)}>
      <AppIcon p={p} />
    </div>
  )
}

function Row({ p, go, as = 'button' }: { p: Project; go: (id: number) => void; as?: 'button' | 'span' }) {
  const inner = (
    <>
      <AppIcon p={p} />
      <span style={{ minWidth: 0 }}>
        <span className="nm" style={{ display: 'block' }}>{p.name}</span>
        <span className="sb2" style={{ display: 'block' }}>
          {org(p)} · {p.year}
        </span>
      </span>
      <span className="pill">{t('View')}</span>
    </>
  )
  return as === 'span' ? (
    <span className="row-app">{inner}</span>
  ) : (
    <button className="row-app" onClick={() => go(p.id)}>
      {inner}
    </button>
  )
}

function Hero({ items, go }: { items: { p: Project; tag: string }[]; go: (id: number) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const hold = useRef(false)

  const current = () => {
    const t = track.current
    const first = t?.children[0] as HTMLElement | undefined
    return t && first ? Math.round(t.scrollLeft / (first.offsetWidth + 16)) : 0
  }
  const to = (i: number) => {
    const t = track.current
    if (!t) return
    const n = (i + items.length) % items.length
    const slide = t.children[n] as HTMLElement
    t.scrollTo({ left: slide.offsetLeft - t.offsetLeft, behavior: reduced() ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    if (reduced()) return
    const t = setInterval(() => !hold.current && to(current() + 1), 6500)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t('Selected projects')}
      onPointerEnter={() => (hold.current = true)}
      onPointerLeave={() => (hold.current = false)}
      onFocus={() => (hold.current = true)}
      onBlur={() => (hold.current = false)}
    >
      <div className="track" ref={track} onScroll={() => requestAnimationFrame(() => setIdx(current()))}>
        {items.map(({ p, tag }, i) => {
          const m = p.metrics?.[0]
          return (
            <button key={p.id} className="slide" style={hues(p)} onClick={() => go(p.id)} aria-label={t('{name}, {i} of {n}', { name: p.name, i: i + 1, n: items.length })}>
              <span className="sl-text">
                <span>
                  <h2>{p.name}</h2>
                  <p className="co">
                    {org(p)} · {p.year}
                  </p>
                  {p.status && <span className="st">{p.status}</span>}
                </span>
                <p className="tag">{t(tag)}</p>
              </span>
              <span className="sl-art">
                {coverSrc(p) ? (
                  <span className="frame">
                    <img src={coverSrc(p)} onError={fallback(p)} alt="" loading="lazy" />
                  </span>
                ) : (
                  <>
                    <span className="orb">
                      <AppIcon p={p} />
                    </span>
                    {m && (
                      <span className="fig">
                        <b>{m.value}</b>
                        <span>{m.label}</span>
                      </span>
                    )}
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
      <button className="hero-btn prev" aria-label={t('Previous project')} disabled={idx === 0} onClick={() => to(current() - 1)}>
        {UI.back}
      </button>
      <button className="hero-btn next" aria-label={t('Next project')} onClick={() => to(current() + 1)}>
        {UI.fwd}
      </button>
      <div className="dots">
        {items.map(({ p }, i) => (
          <button key={p.id} aria-label={t('Show {name}', { name: p.name })} aria-current={idx === i} onClick={() => to(i)} />
        ))}
      </div>
    </section>
  )
}

// App Store-style screenshot strip; click one to see it large.
function Gallery({ p }: { p: Project }) {
  const items = p.gallery ?? []
  const [at, setAt] = useState<number | null>(null)
  const n = items.length

  useEffect(() => {
    if (at === null) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAt(null)
      if (e.key === 'ArrowRight') setAt((i) => (i === null ? i : (i + 1) % n))
      if (e.key === 'ArrowLeft') setAt((i) => (i === null ? i : (i - 1 + n) % n))
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [at, n])

  const cur = at !== null ? items[at] : null
  return (
    <>
      <div className="gal">
        {items.map((g, i) => (
          <button key={g.src} className="gal-item" onClick={() => setAt(i)}>
            <img src={galleryPath(g.src)} alt={g.caption} loading="lazy" />
            <span>{g.caption}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={cur.caption} onClick={(e) => e.target === e.currentTarget && setAt(null)}>
          <button className="lb-close" aria-label={t('Close preview')} onClick={() => setAt(null)} autoFocus>
            {UI.x}
          </button>
          {n > 1 && (
            <button className="lb-nav prev" aria-label={t('Previous screenshot')} onClick={() => setAt(((at ?? 0) - 1 + n) % n)}>
              {UI.back}
            </button>
          )}
          <figure>
            <img src={galleryPath(cur.src)} alt={cur.caption} />
            <figcaption>
              <span>{cur.caption}</span>
              <span className="lb-meta">
                {t('{i} of {n}', { i: (at ?? 0) + 1, n })}
                {cur.url && (
                  <a href={cur.url} target="_blank" rel="noopener noreferrer">
                    {t('Open this page')} {UI.ext}
                  </a>
                )}
              </span>
            </figcaption>
          </figure>
          {n > 1 && (
            <button className="lb-nav next" aria-label={t('Next screenshot')} onClick={() => setAt(((at ?? 0) + 1) % n)}>
              {UI.fwd}
            </button>
          )}
        </div>
      )}
    </>
  )
}

function Detail({ p, back, backLabel, go, all }: { p: Project; back: () => void; backLabel: string; go: (id: number) => void; all: Project[] }) {
  const [sv, ss, sc] = statusOf(p)
  const roles = rolesOf(p)
  const more = all.filter((x) => x.year === p.year && x.id !== p.id)
  return (
    <div className="st-page" data-drag="self">
      <button className="back" onClick={back}>
        {UI.back}
        {backLabel}
      </button>
      <header className="app-head">
        <AppIcon p={p} />
        <div>
          <h1>{p.name}</h1>
          <p className="sub">{org(p)}</p>
          <div className="acts">
            {hasLink(p) ? (
              <>
                <a className="pill primary" href={href(p)} target="_blank" rel="noopener noreferrer">
                  {t('Visit site')} {UI.ext}
                </a>
                <span className="note">{host(p)}</span>
              </>
            ) : (
              <>
                <span className="pill off">{t('Internal system')}</span>
                <span className="note">{t('Not publicly hosted')}</span>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="strip">
        <div>
          <span className="k">{t('Released')}</span>
          <span className="v">{p.year}</span>
          <span className="s">{org(p)}</span>
        </div>
        <div>
          <span className="k">{t('Role')}</span>
          <span className="v">{roles[0]}</span>
          <span className="s">{roles.length > 1 ? `+ ${roles.slice(1).join(', ')}` : ' '}</span>
        </div>
        <div>
          <span className="k">Stack</span>
          <span className="v">{p.stack?.[0] ?? 'Web'}</span>
          <span className="s">{p.stack ? p.stack.slice(1).join(' · ') : ' '}</span>
        </div>
        <div>
          <span className="k">{t('Status')}</span>
          <span className={`v ${sc}`}>{sv}</span>
          <span className="s">{ss}</span>
        </div>
      </div>
      <section>
        <h2 className="st-h2" style={{ marginBottom: 12 }}>{t('Preview')}</h2>
        {p.gallery?.length ? (
          <Gallery p={p} />
        ) : (
          <figure className="preview">
            <Art p={p} />
          </figure>
        )}
      </section>
      <section>
        <h2 className="st-h2" style={{ marginBottom: 8 }}>{t('About this project')}</h2>
        <p className="app-desc">{p.desc}</p>
      </section>
      {(p.impact || p.metrics) && (
        <section className="imp">
          <h2 className="st-h2" style={{ marginBottom: 12 }}>{t('Impact')}</h2>
          {p.impact && (
            <>
              <div className="imp-top">
                <div className="imp-save" title={p.impact.saving.estimate ? t('Estimated from how the work was done before the app, not a measured figure.') : undefined}>
                  <b>{p.impact.saving.value}</b>
                  <span>{p.impact.saving.label}</span>
                  {p.impact.saving.estimate && <small>{t('Estimate')}</small>}
                </div>
                <div className="imp-why">
                  <span className="k">{t('Why it was built')}</span>
                  <p>{p.impact.purpose}</p>
                </div>
              </div>
              <h3 className="imp-h">{t('What changed')}</h3>
              <div className="imp-list" role="table" aria-label={t('What changed')}>
                <div className="imp-row head" role="row">
                  <span role="columnheader">{t('Before')}</span>
                  <span aria-hidden="true" />
                  <span role="columnheader">{t('After')}</span>
                </div>
                {p.impact.changes.map((c) => (
                  <div className="imp-row" role="row" key={c.before}>
                    <span role="cell" className="was">{c.before}</span>
                    <span className="arrow" aria-hidden="true">{UI.fwd}</span>
                    <span role="cell" className="now">{c.after}</span>
                  </div>
                ))}
              </div>
              {p.impact.saving.estimate && <p className="imp-note">{t('Estimated from how the work was done before the app, not a measured figure.')}</p>}
            </>
          )}
          {p.metrics && (
            <>
              {p.impact && <h3 className="imp-h">{t('By the numbers')}</h3>}
              <div className="impact">
                {p.metrics.map((m) => (
                  <div key={m.label}>
                    <b>{m.value}</b>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
      <section>
        <h2 className="st-h2">{t('Information')}</h2>
        <dl className="info">
          <div><dt>{t('Client')}</dt><dd>{org(p)}</dd></div>
          <div><dt>{t('Released')}</dt><dd>{p.year}</dd></div>
          <div><dt>{t('My role')}</dt><dd>{roles.join(', ')}</dd></div>
          {p.stack && <div><dt>Stack</dt><dd>{p.stack.join(', ')}</dd></div>}
          <div>
            <dt>{t('Website')}</dt>
            <dd>{hasLink(p) ? <a href={href(p)} target="_blank" rel="noopener noreferrer">{host(p)}</a> : t('Not public')}</dd>
          </div>
        </dl>
      </section>
      {more.length > 0 && (
        <section>
          <h2 className="st-h2">{t('Also released in {y}', { y: p.year })}</h2>
          <div className="rows">
            {more.map((x) => <Row key={x.id} p={x} go={go} />)}
          </div>
        </section>
      )}
    </div>
  )
}

export default function Projects() {
  const { data, projectFocus } = useDesktop()
  const projects = data.projects
  const [view, setView] = useState<View>({ k: 'discover' })
  const [q, setQ] = useState('')
  const main = useRef<HTMLDivElement>(null)

  const years = useMemo(() => [...new Set(projects.map((p) => p.year))].sort((a, b) => Number(b) - Number(a)), [projects])
  const byYear = (y: string) => projects.filter((p) => p.year === y).sort((a, b) => b.id - a.id)
  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const show = (v: View) => {
    setView(v)
    main.current?.scrollTo({ top: 0 })
  }
  const base = view.k === 'app' ? view.from : view
  const go = (id: number) => show({ k: 'app', id, from: base })

  let page: ReactNode
  if (view.k === 'discover') {
    const feats = FEATURED.map((f) => ({ ...f, p: byId.get(f.id) })).filter((f): f is { id: number; tag: string; p: Project } => !!f.p)
    // Recent projects: the selected ones first, in slider order, then everything else newest first; capped.
    const rest = [
      ...feats.map((f) => f.p),
      ...projects.filter((p) => !FEATURED.some((f) => f.id === p.id)).sort((a, b) => Number(b.year) - Number(a.year) || b.id - a.id),
    ].slice(0, RECENT_LIMIT)
    page = (
      <div className="st-page" data-drag="self">
        <h1 className="st-h1">{t('Discover')}</h1>
        {feats.length > 0 && <Hero items={feats} go={go} />}
        <section>
          <h2 className="st-h2">{t('Recent projects')}</h2>
          <div className="rows">
            {rest.map((p) => <Row key={p.id} p={p} go={go} />)}
          </div>
        </section>
      </div>
    )
  } else if (view.k === 'year') {
    const list = byYear(view.y)
    page = (
      <div className="st-page" data-drag="self">
        <h1 className="st-h1">
          {view.y}
          <small>
            {tn(list.length, '{n} project released', '{n} projects released')}
          </small>
        </h1>
        <div className="cards">
          {list.map((p) => (
            <button key={p.id} className="card" onClick={() => go(p.id)}>
              <span className="pv">
                <Art p={p} />
              </span>
              <Row p={p} go={go} as="span" />
            </button>
          ))}
        </div>
      </div>
    )
  } else if (view.k === 'search') {
    const needle = view.q.toLowerCase()
    const list = projects
      .filter((p) => [p.name, p.company, p.desc, p.year, ...(p.stack ?? []), ...p.role].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => Number(b.year) - Number(a.year))
    page = (
      <div className="st-page" data-drag="self">
        <h1 className="st-h1">
          {t('Results')}
          <small>{tn(list.length, '{n} match for “{q}”', '{n} matches for “{q}”', { q: view.q })}</small>
        </h1>
        {list.length ? (
          <div className="rows">
            {list.map((p) => <Row key={p.id} p={p} go={go} />)}
          </div>
        ) : (
          <p className="empty">{t('No project matches “{q}”. Try a year, a client such as Kominfo, or a stack such as Laravel.', { q: view.q })}</p>
        )}
      </div>
    )
  } else {
    const p = byId.get(view.id)
    const from = view.from
    const label = from.k === 'discover' ? t('Discover') : from.k === 'year' ? from.y : t('Results')
    page = p ? <Detail p={p} back={() => show(from)} backLabel={label} go={go} all={projects} /> : null
  }

  // Another app (Experience, Settings) asked to show a project.
  useEffect(() => {
    if (projectFocus && byId.has(projectFocus.id)) show({ k: 'app', id: projectFocus.id, from: { k: 'discover' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFocus])

  const navKey = base.k === 'discover' ? 'discover' : base.k === 'year' ? `y${base.y}` : ''

  // Phone back button: detail → where it was opened from; year or search → Discover.
  const fromLabel = (v: View) => (v.k === 'discover' ? t('Discover') : v.k === 'year' ? v.y : t('Results'))
  useInnerBack(
    view.k !== 'discover',
    view.k === 'app' ? fromLabel(view.from) : t('Discover'),
    () => {
      if (view.k === 'app') return show(view.from)
      setQ('')
      show({ k: 'discover' })
    },
  )

  return (
    <div className="store">
      <aside className="st-side" aria-label={t('Project library')} data-drag>
        <label className="st-search">
          {UI.search}
          <input
            type="search"
            placeholder={t('Search projects or stack')}
            autoComplete="off"
            aria-label={t('Search projects')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              const v = e.target.value.trim()
              show(v ? { k: 'search', q: v } : { k: 'discover' })
            }}
          />
        </label>
        <nav className="st-nav">
          <button aria-current={navKey === 'discover'} onClick={() => { setQ(''); show({ k: 'discover' }) }}>
            {UI.star}
            {t('Discover')}
          </button>
          {years.map((y) => (
            <button key={y} aria-current={navKey === `y${y}`} onClick={() => { setQ(''); show({ k: 'year', y }) }}>
              {UI.cal}
              <span className="yr">{y}</span>
              <span className="ct">{byYear(y).length}</span>
            </button>
          ))}
        </nav>
        <div className="st-me">
          <span>{data.profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
          <span>{data.profile.name}</span>
        </div>
      </aside>
      <div className="st-main scroll" ref={main}>
        {page}
      </div>
    </div>
  )
}
