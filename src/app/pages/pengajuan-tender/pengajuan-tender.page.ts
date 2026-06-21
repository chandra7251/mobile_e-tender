import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ActionSheetController, Platform, NavController } from '@ionic/angular';
import { PhotoService } from '../../core/services/photo.service';
import { VendorSubmissionService } from '../../core/services/vendor-submission.service';
import { NetworkService } from '../../core/services/network.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-pengajuan-tender',
  templateUrl: './pengajuan-tender.page.html',
  styleUrls: ['./pengajuan-tender.page.scss'],
  standalone: false,
})
export class PengajuanTenderPage implements OnInit {
  form!: FormGroup;
  kategoriOptions = [
    'Peralatan IT',
    'Furniture',
    'Kendaraan',
    'Alat Tulis Kantor',
    'Jasa',
    'Lainnya'
  ];
  photos: string[] = [];
  readonly MAX_PHOTOS = 3;
  pengajuanList: any[] = [];
  currentPage = 1;
  itemsPerPage = 4; 
  isFormOpen = false;
  private backButtonSub?: Subscription;
  private previousPage: string | null = null;
  private openedFromQuickAction = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private photoService: PhotoService,
    private submissionService: VendorSubmissionService,
    private networkService: NetworkService,
    private platform: Platform,
    private navCtrl: NavController,
  ) {}
  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      if (this.isFormOpen) {
        this.closeForm();
      } else {
        if (this.previousPage === '/tabs/home') {
          this.navCtrl.navigateBack('/tabs/home');
        } else {
          processNextHandler(); 
        }
      }
    });
  }
  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }
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
  ionViewWillEnter() {
    this.loadData();
    const openForm = this.route.snapshot.queryParamMap.get('openForm');
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'home') {
      this.previousPage = '/tabs/home';
    } else {
      this.previousPage = null; 
    }
    if (openForm === 'true') {
      this.isFormOpen = true;
      this.openedFromQuickAction = true;
    }
    if (openForm === 'true' || from === 'home') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }
  async loadData(event?: any) {
    try {
      const submissions = await this.submissionService.getMySubmissions();
      this.pengajuanList = submissions.map(sub => ({
        id: sub.id,
        judul: sub.nama_barang,
        kategori: sub.kategori || '-',
        harga: sub.estimasi_harga || 0,
        tanggal: sub.created_at,
        status: this.getStatusLabel(sub.status),
        foto: this.resolveImageUrl((sub as any)['photo_url'] || (sub as any)['foto'] || (sub.photos?.length ? sub.photos[0].photo_url : null))
      }));
    } catch (err: any) {
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }
  resolveImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    let fixedUrl = url;
    fixedUrl = fixedUrl.replace('http://localhost/', 'https://vandrafcy.my.id/');
    fixedUrl = fixedUrl.replace('http://localhost:8000/', 'https://vandrafcy.my.id/');
    fixedUrl = fixedUrl.replace('http://127.0.0.1:8000/', 'https://vandrafcy.my.id/');
    fixedUrl = fixedUrl.replace('http://127.0.0.1:8080/', 'https://vandrafcy.my.id/');
    fixedUrl = fixedUrl.replace('http://e-tender.test/', 'https://vandrafcy.my.id/');
    if (fixedUrl.startsWith('http')) {
      return fixedUrl;
    }
    const cleanUrl = fixedUrl.startsWith('/') ? fixedUrl.substring(1) : fixedUrl;
    return `https://vandrafcy.my.id/${cleanUrl}`;
  }
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
    };
    return map[status] || status;
  }
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
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.showAlert('Form Tidak Lengkap', 'Mohon lengkapi semua field yang wajib diisi.');
      return;
    }
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
            handler: () => {
              this.previousPage = null; 
              this.closeForm();
              this.form.reset();
              this.photos = [];
              this.loadData();
            },
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
  openForm() {
    this.isFormOpen = true;
  }
  closeForm() {
    this.isFormOpen = false;
    if (this.openedFromQuickAction && this.previousPage === '/tabs/home') {
      this.openedFromQuickAction = false;
      this.navCtrl.navigateBack('/tabs/home');
    }
  }
  get paginatedList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.pengajuanList.slice(startIndex, startIndex + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.pengajuanList.length / this.itemsPerPage);
  }
  get pagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage = page;
    }
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'disetujui': return 'success';
      case 'menunggu': return 'warning';
      case 'ditolak': return 'danger';
      default: return 'medium';
    }
  }
  goBack(): void {
    this.router.navigate(['/tabs/home']);
  }
}
