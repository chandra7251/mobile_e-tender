# 📡 API Reference — E-Procurement Vendor Mobile App
**Source:** `c:\project-laravel\lelang-2.0\routes\api.php` (VERIFIED ✅)
**Base URL:** `http://127.0.0.1:8080/api`
**Auth:** `Authorization: Bearer {token}` (hanya endpoint 🔒)
**Response Format:**
```json
{ "status": true, "message": "...", "data": { ... } }
```

---

## 🔑 1. Authentication — Public

### POST `/api/auth/register`
```json
// Request Body
{
  "name": "Budi Santoso",
  "email": "budi@vendor.com",
  "password": "password",
  "password_confirmation": "password",
  "company_name": "PT Maju Jaya",
  "phone": "081234567890",
  "address": "Jl. Contoh No. 1, Jakarta"
}
// Response 201
{
  "status": true,
  "message": "Registration successful",
  "data": { "user": { ... }, "token": "1|xxx" }
}
```

### POST `/api/auth/login`
```json
// Request Body
{ "email": "budi@vendor.com", "password": "password" }
// Response 200
{
  "status": true,
  "message": "Login successful",
  "data": { "user": { "id": 1, "name": "...", "role": "vendor" }, "token": "1|xxx" }
}
```

### POST `/api/auth/forgot-password`
```json
// Request Body
{ "email": "budi@vendor.com" }
```

### POST `/api/auth/reset-password`
```json
// Request Body
{ "token": "xxx", "email": "budi@vendor.com", "password": "new", "password_confirmation": "new" }
```

---

## 🔒 2. Authentication — Protected

### POST `/api/auth/logout`
```
Header: Authorization: Bearer {token}
Response: { "status": true, "message": "Logged out successfully", "data": null }
```

### GET `/api/auth/me`
```json
// Response
{ "status": true, "message": "...", "data": { "id": 1, "name": "...", "email": "...", "role": "vendor" } }
```

### PUT `/api/auth/change-password`
```json
// Request Body
{ "current_password": "old", "new_password": "new", "new_password_confirmation": "new" }
```

---

## 👤 3. Vendor Profile — 🔒 Protected

### GET `/api/vendors/me`
Ambil profil vendor lengkap.
```json
// Response
{
  "status": true,
  "data": {
    "id": 1, "name": "Budi", "email": "budi@vendor.com", "role": "vendor",
    "vendor": {
      "id": 1, "company_name": "PT Maju Jaya",
      "phone": "081234567890", "address": "Jl. Contoh No.1",
      "status": "approved", "verification_notes": null
    }
  }
}
```

### PUT `/api/vendors/me`
Update profil vendor.
```json
// Request Body
{ "name": "Budi Santoso", "company_name": "PT Baru", "phone": "08xxx", "address": "Jl. Baru" }
```

### GET `/api/vendors/status`
Cek status verifikasi.
```json
// Response
{ "status": true, "data": { "status": "approved", "verification_notes": null } }
```

---

## 📄 4. Vendor Documents — 🔒 Protected

### GET `/api/vendors/documents`
List semua dokumen.
```json
// Response
{
  "status": true,
  "data": [
    { "id": 1, "type": "legalitas", "file_path": "...", "status": "approved", "uploaded_at": "..." }
  ]
}
```

### POST `/api/vendors/documents`
Upload dokumen (multipart/form-data).
```
Content-Type: multipart/form-data
Fields:
  type:  legalitas | izin_usaha | sertifikasi
  file:  [binary file]
```

---

## 🛒 5. Tenders — PUBLIC (tanpa token)

### GET `/api/tenders`
```
Query Params (opsional): ?status=open&search=pengadaan
```

### GET `/api/tenders/{tender}`
Detail tender berdasarkan ID.

---

## ✋ 6. Tender Participation — 🔒 Protected

### POST `/api/tenders/{tender}/participants`
Daftar sebagai peserta tender.
```
Body: {} (kosong)
```

---

## 📢 7. Aanwijzing / Announcements — 🔒 Protected

### GET `/api/tenders/{tender}/announcements`
List pengumuman dari admin.

---

## 💰 8. Bidding — 🔒 Protected

### GET `/api/tenders/{tender}/bids/me`
Lihat penawaran saya. *(Harus dipanggil sebelum POST bids)*

### POST `/api/tenders/{tender}/bids`
Submit penawaran baru.
```json
{ "price": 45000000, "notes": "Termasuk pengiriman" }
```

### PUT `/api/tenders/{tender}/bids/{bid}`
Update penawaran.
```json
{ "price": 43000000, "notes": "Revisi harga" }
```

---

## 🏆 9. Results — 🔒 Protected

### GET `/api/tenders/{tender}/result`
Hasil tender (menang/kalah).

### GET `/api/tenders/{tender}/winner`
Info pemenang tender.

---

## 🗺️ Summary — Semua Endpoint Vendor (VERIFIED dari api.php)

| # | 🔒 | Method | Endpoint |
|---|---|--------|----------|
| 1 | 🌐 | POST | `/api/auth/register` |
| 2 | 🌐 | POST | `/api/auth/login` |
| 3 | 🌐 | POST | `/api/auth/forgot-password` |
| 4 | 🌐 | POST | `/api/auth/reset-password` |
| 5 | 🌐 | GET | `/api/tenders` |
| 6 | 🌐 | GET | `/api/tenders/{tender}` |
| 7 | 🔒 | POST | `/api/auth/logout` |
| 8 | 🔒 | GET | `/api/auth/me` |
| 9 | 🔒 | PUT | `/api/auth/change-password` |
| 10 | 🔒 | GET | `/api/vendors/me` |
| 11 | 🔒 | PUT | `/api/vendors/me` |
| 12 | 🔒 | GET | `/api/vendors/status` |
| 13 | 🔒 | GET | `/api/vendors/documents` |
| 14 | 🔒 | POST | `/api/vendors/documents` |
| 15 | 🔒 | POST | `/api/tenders/{tender}/participants` |
| 16 | 🔒 | GET | `/api/tenders/{tender}/announcements` |
| 17 | 🔒 | GET | `/api/tenders/{tender}/bids/me` |
| 18 | 🔒 | POST | `/api/tenders/{tender}/bids` |
| 19 | 🔒 | PUT | `/api/tenders/{tender}/bids/{bid}` |
| 20 | 🔒 | GET | `/api/tenders/{tender}/result` |
| 21 | 🔒 | GET | `/api/tenders/{tender}/winner` |

🌐 = Public (tanpa token) | 🔒 = Butuh Bearer token
