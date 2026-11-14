import { createContext, useContext, useEffect, useRef } from 'react'

// On phones every app gets an iOS navigation bar. Its back button closes the app, unless the app is
// showing something deeper (a project, a note, a settings pane): then the app registers where "back" goes.

export interface InnerBack {
  label: string
  onBack: () => void
}

export const WinNavCtx = createContext<((b: InnerBack | null) => void) | null>(null)

export function useInnerBack(active: boolean, label: string, onBack: () => void) {
  const set = useContext(WinNavCtx)
  const latest = useRef(onBack)
  latest.current = onBack
  useEffect(() => {
    if (!set) return
    set(active ? { label, onBack: () => latest.current() } : null)
    return () => set(null)
  }, [set, active, label])
}
