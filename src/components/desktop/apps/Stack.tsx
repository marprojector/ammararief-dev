import { useMemo, useState } from 'react'
import { useDesktop } from '../context'
import { projectsUsing, type StackItem } from '../data'
import { UI } from '../ui'
import { duration, t } from '../i18n'

type Col = 'name' | 'level' | 'experience' | 'projects' | 'kind' | 'category'
type Row = StackItem & { category: string; projects: number }

const COLS: { id: Col; label: string; num?: boolean }[] = [
  { id: 'name', label: 'Technology' },
  { id: 'level', label: '% Level', num: true },
  { id: 'experience', label: 'Experience', num: true },
  { id: 'projects', label: 'Projects', num: true },
  { id: 'kind', label: 'Kind' },
  { id: 'category', label: 'Area' },
]

// "3 years" / "1 year" → months, so the Experience column sorts by time, not text.
const months = (s: string | null) => {
  if (!s) return -1
  const n = parseFloat(s)
  return Number.isNaN(n) ? -1 : /month|mo\b/i.test(s) ? n : n * 12
}

export default function Stack() {
  const { stack, projects } = useDesktop().data
  const [tab, setTab] = useState<string>('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ col: Col; dir: 1 | -1 }>({ col: 'level', dir: -1 })
  const [sel, setSel] = useState<string | null>(null)

  const all: Row[] = useMemo(
    () => stack.categories.flatMap((c) => c.items.map((t) => ({ ...t, category: c.name, projects: projectsUsing(t, projects).length }))),
    [stack, projects],
  )

  const needle = q.trim().toLowerCase()
  const rows = all
    .filter((r) => tab === 'all' || stack.categories.find((c) => c.id === tab)?.name === r.category)
    .filter((r) => !needle || [r.name, r.kind, r.category, ...r.keywords].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => {
      const { col, dir } = sort
      const val = (r: Row): number | string =>
        col === 'level' ? (r.level ?? -1) : col === 'experience' ? months(r.experience) : col === 'projects' ? r.projects : r[col].toLowerCase()
      const va = val(a)
      const vb = val(b)
      // Unrated rows sink to the bottom whichever way a numeric column is sorted.
      if (typeof va === 'number' && typeof vb === 'number' && (va < 0 || vb < 0)) return va < 0 && vb < 0 ? a.name.localeCompare(b.name) : va < 0 ? 1 : -1
      return (va < vb ? -1 : va > vb ? 1 : 0) * dir || a.name.localeCompare(b.name)
    })

  const rated = rows.filter((r) => r.level !== null)
  const top = [...rated].sort((a, b) => (b.level ?? 0) - (a.level ?? 0))[0]
  const avg = rated.length ? Math.round(rated.reduce((s, r) => s + (r.level ?? 0), 0) / rated.length) : null
  const selected = rows.find((r) => r.name === sel) ?? null
  const scope = tab === 'all' ? t('All Technologies') : stack.categories.find((c) => c.id === tab)?.name ?? ''

  // Projects shipped per year, for the chart (real counts from projects.json).
  const years = [...new Set(projects.map((p) => Number(p.year)))].sort((a, b) => a - b)
  const counts = years.map((y) => projects.filter((p) => Number(p.year) === y).length)
  const max = Math.max(1, ...counts)
  const W = 300
  const H = 92
  const pts = counts.map((c, i) => [years.length > 1 ? (i / (years.length - 1)) * W : W / 2, H - (c / max) * (H - 14) - 4] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const sortBy = (col: Col) => setSort((s) => ({ col, dir: s.col === col ? (s.dir === 1 ? -1 : 1) : col === 'name' || col === 'kind' || col === 'category' ? 1 : -1 }))

  return (
    <div className="am">
      <header className="am-bar" data-drag>
        <div className="am-title">
          <b>{t('Tech Stack')}</b>
          <span>{scope}</span>
        </div>
        <div className="am-tabs" role="tablist" aria-label="Area">
          {[{ id: 'all', name: t('All') }, ...stack.categories].map((c) => (
            <button key={c.id} role="tab" aria-selected={tab === c.id} onClick={() => setTab(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <label className="am-search">
          {UI.search}
          <input type="search" placeholder={t('Search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('Search technologies')} autoComplete="off" />
        </label>
      </header>

      <div className="am-table scroll" onKeyDown={(e) => e.key === 'Escape' && setSel(null)}>
        <table>
          <thead>
            <tr>
              {COLS.filter((c) => c.id !== 'category' || tab === 'all').map((c) => (
                <th key={c.id} className={c.num ? 'num' : ''} aria-sort={sort.col === c.id ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  <button onClick={() => sortBy(c.id)}>
                    {t(c.label)}
                    {sort.col === c.id && <span className="car">{sort.dir === 1 ? '⌃' : '⌄'}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} aria-selected={sel === r.name} tabIndex={0} onClick={() => setSel(sel === r.name ? null : r.name)} onKeyDown={(e) => e.key === 'Enter' && setSel(r.name)}>
                <td>{r.name}</td>
                <td className="num">{r.level ?? '—'}</td>
                <td className="num">{duration(r.experience) ?? '—'}</td>
                <td className="num">{r.projects || '—'}</td>
                <td>{r.kind}</td>
                {tab === 'all' && <td>{r.category}</td>}
              </tr>
            ))}
            {!rows.length && (
              <tr className="am-none">
                <td colSpan={6}>{t('No technology matches “{q}”.', { q: q.trim() })}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="am-foot">
        <div className="am-box">
          {selected ? (
            <dl className="am-kv">
              <div><dt>{selected.name}</dt><dd>{selected.kind}</dd></div>
              <div><dt>{t('Level')}</dt><dd className="sys">{selected.level !== null ? `${selected.level}%` : '—'}</dd></div>
              <div><dt>{t('Experience')}</dt><dd className="usr">{duration(selected.experience) ?? '—'}</dd></div>
              <div className="am-kw">{selected.keywords.length ? selected.keywords.join(' · ') : t('No keywords yet.')}</div>
            </dl>
          ) : (
            <dl className="am-kv">
              <div><dt>{t('Strongest:')}</dt><dd className="sys">{top ? `${top.name} ${top.level}%` : '—'}</dd></div>
              <div><dt>{t('Average level:')}</dt><dd className="usr">{avg !== null ? `${avg}%` : '—'}</dd></div>
              <div><dt>{t('Not rated yet:')}</dt><dd>{rows.length - rated.length}</dd></div>
            </dl>
          )}
        </div>
        <div className="am-box am-chart">
          <span className="cap">{t('Projects shipped')}</span>
          <svg viewBox={`-6 0 ${W + 12} ${H}`} preserveAspectRatio="none" aria-label={`Projects per year: ${years.map((y, i) => `${y}: ${counts[i]}`).join(', ')}`}>
            <path d={`${line} L${W} ${H} L0 ${H} Z`} className="area" />
            <path d={line} className="ln" />
            {pts.map(([x, y], i) => (
              <circle key={years[i]} cx={x} cy={y} r="2.6" className="pt" />
            ))}
          </svg>
          <div className="yrs">
            {years.map((y, i) => (
              <span key={y}>
                {String(y).slice(2)}
                <b>{counts[i]}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="am-box">
          <dl className="am-kv">
            <div><dt>{t('Technologies:')}</dt><dd>{rows.length}</dd></div>
            <div><dt>{t('Projects:')}</dt><dd>{projects.length}</dd></div>
          </dl>
        </div>
      </footer>
    </div>
  )
}
