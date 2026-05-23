# Backend API — Changelog & Update Notes

> **Untuk:** Tim Mobile Developer  
> **Versi:** Backend v2.0 (refactor)  
> **Tanggal:** 21 Mei 2026

---

## 🔐 1. Auth: Pindah ke JWT

Sistem auth sebelumnya pakai `remember_token` yang disimpan di database. Sekarang **sudah diganti ke JWT (JSON Web Token)**.

### Yang berubah di sisi mobile:

| Sebelum | Sesudah |
|---------|---------|
| Token = string random dari DB | Token = JWT string (`eyJ...`) |
| Token tidak expire | Token expire setelah **60 menit** |
| Tidak ada refresh | Token bisa di-refresh (lihat endpoint baru) |

### Header Authorization (tidak berubah):
```
Authorization: Bearer <token>
```

---

## 📋 2. Daftar Endpoint (Lengkap)

### Public — Tidak perlu token

| Method | URL | Keterangan |
|--------|-----|-----------|
| `POST` | `/api/auth/register` | Daftar akun vendor baru |
| `POST` | `/api/auth/login` | Login, dapat JWT token |
| `POST` | `/api/auth/forgot-password` | Kirim link reset password |
| `POST` | `/api/auth/reset-password` | Reset password dengan token email |
| `GET` | `/api/tenders` | Daftar tender (status: open/aanwijzing/bidding) |
| `GET` | `/api/tenders/{id}` | Detail tender |

---

### Protected — Butuh `Authorization: Bearer <token>`

#### Auth
| Method | URL | Keterangan |
|--------|-----|-----------|
| `POST` | `/api/auth/logout` | Logout, token langsung tidak valid |
| `GET` | `/api/auth/me` | Data user yang sedang login |
| `PUT` | `/api/auth/change-password` | Ganti password |

#### Vendor Profile (semua status vendor bisa akses)
| Method | URL | Keterangan |
|--------|-----|-----------|
| `GET` | `/api/vendors/me` | Lihat profil vendor |
| `PUT` | `/api/vendors/me` | Update profil vendor |
| `GET` | `/api/vendors/status` | Cek status verifikasi |

#### Vendor Dokumen (semua status vendor bisa akses)
| Method | URL | Keterangan |
|--------|-----|-----------|
| `GET` | `/api/vendors/documents` | Daftar dokumen yang sudah diupload |
| `POST` | `/api/vendors/documents` | Upload dokumen baru |

#### Tender — Lihat (semua status vendor bisa akses)
| Method | URL | Keterangan |
|--------|-----|-----------|
| `GET` | `/api/tenders/{id}/announcements` | Pengumuman tender |
| `GET` | `/api/tenders/{id}/result` | Hasil tender |
| `GET` | `/api/tenders/{id}/winner` | Pemenang tender |

---

### 🔒 Protected + Vendor APPROVED — Butuh token DAN status `approved`

> Jika vendor belum approved, akan dapat response `403 Forbidden`.

| Method | URL | Keterangan |
|--------|-----|-----------|
| `POST` | `/api/tenders/{id}/participants` | Daftar ikut tender |
| `GET` | `/api/tenders/{id}/bids/me` | Lihat penawaran saya |
| `POST` | `/api/tenders/{id}/bids` | Kirim penawaran harga |
| `PUT` | `/api/tenders/{id}/bids/{bidId}` | Update penawaran harga |

---

## 📦 3. Format Response Auth (Login & Register)

### Login — `POST /api/auth/login`
**Request body:**
```json
{
  "email": "vendor.approved@example.com",
  "password": "password"
}
```

**Response sukses (200):**
```json
{
  "status": "success",
  "message": "Login berhasil.",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 2,
      "name": "Vendor Approved",
      "email": "vendor.approved@example.com",
      "role": "vendor"
    }
  }
}
```

**Response gagal (401):**
```json
{
  "status": "error",
  "message": "Email atau password salah."
}
```

---

### Register — `POST /api/auth/register`
**Request body:**
```json
{
  "name": "Nama PIC",
  "email": "vendor@email.com",
  "password": "password",
  "password_confirmation": "password",
  "company_name": "PT Nama Perusahaan",
  "phone": "08123456789",
  "address": "Jl. Contoh No. 1, Kota"
}
```

**Response sukses (201):**
```json
{
  "status": "success",
  "message": "Registrasi berhasil. Akun Anda menunggu verifikasi admin.",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": { ... }
  }
}
```

---

### Me — `GET /api/auth/me`
**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "Vendor Approved",
    "email": "vendor.approved@example.com",
    "role": "vendor",
    "vendor": {
      "id": 1,
      "company_name": "PT Approved Maju",
      "phone": "081200000002",
      "address": "Jl. Maju No. 2, Bandung",
      "verification_status": "approved",
      "verified_at": "2026-05-16T..."
    }
  }
}
```

---

## ⚠️ 4. Error Khusus yang Perlu Ditangani Mobile

### Token Expired (401)
```json
{
  "message": "Token has expired"
}
```
→ Redirect user ke halaman login.

### Vendor Belum Approved (403)
```json
{
  "status": "error",
  "message": "Akun Anda belum diverifikasi. Silakan tunggu persetujuan dari admin.",
  "data": {
    "verification_status": "pending"
  }
}
```
→ Tampilkan pesan "menunggu verifikasi", jangan tampilkan fitur join/bid.

### Vendor Ditolak (403)
```json
{
  "status": "error",
  "message": "Akun Anda belum diverifikasi. Silakan tunggu persetujuan dari admin.",
  "data": {
    "verification_status": "rejected"
  }
}
```
→ Tampilkan pesan "akun ditolak" beserta alasan (bisa diambil dari `GET /api/vendors/status`).

---

## 🧪 5. Akun Demo untuk Testing

| Email | Password | Status | Keterangan |
|-------|----------|--------|-----------|
| `admin@example.com` | `password` | — | Admin (web only) |
| `vendor.approved@example.com` | `password` | `approved` | PT Approved Maju — bisa join & bid |
| `vendor.kedua@example.com` | `password` | `approved` | CV Karya Prima — bisa join & bid |
| `vendor.pending@example.com` | `password` | `pending` | PT Pending Jaya — TIDAK bisa join & bid |
| `vendor.rejected@example.com` | `password` | `rejected` | PT Ditolak Jaya — TIDAK bisa join & bid |

---

## 🔄 6. Alur Status Verifikasi Vendor

```
register → [pending] → admin review → [approved] ✅ (bisa akses semua fitur)
                                   → [rejected] ❌ (tampilkan alasan penolakan)
```

Vendor yang `rejected` bisa mengupload ulang dokumen, tapi tidak otomatis re-pending — perlu konfirmasi lebih lanjut.

---

## 🔄 7. State Machine Tender (Urutan Status)

```
draft → open → aanwijzing → bidding → closed → finished
```

- **`open`** → vendor bisa daftar peserta
- **`bidding`** → vendor bisa submit penawaran harga  
- **`closed`** → tender selesai masa bidding, menunggu penetapan pemenang
- **`finished`** → pemenang sudah ditetapkan, result tersedia

> **Catatan:** Status tidak bisa mundur. Vendor hanya bisa join saat `open`, bid saat `bidding`.

---

## 🐛 8. Bug yang Sudah Diperbaiki

| Bug | Status |
|-----|--------|
| Field `name` (nama PIC) tidak tersimpan saat update profil via `PUT /api/vendors/me` | ✅ Fixed |
| Tender yang masa bidding-nya sudah lewat tidak otomatis `closed` | ✅ Fixed — sekarang ada cron job setiap 5 menit |
