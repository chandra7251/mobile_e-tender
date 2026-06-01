# IMPLEMENTATION PLAN — REVISI DOSEN
## E-Procurement Tender & Bidding System

---

## RINGKASAN REVISI

| No | Revisi | Prioritas |
|----|--------|-----------|
| 1 | Fitur Pengajuan E-Tender oleh Vendor | HIGH |
| 2 | Route Guard (VendorApprovedGuard) | HIGH |
| 3 | Upload Foto Barang Tender | HIGH |
| 4 | Splash Screen | MEDIUM |
| 5 | Offline Mode | MEDIUM |

---

## REVISI 1 — FITUR PENGAJUAN E-TENDER (VENDOR SUBMISSION)

### Latar Belakang

Sebelumnya vendor hanya bisa **mengikuti** tender yang dibuat admin.
Revisi ini menambahkan kemampuan vendor untuk **mengajukan barang/jasa** yang ingin dilelang/ditenderkan.

### Alur Baru

```
Vendor (approved)
  → Buka halaman Pengajuan Tender
  → Isi form pengajuan (nama barang, deskripsi, spesifikasi, foto, harga estimasi)
  → Submit pengajuan
  → Status: pending

Admin
  → Melihat daftar pengajuan vendor
  → Review pengajuan
  → Approve / Reject pengajuan
  → (Opsional) Jadikan pengajuan sebagai dasar tender baru
```

### Halaman Baru di Mobile App (Ionic + Angular)

#### 1. `PengajuanTenderPage`
- Route: `/vendor/pengajuan`
- Guard: `AuthGuard` + `VendorApprovedGuard`
- Form fields:
  - Nama Barang / Jasa
  - Deskripsi
  - Spesifikasi teknis
  - Foto barang (min 1, maks 3)
  - Kategori
  - Estimasi Harga (Rp)
  - Catatan tambahan

#### 2. `RiwayatPengajuanPage`
- Route: `/vendor/pengajuan/riwayat`
- Guard: `AuthGuard` + `VendorApprovedGuard`
- Menampilkan daftar pengajuan vendor beserta statusnya
- Status badge: `pending` / `approved` / `rejected`

### Halaman Baru di Web Admin Dashboard (Laravel Blade)

#### 1. `vendor-submissions/index`
- Daftar semua pengajuan dari vendor
- Filter by status: pending / approved / rejected
- Tampil: nama vendor, nama barang, foto, tanggal pengajuan, status

#### 2. `vendor-submissions/show/{id}`
- Detail pengajuan
- Tombol: Approve / Reject
- Form catatan penolakan (jika reject)

---

## REVISI 2 — ROUTE GUARD (ANGULAR)

### Penjelasan

Guard di Angular adalah `CanActivate` — penjaga sebelum halaman bisa diakses.
Dosen menyarankan "pilih guard" artinya: **proteksi halaman pengajuan** sehingga hanya vendor berstatus `approved` yang bisa mengaksesnya.

### Guard yang Harus Dibuat

#### 1. `AuthGuard`
File: `src/app/guards/auth.guard.ts`

```typescript
// Cek: apakah user sudah login?
// Jika belum → redirect ke /login
```

Logic:
- Ambil token dari storage
- Jika tidak ada token → redirect `/login`
- Jika ada token → lanjutkan

#### 2. `VendorApprovedGuard`
File: `src/app/guards/vendor-approved.guard.ts`

```typescript
// Cek: apakah status vendor = 'approved'?
// Jika belum approved → redirect ke /vendor/profile dengan pesan alert
```

Logic:
- Ambil data vendor dari `VendorService` atau storage
- Cek `vendor.status === 'approved'`
- Jika bukan `approved` → tampilkan alert "Akun Anda belum diverifikasi" → redirect `/vendor/profile`
- Jika `approved` → lanjutkan ke halaman tujuan

### Penerapan di Routing

File: `src/app/app-routing.module.ts`

```typescript
{
  path: 'vendor/pengajuan',
  loadChildren: () => import('./pages/pengajuan-tender/pengajuan-tender.module')
    .then(m => m.PengajuanTenderPageModule),
  canActivate: [AuthGuard, VendorApprovedGuard]
},
{
  path: 'vendor/pengajuan/riwayat',
  loadChildren: () => import('./pages/riwayat-pengajuan/riwayat-pengajuan.module')
    .then(m => m.RiwayatPengajuanPageModule),
  canActivate: [AuthGuard, VendorApprovedGuard]
}
```

---

## REVISI 3 — UPLOAD FOTO BARANG TENDER

### Di Mobile App (Capacitor Camera)

Package: `@capacitor/camera`

```bash
npm install @capacitor/camera
npx cap sync
```

#### `PhotoService`
File: `src/app/services/photo.service.ts`

Fungsi:
- `pickFromGallery()` — pilih foto dari galeri
- `takePhoto()` — ambil foto dari kamera
- `compressImage(base64)` — kompres sebelum upload
- `uploadPhoto(base64, tenderId)` — kirim ke backend

#### Form Upload

Di `PengajuanTenderPage`:
- Tombol: "Ambil Foto" (kamera) dan "Pilih dari Galeri"
- Preview foto sebelum submit
- Maksimal 3 foto
- Format: JPEG, max 2MB per foto

### Di Backend Laravel

#### Migration: `vendor_submission_photos`

```
id
vendor_submission_id (FK)
photo_path
photo_url
created_at
updated_at
```

#### Endpoint Upload

```
POST /api/vendor/submissions/{id}/photos
Content-Type: multipart/form-data
Body: photo (file)
```

#### Storage

- Simpan di: `storage/app/public/submission-photos/`
- Akses via: `storage/submission-photos/{filename}`
- Jalankan: `php artisan storage:link`

---

## REVISI 4 — SPLASH SCREEN

### Package

```bash
npm install @capacitor/splash-screen
npx cap sync
```

### Konfigurasi `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eprocurement.app',
  appName: 'E-Procurement',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#1a237e',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
```

### Aset Splash Screen

- Android: `android/app/src/main/res/drawable/splash.png`
- Ukuran: 2732x2732px (center logo ±500x500px)
- Background: sesuai warna branding app

### Penggunaan di `AppComponent`

```typescript
import { SplashScreen } from '@capacitor/splash-screen';

// Di ngOnInit atau platform ready
await SplashScreen.hide();
```

---

## REVISI 5 — OFFLINE MODE

### Strategi Offline

Gunakan kombinasi:
- `@capacitor/network` — deteksi status koneksi
- `@capacitor/preferences` — cache data ringan (daftar tender, profil)
- SQLite (via `@capacitor-community/sqlite`) — cache data kompleks (riwayat bidding)

### Package

```bash
npm install @capacitor/network
npm install @capacitor/preferences
npx cap sync
```

### `NetworkService`
File: `src/app/services/network.service.ts`

Fungsi:
- `isOnline()` — cek status koneksi saat ini
- `watchNetwork()` — observable status koneksi (realtime)
- `getNetworkStatus()` — ambil status lengkap (WiFi/Cellular/None)

### `OfflineCacheService`
File: `src/app/services/offline-cache.service.ts`

Fungsi:
- `cacheTenderList(data)` — simpan daftar tender ke Preferences
- `getCachedTenderList()` — ambil tender dari cache
- `cacheVendorProfile(data)` — simpan profil vendor
- `getCachedVendorProfile()` — ambil profil dari cache
- `clearCache()` — hapus semua cache

### Behavior Offline

| Fitur | Online | Offline |
|-------|--------|---------|
| Lihat daftar tender | Fetch dari API + cache | Tampil dari cache |
| Detail tender | Fetch dari API + cache | Tampil dari cache |
| Bidding input | Normal | Tampilkan alert "Tidak ada koneksi" |
| Pengajuan tender | Normal | Tampilkan alert "Butuh koneksi internet" |
| Profil vendor | Fetch dari API + cache | Tampil dari cache |

### Tampilan Offline Banner

Di halaman utama: tampilkan banner merah "Anda sedang offline — menampilkan data terakhir" ketika tidak ada koneksi.

---

## PERUBAHAN DATABASE (BACKEND LARAVEL)

### Tabel Baru: `vendor_submissions`

```sql
CREATE TABLE vendor_submissions (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendor_id        BIGINT UNSIGNED NOT NULL,
  nama_barang      VARCHAR(255) NOT NULL,
  deskripsi        TEXT,
  spesifikasi      TEXT,
  kategori         VARCHAR(100),
  estimasi_harga   DECIMAL(15,2),
  catatan          TEXT,
  status           ENUM('pending','approved','rejected') DEFAULT 'pending',
  catatan_admin    TEXT,
  reviewed_by      BIGINT UNSIGNED NULL,
  reviewed_at      TIMESTAMP NULL,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

### Tabel Baru: `vendor_submission_photos`

```sql
CREATE TABLE vendor_submission_photos (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendor_submission_id  BIGINT UNSIGNED NOT NULL,
  photo_path            VARCHAR(500) NOT NULL,
  photo_url             VARCHAR(500) NOT NULL,
  created_at            TIMESTAMP,
  updated_at            TIMESTAMP,
  FOREIGN KEY (vendor_submission_id) REFERENCES vendor_submissions(id) ON DELETE CASCADE
);
```

---

## ENDPOINT API BARU (LARAVEL)

### Vendor Submission

| Method | Endpoint | Deskripsi | Guard |
|--------|----------|-----------|-------|
| POST | `/api/vendor/submissions` | Buat pengajuan baru | vendor approved |
| GET | `/api/vendor/submissions` | Riwayat pengajuan vendor | vendor login |
| GET | `/api/vendor/submissions/{id}` | Detail pengajuan | vendor login |
| POST | `/api/vendor/submissions/{id}/photos` | Upload foto | vendor approved |
| DELETE | `/api/vendor/submissions/{id}/photos/{photoId}` | Hapus foto | vendor login |

### Admin Submission Management

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/submissions` | Semua pengajuan |
| GET | `/api/admin/submissions/{id}` | Detail pengajuan |
| PATCH | `/api/admin/submissions/{id}/approve` | Approve pengajuan |
| PATCH | `/api/admin/submissions/{id}/reject` | Reject pengajuan |

---

## STRUKTUR FILE BARU (MOBILE APP)

```
src/app/
├── guards/
│   ├── auth.guard.ts               ← BARU
│   └── vendor-approved.guard.ts    ← BARU
├── services/
│   ├── photo.service.ts            ← BARU
│   ├── network.service.ts          ← BARU
│   ├── offline-cache.service.ts    ← BARU
│   └── vendor-submission.service.ts ← BARU
└── pages/
    ├── pengajuan-tender/           ← BARU
    │   ├── pengajuan-tender.page.ts
    │   ├── pengajuan-tender.page.html
    │   ├── pengajuan-tender.page.scss
    │   └── pengajuan-tender.module.ts
    └── riwayat-pengajuan/          ← BARU
        ├── riwayat-pengajuan.page.ts
        ├── riwayat-pengajuan.page.html
        ├── riwayat-pengajuan.page.scss
        └── riwayat-pengajuan.module.ts
```

---

## CHECKLIST IMPLEMENTASI

### Backend Laravel
- [ ] Buat migration `vendor_submissions`
- [ ] Buat migration `vendor_submission_photos`
- [ ] Buat Model `VendorSubmission`
- [ ] Buat Model `VendorSubmissionPhoto`
- [ ] Buat `VendorSubmissionController` (API)
- [ ] Buat `AdminSubmissionController` (API)
- [ ] Tambah route ke `api.php`
- [ ] Konfigurasi storage + `storage:link`
- [ ] Tambah seeder data dummy submission

### Web Admin Dashboard (Blade)
- [ ] Buat view `vendor-submissions/index.blade.php`
- [ ] Buat view `vendor-submissions/show.blade.php`
- [ ] Tambah menu navigasi "Pengajuan Vendor"
- [ ] Tambah route ke `web.php`

### Mobile App (Ionic + Angular)
- [ ] Install `@capacitor/camera`
- [ ] Install `@capacitor/network`
- [ ] Install `@capacitor/preferences`
- [ ] Install `@capacitor/splash-screen`
- [ ] Buat `AuthGuard`
- [ ] Buat `VendorApprovedGuard`
- [ ] Buat `PhotoService`
- [ ] Buat `NetworkService`
- [ ] Buat `OfflineCacheService`
- [ ] Buat `VendorSubmissionService`
- [ ] Buat `PengajuanTenderPage` (dengan form + foto)
- [ ] Buat `RiwayatPengajuanPage`
- [ ] Daftarkan guard di routing
- [ ] Konfigurasi splash screen di `capacitor.config.ts`
- [ ] Tambah aset splash screen
- [ ] Tambah offline banner ke halaman utama
- [ ] `npx cap sync`
