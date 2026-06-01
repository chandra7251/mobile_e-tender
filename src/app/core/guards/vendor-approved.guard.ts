import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

/**
 * VendorApprovedGuard — proteksi halaman yang hanya boleh diakses vendor approved.
 *
 * Logic (updated):
 * 1. Baca vendor_data dari Preferences (cache dari VendorService.getProfile())
 * 2. Jika ada dan approved → return true (fast path)
 * 3. Jika tidak ada (belum pernah buka profile) → hit API /api/vendors/status langsung
 * 4. Jika status bukan 'approved' → tampilkan alert → redirect ke /tabs/profile
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
      // ── Fast path: cek cache dulu ────────────────────────────────────────
      const { value } = await Preferences.get({ key: 'vendor_data' });
      if (value) {
        const vendor = JSON.parse(value);
        if (vendor?.verification_status === 'approved') {
          return true;
        }
        // Cache ada tapi bukan approved
        await this.showAlert();
        this.router.navigate(['/tabs/profile'], { replaceUrl: true });
        return false;
      }

      // ── Slow path: cache kosong → hit API langsung ────────────────────────
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

      // Simpan ke cache agar hit berikutnya pakai fast path
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
      // Jika parse error atau network error → block akses
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
