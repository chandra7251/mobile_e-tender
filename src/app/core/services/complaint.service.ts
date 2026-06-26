import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Complaint } from '../models/user.model';

export interface SubmitComplaintPayload {
  type: 'sanggahan' | 'banding';
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  constructor(private api: ApiService) {}

  /** Ambil semua sanggahan milik vendor yg login */
  getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.api.get<Complaint[]>('complaints');
  }

  /** Ajukan sanggahan / banding untuk tender tertentu */
  submitComplaint(
    tenderId: number,
    payload: SubmitComplaintPayload
  ): Observable<ApiResponse<Complaint>> {
    return this.api.post<Complaint>(`tenders/${tenderId}/complaints`, payload);
  }
}
