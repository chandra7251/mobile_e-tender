import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenderService } from '../../../core/services/tender.service';
import { OfflineCacheService } from '../../../core/services/offline-cache.service';
import { Tender, TenderStatus } from '../../../core/models/user.model';

type FilterStatus = 'all' | TenderStatus;

@Component({
  standalone: false,
  selector: 'app-tender-list',
  templateUrl: './tender-list.page.html',
  styleUrls: ['./tender-list.page.scss'],
})
export class TenderListPage {

  allTenders: Tender[] = [];
  filteredTenders: Tender[] = [];
  isLoading = false;
  errorMessage = '';

  searchQuery = '';
  activeFilter: FilterStatus = 'all';

  // ── Paginasi ──────────────────────────────────────────────────────────────
  currentPage = 1;
  itemsPerPage = 3;

  readonly filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all',        label: 'Semua' },
    { value: 'open',       label: 'Open' },
    { value: 'aanwijzing', label: 'Aanwijzing' },
    { value: 'bidding',    label: 'Bidding' },
    { value: 'closed',     label: 'Closed' },
    { value: 'finished',   label: 'Selesai' },
  ];

  constructor(
    private tenderService: TenderService,
    private offlineCache: OfflineCacheService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // Lifecycle hook
  ionViewWillEnter(): void {
    const statusParam = this.route.snapshot.queryParamMap.get('status') as FilterStatus;
    if (statusParam && this.filterOptions.some(opt => opt.value === statusParam)) {
      this.activeFilter = statusParam;
    }
    this.loadTenders();
  }

  // ── Load dari API ─────────────────────────────────────────────────────────

  async loadTenders(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    const cached = await this.offlineCache.getCachedTenderList();
    if (cached && cached.length > 0) {
      this.allTenders = cached;
      this.applyFilter();
      this.isLoading = false; // Langsung tampil data
    }

    this.tenderService.getTenders().subscribe({
      next: async (res) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          // Filter valid status
          const validTenders = res.data.filter((t: any) =>
            ['open','aanwijzing','bidding','closed','finished'].includes(t.status)
          );
          this.allTenders = validTenders;
          this.applyFilter();
          
          await this.offlineCache.cacheTenderList(validTenders);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (this.allTenders.length === 0) {
          this.errorMessage = err?.error?.message || 'Gagal memuat daftar tender. Periksa koneksi internet Anda.';
        }
      }
    });
  }

  doRefresh(event: any): void {
    this.tenderService.getTenders().subscribe({
      next: async (res) => {
        if (res.status === 'success' && res.data) {
          const validTenders = res.data.filter((t: any) =>
            ['open','aanwijzing','bidding','closed','finished'].includes(t.status)
          );
          this.allTenders = validTenders;
          this.applyFilter();
          await this.offlineCache.cacheTenderList(validTenders);
        }
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  // ── Filter & Search ───────────────────────────────────────────────────────

  setFilter(status: FilterStatus): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allTenders];

    // Filter by status
    if (this.activeFilter !== 'all') {
      result = result.filter(t => t.status === this.activeFilter);
    }

    // Filter by search query
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    this.filteredTenders = result;
    this.currentPage = 1;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goToDetail(tender: Tender): void {
    this.router.navigate(['/tabs/tenders', tender.id]);
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

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
    return [1, 2, 3, 4];
  }

  // ── Paginasi Helpers ──────────────────────────────────────────────────────

  get paginatedTenders(): Tender[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTenders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTenders.length / this.itemsPerPage);
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
}
