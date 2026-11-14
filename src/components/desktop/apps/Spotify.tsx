import { useState } from 'react'
import { ago, artists, mmss, useSpotify, type Track } from '../spotify'
import { UI } from '../ui'
import { t } from '../i18n'

const Bars = () => (
  <span className="eq" aria-hidden="true">
    <i />
    <i />
    <i />
  </span>
)

export default function Spotify() {
  const { result, retry } = useSpotify(30_000)
  const [picked, setPicked] = useState<string | null>(null)

  if (result.status === 'loading') {
    return (
      <div className="sp">
        <div className="sp-hero" data-drag>
          <div className="sp-art sp-skel" />
          <div className="sp-meta">
            <div className="sp-skel" style={{ height: 14, width: 120 }} />
            <div className="sp-skel" style={{ height: 34, width: '70%', marginTop: 12 }} />
            <div className="sp-skel" style={{ height: 14, width: '40%', marginTop: 12 }} />
          </div>
        </div>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="sp sp-msg">
        <p>{t("Couldn't reach Spotify right now.")}</p>
        <button className="sp-btn" onClick={retry}>{t('Try again')}</button>
      </div>
    )
  }

  const { isPlaying, now, recent } = result.data
  const list: Track[] = recent.filter((x) => x.id !== now?.id)
  const lead = now ?? recent[0]
  if (!lead) {
    return (
      <div className="sp sp-msg">
        <p>{t('Nothing played recently. Check back later.')}</p>
      </div>
    )
  }

  const all = [lead, ...list.filter((x) => x.id !== lead.id)]
  const current = all.find((x) => x.id === picked) ?? lead
  const status = now && isPlaying ? t('Listening now') : now ? t('Paused') : t('Last played {ago}', { ago: ago(lead.playedAt) })

  return (
    <div className="sp scroll" data-drag="self">
      <div className="sp-hero" data-drag>
        {current.image ? <img className="sp-art" src={current.image} alt={`${current.album} cover`} /> : <div className="sp-art" />}
        <div className="sp-meta">
          <span className={`sp-status${current.id === lead.id && now && isPlaying ? ' live' : ''}`}>
            {current.id === lead.id ? (
              <>
                {now && isPlaying && <Bars />}
                {status}
              </>
            ) : (
              t('Played {ago}', { ago: ago(current.playedAt) })
            )}
          </span>
          <h2>{current.name}</h2>
          <p>
            {artists(current)} · <span>{current.album}</span>
          </p>
          {current.url && (
            <a className="sp-btn" href={current.url} target="_blank" rel="noopener noreferrer">
              {t('Open in Spotify')} {UI.ext}
            </a>
          )}
        </div>
      </div>

      <iframe
        key={current.id}
        className="sp-embed"
        title={`Play ${current.name} by ${artists(current)}`}
        src={`https://open.spotify.com/embed/track/${current.id}?utm_source=generator&theme=0`}
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      <p className="sp-note">{t("Signed in to Spotify? The full song plays. Otherwise you'll hear a 30-second preview.")}</p>

      {all.length > 1 && (
        <section>
          <h3>{t('Recently played')}</h3>
          <ol className="sp-list">
            {all.map((track, i) => (
              <li key={track.id}>
                <button aria-current={track.id === current.id} onClick={() => setPicked(track.id)}>
                  <span className="n">{track.id === current.id ? <Bars /> : i + 1}</span>
                  {track.thumb ? <img src={track.thumb} alt="" loading="lazy" /> : <span className="ph" />}
                  <span className="tt">
                    <b>{track.name}</b>
                    <span>{artists(track)}</span>
                  </span>
                  <span className="when">{track.id === lead.id && now ? (isPlaying ? t('Now') : t('Paused')) : ago(track.playedAt)}</span>
                  <span className="dur">{mmss(track.durationMs)}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
