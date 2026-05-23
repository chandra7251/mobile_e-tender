import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { StorageService } from '../../core/services/storage.service';
import { User, VendorProfile } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: User | null = null;
  vendorProfile: VendorProfile | null = null;

  constructor(
    private auth: AuthService,
    private vendorService: VendorService,
    private storage: StorageService,
    private router: Router,
    private toast: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    // Tampilkan data dari storage dulu agar UI muncul cepat
    this.user = await this.storage.getUser();

    // Fetch profil vendor lengkap dari GET /api/vendors/me
    this.vendorService.getProfile().subscribe({
      next: async (res) => {
        if (res.status && res.data) {
          this.vendorProfile = res.data;

          // Simpan hanya field User yang valid ke storage
          const userToStore: User = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role
          };
          this.user = userToStore;
          await this.storage.setUser(userToStore);
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
    return this.vendorProfile?.vendor?.company_name ?? '';
  }

  get vendorStatus(): string {
    return this.vendorProfile?.vendor?.verification_status ?? '';
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, color, position: 'top' });
    await t.present();
  }
}
