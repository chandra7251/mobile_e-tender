import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

/**
 * Guard ini fungsinya buat nge-block user yang statusnya masih belum di-approve admin.
 * Kalo belum di-approve, bakal ditendang balik ke halaman profile.
 */
@Injectable({ providedIn: 'root' })
export class VendorApprovedGuard implements CanActivate {

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      // Cek dulu datanya ada di storage lokal apa ngga (biar irit kuota ga nembak API mulu)
      const { value } = await Preferences.get({ key: 'vendor_data' });
      if (value) {
        const vendor = JSON.parse(value);
        if (vendor?.verification_status === 'approved') {
          return true;
        }
        // Kalo statusnya bukan approved, tendang ke profil
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      // Kalo ga ada di lokal, terpaksa kita hit API ke backend
      const tokenRes = await Preferences.get({ key: 'auth_token' });
      if (!tokenRes.value) {
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      const res: any = await this.http.get(
        `${environment.apiUrl}/vendors/status`,
        { headers: { Authorization: `Bearer ${tokenRes.value}` } }
      ).toPromise();

      const status = res?.data?.verification_status;

      // Simpen datanya ke cache lokal, lumayan buat loading selanjutnya biar cepet
      if (res?.data) {
        await Preferences.set({ key: 'vendor_data', value: JSON.stringify(res.data) });
      }

      if (status !== 'approved') {
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      return true;

    } catch {
      // Kalo error misal backend mati atau ga ada sinyal, mending tendang aja sekalian cari aman
      await this.showAlert();
      this.router.navigate(['/tabs/profile'], { replaceUrl: true });
      return false;
    }
  }

  private async showAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Akses Ditolak',
      message: 'Akun Anda belum diverifikasi oleh admin. Silakan tunggu proses verifikasi sebelum mengajukan tender.',
      buttons: ['Mengerti'],
    });
    await alert.present();
    await alert.onDidDismiss();
  }
}
