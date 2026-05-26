# design.md — Panduan Implementasi UI/UX Figma ke Ionic Angular

---

## 🤖 INSTRUKSI PERTAMA — WAJIB DIBACA DAN DIPAHAMI SEBELUM MELAKUKAN APAPUN

Halo AI Agent. Sebelum kamu melakukan **satu tindakan apapun**, kamu **WAJIB** membaca
seluruh isi file `design.md` ini dari awal hingga akhir tanpa terkecuali.

Setelah selesai membaca, kamu **WAJIB** melakukan hal berikut:

1. **Konfirmasi** bahwa kamu sudah membaca dan memahami seluruh isi file ini.
2. **Sebutkan secara eksplisit** poin-poin aturan utama yang kamu pahami.
3. **Tunggu instruksi** dari user — jangan lakukan apapun sebelum user berbicara.

> ⚠️ File ini adalah **satu-satunya sumber kebenaran** untuk seluruh proses kerjamu.
> Tidak ada pengecualian. Tidak ada improvisasi. Tidak ada asumsi sepihak.

---

## 📋 IDENTITAS PROJECT

| Properti | Nilai |
|---|---|
| Nama Aplikasi | **E-Tender** |
| Platform | **Mobile — Ionic Framework + Angular** |
| Fokus Kerja | **View Only** (HTML + SCSS per halaman) |
| Design Style | Minimalist Design + Material Design |
| Sumber Desain | Screenshot Figma yang dikirimkan user |

---

## 🎨 DESIGN TOKENS — REFERENSI WARNA GLOBAL

Gunakan **hanya** warna berikut di seluruh implementasi. Tidak boleh ada warna lain.

```scss
// Wajib dideklarasikan di variables.scss atau langsung inline

$primary-blue   : #3F51B5;  // Header, background biru utama, card biru
$blue-light     : #5C6BC0;  // Elemen sekunder di area biru
$accent-cyan    : #00BCD4;  // Tombol CTA, highlight, progress
$cyan-dark      : #0097A7;  // Hover/pressed state tombol CTA
$bg-surface     : #F4F6F9;  // Background halaman, input field
$card-white     : #FFFFFF;  // Background card, area form
$text-primary   : #1A1A2E;  // Teks utama di area putih
$text-secondary : #6B7280;  // Label, meta info, placeholder
$text-muted     : #9CA3AF;  // Timestamp, caption kecil
$text-white     : #FFFFFF;  // Semua teks di atas background biru

// Status Colors
$status-approved : #00BCD4;  // Badge Approved
$status-pending  : #FF9800;  // Badge Pending / Menunggu
$status-rejected : #EF5350;  // Badge Rejected / Ditolak
$status-open     : #4CAF50;  // Badge Open
$status-bidding  : #FFC107;  // Badge Bidding (kuning)
$status-finished : #009688;  // Badge Finished / Selesai
$status-draft    : #9CA3AF;  // Badge Draft
```

---

## ⚙️ KETENTUAN TEKNIS IONIC

```
Framework   : Ionic + Angular
Komponen    : ion-content, ion-header, ion-toolbar, ion-card,
              ion-input, ion-textarea, ion-button, ion-item,
              ion-list, ion-badge, ion-tab-bar, ion-tabs
Ikon        : Ionicons (sudah built-in di Ionic)
Styling     : SCSS per komponen (.page.scss)
Font        : Default system font — JANGAN tambahkan Google Fonts
              kecuali terlihat jelas berbeda di screenshot
```

### Aturan Override CSS Ionic (WAJIB diterapkan)

Ionic punya styling default yang harus di-override agar hasil sesuai Figma:

```scss
// Reset default ion-input
ion-input {
  --padding-start: 0;
  --padding-end: 0;
  --background: transparent;
  --border-width: 0;
  --highlight-height: 0;
}

// Reset default ion-item
ion-item {
  --background: transparent;
  --border-color: transparent;
  --inner-border-width: 0;
  --padding-start: 0;
}

// Reset default ion-content
ion-content {
  --background: #F4F6F9;
}

// Reset default ion-card
ion-card {
  margin: 0;
  box-shadow: none;
}
```

---

## 🔄 WORKFLOW — ALUR KERJA WAJIB

```
┌─────────────────────────────────────────────────────────────────┐
│                        ALUR KERJA AI AGENT                      │
└─────────────────────────────────────────────────────────────────┘

  STEP 1 ──► User menyebutkan halaman yang ingin dikerjakan
                         │
                         ▼
  STEP 2 ──► AI Agent melakukan VALIDASI PERTAMA
             "Apakah user sudah mengirimkan screenshot
              halaman yang dimaksud?"

             ┌─── BELUM ADA SCREENSHOT ───────────────────────┐
             │ AI Agent WAJIB menjawab:                       │
             │ "Saya melihat belum ada screenshot yang        │
             │  dikirimkan untuk halaman [nama halaman].      │
             │  Mohon kirimkan screenshot Figma halaman       │
             │  tersebut terlebih dahulu sebelum saya         │
             │  mulai mengerjakan."                           │
             │                                                │
             │ ➜ AI Agent BERHENTI. Tidak mengerjakan apapun. │
             └────────────────────────────────────────────────┘
                         │
             ┌─── ADA SCREENSHOT ─────────────────────────────┐
             │ Lanjut ke STEP 3                               │
             └────────────────────────────────────────────────┘
                         │
                         ▼
  STEP 3 ──► AI Agent melakukan VALIDASI KEDUA
             Periksa kembali: apakah screenshot yang dikirim
             benar-benar menampilkan UI halaman yang diminta?
             (bukan screenshot error, bukan halaman lain)

             ┌─── SCREENSHOT TIDAK SESUAI / TIDAK JELAS ──────┐
             │ AI Agent WAJIB menjawab:                       │
             │ "Screenshot yang dikirimkan sepertinya         │
             │  bukan halaman [nama halaman] atau kurang      │
             │  jelas. Bisakah Anda mengirimkan ulang         │
             │  screenshot yang lebih jelas?"                 │
             │                                                │
             │ ➜ AI Agent BERHENTI. Tidak mengerjakan apapun. │
             └────────────────────────────────────────────────┘
                         │
             ┌─── SCREENSHOT VALID ────────────────────────────┐
             │ Lanjut ke STEP 4                               │
             └────────────────────────────────────────────────┘
                         │
                         ▼
  STEP 4 ──► AI Agent menganalisis screenshot secara mendetail:
             - Layout dan susunan elemen
             - Warna yang digunakan
             - Ukuran dan proporsi komponen
             - Tipografi (ukuran, weight, warna)
             - Spacing dan padding
             - Status badge dan variasi state
                         │
                         ▼
  STEP 5 ──► AI Agent mengimplementasikan ke kode Ionic
             Hanya file VIEW yang boleh disentuh:
             - [halaman].page.html
             - [halaman].page.scss
                         │
                         ▼
  STEP 6 ──► AI Agent melaporkan hasil kerja:
             - File mana yang diubah
             - Apa saja yang diimplementasikan
             - Apakah ada keterbatasan (misal: aset gambar
               yang tidak bisa dibuat dari kode)
```

---

## 🚫 ATURAN ABSOLUT — TIDAK BOLEH DILANGGAR

```
╔══════════════════════════════════════════════════════════════════╗
║  LARANGAN KERAS — PELANGGARAN = HASIL KERJA DITOLAK             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ✗  Mengerjakan halaman SEBELUM screenshot dikirimkan            ║
║  ✗  Melewati proses validasi screenshot (STEP 2 & STEP 3)        ║
║  ✗  Melakukan improvisasi desain yang tidak ada di screenshot     ║
║  ✗  Menambah elemen baru yang tidak terlihat di Figma            ║
║  ✗  Menghapus elemen yang ada di Figma                           ║
║  ✗  Mengubah warna di luar design tokens yang sudah ditetapkan   ║
║  ✗  Menyentuh file: .ts, routing, service, model, API call       ║
║  ✗  Menyentuh file: controller, backend, database, .env          ║
║  ✗  Mengubah nama variable, method, atau struktur Angular        ║
║  ✗  Mengubah action form, method form, atau nama input field     ║
║  ✗  Menambahkan library atau dependency baru tanpa izin user     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## ✅ YANG BOLEH DAN WAJIB DILAKUKAN

```
  ✓  Hanya mengubah file [halaman].page.html
  ✓  Hanya mengubah file [halaman].page.scss
  ✓  Mengikuti layout screenshot 100% — tidak kurang, tidak lebih
  ✓  Menggunakan komponen Ionic yang sesuai dengan elemen di Figma
  ✓  Override CSS Ionic agar tampilan sesuai Figma
  ✓  Menggunakan Ionicons yang paling mendekati ikon di Figma
  ✓  Mempertahankan nama class Angular (*ngIf, *ngFor, [(ngModel)],
     (click), dll) yang sudah ada — hanya tambahkan class CSS baru
  ✓  Melaporkan bagian yang tidak bisa diimplementasikan murni
     dari kode (contoh: file gambar/aset eksternal)
```

---

## 📐 PANDUAN KOMPONEN — REFERENSI CEPAT

### Bottom Tab Bar (ada di semua halaman utama)

```html
<ion-tab-bar slot="bottom">
  <!-- 4 tab: Home, Tender, Dokumen, Profil -->
  <!-- Active tab: warna #3F51B5, ikon filled -->
  <!-- Inactive tab: warna #9CA3AF, ikon outline -->
</ion-tab-bar>
```

```scss
ion-tab-bar {
  --background: #FFFFFF;
  border-top: 0.5px solid #E5E7EB;
  height: 64px;
}
ion-tab-button {
  --color: #9CA3AF;
  --color-selected: #3F51B5;
}
```

---

### Header Halaman (style biru)

```html
<div class="page-header">
  <!-- Judul halaman + aksi kanan (ikon/tombol) -->
</div>
```

```scss
.page-header {
  background: #3F51B5;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #FFFFFF;
}
```

---

### Card Standar (area putih)

```scss
.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
}
```

---

### Badge Status (pill)

```scss
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;

  &.approved  { background: #00BCD4; color: #FFFFFF; }
  &.pending   { background: #FF9800; color: #FFFFFF; }
  &.rejected  { background: #EF5350; color: #FFFFFF; }
  &.open      { background: #4CAF50; color: #FFFFFF; }
  &.bidding   { background: #FFC107; color: #1A1A2E; }
  &.finished  { background: #009688; color: #FFFFFF; }
  &.draft     { background: #9CA3AF; color: #FFFFFF; }
}
```

---

### Input Field (pill shape — Auth pages)

```scss
.field-wrapper {
  background: #F4F6F9;
  border-radius: 25px;
  display: flex;
  align-items: center;
  padding: 4px 16px;
  margin-bottom: 12px;
  gap: 10px;

  ion-icon { color: #9CA3AF; font-size: 18px; flex-shrink: 0; }

  ion-input {
    --color: #1A1A2E;
    --placeholder-color: #9CA3AF;
    font-size: 14px;
  }
}
```

---

### Tombol CTA Utama (Cyan)

```scss
.btn-cta {
  background: #00BCD4;
  color: #FFFFFF;
  border: none;
  border-radius: 25px;
  width: 100%;
  height: 52px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;

  &:active { background: #0097A7; }
}
```

---

### Tombol Sekunder (outline)

```scss
.btn-secondary {
  background: transparent;
  color: #3F51B5;
  border: 1.5px solid #3F51B5;
  border-radius: 25px;
  width: 100%;
  height: 48px;
  font-size: 14px;
  font-weight: 600;
}
```

---

## 📱 DAFTAR HALAMAN PROJECT

Berikut adalah seluruh halaman yang ada di project ini.
AI Agent hanya boleh mengerjakan halaman yang **screenshot-nya dikirimkan oleh user**.

| No | Nama Halaman | Path File |
|---|---|---|
| 1 | Dashboard (Home) | `home/home.page` |
| 2 | Tender List | `tender/tender.page` |
| 3 | Tender Detail | `tender/detail/detail.page` |
| 4 | Bidding | `tender/bidding/bidding.page` |
| 5 | Ajukan Penawaran | `tender/bidding/ajukan/ajukan.page` |
| 6 | Hasil Tender | `tender/hasil/hasil.page` |
| 7 | Dokumen | `dokumen/dokumen.page` |
| 8 | Profile Vendor | `profile/profile.page` |
| 9 | Edit Profile | `profile/edit/edit.page` |
| 10 | Auth — Login | `auth/login/login.page` |
| 11 | Auth — Register | `auth/register/register.page` |
| 12 | Auth — Lupa Password | `auth/forgot/forgot.page` |
| 13 | Auth — Change Password | `auth/change-password/change-password.page` |

---

## 💬 CONTOH DIALOG YANG BENAR

### Contoh 1 — User belum kirim screenshot

```
User    : "Tolong implementasikan halaman Dashboard."

AI Agent: "Baik, saya siap mengerjakan halaman Dashboard.
           Namun saya melihat belum ada screenshot Figma
           yang dikirimkan untuk halaman ini.

           Mohon kirimkan screenshot halaman Dashboard
           dari Figma terlebih dahulu, baru saya akan
           mulai mengimplementasikan ke kode Ionic."
```

---

### Contoh 2 — User sudah kirim screenshot

```
User    : [mengirim screenshot] "Ini halaman Dashboard,
           tolong implementasikan."

AI Agent: "✅ Validasi 1: Screenshot halaman Dashboard
           sudah diterima.
           ✅ Validasi 2: Screenshot menampilkan halaman
           Dashboard dengan jelas.

           Saya akan mulai menganalisis dan
           mengimplementasikan. Berikut hasilnya:"

           [... memberikan kode HTML dan SCSS ...]
```

---

### Contoh 3 — Screenshot tidak jelas / salah halaman

```
User    : [mengirim screenshot error page] "Tolong kerjakan."

AI Agent: "Saya melihat screenshot yang dikirimkan tidak
           menampilkan halaman UI Figma yang dimaksud
           (terlihat seperti halaman error / bukan halaman
           yang ingin diimplementasikan).

           Bisakah Anda mengirimkan ulang screenshot Figma
           dari halaman yang ingin dikerjakan dengan lebih
           jelas? Saya akan menunggu sebelum memulai."
```

---

## 🔁 SIKLUS KERJA PER HALAMAN

Untuk **setiap halaman baru** yang diminta user, AI Agent
**WAJIB mengulang workflow dari awal** (STEP 1 hingga STEP 6).

Selesai mengerjakan satu halaman **tidak berarti** AI Agent
boleh langsung mengerjakan halaman berikutnya tanpa screenshot baru.

```
Halaman A selesai ──► User minta Halaman B
                              │
                              ▼
                    VALIDASI ULANG dari STEP 2
                    Screenshot Halaman B sudah ada?
                              │
                   ┌──────────┴──────────┐
                  TIDAK                 YA
                   │                    │
             Minta kirim          Lanjut STEP 3
             screenshot           dst...
```

---

## 📌 CATATAN PENTING LAINNYA

- **Scrollable content:** Semua halaman yang memiliki banyak
  konten WAJIB menggunakan `ion-content` yang scrollable.
  Jangan ada konten yang terpotong.

- **Safe area:** Selalu tambahkan `padding-top: var(--ion-safe-area-top)`
  pada header custom agar tidak tertimpa status bar di perangkat nyata.

- **Aset gambar:** Jika di screenshot terdapat gambar/ilustrasi
  yang merupakan file aset, AI Agent cukup memberikan placeholder
  dengan ukuran yang sesuai dan menginformasikan ke user bahwa
  aset tersebut perlu disediakan secara terpisah.

- **Ionic CSS Variables:** Selalu gunakan CSS Variables Ionic
  (`--ion-color-primary`, `--background`, `--color`, dll) untuk
  override styling komponen Ionic agar lebih maintainable.

- **Jangan sentuh TypeScript:** Meski file `.ts` terlihat perlu
  diubah untuk menampilkan data, AI Agent cukup membuat template
  HTML dengan binding yang sudah ada. Jangan tambahkan logic baru
  di `.ts`.

---

*Dokumen ini berlaku selama project berlangsung.*
*Setiap update desain harus disertai screenshot baru.*
*AI Agent yang membaca dokumen ini wajib mematuhi seluruh isinya.*
