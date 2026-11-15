import type { DesktopData } from './data'

// English is the source language: every UI string is written in English and looked up here for Indonesian.
// A string missing from ID simply stays English.

export type Lang = 'en' | 'id'

let current: Lang = 'en'
export const getLang = () => current
export const setCurrentLang = (l: Lang) => {
  current = l
}

const ID: Record<string, string> = {
  // menu bar, menus, desktop
  'System menu': 'Menu sistem',
  Desktop: 'Desktop',
  Applications: 'Aplikasi',
  Skills: 'Keahlian',
  Contact: 'Kontak',
  'GitHub profile': 'Profil GitHub',
  'Change appearance': 'Ubah tampilan',
  'Change language': 'Ubah bahasa',
  'Local time in Makassar': 'Waktu lokal di Makassar',
  'About {name}': 'Tentang {name}',
  'Blog in Notes': 'Blog di Catatan',
  'Blog page': 'Halaman blog',
  'Match system appearance': 'Ikuti tampilan sistem',
  Light: 'Terang',
  Dark: 'Gelap',
  Auto: 'Otomatis',
  'Close all windows': 'Tutup semua jendela',
  'Open README': 'Buka README',
  'Open projects': 'Buka proyek',
  '{job} in {city}': '{job} di {city}',
  'Open {app}': 'Buka {app}',
  'GitHub (opens in a new tab)': 'GitHub (terbuka di tab baru)',
  'Appearance: {mode}': 'Tampilan: {mode}',
  'match system': 'ikuti sistem',
  light: 'terang',
  dark: 'gelap',
  'Language: {name}': 'Bahasa: {name}',
  Home: 'Beranda',
  'Go to Home Screen': 'Ke Layar Utama',
  'Good morning': 'Selamat pagi',
  'Good afternoon': 'Selamat siang',
  'Good evening': 'Selamat malam',
  yr: 'thn',
  Dock: 'Dock',

  // app names
  'About This Engineer': 'Tentang Engineer Ini',
  About: 'Tentang',
  Projects: 'Proyek',
  Experience: 'Pengalaman',
  Notes: 'Catatan',
  'New Message': 'Pesan Baru',

  // window
  'Close {app}': 'Tutup {app}',
  'Minimize {app}': 'Kecilkan {app}',
  'Zoom {app}': 'Perbesar {app}',

  // shared project words
  'Independent project': 'Proyek mandiri',
  'In testing': 'Uji coba',
  Live: 'Aktif',
  Internal: 'Internal',
  'No public link': 'Tanpa tautan publik',
  Present: 'Sekarang',
  now: 'sekarang',
  '{n} project': '{n} proyek',
  '{n} projects': '{n} proyek',
  Search: 'Cari',
  Back: 'Kembali',
  Forward: 'Maju',
  'Try again': 'Coba lagi',
  Copy: 'Salin',
  Copied: 'Tersalin',

  // About (System Settings)
  Profile: 'Profil',
  Location: 'Lokasi',
  'How I Work': 'Cara Saya Bekerja',
  Appearance: 'Tampilan',
  Settings: 'Pengaturan',
  'Search settings': 'Cari pengaturan',
  'All settings': 'Semua pengaturan',
  Name: 'Nama',
  Role: 'Peran',
  'Building since': 'Membangun sejak',
  '{n} built, {m} public': '{n} dibuat, {m} publik',
  Currently: 'Saat ini',
  'Based in {addr}. Local time follows WITA (UTC+8).': 'Berbasis di {addr}. Waktu lokal mengikuti WITA (UTC+8).',
  City: 'Kota',
  Country: 'Negara',
  'Time zone': 'Zona waktu',
  'Local time': 'Waktu lokal',
  'Open in Maps': 'Buka di Maps',
  'Roles on my projects': 'Peran di proyek saya',
  'Across the stack': 'Di seluruh stack',
  '{n} roles since {d}, {c} of them current.': '{n} posisi sejak {d}, {c} di antaranya masih berjalan.',
  'Open timeline': 'Buka timeline',
  '{n} projects since {y}, {m} with a public website.': '{n} proyek sejak {y}, {m} dengan situs publik.',
  'Browse projects': 'Lihat proyek',
  'Email reaches me directly. Socials are below.': 'Email langsung sampai ke saya. Media sosial ada di bawah.',
  'Write a message': 'Tulis pesan',
  'Choose how this desktop looks. Auto follows your device.': 'Pilih tampilan desktop ini. Otomatis mengikuti perangkat Anda.',

  // Projects (store)
  View: 'Lihat',
  Discover: 'Jelajahi',
  'Recent projects': 'Proyek terbaru',
  'Other projects': 'Proyek lainnya',
  'Not tied to one of the roles above.': 'Tidak terkait dengan salah satu posisi di atas.',
  'Projects in this role': 'Proyek di posisi ini',
  'Open {name} in Projects': 'Buka {name} di Proyek',
  'Why it was built': 'Mengapa dibuat',
  'What changed': 'Yang berubah',
  Before: 'Sebelum',
  After: 'Sesudah',
  'By the numbers': 'Dalam angka',
  Estimate: 'Perkiraan',
  'Estimated from how the work was done before the app, not a measured figure.': 'Diperkirakan dari cara kerja sebelum aplikasi ada, bukan angka hasil pengukuran.',
  purpose: 'tujuan',
  saves: 'efisiensi',
  changed: 'berubah',
  '(estimate)': '(perkiraan)',
  'Selected projects': 'Proyek pilihan',
  'Previous project': 'Proyek sebelumnya',
  'Next project': 'Proyek berikutnya',
  '{name}, {i} of {n}': '{name}, {i} dari {n}',
  'Show {name}': 'Tampilkan {name}',
  'Visit site': 'Kunjungi situs',
  'Internal system': 'Sistem internal',
  'Not publicly hosted': 'Tidak di-hosting publik',
  Released: 'Rilis',
  Preview: 'Pratinjau',
  'About this project': 'Tentang proyek ini',
  Impact: 'Dampak',
  Information: 'Informasi',
  Client: 'Klien',
  'My role': 'Peran saya',
  Website: 'Situs web',
  'Not public': 'Tidak publik',
  'Also released in {y}': 'Juga rilis di {y}',
  '{n} project released': '{n} proyek dirilis',
  '{n} projects released': '{n} proyek dirilis',
  Results: 'Hasil',
  '{n} match for “{q}”': '{n} hasil untuk “{q}”',
  '{n} matches for “{q}”': '{n} hasil untuk “{q}”',
  'No project matches “{q}”. Try a year, a client such as Bosowa, or a stack such as Rust.':
    'Tidak ada proyek yang cocok dengan “{q}”. Coba tahun, klien seperti Bosowa, atau stack seperti Rust.',
  'Search projects or stack': 'Cari proyek atau stack',
  'Search projects': 'Cari proyek',
  'Project library': 'Pustaka proyek',
  'Screenshot of {name}': 'Tangkapan layar {name}',
  'Close preview': 'Tutup pratinjau',
  'Previous screenshot': 'Screenshot sebelumnya',
  'Next screenshot': 'Screenshot berikutnya',
  'Open this page': 'Buka halaman ini',
  '{i} of {n}': '{i} dari {n}',
  // featured slider taglines
  'Free, keyless coding models routed to every coding harness through one local endpoint.': 'Model coding gratis tanpa API key, dirutekan ke semua coding harness melalui satu endpoint lokal.',
  'Terminal-native agent orchestration: one CLI plus a native desktop GUI, written in Rust.': 'Orkestrasi agent berbasis terminal: satu CLI plus GUI desktop native, ditulis dalam Rust.',
  'Boarding-house management: rooms, tenants, bills, finances and WhatsApp notifications.': 'Manajemen rumah kos: kamar, penyewa, tagihan, keuangan, dan notifikasi WhatsApp.',
  'Academic assistant that reaches Edlink data through a Telegram bot, one tenant per customer.': 'Asisten akademik yang menjangkau data Edlink melalui bot Telegram, satu tenant per pelanggan.',
  'Document workspace that turns long files into answers, summaries and structured output.': 'Workspace dokumen yang mengubah berkas panjang menjadi jawaban, ringkasan, dan keluaran terstruktur.',
  'Local information hub for Makassar, built as a fast, mobile-first web app.': 'Pusat informasi lokal untuk Makassar, dibangun sebagai aplikasi web mobile-first yang cepat.',

  // Experience
  "Where I've worked": 'Tempat saya bekerja',
  '{n} roles since {d} · {c} current': '{n} posisi sejak {d} · {c} berjalan',
  'No work history yet.': 'Belum ada riwayat kerja.',

  // Notes
  Today: 'Hari Ini',
  'Previous 7 Days': '7 Hari Terakhir',
  'Previous 30 Days': '30 Hari Terakhir',
  Undated: 'Tanpa tanggal',
  Folders: 'Folder',
  'All Notes': 'Semua Catatan',
  'Open blog page': 'Buka halaman blog',
  '{n} note': '{n} catatan',
  '{n} notes': '{n} catatan',
  'Loading…': 'Memuat…',
  'Search notes': 'Cari catatan',
  "Couldn't load the notes. Check your connection and try again.": 'Gagal memuat catatan. Periksa koneksi Anda lalu coba lagi.',
  'No notes match “{q}”.': 'Tidak ada catatan yang cocok dengan “{q}”.',
  'No articles published yet.': 'Belum ada artikel yang diterbitkan.',
  'No additional text': 'Tidak ada teks tambahan',
  '{n} views': '{n} dilihat',
  'Read on blog': 'Baca di blog',
  'Select a note to read it.': 'Pilih catatan untuk membacanya.',
  '{date} at {time}': '{date} pukul {time}',

  // Contact
  "Let's work on something together": 'Mari bekerja sama',
  'Copy email address': 'Salin alamat email',
  Selected: 'Terpilih',
  To: 'Kepada',
  From: 'Dari',
  you: 'Anda',
  Subject: 'Subjek',
  "I build software across web, desktop and local AI tooling. If you have a system to build, a tool that needs automating or a team that needs another engineer, email me and I'll reply within a couple of days.":
    'Saya membangun perangkat lunak di web, desktop, dan tooling AI lokal. Jika Anda punya sistem yang ingin dibangun, tool yang perlu diotomasi, atau tim yang butuh engineer tambahan, kirimi saya email dan saya akan membalas dalam beberapa hari.',
  'Write email': 'Tulis email',

  // Spotify
  "Couldn't reach Spotify right now.": 'Tidak dapat terhubung ke Spotify saat ini.',
  'Nothing played recently. Check back later.': 'Belum ada lagu yang diputar. Coba lagi nanti.',
  'Listening now': 'Sedang diputar',
  Paused: 'Dijeda',
  'Last played {ago}': 'Terakhir diputar {ago}',
  'Played {ago}': 'Diputar {ago}',
  'Open in Spotify': 'Buka di Spotify',
  "Signed in to Spotify? The full song plays. Otherwise you'll hear a 30-second preview.":
    'Sudah masuk ke Spotify? Lagu diputar penuh. Jika belum, Anda akan mendengar cuplikan 30 detik.',
  'Recently played': 'Baru saja diputar',
  Now: 'Sekarang',
  'Listening now on Spotify': 'Sedang diputar di Spotify',
  'just now': 'baru saja',
  '{n} min ago': '{n} mnt lalu',
  '{n} hr ago': '{n} jam lalu',
  '{n} hrs ago': '{n} jam lalu',
  yesterday: 'kemarin',
  '{n} days ago': '{n} hari lalu',

  // Tech Stack
  Technology: 'Teknologi',
  Kind: 'Jenis',
  Area: 'Area',
  All: 'Semua',
  'All Technologies': 'Semua Teknologi',
  'Search technologies': 'Cari teknologi',
  'No technology matches “{q}”.': 'Tidak ada teknologi yang cocok dengan “{q}”.',
  'Strongest:': 'Terkuat:',
  'Average level:': 'Rata-rata level:',
  'Not rated yet:': 'Belum dinilai:',
  Level: 'Level',
  'No keywords yet.': 'Belum ada kata kunci.',
  'Projects shipped': 'Proyek dirilis',
  'Technologies:': 'Teknologi:',
  'Projects:': 'Proyek:',

  // Terminal
  'who I am': 'siapa saya',
  'tech I use: frontend, backend, database, devops': 'teknologi yang saya pakai: frontend, backend, database, devops',
  'every project, newest first': 'semua proyek, terbaru dulu',
  'details of one project': 'detail satu proyek',
  'work history': 'riwayat kerja',
  'articles I have written': 'artikel yang saya tulis',
  'email and socials': 'email dan media sosial',
  'search all of the above': 'cari di semua data di atas',
  'the same information, as files': 'informasi yang sama, dalam bentuk file',
  'Tab completes commands, project names and files. ↑ ↓ walk through history.': 'Tab melengkapi perintah, nama proyek, dan file. ↑ ↓ menelusuri riwayat.',
  'Everything on this desktop is searchable here. Try': 'Semua isi desktop ini bisa dicari di sini. Coba',
  or: 'atau',
  '{n} result for “{q}”': '{n} hasil untuk “{q}”',
  '{n} results for “{q}”': '{n} hasil untuk “{q}”',
  'command not found: {cmd}. Type': 'perintah tidak ditemukan: {cmd}. Ketik',
  'for the list, or': 'untuk daftar perintah, atau',
  'project <name> for details, e.g.': 'project <nama> untuk detail, contoh:',
  'project: which one? e.g. project herdr. List them with: projects': 'project: yang mana? contoh: project herdr. Lihat daftarnya dengan: projects',
  'project: nothing matches "{q}". List them with: projects': 'project: tidak ada yang cocok dengan "{q}". Lihat daftarnya dengan: projects',
  'projects: nothing in {y}.': 'projects: tidak ada proyek di {y}.',
  'cat blog/<slug> to read one here': 'cat blog/<slug> untuk membaca di sini',
  ', open blog for the full view': ', open blog untuk tampilan penuh',
  "blog: couldn't load articles. Check the connection and try again.": 'blog: gagal memuat artikel. Periksa koneksi lalu coba lagi.',
  'full article:': 'artikel lengkap:',
  'search: what for? e.g. search rust, search 2025, search bosowa': 'search: cari apa? contoh: search rust, search 2025, search bosowa',
  "(blog not searched: couldn't load articles)": '(blog tidak dicari: gagal memuat artikel)',
  'opening {x}…': 'membuka {x}…',
  'open: unknown app "{x}". Try: {list}': 'open: aplikasi "{x}" tidak dikenal. Coba: {list}',
  'stack: no area "{x}". Try: {list}': 'stack: area "{x}" tidak ada. Coba: {list}',
  client: 'klien',
  role: 'peran',
  status: 'status',
  impact: 'dampak',
  'based in': 'lokasi',
}

export function t(s: string, vars?: Record<string, string | number>) {
  let out = current === 'id' ? (ID[s] ?? s) : s
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}

// Picks the singular or plural English key; Indonesian maps both to the same string.
export const tn = (n: number, one: string, many: string, vars: Record<string, string | number> = {}) => t(n === 1 ? one : many, { n, ...vars })

export const locale = () => (current === 'id' ? 'id-ID' : 'en-GB')

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
}
export const monthShort = (m: number) => MONTHS[current][m]

// "3 years" / "1 year" from the data files, in the current language.
export const duration = (s: string | null) => (s && current === 'id' ? s.replace(/\byears?\b/i, 'tahun').replace(/\bmonths?\b/i, 'bulan') : s)

// Translations of the data files (public/data/i18n/id.json). Anything not listed stays in English.
export interface DataOverlay {
  profile?: { description?: string; job?: string }
  projects?: Record<string, { desc?: string; status?: string; metrics?: { value?: string; label?: string }[]; gallery?: string[]; impact?: { purpose?: string; saving?: string; changes?: { before: string; after: string }[] } }>
  work?: Record<string, { highlights?: string }>
}

export function localize(data: DesktopData, overlay: DataOverlay | null, lang: Lang): DesktopData {
  if (lang === 'en' || !overlay) return data
  return {
    ...data,
    profile: { ...data.profile, ...overlay.profile },
    projects: data.projects.map((p) => {
      const o = overlay.projects?.[String(p.id)]
      if (!o) return p
      return {
        ...p,
        desc: o.desc ?? p.desc,
        status: p.status ? (o.status ?? p.status) : p.status,
        metrics: p.metrics?.map((m, i) => ({ value: o.metrics?.[i]?.value ?? m.value, label: o.metrics?.[i]?.label ?? m.label })),
        gallery: p.gallery?.map((g, i) => ({ ...g, caption: o.gallery?.[i] ?? g.caption })),
        impact: p.impact && {
          purpose: o.impact?.purpose ?? p.impact.purpose,
          saving: { ...p.impact.saving, label: o.impact?.saving ?? p.impact.saving.label },
          changes: p.impact.changes.map((c, i) => o.impact?.changes?.[i] ?? c),
        },
      }
    }),
    work: data.work.map((w) => {
      const o = overlay.work?.[String(w.id)]
      return o?.highlights && w.highlights ? { ...w, highlights: o.highlights } : w
    }),
  }
}
