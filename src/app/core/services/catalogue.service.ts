import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, CatalogueItem, CatalogueListResponse, CatalogueCategory } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  constructor(private api: ApiService) {}

  /** Semua item katalog (publik) */
  getAll(params?: { category?: number; search?: string; vendor_id?: number }): Observable<ApiResponse<CatalogueListResponse>> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', String(params.category));
    if (params?.search)   query.set('search', params.search);
    if (params?.vendor_id) query.set('vendor_id', String(params.vendor_id));
    const qs = query.toString();
    return this.api.get<CatalogueListResponse>('catalogue' + (qs ? '?' + qs : ''));
  }

  /** Semua kategori */
  getCategories(): Observable<ApiResponse<CatalogueCategory[]>> {
    return this.api.get<CatalogueCategory[]>('catalogue/categories');
  }

  /** Detail item */
  getItem(id: number): Observable<ApiResponse<CatalogueItem>> {
    return this.api.get<CatalogueItem>(`catalogue/${id}`);
  }

  /** Katalog milik vendor yg login */
  getMyItems(): Observable<ApiResponse<CatalogueItem[]>> {
    return this.api.get<CatalogueItem[]>('vendor/catalogue');
  }

  /** Tambah item baru */
  addItem(data: {
    name: string;
    description?: string;
    category_id?: number;
    price_estimate?: number;
    unit?: string;
    specs?: Record<string, string>;
  }): Observable<ApiResponse<CatalogueItem>> {
    return this.api.post<CatalogueItem>('vendor/catalogue', data);
  }

  /** Update item */
  updateItem(id: number, data: Partial<{
    name: string;
    description: string;
    category_id: number;
    price_estimate: number;
    unit: string;
    is_active: boolean;
  }>): Observable<ApiResponse<CatalogueItem>> {
    return this.api.put<CatalogueItem>(`vendor/catalogue/${id}`, data);
  }

  /** Hapus item */
  deleteItem(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`vendor/catalogue/${id}`);
  }
}
