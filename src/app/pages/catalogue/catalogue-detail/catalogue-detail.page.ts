import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { CatalogueItem } from '../../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-catalogue-detail',
  templateUrl: './catalogue-detail.page.html',
  styleUrls: ['./catalogue-detail.page.scss']
})
export class CatalogueDetailPage implements OnInit {
  item: CatalogueItem | null = null;
  isLoading = true;
  activePhoto = 0;

  constructor(
    private route: ActivatedRoute,
    private catalogueService: CatalogueService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.catalogueService.getItem(id).subscribe({
      next: r => { this.item = r.data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  formatPrice(price: number | null): string {
    if (!price) return 'Hubungi vendor';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  }

  getSpecKeys(): string[] {
    return this.item?.specs ? Object.keys(this.item.specs) : [];
  }
}
