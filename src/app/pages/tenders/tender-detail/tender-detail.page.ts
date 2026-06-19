import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { TenderService } from '../../../core/services/tender.service';
import { OfflineCacheService } from '../../../core/services/offline-cache.service';
import { Tender, Announcement } from '../../../core/models/user.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-tender-detail',
  templateUrl: './tender-detail.page.html',
  styleUrls: ['./tender-detail.page.scss'],
})
export class TenderDetailPage {

  tender: Tender | null = null;
  announcements: Announcement[] = [];

  tenderId!: number;
  isLoading = false;
  detailError = '';
  isJoining = false;
  hasJoined = false;
  joinError = '';

  announcementsLoading = false;
  announcementsError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tenderService: TenderService,
    private offlineCache: OfflineCacheService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.tenderId = idParam ? +idParam : 0;
  }

  ionViewWillEnter(): void {
    if (!this.tenderId) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.tenderId = idParam ? +idParam : 0;
    }
    this.loadAll();
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.loadDetail();
    this.loadAnnouncements();
  }

  async loadDetail(): Promise<void> {
    if (!this.tenderId) return;
    this.isLoading = true;
    this.detailError = '';

    const cached = await this.offlineCache.getCachedTenderDetail(this.tenderId);
    if (cached) {
      this.tender = cached;
      this.hasJoined = cached.is_participant ?? false;
      this.isLoading = false;
    }

    // GET /api/tenders/{tender} sudah menyertakan is_participant di response
    // Tidak perlu request tambahan ke /participants/check
    this.tenderService.getTenderDetail(this.tenderId).subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          this.tender = res.data;
          // Baca is_participant langsung dari TenderResource (hemat 1 HTTP request)
          this.hasJoined = res.data.is_participant ?? false;
          await this.offlineCache.cacheTenderDetail(this.tenderId, res.data);
        } else if (!this.tender) {
          this.detailError = res.message || 'Data tender tidak ditemukan.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (!this.tender) {
          this.detailError = err?.error?.message || 'Gagal memuat detail tender. Periksa koneksi internet Anda.';
        }
      }
    });
  }

  retryLoad(): void {
    this.loadAll();
  }

  loadAnnouncements(): void {
    if (!this.tenderId) return;
    this.announcementsLoading = true;
    this.announcementsError = '';

    this.tenderService.getAnnouncements(this.tenderId).subscribe({
      next: (res) => {
        this.announcementsLoading = false;
        if (res.status === 'success' && res.data) {
          this.announcements = res.data;
        }
      },
      error: (err) => {
        this.announcementsLoading = false;
        // 403 berarti belum join — tidak tampilkan sebagai error keras
        if (err?.status !== 403) {
          this.announcementsError = err?.error?.message || 'Gagal memuat pengumuman.';
        }
      }
    });
  }

  doRefresh(event: any): void {
    const detail$ = this.tenderService.getTenderDetail(this.tenderId).pipe(catchError(() => of(null)));
    const ann$    = this.tenderService.getAnnouncements(this.tenderId).pipe(catchError(() => of(null)));

    forkJoin([detail$, ann$]).subscribe(async ([detailRes, annRes]) => {
      if (detailRes?.status === 'success' && detailRes?.data) {
        this.tender    = detailRes.data;
        this.hasJoined = detailRes.data.is_participant ?? false;
        await this.offlineCache.cacheTenderDetail(this.tenderId, detailRes.data);
      }
      if (annRes?.status === 'success' && annRes?.data) {
        this.announcements = annRes.data;
      }
      event.target.complete();
    });
  }

  // ── Join Tender ───────────────────────────────────────────────────────────

  onJoin(): void {
    if (this.isJoining || this.hasJoined) return;
    this.isJoining = true;
    this.joinError = '';

    this.tenderService.joinTender(this.tenderId).subscribe({
      next: async (res) => {
        this.isJoining = false;
        if (res.status === 'success') {
          this.hasJoined = true;
          await this.showToast('Berhasil bergabung ke tender!', 'success');
          this.loadAnnouncements();
        } else {
          this.joinError = res.message || 'Gagal bergabung.';
        }
      },
      error: (err) => {
        this.isJoining = false;
        const msg = err?.error?.message || '';
        const verificationStatus = err?.error?.data?.verification_status;

        if (verificationStatus === 'pending') {
          this.joinError = 'Akun vendor Anda belum diverifikasi. Tunggu persetujuan admin.';
        } else if (verificationStatus === 'rejected') {
          this.joinError = 'Akun vendor Anda ditolak. Silakan cek halaman profil untuk informasi lebih lanjut.';
        } else if (
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('joined') ||
          msg.toLowerCase().includes('sudah terdaftar') ||
          msg.toLowerCase().includes('sudah pernah bergabung') ||
          msg.toLowerCase().includes('bergabung')
        ) {
          // Backend: "Vendor sudah pernah bergabung pada tender ini."
          this.joinError = '';
          this.hasJoined = true;
        } else {
          this.joinError = msg || 'Gagal bergabung ke tender.';
        }
      }
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  goBack(): void { this.location.back(); }

  /** Sembunyikan gambar jika URL foto gagal dimuat */
  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  goBid(): void {
    this.router.navigate(['/tabs/tenders', this.tenderId, 'bid']);
  }

  get showJoinButton(): boolean {
    if (!this.tender) return false;
    // Tampilkan card join SELALU saat open/aanwijzing (biar bisa tampil state "sudah bergabung")
    return this.tender.status === 'open' || this.tender.status === 'aanwijzing';
  }

  get showBidButton(): boolean {
    if (!this.tender) return false;
    // Hanya tampilkan tombol bid jika status bidding DAN vendor sudah join tender ini
    return this.tender.status === 'bidding' && this.hasJoined;
  }

  get showResultButton(): boolean {
    if (!this.tender) return false;
    return this.tender.status === 'closed' || this.tender.status === 'finished';
  }

  goResult(): void {
    this.router.navigate(['/tabs/tenders', this.tenderId, 'result']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open':       return 'success';
      case 'aanwijzing': return 'tertiary';
      case 'bidding':    return 'warning';
      case 'closed':     return 'medium';
      case 'finished':   return 'dark';
      default:           return 'light';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'open':       return 'Open';
      case 'aanwijzing': return 'Aanwijzing';
      case 'bidding':    return 'Bidding';
      case 'closed':     return 'Closed';
      case 'finished':   return 'Selesai';
      default:           return status;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatDateShort(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
