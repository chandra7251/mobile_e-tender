import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { StorageService } from '../../core/services/storage.service';
import { VendorProfile } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  vendorProfile: VendorProfile | null = null;

  constructor(
    private auth: AuthService,
    private vendorService: VendorService,
    private storage: StorageService,
    private router: Router,
    private toast: ToastController
  ) {}

  ionViewWillEnter(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.vendorProfile = res.data;
        }
      },
      error: (err) => {
        console.warn('[vendors/me] error', err?.status);
      }
    });
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      next: async () => {
        await this.showToast('Berhasil logout.', 'medium');
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async () => {
        await this.storage.clearAll();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  get companyName(): string {
    return this.vendorProfile?.company_name ?? '';
  }

  get vendorStatus(): string {
    return this.vendorProfile?.verification_status ?? '';
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
