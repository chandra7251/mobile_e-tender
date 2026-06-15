import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Guard ini tugasnya gampang: jagain pintu masuk halaman-halaman yang butuh login.
// Kalo belum login, langsung ditendang ke halaman login.
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      tap(loggedIn => {
        if (!loggedIn) {
          // Ketauan belum login, buang ke halaman login
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
