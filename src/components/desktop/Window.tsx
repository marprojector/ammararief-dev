import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { APPS, isMobile, reduced, type AppId } from './data'
import { UI } from './ui'
import { t } from './i18n'
import { WinNavCtx, type InnerBack } from './nav'

export interface WinControls {
  close: () => void
  minimize: () => void
}

export interface WinState {
  id: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  min: boolean
  max: boolean
  silent?: boolean
}

interface Props {
  win: WinState
  active: boolean
  deskRef: RefObject<HTMLElement | null>
  dockItem: (id: AppId) => HTMLElement | null
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onToggleMax: () => void
  onGeometry: (g: Pick<WinState, 'x' | 'y' | 'w' | 'h'>) => void
  controls: (id: AppId, c: WinControls | null) => void
  children: ReactNode
}

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'

// Apps whose content runs under a see-through title bar mark their toolbars and sidebars with data-drag,
// like macOS: empty space there moves the window, while controls and text inside stay usable.
// data-drag="self" only counts the element's own empty space (its padding), never its children.
const INTERACTIVE = 'button, a, input, textarea, select, label, summary, iframe, [role="button"], [role="tab"], [role="radio"], [contenteditable="true"]'
function isDragZone(target: HTMLElement) {
  if (target.closest(INTERACTIVE) || target.closest('.titlebar')) return false
  const zone = target.closest<HTMLElement>('[data-drag]')
  if (!zone) return false
  return zone.dataset.drag === 'self' ? zone === target : true
}

export default function Window({ win, active, deskRef, dockItem, onFocus, onClose, onMinimize, onToggleMax, onGeometry, controls, children }: Props) {
  const el = useRef<HTMLElement>(null)
  const app = APPS[win.id]
  const [inner, setInner] = useState<InnerBack | null>(null)

  const anim = useRef<Animation | null>(null)

  // The transform that lands the window on its dock icon: squeezed to the icon's box, like the genie effect.
  const dockPose = () => {
    const d = dockItem(win.id)
    const node = el.current
    if (!d || !node) return 'translate(0px, 45vh) scale(.08)'
    const r = node.getBoundingClientRect()
    const dr = d.getBoundingClientRect()
    return `translate(${dr.left - r.left}px, ${dr.top - r.top}px) scale(${dr.width / r.width}, ${dr.height / r.height})`
  }

  // One animation at a time. Exits keep their end pose (fill) until React hides or unmounts the window,
  // so it never snaps back to full size for a frame. Backdrop blur is paused while moving: it is the expensive part.
  const play = (origin: string, frames: (pose: string) => Keyframe[], opts: KeyframeAnimationOptions, done?: () => void) => {
    const node = el.current
    anim.current?.cancel()
    anim.current = null
    if (!node || reduced()) return done?.()
    node.style.transformOrigin = origin
    const pose = dockPose()
    node.classList.add('animating')
    const a = node.animate(frames(pose), { ...opts, fill: 'both' })
    anim.current = a
    a.onfinish = () => {
      node.classList.remove('animating')
      if (done) return done()
      a.cancel()
      anim.current = null
    }
  }

  const animateIn = () =>
    play('0 0', (pose) => [{ transform: pose, opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }], {
      duration: 460,
      easing: EASE_OUT,
    })
  const animateMinimize = (done: () => void) =>
    play('0 0', (pose) => [{ transform: 'none', opacity: 1 }, { opacity: 1, offset: 0.6 }, { transform: pose, opacity: 0 }], {
      duration: 420,
      easing: 'cubic-bezier(.55,.05,.3,1)',
    }, done)
  const animateClose = (done: () => void) =>
    play('50% 40%', () => [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }], {
      duration: 180,
      easing: 'cubic-bezier(.4,0,1,1)',
    }, done)

  // Lets the dock and menu bar minimize or close with the same animation as the traffic lights.
  const latest = useRef({ onClose, onMinimize })
  latest.current = { onClose, onMinimize }
  useEffect(() => {
    controls(win.id, {
      close: () => animateClose(() => latest.current.onClose()),
      minimize: () => animateMinimize(() => latest.current.onMinimize()),
    })
    return () => controls(win.id, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.id])

  const wasMin = useRef(win.min)
  useLayoutEffect(() => {
    if (!win.silent) animateIn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useLayoutEffect(() => {
    if (wasMin.current && !win.min) animateIn()
    wasMin.current = win.min
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.min])

  const drag = (e: RPointerEvent<HTMLElement>) => {
    const node = el.current
    const desk = deskRef.current
    if (!node || !desk || (e.target as HTMLElement).closest('button') || isMobile() || win.max || e.button !== 0) return
    e.preventDefault() // no text selection while dragging
    const bar = e.currentTarget
    const sx = e.clientX
    const sy = e.clientY
    const ox = node.offsetLeft
    const oy = node.offsetTop
    bar.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      node.style.left = Math.min(desk.clientWidth - 80, Math.max(80 - node.offsetWidth, ox + ev.clientX - sx)) + 'px'
      node.style.top = Math.min(desk.clientHeight - 50, Math.max(0, oy + ev.clientY - sy)) + 'px'
    }
    const up = () => {
      bar.removeEventListener('pointermove', move)
      bar.removeEventListener('pointerup', up)
      bar.removeEventListener('pointercancel', up)
      onGeometry({ x: node.offsetLeft, y: node.offsetTop, w: node.offsetWidth, h: node.offsetHeight })
    }
    bar.addEventListener('pointermove', move)
    bar.addEventListener('pointerup', up)
    bar.addEventListener('pointercancel', up)
  }

  const resize = (e: RPointerEvent<HTMLDivElement>) => {
    const node = el.current
    const desk = deskRef.current
    if (!node || !desk || win.max) return
    e.preventDefault()
    const grip = e.currentTarget
    const sx = e.clientX
    const sy = e.clientY
    const ow = node.offsetWidth
    const oh = node.offsetHeight
    grip.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      node.style.width = Math.min(desk.clientWidth - node.offsetLeft - 4, Math.max(320, ow + ev.clientX - sx)) + 'px'
      node.style.height = Math.min(desk.clientHeight - node.offsetTop - 4, Math.max(220, oh + ev.clientY - sy)) + 'px'
    }
    const up = () => {
      grip.removeEventListener('pointermove', move)
      grip.removeEventListener('pointerup', up)
      onGeometry({ x: node.offsetLeft, y: node.offsetTop, w: node.offsetWidth, h: node.offsetHeight })
    }
    grip.addEventListener('pointermove', move)
    grip.addEventListener('pointerup', up)
  }

  return (
    <section
      ref={el}
      role="dialog"
      aria-label={t(app.title)}
      hidden={win.min}
      className={['win', app.cls, active && 'active', win.max && 'max'].filter(Boolean).join(' ')}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDownCapture={onFocus}
      onPointerDown={(e) => isDragZone(e.target as HTMLElement) && drag(e)}
      onDoubleClick={(e) => isDragZone(e.target as HTMLElement) && !isMobile() && onToggleMax()}
    >
      <div className="titlebar" onPointerDown={drag} onDoubleClick={(e) => !(e.target as HTMLElement).closest('.lights') && !isMobile() && onToggleMax()}>
        <div className="lights">
          <button className="light c" aria-label={t('Close {app}', { app: t(app.dock) })} onClick={() => animateClose(onClose)}>
            {UI.x}
          </button>
          <button className="light m" aria-label={t('Minimize {app}', { app: t(app.dock) })} onClick={() => animateMinimize(onMinimize)}>
            {UI.min}
          </button>
          <button className="light x" aria-label={t('Zoom {app}', { app: t(app.dock) })} onClick={onToggleMax}>
            {UI.max}
          </button>
        </div>
        <div className="t">{t(app.title)}</div>
      </div>
      {/* phones only (CSS): iOS navigation bar and home indicator */}
      <div className="ios-nav">
        <button className="ios-back" onClick={() => (inner ? inner.onBack() : animateMinimize(onClose))}>
          {UI.back}
          <span>{inner ? inner.label : t('Home')}</span>
        </button>
        <span className="ios-title">{t(app.dock)}</span>
      </div>
      <WinNavCtx.Provider value={setInner}>
        <div className="win-body">{children}</div>
      </WinNavCtx.Provider>
      <button className="home-ind" aria-label={t('Go to Home Screen')} onClick={() => animateMinimize(onClose)} />
      <div className="grip" aria-hidden="true" onPointerDown={resize} />
    </section>
  )
}
