import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  // Fungsi buat nembak API method GET (ambil data doang)
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }

  // Fungsi buat nembak API method POST (buat nambah data / submit)
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  // Fungsi buat nembak API method PUT (biasanya buat ngedit/update data)
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
  }

  // Fungsi buat nembak API method DELETE (buat ngehapus data)
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
  }
}
