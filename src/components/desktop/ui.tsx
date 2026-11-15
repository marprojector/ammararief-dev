import type { ReactNode } from 'react'

export const GH_PATH =
  'M8 .5a7.5 7.5 0 0 0-2.37 14.62c.38.07.52-.16.52-.36v-1.3c-2.1.46-2.54-.9-2.54-.9-.34-.87-.84-1.1-.84-1.1-.68-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.67 1.15 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.67-.19-3.43-.84-3.43-3.72 0-.82.29-1.5.78-2.02-.08-.19-.34-.96.07-2 0 0 .63-.2 2.06.77a7.1 7.1 0 0 1 3.76 0c1.43-.97 2.06-.77 2.06-.77.41 1.04.15 1.81.07 2 .48.53.78 1.2.78 2.02 0 2.9-1.77 3.53-3.44 3.71.27.24.51.7.51 1.41v2.09c0 .2.14.44.52.36A7.5 7.5 0 0 0 8 .5Z'

const s = (d: ReactNode, vb = '0 0 16 16') => (
  <svg viewBox={vb} aria-hidden="true">
    {d}
  </svg>
)
const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const UI = {
  x: s(<path d="M1.5 1.5l5 5m0-5-5 5" {...stroke} strokeWidth="1.3" />, '0 0 8 8'),
  min: s(<path d="M1.2 4h5.6" {...stroke} strokeWidth="1.3" />, '0 0 8 8'),
  max: s(<path d="M1.5 3.2V1.5h1.7M6.5 4.8v1.7H4.8M1.5 1.5l2.2 2.2m2.8 2.8L4.3 4.3" {...stroke} strokeWidth="1.2" />, '0 0 8 8'),
  back: s(<path d="M10 3 5 8l5 5" {...stroke} strokeWidth="1.6" />),
  fwd: s(<path d="m6 3 5 5-5 5" {...stroke} strokeWidth="1.6" />),
  ext: s(<path d="M6 3h7v7M13 3 4 12" {...stroke} strokeWidth="1.6" />),
  copy: s(
    <>
      <rect x="5" y="5" width="8.5" height="8.5" rx="1.8" {...stroke} strokeWidth="1.4" />
      <path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10h.3" {...stroke} strokeWidth="1.4" />
    </>,
  ),
  gh: s(<path fill="currentColor" d={GH_PATH} />),
  in: s(
    <path
      fill="currentColor"
      d="M3.6 5.6h-2v8.6h2V5.6ZM2.6 1.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm4.1 3.8h-1.9v8.6h2V9.8c0-1.2.2-2.3 1.7-2.3s1.5 1.4 1.5 2.4v4.3h2V9.4c0-2.3-.5-4-3.1-4-1.3 0-2.1.7-2.4 1.3V5.6Z"
    />,
  ),
  ig: s(
    <>
      <rect x="1.8" y="1.8" width="12.4" height="12.4" rx="3.6" {...stroke} strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2.9" {...stroke} strokeWidth="1.4" />
      <circle cx="11.7" cy="4.3" r=".9" fill="currentColor" />
    </>,
  ),
  pin: s(
    <>
      <path d="M8 14.5s4.8-4.4 4.8-8a4.8 4.8 0 0 0-9.6 0c0 3.6 4.8 8 4.8 8Z" {...stroke} strokeWidth="1.4" />
      <circle cx="8" cy="6.5" r="1.7" fill="currentColor" />
    </>,
  ),
  star: s(<path d="m10 2.2 2.3 4.9 5.3.6-3.9 3.6 1 5.3L10 14l-4.7 2.6 1-5.3-3.9-3.6 5.3-.6L10 2.2Z" {...stroke} strokeWidth="1.5" />, '0 0 20 20'),
  cal: s(
    <>
      <rect x="2.8" y="4" width="14.4" height="13" rx="2.6" {...stroke} strokeWidth="1.5" />
      <path d="M2.8 8h14.4M6.6 2.4v3M13.4 2.4v3" {...stroke} strokeWidth="1.5" />
    </>,
    '0 0 20 20',
  ),
  search: s(
    <>
      <circle cx="7" cy="7" r="4.8" {...stroke} strokeWidth="1.6" />
      <path d="m10.6 10.6 3.4 3.4" {...stroke} strokeWidth="1.6" />
    </>,
  ),
  logo: (
    <img src="/icons/mar-logo.png" alt="" width={16} height={16} draggable={false} />
  ),
  theme: s(<path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 1.4v10.2a5.1 5.1 0 0 1 0-10.2Z" />),
  wifi: s(
    <path
      fill="currentColor"
      d="M8 12.6a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Zm-3.3-2.2a4.7 4.7 0 0 1 6.6 0l-1 1a3.3 3.3 0 0 0-4.6 0l-1-1ZM2.4 8a8 8 0 0 1 11.2 0l-1 1a6.6 6.6 0 0 0-9.2 0l-1-1ZM.2 5.7a11.2 11.2 0 0 1 15.6 0l-1 1a9.8 9.8 0 0 0-13.6 0l-1-1Z"
    />,
  ),
}
