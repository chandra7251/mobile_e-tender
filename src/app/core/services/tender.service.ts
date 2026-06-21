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
export interface ParticipationCheck {
  is_participant: boolean;
  joined_at: string | null;
}
@Injectable({ providedIn: 'root' })
export class TenderService {
  constructor(private api: ApiService) {}
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
  getTenderDetail(id: number): Observable<ApiResponse<Tender>> {
    return this.api.get<Tender>(`tenders/${id}`);
  }
  joinTender(tenderId: number): Observable<ApiResponse<any>> {
    return this.api.post<any>(`tenders/${tenderId}/participants`, {});
  }
  checkParticipation(tenderId: number): Observable<boolean> {
    return this.api.get<ParticipationCheck>(`tenders/${tenderId}/participants/check`).pipe(
      map(res => {
        if (res.status === 'success' && res.data) {
          return res.data.is_participant;
        }
        return false;
      }),
      catchError(err => {
        if (err?.status === 403 || err?.status === 404) {
          return of(false);
        }
        return of(false);
      })
    );
  }
  getAnnouncements(tenderId: number): Observable<ApiResponse<Announcement[]>> {
    return this.api.get<Announcement[]>(`tenders/${tenderId}/announcements`);
  }
  getMyBid(tenderId: number): Observable<ApiResponse<Bid>> {
    return this.api.get<Bid>(`tenders/${tenderId}/penawaran/me`);
  }
  submitBid(tenderId: number, payload: SubmitBidPayload): Observable<ApiResponse<Bid>> {
    return this.api.post<Bid>(`tenders/${tenderId}/penawaran`, payload);
  }
  updateBid(tenderId: number, bidId: number, payload: SubmitBidPayload): Observable<ApiResponse<Bid>> {
    return this.api.put<Bid>(`tenders/${tenderId}/penawaran/${bidId}`, payload);
  }
  getTenderResult(tenderId: number): Observable<ApiResponse<TenderResult>> {
    return this.api.get<TenderResult>(`tenders/${tenderId}/result`);
  }
  getWinner(tenderId: number): Observable<ApiResponse<Winner>> {
    return this.api.get<Winner>(`tenders/${tenderId}/winner`);
  }
  sortBidsForWinner(bids: Bid[]): Bid[] {
    return [...bids].sort((a, b) => {
      if (a.bid_amount !== b.bid_amount) {
        return a.bid_amount - b.bid_amount;
      }
      const tA = new Date(a.submitted_at).getTime();
      const tB = new Date(b.submitted_at).getTime();
      if (tA !== tB) return tA - tB;
      return a.ulid.localeCompare(b.ulid);
    });
  }
  formatBidTime(submittedAt: string): string {
    const date = new Date(submittedAt);
    return date.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}
