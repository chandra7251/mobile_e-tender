import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController, AlertController, Platform } from '@ionic/angular';
import { ContractService } from '../../../core/services/contract.service';
import { Contract, ContractDelivery } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-kontrak-detail',
  templateUrl: './kontrak-detail.page.html',
  styleUrls: ['./kontrak-detail.page.scss'],
})
export class KontrakDetailPage implements OnInit {
  contractId!: number;
  contract: Contract | null = null;
  isLoading = false;
  isSigning = false;
  loadError = '';
  private backButtonSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toast: ToastController,
    private alert: AlertController,
    private platform: Platform,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.contractId = +(this.route.snapshot.paramMap.get('contractId') || 0);
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(20, () => this.goBack());
  }
  ionViewWillLeave() { this.backButtonSub?.unsubscribe(); }

  ionViewWillEnter(): void {
    this.contractId = +(this.route.snapshot.paramMap.get('contractId') || 0);
    this.loadDetail();
  }

  loadDetail(): void {
    if (!this.contractId) return;
    this.isLoading = true;
    this.loadError = '';
    this.contractService.getContractDetail(this.contractId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === true && res.data) {
          this.contract = res.data;
        } else {
          this.loadError = res.message || 'Gagal memuat detail kontrak.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Gagal memuat detail kontrak.';
      }
    });
  }

  doRefresh(event: any): void {
    this.loadDetail();
    setTimeout(() => event.target.complete(), 1500);
  }

  async onSign(): Promise<void> {
    const al = await this.alert.create({
      header: 'Tanda Tangan Kontrak',
      message: 'Dengan menandatangani kontrak ini, Anda menyetujui semua syarat dan ketentuan yang tercantum. Lanjutkan?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Ya, Tanda Tangan', handler: () => { this.doSign(); } }
      ]
    });
    await al.present();
  }

  private doSign(): void {
    this.isSigning = true;
    this.contractService.signContract(this.contractId).subscribe({
      next: async (res) => {
        this.isSigning = false;
        if (res.status === true) {
          this.contract = res.data;
          await this.showToast('Kontrak berhasil ditandatangani!', 'success');
        } else {
          await this.showToast(res.message || 'Gagal menandatangani kontrak.', 'danger');
        }
      },
      error: async (err) => {
        this.isSigning = false;
        await this.showToast(err?.error?.message || 'Gagal menandatangani kontrak.', 'danger');
      }
    });
  }

  goDelivery(delivery: ContractDelivery): void {
    this.router.navigate(['/tabs/kontrak', this.contractId, 'delivery', delivery.id]);
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
      draft: 'Draft', sent_to_vendor: 'Menunggu TTD Vendor', signed_vendor: 'Menunggu TTD Admin',
      signed_admin: 'Disetujui Admin', active: 'Aktif', completed: 'Selesai', terminated: 'Dibatalkan'
    };
    return map[s] || s;
  }
  getDeliveryColor(s: string): string {
    return s === 'verified' ? 'success' : s === 'delivered' ? 'warning' : s === 'in_progress' ? 'primary' : s === 'overdue' ? 'danger' : 'medium';
  }
  getDeliveryLabel(s: string): string {
    return s === 'verified' ? 'Terverifikasi' : s === 'delivered' ? 'Menunggu Verifikasi' : s === 'in_progress' ? 'Sedang Proses' : s === 'overdue' ? 'Terlambat' : 'Terjadwal';
  }
  formatCurrency(v: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
  }
  formatDate(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  formatDateTime(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  get canSign(): boolean {
    return this.contract?.status === 'sent_to_vendor';
  }
  get pendingDeliveries(): number {
    return this.contract?.deliveries?.filter(d => d.status === 'scheduled' || d.status === 'in_progress').length ?? 0;
  }

  goBack(): void { this.navCtrl.navigateBack(['/tabs/kontrak']); }
  private async showToast(msg: string, color: string): Promise<void> {
    const t = await this.toast.create({ message: msg, duration: 3000, color, position: 'top' });
    await t.present();
  }
}
