import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorResult } from '../../../core/models/user.model';

/**
 * ResultHistoryPage — Daftar hasil tender yang pernah diikuti vendor.
 *
 * Menggunakan endpoint dedicated GET /api/vendors/results (Mobile_Integration.md)
 * Menggantikan workaround lama: getTenders() + filter(status === 'finished')
 */
@Component({
  standalone: false,
  selector: 'app-result-history',
  templateUrl: './result-history.page.html',
  styleUrls: ['./result-history.page.scss'],
})
export class ResultHistoryPage {

  results: VendorResult[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // GET /api/vendors/results — backend sudah filter hanya tender finished
    this.vendorService.getMyResults().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          this.results = Array.isArray(res.data) ? res.data : [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Gagal memuat riwayat tender.';
      }
    });
  }

  doRefresh(event: any): void {
    this.vendorService.getMyResults().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.results = Array.isArray(res.data) ? res.data : [];
        }
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  goToResult(result: VendorResult): void {
    this.router.navigate(['/tabs/tenders', result.tender_id, 'result']);
  }

  getResultColor(isWinner: boolean): string {
    return isWinner ? 'success' : 'medium';
  }

  getResultLabel(isWinner: boolean): string {
    return isWinner ? '🏆 Menang' : 'Tidak Menang';
  }

  getResultIcon(isWinner: boolean): string {
    return isWinner ? 'trophy-outline' : 'close-circle-outline';
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
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

  get skeletonItems(): number[] {
    return [1, 2, 3];
  }
}
