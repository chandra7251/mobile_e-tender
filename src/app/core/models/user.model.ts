// ─── User & Auth ───────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Struktur response dari GET /api/vendors/me, GET /api/auth/me,
 * POST /api/auth/login, POST /api/auth/register
 *
 * Backend mengembalikan VendorResource (flat) dengan nested user:
 * {
 *   id: vendor.id,
 *   company_name, phone, address,
 *   verification_status, verification_notes, verified_at,
 *   user: { id, name, email }
 * }
 */
export interface VendorProfile {
  id: number;                    // vendor.id
  company_name: string;
  phone: string;
  address: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes: string | null;
  verified_at?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * AuthData — backend v2.0 (JWT)
 * Response dari POST /api/auth/login dan POST /api/auth/register.
 *
 * Catatan: backend mengembalikan 'user' (bukan 'vendor') di dalam data.
 * VendorProfile yang lengkap di-fetch terpisah via GET /api/vendors/me.
 */
export interface AuthData {
  token: string;
  token_type: string;   // 'bearer'
  expires_in: number;   // detik, biasanya 3600
  user: {
    id: number;
    name: string;
    email: string;
    role: string;        // 'vendor'
  };
}

/**
 * RefreshData — response dari POST /api/auth/refresh
 */
export interface RefreshData {
  token: string;
  token_type: string;   // 'bearer'
  expires_in: number;   // detik, biasanya 3600
}

// ─── Documents ─────────────────────────────────────────────────────────────

export type DocumentType = 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';

/**
 * Response dari GET /api/vendors/documents dan POST /api/vendors/documents
 * Backend mengembalikan: id, document_type, file_name, mime_type, file_size, uploaded_at
 */
export interface VendorDocument {
  id: number;
  document_type: DocumentType;  // backend pakai 'document_type', bukan 'type'
  file_name: string;             // nama file asli
  mime_type?: string;
  file_size?: number;            // ukuran dalam bytes
  uploaded_at: string;
}

// ─── Tenders ───────────────────────────────────────────────────────────────

/**
 * State machine: draft → open → aanwijzing → bidding → closed → finished
 * - `draft`     : belum dipublikasi (filter di frontend, tidak ditampilkan)
 * - `open`      : vendor bisa daftar peserta
 * - `aanwijzing`: masa penjelasan tender
 * - `bidding`   : vendor bisa submit penawaran
 * - `closed`    : masa bidding selesai, menunggu penetapan pemenang
 * - `finished`  : pemenang sudah ditetapkan, result tersedia
 */
export type TenderStatus = 'draft' | 'open' | 'aanwijzing' | 'bidding' | 'closed' | 'finished';

export interface Tender {
  id: number;
  title: string;
  description: string;
  specification?: string;   // backend pakai 'specification' (bukan 'requirements')
  status: TenderStatus;
  start_date: string;
  end_date: string;
  aanwijzing_date?: string | null;
  bidding_start?: string | null;
  bidding_end?: string | null;
  created_at?: string;
  // ── Baru (Mobile_Integration.md — 26 Mei 2026) ──
  is_participant: boolean;   // tersedia langsung di TenderResource (guest = false)
  joined_at: string | null;  // null jika belum join
}

// ─── Vendor Tenders (GET /api/vendors/tenders) ─────────────────────────────

/** Alias — response /vendors/tenders menggunakan shape yang sama dengan Tender */
export type VendorTender = Tender;

// ─── Vendor Results (GET /api/vendors/results) ─────────────────────────────

/**
 * Response item dari GET /api/vendors/results
 * Menggantikan workaround filter tenders.status === 'finished'
 */
export interface VendorResult {
  tender_id: number;
  tender_title: string;
  tender_status: string;       // biasanya 'finished'
  is_winner: boolean;
  my_bid_amount: number;
  winner_company: string;
  winning_bid_amount: number;
  decided_at: string;
}

// ─── Announcements ─────────────────────────────────────────────────────────

export interface Announcement {
  id: number;
  tender_id: number;
  title: string;
  content: string;
  published_at?: string | null;
  created_at: string;
}

/**
 * Response dari GET/POST/PUT /api/tenders/{id}/bids
 * Backend BidResource: id, ulid, tender_id, bid_amount, notes, submitted_at, updated_at
 *
 * submitted_at format baru (setelah 26 Mei 2026): ISO8601 dengan microsecond
 * Contoh: "2026-05-26T10:00:00.123456+07:00"
 * → Selalu parse dengan new Date() — JANGAN gunakan format strict.
 */
export interface Bid {
  id: number;
  ulid: string;              // baru — sortable tie-breaker level 3
  tender_id: number;
  bid_amount: number;        // backend pakai 'bid_amount', bukan 'price'
  notes?: string | null;
  submitted_at: string;      // ISO8601, bisa ada microsecond (.123456)
  updated_at?: string;
}

// ─── Winner & Result ───────────────────────────────────────────────────────

/**
 * Response dari GET /api/tenders/{id}/winner
 * Backend: winner_company, winning_bid_amount, selection_method, decided_at, is_winner, my_bid_amount
 */
export interface Winner {
  winner_company: string;         // nama perusahaan pemenang
  winning_bid_amount: number;     // nilai bid pemenang
  selection_method?: string;
  decided_at: string;             // backend pakai 'decided_at' (bukan 'selected_at')
  is_winner: boolean;             // apakah vendor yang login adalah pemenang
  my_bid_amount?: number | null;  // nilai bid vendor yang login
}

/**
 * Response dari GET /api/tenders/{id}/result
 * Backend TenderResultResource: tender_id, winner_company, winning_bid_amount,
 *   selection_method, notes, decided_at
 */
export interface TenderResult {
  tender_id: number;
  winner_company?: string;       // nama pemenang (string langsung, bukan object)
  winning_bid_amount?: number;
  selection_method?: string;
  notes?: string;
  decided_at?: string;
}

// ─── Generic wrapper ───────────────────────────────────────────────────────

/**
 * ApiResponse — wrapper standar backend v2.0
 *
 * Backend selalu mengembalikan:
 *   "status": "success"  → request berhasil
 *   "status": "error"    → request gagal
 *
 * BUKAN boolean. Gunakan: if (res.status === 'success' && res.data) { ... }
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: any;
}
