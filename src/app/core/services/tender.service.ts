import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  getTenderDetail(id: number): Observable<ApiResponse<Tender>> {
    return this.api.get<Tender>(`tenders/${id}`);
  }

  // POST /api/tenders/{tender}/participants  — 🔒 Protected
  joinTender(tenderId: number): Observable<ApiResponse<any>> {
    return this.api.post<any>(`tenders/${tenderId}/participants`, {});
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
}
