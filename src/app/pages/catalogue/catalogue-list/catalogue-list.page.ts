import { Component, OnInit } from '@angular/core';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { CatalogueItem, CatalogueCategory } from '../../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-catalogue-list',
  templateUrl: './catalogue-list.page.html',
  styleUrls: ['./catalogue-list.page.scss']
})
export class CatalogueListPage implements OnInit {
  items: CatalogueItem[] = [];
  categories: CatalogueCategory[] = [];
  isLoading = true;
  loadError = '';
  searchTerm = '';
  selectedCategory: number | undefined;
  currentPage = 1;
  lastPage = 1;
  total = 0;

  constructor(private catalogueService: CatalogueService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories() {
    this.catalogueService.getCategories().subscribe({
      next: r => this.categories = r.data || []
    });
  }

  loadItems(reset = true) {
    if (reset) { this.currentPage = 1; this.items = []; }
    this.isLoading = true;
    this.loadError = '';
    this.catalogueService.getAll({
      search: this.searchTerm || undefined,
      category: this.selectedCategory
    }).subscribe({
      next: r => {
        const res = r.data as any;
        this.items = reset ? (res.data || []) : [...this.items, ...(res.data || [])];
        this.lastPage = res.last_page || 1;
        this.total    = res.total || 0;
        this.isLoading = false;
      },
      error: () => { this.loadError = 'Gagal memuat katalog.'; this.isLoading = false; }
    });
  }

  onSearch(ev: any) {
    this.searchTerm = ev.detail.value || '';
    this.loadItems();
  }

  onCategoryChange() { this.loadItems(); }

  getPhotoUrl(item: CatalogueItem): string {
    const photo = item.photos?.find(p => p.is_primary) || item.photos?.[0];
    return photo?.url || '';
  }

  formatPrice(price: number | null): string {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  }
}
