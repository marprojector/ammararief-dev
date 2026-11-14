# DESIGN.md
# macOS-Inspired Software Engineer Portfolio

## 1. Project Overview

Membangun personal portfolio website dengan pengalaman visual yang terinspirasi dari desktop macOS.

Portfolio tidak menggunakan pendekatan landing page konvensional yang berisi section panjang secara vertikal. Sebaliknya, website menghadirkan pengalaman desktop interaktif yang memungkinkan pengunjung membuka berbagai aplikasi untuk mengenal profil, proyek, pengalaman, keahlian, dan informasi kontak.

Konsep utamanya adalah menjadikan portfolio seperti sebuah personal computer milik seorang Software Engineer.

### Core Concept

- Desktop macOS sebagai halaman utama.
- Dock sebagai pusat navigasi aplikasi.
- Menu Bar untuk informasi sistem dan navigasi global.
- Application Windows sebagai wadah konten.
- Safari sebagai pusat eksplorasi proyek dan website yang pernah dikelola.
- Setiap aplikasi memiliki fungsi dan konten yang jelas.

### Design Philosophy

1. **Familiar Interaction** — Menggunakan pola interaksi desktop yang familier.
2. **Purposeful Applications** — Setiap aplikasi harus memiliki tujuan dan konten nyata.
3. **Engineering First** — Menampilkan kemampuan engineering, bukan sekadar visual website.
4. **Minimal and Refined** — Tampilan bersih, modern, dan tidak berlebihan.
5. **Responsive Experience** — Pengalaman tetap nyaman di desktop, tablet, dan mobile.
6. **Performance First** — Animasi dan efek visual tidak boleh mengorbankan performa.

---

## 2. Desktop Environment

### 2.1 Desktop Workspace

Desktop merupakan tampilan pertama ketika pengunjung membuka portfolio.

Elemen utama:

- Wallpaper atau background desktop.
- Menu Bar di bagian atas.
- Dock di bagian bawah.
- Desktop icons atau shortcuts opsional.
- Application Windows yang dapat dibuka dan ditutup.

Desktop harus terasa seperti lingkungan kerja personal, bukan dashboard admin.

### 2.2 Menu Bar

Menu Bar berada di bagian paling atas.

Konten:

- Apple-style menu icon (gunakan simbol generik yang tidak mengklaim sebagai produk resmi Apple).
- Active application name.
- Menu navigasi aplikasi.
- Status indicators.
