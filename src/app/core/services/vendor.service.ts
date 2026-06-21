import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import {
  ApiResponse,
  VendorProfile,
  VendorDocument,
  VendorTender,
  VendorResult,
  DocumentType
} from '../models/user.model';
import { environment } from '../../../environments/environment';
export interface UpdateProfilePayload {
  name: string;
  company_name: string;
  phone: string;
  address: string;
}
@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(
    private api: ApiService,
    private storage: StorageService,
    private http: HttpClient
  ) {}
  getProfile(): Observable<ApiResponse<VendorProfile>> {
    return this.api.get<VendorProfile>('vendors/me').pipe(
      tap(res => {
        if (res?.status === 'success' && res.data) {
          Preferences.set({
            key: 'vendor_data',
            value: JSON.stringify(res.data),
          });
        }
      })
    );
  }
  updateProfile(payload: UpdateProfilePayload): Observable<ApiResponse<VendorProfile>> {
    return this.api.put<VendorProfile>('vendors/me', payload);
  }
  getStatus(): Observable<ApiResponse<{ verification_status: string; verification_notes: string | null }>> {
    return this.api.get<{ verification_status: string; verification_notes: string | null }>('vendors/status');
  }
  getDocuments(): Observable<ApiResponse<VendorDocument[]>> {
    return this.api.get<VendorDocument[]>('vendors/documents');
  }
  uploadDocument(type: DocumentType, file: File): Observable<ApiResponse<VendorDocument>> {
    return from(this.storage.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => ({
            error: { message: 'Sesi tidak valid, silakan login ulang.' }
          }));
        }
        const formData = new FormData();
        formData.append('document_type', type);
        formData.append('file', file);
        return this.http.post<ApiResponse<VendorDocument>>(
          `${environment.apiUrl}/vendors/documents`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      })
    );
  }
  downloadDocument(docId: number): Observable<Blob> {
    return from(this.storage.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => ({
            error: { message: 'Sesi tidak valid, silakan login ulang.' }
          }));
        }
        return this.http.get(
          `${environment.apiUrl}/vendors/documents/${docId}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }
        );
      })
    );
  }
  getMyTenders(): Observable<ApiResponse<VendorTender[]>> {
    return this.api.get<VendorTender[]>('vendors/tenders');
  }
  getMyResults(): Observable<ApiResponse<VendorResult[]>> {
    return this.api.get<VendorResult[]>('vendors/results');
  }
}
