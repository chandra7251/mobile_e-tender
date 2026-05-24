import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * GuestGuard — cegah vendor yang sudah login mengakses halaman auth
 * (login, register, forgot-password, reset-password).
 *
 * Jika sudah login → redirect ke /tabs/home
 * Jika belum login → lanjutkan ke halaman tujuan
 */
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      map(loggedIn => {
        if (loggedIn) {
          // Sudah login — tendang kembali ke home
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
          return false;
        }
        return true;
      })
    );
  }
}
