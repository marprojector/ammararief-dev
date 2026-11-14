import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
// Firebase loads only when Notes opens.
const articleService = () => import('../../../services/articleService')
import { UI } from '../ui'
import { locale, t, tn } from '../i18n'
import { useInnerBack } from '../nav'

interface Article {
  id: string
  title: string
  slug: string
  description?: string
  views?: number
  date?: { toDate?: () => Date }
}

interface Note extends Article {
  when: Date | null
  text: string
}

type Folder = 'all' | string // 'all' or a year

const plain = (html = '') => (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim()
const dayMs = 864e5
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

// Notes groups its list by recency, then by year.
const groupOf = (d: Date | null, now: Date) => {
  if (!d) return t('Undated')
  const diff = (startOfDay(now) - startOfDay(d)) / dayMs
  if (diff <= 0) return t('Today')
  if (diff <= 7) return t('Previous 7 Days')
  if (diff <= 30) return t('Previous 30 Days')
  return String(d.getFullYear())
}
const listDate = (d: Date | null, now: Date) =>
  !d ? '' : startOfDay(d) === startOfDay(now) ? d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString(locale())
const longDate = (d: Date | null) =>
  d ? t('{date} at {time}', { date: d.toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' }), time: d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) }) : ''

// Reading a note in full counts as a view, once per article per visit.
const counted = new Set<string>()

const FolderIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h3.6l1.6 1.8H16a1.5 1.5 0 0 1 1.5 1.5v7.7A1.5 1.5 0 0 1 16 16.5H4a1.5 1.5 0 0 1-1.5-1.5V5.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

export default function Notes() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [folder, setFolder] = useState<Folder>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const [reading, setReading] = useState(false) // narrow windows: list or note, not both
  const paper = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    setError(false)
    articleService()
      .then((m) => m.getAllArticles())
      .then((list: Article[]) => {
        if (!alive) return
        const ns = list.map((a) => ({ ...a, when: a.date?.toDate?.() ?? null, text: plain(a.description) }))
        setNotes(ns)
        setSel((s) => s ?? ns[0]?.id ?? null)
      })
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [attempt])

  const now = new Date()
  const years = useMemo(() => {
    const m = new Map<string, number>()
    notes?.forEach((n) => n.when && m.set(String(n.when.getFullYear()), (m.get(String(n.when.getFullYear())) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [notes])

  const needle = q.trim().toLowerCase()
  const visible = (notes ?? []).filter(
    (n) => (folder === 'all' || String(n.when?.getFullYear()) === folder) && (!needle || n.title.toLowerCase().includes(needle) || n.text.toLowerCase().includes(needle)),
  )
  const groups: [string, Note[]][] = []
  visible.forEach((n) => {
    const g = groupOf(n.when, now)
    const last = groups[groups.length - 1]
    if (last && last[0] === g) last[1].push(n)
    else groups.push([g, [n]])
  })
  const note = notes?.find((n) => n.id === sel) ?? null
  useInnerBack(reading && !!note, t('Notes'), () => setReading(false))

  const open = (n: Note) => {
    setSel(n.id)
    setReading(true)
    paper.current?.scrollTo({ top: 0 })
    if (counted.has(n.id)) return
    counted.add(n.id)
    articleService()
      .then((m) => m.showArticle(n.slug))
      .then((doc) => (doc as { views?: number }))
      .then((a) => setNotes((ns) => ns?.map((x) => (x.id === n.id ? { ...x, views: a.views } : x)) ?? ns))
      .catch(() => counted.delete(n.id))
  }

  const folderName = folder === 'all' ? t('All Notes') : folder

  return (
    <div className={`notes${reading ? ' reading' : ''}`}>
      <aside className="nt-side" aria-label={t('Folders')} data-drag>
        <h3>Blog</h3>
        <button aria-current={folder === 'all'} onClick={() => setFolder('all')}>
          <FolderIcon />
          {t('All Notes')}<span className="ct">{notes?.length ?? ''}</span>
        </button>
        {years.map(([y, c]) => (
          <button key={y} aria-current={folder === y} onClick={() => setFolder(y)}>
            <FolderIcon />
            {y}
            <span className="ct">{c}</span>
          </button>
        ))}
        <Link className="nt-out" to="/blog">
          {t('Open blog page')} {UI.ext}
        </Link>
      </aside>

      <section className="nt-list" aria-label={folderName}>
        <header className="nt-bar" data-drag>
          <div>
            <h2>{folderName}</h2>
            <span>{notes ? tn(visible.length, '{n} note', '{n} notes') : t('Loading…')}</span>
          </div>
          <label className="st-search nt-search">
            {UI.search}
            <input type="search" placeholder={t('Search')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('Search notes')} autoComplete="off" />
          </label>
        </header>
        <div className="nt-items scroll">
          {error ? (
            <div className="nt-empty">
              <p>{t("Couldn't load the notes. Check your connection and try again.")}</p>
              <button className="btn" onClick={() => setAttempt((a) => a + 1)}>{t('Try again')}</button>
            </div>
          ) : !notes ? (
            Array.from({ length: 5 }, (_, i) => <div key={i} className="nt-skel" />)
          ) : !visible.length ? (
            <div className="nt-empty">
              <p>{needle ? t('No notes match “{q}”.', { q: q.trim() }) : t('No articles published yet.')}</p>
            </div>
          ) : (
            groups.map(([g, ns]) => (
              <div key={g} className="nt-group">
                <h4>{g}</h4>
                {ns.map((n) => (
                  <button key={n.id} className="nt-row" aria-current={n.id === sel} onClick={() => open(n)}>
                    <b>{n.title}</b>
                    <span>
                      <time>{listDate(n.when, now)}</time> {n.text || t('No additional text')}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </section>

      <article className="nt-note scroll" ref={paper}>
        {note ? (
          <>
            <div className="nt-tools" data-drag>
              <button className="back nt-back" onClick={() => setReading(false)}>
                {UI.back}
                {t('Notes')}
              </button>
              <span className="nt-date">{longDate(note.when)}</span>
              <span className="nt-meta">
                {t('{n} views', { n: note.views ?? 0 })}
                <Link to={`/blog/${note.slug}`}>{t('Read on blog')} {UI.ext}</Link>
              </span>
            </div>
            <div className="nt-paper">
              <h1>{note.title}</h1>
              <div className="note-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.description ?? '') }} />
            </div>
          </>
        ) : (
          <div className="nt-empty nt-none">{notes ? t('Select a note to read it.') : ''}</div>
        )}
      </article>
    </div>
  )
}
