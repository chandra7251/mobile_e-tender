import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TenderService } from '../../../core/services/tender.service';
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
    private router: Router
  ) {}

  // Dipanggil setiap kali halaman ditampilkan (navigasi kembali ke tab ini)
  ionViewWillEnter(): void {
    this.loadTenders();
  }

  // ── Load dari API ─────────────────────────────────────────────────────────

  loadTenders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenderService.getTenders().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status && res.data) {
          // Filter out draft — hanya tampilkan status valid untuk vendor
          this.allTenders = res.data.filter(t =>
            ['open','aanwijzing','bidding','closed','finished'].includes(t.status)
          );
          this.applyFilter();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Gagal memuat daftar tender.';
      }
    });
  }

  doRefresh(event: any): void {
    this.tenderService.getTenders().subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.allTenders = res.data.filter(t =>
            ['open','aanwijzing','bidding','closed','finished'].includes(t.status)
          );
          this.applyFilter();
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
}
