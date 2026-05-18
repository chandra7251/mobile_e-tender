import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';

// Endpoint public yang TIDAK boleh di-logout saat 401
const PUBLIC_ENDPOINTS = [
  'auth/login',
  'auth/register',
  'auth/forgot-password',
  'auth/reset-password'
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Flag: cegah redirect loop jika sudah ada proses logout
  private isHandling401 = false;

  constructor(
    private storage: StorageService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storage.getToken()).pipe(
      switchMap(token => {
        let outReq = req;

        if (token) {
          // Hanya set Authorization.
          // JANGAN set Content-Type di sini — biarkan browser yang set
          // boundary untuk multipart/form-data secara otomatis.
          outReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }

        return next.handle(outReq).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && !this.isPublicEndpoint(req.url)) {
              this.handle401();
            }
            return throwError(() => err);
          })
        );
      })
    );
  }

  // ── 401 handler ───────────────────────────────────────────────────────────

  private handle401(): void {
    // Cegah double-handling jika banyak request gagal 401 bersamaan
    if (this.isHandling401) return;
    this.isHandling401 = true;

    // Hapus sesi lokal
    this.storage.clearAll().then(() => {
      this.showSessionExpiredToast();
      this.router.navigate(['/login'], { replaceUrl: true }).then(() => {
        // Reset flag setelah navigasi selesai
        setTimeout(() => { this.isHandling401 = false; }, 2000);
      });
    });
  }

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
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
    } catch {
      // Ignore jika toast gagal (navigasi sudah terjadi)
    }
  }
}
