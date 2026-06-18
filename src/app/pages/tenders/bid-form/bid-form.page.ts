import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { TenderService, SubmitBidPayload } from '../../../core/services/tender.service';
import { Bid, Tender } from '../../../core/models/user.model';
import { forkJoin, of } from 'rxjs';
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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private tenderService: TenderService,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    let idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam && this.route.parent) {
      idParam = this.route.parent.snapshot.paramMap.get('id');
    }
    this.tenderId = idParam ? +idParam : 0;
    this.loadMyBid();
  }

  // ── Load existing bid ─────────────────────────────────────────────────────

  loadMyBid(): void {
    this.mode = 'loading';
    this.loadError = '';

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

      if (tenderAny && tenderAny.status === 'success' && tenderAny.data) {
        this.tender = tenderAny.data;
      }

      if (bidAny.error) {
        const err = bidAny.error;
        if (err?.status === 404) {
          this.mode = 'submit';
        } else {
          this.mode = 'error';
          this.loadError = this.mapError(err);
        }
      } else if (bidAny.status === 'success' && bidAny.data) {
        this.existingBid = bidAny.data;
        this.bidId       = bidAny.data.id;
        this.bidAmount   = bidAny.data.bid_amount;
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
      notes: this.notes.trim() || undefined
    };

    if (this.mode === 'update' && this.bidId) {
      this.tenderService.updateBid(this.tenderId, this.bidId, payload).subscribe({
        next: async (res) => {
          this.isSaving = false;
          if (res.status === 'success') {
            this.existingBid = res.data;
            this.bidId       = res.data?.id ?? this.bidId;
            await this.showToast('Penawaran berhasil diperbarui!', 'success');
            this.loadMyBid();
          } else {
            this.saveError = res.message || 'Gagal memperbarui penawaran.';
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
          if (res.status === 'success') {
            this.existingBid = res.data;
            this.bidId       = res.data?.id ?? null;
            this.mode        = 'update';
            await this.showToast('Penawaran berhasil diajukan!', 'success');
          } else {
            this.saveError = res.message || 'Gagal mengajukan penawaran.';
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
    const msg: string = (err?.error?.message || '').toLowerCase();
    const verificationStatus = err?.error?.data?.verification_status;

    if (verificationStatus === 'pending') {
      return 'Akun vendor Anda belum diverifikasi. Tunggu persetujuan admin.';
    }
    if (verificationStatus === 'rejected') {
      return 'Akun vendor Anda ditolak. Silakan cek halaman profil untuk informasi lebih lanjut.';
    }
    if (msg.includes('not approved') || msg.includes('pending') || msg.includes('belum diverifikasi')) {
      return 'Akun vendor Anda belum diverifikasi. Tunggu persetujuan admin.';
    }
    if (msg.includes('not a participant') || msg.includes('join') || msg.includes('belum terdaftar')) {
      return 'Anda belum terdaftar sebagai peserta tender ini. Silakan Join Tender terlebih dahulu.';
    }
    if (msg.includes('has not started') || msg.includes('not started')) {
      return 'Fase bidding belum dimulai.';
    }
    if (msg.includes('closed') || msg.includes('ended')) {
      return 'Fase bidding sudah ditutup.';
    }
    if (msg.includes('own bid') || msg.includes('your own')) {
      return 'Anda hanya dapat memperbarui penawaran Anda sendiri.';
    }

    const errors = err?.error?.data;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      if (Array.isArray(errors[firstKey])) {
        return errors[firstKey]?.[0] || 'Terjadi kesalahan validasi.';
      }
    }

    return err?.error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  goBack(): void { this.location.back(); }

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

  formatCurrency(amount: number | null): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
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
