import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { CatalogueItem } from '../../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-my-catalogue',
  templateUrl: './my-catalogue.page.html',
  styleUrls: ['./my-catalogue.page.scss']
})
export class MyCataloguePage implements OnInit {
  items: CatalogueItem[] = [];
  isLoading = true;
  showForm = false;
  isSaving = false;
  newItem = { name: '', description: '', price_estimate: null as number | null, unit: 'unit' };

  constructor(
    private catalogueService: CatalogueService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() { this.loadMyItems(); }

  loadMyItems() {
    this.isLoading = true;
    this.catalogueService.getMyItems().subscribe({
      next: r => { this.items = r.data || []; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  async addItem() {
    if (!this.newItem.name.trim()) return;
    this.isSaving = true;
    this.catalogueService.addItem({
      name: this.newItem.name,
      description: this.newItem.description || undefined,
      price_estimate: this.newItem.price_estimate || undefined,
      unit: this.newItem.unit || 'unit'
    }).subscribe({
      next: async () => {
        this.isSaving = false;
        this.showForm = false;
        this.newItem = { name: '', description: '', price_estimate: null, unit: 'unit' };
        this.loadMyItems();
        const t = await this.toastCtrl.create({ message: 'Item berhasil ditambahkan!', duration: 2000, color: 'success', position: 'top' });
        t.present();
      },
      error: async () => {
        this.isSaving = false;
        const t = await this.toastCtrl.create({ message: 'Gagal menambahkan item.', duration: 2000, color: 'danger', position: 'top' });
        t.present();
      }
    });
  }

  async deleteItem(item: CatalogueItem) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Item',
      message: `Hapus "${item.name}" dari katalog?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Hapus', role: 'destructive', handler: () => {
          this.catalogueService.deleteItem(item.id).subscribe({
            next: () => this.loadMyItems()
          });
        }}
      ]
    });
    alert.present();
  }

  formatPrice(price: number | null): string {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  }
}
