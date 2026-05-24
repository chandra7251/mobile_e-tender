import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TenderService } from '../../../core/services/tender.service';
import { Tender } from '../../../core/models/user.model';

/**
 * ResultHistoryPage — Daftar tender berstatus 'closed' atau 'finished'
 * yang bisa dilihat hasilnya oleh vendor.
 *
 * Karena backend belum memiliki endpoint GET /api/vendors/results,
 * halaman ini mengambil semua tender dan mem-filter status closed/finished.
 * Endpoint dedicated akan ditambahkan di backend (lihat backend_requirements.md).
 */
@Component({
  standalone: false,
  selector: 'app-result-history',
  templateUrl: './result-history.page.html',
  styleUrls: ['./result-history.page.scss'],
})
export class ResultHistoryPage {

  allTenders: Tender[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private tenderService: TenderService,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenderService.getTenders().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          // Filter hanya tender yang sudah selesai/ditutup
          this.allTenders = (Array.isArray(res.data) ? res.data : [])
            .filter(t => t.status === 'closed' || t.status === 'finished');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Gagal memuat riwayat tender.';
      }
    });
  }

  doRefresh(event: any): void {
    this.tenderService.getTenders().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.allTenders = (Array.isArray(res.data) ? res.data : [])
            .filter(t => t.status === 'closed' || t.status === 'finished');
        }
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  goToResult(tender: Tender): void {
    this.router.navigate(['/tabs/tenders', tender.id, 'result']);
  }

  getStatusColor(status: string): string {
    return status === 'finished' ? 'success' : 'medium';
  }

  getStatusLabel(status: string): string {
    return status === 'finished' ? 'Selesai' : 'Ditutup';
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
