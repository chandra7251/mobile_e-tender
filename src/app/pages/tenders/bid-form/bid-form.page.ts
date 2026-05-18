import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { TenderService, SubmitBidPayload } from '../../../core/services/tender.service';
import { Bid } from '../../../core/models/user.model';

type BidMode = 'loading' | 'submit' | 'update' | 'error';

@Component({
  standalone: false,
  selector: 'app-bid-form',
  templateUrl: './bid-form.page.html',
  styleUrls: ['./bid-form.page.scss'],
})
export class BidFormPage implements OnInit {

  tenderId!: number;
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
    const idParam = this.route.snapshot.paramMap.get('id');
    this.tenderId = idParam ? +idParam : 0;
    this.loadMyBid();
  }

  // ── Load existing bid ─────────────────────────────────────────────────────

  loadMyBid(): void {
    this.mode = 'loading';
    this.loadError = '';

    // GET /api/tenders/{tender}/bids/me
    this.tenderService.getMyBid(this.tenderId).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          // Sudah ada bid — mode UPDATE
          this.existingBid = res.data;
          this.bidId = res.data.id;
          this.bidAmount = res.data.price;
          this.notes = res.data.notes ?? '';
          this.mode = 'update';
        } else {
          // Response OK tapi data null — mode SUBMIT
          this.mode = 'submit';
        }
      },
      error: (err) => {
        if (err?.status === 404) {
          // 404 = belum ada bid → mode SUBMIT
          this.mode = 'submit';
        } else {
          // Error lain (401, 403, 500)
          this.mode = 'error';
          this.loadError = err?.error?.message || 'Gagal memuat data penawaran.';
        }
      }
    });
  }

  // ── Submit / Update ───────────────────────────────────────────────────────

  onSubmit(): void {
    // Validasi
    if (!this.bidAmount || this.bidAmount <= 0) {
      this.saveError = 'Jumlah penawaran wajib diisi dan harus lebih dari 0.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload: SubmitBidPayload = {
      bid_amount: this.bidAmount,
      notes: this.notes.trim() || undefined
    };

    if (this.mode === 'update' && this.bidId) {
      // PUT /api/tenders/{tender}/bids/{bid}
      this.tenderService.updateBid(this.tenderId, this.bidId, payload).subscribe({
        next: async (res) => {
          this.isSaving = false;
          if (res.status) {
            this.existingBid = res.data;
            this.bidId = res.data?.id ?? this.bidId;
            await this.showToast('Penawaran berhasil diperbarui!', 'success');
            this.loadMyBid(); // reload untuk konfirmasi
          } else {
            this.saveError = res.message || 'Gagal memperbarui penawaran.';
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.saveError = this.mapError(err);
        }
      });
    } else {
      // POST /api/tenders/{tender}/bids
      this.tenderService.submitBid(this.tenderId, payload).subscribe({
        next: async (res) => {
          this.isSaving = false;
          if (res.status) {
            this.existingBid = res.data;
            this.bidId = res.data?.id ?? null;
            this.mode = 'update'; // switch ke mode update setelah berhasil
            await this.showToast('Penawaran berhasil diajukan!', 'success');
          } else {
            this.saveError = res.message || 'Gagal mengajukan penawaran.';
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.saveError = this.mapError(err);
        }
      });
    }
  }

  // ── Error mapping ─────────────────────────────────────────────────────────

  private mapError(err: any): string {
    const msg: string = (err?.error?.message || '').toLowerCase();

    if (msg.includes('not approved') || msg.includes('pending')) {
      return 'Akun vendor Anda belum diverifikasi. Tunggu persetujuan admin.';
    }
    if (msg.includes('not a participant') || msg.includes('join')) {
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

    // Validation errors dari backend
    const errors = err?.error?.data;
    if (errors) {
      const firstKey = Object.keys(errors)[0];
      return errors[firstKey]?.[0] || 'Terjadi kesalahan validasi.';
    }

    return err?.error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  goBack(): void {
    this.location.back();
  }

  get isSubmitMode(): boolean { return this.mode === 'submit'; }
  get isUpdateMode(): boolean { return this.mode === 'update'; }
  get isLoadingMode(): boolean { return this.mode === 'loading'; }
  get isErrorMode(): boolean { return this.mode === 'error'; }

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
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
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
