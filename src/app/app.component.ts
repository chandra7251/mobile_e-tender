import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Platform, AlertController } from '@ionic/angular';
import { NetworkService } from './core/services/network.service';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { FcmService } from './core/services/fcm.service';
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
    private alertCtrl: AlertController,
    private fcmService: FcmService
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        this.setupPushNotifications();
      }

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

  setupPushNotifications() {
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.fcmService.registerToken(token.value).subscribe({ error: () => {} });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.alertCtrl.create({
        header: notification.title,
        message: notification.body,
        buttons: ['OK']
      }).then(alert => alert.present());
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });
  }
}
