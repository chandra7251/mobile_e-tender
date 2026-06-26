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
  biddingCountdowns: { [id: number]: string } = {};
  private timer: any;
  ionViewWillLeave() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  ionViewWillEnter(): void {
    const statusParam = this.route.snapshot.queryParamMap.get('status') as FilterStatus;
    if (statusParam && this.filterOptions.some(opt => opt.value === statusParam)) {
      this.activeFilter = statusParam;
    }
    this.loadTenders();
  }
  async loadTenders(event?: any): Promise<void> {
    if (!event) this.isLoading = true;
    this.errorMessage = '';
    const cached = await this.offlineCache.getCachedTenderList();
    if (cached && cached.length > 0) {
      this.allTenders = cached;
      this.applyFilter();
      this.startCountdowns();
      if (!event) this.isLoading = false; 
    }
    this.tenderService.getTenders().subscribe({
      next: async (res) => {
        if (!event) this.isLoading = false;
        if (res.status === true && res.data) {
          const validTenders = res.data.filter((t: any) =>
            ['open','aanwijzing','bidding','closed','finished'].includes(t.status)
          );
          this.allTenders = validTenders;
          this.applyFilter();
          this.startCountdowns();
          await this.offlineCache.cacheTenderList(validTenders);
        }
        if (event) event.target.complete();
      },
      error: (err) => {
        if (!event) this.isLoading = false;
        if (this.allTenders.length === 0) {
          this.errorMessage = err?.error?.message || 'Gagal memuat daftar tender. Periksa koneksi internet Anda.';
        }
        if (event) event.target.complete();
      }
    });
  }
  doRefresh(event: any): void {
    this.loadTenders(event);
  }
  private startCountdowns(): void {
    if (this.timer) clearInterval(this.timer);
    this.updateCountdowns();
    this.timer = setInterval(() => {
      this.updateCountdowns();
    }, 1000);
  }
  private updateCountdowns(): void {
    const now = new Date().getTime();
    this.allTenders.forEach(t => {
      if (t.status === 'bidding') {
        const endDateString = (t as any).bidding_end || t.end_date;
        if (endDateString) {
          const end = new Date(endDateString).getTime();
          const diff = end - now;
          if (diff <= 0) {
            this.biddingCountdowns[t.id] = '00:00:00';
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            this.biddingCountdowns[t.id] = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
          }
        }
      }
    });
  }
  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }
  setFilter(status: FilterStatus): void {
    this.activeFilter = status;
    this.applyFilter();
  }
  onSearchChange(): void {
    this.applyFilter();
  }
  applyFilter(): void {
    let result = [...this.allTenders];
    if (this.activeFilter !== 'all') {
      result = result.filter(t => t.status === this.activeFilter);
    }
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
  goToDetail(tender: Tender): void {
    this.router.navigate(['/tabs/tenders', tender.id]);
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
