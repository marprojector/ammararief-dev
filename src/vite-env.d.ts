/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_ABOUT?: string
  readonly VITE_SHOW_PROJECTS?: string
  readonly VITE_SHOW_EXPERIENCE?: string
  readonly VITE_SHOW_STACK?: string
  readonly VITE_SHOW_NOTES?: string
  readonly VITE_SHOW_SPOTIFY?: string
  readonly VITE_SHOW_TERMINAL?: string
  readonly VITE_SHOW_CONTACT?: string
}

declare module '*.glb' {
  const src: string;
  export default src;
}
