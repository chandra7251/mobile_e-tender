import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../../core/services/photo.service';
import { VendorSubmissionService } from '../../core/services/vendor-submission.service';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-pengajuan-tender',
  templateUrl: './pengajuan-tender.page.html',
  styleUrls: ['./pengajuan-tender.page.scss'],
  standalone: false,
})
export class PengajuanTenderPage implements OnInit {

  form!: FormGroup;

  /** Array base64 foto yang dipilih (maks 3) */
  photos: string[] = [];

  readonly MAX_PHOTOS = 3;

  readonly kategoriOptions = [
    'Elektronik',
    'Furnitur',
    'Kendaraan',
    'Konstruksi',
    'IT & Software',
    'Lainnya',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private photoService: PhotoService,
    private submissionService: VendorSubmissionService,
    private networkService: NetworkService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nama_barang:    ['', [Validators.required, Validators.maxLength(255)]],
      deskripsi:      ['', Validators.required],
      spesifikasi:    ['', Validators.required],
      kategori:       ['', Validators.required],
      estimasi_harga: ['', [Validators.required, Validators.min(0)]],
      catatan:        [''],
    });
  }

  // ── Photo Handling ───────────────────────────────────────────────────────────

  async openPhotoOptions(): Promise<void> {
    if (this.photos.length >= this.MAX_PHOTOS) {
      await this.showAlert('Batas Foto', `Maksimal ${this.MAX_PHOTOS} foto yang bisa ditambahkan.`);
      return;
    }

    const sheet = await this.actionSheetCtrl.create({
      header: 'Tambah Foto',
      buttons: [
        {
          text: 'Ambil Foto',
          icon: 'camera-outline',
          handler: () => this.addPhoto('camera'),
        },
        {
          text: 'Pilih dari Galeri',
          icon: 'image-outline',
          handler: () => this.addPhoto('gallery'),
        },
        {
          text: 'Batal',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await sheet.present();
  }

  private async addPhoto(source: 'camera' | 'gallery'): Promise<void> {
    const base64 = source === 'camera'
      ? await this.photoService.takePhoto()
      : await this.photoService.pickFromGallery();

    if (base64) {
      this.photos = [...this.photos, base64];
    }
  }

  removePhoto(index: number): void {
    this.photos = this.photos.filter((_, i) => i !== index);
  }

  getPhotoSrc(base64: string): string {
    return `data:image/jpeg;base64,${base64}`;
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.showAlert('Form Tidak Lengkap', 'Mohon lengkapi semua field yang wajib diisi.');
      return;
    }

    // Cek koneksi
    const isOnline = await this.networkService.checkConnection();
    if (!isOnline) {
      await this.showAlert('Tidak Ada Koneksi', 'Pengajuan tender membutuhkan koneksi internet. Silakan coba lagi saat online.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mengirim pengajuan...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const formData = this.form.value;
      await this.submissionService.createSubmission(formData, this.photos);

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Berhasil!',
        message: 'Pengajuan tender Anda telah berhasil dikirim. Admin akan meninjau pengajuan Anda.',
        buttons: [
          {
            text: 'Lihat Riwayat',
            handler: () => this.router.navigate(['/vendor/pengajuan/riwayat'], { replaceUrl: true }),
          },
        ],
      });
      await alert.present();

    } catch (err: any) {
      await loading.dismiss();
      const message = err?.error?.message || 'Gagal mengirim pengajuan. Silakan coba lagi.';
      await this.showAlert('Gagal', message);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  goBack(): void {
    this.router.navigate(['/tabs/home']);
  }
}
