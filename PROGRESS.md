# 📋 PROGRESS LOG — Lelang 2.0 (Vendor Mobile App)

---

## Session 001 — Setup Pondasi Auth
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Setup pondasi mobile dari blank template sampai login berhasil.

---

### 📁 Struktur Folder yang Dibuat

```
src/app/
├── core/
│   ├── models/
│   │   └── user.model.ts          ← Interface User, AuthResponse, ApiResponse<T>
│   ├── services/
│   │   ├── storage.service.ts     ← Token & user storage via @capacitor/preferences
│   │   ├── api.service.ts         ← Central HTTP wrapper (get/post/put/delete)
│   │   └── auth.service.ts        ← login, register, logout, me, isLoggedIn
│   ├── interceptors/
│   │   └── auth.interceptor.ts    ← Sisipkan Authorization: Bearer <token>
│   └── guards/
│       └── auth.guard.ts          ← Proteksi route, redirect ke /login
│
└── pages/
    ├── auth/
    │   ├── login/                 ← Halaman login (html, ts, scss)
    │   └── register/              ← Halaman register (html, ts, scss)
    ├── tabs/
    │   ├── tabs.page.html         ← Bottom tab bar (home, tenders, docs, profile)
    │   └── tabs-routing.module.ts ← Child routes: home, profile, documents, tenders
    └── home/
        └── home.page.*            ← Dashboard + welcome card + logout
```

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `src/environments/environment.ts` | ✏️ Diubah | Tambah `apiUrl: 'http://127.0.0.1:8080/api'` |
| `src/environments/environment.prod.ts` | ✏️ Diubah | Sama, untuk production |
| `src/app/app.module.ts` | ✏️ Diubah | Tambah `HttpClientModule` + register `AuthInterceptor` |
| `src/app/app-routing.module.ts` | ✏️ Diubah | Root→`/login`, guard di `/tabs`, wildcard fallback |
| `src/app/core/models/user.model.ts` | ✅ Baru | Interface model |
| `src/app/core/services/storage.service.ts` | ✅ Baru | Capacitor Preferences wrapper |
| `src/app/core/services/api.service.ts` | ✅ Baru | HTTP wrapper terpusat |
| `src/app/core/services/auth.service.ts` | ✅ Baru | 4 method auth endpoint |
| `src/app/core/interceptors/auth.interceptor.ts` | ✅ Baru | Bearer token injector |
| `src/app/core/guards/auth.guard.ts` | ✅ Baru | Route protector |
| `src/app/pages/auth/login/login.page.html` | ✏️ Diubah | Form login lengkap |
| `src/app/pages/auth/login/login.page.ts` | ✏️ Diubah | Logic login + navigate ke /tabs/home |
| `src/app/pages/auth/login/login.page.scss` | ✏️ Diubah | Styling card-style form |
| `src/app/pages/auth/register/register.page.html` | ✏️ Diubah | Form 7 field register |
| `src/app/pages/auth/register/register.page.ts` | ✏️ Diubah | Logic register + navigate |
| `src/app/pages/auth/register/register.page.scss` | ✏️ Diubah | Styling form |
| `src/app/pages/tabs/tabs.page.html` | ✏️ Diubah | Ion-tabs + tab bar |
| `src/app/pages/tabs/tabs-routing.module.ts` | ✏️ Diubah | Child routes di dalam tabs |
| `src/app/pages/home/home.page.html` | ✏️ Diubah | Welcome card + menu grid |
| `src/app/pages/home/home.page.ts` | ✏️ Diubah | Load user dari storage + call auth/me |
| `src/app/pages/home/home.page.scss` | ✏️ Diubah | Gradient welcome card |
| `src/app/pages/home/home.module.ts` | ✏️ Diubah | Tambah `RouterModule` |
| Semua `*.page.ts` (13 file) | ✏️ Fix | Tambah `standalone: false` (Angular 20 fix) |

---

### 🔌 Endpoint yang Diintegrasikan

| Method | Endpoint | Dipakai di |
|--------|----------|------------|
| POST | `/api/auth/login` | `AuthService.login()` |
| POST | `/api/auth/register` | `AuthService.register()` |
| POST | `/api/auth/logout` | `AuthService.logout()` |
| GET  | `/api/auth/me` | `AuthService.me()` |

---

### 🗺️ Routing Setup

```
/                → redirect ke /login
/login           → LoginPage         (public)
/register        → RegisterPage      (public)
/forgot-password → ForgotPasswordPage (public)
/reset-password  → ResetPasswordPage  (public)
/tabs            → TabsPage          (🔒 AuthGuard)
  /tabs/home        → HomePage
  /tabs/profile     → ProfilePage
  /tabs/documents   → DocumentsPage
  /tabs/tenders     → TenderListPage
/**              → redirect ke /login
```

---

### 📦 Package yang Diinstall

```
@capacitor/preferences   ← Native key-value storage untuk token & user
```

---

### 🐛 Bug yang Ditemukan & Diperbaiki

| Bug | Penyebab | Solusi |
|-----|----------|--------|
| `NG6008: Component is standalone` | Angular 20 default `standalone: true` | Tambah `standalone: false` ke semua `@Component` |
| Duplicate `export class HomePageModule` | replace_file_content tool bug | Rewrite file lengkap |

---

### 🧪 Cara Test

**Login:**
1. Buka `http://localhost:8100` → auto redirect ke `/login`
2. Isi: `vendor.approved@example.com` / `password`
3. Klik MASUK → toast sukses → redirect ke `/tabs/home`

**Cek token tersimpan:**
- DevTools → Application → Local Storage → cari `_cap_auth_token` dan `_cap_auth_user`

**Cek auth/me berhasil:**
- DevTools → Console → lihat log `[auth/me] success { id: ... }`
- DevTools → Network → filter `auth/me` → response 200

---

### 🔜 Next Session (Belum Dikerjakan)

- [ ] Halaman Profile (lihat & edit data vendor)
- [ ] Halaman Documents (upload & list dokumen)
- [ ] Halaman Tender List (list tender aktif)
- [ ] Halaman Tender Detail
- [ ] Bid Form (ikut tender)
- [ ] Forgot Password & Reset Password flow
- [ ] Handling token expired (401 interceptor → auto logout)

---

## Session 002 — API Documentation Research
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

> **⚠️ CATATAN KOREKSI:** Endpoint dari Apidog (Session 002-003) ternyata **tidak sama** dengan implementasi backend asli. Session 004 melakukan koreksi total berdasarkan `routes/api.php`. Path final yang benar ada di Session 004 dan Session 012.
> Total endpoint final yang diimplementasi: **21 endpoint** (bukan 19).

### 🎯 Tujuan
Membaca seluruh dokumentasi API dari Apidog dan memetakan endpoint yang akan digunakan vendor.

### 📄 File yang Dibuat

| File | Keterangan |
|------|------------|
| `API_REFERENCE.md` | Referensi lengkap 19 endpoint vendor berdasarkan Apidog (⚠️ beberapa path ternyata keliru — lihat Session 004) |

### 📊 Hasil
- Total endpoint dari Apidog: **19 endpoint** *(versi dokumentasi awal, belum terverifikasi)*
- ✅ **Total endpoint final backend:** **21 endpoint** *(verified dari `routes/api.php` — lihat Session 004 & 012)*
- Sumber Apidog: https://llmwulg77h.apidog.io/ *(tidak lagi menjadi acuan)*
- Semua endpoint dicatat lengkap dengan method, path, body, dan response example

### 🗂️ Kategori Endpoint Vendor

| Kategori | Jumlah |
|----------|--------|
| Authentication | 5 |
| Vendor Profile | 3 |
| Vendor Documents | 2 |
| Tender (browse) | 2 |
| Participation | 1 |
| Aanwijzing | 1 |
| Bidding | 3 |
| Winner & Result | 2 |
| **Total Apidog** | **19** |
| **Total Final Backend** | **21** |

> ⚠️ Selisih 2 endpoint: `POST /api/auth/forgot-password` dan `POST /api/auth/reset-password` tidak terdokumentasi di Apidog tapi ada di `routes/api.php`. Path beberapa endpoint juga berbeda — lihat **Session 004** untuk koreksi.

### 🔜 Next Session
- [x] Update `AuthService` sesuai endpoint real dari Apidog (path `/api/login` bukan `/api/auth/login`)
- [x] Buat semua TypeScript model sesuai response schema
- [ ] Implementasi halaman Profile + Documents + Tender

---

## Session 003 — Fix & Align Endpoints dengan Apidog
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai ~~(Endpoint path DEPRECATED — dikoreksi Session 004)~~

> **⚠️ DEPRECATED:** Tabel endpoint di session ini menggunakan path dari Apidog yang **keliru** (contoh: `POST login` tanpa prefix `auth/`, `vendor/profile` bukan `vendors/me`). Lihat **Session 004** untuk path yang terverifikasi dari `routes/api.php` backend.

### 🎯 Tujuan
Perbaiki semua endpoint dan model agar 100% sesuai dengan dokumentasi Apidog.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Perubahan |
|------|--------|-----------|
| `src/app/core/models/user.model.ts` | ✏️ Diubah | Expand: tambah Vendor, VendorProfile, VendorDocument, Tender, Announcement, Bid, Winner, TenderResult |
| `src/app/core/services/auth.service.ts` | ✏️ Diubah | Fix path: `auth/login`→`login`, `auth/register`→`register`, `auth/logout`→`logout`. Tambah `changePassword()` |
| `src/app/core/services/vendor.service.ts` | ✅ Baru | getProfile, updateProfile, getStatus, getDocuments, uploadDocument |
| `src/app/core/services/tender.service.ts` | ✅ Baru | getTenders, getTenderDetail, joinTender, getAnnouncements, submitBid, updateBid, getMyBid, getWinner, getTenderResult |
| `src/app/pages/auth/login/login.page.ts` | ✏️ Diubah | Hapus `LoadingController` unused, hapus redundant `auth/me` call |
| `src/app/pages/home/home.page.ts` | ✏️ Diubah | Ganti `auth/me` → `VendorService.getProfile()` untuk data lebih lengkap |
| `src/app/pages/home/home.page.html` | ✏️ Diubah | Tampilkan status verifikasi vendor dengan badge warna |

---

### 🔧 Perbandingan Endpoint Sebelum vs Sesudah

| Endpoint | Sebelum (Salah) | Sesudah (Apidog) |
|----------|-----------------|------------------|
| Login | `POST auth/login` | `POST login` ✅ |
| Register | `POST auth/register` | `POST register` ✅ |
| Logout | `POST auth/logout` | `POST logout` ✅ |
| Me | `GET auth/me` | `GET auth/me` ✅ (sudah benar) |
| Change Password | — | `PUT auth/change-password` ✅ |
| Vendor Profile | — | `GET vendor/profile` ✅ |
| Update Profile | — | `PUT vendor/profile` ✅ |
| Vendor Status | — | `GET vendor/status` ✅ |
| Documents | — | `GET/POST vendor/documents` ✅ |
| Tenders | — | `GET tenders`, `GET tenders/{id}` ✅ |
| Join Tender | — | `POST tenders/{id}/participants` ✅ |
| Announcements | — | `GET tenders/{id}/announcements` ✅ |
| Submit Bid | — | `POST tenders/{id}/bids` ✅ |
| Update Bid | — | `PUT tenders/{id}/bids/{bidId}` ✅ |
| My Bid | — | `GET tenders/{id}/bids/me` ✅ |
| Winner | — | `GET tenders/{id}/winner` ✅ |
| Result | — | `GET tenders/{id}/result` ✅ |

### 🔜 Next Session
- [ ] Implementasi halaman Profile (tampil + edit)
- [ ] Implementasi halaman Documents (list + upload)
- [ ] Implementasi halaman Tender List (dengan filter status)
- [ ] Implementasi Tender Detail + Join Tender
- [ ] Bid Form (submit & update penawaran)
- [ ] Handling 401 Unauthorized → auto logout (update interceptor)

---

## Session 004 — Fix Path Endpoint (Verified dari api.php)
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Perbaiki semua path endpoint berdasarkan isi `routes/api.php` yang asli dari backend Laravel.

### 🐛 Root Cause Error Login
Error "route api/login could not be found" terjadi di Session 003 karena Apidog menampilkan path `/api/login` tapi backend aslinya menggunakan `/api/auth/login`. Session ini mengkonfirmasi path-path yang benar.

### 📄 File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/app/core/services/vendor.service.ts` | `vendor/profile`→`vendors/me`, `vendor/status`→`vendors/status`, `vendor/documents`→`vendors/documents` |
| `src/app/core/services/tender.service.ts` | Konfirmasi path tender, catat bahwa GET tenders bersifat PUBLIC |
| `API_REFERENCE.md` | Rewrite total berdasarkan api.php (bukan Apidog) |

### ✅ Tabel Path FINAL (Terverifikasi)

| Salah | Benar |
|-------|-------|
| `vendor/profile` | `vendors/me` |
| `vendor/status` | `vendors/status` |
| `vendor/documents` | `vendors/documents` |
| `auth/login` | `auth/login` ✅ (sudah benar) |
| `tenders/{id}` | `tenders/{tender}` ✅ |

### 🔑 Catatan Penting dari api.php
- `GET /api/tenders` dan `GET /api/tenders/{tender}` adalah **PUBLIC** — tidak butuh token
- Semua vendor & bidding endpoint butuh **Bearer token**
- Auth prefix: semua di bawah `auth/*`
- Vendor prefix: semua di bawah `vendors/*` (bukan `vendor/*`)

### 🔜 Next Session
- [ ] Implementasi halaman Profile (GET/PUT vendors/me)
- [ ] Implementasi halaman Documents (GET/POST vendors/documents)
- [ ] Implementasi halaman Tender List (GET tenders - public)
- [ ] Implementasi Tender Detail + Join Tender
- [ ] Bid Form
- [ ] Handling 401 → auto logout di interceptor

---

## Session 005 — Verifikasi Auth Foundation & Bug Fix Storage
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Cek semua checklist auth foundation dan perbaiki bug yang ditemukan.

---

### 📋 Hasil Verifikasi

| # | Checklist | Status | Keterangan |
|---|-----------|--------|------------|
| 1 | Root `/` redirect ke `/login` | ✅ PASS | Auto redirect berjalan |
| 2 | Login berhasil → navigate ke `/tabs/home` | ✅ PASS | Kredensial vendor valid |
| 3 | Token tersimpan di storage | ❌ FAIL → ✅ FIXED | Bug: JSON.parse("undefined") crash |
| 4 | AuthInterceptor tambah Bearer token | ✅ PASS (setelah fix) | Bergantung pada token valid |
| 5 | AuthGuard lindungi `/tabs` | ✅ PASS | Redirect ke `/login` jika tidak login |
| 6 | Home call `GET /api/auth/me` | ✅ PASS (setelah fix) | Sekarang call `GET /api/vendors/me` |

---

### 🐛 Bug yang Ditemukan & Diperbaiki

**Bug 1: `JSON.parse("undefined")` crash di StorageService**
- **Penyebab:** `VendorProfile` di-cast paksa ke `User` dengan `as unknown as User` → field tidak match → `undefined` tersimpan sebagai string
- **Gejala:** Console error `SyntaxError: "undefined" is not valid JSON`
- **Fix:** `storage.service.ts` — tambah guard untuk string `"undefined"` dan `"null"`, wrap `JSON.parse` dalam try-catch

**Bug 2: Dangerous type cast di `home.page.ts`**
- **Penyebab:** `res.data as unknown as User` dimana `res.data` adalah `VendorProfile` (struktur berbeda)
- **Fix:** Map manual field yang valid saja: `{ id, name, email, role }` sebelum disimpan ke storage

---

### 📄 File yang Diubah

| File | Perubahan |
|------|-----------|
| `src/app/core/services/storage.service.ts` | Guard null/undefined di set/get, try-catch JSON.parse |
| `src/app/pages/home/home.page.ts` | Hapus dangerous cast, map User fields secara eksplisit |

---

### 🔜 Next Session
- [x] Implementasi halaman Profile (GET/PUT vendors/me)
- [ ] Implementasi halaman Documents (GET/POST vendors/documents)
- [ ] Implementasi halaman Tender List (GET tenders — public)
- [ ] Implementasi Tender Detail + Join Tender
- [ ] Bid Form (submit & update penawaran)
- [ ] Handling 401 → auto logout di interceptor

---

## Session 006 — Phase 2: Vendor Profile + Verification Status
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman profile vendor lengkap dengan view mode, edit mode, dan badge status verifikasi.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `src/app/core/services/vendor.service.ts` | ✅ Sudah ada | `getProfile()`, `updateProfile()`, `getStatus()` |
| `src/app/core/models/user.model.ts` | ✅ Sudah ada | `VendorProfile`, `Vendor` interface |
| `src/app/pages/profile/profile.page.ts` | ✏️ Diisi | Logic view/edit mode, load profile & status |
| `src/app/pages/profile/profile.page.html` | ✏️ Diisi | Template lengkap dengan skeleton, badge, form |
| `src/app/pages/profile/profile.page.scss` | ✏️ Diisi | Styling card, badge, form, error box |
| `src/app/pages/profile/profile.module.ts` | ✏️ Rapi | Import FormsModule + IonicModule |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Endpoint | Status |
|-------|----------|--------|
| Tampilkan nama, email, perusahaan, telepon, alamat | `GET /api/vendors/me` | ✅ |
| Badge status verifikasi (pending/approved/rejected) | `GET /api/vendors/status` | ✅ |
| Catatan penolakan (jika rejected) | `GET /api/vendors/status` | ✅ |
| Edit profil (nama, perusahaan, telepon, alamat) | `PUT /api/vendors/me` | ✅ |
| Toast sukses setelah update | — | ✅ |
| Refresh data setelah update | `GET /api/vendors/me` | ✅ |
| Skeleton loading state | — | ✅ |
| Error handling dari backend | — | ✅ |

---

### 🧪 Cara Test

**1. Lihat profil:**
- Login → klik tab **Profil** di bottom navigation
- Harusnya tampil nama, perusahaan, badge status

**2. Test badge status:**
- Badge **kuning** = `pending` (menunggu verifikasi admin)
- Badge **hijau** = `approved` (terverifikasi)
- Badge **merah** = `rejected` (ditolak + ada catatan)

**3. Test edit profil:**
- Klik ikon ✏️ di header ATAU tombol "Edit Profil"
- Ubah data → klik **Simpan Perubahan**
- Harusnya muncul toast hijau dan data refresh

**4. Test validasi:**
- Kosongkan salah satu field → harusnya muncul error merah

---

### 🔜 Next Session
- [x] Implementasi halaman Documents (list + upload)
- [ ] Implementasi halaman Tender List (filter status)
- [ ] Implementasi Tender Detail + Join Tender
- [ ] Bid Form
- [ ] Handling 401 → auto logout di interceptor

---

## Session 007 — Phase 2: Vendor Documents (List + Upload)
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman Documents untuk list dan upload dokumen vendor.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `src/app/pages/documents/documents.page.ts` | ✏️ Diisi | Logic list, upload, file picker, error handling |
| `src/app/pages/documents/documents.page.html` | ✏️ Diisi | Template lengkap: upload card, list, skeleton, empty state |
| `src/app/pages/documents/documents.page.scss` | ✏️ Diisi | Styling: file picker, doc cards, badge, empty state |
| `src/app/core/interceptors/auth.interceptor.ts` | ✏️ Konfirmasi | Hanya set Authorization, tidak set Content-Type |
| `src/app/core/models/user.model.ts` | ✏️ Fix | `DocumentType`: ganti `sertifikasi` → `dokumen_pendukung` |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Detail |
|-------|--------|
| List dokumen | `GET /api/vendors/documents` dengan skeleton loading |
| Pull-to-refresh | Tarik ke bawah untuk refresh list |
| Upload form (toggle) | Toggle dengan icon di header |
| Select tipe dokumen | `legalitas`, `izin_usaha`, `dokumen_pendukung` |
| File picker custom | Label kustom tampilkan nama file |
| Loading state upload | Spinner di tombol upload |
| Toast sukses | Muncul setelah upload berhasil |
| Reset form | Form reset otomatis setelah upload |
| Refresh list | Otomatis load ulang setelah upload |
| Error handling | Tampilkan error dari backend atau validasi |
| Empty state | Tampil jika belum ada dokumen + tombol upload |
| Status badge | pending/approved/rejected dengan warna berbeda |

---

### ⚠️ Catatan Penting — Multipart/form-data

Upload file menggunakan `HttpClient` raw (di `VendorService.uploadDocument()`), bukan lewat `ApiService`.
Alasan: `ApiService` menambahkan `Content-Type: application/json` secara default yang akan merusak boundary multipart.

`AuthInterceptor` hanya menambahkan `Authorization: Bearer {token}` dan **tidak pernah menyentuh `Content-Type`**, sehingga browser bebas menset boundary multipart yang benar.

---

### 🧪 Cara Test

**1. Lihat list dokumen:**
- Login → klik tab **Dokumen** di bottom nav
- Harusnya tampil daftar dokumen atau empty state

**2. Test pull-to-refresh:**
- Tarik layar ke bawah → list refresh

**3. Test upload:**
- Klik ikon ☁️ di header → form upload muncul
- Pilih tipe → klik area file → pilih file (PDF/JPG/PNG)
- Nama file muncul di file picker
- Klik **Upload Dokumen** → spinner muncul
- Toast hijau muncul + form reset + list refresh

**4. Cek multipart di Network tab:**
- Buka DevTools → Network → cari request ke `vendors/documents`
- Header: `Authorization: Bearer xxx`, **tidak ada** `Content-Type: application/json`
- Request body: `Content-Type: multipart/form-data; boundary=...`

**5. Test empty state:**
- Jika belum ada dokumen → muncul ikon folder + tombol "Upload Sekarang"

---

### 🔜 Next Session
- [x] Implementasi halaman Tender List (GET /api/tenders — public)
- [ ] Implementasi Tender Detail (GET /api/tenders/{id}) + Join Tender
- [ ] Bid Form (POST + PUT /api/tenders/{id}/bids)
- [ ] Handling 401 → auto logout di interceptor

---

## Session 008 — Phase 2: Tender List
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman Tender List dengan search, filter status, dan navigasi ke detail.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `pages/tenders/tender-list/tender-list.page.ts` | ✏️ Diisi | Logic: load, filter, search, navigate |
| `pages/tenders/tender-list/tender-list.page.html` | ✏️ Diisi | Template: searchbar, chip filter, cards, skeleton, empty |
| `pages/tenders/tender-list/tender-list.page.scss` | ✏️ Diisi | Styling: chip scroll, cards, date grid, states |
| `pages/tenders/tender-detail/tender-detail.page.ts` | ✏️ Placeholder | Baca `:id` dari route params, tombol back |
| `pages/tenders/tender-detail/tender-detail.page.html` | ✏️ Placeholder | Coming Soon + tender ID display |
| `pages/tenders/tender-detail/tender-detail.page.scss` | ✏️ Baru | Centered placeholder style |
| `pages/tabs/tabs-routing.module.ts` | ✏️ Tambah | Route `tenders/:id` untuk detail page |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Detail |
|-------|--------|
| Daftar tender | `GET /api/tenders` — public endpoint |
| Filter draft | Draft disembunyikan client-side (`filter()`) |
| Filter status | Chip scroll: Semua / Open / Aanwijzing / Bidding / Closed / Selesai |
| Search | Debounce 300ms, filter by title & description |
| Skeleton loading | 4 card skeleton saat loading |
| Pull-to-refresh | `ion-refresher` — tarik layar ke bawah |
| Empty state | Pesan berbeda: filter/search vs belum ada data |
| Error state | Tampilkan pesan error backend + tombol retry |
| Card klik → detail | Navigate ke `/tabs/tenders/:id` |
| Budget format | `Intl.NumberFormat` dalam format Rupiah |
| Date format | `toLocaleDateString('id-ID')` |
| Status badge | Warna berbeda per status (success/warning/dark/dll) |

---

### 🧪 Cara Test

**1. Lihat list tender:**
- Login → klik tab **Tender** di bottom nav
- Harusnya tampil daftar tender (status ≠ draft)

**2. Test search:**
- Ketik nama tender di searchbar → debounce 300ms → list filter realtime

**3. Test filter status:**
- Klik chip `Bidding` → hanya tampil tender status bidding
- Klik chip `Semua` → tampil semua lagi

**4. Test klik ke detail:**
- Klik card tender → navigate ke `/tabs/tenders/:id`
- Harusnya tampil halaman "Coming Soon - Detail Tender #ID"
- Klik tombol **Kembali** → kembali ke list

**5. Test pull-to-refresh:**
- Di halaman tender list, tarik ke bawah → refresh

---

### 📌 Catatan
- Route `tenders/:id` sudah ditambah di `tabs-routing.module.ts`
- TenderDetailPage saat ini hanya placeholder — akan diimplementasi Session 009
- Filter draft dilakukan di frontend: `filter(t => t.status !== 'draft')`

---

### 🔜 Next Session
- [x] Implementasi Tender Detail penuh (data, join tender)
- [ ] Bid Form (submit & update penawaran)
- [ ] Handling 401 → auto logout di interceptor

---

## Session 009 — Tender Detail + Join Tender + Aanwijzing
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman detail tender penuh: tampilkan data, join tender, dan pengumuman aanwijzing.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `pages/tenders/tender-detail/tender-detail.page.ts` | ✏️ Penuh | Load detail + announcements, join, error mapping |
| `pages/tenders/tender-detail/tender-detail.page.html` | ✏️ Penuh | Template lengkap: header, join, jadwal, requirements, announcements |
| `pages/tenders/tender-detail/tender-detail.page.scss` | ✏️ Penuh | Styling: budget block, join card, schedule, announcements |
| `pages/tenders/tender-detail/tender-detail.module.ts` | ✏️ Rapi | Import CommonModule, FormsModule, IonicModule |
| `core/models/user.model.ts` | ✏️ Tambah | `published_at` ke interface `Announcement` |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Endpoint | Status |
|-------|----------|--------|
| Tampil data tender lengkap | `GET /api/tenders/{tender}` | ✅ |
| Badge status (warna beda per status) | — | ✅ |
| Budget dalam format Rupiah | — | ✅ |
| Jadwal tender (start/end/aanwijzing/bidding) | — | ✅ |
| Persyaratan / requirements | — | ✅ |
| Tombol Join Tender (hanya status open/aanwijzing) | `POST /api/tenders/{tender}/participants` | ✅ |
| Error "vendor not approved" | — | ✅ |
| Error "already joined" → ubah state | — | ✅ |
| State "sudah join" setelah berhasil | — | ✅ |
| Daftar pengumuman aanwijzing | `GET /api/tenders/{tender}/announcements` | ✅ |
| Empty state announcements | — | ✅ |
| Skeleton loading (detail + announcements) | — | ✅ |
| Pull-to-refresh (via forkJoin) | — | ✅ |
| Tombol back | — | ✅ |

---

### 🔑 Catatan Penting

- **Tidak ada vendor_id dikirim** — backend mengambil vendor dari Bearer token
- **Tender ID dari route param** — `this.route.snapshot.paramMap.get('id')`
- **Join hanya muncul** saat status `open` atau `aanwijzing`
- **Announcements 403** saat belum join ditangani diam-diam (tidak tampil sebagai error keras)
- **forkJoin** digunakan agar pull-to-refresh load detail + announcements secara paralel

---

### 🧪 Cara Test

**1. Masuk ke detail tender:**
- Klik card tender dari Tender List → masuk ke `/tabs/tenders/:id`

**2. Test detail tampil:**
- Title, description, status badge, budget, jadwal semua muncul

**3. Test Join Tender (vendor approved):**
- Klik **Ikuti Tender Ini** → spinner muncul → toast hijau → button berubah jadi "Sudah terdaftar"

**4. Test error vendor pending:**
- Login dengan vendor status `pending` → klik Join → muncul error merah "Akun vendor Anda belum diverifikasi"

**5. Test error already joined:**
- Join tender yang sama dua kali → muncul "Anda sudah terdaftar di tender ini"

**6. Test announcements:**
- Jika ada pengumuman → tampil list dengan title, content, tanggal
- Jika belum ada → tampil empty state "Belum ada pengumuman aanwijzing"

**7. Test pull-to-refresh:**
- Tarik layar ke bawah → reload detail + announcements bersamaan

---

### ✅ Checklist Session 009

- [x] Klik tender dari /tabs/tenders masuk ke /tenders/:id
- [x] GET /api/tenders/{tender} berhasil
- [x] Detail tender tampil lengkap
- [x] Badge status tampil
- [x] Tombol Join Tender tampil (status open/aanwijzing)
- [x] POST /api/tenders/{tender}/participants (tanpa vendor_id)
- [x] Error vendor pending tampil jelas
- [x] Error already joined tampil jelas + state berubah
- [x] GET /api/tenders/{tender}/announcements berhasil
- [x] Empty state muncul jika belum ada aanwijzing
- [x] Pull-to-refresh jalan
- [x] Tidak ada form bidding di session ini

---

### 🔜 Next Session
- [x] Bid Form (POST /api/tenders/{tender}/bids)
- [x] Update Bid (PUT /api/tenders/{tender}/bids/{bid})
- [ ] Handling 401 → auto logout di interceptor
- [ ] Halaman Tender Result / Winner (opsional)

---

## Session 010 — Bid Form + My Bid (Submit & Update)
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman Bid Form: muat bid saat ini, submit penawaran baru, dan update penawaran yang sudah ada.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `pages/tenders/bid-form/bid-form.page.ts` | ✏️ Penuh | Load my bid, submit, update, error mapping |
| `pages/tenders/bid-form/bid-form.page.html` | ✏️ Penuh | Skeleton, current bid card, currency form, submit |
| `pages/tenders/bid-form/bid-form.page.scss` | ✏️ Penuh | Custom currency input, current bid card, error boxes |
| `pages/tenders/bid-form/bid-form.module.ts` | ✏️ Rapi | CommonModule, FormsModule, IonicModule |
| `pages/tenders/tender-detail/tender-detail.page.ts` | ✏️ Tambah | Router, goBid(), showBidButton getter |
| `pages/tenders/tender-detail/tender-detail.page.html` | ✏️ Tambah | Bid card (tampil saat status bidding) |
| `pages/tenders/tender-detail/tender-detail.page.scss` | ✏️ Tambah | Bid card styles |
| `pages/tabs/tabs-routing.module.ts` | ✏️ Tambah | Route `tenders/:id/bid` |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Endpoint | Status |
|-------|----------|--------|
| Load my bid | `GET /api/tenders/{tender}/bids/me` | ✅ |
| Mode submit (404 = belum ada bid) | — | ✅ |
| Mode update (data ada) | — | ✅ |
| Validasi frontend bid_amount > 0 | — | ✅ |
| Submit penawaran baru | `POST /api/tenders/{tender}/bids` | ✅ |
| Update penawaran | `PUT /api/tenders/{tender}/bids/{bid}` | ✅ |
| Auto switch ke mode update setelah submit | — | ✅ |
| Current bid info card (mode update) | — | ✅ |
| Error: vendor not approved | — | ✅ |
| Error: belum join tender | — | ✅ |
| Error: bidding belum mulai | — | ✅ |
| Error: bidding sudah tutup | — | ✅ |
| Error: bukan bid sendiri | — | ✅ |
| Validation error dari backend | — | ✅ |
| Toast sukses | — | ✅ |
| Skeleton loading | — | ✅ |
| Error state dengan retry | — | ✅ |
| Tombol Ajukan Penawaran di detail (status bidding) | — | ✅ |

---

### 🔑 Catatan Penting

- **Bid ID tidak di-hardcode** — diambil dari response `getMyBid()`
- **Vendor ID tidak dikirim** — backend ambil dari Bearer token
- **Tender ID dari route param** — `/tenders/:id/bid`
- **404 dari getMyBid()** → mode submit (normal, bukan error)
- **Setelah submit berhasil** → mode otomatis ganti ke update
- **Tombol "Ajukan Penawaran"** di detail hanya muncul saat status `bidding`

---

### 🧪 Cara Test

**1. Masuk ke Bid Form:**
- Di detail tender (status bidding) → klik **Ajukan Penawaran**

**2. Test GET my bid (belum ada bid):**
- Form kosong, judul "Ajukan Penawaran", tombol kuning

**3. Test GET my bid (sudah ada bid):**
- Card hijau "Penawaran Saat Ini" muncul, form terisi nilai lama, tombol "Perbarui Penawaran"

**4. Test submit bid:**
- Isi harga > 0 → klik Ajukan → toast sukses → form beralih ke mode update

**5. Test update bid:**
- Ubah harga → klik Perbarui → toast "Penawaran berhasil diperbarui"

**6. Test error vendor belum join:**
- Login vendor yang belum join → buka bid form → error "Anda belum terdaftar sebagai peserta tender ini"

**7. Test error bidding closed:**
- Buka bid form tender yang sudah closed → error "Fase bidding sudah ditutup"

**8. Test validasi:**
- Biarkan harga kosong atau 0 → tombol disabled (tidak bisa diklik)

---

### ✅ Checklist Session 010

- [x] Route tenders/:id/bid terdaftar
- [x] GET /api/tenders/{tender}/bids/me dipanggil saat masuk
- [x] 404 → mode submit, ada data → mode update
- [x] Form bid_amount + notes
- [x] Validasi: bid_amount wajib & > 0
- [x] POST /api/tenders/{tender}/bids (tanpa vendor_id)
- [x] PUT /api/tenders/{tender}/bids/{bid} (tanpa vendor_id, bid_id dari my bid)
- [x] Toast sukses muncul
- [x] Error backend tampil jelas
- [x] Tidak ada form winner/result di session ini

---

### 🔜 Next Session
- [x] Halaman Tender Result / Winner
- [ ] Handling 401 → auto logout + redirect ke login

---

## Session 011 — Winner + Tender Result
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Implementasi halaman Hasil Tender: tampilkan pemenang dan hasil penawaran vendor sendiri.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `pages/tenders/result/result.page.ts` | ✏️ Penuh | forkJoin winner+result, error handling, getters |
| `pages/tenders/result/result.page.html` | ✏️ Penuh | Skeleton, Your Result card, Winner card, empty states |
| `pages/tenders/result/result.page.scss` | ✏️ Penuh | Gold winner card, result badge, stat grid |
| `pages/tenders/result/result.module.ts` | ✏️ Rapi | CommonModule, FormsModule, IonicModule |
| `pages/tenders/tender-detail/tender-detail.page.ts` | ✏️ Tambah | `showResultButton` getter, `goResult()` method |
| `pages/tenders/tender-detail/tender-detail.page.html` | ✏️ Tambah | Result card (tampil saat status closed/finished) |
| `pages/tenders/tender-detail/tender-detail.page.scss` | ✏️ Tambah | Result card styles |
| `pages/tabs/tabs-routing.module.ts` | ✏️ Tambah | Route `tenders/:id/result` |
| `core/models/user.model.ts` | ✏️ Perluas | `Winner` + `selection_method`, `winning_bid_amount`; `TenderResult` + `final_status`, `not_available` |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Endpoint | Status |
|-------|----------|--------|
| Tampil pemenang | `GET /api/tenders/{tender}/winner` | ✅ |
| Company name pemenang | — | ✅ |
| Nilai bid pemenang (Rupiah) | — | ✅ |
| Metode seleksi | — | ✅ |
| Tanggal dipilih | — | ✅ |
| Catatan pemenang | — | ✅ |
| Tampil hasil vendor sendiri | `GET /api/tenders/{tender}/result` | ✅ |
| Bid amount vendor sendiri | — | ✅ |
| Badge status: won/lost/pending/not_available | — | ✅ |
| Final status tender | — | ✅ |
| Empty state winner belum dipilih | — | ✅ |
| Empty state result belum tersedia | — | ✅ |
| Error backend tampil | — | ✅ |
| Skeleton loading (dua card) | — | ✅ |
| Pull-to-refresh (forkJoin) | — | ✅ |
| Tombol back | — | ✅ |
| Tombol "Lihat Hasil" di tender detail | — | ✅ (status closed/finished) |

---

### 🔑 Catatan Penting

- **forkJoin + catchError** agar winner/result gagal tidak saling crash
- **winnerBidAmount getter** mendukung dua nama field: `bid_price` dan `winning_bid_amount`
- **`not_available`** ditambah ke union type untuk state belum ada result
- **Tombol "Lihat Hasil"** di tender-detail hanya muncul saat status `closed` atau `finished`
- **Tidak ada vendor_id dikirim** — backend ambil dari Bearer token

---

### 🧪 Cara Test

**1. Masuk ke Result:**
- Detail tender (status closed/finished) → klik **Lihat Hasil Tender**

**2. Test winner tampil:**
- Company name, nilai bid, metode seleksi, tanggal muncul

**3. Test Your Result:**
- Badge "Anda Menang!" (hijau) atau "Belum Beruntung" (merah)
- Nilai penawaran Anda sendiri muncul

**4. Test result belum tersedia:**
- Tender baru selesai, belum ada winner → empty state "Pemenang belum dipilih"
- Belum ada result → "Hasil tender belum tersedia"

**5. Test pull-to-refresh:**
- Tarik layar ke bawah → reload winner + result bersamaan

---

### ✅ Checklist Session 011

- [x] /tenders/:id/result bisa dibuka
- [x] GET /api/tenders/{tender}/winner berhasil
- [x] GET /api/tenders/{tender}/result berhasil
- [x] Winner tampil (company_name, nilai, metode, tanggal)
- [x] Winning bid amount dalam format Rupiah
- [x] Bid vendor sendiri tampil
- [x] Badge status won/lost/pending/not_available
- [x] Empty state muncul jika result belum tersedia
- [x] Empty state muncul jika winner belum dipilih
- [x] Error backend ditampilkan di empty state (hint text)
- [x] Pull-to-refresh jalan
- [x] Tombol back ke detail jalan
- [x] Tidak ada vendor_id dikirim dari mobile

---

### 🔜 Next Session
- [x] Handling 401 → auto logout + redirect ke login ← **SELESAI Session 012**

---

## Session 012 — Final Hardening: 401 Auto-Logout + Forgot/Reset Password
**Tanggal:** 2026-05-17
**Status:** ✅ Selesai

### 🎯 Tujuan
Final hardening: auto logout saat token expired (401), halaman lupa password, dan reset password.

---

### 📄 File yang Dibuat / Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `core/interceptors/auth.interceptor.ts` | ✏️ Update | 401 catchError → clearAll + redirect /login + toast |
| `core/services/auth.service.ts` | ✏️ Tambah | `forgotPassword()`, `resetPassword()`, payload interfaces |
| `pages/auth/forgot-password/forgot-password.page.ts` | ✏️ Penuh | Form email, validasi, success state, navigate ke reset |
| `pages/auth/forgot-password/forgot-password.page.html` | ✏️ Penuh | Icon header, success card, error box, form |
| `pages/auth/forgot-password/forgot-password.page.scss` | ✏️ Penuh | Design system auth (gradient, icon circle, input wrap) |
| `pages/auth/reset-password/reset-password.page.ts` | ✏️ Penuh | 4-field form, validasi, backend error mapping, redirect login |
| `pages/auth/reset-password/reset-password.page.html` | ✏️ Penuh | Token+email+password+konfirmasi, show/hide, per-field errors |
| `pages/auth/reset-password/reset-password.page.scss` | ✏️ Penuh | Design system + has-error state + eye toggle |

---

### 🔧 Fitur yang Diimplementasi

| Fitur | Status |
|-------|--------|
| 401 auto logout | ✅ |
| Skip auto logout untuk endpoint public (login/register/forgot/reset) | ✅ |
| Cegah redirect loop dengan `isHandling401` flag | ✅ |
| Toast "Sesi Anda telah berakhir" | ✅ |
| Navigasi ke /login dengan `replaceUrl:true` | ✅ |
| Forgot password form + validasi email | ✅ |
| Forgot password → success card + navigasi ke reset | ✅ |
| Reset password 4 field | ✅ |
| Validasi password min 8 char + match | ✅ |
| Show/hide password toggle | ✅ |
| Per-field error dari backend | ✅ |
| Reset berhasil → toast + redirect login | ✅ |

---

### 🔑 Catatan Penting — 401 Interceptor

```
Request gagal 401
       ↓
isPublicEndpoint(url)?
  Ya  → throwError saja (login/register/forgot/reset normal error)
  Tidak → isHandling401 flag check
             ↓
          clearAll() → toast → router.navigate('/login', replaceUrl)
```

**`replaceUrl: true`** mencegah user bisa back ke halaman protected setelah logout.

---

### 🔑 Catatan — Endpoint Final (Koreksi Session 003)

> **⚠️ Catatan Koreksi:** Session 003 mencatat endpoint dari Apidog yang berbeda dengan implementasi aktual.
> Path final yang digunakan sejak Session 004 adalah:

| Grup | Prefix | Contoh |
|------|--------|--------|
| Auth | `auth/*` | `POST /api/auth/login` |
| Vendor | `vendors/*` | `GET /api/vendors/me` |
| Tender | `tenders/*` | `GET /api/tenders` |

Total endpoint yang diimplementasi: **21 endpoint**

---

### 🧪 Cara Test

**1. Test 401 Auto Logout:**
- Login → dari backend invalidate token (atau tunggu expired)
- Akses protected page → interceptor tangkap 401 → toast + redirect /login

**2. Test Forgot Password:**
- Buka `/forgot-password`
- Masukkan email terdaftar → klik Kirim Link Reset
- Sukses → success card muncul + navigasi ke /reset-password tersedia

**3. Test Reset Password:**
- Buka `/reset-password`
- Isi email + token (dari email) + password baru + konfirmasi
- Sukses → toast + redirect /login

**4. Test validasi Reset:**
- Password < 8 char → error per field
- Password tidak sama → error konfirmasi
- Token salah → error dari backend

---

## 🏁 Final Smoke Test Checklist — Vendor Mobile App
**TSC:** `0 errors` ✅
**Versi:** Session 012

| # | Flow | Status |
|---|------|--------|
| 1 | Login vendor approved | ✅ |
| 2 | Profile vendor tampil (nama, perusahaan, status verifikasi) | ✅ |
| 3 | Badge verifikasi pending/approved/rejected tampil | ✅ |
| 4 | Dokumen vendor tampil (list) | ✅ |
| 5 | Upload dokumen (multipart/form-data) | ✅ |
| 6 | Tender list tampil (filter, search, status) | ✅ |
| 7 | Detail tender tampil (budget, jadwal, requirements) | ✅ |
| 8 | Join tender berhasil | ✅ |
| 9 | Error join: vendor pending tampil jelas | ✅ |
| 10 | Error join: sudah terdaftar tampil jelas | ✅ |
| 11 | Announcements aanwijzing tampil | ✅ |
| 12 | Bid form terbuka dari detail (status bidding) | ✅ |
| 13 | Bid submit (POST) berhasil | ✅ |
| 14 | Bid update (PUT) berhasil | ✅ |
| 15 | Error bid: belum join → tampil jelas | ✅ |
| 16 | Error bid: bidding closed → tampil jelas | ✅ |
| 17 | Result/winner tampil (status closed/finished) | ✅ |
| 18 | Badge won/lost/pending tampil | ✅ |
| 19 | Logout berhasil | ✅ |
| 20 | Token invalid/expired → auto redirect login + toast | ✅ |
| 21 | vendor_id TIDAK pernah dikirim dari mobile | ✅ |
| 22 | Forgot password → link reset terkirim | ✅ |
| 23 | Reset password → password berhasil direset | ✅ |

---

### 📊 Endpoint yang Diimplementasi (21 total)

| Endpoint | Method | Auth | Dipakai di |
|----------|--------|------|------------|
| `/api/auth/login` | POST | Public | login.page |
| `/api/auth/register` | POST | Public | register.page |
| `/api/auth/logout` | POST | 🔒 | home.page |
| `/api/auth/me` | GET | 🔒 | home.page |
| `/api/auth/change-password` | PUT | 🔒 | (AuthService ready) |
| `/api/auth/forgot-password` | POST | Public | forgot-password.page |
| `/api/auth/reset-password` | POST | Public | reset-password.page |
| `/api/vendors/me` | GET | 🔒 | profile.page |
| `/api/vendors/me` | PUT | 🔒 | profile.page |
| `/api/vendors/status` | GET | 🔒 | profile.page |
| `/api/vendors/documents` | GET | 🔒 | documents.page |
| `/api/vendors/documents` | POST | 🔒 | documents.page |
| `/api/tenders` | GET | Public | tender-list.page |
| `/api/tenders/{tender}` | GET | Public | tender-detail.page |
| `/api/tenders/{tender}/participants` | POST | 🔒 | tender-detail.page |
| `/api/tenders/{tender}/announcements` | GET | 🔒 | tender-detail.page |
| `/api/tenders/{tender}/bids/me` | GET | 🔒 | bid-form.page |
| `/api/tenders/{tender}/bids` | POST | 🔒 | bid-form.page |
| `/api/tenders/{tender}/bids/{bid}` | PUT | 🔒 | bid-form.page |
| `/api/tenders/{tender}/winner` | GET | 🔒 | result.page |
| `/api/tenders/{tender}/result` | GET | 🔒 | result.page |
