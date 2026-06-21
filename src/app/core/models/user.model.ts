
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
  status: 'success' | 'error';
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
