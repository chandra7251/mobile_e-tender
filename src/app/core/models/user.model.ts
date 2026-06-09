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
 * Profile Vendor
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
 * Auth Data
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
 * Refresh Data
 */
export interface RefreshData {
  token: string;
  token_type: string;   // 'bearer'
  expires_in: number;   // detik, biasanya 3600
}

// ─── Documents ─────────────────────────────────────────────────────────────

export type DocumentType = 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';

/**
 * Vendor Document
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
 * Tender Status
 */
export type TenderStatus = 'draft' | 'open' | 'aanwijzing' | 'bidding' | 'closed' | 'finished';

export interface Tender {
  id: number;
  title: string;
  description: string;
  specification?: string;   // backend pakai 'specification' (bukan 'requirements')
  open_bidding_price?: number | null;  // HPS — Harga Pembukaan Bidding (nullable)
  status: TenderStatus;
  start_date: string;
  end_date: string;
  aanwijzing_date?: string | null;
  bidding_start?: string | null;
  bidding_end?: string | null;
  created_at?: string;
  photo_url?: string | null;   // URL foto barang/jasa (null jika belum ada foto)
  // ── Baru (Mobile_Integration.md — 26 Mei 2026) ──
  is_participant: boolean;   // tersedia langsung di TenderResource (guest = false)
  joined_at: string | null;  // null jika belum join
}

// ─── Vendor Tenders (GET /api/vendors/tenders) ─────────────────────────────

/** Vendor Tender Alias */
export type VendorTender = Tender;

// ─── Vendor Results (GET /api/vendors/results) ─────────────────────────────

/**
 * Vendor Result
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
 * Bid model
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
 * Winner model
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
 * Tender Result model
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
 * ApiResponse
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: any;
}

// ─── Vendor Submission ──────────────────────────────────────────────────────

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface VendorSubmissionPhoto {
  id: number;
  photo_url: string;
}

/**
 * Vendor Submission model
 */
export interface VendorSubmission {
  id: number;
  nama_barang: string;
  deskripsi: string;
  spesifikasi: string | null;
  kategori: string | null;
  estimasi_harga: number | null;
  catatan: string | null;
  status: SubmissionStatus;
  catatan_admin: string | null;
  reviewed_at: string | null;
  created_at: string;
  photos: VendorSubmissionPhoto[];
}

/**
 * Submission Form payload
 */
export interface SubmissionForm {
  nama_barang: string;
  deskripsi: string;
  spesifikasi?: string;
  kategori?: string;
  estimasi_harga?: number;
  catatan?: string;
}
