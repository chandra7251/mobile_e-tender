import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController, Platform } from '@ionic/angular';
import { TenderService, SubmitBidPayload } from '../../../core/services/tender.service';
import { ActivityService } from '../../../core/services/activity.service';
import { Bid, Tender } from '../../../core/models/user.model';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

type BidMode = 'loading' | 'submit' | 'update' | 'error';

@Component({
  standalone: false,
  selector: 'app-bid-form',
  templateUrl: './bid-form.page.html',
  styleUrls: ['./bid-form.page.scss'],
})
export class BidFormPage implements OnInit {

  tenderId!: number;
  tender: Tender | null = null;
  existingBid: Bid | null = null;
  bidId: number | null = null;

  mode: BidMode = 'loading';
  isSaving = false;
  loadError = '';
  saveError = '';

  // Form fields
  bidAmount: number | null = null;
  notes = '';

  private backButtonSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,    // Ionic-aware back nav — respects tab stack
    private tenderService: TenderService,
    private toast: ToastController,
    private platform: Platform,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    // Hanya extract ID saat pertama kali, ionViewWillEnter akan load data
    this.tenderId = this.doExtractTenderId();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, (processNextHandler) => {
      this.goBack();
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  // Dipanggil setiap kali halaman aktif (termasuk saat navigate kembali dari halaman lain)
  // WAJIB ada karena Ionic meng-cache halaman — ngOnInit hanya dipanggil sekali!
  ionViewWillEnter(): void {
    // Re-extract setiap kali masuk untuk handle kasus Ionic page cache dengan tender berbeda
    this.tenderId = this.doExtractTenderId();

    if (!this.tenderId || this.tenderId <= 0) {
      this.mode = 'error';
      this.loadError = 'ID tender tidak valid. Kembali ke daftar tender dan coba lagi.';
      return;
    }
    this.loadMyBid();
  }

  // 3 metode fallback untuk extract tenderId — dijamin reliable di semua kondisi
  private doExtractTenderId(): number {
    // Metode 1: langsung dari paramMap (Angular empty-path routes inherit parent params)
    const direct = this.route.snapshot.paramMap.get('id');
    if (direct && +direct > 0) return +direct;

    // Metode 2: traverse parent ActivatedRoute
    let current: ActivatedRoute | null = this.route.parent;
    while (current) {
      const pid = current.snapshot.paramMap.get('id');
      if (pid && +pid > 0) return +pid;
      current = current.parent;
    }

    // Metode 3: regex dari URL — /tabs/tenders/{id}/bid
    const match = window.location.pathname.match(/\/tenders\/(\d+)\/bid/);
    if (match?.[1] && +match[1] > 0) {
      return +match[1];
    }

    return 0;
  }

  // ── Load existing bid ─────────────────────────────────────────────────────

  loadMyBid(): void {
    if (!this.tenderId || this.tenderId <= 0) {
      this.mode = 'error';
      this.loadError = 'ID tender tidak valid.';
      return;
    }

    this.mode = 'loading';
    this.loadError = '';
    this.saveError = '';

    const bid$ = this.tenderService.getMyBid(this.tenderId).pipe(catchError((err) => of({ error: err })));
    const tender$ = this.tenderService.getTenderDetail(this.tenderId).pipe(catchError((err) => of({ error: err })));

    forkJoin([bid$, tender$]).subscribe(([bidRes, tenderRes]) => {
      const bidAny = bidRes as any;
      const tenderAny = tenderRes as any;

      if (tenderAny.error) {
        this.mode = 'error';
        this.loadError = this.mapError(tenderAny.error);
        return;
      }

      if (tenderAny?.status === 'success' && tenderAny.data) {
        this.tender = tenderAny.data;
      }

      if (bidAny.error) {
        const err = bidAny.error;
        const status = err?.status;
        if (status === 404) {
          // Belum ada bid → tampilkan form submit
          this.mode = 'submit';
        } else if (status === 403) {
          // Vendor belum diverifikasi / profil tidak ada
          this.mode = 'error';
          this.loadError = 'Profil vendor Anda belum lengkap atau belum diverifikasi.\nSilakan lengkapi profil di halaman Profil.';
        } else if (status === 422) {
          // Vendor bukan peserta tender
          this.mode = 'error';
          this.loadError = 'Anda belum terdaftar sebagai peserta tender ini.\nKembali ke detail tender dan klik "Ikuti Tender" terlebih dahulu.';
        } else if (!status || status === 0) {
          this.mode = 'error';
          this.loadError = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        } else {
          this.mode = 'error';
          this.loadError = this.mapError(err);
        }
      } else if (bidAny?.status === 'success' && bidAny.data) {
        this.existingBid = bidAny.data;
        this.bidId       = bidAny.data.id ?? null;
        this.bidAmount   = bidAny.data.bid_amount ?? null;
        this.notes       = bidAny.data.notes ?? '';
        this.mode        = 'update';
      } else {
        this.mode = 'submit';
      }
    });
  }

  // ── Submit / Update ───────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.bidAmount || this.bidAmount <= 0) {
      this.saveError = 'Jumlah penawaran wajib diisi dan harus lebih dari 0.';
      return;
    }

    this.isSaving  = true;
    this.saveError = '';

    const payload: SubmitBidPayload = {
      bid_amount: this.bidAmount,
      notes: this.notes?.trim() || undefined
    };

    if (this.mode === 'update' && this.bidId) {
      this.tenderService.updateBid(this.tenderId, this.bidId, payload).subscribe({
        next: async (res) => {
          this.isSaving = false;
          if (res?.status === 'success') {
            this.activityService.log('Memperbarui penawaran tender', 'hammer-outline');
            this.existingBid = res.data ?? null;
            this.bidId       = res.data?.id ?? this.bidId;
            await this.showToast('Penawaran berhasil diperbarui!', 'success');
            this.loadMyBid();
          } else {
            this.saveError = res?.message || 'Gagal memperbarui penawaran.';
          }
        },
        error: (err) => {
          this.isSaving  = false;
          this.saveError = this.mapError(err);
        }
      });
    } else {
      this.tenderService.submitBid(this.tenderId, payload).subscribe({
        next: async (res) => {
          this.isSaving = false;
          if (res?.status === 'success') {
            this.activityService.log('Mengajukan penawaran tender', 'hammer-outline');
            this.existingBid = res.data ?? null;
            this.bidId       = res.data?.id ?? null;
            this.mode        = 'update';
            await this.showToast('Penawaran berhasil diajukan!', 'success');
          } else {
            this.saveError = res?.message || 'Gagal mengajukan penawaran.';
          }
        },
        error: (err) => {
          this.isSaving  = false;
          this.saveError = this.mapError(err);
        }
      });
    }
  }

  // ── Error mapping ─────────────────────────────────────────────────────────

  private mapError(err: any): string {
    const status: number = err?.status || err?.error?.status || 0;
    const msg: string = (err?.error?.message || '').toLowerCase();
    const verificationStatus = err?.error?.data?.verification_status;

    if (status === 403) {
      if (msg.includes('profil vendor')) return 'Profil vendor Anda belum lengkap.';
      if (verificationStatus === 'pending') return 'Akun vendor dalam status verifikasi.';
      if (verificationStatus === 'rejected') return 'Akun vendor ditolak.';
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    
    if (status === 404) return 'Data tidak ditemukan.';
    
    if (msg.includes('not a participant')) return 'Anda belum terdaftar di tender ini.';
    if (msg.includes('closed') || msg.includes('ended')) return 'Fase bidding sudah ditutup.';
    if (msg.includes('not started')) return 'Fase bidding belum dimulai.';

    const errors = err?.error?.data;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      if (Array.isArray(errors[firstKey])) return errors[firstKey][0];
    }

    return err?.error?.message || 'Terjadi kesalahan sistem.';
  }

  goBack(): void {
    if (this.tenderId) {
      this.navCtrl.navigateBack(['/tabs/tenders', this.tenderId]);
    } else {
      this.navCtrl.navigateBack(['/tabs/tenders']);
    }
  }

  get isSubmitMode(): boolean  { return this.mode === 'submit'; }
  get isUpdateMode(): boolean  { return this.mode === 'update'; }
  get isLoadingMode(): boolean { return this.mode === 'loading'; }
  get isErrorMode(): boolean   { return this.mode === 'error'; }

  get pageTitle(): string {
    return this.isUpdateMode ? 'Perbarui Penawaran' : 'Ajukan Penawaran';
  }

  get submitLabel(): string {
    if (this.isSaving) return this.isUpdateMode ? 'Memperbarui...' : 'Mengajukan...';
    return this.isUpdateMode ? 'Perbarui Penawaran' : 'Ajukan Penawaran';
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
