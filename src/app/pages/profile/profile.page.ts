import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { VendorService, UpdateProfilePayload } from '../../core/services/vendor.service';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { ActivityService } from '../../core/services/activity.service';
import { OfflineCacheService } from '../../core/services/offline-cache.service';
import { FcmService } from '../../core/services/fcm.service';
import { VendorProfile, VendorRatingSummary } from '../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  profile: VendorProfile | null = null;
  totalDocuments = 0;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  isDeletingAccount = false;
  errorMessage = '';
  ratingSummary: VendorRatingSummary | null = null;
  isLoadingRating = false;

  editForm: UpdateProfilePayload = {
    name: '',
    company_name: '',
    phone: '',
    address: ''
  };

  private backButtonSub?: Subscription;

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private storage: StorageService,
    private offlineCache: OfflineCacheService,
    private fcmService: FcmService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
    private platform: Platform,
    private activityService: ActivityService
  ) {}

  ionViewWillEnter(): void {
    this.loadProfile();
    this.loadDocumentsCount();
    this.loadRating();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      if (this.isEditMode) {
        this.cancelEdit();
      } else {
        processNextHandler();
      }
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    const cached = await this.offlineCache.getCachedVendorProfile();
    if (cached) {
      this.profile = cached;
      this.isLoading = false;
    }
    this.vendorService.getProfile().subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status === true && res.data) {
          this.profile = res.data;
          await this.offlineCache.cacheVendorProfile(res.data);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (!this.profile) {
          const status = err?.status;
          if (status === 404) {
            this.errorMessage = 'Profil vendor tidak ditemukan. Registrasi Anda mungkin belum selesai. Silakan hubungi admin.';
          } else if (!status || status === 0) {
            this.errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
          } else {
            this.errorMessage = err?.error?.message || 'Gagal memuat profil. Silakan coba lagi.';
          }
        }
      }
    });
  }

  loadDocumentsCount(): void {
    this.vendorService.getDocuments().subscribe({
      next: (res) => {
        if (res.status === true && res.data) {
          this.totalDocuments = res.data.length;
        }
      },
      error: () => { this.totalDocuments = 0; }
    });
  }

  loadRating(): void {
    this.isLoadingRating = true;
    this.vendorService.getMyRating().subscribe({
      next: (res) => {
        this.isLoadingRating = false;
        if (res.status === true && res.data) {
          this.ratingSummary = res.data;
        }
      },
      error: () => { this.isLoadingRating = false; }
    });
  }

  /** Render bintang rating (1–5) */
  getStars(score: number | null): string[] {
    if (!score) return ['star-outline', 'star-outline', 'star-outline', 'star-outline', 'star-outline'];
    const filled = Math.round((score / 100) * 5);
    return Array(5).fill('star-outline').map((_, i) => i < filled ? 'star' : 'star-outline');
  }

  get verificationStatus(): string {
    return this.profile?.verification_status ?? '';
  }

  get verificationNotes(): string | null {
    return this.profile?.verification_notes ?? null;
  }

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

  goToDocuments(): void {
    this.router.navigate(['/tabs/documents']);
  }

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
        if (res.status === true) {
          this.activityService.log('Memperbarui profil perusahaan', 'create-outline');
          this.isEditMode = false;
          await this.showToast('Profil berhasil diperbarui!', 'success');
          this.loadProfile();
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

  logout(): void {
    // Hapus FCM token dari server sebelum logout
    this.fcmService.unregisterToken().subscribe({ error: () => {} });
    this.authService.logout().subscribe({
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

  /** Tampilkan dialog konfirmasi hapus akun */
  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alert.create({
      header: '⚠️ Hapus Akun',
      subHeader: 'Tindakan ini tidak dapat dibatalkan.',
      message: 'Semua data akun, profil vendor, dan riwayat Anda akan dihapus permanen. Masukkan password untuk konfirmasi.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password Anda',
          cssClass: 'delete-account-input',
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'alert-btn-cancel'
        },
        {
          text: 'Hapus Akun',
          cssClass: 'alert-btn-danger',
          handler: (data) => {
            if (!data?.password) {
              this.showToast('Password wajib diisi.', 'warning');
              return false;
            }
            this.executeDeleteAccount(data.password);
            return true;
          }
        }
      ],
      cssClass: 'delete-account-alert'
    });
    await alert.present();
  }

  private executeDeleteAccount(password: string): void {
    this.isDeletingAccount = true;
    this.authService.deleteAccount(password).subscribe({
      next: async () => {
        this.isDeletingAccount = false;
        await this.showToast('Akun berhasil dihapus.', 'medium');
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async (err) => {
        this.isDeletingAccount = false;
        const msg = err?.error?.message || 'Gagal menghapus akun. Coba lagi.';
        await this.showToast(msg, 'danger');
      }
    });
  }

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
