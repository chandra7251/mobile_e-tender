import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { ApiResponse, AuthData, RefreshData } from '../models/user.model';

// ─── Payload interfaces ────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  phone: string;
  address: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {}

  // POST /api/auth/login
  login(payload: LoginPayload): Observable<ApiResponse<AuthData>> {
    return this.api.post<AuthData>('auth/login', payload).pipe(
      tap(async (res) => {
        if (res.status === 'success' && res.data) {
          await this.storage.setToken(res.data.token);
        }
      })
    );
  }

  // POST /api/auth/register
  register(payload: RegisterPayload): Observable<ApiResponse<AuthData>> {
    return this.api.post<AuthData>('auth/register', payload).pipe(
      tap(async (res) => {
        if (res.status === 'success' && res.data) {
          await this.storage.setToken(res.data.token);
        }
      })
    );
  }

  // POST /api/auth/logout
  logout(): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/logout', {}).pipe(
      tap(async () => {
        await this.storage.clearAll();
      })
    );
  }

  // POST /api/auth/refresh
  // Dipanggil manual dari komponen jika diperlukan.
  // Auto-refresh oleh interceptor (via HttpBackend) tidak melalui method ini.
  refreshToken(): Observable<string> {
    return this.api.post<RefreshData>('auth/refresh', {}).pipe(
      tap(async (res) => {
        if (res.status === 'success' && res.data?.token) {
          await this.storage.setToken(res.data.token);
        }
      }),
      map(res => {
        if (res.status === 'success' && res.data?.token) {
          return res.data.token;
        }
        throw new Error('Refresh gagal: response tidak valid');
      })
    );
  }

  // GET /api/auth/me
  me(): Observable<ApiResponse<any>> {
    return this.api.get<any>('auth/me');
  }

  // PUT /api/auth/change-password
  changePassword(payload: ChangePasswordPayload): Observable<ApiResponse<null>> {
    return this.api.put<null>('auth/change-password', payload);
  }

  // POST /api/auth/forgot-password  — PUBLIC
  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/forgot-password', { email });
  }

  // POST /api/auth/reset-password  — PUBLIC
  resetPassword(payload: ResetPasswordPayload): Observable<ApiResponse<null>> {
    return this.api.post<null>('auth/reset-password', payload);
  }

  // Helper
  isLoggedIn(): Observable<boolean> {
    return from(this.storage.getToken().then(token => !!token));
  }
}
