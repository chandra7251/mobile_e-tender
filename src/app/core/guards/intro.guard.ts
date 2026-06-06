import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    const hasSeenIntro = await Preferences.get({ key: 'hasSeenIntro' });
    
    // SEMENTARA DINONAKTIFKAN UNTUK DEVELOPMENT DESAIN WELCOME PAGE
    // if (hasSeenIntro && hasSeenIntro.value === 'true') {
    //   this.router.navigateByUrl('/login', { replaceUrl: true });
    //   return false;
    // }
    
    return true;
  }
}
