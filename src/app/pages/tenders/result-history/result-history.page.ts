import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorResult } from '../../../core/models/user.model';
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
  currentPage = 1;
  itemsPerPage = 3;
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
    this.currentPage = 1;
    this.vendorService.getMyResults().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === true && res.data) {
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
    this.currentPage = 1;
    this.vendorService.getMyResults().subscribe({
      next: (res) => {
        if (res.status === true && res.data) {
          this.results = Array.isArray(res.data) ? res.data : [];
        }
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }
  get paginatedResults(): VendorResult[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.results.slice(start, start + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.results.length / this.itemsPerPage);
  }
  get pagesArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current > total - 4) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
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
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  goToResult(result: VendorResult): void {
    this.router.navigate(['/tabs/tenders', result.tender_id, 'result']);
  }
  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  get skeletonItems(): number[] {
    return [1, 2, 3];
  }
}
