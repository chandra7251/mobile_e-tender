import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { ContractService } from '../../../core/services/contract.service';
import { Contract } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-kontrak-list',
  templateUrl: './kontrak-list.page.html',
  styleUrls: ['./kontrak-list.page.scss'],
})
export class KontrakListPage {
  contracts: Contract[] = [];
  isLoading = false;
  loadError = '';
  private backButtonSub?: Subscription;

  constructor(
    private contractService: ContractService,
    private router: Router,
    private navCtrl: NavController,
    private platform: Platform,
  ) {}

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, () => {
      this.navCtrl.navigateBack(['/tabs/home']);
    });
  }
  ionViewWillLeave() { this.backButtonSub?.unsubscribe(); }
  ionViewWillEnter() { this.loadContracts(); }

  loadContracts(): void {
    this.isLoading = true;
    this.loadError = '';
    this.contractService.getMyContracts().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === true && res.data) {
          this.contracts = res.data;
        } else {
          this.loadError = res.message || 'Gagal memuat kontrak.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Gagal memuat kontrak.';
      }
    });
  }

  doRefresh(event: any): void {
    this.loadContracts();
    setTimeout(() => event.target.complete(), 1500);
  }

  goDetail(id: number): void {
    this.router.navigate(['/tabs/kontrak', id]);
  }

  getStatusColor(s: string): string {
    const map: Record<string, string> = {
      draft: 'medium', sent_to_vendor: 'primary', signed_vendor: 'warning',
      signed_admin: 'tertiary', active: 'success', completed: 'dark', terminated: 'danger'
    };
    return map[s] || 'light';
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      draft: 'Draft', sent_to_vendor: 'Dikirim ke Vendor',
      signed_vendor: 'Ditandatangani Vendor', signed_admin: 'Disetujui Admin',
      active: 'Aktif', completed: 'Selesai', terminated: 'Dibatalkan'
    };
    return map[s] || s;
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
  }

  formatDate(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
