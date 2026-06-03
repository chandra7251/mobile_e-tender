# 📱 Mobile e-Tender — Dokumentasi Alur Kerja Sistem

> Dokumen ini menjelaskan arsitektur, struktur, dan alur kerja keseluruhan sistem aplikasi mobile e-Tender berbasis Ionic Angular + Capacitor.

---

## 🗂️ Daftar Isi

1. [Gambaran Umum Sistem](#-gambaran-umum-sistem)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Struktur Direktori](#-struktur-direktori)
4. [Arsitektur Aplikasi](#-arsitektur-aplikasi)
5. [Layer Core (Inti)](#-layer-core-inti)
6. [Alur Autentikasi](#-alur-autentikasi)
7. [Sistem Routing & Navigasi](#-sistem-routing--navigasi)
8. [Alur Kerja Per Fitur](#-alur-kerja-per-fitur)
   - [Login & Register](#1-login--register)
   - [Halaman Home (Dashboard)](#2-halaman-home-dashboard)
   - [Manajemen Tender](#3-manajemen-tender)
   - [Form Penawaran (Bid)](#4-form-penawaran-bid)
   - [Hasil Tender](#5-hasil-tender)
   - [Manajemen Dokumen](#6-manajemen-dokumen)
   - [Profil Vendor](#7-profil-vendor)
9. [State Machine Tender](#-state-machine-tender)
10. [Sistem Keamanan & Token](#-sistem-keamanan--token)
11. [Model Data](#-model-data)
12. [Daftar API Endpoint](#-daftar-api-endpoint)
13. [Alur Penyeleksian Pemenang](#-alur-penyeleksian-pemenang)

---

## 🌐 Gambaran Umum Sistem

**Mobile e-Tender** adalah aplikasi mobile untuk **vendor (pemasok)** yang memungkinkan mereka untuk:

- Mendaftarkan akun dan mengelola profil perusahaan
- Melihat dan mendaftar ke tender yang tersedia
- Mengajukan penawaran harga (bidding)
- Melihat pengumuman tender (aanwijzing)
- Mengupload dokumen legalitas perusahaan
- Memantau hasil dan riwayat tender yang diikuti

Aplikasi berkomunikasi dengan **backend Laravel** melalui REST API yang berjalan di `http://127.0.0.1:8080`.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Ionic Framework** | `^8.0.0` | UI components & mobile shell |
| **Angular** | `^20.0.0` | Framework SPA & dependency injection |
| **Capacitor** | `^8.3.4` | Native bridge ke Android/iOS |
| **@capacitor/preferences** | `^8.0.1` | Persistent local storage (token) |
| **RxJS** | `~7.8.0` | Reactive programming & HTTP streams |
| **TypeScript** | `~5.9.0` | Static typing |
| **Ionicons** | `^7.0.0` | Icon library |

---

## 📁 Struktur Direktori

```
mobile_e-tender/
├── src/
│   ├── app/
│   │   ├── core/                        # Lapisan inti (shared/reusable)
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts        # Proteksi rute: hanya untuk user login
│   │   │   │   └── guest.guard.ts       # Proteksi rute: redirect jika sudah login
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts  # Auto-attach token & auto-refresh JWT
│   │   │   ├── models/
│   │   │   │   └── user.model.ts        # Semua interface TypeScript (data models)
│   │   │   └── services/
│   │   │       ├── api.service.ts       # HTTP wrapper (GET/POST/PUT/DELETE)
│   │   │       ├── auth.service.ts      # Login/register/logout/refresh
│   │   │       ├── storage.service.ts   # Capacitor Preferences (token & user)
│   │   │       ├── tender.service.ts    # API tender, bid, pengumuman, hasil
│   │   │       ├── vendor.service.ts    # API profil, dokumen, vendor tenders
│   │   │       └── activity.service.ts  # Log aktivitas navigasi (localStorage)
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login/               # Halaman login
│   │   │   │   ├── register/            # Halaman registrasi vendor baru
│   │   │   │   ├── forgot-password/     # Permintaan reset password via email
│   │   │   │   └── reset-password/      # Atur ulang password dengan token
│   │   │   ├── tabs/                    # Shell navigasi tab bar bawah
│   │   │   ├── home/                    # Dashboard utama vendor
│   │   │   ├── profile/                 # Profil & pengaturan akun vendor
│   │   │   ├── documents/               # Upload & download dokumen legalitas
│   │   │   └── tenders/
│   │   │       ├── tender-list/         # Daftar semua tender (filter & search)
│   │   │       ├── tender-detail/       # Detail tender + join + pengumuman
│   │   │       ├── bid-form/            # Form ajukan/perbarui penawaran
│   │   │       ├── result/              # Hasil tender spesifik
│   │   │       ├── result-history/      # Riwayat semua hasil tender vendor
│   │   │       └── announcements/       # (Halaman pengumuman — stub)
│   │   │
│   │   ├── app-routing.module.ts        # Routing level aplikasi
│   │   ├── app.component.ts             # Root component + activity logger
│   │   └── app.module.ts               # Module root Angular
│   │
│   ├── environments/
│   │   └── environment.ts               # Config: apiUrl = '/api'
│   └── theme/                           # Ionic theme variables
│
├── proxy.conf.json                       # Proxy dev: /api → http://127.0.0.1:8080
└── capacitor.config.ts                  # Config Capacitor (appId, webDir)
```

---

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│   Pages (Login, Home, Tender, Bid, Profile, Documents)  │
└──────────────────────────┬──────────────────────────────┘
                           │ inject
┌──────────────────────────▼──────────────────────────────┐
│                    BUSINESS LOGIC LAYER                  │
│   Services: AuthService, TenderService, VendorService   │
│             StorageService, ActivityService             │
└──────────────────────────┬──────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────┐
│                      API LAYER                           │
│   ApiService → HttpClient → AuthInterceptor             │
│                    ↓                                    │
│             proxy.conf.json                             │
│             /api → http://127.0.0.1:8080                │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    BACKEND (Laravel)                     │
│              REST API — JWT Authentication               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Layer Core (Inti)

### `ApiService` — HTTP Wrapper Dasar

File: [`api.service.ts`](src/app/core/services/api.service.ts)

Menyediakan 4 method HTTP generik yang selalu membungkus response dalam `ApiResponse<T>`:

```typescript
get<T>(endpoint)     → Observable<ApiResponse<T>>
post<T>(endpoint, body)  → Observable<ApiResponse<T>>
put<T>(endpoint, body)   → Observable<ApiResponse<T>>
delete<T>(endpoint)  → Observable<ApiResponse<T>>
```

Base URL diambil dari `environment.apiUrl` (`'/api'`).

---

### `StorageService` — Persistent Storage

File: [`storage.service.ts`](src/app/core/services/storage.service.ts)

Menggunakan **Capacitor Preferences** (bukan localStorage biasa) agar data persisten di native Android/iOS:

| Method | Key | Keterangan |
|--------|-----|-----------|
| `setToken(token)` | `auth_token` | Simpan JWT token |
| `getToken()` | `auth_token` | Ambil JWT token |
| `removeToken()` | `auth_token` | Hapus JWT token |
| `setUser(user)` | `auth_user` | Simpan data user (JSON) |
| `getUser()` | `auth_user` | Ambil data user |
| `clearAll()` | — | Hapus semua data (logout) |

---

### `ActivityService` — Logger Aktivitas Navigasi

File: [`activity.service.ts`](src/app/core/services/activity.service.ts)

Menyimpan log aktivitas navigasi user ke **localStorage** (max 20 entri). Log ini ditampilkan di halaman Home sebagai "Aktivitas Terakhir".

- Mencegah log duplikat berturut-turut dalam 60 detik
- Menyediakan `timeAgo(timestamp)` untuk format waktu relatif (misal: "5 menit yang lalu")

---

### `AuthInterceptor` — Auto-Attach Token & Auto-Refresh

File: [`auth.interceptor.ts`](src/app/core/interceptors/auth.interceptor.ts)

Interceptor HTTP yang berjalan pada **setiap request keluar**:

```
Setiap HTTP Request
        ↓
Baca token dari StorageService
        ↓
Tambahkan header: Authorization: Bearer <token>
        ↓
Kirim request ke backend
        ↓
    [Response]
   /          \
200 OK       Error
               ↓
           [HTTP 429] → Tampilkan toast "Terlalu banyak percobaan"
               ↓
           [HTTP 401] pada endpoint non-publik?
           /               \
     sedang refresh?    belum refresh
           ↓                   ↓
     tunggu di queue      POST /auth/refresh via HttpBackend
           ↓               /            \
     pakai token baru   berhasil       gagal
           ↓               ↓              ↓
      retry request    token baru    force logout
                      retry request  → hapus storage
                                     → redirect /login
```

**Endpoint publik** (tidak trigger auto-refresh saat 401):
- `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`

**Penting:** Refresh menggunakan `HttpClient` yang dibuat langsung dari `HttpBackend` untuk menghindari circular dependency dan infinite loop.

---

## 🔐 Alur Autentikasi

### Registrasi Vendor Baru

```
User → Isi form registrasi
     (name, email, password, company_name, phone, address)
         ↓
AuthService.register(payload)
         ↓
POST /api/auth/register
         ↓
[Berhasil] → token disimpan → navigasi ke /tabs/home
[Gagal]    → tampilkan pesan error
```

### Login

```
User → Isi email & password
         ↓
AuthService.login({ email, password })
         ↓
POST /api/auth/login
         ↓
[Berhasil] → token disimpan via StorageService
           → navigasi ke /tabs/home (replaceUrl: true)
[Gagal]    → tampilkan errorMessage
```

### Logout

```
User klik tombol Logout
         ↓
AuthService.logout()
         ↓
POST /api/auth/logout
         ↓
[Selesai] → StorageService.clearAll()
          → navigasi ke /login (replaceUrl: true)
[Error]   → clearAll() tetap dipanggil
          → navigasi ke /login
```

### Reset Password

```
1. User masukkan email
   → POST /api/auth/forgot-password
   → Email berisi link/token reset dikirim

2. User klik link → buka halaman reset-password dengan token
   → POST /api/auth/reset-password { email, token, password, password_confirmation }
   → Password berhasil diganti → redirect ke login
```

---

## 🗺️ Sistem Routing & Navigasi

### Routing Utama (`app-routing.module.ts`)

```
/ (root)
└── → redirect ke /login

/login          [GuestGuard]  → LoginPage
/register       [GuestGuard]  → RegisterPage
/forgot-password[GuestGuard]  → ForgotPasswordPage
/reset-password [GuestGuard]  → ResetPasswordPage

/tabs           [AuthGuard]   → TabsPage (shell navigasi)
  ├── /tabs/home              → HomePage (dashboard)
  ├── /tabs/profile           → ProfilePage
  ├── /tabs/documents         → DocumentsPage
  ├── /tabs/tenders           → TenderListPage
  ├── /tabs/tenders/:id       → TenderDetailPage
  ├── /tabs/tenders/:id/bid   → BidFormPage
  ├── /tabs/tenders/:id/result→ ResultPage
  └── /tabs/results           → ResultHistoryPage

/** → redirect ke /login (wildcard fallback)
```

### Guard System

| Guard | Kondisi Akses | Jika Gagal |
|-------|---------------|------------|
| `AuthGuard` | User **harus** sudah login (ada token) | Redirect ke `/login` |
| `GuestGuard` | User **belum** login (tidak ada token) | Redirect ke `/tabs/home` |

### Tab Bar Navigasi

Tab bar bawah terdiri dari 4 tab utama:

| Icon | Tab | Route |
|------|-----|-------|
| 🏠 | Home | `/tabs/home` |
| 📄 | Tender | `/tabs/tenders` |
| 🏆 | Hasil | `/tabs/results` |
| 👤 | Profil | `/tabs/profile` |

> Tab **Dokumen** diakses melalui navigasi dari halaman Profil, bukan dari tab bar utama.

---

## 📋 Alur Kerja Per Fitur

### 1. Login & Register

**Flow Login:**
1. Tampilkan form email + password
2. `GuestGuard` memastikan user belum login; jika sudah login, redirect ke Home
3. User submit → `AuthService.login()` → POST `/api/auth/login`
4. Jika berhasil: simpan token → navigasi ke `/tabs/home`
5. Jika gagal: tampilkan `errorMessage` di UI

**Flow Register:**
1. Tampilkan form: nama, email, password, konfirmasi, nama perusahaan, telepon, alamat
2. Validasi password === password_confirmation di frontend
3. `AuthService.register()` → POST `/api/auth/register`
4. Jika berhasil: token disimpan → navigasi ke `/tabs/home`
5. Jika gagal: parse field validation errors dari backend

---

### 2. Halaman Home (Dashboard)

File: [`home.page.ts`](src/app/pages/home/home.page.ts)

Setiap kali halaman ditampilkan (`ionViewWillEnter`), 5 data dimuat secara paralel:

```
ionViewWillEnter()
    ├── loadProfile()          → GET /api/vendors/me
    │                            → tampilkan nama & status verifikasi
    │
    ├── loadOpenTenders()      → GET /api/tenders?status=open
    │                            → tampilkan max 5 tender terbuka
    │
    ├── loadMyTenders()        → GET /api/vendors/tenders
    │   │                        → hitung jumlah per status
    │   └── loadMyAnnouncements(tenders)
    │                          → GET /api/tenders/{id}/announcements (per tender)
    │                          → tampilkan max 5 pengumuman terbaru
    │
    ├── loadBiddingTenders()   → GET /api/tenders?status=bidding
    │                            → tampilkan countdown waktu bidding
    │
    └── loadActivities()       → localStorage 'vendor_activities'
                                 → tampilkan max 5 aktivitas terakhir
```

**Countdown Timer:** Untuk setiap tender dengan status `bidding`, timer interval 1 detik menghitung mundur hingga `bidding_end` (atau `end_date`).

---

### 3. Manajemen Tender

#### A. Daftar Tender (`TenderListPage`)

File: [`tender-list.page.ts`](src/app/pages/tenders/tender-list/tender-list.page.ts)

```
ionViewWillEnter()
    ↓
GET /api/tenders (semua tender)
    ↓
Filter: hanya tampilkan status: open, aanwijzing, bidding, closed, finished
(draft disembunyikan dari vendor)
    ↓
applyFilter():
  ├── Filter by status (activeFilter: 'all' | TenderStatus)
  └── Filter by searchQuery (judul & deskripsi, case-insensitive)
    ↓
Paginasi: 3 item per halaman
```

Filter status yang tersedia: **Semua, Open, Aanwijzing, Bidding, Closed, Selesai**

**Pull-to-refresh** tersedia untuk memuat ulang data dari API.

#### B. Detail Tender (`TenderDetailPage`)

File: [`tender-detail.page.ts`](src/app/pages/tenders/tender-detail/tender-detail.page.ts)

```
ionViewWillEnter()
    ├── getTenderDetail(id)   → GET /api/tenders/{id}
    │     → tender.is_participant langsung dari response (hemat 1 request)
    │     → hasJoined = res.data.is_participant
    │
    └── getAnnouncements(id) → GET /api/tenders/{id}/announcements
          (hanya tampil jika sudah join — 403 diabaikan)
```

**Tombol Aksi Berdasarkan Status:**

| Status Tender | Tombol yang Tampil |
|--------------|-------------------|
| `open` | **Join Tender** (jika belum join) |
| `aanwijzing` | **Join Tender** (jika belum join) |
| `bidding` | **Ajukan Penawaran** |
| `closed` | **Lihat Hasil** |
| `finished` | **Lihat Hasil** |

**Flow Join Tender:**
```
onJoin()
    ↓
POST /api/tenders/{id}/participants
    ↓
[Berhasil] → hasJoined = true → muat ulang pengumuman
[Gagal - pending] → "Akun belum diverifikasi"
[Gagal - rejected] → "Akun ditolak"
[Gagal - sudah terdaftar] → hasJoined = true (update UI saja)
```

---

### 4. Form Penawaran (Bid)

File: [`bid-form.page.ts`](src/app/pages/tenders/bid-form/bid-form.page.ts)

```
ngOnInit()
    ↓
GET /api/tenders/{id}/bids/me
    ↓
  [Ada bid]         [404: belum ada]    [Error lain]
  mode = 'update'   mode = 'submit'     mode = 'error'
  (isi form dengan  (form kosong)       (tampilkan error)
   nilai lama)
```

**Submit Penawaran:**
```
onSubmit()
    ↓
Validasi: bidAmount > 0
    ↓
[mode = 'submit'] → POST /api/tenders/{id}/bids
                     { bid_amount, notes? }
                     → mode berubah ke 'update'

[mode = 'update'] → PUT /api/tenders/{id}/bids/{bidId}
                     { bid_amount, notes? }
                     → refresh bid data
```

**Penanganan Error Validasi:**

| Kondisi | Pesan yang Ditampilkan |
|---------|----------------------|
| `verification_status: pending` | "Akun vendor belum diverifikasi" |
| `verification_status: rejected` | "Akun vendor ditolak" |
| "not a participant" | "Belum terdaftar sebagai peserta" |
| "has not started" | "Fase bidding belum dimulai" |
| "closed" | "Fase bidding sudah ditutup" |

---

### 5. Hasil Tender

#### A. Hasil Tender Spesifik (`ResultPage`)

File: [`result.page.ts`](src/app/pages/tenders/result/result.page.ts)

```
ngOnInit()
    ↓
forkJoin([
  GET /api/tenders/{id}/winner,   → Winner (is_winner, winning_bid_amount, decided_at)
  GET /api/tenders/{id}/result    → TenderResult (winner_company, selection_method)
])
    ↓
Tampilkan:
  ├── [is_winner = true]  → "Anda Menang! 🏆" (warna: success)
  ├── [is_winner = false] → "Belum Beruntung" (warna: danger)
  └── [tidak ada data]   → "Belum Tersedia"
```

#### B. Riwayat Hasil Semua Tender (`ResultHistoryPage`)

File: [`result-history.page.ts`](src/app/pages/tenders/result-history/result-history.page.ts)

```
ionViewWillEnter()
    ↓
GET /api/vendors/results   → VendorResult[]
    ↓
Tampilkan daftar hasil tender yang pernah diikuti vendor
  (is_winner, my_bid_amount, winner_company, winning_bid_amount)
    ↓
Paginasi: 3 item per halaman (dengan ellipsis pagination untuk banyak halaman)
```

---

### 6. Manajemen Dokumen

File: [`documents.page.ts`](src/app/pages/documents/documents.page.ts)

```
ngOnInit()
    ↓
GET /api/vendors/me         → ambil verification_status vendor
    ↓
GET /api/vendors/documents  → daftar dokumen yang sudah diupload
    ↓
Tampilkan daftar dokumen (paginasi 7/halaman)
```

**Upload Dokumen:**
```
User pilih file (PDF/JPG/PNG)
    ↓
Pilih jenis dokumen:
  ├── Legalitas (legalitas)
  ├── Izin Usaha (izin_usaha)
  └── Dokumen Pendukung (dokumen_pendukung)
    ↓
onUpload()
    ↓
FormData { document_type, file }
    ↓
POST /api/vendors/documents (multipart/form-data)
Header: Authorization: Bearer <token>
    ↓
[Berhasil] → reset form → refresh daftar dokumen
```

**Download Dokumen (Authenticated):**

File dokumen **tidak memiliki URL publik**. Download harus melalui endpoint khusus:

```
onDownload(doc)
    ↓
GET /api/vendors/documents/{doc_id}/download
Header: Authorization: Bearer <token>
ResponseType: blob
    ↓
[Berhasil] → buat ObjectURL sementara → trigger download file
           → revoke URL setelah 5 detik
```

---

### 7. Profil Vendor

File: [`profile.page.ts`](src/app/pages/profile/profile.page.ts)

```
ionViewWillEnter()
    ├── GET /api/vendors/me       → tampilkan profil lengkap
    └── GET /api/vendors/documents → hitung total dokumen
```

**Edit Profil:**
```
enterEditMode() → isi editForm dari data profil saat ini
    ↓
User ubah: name, company_name, phone, address
    ↓
onSave()
    ↓
PUT /api/vendors/me
    ↓
[Berhasil] → keluar edit mode → refresh profil
[Gagal]    → tampilkan error validasi
```

**Status Verifikasi:**

| Status | Badge | Warna |
|--------|-------|-------|
| `approved` | ✓ Terverifikasi | Hijau (success) |
| `rejected` | ✗ Ditolak | Merah (danger) |
| `pending` | ⏳ Menunggu Verifikasi | Kuning (warning) |

---

## 🔄 State Machine Tender

Tender mengikuti alur status berikut (dikelola di sisi backend):

```
draft → open → aanwijzing → bidding → closed → finished
```

| Status | Deskripsi | Aksi Vendor |
|--------|-----------|-------------|
| `draft` | Belum dipublikasi | ❌ Tidak ditampilkan ke vendor |
| `open` | Tender terbuka | ✅ Bisa join sebagai peserta |
| `aanwijzing` | Masa penjelasan | ✅ Bisa join, lihat pengumuman |
| `bidding` | Masa penawaran | ✅ Bisa submit/update bid |
| `closed` | Bidding selesai | 🔍 Lihat hasil (menunggu keputusan) |
| `finished` | Pemenang ditetapkan | 🏆 Lihat hasil final |

---

## 🔒 Sistem Keamanan & Token

### JWT Token Flow

```
Login/Register
    ↓
Token (JWT) disimpan di Capacitor Preferences (key: 'auth_token')
    ↓
Setiap HTTP request → AuthInterceptor menambahkan:
    Authorization: Bearer <jwt_token>
    ↓
Jika response 401 (expired):
    ↓
POST /api/auth/refresh (via HttpBackend — bypass interceptor)
    ↓
[Berhasil] → token baru disimpan → retry request original
[Gagal]    → clearAll() → redirect /login → toast "Sesi berakhir"
```

### Concurrent Request Queue

Jika beberapa request gagal dengan 401 secara bersamaan saat proses refresh token berlangsung, sistem menggunakan **BehaviorSubject** sebagai queue:

```
Request A (401) → mulai refresh
Request B (401) → masuk queue (menunggu refreshSubject)
Request C (401) → masuk queue (menunggu refreshSubject)
    ↓
Refresh selesai → emit token baru ke refreshSubject
    ↓
Request B & C → retry dengan token baru secara otomatis
```

---

## 📦 Model Data

### Interface Utama

```typescript
// Wrapper standar semua response API
ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: any;
}

// Data login/register
AuthData {
  token: string;
  token_type: 'bearer';
  expires_in: number;  // detik (biasanya 3600)
  user: { id, name, email, role }
}

// Profil vendor lengkap
VendorProfile {
  id: number;           // vendor.id
  company_name: string;
  phone: string;
  address: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes: string | null;
  user: { id, name, email }
}

// Tender
Tender {
  id, title, description, specification,
  status: TenderStatus,
  start_date, end_date,
  aanwijzing_date, bidding_start, bidding_end,
  is_participant: boolean,  // langsung dari TenderResource
  joined_at: string | null
}

// Penawaran (Bid)
Bid {
  id: number;
  ulid: string;       // sortable tie-breaker
  tender_id: number;
  bid_amount: number;
  notes: string | null;
  submitted_at: string;  // ISO8601 dengan microsecond
  updated_at: string;
}

// Dokumen vendor
VendorDocument {
  id: number;
  document_type: 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';
  file_name: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

// Pemenang tender
Winner {
  winner_company: string;
  winning_bid_amount: number;
  selection_method: string;
  decided_at: string;
  is_winner: boolean;     // apakah vendor yang login adalah pemenang
  my_bid_amount: number;
}

// Hasil vendor (dari /vendors/results)
VendorResult {
  tender_id, tender_title, tender_status,
  is_winner: boolean,
  my_bid_amount, winner_company, winning_bid_amount,
  decided_at
}
```

---

## 🌐 Daftar API Endpoint

### Autentikasi (Public)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login vendor |
| POST | `/api/auth/register` | Registrasi vendor baru |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Data user yang sedang login |
| PUT | `/api/auth/change-password` | Ganti password |
| POST | `/api/auth/forgot-password` | Kirim email reset password |
| POST | `/api/auth/reset-password` | Reset password dengan token |

### Tender (Sebagian Public, Sebagian Protected 🔒)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/tenders` | — | Daftar semua tender (filter: status, search) |
| GET | `/api/tenders/{id}` | — | Detail tender + `is_participant` |
| POST | `/api/tenders/{id}/participants` | 🔒 | Join tender sebagai peserta |
| GET | `/api/tenders/{id}/participants/check` | 🔒 | Cek status partisipasi |
| GET | `/api/tenders/{id}/announcements` | 🔒 | Pengumuman tender (butuh join) |
| GET | `/api/tenders/{id}/bids/me` | 🔒 | Bid saya di tender ini |
| POST | `/api/tenders/{id}/bids` | 🔒 | Submit penawaran baru |
| PUT | `/api/tenders/{id}/bids/{bidId}` | 🔒 | Update penawaran |
| GET | `/api/tenders/{id}/result` | 🔒 | Hasil tender |
| GET | `/api/tenders/{id}/winner` | 🔒 | Pemenang tender + status saya |

### Vendor (Protected 🔒)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/vendors/me` | Profil vendor saya |
| PUT | `/api/vendors/me` | Update profil vendor |
| GET | `/api/vendors/status` | Status verifikasi vendor |
| GET | `/api/vendors/documents` | Daftar dokumen saya |
| POST | `/api/vendors/documents` | Upload dokumen (multipart) |
| GET | `/api/vendors/documents/{id}/download` | Download dokumen (binary blob) |
| GET | `/api/vendors/tenders` | Tender yang saya ikuti |
| GET | `/api/vendors/results` | Riwayat hasil tender saya |

---

## 🏆 Alur Penyeleksian Pemenang

Logika penyeleksian pemenang ditentukan **di backend**, namun frontend mengimplementasikan algoritma yang sama untuk konsistensi tampilan:

### Aturan 3-Level Tie-Breaker

```
1. bid_amount terendah → menang
   ↓ (jika sama)
2. submitted_at lebih awal → menang
   (parse dengan new Date() — toleran terhadap microsecond ISO8601)
   ↓ (jika masih sama — sangat jarang)
3. ULID lebih kecil → menang
   (ULID bersifat sortable: dibuat lebih awal = value lebih kecil)
```

**Format `submitted_at`** (sejak 26 Mei 2026):
- ISO8601 dengan presisi microsecond: `"2026-05-26T10:00:00.123456+07:00"`
- **Selalu parse dengan `new Date()`** — jangan gunakan format string kustom

```typescript
// TenderService.sortBidsForWinner()
sortBidsForWinner(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => {
    if (a.bid_amount !== b.bid_amount)
      return a.bid_amount - b.bid_amount;          // Level 1: harga terendah
    const tA = new Date(a.submitted_at).getTime();
    const tB = new Date(b.submitted_at).getTime();
    if (tA !== tB) return tA - tB;                // Level 2: waktu lebih awal
    return a.ulid.localeCompare(b.ulid);           // Level 3: ULID lebih kecil
  });
}
```

---

## 🔄 Diagram Alur Pengguna (User Journey)

```
┌─────────────────────────────────────────────────────────────┐
│                     VENDOR BARU                             │
│  Buka App → /register → Isi form → Login otomatis → Home   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  VENDOR YANG SUDAH PUNYA AKUN               │
│  Buka App → /login → Isi email+pass → Home                  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   ALUR IKUT TENDER                           │
│                                                              │
│  Home → Tab Tender → Daftar Tender                          │
│      → Pilih Tender → Detail Tender                         │
│      → [Status: open/aanwijzing] → Join Tender              │
│      → [Status: bidding] → Form Penawaran                   │
│           → Submit Bid (atau Update jika sudah ada)          │
│      → [Status: closed/finished] → Lihat Hasil              │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   UPLOAD DOKUMEN                             │
│                                                              │
│  Tab Profil → Profil → "Dokumen Saya"                       │
│      → Tab Dokumen → Toggle Upload Form                      │
│      → Pilih Jenis + Pilih File → Upload                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📝 Catatan Penting Pengembangan

1. **Token refresh otomatis** — Tidak perlu menangani 401 secara manual di komponen; interceptor mengurusnya.

2. **`is_participant` dari TenderDetail** — Sejak pembaruan API, field `is_participant` sudah tersedia langsung di response `GET /api/tenders/{id}`, sehingga tidak perlu request tambahan ke `/participants/check`.

3. **Download dokumen selalu authenticated** — File tidak memiliki URL publik; selalu gunakan endpoint `/vendors/documents/{id}/download` dengan header Authorization.

4. **`submitted_at` format baru** — Gunakan `new Date()` untuk parsing, bukan format string kustom, karena nilai bisa mengandung microsecond.

5. **`status: 'success' | 'error'`** — Response backend menggunakan string `'success'` atau `'error'`, bukan boolean. Selalu cek dengan `res.status === 'success'`.

6. **Proxy development** — Saat dev (`ionic serve`), semua request ke `/api` diforward oleh `proxy.conf.json` ke `http://127.0.0.1:8080` untuk menghindari CORS error.

---

*Dokumen ini dibuat otomatis berdasarkan analisis source code project. Terakhir diperbarui: 30 Mei 2026.*
