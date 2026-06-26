
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface VendorProfile {
  id: number;                    
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
export interface AuthData {
  token: string;
  token_type: string;   
  expires_in: number;   
  user: {
    id: number;
    name: string;
    email: string;
    role: string;        
  };
}
export interface RefreshData {
  token: string;
  token_type: string;   
  expires_in: number;   
}
export type DocumentType = 'legalitas' | 'izin_usaha' | 'dokumen_pendukung';
export interface VendorDocument {
  id: number;
  document_type: DocumentType;  
  file_name: string;             
  mime_type?: string;
  file_size?: number;            
  uploaded_at: string;
}
export type TenderStatus = 'draft' | 'open' | 'aanwijzing' | 'bidding' | 'closed' | 'finished';
export interface Tender {
  id: number;
  title: string;
  description: string;
  specification?: string;   
  open_bidding_price?: number | null;  
  status: TenderStatus;
  start_date: string;
  end_date: string;
  aanwijzing_date?: string | null;
  bidding_start?: string | null;
  bidding_end?: string | null;
  created_at?: string;
  photo_url?: string | null;   
  photos?: string[];
  is_participant: boolean;   
  joined_at: string | null;  
}
export type VendorTender = Tender;
export interface VendorResult {
  tender_id: number;
  tender_title: string;
  tender_status: string;       
  is_winner: boolean;
  my_bid_amount: number;
  winner_company: string;
  winning_bid_amount: number;
  decided_at: string;
}
export interface Announcement {
  id: number;
  tender_id: number;
  title: string;
  content: string;
  published_at?: string | null;
  created_at: string;
}
export interface Bid {
  id: number;
  ulid: string;              
  tender_id: number;
  bid_amount: number;        
  notes?: string | null;
  technical_status?: string | null;
  technical_score?: number | null;
  price_score?: number | null;
  bid_items?: any[];
  submitted_at: string;      
  updated_at?: string;
}
export interface Winner {
  winner_company: string;         
  winning_bid_amount: number;     
  selection_method?: string;
  decided_at: string;             
  is_winner: boolean;             
  my_bid_amount?: number | null;  
}
export interface TenderResult {
  tender_id: number;
  winner_company?: string;       
  winning_bid_amount?: number;
  selection_method?: string;
  notes?: string;
  decided_at?: string;
}
export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  errors?: any;
}
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export interface VendorSubmissionPhoto {
  id: number;
  photo_url: string;
}
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
export interface SubmissionForm {
  nama_barang: string;
  deskripsi: string;
  spesifikasi?: string;
  kategori?: string;
  estimasi_harga?: number;
  catatan?: string;
}

export interface VendorRatingItem {
  tender_title: string | null;
  overall_score: number;
  quality_score: number;
  delivery_score: number;
  communication_score: number;
  compliance_score: number;
  review: string | null;
  rated_at: string;
}

export interface VendorRatingSummary {
  average_rating: number | null;
  total_ratings: number;
  is_blacklisted: boolean;
  blacklist_reason: string | null;
  ratings: VendorRatingItem[];
}

// ─── COMPLAINT / SANGGAHAN ───────────────────────────────────────────────────
export type ComplaintType   = 'sanggahan' | 'banding';
export type ComplaintStatus = 'pending' | 'accepted' | 'rejected';
export interface Complaint {
  id: number;
  tender_id: number;
  vendor_id: number;
  type: ComplaintType;
  reason: string;
  status: ComplaintStatus;
  response: string | null;
  responded_at: string | null;
  deadline: string | null;
  created_at: string;
  tender?: { id: number; title: string };
}

// ─── CONTRACT / KONTRAK ──────────────────────────────────────────────────────
export type ContractStatus =
  | 'draft' | 'sent_to_vendor' | 'signed_vendor' | 'signed_admin' | 'active' | 'completed' | 'terminated';

export interface ContractDelivery {
  id: number;
  contract_id: number;
  milestone_name: string;
  description: string | null;
  due_date: string | null;
  vendor_notes: string | null;
  evidence_path: string | null;
  delivered_at: string | null;
  verified_at: string | null;
  status: 'scheduled' | 'in_progress' | 'delivered' | 'verified' | 'overdue';
}

export interface Contract {
  id: number;
  contract_number: string;
  tender_id: number;
  vendor_id: number;
  status: ContractStatus;
  contract_value: number;
  start_date: string | null;
  end_date: string | null;
  terms: string | null;
  vendor_signed_at: string | null;
  admin_signed_at: string | null;
  document_hash: string | null;
  created_at: string;
  tender?: { id: number; title: string };
  deliveries?: ContractDelivery[];
}

export interface CatalogueCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  items_count?: number;
}

export interface CataloguePhoto {
  id: number;
  photo_path: string;
  is_primary: boolean;
  url: string;
}

export interface CatalogueItem {
  id: number;
  vendor_id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price_estimate: number | null;
  unit: string;
  specs: Record<string, string> | null;
  is_active: boolean;
  created_at: string;
  vendor?: VendorProfile;
  category?: CatalogueCategory;
  photos?: CataloguePhoto[];
}

export interface CatalogueListResponse {
  data: CatalogueItem[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
