import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpBackend,
  HttpClient
} from '@angular/common/http';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { ApiResponse, RefreshData } from '../models/user.model';
import { environment } from '../../../environments/environment';

// Public endpoints
const PUBLIC_ENDPOINTS = [
  'auth/login',
  'auth/register',
  'auth/forgot-password',
  'auth/reset-password'
];

// Refresh endpoint
const REFRESH_ENDPOINT = 'auth/refresh';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Refresh state
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  // HttpClient bypass interceptor
  private httpDirect: HttpClient;

  constructor(
    private storage: StorageService,
    private router: Router,
    private toastCtrl: ToastController,
    handler: HttpBackend
  ) {
    this.httpDirect = new HttpClient(handler);
  }

  // ── intercept ──────────────────────────────────────────────────────────────

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storage.getToken()).pipe(
      switchMap(token => {
        // Lampirkan token jika ada
        const outReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next.handle(outReq).pipe(
          catchError((err: HttpErrorResponse) => {

            // ── 429 Rate Limiting ──────────────────────────────────────────
            if (err.status === 429) {
              this.showRateLimitToast();
              return throwError(() => err);
            }

            // ── 401 Unauthorized — coba refresh token ─────────────────────
            if (
              err.status === 401 &&
              !this.isPublicEndpoint(req.url) &&
              !req.url.includes(REFRESH_ENDPOINT)
            ) {
              return this.handle401(outReq, next, err);
            }

            return throwError(() => err);
          })
        );
      })
    );
  }

  // 401 handler
  private handle401(
    req: HttpRequest<any>,
    next: HttpHandler,
    originalErr: HttpErrorResponse
  ): Observable<HttpEvent<any>> {

    if (this.isRefreshing) {
      // Wait for refresh
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(newToken =>
          next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
        )
      );
    }

    // Mulai refresh
    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.doRefresh().pipe(
      switchMap(newToken => {
        this.isRefreshing = false;
        this.refreshSubject.next(newToken);
        // Retry
        return next.handle(
          req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
        );
      }),
      catchError(() => {
        // Logout on fail
        this.isRefreshing = false;
        this.forceLogout();
        return throwError(() => originalErr);
      })
    );
  }

  // Refresh request

  private doRefresh(): Observable<string> {
    return from(this.storage.getToken()).pipe(
      switchMap(oldToken => {
        if (!oldToken) {
          return throwError(() => new Error('No token available for refresh'));
        }

        return this.httpDirect.post<ApiResponse<RefreshData>>(
          `${environment.apiUrl}/${REFRESH_ENDPOINT}`,
          {},
          { headers: { Authorization: `Bearer ${oldToken}` } }
        ).pipe(
          switchMap(res => {
            if (res.status === 'success' && res.data?.token) {
              const newToken = res.data.token;
              // Save token
              return from(
                this.storage.setToken(newToken).then(() => newToken)
              );
            }
            return throwError(() => new Error('Invalid refresh response'));
          })
        );
      })
    );
  }

  // Force logout

  private forceLogout(): void {
    this.storage.clearAll().then(() => {
      this.showSessionExpiredToast();
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some(ep => url.includes(ep));
  }

  private async showRateLimitToast(): Promise<void> {
    try {
      const toast = await this.toastCtrl.create({
        message: 'Terlalu banyak percobaan. Tunggu beberapa saat dan coba lagi.',
        duration: 4000,
        color: 'warning',
        position: 'top',
        icon: 'time-outline'
      });
      await toast.present();
    } catch { /* ignore */ }
  }

  private async showSessionExpiredToast(): Promise<void> {
    try {
      const toast = await this.toastCtrl.create({
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        duration: 3500,
        color: 'warning',
        position: 'top',
        icon: 'time-outline'
      });
      await toast.present();
    } catch { /* ignore */ }
  }
}
