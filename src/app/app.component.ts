import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Platform, AlertController } from '@ionic/angular';
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
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
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

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async (processNextHandler) => {
        const url = this.router.url;
        
        if (url.includes('/tabs/home') || url.includes('/login') || url.includes('/welcome')) {
          const alert = await this.alertCtrl.create({
            header: 'Keluar Aplikasi',
            message: 'Apakah Anda yakin ingin keluar dari aplikasi FivGo?',
            buttons: [
              {
                text: 'Batal',
                role: 'cancel'
              },
              {
                text: 'Keluar',
                handler: () => {
                  App.exitApp();
                }
              }
            ]
          });
          await alert.present();
        } else {
          // Selain halaman di atas, paksa kembali ke home
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      });
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
