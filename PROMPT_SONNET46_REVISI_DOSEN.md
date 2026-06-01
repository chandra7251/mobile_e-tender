# PROMPT — CLAUDE SONNET 4.6
## Implementasi Revisi Dosen: E-Procurement Tender & Bidding System

---

Kamu adalah senior mobile developer yang ahli di Ionic + Angular (NgModules architecture), Laravel REST API, dan Capacitor.

Aku sedang mengerjakan final project **E-Procurement Tender & Bidding System** dan ada beberapa revisi dari dosen yang harus diimplementasikan. Bantu aku satu per satu.

---

## KONTEKS PROJECT

**Tech stack:**
- Mobile: Ionic + Angular (NgModules, `standalone: false` WAJIB pada semua component/pipe/directive karena Angular 17+)
- Backend: Laravel (REST API)
- Web Admin: Laravel Blade
- Database: MySQL

**Penting tentang Angular:**
- Semua component, pipe, directive WAJIB `standalone: false`
- Jangan ganti `angular.json`
- Gunakan NgModules architecture (bukan standalone components)
- Setiap page punya `.module.ts` sendiri

---

## REVISI 1 — VENDOR APPROVED GUARD

Buatkan 2 guard untuk proteksi halaman pengajuan tender:

### 1. `AuthGuard`
Path: `src/app/guards/auth.guard.ts`

Logic:
- Ambil token dari `@capacitor/preferences` (key: `auth_token`)
- Jika tidak ada token → redirect ke `/login`
- Jika ada token → return true

### 2. `VendorApprovedGuard`
Path: `src/app/guards/vendor-approved.guard.ts`

Logic:
- Ambil data vendor dari `@capacitor/preferences` (key: `vendor_data`, format JSON)
- Parse JSON, cek field `status`
- Jika `status !== 'approved'` → tampilkan `ion-alert` dengan pesan "Akun Anda belum diverifikasi oleh admin. Silakan tunggu proses verifikasi." → redirect ke `/vendor/profile`
- Jika `status === 'approved'` → return true

Keduanya harus implement `CanActivate` dari `@angular/router`.
Daftarkan keduanya di `providers` di `AppModule`.

---

## REVISI 2 — HALAMAN PENGAJUAN TENDER

Buatkan page baru: `PengajuanTenderPage`

**Generate dengan:**
```
ionic generate page pages/pengajuan-tender
```

**Route:** `/vendor/pengajuan`
**Guard:** AuthGuard + VendorApprovedGuard (terapkan di `app-routing.module.ts`)

### Form fields:
- `nama_barang` (ion-input, required)
- `deskripsi` (ion-textarea, required)
- `spesifikasi` (ion-textarea, required)
- `kategori` (ion-select dengan pilihan: Elektronik, Furnitur, Kendaraan, Konstruksi, IT & Software, Lainnya)
- `estimasi_harga` (ion-input type=number, required)
- `catatan` (ion-textarea, opsional)
- Upload foto (tombol kamera + galeri, preview, maks 3 foto)

### Behavior:
- Validasi semua field required sebelum submit
- Loading indicator saat submit
- Success alert + redirect ke riwayat setelah submit berhasil
- Error handling dengan alert pesan error dari API

### API call:
```
POST /api/vendor/submissions
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- nama_barang
- deskripsi
- spesifikasi
- kategori
- estimasi_harga
- catatan
- photos[] (array file, opsional)
```

**Ingat:** component harus `standalone: false`, module harus dibuat dan didaftarkan.

---

## REVISI 3 — HALAMAN RIWAYAT PENGAJUAN

Buatkan page baru: `RiwayatPengajuanPage`

**Generate dengan:**
```
ionic generate page pages/riwayat-pengajuan
```

**Route:** `/vendor/pengajuan/riwayat`
**Guard:** AuthGuard + VendorApprovedGuard

### Tampilan:
- List card pengajuan
- Setiap card: nama barang, kategori, estimasi harga, tanggal pengajuan, status badge
- Status badge warna: pending=kuning, approved=hijau, rejected=merah
- Jika ada foto → tampilkan thumbnail foto pertama
- Pull-to-refresh

### API call:
```
GET /api/vendor/submissions
Authorization: Bearer {token}
```

---

## REVISI 4 — PHOTO SERVICE (CAPACITOR CAMERA)

Buatkan `PhotoService`:
Path: `src/app/services/photo.service.ts`

Install dulu:
```bash
npm install @capacitor/camera
npx cap sync
```

### Fungsi yang harus ada:

```typescript
// Pilih foto dari galeri (return base64 string)
async pickFromGallery(): Promise<string | null>

// Ambil foto dari kamera (return base64 string)
async takePhoto(): Promise<string | null>

// Convert base64 ke Blob untuk upload
base64ToBlob(base64: string, mimeType: string): Blob
```

Gunakan `Camera.getPhoto()` dari `@capacitor/camera`.
Format output: `CameraResultType.Base64`.
Quality: 70 (untuk kompresi otomatis).

---

## REVISI 5 — NETWORK SERVICE + OFFLINE MODE

Install dulu:
```bash
npm install @capacitor/network
npm install @capacitor/preferences
npx cap sync
```

### Buatkan `NetworkService`
Path: `src/app/services/network.service.ts`

```typescript
// Observable status koneksi (true=online, false=offline)
isOnline$: Observable<boolean>

// Cek status saat ini
async checkConnection(): Promise<boolean>

// Start listening perubahan network
startListening(): void
```

Gunakan `Network.addListener('networkStatusChange', ...)` dari `@capacitor/network`.

### Buatkan `OfflineCacheService`
Path: `src/app/services/offline-cache.service.ts`

Gunakan `Preferences` dari `@capacitor/preferences`.

```typescript
// Tender list cache
async cacheTenderList(data: any[]): Promise<void>
async getCachedTenderList(): Promise<any[] | null>

// Vendor profile cache
async cacheVendorProfile(data: any): Promise<void>
async getCachedVendorProfile(): Promise<any | null>

// Clear semua cache
async clearAllCache(): Promise<void>
```

### Offline Banner Component

Buatkan component kecil `OfflineBannerComponent`:
Path: `src/app/components/offline-banner/offline-banner.component.ts`

- `standalone: false` (WAJIB)
- Tampilkan banner merah di bagian atas dengan teks "⚠ Anda sedang offline — menampilkan data terakhir" ketika `NetworkService.isOnline$` emit false
- Sembunyikan saat online
- Daftarkan di `AppModule` atau `SharedModule`

---

## REVISI 6 — SPLASH SCREEN

Install:
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
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: false,
      backgroundColor: '#1a237e',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
```

### Di `AppComponent`
Path: `src/app/app.component.ts`

Tambahkan logic:
```typescript
// Setelah platform ready + auth check selesai
await SplashScreen.hide();
```

Pastikan `SplashScreen.hide()` dipanggil setelah semua inisialisasi selesai (cek token, load user data, dsb).

---

## REVISI 7 — BACKEND LARAVEL

### Migration: `vendor_submissions`

Buatkan migration dengan kolom:
- id (bigIncrements)
- vendor_id (foreignId → vendors)
- nama_barang (string 255)
- deskripsi (text)
- spesifikasi (text nullable)
- kategori (string 100 nullable)
- estimasi_harga (decimal 15,2 nullable)
- catatan (text nullable)
- status (enum: pending, approved, rejected — default: pending)
- catatan_admin (text nullable)
- reviewed_by (foreignId → users, nullable)
- reviewed_at (timestamp nullable)
- timestamps

### Migration: `vendor_submission_photos`

Kolom:
- id
- vendor_submission_id (foreignId → vendor_submissions, cascade delete)
- photo_path (string 500)
- photo_url (string 500)
- timestamps

### Model `VendorSubmission`

- fillable semua kolom kecuali id
- relationship: `vendor()`, `photos()`, `reviewer()`
- cast: `estimasi_harga` → decimal:2

### Model `VendorSubmissionPhoto`

- fillable: vendor_submission_id, photo_path, photo_url

### `VendorSubmissionController` (API)

Endpoint:
```
POST   /api/vendor/submissions          → store()
GET    /api/vendor/submissions          → index()
GET    /api/vendor/submissions/{id}     → show()
```

Middleware: `auth:sanctum` + cek `vendor.status === 'approved'` di store()

Method `store()`:
- Validasi semua field
- Simpan submission
- Handle upload foto: simpan ke `public/submission-photos/`, simpan URL ke tabel photos
- Return submission + photos

### `AdminSubmissionController` (API)

Endpoint:
```
GET    /api/admin/submissions           → index() — list semua dengan filter status
GET    /api/admin/submissions/{id}      → show()
PATCH  /api/admin/submissions/{id}/approve → approve()
PATCH  /api/admin/submissions/{id}/reject  → reject() — require catatan_admin
```

Middleware: `auth:sanctum` + cek role admin

### Route `api.php`

```php
// Vendor submission routes
Route::middleware('auth:sanctum')->prefix('vendor')->group(function () {
    Route::apiResource('submissions', VendorSubmissionController::class)
         ->only(['index', 'show', 'store']);
});

// Admin submission routes  
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('submissions', [AdminSubmissionController::class, 'index']);
    Route::get('submissions/{id}', [AdminSubmissionController::class, 'show']);
    Route::patch('submissions/{id}/approve', [AdminSubmissionController::class, 'approve']);
    Route::patch('submissions/{id}/reject', [AdminSubmissionController::class, 'reject']);
});
```

### Storage Config

Tambahkan di `config/filesystems.php` jika belum ada disk `public`, lalu jalankan:
```bash
php artisan storage:link
```

---

## VENDOR SUBMISSION SERVICE (MOBILE)

Buatkan `VendorSubmissionService`:
Path: `src/app/services/vendor-submission.service.ts`

```typescript
// Buat pengajuan baru (dengan foto sebagai base64 array)
async createSubmission(data: SubmissionForm, photos: string[]): Promise<any>

// Ambil riwayat pengajuan vendor
async getMySubmissions(): Promise<any[]>

// Ambil detail pengajuan
async getSubmissionDetail(id: number): Promise<any>
```

Gunakan `HttpClient` dari Angular.
Ambil base URL dari environment.
Tambahkan `Authorization: Bearer {token}` header.
Untuk upload foto: convert base64 ke Blob, append ke FormData.

---

## CATATAN PENTING

1. **SEMUA component, pipe, directive = `standalone: false`**
2. **Setiap page baru harus punya `.module.ts` dan didaftarkan di routing**
3. **Jangan replace `angular.json`**
4. **Guard didaftarkan sebagai `providedIn: 'root'` atau di `AppModule providers`**
5. **Gunakan `ion-loading`, `ion-alert`, `ion-toast` untuk UX feedback**
6. **Semua API call harus punya error handling (try-catch atau catchError)**
7. **Photo upload: gunakan FormData, bukan JSON**

---

## URUTAN PENGERJAAN YANG DISARANKAN

1. Backend: migration + model + controller + route
2. Mobile: install packages + `npx cap sync`
3. Mobile: buat guards
4. Mobile: buat services (Photo, Network, OfflineCache, VendorSubmission)
5. Mobile: buat pages (PengajuanTender, RiwayatPengajuan)
6. Mobile: daftarkan guard di routing
7. Mobile: tambah splash screen config
8. Mobile: tambah offline banner
9. Test end-to-end

---

Mulai dari mana yang kamu mau, sebutkan bagiannya dan aku akan bantu satu per satu.
