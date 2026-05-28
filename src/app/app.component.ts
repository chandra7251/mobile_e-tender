import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ActivityService } from './core/services/activity.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private router: Router,
    private activityService: ActivityService
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
}
