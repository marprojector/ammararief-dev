import { useEffect, useRef, useState } from 'react'
import { useDesktop } from '../context'
import { UI } from '../ui'
import { t } from '../i18n'

const handle = (url: string) => {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/$/, '')
    return u.hostname.includes('instagram') ? `@${path.slice(1)}` : `${u.hostname.replace('www.', '')}${path}`
  } catch {
    return url
  }
}
const iconFor = (name: string) => (name === 'GitHub' ? UI.gh : name === 'LinkedIn' ? UI.in : name === 'Instagram' ? UI.ig : UI.ext)

export default function Contact() {
  const { profile, socials } = useDesktop().data
  const email = profile.contacts.email
  const SUBJECT = t("Let's work on something together")
  const addr = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'' | 'Copied' | 'Selected'>('')

  useEffect(() => {
    if (!state) return
    const t = setTimeout(() => setState(''), 1800)
    return () => clearTimeout(t)
  }, [state])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setState('Copied')
    } catch {
      // Clipboard refused: select the address so the visitor can copy it themselves.
      if (addr.current) {
        const r = document.createRange()
        r.selectNodeContents(addr.current)
        const sel = getSelection()
        sel?.removeAllRanges()
        sel?.addRange(r)
      }
      setState('Selected')
    }
  }

  return (
    <div className="mail scroll">
      <dl className="hdr">
        <div className="row">
          <dt>{t('To')}</dt>
          <dd>
            <span className="addr" ref={addr}>{email}</span>
          </dd>
          <button className={`btn${state ? ' copied' : ''}`} onClick={copy} aria-label={t('Copy email address')}>
            {UI.copy}
            <span>{t(state || 'Copy')}</span>
          </button>
        </div>
        <div className="row">
          <dt>{t('From')}</dt>
          <dd className="muted">{t('you')}</dd>
          <span />
        </div>
        <div className="row">
          <dt>{t('Subject')}</dt>
          <dd>{SUBJECT}</dd>
          <span />
        </div>
      </dl>
      <div className="msg">
        <p>
          {t(
            "I build and run web platforms for government, campuses and local businesses in Gorontalo. If you have a system to build, a backend to scale or a team that needs another engineer, email me and I'll reply within a couple of days.",
          )}
        </p>
        <div>
          <a className="btn primary" href={`mailto:${email}?subject=${encodeURIComponent(SUBJECT)}`}>
            {t('Write email')} {UI.ext}
          </a>
        </div>
        <div className="links">
          {socials.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
              <span className="ic">{iconFor(s.name)}</span>
              <span>
                <span className="h">{s.name}</span>
                <br />
                <span className="s">{handle(s.url)}</span>
              </span>
              <span className="go">{UI.ext}</span>
            </a>
          ))}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.contacts.address)}`} target="_blank" rel="noopener noreferrer">
            <span className="ic">{UI.pin}</span>
            <span>
              <span className="h">{profile.contacts.address}</span>
              <br />
              <span className="s">WITA, UTC+8</span>
            </span>
            <span className="go">{UI.ext}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
