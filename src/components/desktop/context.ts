import { createContext, useContext } from 'react'
import type { AppId, DesktopData, Theme } from './data'
import type { Lang } from './i18n'

interface Ctx {
  data: DesktopData
  open: (id: AppId) => void
  theme: Theme
  setTheme: (t: Theme) => void
  lang: Lang
  setLang: (l: Lang) => void
  openProject: (id: number) => void
  projectFocus: { id: number; n: number } | null // n changes on every request, so the same project can be asked twice
}

export const DesktopCtx = createContext<Ctx | null>(null)

export const useDesktop = () => {
  const c = useContext(DesktopCtx)
  if (!c) throw new Error('useDesktop must be used inside <Desktop>')
  return c
}
