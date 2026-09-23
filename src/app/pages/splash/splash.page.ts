import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage {
  constructor(private router: Router) {}

  async ionViewDidEnter() {
    setTimeout(async () => {
      const hasSeenIntro = await Preferences.get({ key: 'hasSeenIntro' });
      if (hasSeenIntro && hasSeenIntro.value === 'true') {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/welcome', { replaceUrl: true });
      }
    }, 2500);
  }
}
