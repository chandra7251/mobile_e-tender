import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Platform, AlertController } from '@ionic/angular';
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
    private networkService: NetworkService,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async (processNextHandler) => {
        const url = this.router.url;
        if (url.includes('/tabs/home') || url.includes('/login') || url.includes('/welcome')) {
          const alert = await this.alertCtrl.create({
            header: 'Keluar Aplikasi',
            message: 'Apakah Anda yakin ingin keluar dari aplikasi ZETA?',
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
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      });
    });
  }
  async ngOnInit(): Promise<void> {
    await this.networkService.startListening();
    try {
      await SplashScreen.hide();
    } catch (e) {
    }
  }
}
