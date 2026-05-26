import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
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

  // GET /api/vendors/me
  getProfile(): Observable<ApiResponse<VendorProfile>> {
    return this.api.get<VendorProfile>('vendors/me');
  }

  // PUT /api/vendors/me
  updateProfile(payload: UpdateProfilePayload): Observable<ApiResponse<VendorProfile>> {
    return this.api.put<VendorProfile>('vendors/me', payload);
  }

  // GET /api/vendors/status
  getStatus(): Observable<ApiResponse<{ verification_status: string; verification_notes: string | null }>> {
    return this.api.get<{ verification_status: string; verification_notes: string | null }>('vendors/status');
  }

  // GET /api/vendors/documents
  getDocuments(): Observable<ApiResponse<VendorDocument[]>> {
    return this.api.get<VendorDocument[]>('vendors/documents');
  }

  // POST /api/vendors/documents  (multipart/form-data)
  uploadDocument(type: DocumentType, file: File): Observable<ApiResponse<VendorDocument>> {
    return from(this.storage.getToken()).pipe(
      switchMap(token => {
        // Guard: jangan kirim request jika token tidak ada
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

  // GET /api/vendors/documents/{doc_id}/download  — 🔒 Protected
  // File dokumen tidak punya URL publik — WAJIB pakai endpoint ini
  // Response: binary blob (PDF/JPG/PNG) + header Content-Disposition: attachment
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

  // GET /api/vendors/tenders  — 🔒 Protected
  // Daftar tender yang diikuti vendor (sudah join sebagai peserta)
  getMyTenders(): Observable<ApiResponse<VendorTender[]>> {
    return this.api.get<VendorTender[]>('vendors/tenders');
  }

  // GET /api/vendors/results  — 🔒 Protected
  // Hasil tender vendor — menggantikan filter manual tenders.status === 'finished'
  getMyResults(): Observable<ApiResponse<VendorResult[]>> {
    return this.api.get<VendorResult[]>('vendors/results');
  }
}
