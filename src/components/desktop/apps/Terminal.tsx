import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDesktop } from '../context'
// Firebase loads only when the blog is first asked for.
const articleService = () => import('../../../services/articleService')
import {
  ENABLED,
  TZ,
  engineeringRoles,
  fmtMY,
  hasLink,
  host,
  org,
  parseMonth,
  projectsUsing,
  statusOf,
  type AppId,
  type DesktopData,
  type Project,
} from '../data'
import { duration, locale, t, tn } from '../i18n'

// The terminal is the one place where everything on the desktop can be read and searched.

const PROMPT = 'mar@makassar ~ %'
const pad = (s: string, n: number) => s + ' '.repeat(Math.max(1, n - s.length))
const D = ({ children }: { children: ReactNode }) => <span className="d">{children}</span>
const A = ({ children }: { children: ReactNode }) => <span className="a">{children}</span>
const W = ({ children }: { children: ReactNode }) => <span className="w">{children}</span>
const P = ({ children }: { children: ReactNode }) => <span className="p">{children}</span>

const slug = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const plain = (html = '') => (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').replace(/\s+/g, ' ').trim()
const rolesOf = (r: string[]) => {
  const e = engineeringRoles(r)
  return e.length ? e : r
}

interface Article {
  id: string
  title: string
  slug: string
  description?: string
  date?: { toDate?: () => Date }
}
let articles: Promise<Article[]> | null = null
const loadArticles = (): Promise<Article[]> =>
  (articles ??= (articleService().then((m) => m.getAllArticles()) as Promise<Article[]>).catch((e: unknown) => {
    articles = null // let the next command try again
    throw e
  }))

const OPEN_MAP: Record<string, AppId> = {
  about: 'about', projects: 'projects', experience: 'experience', stack: 'stack', skills: 'stack',
  blog: 'notes', notes: 'notes', spotify: 'spotify', music: 'spotify', contact: 'contact', mail: 'contact',
}
const OPENABLE = (['about', 'projects', 'experience', 'stack', 'blog', 'spotify', 'contact'] as const).filter((n) => ENABLED[OPEN_MAP[n]])

const COMMANDS = ['help', 'whoami', 'about', 'stack', 'skills', 'projects', 'project', 'experience', 'blog', 'contact', 'search', 'open', 'ls', 'cat', 'history', 'date', 'clear']
const FILES = ['about.txt', 'contact.vcf', 'experience.log', 'stack.json', 'projects/', 'blog/']

type Out = ReactNode | Promise<ReactNode> | 'clear'

function findProject(projects: Project[], q: string) {
  const s = slug(q)
  if (!s) return null
  return (
    projects.find((p) => String(p.id) === q) ??
    projects.find((p) => slug(p.name) === s) ??
    projects.find((p) => slug(p.name).startsWith(s)) ??
    projects.find((p) => slug(p.name).includes(s)) ??
    null
  )
}

function whoami({ profile }: DesktopData) {
  return (
    <>
      {profile.name} <D>(@{profile.nickname})</D>
      {'\n'}
      {profile.job} · {profile.contacts.address} <D>(WITA, UTC+8)</D>
      {'\n\n'}
      {plain(profile.description)}
      {'\n'}
    </>
  )
}

function stackOut({ stack, projects }: DesktopData, area?: string) {
  const cats = area ? stack.categories.filter((c) => c.id === area.toLowerCase() || c.name.toLowerCase() === area.toLowerCase()) : stack.categories
  if (!cats.length) return t('stack: no area "{x}". Try: {list}', { x: area ?? '', list: stack.categories.map((c) => c.id).join(', ') }) + '\n'
  return (
    <>
      {cats.map((c) => (
        <span key={c.id}>
          <W># {c.name}</W>
          {'\n'}
          {c.items.map((t) => {
            const n = t.level !== null ? Math.round(t.level / 5) : 0
            const used = projectsUsing(t, projects).length
            return (
              <span key={t.name}>
                {pad(t.name, 20)}
                {t.level !== null ? (
                  <>
                    <P>{'█'.repeat(n)}</P>
                    <D>{'░'.repeat(20 - n)}</D> {String(t.level).padStart(3)}
                  </>
                ) : (
                  <D>{' '.repeat(22)}—</D>
                )}
                {'  '}
                <D>{pad(duration(t.experience) ?? '', 9)}</D>
                {used ? <A>{tn(used, '{n} project', '{n} projects')}</A> : ''}
                {'\n'}
              </span>
            )
          })}
          {'\n'}
        </span>
      ))}
      <D>stack frontend · stack backend · stack database · stack devops</D>
      {'\n'}
    </>
  )
}

function projectsOut({ projects }: DesktopData, year?: string) {
  const list = [...projects].filter((p) => !year || p.year === year).sort((a, b) => Number(b.year) - Number(a.year) || b.id - a.id)
  if (!list.length) return t('projects: nothing in {y}.', { y: year ?? '' }) + '\n'
  return (
    <>
      {list.map((p) => (
        <span key={p.id}>
          <D>{p.year}</D> {pad(p.name, 34)}
          <A>{pad(slug(p.name), 30)}</A>
          <D>{hasLink(p) ? host(p) : 'internal'}</D>
          {'\n'}
        </span>
      ))}
      {'\n'}
      <D>{t('project <name> for details, e.g.')} project {slug(list[0].name)}</D>
      {'\n'}
    </>
  )
}

function projectOut({ projects }: DesktopData, q: string) {
  if (!q) return t('project: which one? e.g. project grhm. List them with: projects') + '\n'
  const p = findProject(projects, q)
  if (!p) return t('project: nothing matches "{q}". List them with: projects', { q }) + '\n'
  const [sv, ss] = statusOf(p)
  const row = (k: string, v: ReactNode) => (
    <>
      <D>{pad(k, 10)}</D>
      {v}
      {'\n'}
    </>
  )
  return (
    <>
      <W>{p.name}</W> <D>({p.year})</D>
      {'\n'}
      {row(t('client'), org(p))}
      {row(t('role'), rolesOf(p.role).join(', '))}
      {p.stack && row('stack', p.stack.join(' · '))}
      {row(t('status'), `${sv} — ${ss}`)}
      {p.impact && row(t('saves'), `${p.impact.saving.value} ${p.impact.saving.label}${p.impact.saving.estimate ? ' ' + t('(estimate)') : ''}`)}
      {p.metrics?.map((m, i) => <span key={m.label}>{row(i ? '' : t('impact'), `${m.value} ${m.label}`)}</span>)}
      {'\n'}
      {p.desc}
      {'\n'}
      {p.impact && (
        <>
          {'\n'}
          <W>{t('Why it was built')}</W>
          {'\n'}
          {p.impact.purpose}
          {'\n\n'}
          <W>{t('What changed')}</W>
          {'\n'}
          {p.impact.changes.map((c) => (
            <span key={c.before}>
              {'  '}
              <D>{c.before}</D> → {c.after}
              {'\n'}
            </span>
          ))}
        </>
      )}
    </>
  )
}

function experienceOut({ work }: DesktopData) {
  return (
    <>
      {work
        .map((w) => ({ ...w, s: parseMonth(w.startDate), e: parseMonth(w.endDate) }))
        .sort((a, b) => (b.s?.getTime() ?? 0) - (a.s?.getTime() ?? 0))
        .map((w) => (
          <span key={w.id}>
            <D>{pad(`${w.s ? fmtMY(w.s) : '?'} – ${w.e ? fmtMY(w.e) : t('now')}`, 22)}</D>
            {pad(w.name, 36)}
            {rolesOf(w.role).join(', ')}
            {'\n'}
            {w.highlights && (
              <>
                {' '.repeat(22)}
                <D>{w.highlights}</D>
                {'\n'}
              </>
            )}
          </span>
        ))}
    </>
  )
}

function contactOut({ profile, socials }: DesktopData) {
  return (
    <>
      {pad('email', 10)}
      {profile.contacts.email}
      {'\n'}
      {socials.map((s) => (
        <span key={s.name}>
          {pad(s.name.toLowerCase(), 10)}
          <A>{s.url}</A>
          {'\n'}
        </span>
      ))}
      {pad(t('based in'), 10)}
      {profile.contacts.address}
      {'\n'}
    </>
  )
}

const blogDate = (a: Article) => a.date?.toDate?.()?.toLocaleDateString('en-GB') ?? '—'

async function blogOut(): Promise<ReactNode> {
  try {
    const list = await loadArticles()
    if (!list.length) return t('No articles published yet.') + '\n'
    return (
      <>
        {list.map((a) => (
          <span key={a.id}>
            <D>{pad(blogDate(a), 12)}</D>
            {pad(a.title, 44)}
            <A>{a.slug}</A>
            {'\n'}
          </span>
        ))}
        {'\n'}
        <D>{t('cat blog/<slug> to read one here')}{ENABLED.notes ? t(', open blog for the full view') : ''}</D>
        {'\n'}
      </>
    )
  } catch {
    return t("blog: couldn't load articles. Check the connection and try again.") + '\n'
  }
}

async function articleOut(q: string): Promise<ReactNode> {
  try {
    const list = await loadArticles()
    const a = list.find((x) => x.slug === q) ?? list.find((x) => x.slug.startsWith(q))
    if (!a) return `cat: blog/${q}: no such article. List them with: ls blog\n`
    const text = plain(a.description)
    return (
      <>
        <W>{a.title}</W> <D>({blogDate(a)})</D>
        {'\n\n'}
        {text.length > 900 ? text.slice(0, 900).replace(/\s+\S*$/, '') + '…' : text}
        {'\n\n'}
        <D>{t('full article:')} /blog/{a.slug}</D>
        {'\n'}
      </>
    )
  } catch {
    return "cat: couldn't load the article. Check the connection and try again.\n"
  }
}

async function searchOut(data: DesktopData, raw: string): Promise<ReactNode> {
  const terms = raw.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return t('search: what for? e.g. search laravel, search 2025, search kominfo') + '\n'
  const hit = (s: string) => terms.every((t) => s.toLowerCase().includes(t))
  const projects = data.projects.filter((p) =>
    hit([p.name, p.company, p.desc, p.year, ...(p.stack ?? []), ...p.role, p.impact?.purpose ?? '', ...(p.impact?.changes.flatMap((c) => [c.before, c.after]) ?? [])].join(' ')),
  )
  const work = data.work.filter((w) => hit([w.name, ...w.role, w.highlights ?? '', w.startDate, w.endDate ?? ''].join(' ')))
  const stack = data.stack.categories.flatMap((c) =>
    c.items.filter((t) => hit([t.name, t.kind, c.name, ...t.keywords].join(' '))).map((t) => ({ ...t, area: c.name })),
  )
  let blog: Article[] = []
  let blogFailed = false
  try {
    blog = (await loadArticles()).filter((a) => hit(`${a.title} ${plain(a.description)}`))
  } catch {
    blogFailed = true
  }
  const total = projects.length + work.length + stack.length + blog.length
  const head = (name: string, n: number) => (
    <>
      <W>
        {name} ({n})
      </W>
      {'\n'}
    </>
  )
  return (
    <>
      {tn(total, '{n} result for “{q}”', '{n} results for “{q}”', { q: raw })}{'\n\n'}
      {projects.length > 0 && (
        <>
          {head('projects', projects.length)}
          {projects.map((p) => (
            <span key={p.id}>
              {'  '}
              <D>{p.year}</D> {pad(p.name, 32)}
              <A>project {slug(p.name)}</A>
              {'\n'}
            </span>
          ))}
          {'\n'}
        </>
      )}
      {stack.length > 0 && (
        <>
          {head('stack', stack.length)}
          {stack.map((t) => (
            <span key={t.name}>
              {'  '}
              <D>{pad(t.area.toLowerCase(), 9)}</D>
              {pad(t.name, 22)}
              {t.level !== null ? `${t.level}%` : '—'}
              {'\n'}
            </span>
          ))}
          {'\n'}
        </>
      )}
      {work.length > 0 && (
        <>
          {head('experience', work.length)}
          {work.map((w) => (
            <span key={w.id}>
              {'  '}
              {pad(w.name, 36)}
              <D>{rolesOf(w.role).join(', ')}</D>
              {'\n'}
            </span>
          ))}
          {'\n'}
        </>
      )}
      {blog.length > 0 && (
        <>
          {head('blog', blog.length)}
          {blog.map((a) => (
            <span key={a.id}>
              {'  '}
              <D>{pad(blogDate(a), 11)}</D>
              {pad(a.title, 40)}
              <A>cat blog/{a.slug}</A>
              {'\n'}
            </span>
          ))}
          {'\n'}
        </>
      )}
      {blogFailed && (
        <>
          <D>{t("(blog not searched: couldn't load articles)")}</D>
          {'\n'}
        </>
      )}
    </>
  )
}

function lsOut(data: DesktopData, dir?: string): Out {
  const d = (dir ?? '').replace(/\/$/, '')
  if (!d)
    return (
      <>
        {FILES.map((f) => (f.endsWith('/') ? <A key={f}>{f}{'  '}</A> : <span key={f}>{f}{'  '}</span>))}
        {'\n'}
      </>
    )
  if (d === 'projects') return data.projects.map((p) => slug(p.name)).sort().join('\n') + '\n'
  if (d === 'blog')
    return loadArticles()
      .then((l) => (l.length ? l.map((a) => a.slug).join('\n') + '\n' : 'blog/ is empty.\n'))
      .catch(() => "ls: couldn't load blog/. Check the connection.\n")
  return `ls: ${dir}: no such directory\n`
}

function catOut(data: DesktopData, file?: string): Out {
  if (!file) return 'cat: which file? Try: ls\n'
  const f = file.replace(/^\.\//, '')
  if (f === 'about.txt') return whoami(data)
  if (f === 'contact.vcf') return contactOut(data)
  if (f === 'experience.log') return experienceOut(data)
  if (f === 'stack.json') return stackOut(data)
  if (f.startsWith('projects/')) return projectOut(data, f.slice(9))
  if (f.startsWith('blog/')) return articleOut(f.slice(5))
  if (f.endsWith('/')) return `cat: ${f}: is a directory. Try: ls ${f}\n`
  return `cat: ${f}: no such file. Try: ls\n`
}

function help() {
  const rows: [string, string][] = [
    ['whoami', t('who I am')],
    ['stack [area]', t('tech I use: frontend, backend, database, devops')],
    ['projects [year]', t('every project, newest first')],
    ['project <name>', t('details of one project')],
    ['experience', t('work history')],
    ['blog', t('articles I have written')],
    ['contact', t('email and socials')],
    ['search <words>', t('search all of the above')],
    ['ls, cat <file>', t('the same information, as files')],
    ['open <app>', OPENABLE.join(' · ')],
    ['history, clear', ''],
  ]
  return (
    <>
      {rows.map(([c, d]) => (
        <span key={c}>
          {'  '}
          <A>{pad(c, 18)}</A>
          {d}
          {'\n'}
        </span>
      ))}
      {'\n'}
      <D>{t('Tab completes commands, project names and files. ↑ ↓ walk through history.')}</D>
      {'\n'}
    </>
  )
}

function run(line: string, data: DesktopData, open: (id: AppId) => void, history: string[]): Out {
  const [raw = '', ...args] = line.trim().split(/\s+/)
  const rest = args.join(' ')
  switch (raw.toLowerCase()) {
    case '':
      return null
    case 'help':
    case '?':
      return help()
    case 'whoami':
    case 'about':
      return whoami(data)
    case 'stack':
    case 'skills':
      return stackOut(data, args[0])
    case 'projects':
      return projectsOut(data, args[0])
    case 'project':
      return projectOut(data, rest)
    case 'experience':
    case 'work':
      return experienceOut(data)
    case 'blog':
      return blogOut()
    case 'contact':
      return contactOut(data)
    case 'search':
    case 'grep':
    case 'find':
      return searchOut(data, rest)
    case 'ls':
      return lsOut(data, args[0])
    case 'cat':
    case 'less':
    case 'more':
      return catOut(data, args[0])
    case 'open': {
      const app = OPEN_MAP[args[0]?.toLowerCase() ?? '']
      if (!app || !ENABLED[app]) return t('open: unknown app "{x}". Try: {list}', { x: args[0] ?? '', list: OPENABLE.join(', ') }) + '\n'
      setTimeout(() => open(app), 60)
      return <D>{t('opening {x}…', { x: args[0] })}{'\n'}</D>
    }
    case 'history':
      return history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n') + '\n'
    case 'date':
      return new Intl.DateTimeFormat(locale(), { dateStyle: 'full', timeStyle: 'short', timeZone: TZ }).format(new Date()) + ' WITA\n'
    case 'clear':
      return 'clear'
    case 'sudo':
      return <D>nice try.{'\n'}</D>
    default:
      return (
        <>
          zsh: {t('command not found: {cmd}. Type', { cmd: raw })} <A>help</A> {t('for the list, or')} <A>search {raw}</A>.{'\n'}
        </>
      )
  }
}

// Tab completion: the word under the cursor, against what makes sense in that position.
function candidates(line: string, data: DesktopData): { prefix: string; options: string[] } {
  const parts = line.split(/\s+/)
  const word = parts[parts.length - 1]
  if (parts.length === 1) return { prefix: word, options: COMMANDS }
  const cmd = parts[0].toLowerCase()
  const slugs = data.projects.map((p) => slug(p.name))
  const byCmd: Record<string, string[]> = {
    stack: data.stack.categories.map((c) => c.id),
    skills: data.stack.categories.map((c) => c.id),
    project: slugs,
    projects: [...new Set(data.projects.map((p) => p.year))],
    open: [...OPENABLE],
    ls: ['projects/', 'blog/'],
    cat: [...FILES.filter((f) => !f.endsWith('/')), ...slugs.map((s) => `projects/${s}`)],
  }
  return { prefix: word, options: byCmd[cmd] ?? [] }
}

interface Entry {
  id: number
  cmd: string | null
  out: ReactNode
}

let nextId = 0

export default function Terminal() {
  const { data, open } = useDesktop()
  const [entries, setEntries] = useState<Entry[]>(() => {
    const login = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date())
    return [
      { id: nextId++, cmd: null, out: <D>Last login: {login} on ttys001{'\n'}</D> },
      { id: nextId++, cmd: 'whoami', out: whoami(data) },
      {
        id: nextId++,
        cmd: null,
        out: (
          <D>
            {t('Everything on this desktop is searchable here. Try')} <A>search laravel</A>, <A>stack backend</A>, <A>project grhm</A> {t('or')} <A>help</A>.{'\n'}
          </D>
        ),
      },
    ]
  })
  const [value, setValue] = useState('')
  const hist = useRef<string[]>([])
  const hi = useRef(0)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight
  }, [entries])

  const push = (cmd: string | null, out: ReactNode) => {
    const id = nextId++
    setEntries((e) => [...e, { id, cmd, out }])
    return id
  }

  const submit = () => {
    const v = value.trim()
    setValue('')
    if (v) hist.current.push(v)
    hi.current = hist.current.length
    const out = run(v, data, open, hist.current)
    if (out === 'clear') return setEntries([])
    if (out instanceof Promise) {
      const id = push(v, <D>…{'\n'}</D>)
      out.then((res) => setEntries((e) => e.map((x) => (x.id === id ? { ...x, out: res } : x))))
    } else push(v, out)
  }

  const complete = () => {
    const { prefix, options } = candidates(value, data)
    const hits = options.filter((o) => o.toLowerCase().startsWith(prefix.toLowerCase()))
    if (!hits.length) return
    const base = value.slice(0, value.length - prefix.length)
    if (hits.length === 1) return setValue(base + hits[0] + (hits[0].endsWith('/') ? '' : ' '))
    let common = hits[0]
    for (const h of hits) while (!h.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1)
    if (common.length > prefix.length) setValue(base + common)
    else push(value, <D>{hits.join('   ')}{'\n'}</D>)
  }

  return (
    <div className="term-body scroll" ref={box} onClick={() => !getSelection()?.toString() && input.current?.focus({ preventScroll: true })}>
      <pre>
        {entries.map((e) => (
          <span key={e.id}>
            {e.cmd !== null && (
              <>
                <P>{PROMPT}</P> {e.cmd}
                {'\n'}
              </>
            )}
            {e.out}
            {e.out ? '\n' : ''}
          </span>
        ))}
      </pre>
      <label className="term-line">
        <P>{PROMPT}</P>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            else if (e.key === 'Tab') {
              e.preventDefault()
              complete()
            } else if (e.key === 'ArrowUp' && hi.current > 0) {
              setValue(hist.current[--hi.current])
              e.preventDefault()
            } else if (e.key === 'ArrowDown') {
              hi.current = Math.min(hist.current.length, hi.current + 1)
              setValue(hist.current[hi.current] ?? '')
            } else if (e.key === 'l' && e.ctrlKey) {
              e.preventDefault()
              setEntries([])
            }
          }}
          aria-label="Terminal command"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>
    </div>
  )
}
