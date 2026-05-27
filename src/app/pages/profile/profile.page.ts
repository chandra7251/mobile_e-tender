import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { VendorService, UpdateProfilePayload } from '../../core/services/vendor.service';
import { AuthService } from '../../core/services/auth.service';
import { VendorProfile } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  profile: VendorProfile | null = null;
  totalDocuments = 0;

  // Form edit
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  editForm: UpdateProfilePayload = {
    name: '',
    company_name: '',
    phone: '',
    address: ''
  };

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  // Dipanggil setiap kali halaman ditampilkan
  ionViewWillEnter(): void {
    this.loadProfile();
    this.loadDocumentsCount();
  }

  // ─── Load data ──────────────────────────────────────────────────────────────

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Satu endpoint: GET /api/vendors/me — sudah mengandung verification_status
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          this.profile = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Gagal memuat profil.';
      }
    });
  }

  loadDocumentsCount(): void {
    this.vendorService.getDocuments().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.totalDocuments = res.data.length;
        }
      },
      error: () => {
        this.totalDocuments = 0;
      }
    });
  }

  // ─── Computed status (dari satu sumber: profile.vendor) ───────────────────────

  get verificationStatus(): string {
    return this.profile?.verification_status ?? '';
  }

  get verificationNotes(): string | null {
    return this.profile?.verification_notes ?? null;
  }

  // ─── Edit mode ──────────────────────────────────────────────────────────────

  enterEditMode(): void {
    if (!this.profile) return;
    this.editForm = {
      name: this.profile.user.name,
      company_name: this.profile.company_name,
      phone: this.profile.phone,
      address: this.profile.address
    };
    this.errorMessage = '';
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
  }

  // Navigasi ke halaman dokumen
  goToDocuments(): void {
    this.router.navigate(['/tabs/documents']);
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────

  onSave(): void {
    if (!this.editForm.company_name || !this.editForm.phone || !this.editForm.address) {
      this.errorMessage = 'Semua field wajib diisi.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.vendorService.updateProfile(this.editForm).subscribe({
      next: async (res) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.isEditMode = false;
          await this.showToast('Profil berhasil diperbarui!', 'success');
          this.loadProfile(); // refresh data
        } else {
          this.errorMessage = res.message || 'Gagal menyimpan.';
        }
      },
      error: (err) => {
        this.isSaving = false;
        const errors = err?.error?.data;
        if (errors) {
          const firstKey = Object.keys(errors)[0];
          this.errorMessage = errors[firstKey]?.[0] || 'Gagal menyimpan.';
        } else {
          this.errorMessage = err?.error?.message || 'Terjadi kesalahan.';
        }
      }
    });
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────────

  get statusColor(): string {
    switch (this.verificationStatus) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default:         return 'warning';
    }
  }

  get statusLabel(): string {
    switch (this.verificationStatus) {
      case 'approved': return '✓ Terverifikasi';
      case 'rejected': return '✗ Ditolak';
      default:         return '⏳ Menunggu Verifikasi';
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
