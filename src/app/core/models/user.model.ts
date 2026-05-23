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
 * Vendor entity — backend v2.0
 * Field `verification_status` menggantikan `status` (backend v1).
 * Field `verified_at` ditambahkan untuk mencatat waktu persetujuan.
 */
export interface Vendor {
  id: number;
  user_id: number;
  company_name: string;
  phone: string;
  address: string;
  /** Status verifikasi vendor (ganti dari `status` di backend v1) */
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes: string | null;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Response dari GET /api/vendors/me dan GET /api/auth/me (nested vendor).
 */
export interface VendorProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  vendor: Vendor;
}

/**
 * AuthData — backend v2.0 (JWT)
 * Tambah `token_type` dan `expires_in` (3600 detik = 60 menit).
 */
export interface AuthData {
  user: User;
  token: string;
  token_type: string;   // 'bearer'
  expires_in: number;   // detik, biasanya 3600
}

// ─── Documents ─────────────────────────────────────────────────────────────

export type DocumentType = 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface VendorDocument {
  id: number;
  vendor_id: number;
  type: DocumentType;
  file_path: string;
  status: DocumentStatus;
  uploaded_at: string;
  created_at?: string;
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
  budget: number;
  status: TenderStatus;
  requirements?: string;
  start_date: string;
  end_date: string;
  aanwijzing_date?: string | null;
  bidding_start?: string | null;
  bidding_end?: string | null;
  created_at?: string;
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

// ─── Bidding ───────────────────────────────────────────────────────────────

export interface Bid {
  id: number;
  tender_id: number;
  vendor_id?: number;
  price: number;
  notes?: string;
  submitted_at: string;
}

// ─── Winner & Result ───────────────────────────────────────────────────────

export interface Winner {
  vendor_id: number;
  company_name: string;
  bid_price: number;
  winning_bid_amount?: number;   // alias backend mungkin pakai ini
  selection_method?: string;
  selected_at: string;
  notes?: string;
}

export interface TenderResult {
  tender_id: number;
  tender_title: string;
  result: 'won' | 'lost' | 'pending' | 'not_available';
  final_status?: string;
  winner: Winner | null;
  my_bid: { price: number; notes?: string } | null;
}

// ─── Generic wrapper ───────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}
