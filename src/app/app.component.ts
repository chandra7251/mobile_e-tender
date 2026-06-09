import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';
import { ActivityService } from './core/services/activity.service';
import { NetworkService } from './core/services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private networkService: NetworkService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.includes('/tabs/profile')) {
        this.activityService.log('Membuka halaman Profil', 'person-outline');
      } else if (url.includes('/tabs/result')) {
        this.activityService.log('Membuka halaman Hasil', 'trophy-outline');
      } else if (url.includes('/tabs/documents')) {
        this.activityService.log('Membuka halaman Dokumen', 'folder-open-outline');
      } else if (url.includes('/tabs/tenders/detail')) {
        this.activityService.log('Melihat detail Tender', 'search-outline');
      } else if (url.includes('/tabs/tenders')) {
        this.activityService.log('Membuka daftar Tender', 'list-outline');
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Mulai monitoring jaringan
    await this.networkService.startListening();

    // Sembunyikan splash screen setelah app siap (best-effort, sudah ada auto-hide)
    try {
      await SplashScreen.hide();
    } catch (e) {
      // Diabaikan — splash sudah auto-hide via launchAutoHide: true
    }
  }
}
