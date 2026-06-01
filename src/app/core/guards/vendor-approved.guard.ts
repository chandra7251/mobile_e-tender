import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

/**
 * VendorApprovedGuard — proteksi halaman yang hanya boleh diakses vendor approved.
 *
 * Logic:
 * 1. Baca vendor_data dari Preferences (disimpan oleh VendorService.getProfile())
 * 2. Parse JSON, cek field verification_status
 * 3. Jika bukan 'approved' → tampilkan alert → redirect ke /tabs/profile
 * 4. Jika 'approved' → return true
 */
@Injectable({ providedIn: 'root' })
export class VendorApprovedGuard implements CanActivate {

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: 'vendor_data' });

      if (!value) {
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      const vendor = JSON.parse(value);
      if (vendor?.verification_status !== 'approved') {
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      return true;
    } catch {
      // Jika parse error atau Preferences error → anggap belum approved
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
