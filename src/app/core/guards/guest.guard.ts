import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
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
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
          return false;
        }
        return true;
      })
    );
  }
}
