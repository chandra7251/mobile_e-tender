import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { VendorService, UpdateProfilePayload } from '../../core/services/vendor.service';
import { VendorProfile } from '../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  profile: VendorProfile | null = null;
  verificationStatus: string = '';
  verificationNotes: string | null = null;

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
    private toast: ToastController,
    private alert: AlertController
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadStatus();
  }

  // ─── Load data ──────────────────────────────────────────────────────────

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vendorService.getProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          this.profile = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Gagal memuat profil.';
      }
    });
  }

  loadStatus(): void {
    this.vendorService.getStatus().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.verificationStatus = res.data.status;
          this.verificationNotes = res.data.verification_notes;
        }
      },
      error: () => {}
    });
  }

  // ─── Edit mode ──────────────────────────────────────────────────────────

  enterEditMode(): void {
    if (!this.profile) return;
    if (!this.profile.vendor) {
      this.errorMessage = 'Data vendor belum tersedia. Coba muat ulang halaman.';
      return;
    }
    this.editForm = {
      name: this.profile.name,
      company_name: this.profile.vendor.company_name,
      phone: this.profile.vendor.phone,
      address: this.profile.vendor.address
    };
    this.errorMessage = '';
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.errorMessage = '';
  }

  // ─── Save ────────────────────────────────────────────────────────────────

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
        if (res.status) {
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

  // ─── Helpers ─────────────────────────────────────────────────────────────

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
