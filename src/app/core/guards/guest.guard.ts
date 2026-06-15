import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard ini fungsinya kebalikan dari auth guard.
 * Kalo user UDAH login, dia dilarang buka halaman login/register dll.
 * Langsung aja ditendang ke halaman home biar ga aneh flow-nya.
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
          // Kalo ketauan udah login, suruh balik ke home aja
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
          return false;
        }
        return true;
      })
    );
  }
}
