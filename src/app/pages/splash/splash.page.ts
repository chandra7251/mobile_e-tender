import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    // Tunggu 2.5 detik untuk animasi loading
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
