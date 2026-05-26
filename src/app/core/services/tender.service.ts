import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  ApiResponse,
  Tender,
  Announcement,
  Bid,
  Winner,
  TenderResult,
  TenderStatus
} from '../models/user.model';

export interface SubmitBidPayload {
  bid_amount: number;
  notes?: string;
}

/** Participation check response */
export interface ParticipationCheck {
  is_participant: boolean;
  joined_at: string | null;
}

@Injectable({ providedIn: 'root' })
export class TenderService {

  constructor(private api: ApiService) {}

  // GET /api/tenders  — PUBLIC (tidak perlu token)
  getTenders(params?: { status?: TenderStatus; search?: string }): Observable<ApiResponse<Tender[]>> {
    let endpoint = 'tenders';
    if (params) {
      const query: string[] = [];
      if (params.status) query.push(`status=${params.status}`);
      if (params.search) query.push(`search=${encodeURIComponent(params.search)}`);
      if (query.length) endpoint += '?' + query.join('&');
    }
    return this.api.get<Tender[]>(endpoint);
  }

  // GET /api/tenders/{tender}  — PUBLIC (tidak perlu token)
  // Response menyertakan is_participant (false jika guest)
  getTenderDetail(id: number): Observable<ApiResponse<Tender>> {
    return this.api.get<Tender>(`tenders/${id}`);
  }

  // POST /api/tenders/{tender}/participants  — 🔒 Protected
  joinTender(tenderId: number): Observable<ApiResponse<any>> {
    return this.api.post<any>(`tenders/${tenderId}/participants`, {});
  }

  // GET /api/tenders/{tender}/participants/check  — 🔒 Protected
  // Menggantikan workaround lama via bids/me
  checkParticipation(tenderId: number): Observable<boolean> {
    return this.api.get<ParticipationCheck>(`tenders/${tenderId}/participants/check`).pipe(
      map(res => {
        if (res.status === 'success' && res.data) {
          return res.data.is_participant;
        }
        return false;
      }),
      catchError(err => {
        // 403 → bukan peserta; 404 → tidak ditemukan → anggap false
        if (err?.status === 403 || err?.status === 404) {
          return of(false);
        }
        // Error lain (network, 500) → anggap false, jangan crash
        return of(false);
      })
    );
  }

  // GET /api/tenders/{tender}/announcements  — 🔒 Protected
  getAnnouncements(tenderId: number): Observable<ApiResponse<Announcement[]>> {
    return this.api.get<Announcement[]>(`tenders/${tenderId}/announcements`);
  }

  // GET /api/tenders/{tender}/bids/me  — 🔒 Protected (HARUS sebelum POST bids)
  getMyBid(tenderId: number): Observable<ApiResponse<Bid>> {
    return this.api.get<Bid>(`tenders/${tenderId}/bids/me`);
  }

  // POST /api/tenders/{tender}/bids  — 🔒 Protected
  submitBid(tenderId: number, payload: SubmitBidPayload): Observable<ApiResponse<Bid>> {
    return this.api.post<Bid>(`tenders/${tenderId}/bids`, payload);
  }

  // PUT /api/tenders/{tender}/bids/{bid}  — 🔒 Protected
  updateBid(tenderId: number, bidId: number, payload: SubmitBidPayload): Observable<ApiResponse<Bid>> {
    return this.api.put<Bid>(`tenders/${tenderId}/bids/${bidId}`, payload);
  }

  // GET /api/tenders/{tender}/result  — 🔒 Protected
  getTenderResult(tenderId: number): Observable<ApiResponse<TenderResult>> {
    return this.api.get<TenderResult>(`tenders/${tenderId}/result`);
  }

  // GET /api/tenders/{tender}/winner  — 🔒 Protected
  getWinner(tenderId: number): Observable<ApiResponse<Winner>> {
    return this.api.get<Winner>(`tenders/${tenderId}/winner`);
  }

  // ─── Utility: sort bid untuk tampilkan pemenang (konsisten dengan backend) ───

  /**
   * Urutkan daftar bid sesuai logika 3-level tie-breaker backend:
   *  1. bid_amount terendah menang
   *  2. submitted_at lebih awal menang (microsecond precision via new Date())
   *  3. ulid lebih kecil menang (sortable string comparison)
   *
   * Pemenang = bids[0] setelah sort.
   */
  sortBidsForWinner(bids: Bid[]): Bid[] {
    return [...bids].sort((a, b) => {
      // Level 1: harga terendah
      if (a.bid_amount !== b.bid_amount) {
        return a.bid_amount - b.bid_amount;
      }
      // Level 2: waktu submit lebih awal (new Date() handle microsecond)
      const tA = new Date(a.submitted_at).getTime();
      const tB = new Date(b.submitted_at).getTime();
      if (tA !== tB) return tA - tB;
      // Level 3: ULID lebih kecil (sortable — dibuat sebelumnya = lebih kecil)
      return a.ulid.localeCompare(b.ulid);
    });
  }

  /**
   * Format waktu bid untuk tampilan ke user.
   * Menggunakan new Date() agar toleran terhadap microsecond (ISO8601 baru).
   */
  formatBidTime(submittedAt: string): string {
    const date = new Date(submittedAt);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}
