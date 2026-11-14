import { useDesktop } from '../context'
import { ENABLED, engineeringRoles, fmtMY, hues, initials, parseMonth, projectsForWork, span, type Project } from '../data'
import { t } from '../i18n'

const rolesOf = (r: string[]) => {
  const e = engineeringRoles(r)
  return e.length ? e : r
}

// The projects of one role, as a small timeline hanging off the role.
function ProjectTrail({ list, open }: { list: Project[]; open: (id: number) => void }) {
  return (
    <ol className="tl-proj" aria-label={t('Projects in this role')}>
      {list.map((p) => {
        const body = (
          <>
            <span className="tp-year">{p.year}</span>
            <span className="tp-ic" style={hues(p)} aria-hidden="true">
              {p.logo ? <img src={`/assets/logo/${encodeURIComponent(p.logo)}`} alt="" /> : initials(p.name)}
            </span>
            <span className="tp-text">
              <b>{p.name}</b>
              <span>{rolesOf(p.role).join(', ')}</span>
            </span>
          </>
        )
        return (
          <li key={p.id}>
            {ENABLED.projects ? (
              <button onClick={() => open(p.id)} title={t('Open {name} in Projects', { name: p.name })}>
                {body}
              </button>
            ) : (
              <div>{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function Experience() {
  const { data, openProject } = useDesktop()
  const { work, projects } = data
  const now = new Date()
  const rows = work
    .map((w) => ({ ...w, s: parseMonth(w.startDate), e: parseMonth(w.endDate), done: projectsForWork(w, projects) }))
    .filter((w): w is typeof w & { s: Date } => !!w.s)
    .sort((a, b) => b.s.getTime() - a.s.getTime())
  if (!rows.length)
    return (
      <div className="exp scroll">
        <p className="muted">{t('No work history yet.')}</p>
      </div>
    )
  const first = rows[rows.length - 1].s
  const current = rows.filter((r) => !r.e).length
  const placed = new Set(rows.flatMap((r) => r.done.map((p) => p.id)))
  const others = projects.filter((p) => !placed.has(p.id)).sort((a, b) => Number(b.year) - Number(a.year) || b.id - a.id)

  return (
    <div className="exp scroll">
      <div className="exp-head">
        <h2>{t("Where I've worked")}</h2>
        <p>{t('{n} roles since {d} · {c} current', { n: rows.length, d: fmtMY(first), c: current })}</p>
      </div>
      <ol className="tl">
        {rows.map((r) => (
          <li key={r.id} className={r.e ? '' : 'now'}>
            <div className="when">
              {fmtMY(r.s)} – {r.e ? fmtMY(r.e) : t('Present')}
              <small>{span(r.s, r.e ?? now)}</small>
            </div>
            <div className="rail">
              <span className="node" />
            </div>
            <div className="what">
              <h3>{r.name}</h3>
              <p className="r">{rolesOf(r.role).join(' · ')}</p>
              {r.highlights && <p className="hl">{r.highlights}</p>}
              {r.done.length > 0 && <ProjectTrail list={r.done} open={openProject} />}
            </div>
          </li>
        ))}
        {others.length > 0 && (
          <li className="others">
            <div className="when" />
            <div className="rail">
              <span className="node" />
            </div>
            <div className="what">
              <h3>{t('Other projects')}</h3>
              <p className="r">{t('Not tied to one of the roles above.')}</p>
              <ProjectTrail list={others} open={openProject} />
            </div>
          </li>
        )}
      </ol>
    </div>
  )
}
