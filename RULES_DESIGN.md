# RULES_DESIGN.md — Aturan Kerja AI Agent Front-End E-Tender

---

## 🤖 LANGKAH PERTAMA — WAJIB SEBELUM APAPUN

Sebelum kamu melakukan **satu tindakan apapun**, kamu **WAJIB** melakukan
hal berikut secara berurutan:

### Step 1 — Baca dan Pahami `design.md`

```
Buka file design.md yang ada di project ini.
Baca dari awal hingga akhir tanpa melewati satu bagian pun.

Yang wajib kamu pahami dari design.md:
  ✓ Seluruh design tokens (warna, spacing, border-radius)
  ✓ Struktur komponen yang sudah ditetapkan
  ✓ Daftar halaman dan path file masing-masing
  ✓ Workflow validasi screenshot
  ✓ Seluruh larangan dan ketentuan kerja
```

### Step 2 — Baca dan Pahami file ini (RULES_DESIGN.md)

```
Baca seluruh isi RULES_DESIGN.md ini dari awal hingga akhir.
Kedua file ini saling melengkapi dan sama-sama WAJIB dipatuhi.

Prioritas jika ada konflik aturan:
  RULES_DESIGN.md > design.md
```

### Step 3 — Konfirmasi kepada User

Setelah membaca kedua file, kamu **WAJIB** menyampaikan konfirmasi
kepada user dengan format berikut:

```
"Saya sudah membaca dan memahami design.md dan RULES_DESIGN.md.

Aturan utama yang saya pahami:
1. [sebutkan poin dari design.md]
2. [sebutkan poin dari RULES_DESIGN.md]
...

Saya siap menerima instruksi."
```

> ⛔ Jangan mulai mengerjakan apapun sebelum Step 3 selesai.

---

## 📋 RINGKASAN ATURAN

```
╔═══════════════════════════════════════════════════════════════════╗
║  Baca design.md dulu          → WAJIB sebelum apapun             ║
║  Elemen sama = kode sama      → Konsistensi antar halaman         ║
║  Kode konsisten sepanjang proyek → HTML & SCSS tidak boleh beda   ║
║  Revisi = validasi dulu       → Jabarkan → Konfirmasi → Kerjakan  ║
║  Layout sama di semua device  → Gunakan unit relatif              ║
║  Hanya file yang disebutkan   → Tidak boleh ada yang lain         ║
║  Back-end = DILARANG KERAS    → Tanpa pengecualian apapun         ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## ATURAN 1 — KONSISTENSI ELEMEN YANG SAMA DI BANYAK HALAMAN

### Prinsip Dasar

```
Jika sebuah elemen muncul di lebih dari satu halaman,
struktur HTML dan SCSS-nya harus IDENTIK — tidak boleh ada
perbedaan class name, struktur tag, urutan properti CSS,
maupun nilai yang berbeda untuk elemen yang sama.
```

### Contoh Elemen yang Wajib Konsisten

| Elemen | Muncul Di | Yang Harus Sama |
|---|---|---|
| Bottom Tab Bar | Semua halaman utama | HTML structure, class, SCSS |
| Badge status | Tender, Dashboard, Hasil | Class name, warna, padding |
| Field input (pill) | Login, Register, Edit Profile | Wrapper class, SCSS styling |
| Tombol CTA (cyan) | Login, Bidding, Register | Class name, height, radius |
| Header halaman (biru) | Semua halaman dalam app | Padding, font-size, struktur |
| Card container | Dashboard, Tender, Hasil | Border-radius, padding, bg |
| Wave vector SVG | Login, Register | ViewBox, path style |

### Aturan Teknis Konsistensi

```scss
// ✅ BENAR — class name sama di semua halaman yang punya elemen ini
.field-wrapper { ... }
.btn-cta { ... }
.page-header { ... }
.status-badge { ... }

// ❌ SALAH — class name berbeda untuk elemen yang sama
.input-container { ... }   // di login
.form-field { ... }        // di register (TIDAK BOLEH)
```

```html
<!-- ✅ BENAR — struktur HTML identik -->
<!-- login.page.html -->
<div class="field-wrapper">
  <ion-icon name="mail"></ion-icon>
  <ion-input type="email" placeholder="..."></ion-input>
</div>

<!-- register.page.html — struktur SAMA PERSIS -->
<div class="field-wrapper">
  <ion-icon name="person"></ion-icon>
  <ion-input type="text" placeholder="..."></ion-input>
</div>

<!-- ❌ SALAH — struktur berbeda untuk elemen yang sama -->
<!-- register.page.html -->
<div class="input-box">                  <!-- class beda -->
  <ion-input type="text"></ion-input>    <!-- tanpa icon -->
</div>
```

### Wajib Dilakukan Saat Mengerjakan Halaman Baru

```
Sebelum menulis kode untuk elemen apapun di halaman baru,
AI Agent WAJIB memeriksa:

  → Apakah elemen ini sudah pernah dibuat di halaman lain?
  → Jika YA: copy struktur yang sudah ada, jangan buat ulang
  → Jika TIDAK: buat baru, lalu jadikan referensi untuk halaman
    berikutnya yang memiliki elemen serupa
```

---

## ATURAN 2 — KONSISTENSI KODE SEPANJANG PROYEK

### HTML — Konvensi yang Harus Dipertahankan

```html
<!-- Urutan atribut ion-input HARUS selalu sama -->
<ion-input
  type="..."
  name="..."
  [(ngModel)]="..."
  required
  placeholder="..."
  autocomplete="...">
</ion-input>

<!-- Urutan atribut ion-button HARUS selalu sama -->
<ion-button
  expand="block"
  type="..."
  class="..."
  [disabled]="...">
  Teks Tombol
</ion-button>
```

### SCSS — Konvensi yang Harus Dipertahankan

```scss
// Urutan penulisan properti CSS HARUS konsisten:
// 1. Display & Layout
// 2. Position
// 3. Box model (width, height, margin, padding)
// 4. Visual (background, border, border-radius, box-shadow)
// 5. Typography (font-size, font-weight, color, text-align)
// 6. Lainnya (transition, cursor, dll)

// Contoh:
.btn-cta {
  // 1. Layout
  display: flex;
  align-items: center;
  justify-content: center;
  // 3. Box model
  width: 100%;
  height: 52px;
  margin-top: 16px;
  // 4. Visual
  background: #00BCD4;
  border: none;
  border-radius: 25px;
  // 5. Typography
  font-size: 15px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.04em;
}
```

### Naming Convention — Wajib Dipatuhi Seluruh Proyek

```
Format class name   : kebab-case (gunakan tanda hubung)
Contoh benar        : .field-wrapper, .btn-cta, .page-header
Contoh salah        : .fieldWrapper, .btnCta, .PageHeader

Format variable SCSS: $nama-variabel
Contoh benar        : $primary-blue, $accent-cyan
Contoh salah        : $primaryBlue, $AccentCyan

Prefix komponen     :
  .btn-*    → semua varian tombol
  .page-*   → elemen level halaman (header, wrapper)
  .card-*   → semua varian card
  .badge-*  → semua varian badge status
  .field-*  → semua varian input field
```

---

## ATURAN 3 — ALUR KERJA REVISI

### Workflow Revisi (berbeda dengan workflow halaman baru)

```
┌──────────────────────────────────────────────────────────────────┐
│                      ALUR KERJA REVISI                           │
└──────────────────────────────────────────────────────────────────┘

  User meminta revisi
  (screenshot TIDAK WAJIB untuk revisi — boleh hanya teks)
         │
         ▼
  AI Agent WAJIB melakukan VALIDASI REVISI:
  Membaca dan memahami permintaan revisi user secara menyeluruh
         │
         ▼
  AI Agent WAJIB menjabarkan secara eksplisit:

  ┌─────────────────────────────────────────────────────────────┐
  │  "Saya memahami revisi yang diminta. Berikut yang akan      │
  │   saya ubah:                                                │
  │                                                             │
  │   File     : [nama file lengkap]                            │
  │   Baris    : [nomor baris yang diubah]                      │
  │   Dari     : [kode/nilai sebelumnya]                        │
  │   Menjadi  : [kode/nilai setelah revisi]                    │
  │                                                             │
  │   Apakah saya boleh melanjutkan revisi ini?"               │
  └─────────────────────────────────────────────────────────────┘
         │
         ▼
  Tunggu konfirmasi user

  ┌── User KONFIRMASI ("ya" / "lanjut" / "oke") ───────────────┐
  │   AI Agent boleh langsung mengeksekusi revisi               │
  └────────────────────────────────────────────────────────────┘

  ┌── User TIDAK konfirmasi / MENOLAK ─────────────────────────┐
  │   AI Agent BERHENTI. Tidak mengubah apapun.                │
  │   Tanya user apa yang perlu diperjelas.                    │
  └────────────────────────────────────────────────────────────┘
```

### Format Laporan Revisi yang Wajib Digunakan

Setiap kali AI Agent melaporkan revisi (baik sebelum maupun sesudah),
wajib menggunakan format ini:

```
📁 File   : login.page.html
📍 Baris  : 6–8
🔴 Dari   :
  <svg viewBox="0 0 375 120" ...>
    <path d="M0,0 L375,0 ..." />
  </svg>

🟢 Menjadi:
  <svg viewBox="0 0 375 100" ...>
    <path d="M0,0 L375,0 C 310,100 ..." />
  </svg>
```

---

## ATURAN 4 — TAMPILAN KONSISTEN DI SEMUA UKURAN DEVICE

### Prinsip

```
Tidak semua user memiliki device dengan ukuran layar yang sama.
Layout, size, margin, padding, dan gap HARUS terlihat konsisten
dan proporsional di semua ukuran device — dari layar kecil
(320px) hingga layar besar (430px+).
```

### Unit yang BOLEH Digunakan

```scss
// ✅ BOLEH — unit relatif dan fluid
width: 100%;
max-width: 480px;
padding: 16px 20px;
margin-bottom: 12px;
font-size: 1rem;
height: 52px;        // ← untuk elemen interaktif (tombol, input)
                     //   boleh fixed karena touch target standar

// ✅ BOLEH — CSS custom properties Ionic
padding-top: var(--ion-safe-area-top);
padding-bottom: var(--ion-safe-area-bottom);

// ❌ HINDARI — unit absolut untuk layout
width: 375px;        // terkunci ke satu ukuran device
margin-left: 48px;   // tidak fleksibel
font-size: 16px;     // lebih baik gunakan rem
```

### Ketentuan Wajib untuk Responsivitas

```scss
// 1. Page wrapper selalu full width
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 2. SVG wave selalu fluid
svg {
  width: 100%;
  display: block;
}

// 3. Tombol dan input selalu full width dalam container-nya
.btn-cta,
.field-wrapper {
  width: 100%;
}

// 4. Container form punya padding horizontal — bukan fixed width
.auth-container {
  padding: 0 24px;   // ✅ bukan width: 327px
}

// 5. Gambar dan aset selalu responsif
img {
  max-width: 100%;
  height: auto;
}
```

### Safe Area — Wajib Diterapkan di Semua Halaman

```scss
// Tambahkan di setiap halaman untuk kompatibilitas
// notch dan gesture bar di device modern

ion-content {
  --padding-top: var(--ion-safe-area-top, 0px);
  --padding-bottom: var(--ion-safe-area-bottom, 0px);
}

.page-header {
  padding-top: calc(16px + var(--ion-safe-area-top, 0px));
}
```

---

## ATURAN 5 — SCOPE FILE YANG BOLEH DISENTUH

### Hanya Boleh Mengubah File yang DISEBUTKAN User

```
╔═══════════════════════════════════════════════════════════════════╗
║  SCOPE KERJA — SANGAT KETAT                                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ✅ BOLEH disentuh (hanya jika disebutkan user):                  ║
║     - [halaman].page.html                                         ║
║     - [halaman].page.scss                                         ║
║     - global.scss (hanya jika user secara eksplisit menyebut)    ║
║     - variables.scss (hanya jika user secara eksplisit menyebut) ║
║                                                                   ║
║  ❌ TIDAK BOLEH disentuh tanpa sebut eksplisit dari user:         ║
║     - File .html atau .scss halaman lain yang tidak disebut      ║
║     - File shared component yang tidak disebut                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Contoh Penerapan

```
User: "Tolong perbaiki padding di halaman Login."

✅ BENAR — AI Agent hanya ubah:
   login.page.html (jika padding ada di template)
   login.page.scss (jika padding ada di style)

❌ SALAH — AI Agent tidak boleh ikut ubah:
   register.page.scss  ← tidak disebut
   global.scss         ← tidak disebut
   variables.scss      ← tidak disebut
```

---

## ATURAN 6 — LARANGAN MENYENTUH BACK-END

### Definisi Back-End dalam Project Ini

```
File/directory berikut adalah BACK-END dan DILARANG KERAS disentuh:

  ❌ src/app/**/*.service.ts       → semua file service
  ❌ src/app/**/*.ts               → semua file TypeScript logic
                                    (kecuali template binding yang
                                     sudah ada, tidak boleh tambah
                                     logic baru)
  ❌ src/environments/             → environment config
  ❌ src/app/app-routing.module.ts → routing
  ❌ src/app/app.module.ts         → module config
  ❌ capacitor.config.ts           → capacitor config
  ❌ ionic.config.json             → ionic config
  ❌ package.json                  → dependencies
  ❌ angular.json                  → angular config
```

### Yang BOLEH Dilakukan di File `.ts` (Terbatas)

```
Satu-satunya interaksi yang DIPERBOLEHKAN dengan file .ts:

  ✅ Membaca file .ts untuk memahami nama variable yang
     sudah ada agar bisa digunakan di template HTML
     (contoh: memahami nama [(ngModel)] yang sudah ada)

  ❌ Tidak boleh menulis, mengubah, atau menambah kode apapun
     ke dalam file .ts
```

---

## ⛔ LARANGAN ABSOLUT — TIDAK ADA PENGECUALIAN

```
╔═══════════════════════════════════════════════════════════════════╗
║  PELANGGARAN SALAH SATU = HASIL KERJA DITOLAK SELURUHNYA         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ✗  Tidak membaca design.md sebelum memulai                      ║
║  ✗  Tidak membaca RULES_DESIGN.md sebelum memulai                ║
║  ✗  Elemen sama tapi struktur kode berbeda antar halaman         ║
║  ✗  Naming convention berbeda dari yang sudah ditetapkan         ║
║  ✗  Langsung revisi tanpa validasi dan konfirmasi user           ║
║  ✗  Menggunakan unit px absolut untuk layout utama               ║
║  ✗  Tidak menyertakan nama file dan nomor baris saat revisi      ║
║  ✗  Mengubah file yang tidak disebutkan user                     ║
║  ✗  Menyentuh file back-end dalam kondisi apapun                 ║
║  ✗  Improvisasi desain yang tidak ada di Figma                   ║
║  ✗  Menambah elemen baru yang tidak diminta                      ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 📌 CHECKLIST SEBELUM SUBMIT HASIL KERJA

Sebelum menyerahkan hasil ke user, AI Agent wajib memeriksa
checklist ini secara mandiri:

```
□ Sudah membaca design.md dan RULES_DESIGN.md sebelum mulai
□ Elemen yang sama sudah konsisten dengan halaman lain
□ Naming convention sudah sesuai (kebab-case, prefix yang benar)
□ Tidak ada unit px absolut untuk layout utama
□ Safe area sudah diterapkan
□ Hanya file yang disebutkan user yang diubah
□ Tidak ada file back-end yang tersentuh
□ Format laporan revisi sudah menyertakan nama file dan nomor baris
□ Revisi sudah divalidasi dan dikonfirmasi user sebelum dikerjakan
□ Tidak ada improvisasi desain di luar permintaan
```

---

*File ini berlaku selama project E-Tender berlangsung.*
*RULES_DESIGN.md dan design.md wajib dibaca ulang setiap sesi baru.*
*Kedua file ini adalah hukum tertinggi dalam pengerjaan front-end project ini.*
